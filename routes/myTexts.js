const express = require("express");

// '/myTexts routes are used to preform restful operations on data related to the User_Texts table
function myTextsRoutes(db) {
  let router = express.Router();
  
  //Gets user texts data for the specified user id, used on MyTexts page
  router
  .route('/')
  .get((req, res) => {
    const uId = req.uId; 
    db('User_Texts') //get text ids that belong to user uid 
    .select('User_Texts.t_id', 'User_Texts.last_accessed', 'progress')
    .where({u_id: uId})
    .orderBy('t_id', 'asc') // so both querys output will be the same 
    .then(userTextIds => { // userTextsIds is an array of objs
      const idsArr = userTextIds.map( obj => obj.t_id) // get t_id array
      db('Texts') //get text meta data of each id specified in idsArr
        .whereIn('Texts.id', idsArr) //In has no order, need to find another way to return last_accessed desc.
        .join('Authors', 'Authors.id', '=', 'Texts.author_id')
        .join('Categories', 'Categories.id', '=', 'Texts.category_id')
        .select('Texts.id', 'Texts.title', 'Authors.author', 'Texts.pages', 'Categories.category')
        .orderBy('Texts.id', 'asc')
        .then(texts => {
           texts.forEach((entry,ind) => { // append lastAccessed/ page progress
             entry.lastAccessed = userTextIds[ind].last_accessed;
             entry.pageProgress = userTextIds[ind].progress.page;
            });
           texts.sort((a, b) => (a.lastAccessed < b.lastAccessed) ? 1 : -1); //sort by time decending
           res.status(200).json(texts);
        })
        .catch(e => res.status(500).json('internal error'));//should always return atlest an empty array
      })
    .catch(e => res.status(404).json('uId was not specified'));
  });

  //Used to create a User_Texts record for :uID and :tId when logged in user access a book for the first time
  router
  .route('/:tId' )
  .post((req, res) => { 
    const lastAccessed = Math.ceil(Date.now() / 1000); //milli to sec, always get a full int; unix time to secs
    const progressInit = JSON.stringify({page:1, para:0, sen:0, c_start:0}); //initial progress indexes
    const {tId} = req.params;
    const uId = req.uId; 
    // init the User_Texts record
    db('User_Texts')
    .insert({u_id: uId, t_id: tId, progress: progressInit, last_accessed: lastAccessed })
    .returning('progress')
    .then(() => {
      res.status(201).json(`text id ${tId} has been added your texts!`)
    })//status code 200 on dup key for route is to ensure that there is a record
    .catch(e => {
      const ecDuplicateKey = 23505; //e.code is a string
      if(e.code == ecDuplicateKey) res.status(200).json(`text id ${tId} is already apart of myTexts`)
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
    db('User_Texts')
    .update({progress: progress})
    .where({u_id: uId, t_id: tId})
    .then(() => res.status(200).json('Success, progress was updated'))
    .catch(e => res.status(404).json('unable to update user-texts'));
  })
  //used to get progress when starting typetracer app 
  .get((req, res) => { 
    const lastAccessed = Math.ceil(Date.now() / 1000); //milli to sec, always get a full int
    const {tId} = req.params;
    const uId = req.uId; 
    //log access time
    db('User_Texts') 
    .update({last_accessed: lastAccessed})//unix time into seconds
    .where({u_id: uId, t_id: tId})
    .then(a => console.log('updated time')).catch(()=>console.log(`Couldnt update ${uId} access time for ${tId}`));
    //get and send progress
    db('User_Texts')
    .select('progress')
    .where({u_id: uId, t_id: tId})
    .then(progress => {
      res.status(200).json(progress[0].progress) // returns {page:, para:, sen:, c_start}
    })
    .catch(e => res.status(404).json('unable to get progress'));
  });


  return router;
}

module.exports.myTextsRoutes = myTextsRoutes; 