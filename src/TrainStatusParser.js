"use strict";

var moment = require('moment');

exports.TrainStatusParser = function () {
    function between(departureTime, earlyTime, lateTime) {
        var earlyTimeLimit = moment.utc(earlyTime, "HH:mm");
        var lateTimeLimit = moment.utc(lateTime, "HH:mm");
        var aimedDepartureTime = moment.utc(departureTime, "HH:mm");

        return aimedDepartureTime.isAfter(earlyTimeLimit) && aimedDepartureTime.isBefore(lateTimeLimit);
    }

    function formatTime(earlyTimeString) {

        var earlyTime = moment.utc(earlyTimeString, "HH:mm:ss");
        var formatString = 'H';

        if (earlyTime.minutes() !== 0) {
            formatString = 'H:mm';
        }

        return earlyTime.format(formatString);
    }

    return {
        getTrainStatusFromResponse: function getTrainStatusFromResponse(responseBody, filterDetails) {
            var transportApiJsonRes = JSON.parse(responseBody);

            var allDepartures = transportApiJsonRes.departures.all;

            var earlyTime = filterDetails.earlyTime;
            var lateTime = filterDetails.lateTime;
            var filteredDepartures = allDepartures.filter(function (departure) {
                return between(departure.aimed_departure_time, earlyTime, lateTime);
            });

            if (filteredDepartures.length === 0) {
                return "There are no trains currently running between " + formatTime(earlyTime) + " and " + formatTime(lateTime);
            }

            var response = "";
            filteredDepartures.forEach(function (filteredDeparture, index) {
                var originalDepartureTime = filteredDeparture.aimed_departure_time;
                var actualDepartureTime = filteredDeparture.expected_departure_time;

                var prefixResponse = index === 0 ? "The train meant for: " : ", and the train meant for: ";
                response += prefixResponse + originalDepartureTime;
                if (originalDepartureTime === actualDepartureTime) {
                    response += " is on time!";
                } else {
                    response += " is actually arriving at " + actualDepartureTime;
                }
            });

            return response;
        }
    };
};