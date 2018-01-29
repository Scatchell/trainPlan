"use strict";

exports.TrainStatusParser = function () {
    return {
        getTrainStatusFromResponse: function (responseBody) {
            // console.log('BODY: ' + responseBody);
            let transportApiJsonRes = JSON.parse(responseBody);

            let allDepartures = transportApiJsonRes.departures.all;

            let filteredDepartures = allDepartures.filter(function (departure) {
                return departure.aimed_departure_time === "07:34" || departure.aimed_departure_time === "08:07";
            });

            if (filteredDepartures.length === 0) {
                return "There are no trains currently running!";
            }

            let originalDepartureTime = filteredDepartures[0].aimed_departure_time;
            let actualDepartureTime = filteredDepartures[0].expected_departure_time;

            let response = "The train meant for: " + originalDepartureTime;
            if (originalDepartureTime === actualDepartureTime) {
                response += " is on time!"
            } else {
                response += " is actually arriving at " + actualDepartureTime;
            }
            return response;
        }
    };
};