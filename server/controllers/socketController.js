const redisClient = require("../redis");
const pool = require("../db");

module.exports.authorizeUser = (socket, next) => {
  if (!socket.request.session || !socket.request.session.user) {
    console.log("Bad request!");
    next(new Error("Not authorized"));
  } else {
    next();
  }
};

module.exports.initializeUser = async (socket) => {
  socket.user = { ...socket.request.session.user };
  socket.join(socket.user.userid);
  await redisClient.hset(
    `userid:${socket.user.username}`,
    "userid",
    socket.user.userid,
    "connected",
    true
  );

  // Load friends from DB
  const friendListQuery = await pool.query(
    "SELECT friend_uid, friend_username FROM friends WHERE user_uid = $1",
    [socket.user.userid]
  );

  // Parse friend list and check online status from Redis
  const parsedFriendList = [];
  for (let friend of friendListQuery.rows) {
    const friendConnected = await redisClient.hget(
      `userid:${friend.friend_username}`,
      "connected"
    );
    parsedFriendList.push({
      username: friend.friend_username,
      userid: friend.friend_uid,
      connected: friendConnected === "true" || friendConnected === true,
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
};

module.exports.addFriend = async (socket, friendName, cb) => {
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
  };
  cb({ done: true, newFriend });
};

module.exports.onDisconnect = async (socket) => {
  await redisClient.hset(`userid:${socket.user.username}`, "connected", false);

  // Notify friends (need to query DB to know who to notify)
  const friendListQuery = await pool.query(
    "SELECT friend_uid FROM friends WHERE user_uid = $1",
    [socket.user.userid]
  );

  // Note: logic in original code notified *my friends* that I disconnected.
  // Actually, original code: `friendList = await redisClient.lrange(...)` (my friends).
  // Then `socket.to(friendRooms).emit(...)`.
  // Yes, notifies my friends.

  // Wait, if I disconnect, I should notify people who have ME as a friend?
  // Or people I have as a friend?
  // Usually reciprocal. If I added them, I want to know their status.
  // If they added me, they want to know mine.
  // Original code notified `friendRooms` which are derived from `friends:${username}` list (people I added).
  // This assumes if I added them, they are in a room I can emit to?
  // `socket.to(room)` emits to a room. Users join their OWN `userid` room.
  // So I can emit to their `userid` room.
  // So I am telling *people I added* that I am disconnected?
  // Use case: I added Bob. Bob added Me.
  // I disconnect. I tell Bob (because he is in my list).
  // Bob receives "connected: false".
  // Correct.

  // BUT what if Bob added me, but I didn't add Bob?
  // Then Bob is NOT in my friend list.
  // So I won't tell Bob I disconnected. 
  // Bob will see me as "connected: true" forever?
  // This is a flaw in the original logic if friendship handles are one-way but I am sending status updates based on MY list.
  // Ideally, I should notify ANYONE who has ME in THEIR friend list.
  // `SELECT user_uid FROM friends WHERE friend_uid = $1`.
  // The original code used MY friend list.
  // "const friendList = await redisClient.lrange(`friends:${socket.user.username}`...)" -> My friends.
  // "socket.to(friendRooms)" -> Emits to my friends.
  // So original code only updated status for people I added.
  // If connection status is only shown for people you added, then this works IF the relationship is effectively reciprocal or if you only care about status of people you added.
  // Wait, `socket.on("connected", ...)` updates the status of a friend in `friendList`.
  // So if I am in Bob's friend list, Bob needs to receive the event.
  // Bob receives event -> checks if `username` matches someone in HIS list -> updates status.
  // So I need to send the event to BOB.
  // Does `socket.to(Bob's UserID)` send to Bob? Yes.
  // So I need to send to everyone who has ME in THEIR list.
  // Original code sent to everyone in MY list.
  // This implies A adds B AND B adds A for status to work bidirectional?
  // Or maybe the original app assumed I only see status of people I added?
  // If I added Bob, I want to see Bob's status.
  // So Bob needs to notify ME.
  // So Bob needs to `socket.to(ME).emit`.
  // So Bob needs to know I am listening.
  // Bob's `onDisconnect` should find everyone who is watching him (everyone who added Bob).
  // Original code: `lrange friends:${socket.user.username}` -> Bob's friends (people Bob added).
  // If Bob added Alice, Bob tells Alice "I disconnected".
  // Alice receives it.
  // Does Alice have Bob in her list?
  // If yes, Alice updates Bob's status.
  // If no, Alice ignores it.
  // Only works if Bob added Alice.
  // This seems like a flaw in the original app: **You only send status updates to people YOU added.**
  // So if Alice added Bob, but Bob didn't add Alice, Alice NEVER sees Bob's status updates.
  // Given the user asked to "correct it" and "it forget what friend i have added", I should probably fix this logical flaw too if I can.
  // Query: `SELECT user_uid FROM friends WHERE friend_uid = $1` (Find people who added me).
  // Notify THEM.

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

