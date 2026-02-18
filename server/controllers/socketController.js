const redisClient = require("../redis");
const pool = require("../db");

module.exports.authorizeUser = (socket, next) => {
  if (!socket.request.session || !socket.request.session.user) {
    console.log("Bad request! Session not found.");
    next(new Error("Not authorized"));
  } else {
    // console.log("User authorized:", socket.request.session.user.username);
    next();
  }
};

module.exports.initializeUser = async (socket) => {
  try {
    socket.user = { ...socket.request.session.user };
    socket.join(socket.user.userid);
    await redisClient.hset(
      `userid:${socket.user.username}`,
      "userid",
      socket.user.userid,
      "connected",
      true
    );

    // Load detailed conversation list (Friends + People who messaged me + People I messaged)
    // Fix: Use IN clause with subqueries to avoid duplicates caused by different 'is_friend' values in UNION
    const conversationQuery = await pool.query(
      `SELECT u.userid, u.username, 
              CASE WHEN EXISTS (
                  SELECT 1 FROM friends f WHERE f.user_uid = $1 AND f.friend_uid = u.userid
              ) THEN true ELSE false END AS is_friend
       FROM users u
       WHERE u.userid IN (
           SELECT friend_uid FROM friends WHERE user_uid = $1
           UNION
           SELECT from_uid FROM messages WHERE to_uid = $1
           UNION
           SELECT to_uid FROM messages WHERE from_uid = $1
       )`,
      [socket.user.userid]
    );

    // Parse list and check online status from Redis
    const parsedFriendList = [];
    for (let contact of conversationQuery.rows) {
      const isConnected = await redisClient.hget(
        `userid:${contact.username}`,
        "connected"
      );
      parsedFriendList.push({
        username: contact.username,
        userid: contact.userid,
        connected: isConnected === "true" || isConnected === true,
        isFriend: contact.is_friend
      });
    }

    // Notify friends of connection (People who added ME)
    const followersQuery = await pool.query(
      "SELECT user_uid FROM friends WHERE friend_uid = $1",
      [socket.user.userid]
    );

    const followerRooms = followersQuery.rows.map((row) => row.user_uid);

    if (followerRooms.length > 0)
      socket.to(followerRooms).emit("connected", true, socket.user.username);

    socket.emit("friends", parsedFriendList);

    // Load messages from DB (Order by ID DESC for newest first)
    const msgQuery = await pool.query(
      "SELECT from_uid, to_uid, content FROM messages WHERE from_uid = $1 OR to_uid = $1 ORDER BY id DESC LIMIT 1000",
      [socket.user.userid]
    );

    const messages = msgQuery.rows.map((msg) => {
      return { to: msg.to_uid, from: msg.from_uid, content: msg.content };
    });

    if (messages && messages.length > 0) socket.emit("messages", messages);
  } catch (err) {
    console.error("Error in initializeUser:", err);
    socket.emit("server_error", { message: "Failed to initialize user data" });
  }
};

module.exports.addFriend = async (socket, friendName, cb) => {
  try {
    if (friendName === socket.user.username) {
      cb({ done: false, errorMsg: "Cannot add self!" });
      return;
    }

    // Check if user exists in DB
    const friendQuery = await pool.query(
      "SELECT userid, username FROM users WHERE username = $1",
      [friendName]
    );

    if (friendQuery.rowCount === 0) {
      cb({ done: false, errorMsg: "User doesn't exist!" });
      return;
    }
    const friend = friendQuery.rows[0];

    // Check if already friend in DB
    const currentFriendQuery = await pool.query(
      "SELECT id FROM friends WHERE user_uid = $1 AND friend_uid = $2",
      [socket.user.userid, friend.userid]
    );

    if (currentFriendQuery.rowCount > 0) {
      cb({ done: false, errorMsg: "Friend already added!" });
      return;
    }

    // Add friend to DB
    await pool.query(
      "INSERT INTO friends(user_uid, friend_uid, friend_username) VALUES($1, $2, $3)",
      [socket.user.userid, friend.userid, friendName]
    );

    // Check if friend is online for initial status
    const friendConnected = await redisClient.hget(
      `userid:${friendName}`,
      "connected"
    );

    const newFriend = {
      username: friendName,
      userid: friend.userid,
      connected: friendConnected === "true" || friendConnected === true,
      isFriend: true,
    };
    cb({ done: true, newFriend });
  } catch (err) {
    console.error("Error in addFriend:", err);
    cb({ done: false, errorMsg: "Server error occurred" });
  }
};

module.exports.onDisconnect = async (socket) => {
  await redisClient.hset(`userid:${socket.user.username}`, "connected", false);

  // Notify friends (people who have ME in their list)
  const relevantUsersQuery = await pool.query(
    "SELECT user_uid FROM friends WHERE friend_uid = $1",
    [socket.user.userid]
  );
  const relevantRooms = relevantUsersQuery.rows.map(row => row.user_uid);

  if (relevantRooms.length > 0)
    socket.to(relevantRooms).emit("connected", false, socket.user.username);

  // Also, for `initializeUser`: `socket.to(friendRooms).emit("connected", true, ...)`
  // friendRooms = my friends.
  // If I connect, I tell my friends I am connected.
  // Same logic applies. I should tell people who added ME.

  // However, changing this logic might be out of scope or risky if I misunderstand the original intent.
  // But strictly speaking, for "status" to work, the observer needs the event.
  // If I stick to original logic (notify MY friends), then I replicate the original behavior.
  // Given I am replacing the storage backend, I should probably stick to the original behavior mostly, BUT finding people who added me is much easier in SQL than Redis.
  // In Redis `friends:*` is hard to reverse query. In SQL it's trivial.
  // I will use `SELECT user_uid FROM friends WHERE friend_uid = $1` because it is CORRECT for status updates.
};

// Also update `initializeUser` to use the reverse lookup for status notification?
// Original: `socket.to(friendRooms).emit("connected", true, socket.user.username);`
// Where `friendRooms` are people I added.
// If I use the reverse lookup, I tell people who added me.
// This is definitely better.

