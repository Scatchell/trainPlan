'use strict';
const https = require('https');
const TrainStatusParser = require('./src/TrainStatusParser').TrainStatusParser;
const StationData = require('./src/StationData').StationData;
const AWS = require('aws-sdk');

exports.handler = function (event, context, callback) {

    function success(stationCode) {
        callback(null, {"speech": "OK! I've set the origin station to station code: " + stationCode})
    }

    console.log("event result:");
    console.log(event);
    try {
        let intentName = event.result.metadata.intentName;

        AWS.config.update({region: 'eu-west-2'});
        let dynamodb = new AWS.DynamoDB({apiVersion: '2012-10-08'});

        let stationData = StationData(dynamodb);
        if (intentName === "TrainLateIntent") {
            stationData.getStationCode().then(
                function (stationCode) {
                    respondWithTrainStatus(stationCode);
                }
            );
        } else if (intentName === "TrainSetUserRouteIntent") {
            let originStationName = event.result.parameters.originTrainStation;
            // let destinationStationName = event.result.parameters.destinationTrainStation;

            try {
                stationData.createAndSaveStationCode(originStationName, destinationStationName, success);
            } catch (e) {
                console.log(e);
                if (e.id === "STATION_NOT_FOUND") {
                    callback(null, {"speech": "Sorry, the station name was not found, please try again!"});
                    console.log("station not found");
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

    function respondWithTrainStatus(stationCode) {
        const appId = process.env.APP_ID;
        const appKey = process.env.APP_KEY;

        const options = {
            host: 'transportapi.com',
            path: "/v3/uk/train/station/" + stationCode + "/live.json?app_id=" + appId + "&app_key=" + appKey + "&calling_at=LPY&darwin=false&train_status=passenger"
        };

        const req = https.get(options, function (res) {
            let bodyChunks = [];
            res.on('data', function (chunk) {
                bodyChunks.push(chunk);
            }).on('end', function () {
                const body = Buffer.concat(bodyChunks);
                callback(null, {"speech": TrainStatusParser().getTrainStatusFromResponse(body)});
            })
        });

        req.on('error', function (e) {
            console.log('ERROR IN API REQUEST: ' + e.message);
        });
    }
};
