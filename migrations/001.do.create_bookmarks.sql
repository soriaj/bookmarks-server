CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE TABLE bookmarks (
    id UUID DEFAULT uuid_generate_v4(),
    title VARCHAR NOT NULL,
    url VARCHAR NOT NULL,
    rating INTEGER NOT NULL CHECK (rating > 0 AND rating < 6),
    description TEXT
);