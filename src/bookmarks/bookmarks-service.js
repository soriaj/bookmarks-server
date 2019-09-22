const BookmarksService = {
   getAllBookmarks(knex){
      return knex.select('*').from('bookmarks')
   },
   getById(knex, id){
      return knex.from('bookmarks').select('*').where('id', id).first()
      
   },
   insertBookmarks(knex, newBookmark){
      return knex
         .insert(newBookmark)
         .into('bookmarks')
         .returning('*')
         .then(rows => {
            return rows[0]
         })
   },updateBookmark(knex, id, newBookmarkData){
      return knex
         .from('bookmarks')
         .where({ id })
         .update(newBookmarkData)
   },
   deleteBookmark(knex, id){
      return knex
         .from('bookmarks')
         .where({ id })
         .delete()
   },
}

module.exports = BookmarksService;