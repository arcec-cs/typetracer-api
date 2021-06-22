const express = require('express');
const app = express();
const knex = require('knex');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const catalog = require('./routes/catalog');
const text = require('./routes/text');
const myTexts = require('./routes/myTexts');
const register = require('./routes/register');
const signin = require('./routes/signIn');

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
app.use('/myTexts', myTexts.myTextsRoutes(db));
app.use('/register', register.registerRoute(db, bcrypt));
app.use('/signIn', signin.signinRoute(db, bcrypt));


app.listen(3005, ()=>{
  console.log('app is running on port 3005');
})