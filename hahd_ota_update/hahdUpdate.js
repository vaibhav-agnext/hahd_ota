const config = require('./config.js');
const AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const hahdUpdateTable = process.env.UPDATE_TABLE;
const moment = require('moment');
const _ = require('lodash');
const s3 = new AWS.S3({ region: 'us-east-1', signatureVersion: 'v4',});

exports.handler  = async(event)=>{
   try{
    let query = event.queryStringParameters;
    let s3FileName = query && query.file_name ?  _.trim(query.file_name,'\n') : "2-2-4.bin";
    let deviceId = query && query.device_id ? query.device_id : "device_id not present";
    let currentVersion = query && query.ota_version ? parseInt(query.ota_version) : config.prod_version; 
    let desiredVersion = currentVersion;
    console.log(`mac Addr is ${s3FileName}, device id is ${deviceId}, current Version is ${currentVersion}`);
    let inUpdateTable = {};  
    inUpdateTable.customer_name = "hahd";
    inUpdateTable.device_id = deviceId;
    inUpdateTable.current_version = currentVersion;
    inUpdateTable.timestamp = moment().format('MM/DD/YYYY HH:mm:ss');
    const bucket = "hahd-ota-bucket";
    const s3folderName = "hahd_ota";
    const s3key=`${s3folderName}/${s3FileName}`;
    
    let data = await dynamoDB.put({
        TableName: hahdUpdateTable,
        Item: inUpdateTable
    }).promise();

    for(var i =0; i<config.test_devices_list.length; i++){
        if(macAddr.toLowerCase() == config.test_devices_list[i]){ 
            console.log("test device");
            desiredVersion = config.test_version;
            try{
                const signedUrl = s3.getSignedUrl('putObject', {Bucket: bucket, Key: `${s3key}`,ContentType: 'application/octet-stream'});
                return{
                    statusCode: 302,
                    headers: {"Location": signedUrl}
                }
            }catch(err){
                return{
                    statusCode: err.statusCode ? err.statusCode : 500,
                    body: JSON.stringify({
                        error: err.name ? err.name : "Exception",
                        message: err.message ? err.message : "Unknown error"
                    })
                }    
            }
        }
    }


    for(var i =0; i<config.dev_devices_list.length; i++){
        if(macAddr.toLowerCase() == config.dev_devices_list[i]){ 
            console.log("dev device");
            desiredVersion = config.test_version;
            try{
                const signedUrl = s3.getSignedUrl('putObject', {Bucket: bucket, Key: `${s3key}`,});
                return{
                    statusCode: 302,
                    headers: {"Location": signedUrl}
                }
            }catch(err){
                return{
                    statusCode: err.statusCode ? err.statusCode : 500,
                    body: JSON.stringify({
                        error: err.name ? err.name : "Exception",
                        message: err.message ? err.message : "Unknown error"
                    })
                }    
            }
        }
    }
   


    console.log("prod device");
    desiredVersion = config.test_version;
    try{
        const signedUrl = s3.getSignedUrl('putObject', {Bucket: bucket, Key: `${s3key}`,});
        return{
            statusCode: 302,
            headers: {"Location": signedUrl}
        }
    }catch(err){
        return{
            statusCode: err.statusCode ? err.statusCode : 500,
            body: JSON.stringify({
                error: err.name ? err.name : "Exception",
                message: err.message ? err.message : "Unknown error"
            })
        }    
    }

   }catch(err){
    console.log("Error",err);
    return{
        statusCode: err.statusCode ? err.statusCode : 500,
        body: JSON.stringify({
            error: err.name ? err.name : "Exception",
            message: err.message ? err.message : "Unknown error"
        })
    }
   }
 }

