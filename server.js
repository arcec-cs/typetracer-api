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
const pgConfigSSL = {rejectUnauthorized: false};
//initialize connection to postgres db 'ink'
const db = knex({
  client: 'pg',
  connection: {
    connectionString: process.env.DATABASE_URL,
    ssl: pgConfigSSL,
  }
});

app.use(cors());
app.use(express.json());

app.use('/catalog', catalog.catalogRoutes(db));
app.use('/text', text);
app.use('/myTexts', authT.authenticateToken, myTexts.myTextsRoutes(db));
app.use('/register', register.registerRoute(db, bcrypt, jwt));
app.use('/signIn', signin.signinRoute(db, bcrypt, jwt));


app.listen(process.env.PORT, ()=>{
  console.log(`app is running on port ${process.env.PORT}`);
})