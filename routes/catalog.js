const express = require("express");

function catalogRoutes(db) { //function so we can inject db dependency
  let router = express.Router();
  // '/titles' route returns every Text's title, author, category and Id
  router
  .route('/titles')
  .get((req, res) => {
    db('Texts')
    .join('Authors', 'Authors.id', '=', 'Texts.author_id')
    .join('Categories', 'Categories.id', '=', 'Texts.category_id')
    .select('Texts.title', 'Authors.author', 'Categories.category', 'Texts.pages',
    'Texts.id' , 'Texts.author_id', 'Texts.category_id')
    .orderBy('Texts.title')
    .then(texts => res.status(200).json(texts))//route not dynamic, can only fail on internal error
    .catch(e => res.status(500).json('Internal Error: could not retrieve catalog titles'));
  });
  // '/authors' route returns a list of alphabetized authors and thier ids
  router
  .route('/authors')
  .get((req, res)=> {
    db('Authors')
    .select('Authors.author', 'Authors.id')
    .orderBy('Authors.author')
    .then(authorList => res.status(200).json(authorList))//route not dynamic, can only fail on internal error
    .catch(e => res.status(500).json('Internal Error: could not retrieve authors'));
  });
  // '/categories' route returns a list of alphabetized categories and thier ids
  router
  .route('/categories')
  .get((req, res)=> {
    db('Categories')
    .select('Categories.category', 'Categories.id')
    .orderBy('Categories.category')
    .then(categoryList => res.status(200).json(categoryList))//route not dynamic, can only fail on internal error
    .catch(e => res.status(500).json('Internal Error: could not retrieve categories'));
  });
  // '/authors/:id' returns all of the specified author's Texts metadata like "/titles" route
  router
  .route('/authors/:id')
  .get((req, res) => {
    const {id} = req.params; 
    db('Texts')
    .where('author_id', '=', id)
    .join('Authors', 'Authors.id', '=', 'Texts.author_id')
    .join('Categories', 'Categories.id', '=', 'Texts.category_id')
    .select('Texts.id', 'Texts.title', 'Authors.author', 'Categories.category', 'Texts.pages', 'Texts.author_id', 'Texts.category_id' )
    .orderBy('Texts.title')
    .then(authorTexts => {
      res.status(200).json(authorTexts);
    })
    .catch(err => res.status(404).json(`Could not retrieve author ${id} titles`));
  });
   // '/categories/:id' returns all of the specified categories' Texts metadata like "/titles" route
   router
   .route('/categories/:id')
   .get((req, res) => {
     const {id} = req.params;
     db('Texts')
     .where('category_id', '=', id)
     .join('Authors', 'Authors.id', '=', 'Texts.author_id')
     .join('Categories', 'Categories.id', '=', 'Texts.category_id')
     .select('Texts.id', 'Texts.title', 'Authors.author', 'Categories.category', 'Texts.pages', 'Texts.author_id', 'Texts.category_id' )
     .orderBy('Texts.title')
     .then(categoryTexts => {
       res.status(200).json(categoryTexts);
      })
     .catch(err => res.status(404).json(`Could not retrieve category ${id} titles`));
   });
   
  return router;
}


module.exports.catalogRoutes = catalogRoutes; 