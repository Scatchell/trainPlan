'use strict';
const https = require('https');
const TrainStatusParser = require('./src/TrainStatusParser').TrainStatusParser;
const StationData = require('./src/StationData').StationData;
const AWS = require('aws-sdk');

exports.handler = function (event, context, callback) {

    function stationUpdateSuccess(originStationCode, destinationStationCode) {
        callback(null, {"speech": "OK! I've set the origin to station code: " + originStationCode + ", and the destination to station code: " + destinationStationCode})
    }

    function timeUpdateSuccess(earlyTime, lateTime) {
        callback(null, {"speech": "OK! I've set the time range to between " + earlyTime + " and " + lateTime})
    }

    console.log("event result:");
    console.log(event);
    try {
        let intentName = event.result.metadata.intentName;

        AWS.config.update({region: 'eu-west-2'});
        let dynamodb = new AWS.DynamoDB.DocumentClient({apiVersion: '2012-10-08'});

        let stationData = StationData(dynamodb);
        if (intentName === "TrainLateIntent") {
            stationData.getStationDetails().then(
                function (stationDetails) {
                    respondWithTrainStatus({
                        origin: stationDetails.origin,
                        destination: stationDetails.destination,
                        earlyTime: stationDetails.earlyTime,
                        lateTime: stationDetails.lateTime
                    });
                }
            ).catch(function (err) {
                console.error("Unable to retrieve user details. Error JSON:", JSON.stringify(err, null, 2));
                callback(null, {"speech": "Sorry, something went wrong when retrieving your details. Try again!"})
            });
        } else if (intentName === "TrainSetUserTimeIntent") {
            let earlyTime = event.result.parameters.earlyTime;
            let lateTime = event.result.parameters.lateTime;

            try {
                stationData.createAndSaveTimeInformation(earlyTime, lateTime, timeUpdateSuccess);
            } catch (e) {
                console.log(e);
                //TODO must create time errors if any
            }
        } else if (intentName === "TrainSetUserRouteIntent") {
            let originStationName = event.result.parameters.originTrainStation;
            let destinationStationName = event.result.parameters.destinationTrainStation;

            try {
                stationData.createAndSaveStationInformation(originStationName, destinationStationName, stationUpdateSuccess);
            } catch (e) {
                if (e.id === "STATION_NOT_FOUND") {
                    callback(null, {"speech": "Sorry, the station name was not found, please try again!"});
                    console.error("Station name cannot be found. Error JSON:", JSON.stringify(e, null, 2));
                }
            }
        } else {
            callback(null, {"speech": "Sorry, I don't understand that. Try again!"})
        }
    } catch (e) {
        console.log(e);
        if (e instanceof TypeError) {
            callback(null, {"speech": "Sorry, something went wrong with the request! Maybe it was formatted incorrectly."});
        }
        callback(null, {"speech": "Sorry, something went wrong!"})
    }

    function respondWithTrainStatus(trainDetails) {
        const appId = process.env.APP_ID;
        const appKey = process.env.APP_KEY;

        const options = {
            host: 'transportapi.com',
            path: "/v3/uk/train/station/" + trainDetails.origin + "/live.json?app_id=" + appId + "&app_key=" + appKey + "&calling_at=" + trainDetails.destination + "&darwin=false&train_status=passenger"
        };

        const req = https.get(options, function (res) {
            let bodyChunks = [];
            res.on('data', function (chunk) {
                bodyChunks.push(chunk);
            }).on('end', function () {
                const body = Buffer.concat(bodyChunks);
                callback(null, {
                    "speech": TrainStatusParser().getTrainStatusFromResponse(body, {
                        earlyTime: trainDetails.earlyTime,
                        lateTime: trainDetails.lateTime
                    })
                });
            })
        });

        req.on('error', function (e) {
            console.error("Error in API request. Error JSON: ", JSON.stringify(e, null, 2));
        });
    }
};
