const express = require("express");

// '/myText routes are used to preform restful operations on data related to the User_Texts table
function signinRoute(db, bcrypt, jwt) {
  let router = express.Router();
  router
  .route('/')
  .post(async(req, res) => {
    const { email, password } = req.body;
    if (!email || !password) { // validate inputs first
      return res.status(400).json('incorrect form submission');
    }
    try { //validate password with stored hash
      const data = await db
      .select('email', 'hash')
      .from('Login')
      .where('email', '=', email);
      const isValid = await bcrypt.compare(password, data[0].hash);
      if (isValid) {
        try {
          //get user info
          const knexUser = await db.select('id', 'name', 'created_at')
          .from('Users')
          .where('email', '=', email);
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
        }catch { res.status(500).json('Internal Error'); } // db failure 
      } else res.status(400).json('wrong credentials'); // wrong password
      
    }catch { res.status(400).json('wrong credentials');}
  });

  return router;
}

module.exports.signinRoute = signinRoute; 