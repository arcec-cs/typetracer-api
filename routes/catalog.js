const { response } = require("express");
const express = require("express");

function catalogRoutes(db) { //function so we can inject db dependency
  let router = express.Router();
  // '/titles' route returns a Texts title, author, aategory and Ids for each so we may use them to make request form the fronend
  router
  .route('/titles')
  .get((req, res) => {
    db('Texts')
    .join('Authors', 'Authors.id', '=', 'Texts.author_id')
    .join('Categories', 'Categories.id', '=', 'Texts.category_id')
    .select('Texts.id', 'Texts.title', 'Authors.author', 'Categories.category', 'Texts.words', 'Texts.author_id', 'Texts.category_id')
    .orderBy('Texts.title')
    .then(texts =>{
      res.status(200).json(texts);
    })
    .catch(err => res.status(404).json('could not retrieve catalog'))
  });
  
  return router;
}


module.exports.catalogRoutes = catalogRoutes; 