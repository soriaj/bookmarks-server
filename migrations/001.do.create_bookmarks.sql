CREATE TABLE bookmarks (
    id UUID DEFAULT uuid_generate_v4(),
    title VARCHAR NOT NULL,
    url VARCHAR NOT NULL,
    rating INTEGER NOT NULL,
    description TEXT
);