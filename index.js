'use strict';
const https = require('https');
const TrainStatusParser = require('./src/TrainStatusParser').TrainStatusParser;
const StationSource = require('./src/StationSource').StationSource;

exports.handler = function (event, context, callback) {

    function success(stationCode) {
        callback(null, {"speech": "OK! I've set the origin station to station code: " + stationCode})
    }

    console.log("event result:");
    console.log(event);
    try {
        let intentName = event.result.metadata.intentName;

        console.log('intentName: ' + intentName);
        if (intentName === "TrainLateIntent") {
            StationSource().getStationCode().then(
                function (stationCode) {
                    respondWithTrainStatus(stationCode);
                }
            );
        } else if (intentName === "TrainSetUserRouteIntent") {
            let stationName = event.result.parameters.originTrainStation;
            StationSource().createAndSaveStationCode(stationName, success);
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
            console.log('STATUS: ' + res.statusCode);

            // Buffer the body entirely for processing as a whole.
            let bodyChunks = [];
            res.on('data', function (chunk) {
                // You can process streamed parts here...
                bodyChunks.push(chunk);
            }).on('end', function () {
                const body = Buffer.concat(bodyChunks);
                callback(null, {"speech": TrainStatusParser().getTrainStatusFromResponse(body)});
            })
        });

        req.on('error', function (e) {
            console.log('ERROR: ' + e.message);
        });
    }
};
