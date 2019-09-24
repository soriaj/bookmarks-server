const { expect } = require('chai')
const knex = require('knex')
const { TEST_DB_URL } = require('../src/config')
const app = require('../src/app')
const setTZ = require('set-tz')
const { makeBookmarksArray } = require('./bookmarks.fixture') // test bookmarks
setTZ('UTC') // set timezone for test

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

   describe('GET /api/bookmarks', () => {
      context('no authorization', () => {
         it('response with unauthorized request', () => {
            return supertest(app)
               .get('/api/bookmarks')
               .expect(401, { error: 'Unauthorized request' })
         })
      })

      context('Given no bookmarks', () => {
         it(`responds with 200 and an empty list`, () => {
            return supertest(app)
               .get('/api/bookmarks')
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
   
         it('GET /api/bookmarks responds with 200 and all of the bookmarks', () => {
            return supertest(app)
               .get('/api/bookmarks')
               .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
               .expect(200, testBookmarks)
         })
      })
   })

   describe(`GET /api/bookmarks/:bookmark_id`, () => {
      context('Give no bookmarks', () => {
         it('responds with 404', () => {
            const bookmarkId = '0d8ff411-5938-4777-9142-759d99cdd934'
            return supertest(app)
               .get(`/api/bookmarks/${bookmarkId}`)
               .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
               .expect(404, {error: { message: `Bookmark doesn't exist` }})
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
               .get(`/api/bookmarks/${bookmarkId}`)
               .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
               .expect(200, expectedBookmark)
         })
      })
   })

   describe('POST /api/bookmarks', () => {
      it('creates a bookmark, responding with 201 and the new bookmark', () => {
         const newBookmark = {
            title: 'New Bookmark Title',
            url: 'http://www.my-new-bookmark.com',
            rating: 1,
            description: 'New Bookmark POST Test'
         }
         return supertest(app)
            .post('/api/bookmarks')
            .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
            .send(newBookmark)
            .expect(201)
            .expect(res => {
               expect(res.body).to.have.property('id')
               expect(res.body.title).to.eql(newBookmark.title)
               expect(res.body.url).to.eql(newBookmark.url)
               expect(res.body.rating).to.eql(newBookmark.rating)
               expect(res.body.description).to.eql(newBookmark.description)
               expect(res.headers.location).to.eql(`/api/bookmarks/${res.body.id}`)
            })
            .then(postRes => {
               supertest(app)
                  .get(`/api/bookmarks/${postRes.body.id}`)
                  .expect(postRes.body)
            })
      })

      const requiredFields = ['title', 'url', 'rating', 'description']

      requiredFields.forEach(field => {
         const newBookmark = {
            title: 'New Bookmark Title',
            url: 'http://www.my-new-bookmark.com',
            rating: 4,
            description: 'New Bookmark POST Test'
         }

         it(`responds with 400 and an error message when the '${field}' is missing`, () => {
            delete newBookmark[field]

            return supertest(app)
               .post('/api/bookmarks')
               .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
               .send(newBookmark)
               .expect(400, { error: { message: `Missing '${field}' in request body`}})
         })

      })
   })

   describe('DELETE /api/bookmarks/:bookmark_id', () => {
      context('Given no bookmarks', () => {
         it('responds with 404', () => {
            const bookmarkId = 'e9f3ef14-63a2-419c-8e5a-409f5984b341'
            return supertest(app)
               .delete(`/api/bookmarks/${bookmarkId}`)
               .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
               .expect(404, { error: { message: `Bookmark doesn't exist` }})
         })
      })

      context('Given there are bookmarks in the database', () => {
         const testBookmarks = makeBookmarksArray()
         beforeEach('insert bookmarks', () => {
            return db
               .into('bookmarks')
               .insert(testBookmarks)
         })

         it('responds with 204 and removes the bookmark', () => {
            const idToRemove = 'e9f3ef14-63a2-419c-8e5a-409f5984b65e'
            const expectedBookmarks = testBookmarks.filter(bookmark => bookmark.id !== idToRemove)
            return supertest(app)
               .delete(`/api/bookmarks/${idToRemove}`)
               .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
               .expect(204)
               .then(res => {
                  supertest(app)
                     .get('/api/bookmarks')
                     .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                     .expect(expectedBookmarks)
               })
         })
      })
   })

   describe.only('PATCH /api/bookmarks/:bookmark_id', () => {
      context('Given no bookmarks', () => {
         it('responds with 404', () => {
            const bookmarkId = 'e9f3ef14-63a2-419c-8e5a-409f5984b341'
            return supertest(app)
               .patch(`/api/bookmarks/${bookmarkId}`)
               .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
               .expect(404, { error: { message: `Bookmark doesn't exist` } })
         })
      })

      context('Given there are bookmarks in the database', () => {
         const testBookmarks = makeBookmarksArray()

         beforeEach('insert bookmarks', () => {
            return db
               .into('bookmarks')
               .insert(testBookmarks)
         })

         it('responds with 204 and updates the bookmarks', () => {
            const idToUpdate = 'e9f3ef14-63a2-419c-8e5a-409f5984b65e'
            const updateBookmark = {
               title: 'Updated Bookmark Title',
               url: 'https://new-bookmark-url.com',
               rating: 5,
               description: 'Updated Bookmark Description',
            }
            const findBookmarkToUpdate = testBookmarks.filter(bookmark => bookmark.id == idToUpdate)
            const expectedBookmark = {
               ...findBookmarkToUpdate,
               ...updateBookmark
            }
            return supertest(app)
               .patch(`/api/bookmarks/${idToUpdate}`)
               .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
               .send(updateBookmark)
               .expect(204)
               .then(res => {
                  supertest(app)
                     .get(`/api/bookmarks/${idToUpdate}`)
                     .expect(expectedBookmark)
               })
         })

         it('responds with 400 when no required fields are supplied', () => {
            const idToUpdate = 'e9f3ef14-63a2-419c-8e5a-409f5984b65e'
            return supertest(app)
               .patch(`/api/bookmarks/${idToUpdate}`)
               .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
               .send({ bogusField: 'Bad field data to send' })
               .expect(400, { error: { message: `Request body must contain either 'title', 'url', 'rating' or 'description'`} })
         })

         it('responds with 204 when updating only a part of the fields', () => {
            const idToUpdate = 'e9f3ef14-63a2-419c-8e5a-409f5984b65e'
            const updateBookmark = { title: 'Updated Title Only' }
            const findBookmarkToUpdate = testBookmarks.filter(bookmark => bookmark.id == idToUpdate)
            const expectedBookmark = {
               ...findBookmarkToUpdate,
               ...updateBookmark
            }

            return supertest(app)
               .patch(`/api/bookmarks/${idToUpdate}`)
               .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
               .send({
                  ...updateBookmark,
                  bogusField: 'Bad field data to send, not in GET response'
               })
               .expect(204)
               .then(res => {
                  supertest(app)
                     .get(`/api/bookmarks/${idToUpdate}`)
                     .expect(expectedBookmark)
               })

         })
      })
   })
})