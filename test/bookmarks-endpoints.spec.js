const { expect } = require('chai')
const knex = require('knex')
const { TEST_DB_URL } = require('../src/config')
const app = require('../src/app')
const setTZ = require('set-tz')
const { makeBookmarksArray } = require('./bookmarks.fixture') // test bookmarks
setTZ('UTC')

describe.only('Bookmarks Endpoint', () => {
   let db

   before('make knex instance', () => {
      db = knex({
         client: 'pg',
         connection: TEST_DB_URL,
      })
      app.set('db', db)
   })

   after('disconnect from db', () => db.destroy())

   before('clean the table', () => db('bookmarks').truncate())

   afterEach('cleanup', () => db('bookmarks').truncate())

   describe('GET /bookmarks', () => {
      context('Given no bookmarks', () => {
         it(`responds with 200 and an empty list`, () => {
            return supertest(app)
               .get('/bookmarks')
               .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
               .expect(200, [])
         })
      })

      context('Given there are bookmarks in the database', () => { 
         const testBookmarks = makeBookmarksArray()
         beforeEach('insert bookmarks', () => {
            return db
               .into('bookmarks')
               .insert(testBookmarks)
         })
   
         it('GET /bookmarks responds with 200 and all of the bookmarks', () => {
            return supertest(app)
               .get('/bookmarks')
               .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
               .expect(200, testBookmarks)
         })
      })
   })

   describe(`GET /bookmarks/:id`, () => {
      context('Give no bookmarks', () => {
         it('responds with 404', () => {
            const bookmarkId = '0d8ff411-5938-4777-9142-759d99cdd934'
            return supertest(app)
               .get(`/bookmarks/${bookmarkId}`)
               .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
               .expect(404, {error: { message: `Bookmark Not Found` }})
         })
      })
      context('Given there are bookmarks in the database', () => {
         const testBookmarks = makeBookmarksArray()
         beforeEach('insert bookmarks', () => {
            return db
               .into('bookmarks')
               .insert(testBookmarks)
         })

         it('responds with 200 and the specified bookmark', () => {
            const bookmarkId = 'e9f3ef14-63a2-419c-8e5a-409f5984b65e'
            const expectedBookmark = testBookmarks[1]
            return supertest(app)
               .get(`/bookmarks/${bookmarkId}`)
               .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
               .expect(200, expectedBookmark)
         })
      })
   })
})