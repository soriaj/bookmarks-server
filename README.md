# Bookmarks Server

This is a server for the bookmarks-app

## Set up

Complete the following steps to start a new project (NEW-PROJECT-NAME):

1. Clone this repository to your local machine `git clone SERVER-APP NEW-PROJECTS-NAME`
2. `cd` into the cloned repository
3. Make a fresh start of the git history for this project with `rm -rf .git && git init`
4. Install the node dependencies `npm install`
5. Move the example Environment file to `.env` that will be ignored by git and read by the express server `mv example.env .env`
6. Add API details and Database details to .env. Additionally migration setup with DB details as well. 

```bash
MIGRATION_DB_HOST=<local dev host>
MIGRATION_DB_PORT=5432
MIGRATION_DB_NAME=<db name>
MIGRATION_DB_USER=<db user>
MIGRATION_DB_PASS=<db password if needed>
DB_URL=<db endpoint>
TEST_DB_URL=<test db endpoint>
```
7. Add db and test_db url paths to config file
8. Run migration command to create database table
9. Seed database data using ./seeds sql script
10. Test database and routes /GET and /GET/:id

## Scripts

Start the application `npm start`

Start nodemon for the application `npm run dev`

## Test API

Start bookmarks-app `npm start`
Edit your `config` file to use the API_TOKEN added to the `.env` file

## Contributor(s)

Javier Soria