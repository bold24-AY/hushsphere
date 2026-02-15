const { Pool } = require("pg");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();

// Parse the connection string manually or just pass params if we know them
// But since we are using .env, let's try to handle the password correctly.
// The issue is likely that "pg" connectionString parser doesn't like the special char if not encoded.
// However, the user provided "Ayush@5002".
// Let's rely on the environment variables directly if possible, or construct the config object.

const connectionString = process.env.DB_STRING;

const pool = new Pool({
    connectionString: connectionString,
});

const seedUser = async () => {
    const username = "admin";
    const password = "password123";

    try {
        // Ensure table exists
        await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(28) NOT NULL UNIQUE,
        passhash VARCHAR NOT NULL,
        userid VARCHAR NOT NULL UNIQUE
      );
    `);

        const existingUser = await pool.query(
            "SELECT username from users WHERE username=$1",
            [username]
        );

        if (existingUser.rowCount === 0) {
            const hashedPass = await bcrypt.hash(password, 10);
            await pool.query(
                "INSERT INTO users(username, passhash, userid) values($1,$2,$3)",
                [username, hashedPass, uuidv4()]
            );
            console.log(`User created successfully!`);
            console.log(`Username: ${username}`);
            console.log(`Password: ${password}`);
        } else {
            console.log("User 'admin' already exists.");
        }
    } catch (err) {
        console.error("Error seeding user:", err);
    } finally {
        pool.end();
    }
};

seedUser();
