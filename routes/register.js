const express = require("express");

// '/myText routes are used to preform restful operations on data related to the User_Texts table
function registerRoute(db, bcrypt, jwt) {
  let router = express.Router();
  router
  .route('/')
  .post( async (req, res) => {
    try {
      const {password, email, name} = req.body;
      if (!email || !name || !password) { //check inputs
        return res.status(400).json('incorrect form submission');
      }
      const salt =  await bcrypt.genSaltSync(); //async reccomended by bcryptjs
      const hash =  await bcrypt.hashSync(password, salt);//hashing is cpu intensive, sync version block event loop
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
      .catch(err => {res.status(500).json('Internal Error, or Email already registered')})
    }catch {res.status(500).json('unable to register')}
  });
  
  return router;
}

module.exports.registerRoute = registerRoute; 

