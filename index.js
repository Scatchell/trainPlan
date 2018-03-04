'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const https = require('https');
const TrainStatus = require('./src/TrainStatus').TrainStatus;
const StationData = require('./src/StationData').StationData;
const AWS = require('aws-sdk');

exports.handler = function (event, context, callback) {
    let trainLateIntentAction = (() => {
        var _ref = _asyncToGenerator(function* (stationData) {
            let stationDetails;

            try {
                stationDetails = yield stationData.getStationDetails();
            } catch (err) {
                throw new Error("Unable to retrieve user details.", "RETRIEVE_USER_DETAILS_ERROR");
            }

            const trainStatus = TrainStatus();
            const success = function (body) {
                callback(null, {
                    "speech": trainStatus.fromResponse(body, {
                        earlyTime: stationDetails.earlyTime,
                        lateTime: stationDetails.lateTime
                    })
                });
            };

            trainStatus.respondWithTrainStatus({
                origin: stationDetails.origin,
                destination: stationDetails.destination,
                earlyTime: stationDetails.earlyTime,
                lateTime: stationDetails.lateTime
            }, https, success);
        });

        return function trainLateIntentAction(_x) {
            return _ref.apply(this, arguments);
        };
    })();

    function stationUpdateSuccess(originStationCode, destinationStationCode) {
        callback(null, { "speech": "OK! I've set the origin to station code: " + originStationCode + ", and the destination to station code: " + destinationStationCode });
    }

    function timeUpdateSuccess(earlyTime, lateTime) {
        callback(null, { "speech": "OK! I've set the time range to between " + earlyTime + " and " + lateTime });
    }

    console.log("event result:");
    console.log(event);

    function trainSetUserTimeAction(stationData, event) {
        let earlyTime = event.result.parameters.earlyTime;
        let lateTime = event.result.parameters.lateTime;

        try {
            stationData.createAndSaveTimeInformation(earlyTime, lateTime, timeUpdateSuccess);
        } catch (e) {
            throw new Error("Unable to set time.", "SET_USER_TIME_ERROR");
        }
    }

    function trainSetUserRouteIntent(stationData, event) {
        let originStationName = event.result.parameters.originTrainStation;
        let destinationStationName = event.result.parameters.destinationTrainStation;

        try {
            stationData.createAndSaveStationInformation(originStationName, destinationStationName, stationUpdateSuccess);
        } catch (e) {
            throw e;
        }
    }

    let intentName = event.result.metadata.intentName;

    AWS.config.update({ region: 'eu-west-2' });
    let dynamodb = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-10-08' });

    let stationData = StationData(dynamodb);

    const intentActions = {
        "TrainLateIntent": trainLateIntentAction,
        "TrainSetUserTimeIntent": trainSetUserTimeAction,
        "TrainSetUserRouteIntent": trainSetUserRouteIntent
    };

    try {
        intentActions[intentName](stationData, event);
    } catch (err) {
        console.error("Error: ", JSON.stringify(err, null, 2));
        callback(null, { "speech": "Sorry, something went wrong. Try again!" });
    }
};