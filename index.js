'use strict';
const https = require('https');

exports.handler = function (event, context, callback) {

    console.log("event result:");
    console.log(event);
    try {
        let intentName = event.result.metadata.intentName;

        console.log('intentName: ' + intentName);
        if (intentName === "TrainLateIntent") {
            respondWithTrainStatus();
        } else {
            callback(null, {"speech": "Sorry, I don't understand that. Try again!"})
        }
    } catch (e) {
        if (e instanceof TypeError) {
            callback(null, {"speech": "Sorry, something went wrong with the request! Maybe it was formatted incorrectly."});
        }
        callback(null, {"speech": "Sorry, something went wrong!"})
    }

    function respondWithTrainStatus() {

        function getTrainStatusFromResponse(responseBody) {
            console.log('BODY: ' + responseBody);
            let transportApiJsonRes = JSON.parse(responseBody);

            let originalDepartureTime = transportApiJsonRes.departures.all[0].aimed_departure_time;
            let actualDepartureTime = transportApiJsonRes.departures.all[0].expected_departure_time;
            return "The train meant for: " + originalDepartureTime + " is actually arriving at " + actualDepartureTime;
        }




        const appId = process.env.APP_ID;
        const appKey = process.env.APP_KEY;
        const options = {
            host: 'transportapi.com',
            path: "/v3/uk/train/station/MAN/live.json?app_id=" + appId + "&app_key=" + appKey + "&calling_at=LPY&darwin=false&train_status=passenger"
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
                callback(null, {"speech": getTrainStatusFromResponse(body)});
            })
        });

        req.on('error', function (e) {
            console.log('ERROR: ' + e.message);
        });
    }
};
