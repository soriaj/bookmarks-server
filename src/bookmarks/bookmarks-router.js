const path = require('path')
const express = require('express')
const uuid = require('uuid/v4')
const logger = require('../logger')
const xss = require('xss')
// const { bookmarks } = require('../store')
const BookmarksService = require('./bookmarks-service')

const bookmarksRouter = express.Router()
const bodyParser = express.json()

const serializeBookmark = bookmark => ({
   id: bookmark.id,
   title: xss(bookmark.title),
   url: bookmark.url,
   rating: bookmark.rating,
   description: xss(bookmark.description)
})

bookmarksRouter
   .route('/')
   .get((req, res, next) => {
      const knexInstance = req.app.get('db')
      BookmarksService.getAllBookmarks(knexInstance)
         .then(bookmarks => {
            res.json(bookmarks.map(serializeBookmark))
         })
         .catch(next)
   })
   .post(bodyParser, (req, res, next) => {
      const { title, url, rating, description } = req.body;
      let rate = Number(rating);
      const newBookmark = { title, url, rating, description };
      const knexInstance = req.app.get('db')
      
      for(const [key, value] of Object.entries(newBookmark)){
         if(value == null){
            return res.status(400).json({ error: { message: `Missing '${key}' in request body` }})
         }
      }
      BookmarksService.insertBookmarks(knexInstance, newBookmark)
         .then(bookmark => {
            logger.info(`Bookmark with id ${bookmark.id} created`);
            return res.status(201).location(path.posix.join(req.originalUrl, `/${bookmark.id}`)).json(serializeBookmark(bookmark))
         })
         .catch(next)
   })

bookmarksRouter
   .route('/:bookmark_id')
   .all((req, res, next) => {
      const { bookmark_id } = req.params
      const knexInstance = req.app.get('db')
      BookmarksService.getById(knexInstance, bookmark_id)
         .then(bookmark => {
            if(!bookmark){
               return res.status(404).json({ error: { message: `Bookmark doesn't exist` }})
            }
            res.bookmark = bookmark
            next()
         })
         .catch(next)
   })
   .get((req, res, next) => {
      res.json(serializeBookmark(res.bookmark))
   })
   .delete((req, res, next) => {
      const { bookmark_id } = req.params
      const knexInstance = req.app.get('db')
      BookmarksService.deleteBookmark(knexInstance, bookmark_id)
         .then(() => {
            res.status(204).end()
         })
         .catch(next)
   })
   .patch(bodyParser, (req, res, next) => {
      const knexInstance = req.app.get('db')
      const { title, url, rating, description } = req.body
      const bookmarkToUpdate = { title, url, rating, description }
      const { bookmark_id } = req.params

      const numOfBookmarks = Object.values(bookmarkToUpdate).filter(Boolean).length
      if(numOfBookmarks === 0){
         return res.status(400).json({ error: { message: `Request body must contain either 'title', 'url', 'rating' or 'description'`} })
      }

      BookmarksService.updateBookmark(knexInstance, bookmark_id, bookmarkToUpdate)
         .then(numRowsAffected => {
            res.status(204).end()
         })
         .catch(next)
   })

module.exports = bookmarksRouter