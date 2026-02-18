const redisClient = require("../redis");
const pool = require("../db");

const directMessages = async (socket, message) => {
  message.from = socket.user.userid;
  // const parseMessage = { ...message, from: socket.user.userid };

  // const messageString = [
  //   parseMessage.to,
  //   parseMessage.from,
  //   parseMessage.content,
  // ].join(".");

  // await redisClient.lpush(`chat:${message.to}`, messageString);
  // await redisClient.lpush(`chat:${message.from}`, messageString);

  await pool.query(
    "INSERT INTO messages(from_uid, to_uid, content) VALUES($1, $2, $3)",
    [message.from, message.to, message.content]
  );

  message.from_username = socket.user.username; // Add this for client-side "new chat" handling
  socket.to(message.to).emit("dm", message);
};

module.exports = directMessages;
