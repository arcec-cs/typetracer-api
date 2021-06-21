const express = require("express");

// '/myTexts routes are used to preform restful operations on data related to the User_Texts table
function myTextsRoutes(db) {
  let router = express.Router();
  
  //Gets user texts data for the specified user id, used on MyTexts page
  router
  .route('/:uId')
  .get((req, res) => {
    const {uId} = req.params;
    db('User_Texts') //get text ids that belong to user uid 
    .select('User_Texts.t_id', 'User_Texts.last_accessed')
    .where({u_id: uId})
    .orderBy('User_Texts.last_accessed', 'desc') //unix time in sec, dec bc 
    .then(userTextIds => { // userTextsIds is an array of objs
      const idsArr = userTextIds.map( obj => obj.t_id)
      db('Texts') //get text meta data of each id specified in idsArr
        .whereIn('Texts.id', idsArr) //In has no order, need to find another way to return last_accessed desc.
        .join('Authors', 'Authors.id', '=', 'Texts.author_id')
        .join('Categories', 'Categories.id', '=', 'Texts.category_id')
        .select('Texts.id', 'Texts.title', 'Authors.author', 'Texts.words', 'Categories.category')
        .then(texts => res.status(200).json(texts))
        .catch(e=> res.status(500).json('internal error'));//should always return atlest an empty array
      })
    .catch(e => {console.log(e);res.status(404).json('uId was not specified')});
  });

  return router;
}

module.exports.myTextsRoutes = myTextsRoutes; 