"use strict";
const moment = require('moment');

exports.TrainStatus = function () {
    const that = this;

    function between(departureTime, earlyTime, lateTime) {
        let earlyTimeLimit = moment.utc(earlyTime, "HH:mm");
        let lateTimeLimit = moment.utc(lateTime, "HH:mm");
        let aimedDepartureTime = moment.utc(departureTime, "HH:mm");

        return aimedDepartureTime.isAfter(earlyTimeLimit) && aimedDepartureTime.isBefore(lateTimeLimit);
    }

    function formatTime(earlyTimeString) {

        let earlyTime = moment.utc(earlyTimeString, "HH:mm:ss");
        let formatString = 'H';

        if (earlyTime.minutes() !== 0) {
            formatString = 'H:mm'
        }

        return earlyTime.format(formatString);
    }

    return {
        respondWithTrainStatus: (trainDetails, requester, success) => {
            const appId = process.env.APP_ID;
            const appKey = process.env.APP_KEY;

            const options = {
                host: 'transportapi.com',
                path: "/v3/uk/train/station/" + trainDetails.origin + "/live.json?app_id=" + appId + "&app_key=" + appKey + "&calling_at=" + trainDetails.destination + "&darwin=false&train_status=passenger"
            };

            return requester.get(options, function (res) {
                let bodyChunks = [];
                res.on('data', function (chunk) {
                    bodyChunks.push(chunk);
                }).on('end', function () {
                    const body = Buffer.concat(bodyChunks);
                    success(body);
                })
            });
        },
        fromResponse: (responseBody, filterDetails) => {
            let transportApiJsonRes = JSON.parse(responseBody);

            let allDepartures = transportApiJsonRes.departures.all;

            let earlyTime = filterDetails.earlyTime;
            let lateTime = filterDetails.lateTime;
            let filteredDepartures = allDepartures.filter(function (departure) {
                return between(departure.aimed_departure_time, earlyTime, lateTime);
            });

            if (filteredDepartures.length === 0) {
                return "There are no trains currently running between " + formatTime(earlyTime) + " and " + formatTime(lateTime);
            }

            let response = "";
            filteredDepartures.forEach(function (filteredDeparture, index) {
                let originalDepartureTime = filteredDeparture.aimed_departure_time;
                let actualDepartureTime = filteredDeparture.expected_departure_time;

                let prefixResponse = index === 0 ? "The train meant for: " : ", and the train meant for: ";
                response += prefixResponse + originalDepartureTime;
                if (originalDepartureTime === actualDepartureTime) {
                    response += " is on time!"
                } else {
                    response += " is actually arriving at " + actualDepartureTime;
                }
            });

            return response;
        }
    };
};