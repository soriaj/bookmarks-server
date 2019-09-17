const express = require('express')
const uuid = require('uuid/v4')
const logger = require('../logger')

const bookmarksRouter = express.Router()
const bodyParser = express.json()

bookmarksRouter
   .route('/bookmarks')
   .get((req, res) => {
      res.send('YOU GOT BOOKMARKS')
   })
   .post(bodyParser, (req, res) => {
      const { title, url, description, rating=1 } = req.body;
      
   })

bookmarksRouter
   .route('/bookmarks/:id')
   .get((req, res) => {
      const { id } = req.params
   })
   .delete((req, res) => {
      const { id } = req.params
   })

module.exports = bookmarksRouter