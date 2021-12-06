const express = require("express");

// '/myTexts routes are used to preform restful operations on data related to the User_Text table
function myTextsRoutes(db) {
  let router = express.Router();
  
  //Gets user texts data for the specified user id, used on MyTexts page
  router
  .route('/')
  .get((req, res) => {
    const uId = req.uId; 
    db('User_Text') //get text ids that belong to user uid 
    .select('User_Text.t_id', 'User_Text.last_accessed', 'progress')
    .where({u_id: uId})
    .orderBy('t_id', 'asc') // so both querys output will be the same 
    .then(userTextIds => { // userTextIds is an array of objs
      const idsArr = userTextIds.map( obj => obj.t_id) // get t_id array
      db('Text') //get text meta data of each id specified in idsArr
        .whereIn('Text.id', idsArr) //In has no order, need to find another way to return last_accessed desc.
        .join('Author', 'Author.id', '=', 'Text.author_id')
        .join('category', 'category.id', '=', 'Text.category_id')
        .select('Text.id', 'Text.title', 'Author.author', 'Text.pages', 'category.category')
        .orderBy('Text.id', 'asc')
        .then(text => {
           text.forEach((entry,ind) => { // append lastAccessed/ page progress
             entry.lastAccessed = userTextIds[ind].last_accessed;
             entry.pageProgress = userTextIds[ind].progress.page;
            });
           text.sort((a, b) => (a.lastAccessed < b.lastAccessed) ? 1 : -1); //sort by time decending
           res.status(200).json(text);
        })
        .catch(e => res.status(500).json('Internal Error!'));//should always return atlest an empty array
      })
    .catch(e => res.status(500).json('Internal Error!'));// uId should always be valid from verified access token
  });

  //Used to create a User_Text record for :uID and :tId when logged in user access a book for the first time
  router
  .route('/:tId' )
  .post((req, res) => { 
    const lastAccessed = Math.ceil(Date.now() / 1000); //milli to sec, always get a full int; unix time to secs
    const progressInit = JSON.stringify({page:1, para:0, sen:0, c_start:0}); //initial progress indexes
    const {tId} = req.params;
    const uId = req.uId; 
    // init the User_Text record
    db('User_Text')
    .insert({u_id: uId, t_id: tId, progress: progressInit, last_accessed: lastAccessed })
    .returning('progress')
    .then(() => {
      res.status(201).json(`text id ${tId} has been added your Text!`)
    })//status code 200 on dup key for route is to ensure that there is a record
    .catch(e => { 
      const ecDuplicateKey = 23505; //e.code is a string
      const fKeyViolation = 23503;
      if(e.code == ecDuplicateKey) res.status(200).json(`Text id ${tId} is already apart of my`);
      else if (e.code == fKeyViolation) res.status(400).json(`Text id ${tId} does not exist`);
      else res.status(500).json(`Interal Error!`)}); 
  });

  //Used in TypeTracerApp to update progress
  router
  .route('/progress/:tId')
  .put((req, res) => {
    const {tId} = req.params; 
    const uId = req.uId; 
    const {progress} = req.body;
    //update progress
    db('User_Text')
    .update({progress: progress})
    .where({u_id: uId, t_id: tId})
    .then(code => {
      if(code == 1) res.status(201).json(`Text Id ${tId}'s progress was updated`); //knex returns 1 on success
      else throw Error(-1);//knex returns 0 on failure, need to throw our own error
    })
    .catch(e => {
      console.log(e)
      if(e.message == -1) res.status(400).json(`Unable to update. Text Id ${tId} id not apart of myText`); //uid is auth so bad tId
      else res.status(500).json(`Internal Error! Unable to update progress for Text Id ${tId}`);
    });
  })
  //used to get progress when starting typetracer app 
  .get((req, res) => { 
    const lastAccessed = Math.ceil(Date.now() / 1000); //milli to sec, always get a full int
    const {tId} = req.params;
    const uId = req.uId; 
    //update lastAccessed
    db('User_Text') 
    .update({last_accessed: lastAccessed})//unix time into seconds
    .where({u_id: uId, t_id: tId})
    .then(code => {
      if(code == 1) return 0; //knex returns 1 on success
      else throw Error(-1);//knex returns 0 on failure, need to throw our own error
    })
    .catch(e => {
      console.log(e)
      if(e.message == -1) res.status(400).json(`Unable to get progress. Text Id ${tId} id not apart of myText`); //uid is auth so bad tId
      else res.status(500).json(`Internal Error!, unable to get progress for Text Id ${tId}`); // we want access time to be logged
    });
    //get and send progress
    db('User_Text')
    .select('progress')
    .where({u_id: uId, t_id: tId})
    .then(progress => {
      if (progress) res.status(200).json(progress[0].progress) // returns {page:, para:, sen:, c_start}
      else throw Error(-1);
    })
    .catch(e => {
      res.status(500).json(`Internal Error! Unable to get progress for Text Id ${tId}`);
    });
  });


  return router;
}

module.exports.myTextsRoutes = myTextsRoutes; 