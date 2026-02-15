const { Pool } = require("pg");
require("dotenv").config();

// const connectionString = `postgres://${username}:${password}@${
//   your - remote - host
// }:${your - remote - port}/${your - remote - database}`;

const pool = new Pool({
  connectionString: process.env.DB_STRING,
});
// Execute table creation queries sequentially
const createUsersQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(28) NOT NULL UNIQUE,
        passhash VARCHAR NOT NULL,
        userid VARCHAR NOT NULL UNIQUE
      );
    `;

const createFriendsQuery = `
      CREATE TABLE IF NOT EXISTS friends (
        id SERIAL PRIMARY KEY,
        user_uid VARCHAR NOT NULL,
        friend_uid VARCHAR NOT NULL,
        friend_username VARCHAR NOT NULL,
        UNIQUE(user_uid, friend_uid)
      );
    `;

const createMessagesQuery = `
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        from_uid VARCHAR NOT NULL,
        to_uid VARCHAR NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `;

pool.query(createUsersQuery, (err, res) => {
  if (err) console.error("Error creating 'users' table", err);
  else console.log("Table 'users' verified");

  pool.query(createFriendsQuery, (err, res) => {
    if (err) console.error("Error creating 'friends' table", err);
    else console.log("Table 'friends' verified");

    pool.query(createMessagesQuery, (err, res) => {
      if (err) console.error("Error creating 'messages' table", err);
      else console.log("Table 'messages' verified");
    });
  });
});

module.exports = pool;
