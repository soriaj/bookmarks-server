const express = require('express')
const uuid = require('uuid/v4')
const logger = require('../logger')
const { bookmarks } = require('../store')

const bookmarksRouter = express.Router()
const bodyParser = express.json()

bookmarksRouter
   .route('/bookmarks')
   .get((req, res) => {
      res.json(bookmarks)
   })
   .post(bodyParser, (req, res) => {
      const { title, url, rating=1, desc } = req.body;
      
      if(!title){
         logger.error('Title is required')
         return res.status(400).send('Invalid Title')
      }

      if(!url){
         logger.error('Url is required')
         return res.status(400).send('Invalid Url')
      }

      if(!rating){
         logger.error('Rating is required')
         return res.status(400).send('Invalid Rating')
      }

      if(!desc){
         logger.error('Description is required')
         return res.status(400).send('Invalid Description')
      }

      const id = uuid();

      const bookmark = {
         id,
         title,
         url,
         rating,
         desc
      };

      bookmarks.push(bookmark);

      logger.info(`Bookmark with id ${id} created`);
      res.status(201).location(`http://localhost:8000/bookmark/${id}`).json(bookmark);
   })

bookmarksRouter
   .route('/bookmarks/:id')
   // .get((req, res) => {
   //    const { id } = req.params
   //    const bookmark = bookmarks.find(book => book.id == id);

   //    //make sure we find a book
   //    if(!bookmark){
   //       logger.error(`Bookmark with id ${id} not found`);
   //       return res.status(404).send('Bookmark Not Found');
   //    }
   //    res.json(bookmark)
   // })
   // .delete((req, res) => {
   //    const { id } = req.params
   //    const bookmarkIndex = bookmarks.findIndex(book => book.id == id);

   //    if(bookmarkIndex === -1){
   //       logger.error(`Bookmark with id ${id} not found`);
   //       return res.status(404).send('Not Found');
   //    }


   })

module.exports = bookmarksRouter