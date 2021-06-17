const express = require('express');
const app = express();
const knex = require('knex');
const cors = require('cors');
const bcrypt = require('bcryptjs');

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
app.use(express.json())


app.listen(3005, ()=>{
  console.log('app is running on port 3005');
})