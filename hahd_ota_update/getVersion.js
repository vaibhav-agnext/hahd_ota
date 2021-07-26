/**
 * Route: GET /note/n/{device_id}
 */

 const AWS = require('aws-sdk');
 AWS.config.update({ region: 'us-east-1' });
 
 const dynamodb = new AWS.DynamoDB.DocumentClient();
 const piUpdateTable = process.env.UPDATE_TABLE;
 
 
 exports.handler = async (event) => {
     try {
         let version = decodeURIComponent(event.pathParameters.version);
         
         let params = {
             TableName: piUpdateTable,
             IndexName: "gsi-version",
             KeyConditionExpression: "version = :version",
             ExpressionAttributeValues: {
                 ":version": version
             }
         };
 
         let data = await dynamodb.query(params).promise();
         if(data.Count == 0){
             
             return{
                 statusCode: 200,
                 headers: util.getResponseHeaders(),
                 body: JSON.stringify({Success: false,
                                       error:"No devices available"}),
             }
         }   
             return {
                 statusCode: 200,
                 headers: util.getResponseHeaders(),
                 body: JSON.stringify({Success: true,data:data})
             };
         
     } catch (err) {
         console.log("Error", err);
         return {
             statusCode: err.statusCode ? err.statusCode : 500,
             body: JSON.stringify({
                 error: err.name ? err.name : "Exception",
                 message: err.message ? err.message : "Unknown error"
             })
         };
     }
 }