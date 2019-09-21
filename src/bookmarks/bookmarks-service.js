const BookmarksService = {
   getAllBookmarks(knex){
      return knex.select('*').from('bookmarks')
   },
   insertBookmarks(knex, newBookmark){
      return knex
         .insert(newBookmark)
         .into('bookmarks')
         .returning('*')
         .then(rows => {
            return rows[0]
         })
   },
   getById(knex, id){
      return knex.from('bookmarks').select('*').where('id', id).first()
      
   },
   deleteBookmark(knex, id){
      return knex
         .from('bookmarks')
         .where({ id })
         .delete()
   },
   updateBookmark(knex, id, newBookmarkData){
      return knex
         .from('bookmarks')
         .where({ id })
         .update(newBookmarkData)
   }
}

module.exports = BookmarksService;