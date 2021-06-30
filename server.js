require('dotenv').config();
const express = require('express');
const app = express();
const knex = require('knex');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const catalog = require('./routes/catalog');
const text = require('./routes/text');
const myTexts = require('./routes/myTexts');
const register = require('./routes/register');
const signin = require('./routes/signIn');
const authT = require('./auth/authenticateToken')

//initialize connection to postgres db 'ink'
const db = knex({
  client: 'pg',
  connection: {
    host : '127.0.0.1',
    user : 'postgres',
    password : 'test',
    database : 'typetracer'
  }
});

app.use(cors());
app.use(express.json());

app.use('/catalog', catalog.catalogRoutes(db));
app.use('/text', text);
app.use('/myTexts', authT.authenticateToken, myTexts.myTextsRoutes(db));
app.use('/register', register.registerRoute(db, bcrypt, jwt));
app.use('/signIn', signin.signinRoute(db, bcrypt, jwt));


app.listen(3005, ()=>{
  console.log('app is running on port 3005');
})

// function authToken(req, res, next){
//   const authHeader = req.headers['authorization']
//   const token = authHeader && authHeader.split(' ')[1]
//   if (token == null) return res.sendStatus(401)

//   jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
//     console.log(err)
//     if (err) return res.sendStatus(403)
//     req.user = user
//     next()
//   })
// }