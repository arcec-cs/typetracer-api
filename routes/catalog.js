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
    .select('Texts.title', 'Authors.author', 'Categories.category', 'Texts.pages',
    'Texts.id' , 'Texts.author_id', 'Texts.category_id')
    .orderBy('Texts.title')
    .then(authorTexts => res.status(200).json(authorTexts)) //will return empty if id is int and not in catalog
    .catch(e => {
      const ecInvalidInputForInt = '22P02'; //e.code is a string
      if (e.code == ecInvalidInputForInt){ 
        res.status(400)
        .json(`TypeError: Param :id must be of type Integer. Could not retrieve texts' metadata for author id ${id}.`);
      }
      else res.status(500).json(`Interal Error: Could not retrieve author id ${id} texts' metadata.`) 
    });
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
      .select('Texts.title', 'Authors.author', 'Categories.category', 'Texts.pages',
      'Texts.id' , 'Texts.author_id', 'Texts.category_id')
      .orderBy('Texts.title')
      .then(categoryTexts => res.status(200).json(categoryTexts)) //will return empty if id is int and not in catalog 
      .catch(e => {
        const ecInvalidInputForInt = '22P02'; //e.code is a string
        if (e.code == ecInvalidInputForInt) {
          res.status(400)
          .json(`TypeError: Param :id must be of type Integer. Could not retrieve texts' metadata for category id ${id}.`);
        }
        else res.status(500).json(`Interal Error: Could not retrieve category id ${id} texts' metadata.`) 
      });
   });
   
  return router;
}


module.exports.catalogRoutes = catalogRoutes; 