require('dotenv').config();
const jwt = require('jsonwebtoken');
function authenticateToken(req, res, next){
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // split token from bearer
  if (token == null) return res.sendStatus(401) //check for token

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.uId = user.user.id;//get user id for routes  
    next();
  })
}

module.exports.authenticateToken = authenticateToken; 