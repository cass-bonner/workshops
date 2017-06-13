var sleep = require('sleep-promise');

const AWS = require('aws-sdk');
AWS.config.update({
  region: "ap-southeast-2",
});

const stepfunctions = new AWS.StepFunctions();
const util = require('util');
const stateMachineArn = process.env.STATE_MACHINE_ARN;

exports.handler = (event, context, callback) => {
    const requestId = context.awsRequestId;

    console.log("Reading input from event:\n", util.inspect(event, {depth: 5}));
    
    const stateMachineExecutionParams = {
        stateMachineArn: stateMachineArn,
        input: JSON.stringify(event),
        name: requestId
    };

    var arn;
    var stateMachineStatus;
    var output;
    const executionArnPromise = new Promise((resolve, reject) => {

            stepfunctions.startExecution(stateMachineExecutionParams)
                .promise()
                .then(function (data) {
                    arn = data.executionArn;
                        var params = {
                          executionArn: arn
                        };
                        console.log("arn: " + arn);
                        console.log("params: " + JSON.stringify(params));
                                
                                var params = {
                                     executionArn: arn
                                 };
                                 
                                    const descPromiseRetry = new Promise((resolve,reject) => {
                                    console.log("Retrying desc execution.");
                                    stepfunctions.describeExecution(params, function(err, innerdata) {
                                      if (err) console.log(err, err.stack); // an error occurred
                                      else     console.log("de innerdata: " + JSON.stringify(innerdata));           // successful response
                                    }).promise().delay(1000)
                                    .then(function (innerdata) {
                                        stateMachineStatus = innerdata.status;
                                        output=innerdata.output;
                                        
                                        var i=1;
                                        var output;
                                        if (stateMachineStatus === 'SUCCEEDED') {
                                            callback(null,output);
                                        } else {
                                         
      
                                             sleep(2000).then(function() {


                                            console.log(i + " attempt while: stateMachineStatus: " + stateMachineStatus);
                                            i++;
                                            stepfunctions.describeExecution(params, function(err, retrydata) {
                                              if (err) console.log(err, err.stack); // an error occurred
                                              else     {
                                                  console.log("de retrydata: " + JSON.stringify(retrydata));
                                                  output=retrydata.output;
                                                  stateMachineStatus = retrydata.status;
                                                  }// successful response
                                            })
                                            
                                                console.log("Waited 1000 ms to try again.");
                                            });
                                            if (stateMachineStatus == 'SUCCEEDED' || i>10) {
                                                console.log("breaking:" + i);
                                                 console.log("stateMachineStatus:" + stateMachineStatus);
                                                callback(null,output);
                                                break;
                                            }
                                        
                                        resolve(data.output);
                                    }    
                                    })
                                    .catch(function (err) {
                                        reject(err);
                                    });
                                    })    
                                    

                                
                                
                    resolve(data);
                })
                .catch(function (err) {
                    reject(err);
                });
    })
    
    
    
    console.log("after while loop: " + output);

    

};

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}



