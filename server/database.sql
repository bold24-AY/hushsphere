CREATE TABLE users(
    id SERIAL PRIMARY KEY,
    username VARCHAR(28) NOT NULL UNIQUE,
    passhash VARCHAR NOT NULL,
    userid VARCHAR NOT NULL UNIQUE
);

CREATE TABLE friends(
    id SERIAL PRIMARY KEY,
    user_uid VARCHAR NOT NULL,
    friend_uid VARCHAR NOT NULL,
    friend_username VARCHAR NOT NULL,
    UNIQUE(user_uid, friend_uid)
);

CREATE TABLE messages(
    id SERIAL PRIMARY KEY,
    from_uid VARCHAR NOT NULL,
    to_uid VARCHAR NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO users(username, passhash) values($1,$2);