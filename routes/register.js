const express = require("express");
var validator = require("email-validator");

// '/myText routes are used to preform restful operations on data related to the User_Texts table
function registerRoute(db, bcrypt, jwt) {
  let router = express.Router();
  router
  .route('/')
  .post( async (req, res) => {
    try {
      const {password, email, name} = req.body;
      //validate form
      if(!email || !name || !password) return res.status(400).json('incorrect form submission');
      if(!validator.validate(email)) return res.status(400).json('Please enter a valid e-mail')
      if(email.length > 150) return res.status(400).json('email must be shorter than 150 characters')
      if(password.length > 45 || password.length < 8) 
        return res.status(400).json('password must be in-between 8 and 45 characters')// bcryptjs alg max 50-72 char
      if(name.length > 40) return res.status(400).json('name must be 40 characters or less');
      //bcrypt hash
      const salt =  await bcrypt.genSaltSync(); //async reccomended by bcryptjs
      const hash =  await bcrypt.hashSync(password, salt);//hashing is cpu intensive, sync version block event loop
      //insert into db
      db.transaction(trx => {
        trx.insert({
          hash: hash,
          email: email
        })
        .into('Login')
        .returning('email')
        .then(loginEmail => {
          return trx('Users')
            .returning('*')
            .insert({
              email: loginEmail[0],
              name: name,
            })
            .then((knexUser) => {
              //get user from knex arr
              const user = knexUser[0];
              // create payload with exp time
              const timeValid  = 60 * 120; // 3 mins
              const expires = Math.floor(Date.now() / 1000) + timeValid; // jwt exp in sec not miliSec
              const payload ={
                user: user,
                exp: expires
              } 
              //send access Token
              const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET)
              res.json({accessToken: accessToken})  
            })
        })
        .then(trx.commit)
        .catch(trx.rollback)
      })
      .catch(e => {
        const ecDuplicateKey = 23505; //e.code is a string
        //best security practice would be not to reveal which emails are registered, but do not have an email service in place to be more vauge.
        if(e.code == ecDuplicateKey) res.status(409).json(`email already registered`);
        else res.status(500).json(`Interal Error!`)
      }); 
    }catch {res.status(500).json('Internal Error!')}
  });
  
  return router;
}

module.exports.registerRoute = registerRoute; 

