const pool = require("../db");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");

module.exports.handleLogin = (req, res) => {
  if (req.session.user && req.session.user.username) {
    res.json({ loggedIn: true, username: req.session.user.username });
  } else {
    res.json({ loggedIn: false });
  }
};

module.exports.attemptLogin = async (req, res) => {
  try {
    const potentialLogin = await pool.query(
      "SELECT id, username, passhash, userid FROM users u WHERE u.username=$1",
      [req.body.username]
    );

    if (potentialLogin.rowCount > 0) {
      const isSamePass = await bcrypt.compare(
        req.body.password,
        potentialLogin.rows[0].passhash
      );
      if (isSamePass) {
        req.session.user = {
          username: req.body.username,
          id: potentialLogin.rows[0].id,
          userid: potentialLogin.rows[0].userid,
        };

        res.json({ loggedIn: true, username: req.body.username });
      } else {
        res.json({ loggedIn: false, status: "Wrong username or password!" });
      }
    } else {
      res.json({ loggedIn: false, status: "Wrong username or password!" });
    }
  } catch (err) {
    res.json({ loggedIn: false, status: "server Error" });
  }
};

module.exports.attemptRegister = async (req, res) => {
  const existingUser = await pool.query(
    "SELECT username from users WHERE username=$1",
    [req.body.username]
  );

  if (existingUser.rowCount === 0) {
    // register
    const hashedPass = await bcrypt.hash(req.body.password, 10);
    const newUserQuery = await pool.query(
      "INSERT INTO users(username, passhash, userid) values($1,$2,$3) RETURNING id, username, userid",
      [req.body.username, hashedPass, uuidv4()]
    );

    req.session.user = {
      username: req.body.username,
      id: newUserQuery.rows[0].id,
      userid: newUserQuery.rows[0].userid,
    };

    res.json({ loggedIn: true, username: req.body.username });
  } else {
    res.json({ loggedIn: false, status: "Username taken" });
  }
};

module.exports.deleteAccount = async (req, res) => {
  if (!req.session.user || !req.session.user.userid) {
    return res.json({ status: false, message: "Not authenticated" });
  }

  const userId = req.session.user.userid;
  const username = req.session.user.username;

  try {
    // 1. Get all friends to notify them
    const friendsQuery = await pool.query(
      "SELECT user_uid FROM friends WHERE friend_uid = $1",
      [userId]
    );
    const friendUserIds = friendsQuery.rows.map(row => row.user_uid);

    // 2. Delete all messages where the user is sender or receiver
    await pool.query(
      "DELETE FROM messages WHERE from_uid = $1 OR to_uid = $1",
      [userId]
    );

    // 3. Delete from friends table (both directions)
    await pool.query(
      "DELETE FROM friends WHERE user_uid = $1 OR friend_uid = $1",
      [userId]
    );

    // 4. Delete the user from the users table
    await pool.query("DELETE FROM users WHERE userid = $1", [userId]);

    // 5. Notify friends that this user is gone
    const io = req.app.get("io");
    if (io && friendUserIds.length > 0) {
      // Emit to each friend's room (which uses their userid)
      friendUserIds.forEach(friendId => {
        io.to(friendId).emit("friend_removed", username);
      });
    }

    // 6. Destroy session
    req.session.destroy();

    res.json({ status: true, message: "Account burnt successfully" });
  } catch (err) {
    console.error("Burn account error:", err);
    res.json({ status: false, message: "Failed to burn account: " + err.message });
  }
};
