const express = require("express");

function catalogRoutes(db) { //function so we can inject db dependency
  let router = express.Router();
  // '/titles' route returns every Text's title, author, category and Id
  router
  .route('/titles')
  .get((req, res) => {
    db('Text')
    .join('Author', 'Author.id', '=', 'Text.author_id')
    .join('Category', 'Category.id', '=', 'Text.category_id')
    .select('Text.title', 'Author.author', 'Category.category', 'Text.pages',
    'Text.id' , 'Text.author_id', 'Text.category_id')
    .orderBy('Text.title')
    .then(Text => res.status(200).json(Text))//route not dynamic, can only fail on internal error
    .catch(e => res.status(500).json('Internal Error: could not retrieve catalog titles'));
  });
  // '/Author' route returns a list of alphabetized Author and thier ids
  router
  .route('/Author')
  .get((req, res)=> {
    db('Author')
    .select('Author.author', 'Author.id')
    .orderBy('Author.author')
    .then(authorList => res.status(200).json(authorList))//route not dynamic, can only fail on internal error
    .catch(e => res.status(500).json('Internal Error: could not retrieve Author'));
  });
  // '/categories' route returns a list of alphabetized categories and thier ids
  router
  .route('/categories')
  .get((req, res)=> {
    db('Category')
    .select('Category.category', 'Category.id')
    .orderBy('Category.category')
    .then(categoryList => res.status(200).json(categoryList))//route not dynamic, can only fail on internal error
    .catch(e => res.status(500).json('Internal Error: could not retrieve categories'));
  });
  // '/Author/:id' returns all of the specified author's Text metadata like "/titles" route
  router
  .route('/Author/:id')
  .get((req, res) => {
    const {id} = req.params; 
    db('Text')
    .where('author_id', '=', id)
    .join('Author', 'Author.id', '=', 'Text.author_id')
    .join('Category', 'Category.id', '=', 'Text.category_id')
    .select('Text.title', 'Author.author', 'Category.category', 'Text.pages',
    'Text.id' , 'Text.author_id', 'Text.category_id')
    .orderBy('Text.title')
    .then(authorText => res.status(200).json(authorText)) //will return empty if id is int and not in catalog
    .catch(e => {
      const ecInvalidInputForInt = '22P02'; //e.code is a string
      if (e.code == ecInvalidInputForInt){ 
        res.status(400)
        .json(`TypeError: Param :id must be of type Integer. Could not retrieve Text' metadata for author id ${id}.`);
      }
      else res.status(500).json(`Interal Error: Could not retrieve author id ${id} Text' metadata.`) 
    });
  });
   // '/categories/:id' returns all of the specified categories' Text metadata like "/titles" route
   router
   .route('/categories/:id')
   .get((req, res) => {
      const {id} = req.params;
      db('Text')
      .where('category_id', '=', id)
      .join('Author', 'Author.id', '=', 'Text.author_id')
      .join('Category', 'Category.id', '=', 'Text.category_id')
      .select('Text.title', 'Author.author', 'Category.category', 'Text.pages',
      'Text.id' , 'Text.author_id', 'Text.category_id')
      .orderBy('Text.title')
      .then(categoryText => res.status(200).json(categoryText)) //will return empty if id is int and not in catalog 
      .catch(e => {
        const ecInvalidInputForInt = '22P02'; //e.code is a string
        if (e.code == ecInvalidInputForInt) {
          res.status(400)
          .json(`TypeError: Param :id must be of type Integer. Could not retrieve Text' metadata for category id ${id}.`);
        }
        else res.status(500).json(`Interal Error: Could not retrieve category id ${id} Text' metadata.`) 
      });
   });
   
  return router;
}


module.exports.catalogRoutes = catalogRoutes; 