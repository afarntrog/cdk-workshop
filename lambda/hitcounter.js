const { DynamoDB, Lambda } = require('aws-sdk');

exports.handler = async function (event) {
    console.log("request:", JSON.stringify(event, undefined, 2));

    // create the AWS SDK clients
    const dynamo = new DynamoDB();
    const lambda = new Lambda();

    // update dynamo db for 'path' with hits++
    await dynamo.updateItem({
        TableName: process.env.HITS_TABLE_NAME,
        Key: {path: {S: event.path } },
        UpdateExpression: 'ADD hists :incr',
        ExpressionAttributeValues: { ':incr': { N: '1' } }
    }).promise();

    // call the downstream lambda function and process the response
    const resp = await lambda.invoke({
        FunctionName: process.env.DOWNSTREAM_FUNCTION_NAME,  // this lambda needs permissions to invoke the other lambda
        Payload: JSON.stringify(event)
    }).promise();

    console.log('downstream response: ', JSON.stringify(resp, undefined, 2));

    // return the response to the upstream caller
    return JSON.parse(resp.Payload);
};