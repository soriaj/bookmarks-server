const express = require('express')
const uuid = require('uuid/v4')
const logger = require('../logger')
const { bookmarks } = require('../store')
const BookmarksService = require('./bookmarks-service')

const bookmarksRouter = express.Router()
const bodyParser = express.json()

bookmarksRouter
   .route('/bookmarks')
   .get((req, res, next) => {
      const knexInstance = req.app.get('db')
      BookmarksService.getAllBookmarks(knexInstance)
         .then(bookmarks => {
            res.json(bookmarks)
         })
         .catch(next)
   })
   .post(bodyParser, (req, res, next) => {
      const { title, url, rating=1, description } = req.body;
      let rate = Number(rating);
      const newBookmark = { title, url, rating: rate, description };
      const knewInstance = req.app.get('db')
      
      // if(!title){
      //    logger.error('Title is required')
      //    return res.status(400).send('Invalid Title')
      // }

      // if(!url){
      //    logger.error('Url is required')
      //    return res.status(400).send('Invalid Url')
      // }

      // if(!rating){
      //    logger.error('Rating is required')
      //    return res.status(400).send('Invalid Rating')
      // }

      // if(!description){
      //    logger.error('Description is required')
      //    return res.status(400).send('Invalid Description')
      // }
      
      for(const [key, value] of Object.entries(newBookmark)){
         if(value == null){
            return res.status(400).json({ error: { message: `Missing '${key}' in request body` }})
         }
      }
      // const id = uuid();
      BookmarksService.insertBookmarks(knewInstance, newBookmark)
         .then(bookmark => {
            logger.info(`Bookmark with id ${bookmark.id} created`);
            return res.status(201).location(`/bookmarks/${bookmark.id}`).json(bookmark)
         })
         .catch(next)
      // bookmarks.push(newBookmark);

      // // logger.info(`Bookmark with id ${id} created`);
      // res.status(201).location(`http://localhost:8000/bookmark/`).json(newBookmark);
   })

bookmarksRouter
   .route('/bookmarks/:id')
   .get((req, res, next) => {
      const { id } = req.params
      const knexInstance = req.app.get('db')
      BookmarksService.getById(knexInstance, id)
         .then(bookmark => {
            if(!bookmark){
               logger.error(`Bookmark with id ${id} not found`);
               return res.status(404).json({ error: { message: 'Bookmark Not Found' }});
            }
            res.json(bookmark)
         })
         .catch(next)
   })
   .delete((req, res, next) => {
      const { id } = req.params
      // const bookmarkIndex = bookmarks.findIndex(bookmark => bookmark.id == id);
      BookmarksService.getById(knewInstance, id)
         .then(bookmark => {
            if(!bookmark){
               logger.error(`Bookmark with id ${id} not found`)
               return res.status(404).json({ error: { message: 'Bookmark Not Found' }});
            }
         })

      if(bookmarkIndex === -1){
         logger.error(`Bookmark with id ${id} not found`);
         return res.status(404).send('Bookmark Not Found');
      }

      bookmarks.splice(bookmarkIndex, 1);
      logger.info(`Bookmark with id ${id} deleted.`);
      res.status(204).end();
   })

module.exports = bookmarksRouter