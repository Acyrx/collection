CREATE TABLE your_table_name (
    uuid UUID PRIMARY KEY,
    topic VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    duration INTEGER NOT NULL,
    color VARCHAR(50),
    style VARCHAR(100),
    bookmarked BOOLEAN DEFAULT FALSE,
    audience VARCHAR(255),
    voice VARCHAR(255)
);
