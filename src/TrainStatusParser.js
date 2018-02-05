"use strict";
const moment = require('moment')

exports.TrainStatusParser = function () {
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
        getTrainStatusFromResponse: function (responseBody, filterDetails) {
            console.log('BODY: ' + responseBody);
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