const express = require("express");
let router = express.Router();
const AWS = require('aws-sdk');
const keys = require('../config/config');

const BUCKET_NAME = keys.BUCKET_NAME;
const ACCESS_KEY_ID = keys.ACCESS_KEY_ID;
const SECRET_ACCESS_KEY = keys.SECRET_ACCESS_KEY;

router // grabs ${id}.json from AWS s3 using the AWS SDK
  .route('/:id')
  .get((req, res) => {
    const {id} = req.params;
    
    // Call to s3  
    (async function(){
      try{
        //set up
        AWS.config.setPromisesDependency();
        AWS.config.update({
          accessKeyId: ACCESS_KEY_ID,
          secretAccessKey: SECRET_ACCESS_KEY,
          region: 'us-east-1'
        });

        // instantiate and get
        const s3 = new AWS.S3();
        const response = await s3.getObject({
          Bucket: BUCKET_NAME,
          Key: `texts/${id}.json`
        }).promise();
        
        //buffer to json
        const textBuffer= response.Body; 
        const textJson = textBuffer.toString();
        
        res.status(200).json(textJson);

      }catch(e){
        console.log('error:', e);
        res.status(400).json(`Could not retrieve text ${id}`);
      }
    })();
  });
  

module.exports= router; 