import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';

export interface HitCounterProps {
    downstream: lambda.IFunction;
}

export class HitCounter extends Construct {
    // all accessing the counter function
    public readonly handler: lambda.Function;

    // hit counter table
    public readonly table: dynamodb.Table;


    constructor(scope: Construct, id: string, props: HitCounterProps) {
        super(scope, id);

        // create the dynamo db table with a name of hits and partition it by the string path
        const table = new dynamodb.Table(this, 'Hits', {
            partitionKey: {name: 'path', type: dynamodb.AttributeType.STRING}
        });
        this.table = table;  // make the table accessible to our stack: (cdk-workshop-stack)

        this.handler = new lambda.Function(this, 'HitsCounterHandler', {
            runtime: lambda.Runtime.NODEJS_14_X,
            handler: 'hitcounter.handler', // lambda/hitcounter.js
            code: lambda.Code.fromAsset('lambda'),
            environment: { // wire the Lambda’s environment variables to the functionName and tableName of our resources
                DOWNSTREAM_FUNCTION_NAME: props.downstream.functionName,
                HITS_TABLE_NAME: table.tableName
            }
        });

        // grant lambda role to read/write permissions to our table
        table.grantReadWriteData(this.handler);

        // the lambda hit counter needs access to invoke the other lambda 'hello'
        props.downstream.grantInvoke(this.handler);
    }
}