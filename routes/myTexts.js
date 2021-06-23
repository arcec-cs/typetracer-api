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
  
  //Used in TypeTracerApp to update progress
  router
  .route('/:uId/progress/:tId')
  .put((req, res) => {
    const {uId, tId} = req.params; 
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
    const {uId, tId} = req.params;
    //log access time
    db('User_Texts') 
    .update({last_accessed: lastAccessed})//unix time into seconds
    .where({u_id: uId, t_id: tId})
    .then(a => console.log('updated time')).catch(console.log(`Couldnt update ${uId} access time for ${tId}`));
    //get and send progress
    db('User_Texts')
    .select('progress')
    .where({u_id: uId, t_id: tId})
    .then(progress => {
      res.status(200).json(progress[0]) // returns {progress:{page:, para:, sen:, c_start}}
    })
    .catch(e => res.status(404).json('unable to get progress'));
  });


  return router;
}

module.exports.myTextsRoutes = myTextsRoutes; 