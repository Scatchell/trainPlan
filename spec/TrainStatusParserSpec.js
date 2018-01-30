"use strict";
describe("TrainStatusParser", function () {
    var TrainStatusParser = require('../src/TrainStatusParser').TrainStatusParser;

    beforeEach(function () {
    });

    it("should be able to alert when the train is not late", function () {
        let trainJson = `{
                          "station_name": "Manchester Piccadilly",
                          "station_code": "MAN",
                          "departures": {
                            "all": [
                              {
                                "aimed_departure_time": "07:34",
                                "aimed_arrival_time": "23:05",
                                "expected_arrival_time": "23:06",
                                "expected_departure_time": "07:34"
                              }
                            ]
                          }
                        }`;

        expect(TrainStatusParser().getTrainStatusFromResponse(trainJson)).toEqual("The train meant for: 07:34 is on time!");
    });

    it("should be able to alert when the train IS late", function () {
        let trainJson = `{
                          "station_name": "Manchester Piccadilly",
                          "station_code": "MAN",
                          "departures": {
                            "all": [
                              {
                                "aimed_departure_time": "07:34",
                                "aimed_arrival_time": "23:05",
                                "expected_arrival_time": "07:35",
                                "expected_departure_time": "07:36"
                              }
                            ]
                          }
                        }`;

        expect(TrainStatusParser().getTrainStatusFromResponse(trainJson)).toEqual("The train meant for: 07:34 is actually arriving at 07:36");
    });

    it("should alert the user when no trains exist", function () {
        let trainJson = `{"date":"2018-01-29","time_of_day":"22:26","request_time":"2018-01-29T22:26:29+00:00","station_name":"Manchester Piccadilly","station_code":"MAN","departures":{"all":[]}}`;

        expect(TrainStatusParser().getTrainStatusFromResponse(trainJson)).toEqual("There are no trains currently running!");
    });

    it("should alert the user when no trains exist", function () {
        let trainJson = `{"date":"2018-01-29","time_of_day":"22:26","request_time":"2018-01-29T22:26:29+00:00","station_name":"Manchester Piccadilly","station_code":"MAN","departures":{"all":[]}}`;

        expect(TrainStatusParser().getTrainStatusFromResponse(trainJson)).toEqual("There are no trains currently running!");
    });

    it("should ignore trains not meant to leave at 7:34 or 8:07", function () {
        let trainJson = `{
                          "station_name": "Manchester Piccadilly",
                          "station_code": "MAN",
                          "departures": {
                            "all": [
                              {
                                "aimed_departure_time": "06:34",
                                "aimed_arrival_time": "06:34",
                                "expected_arrival_time": "07:34",
                                "expected_departure_time": "07:34"
                              }
                            ]
                          }
                        }`;

        expect(TrainStatusParser().getTrainStatusFromResponse(trainJson)).toEqual("There are no trains currently running!");
    });

    it("should tell the user about both trains if two are valid", function () {
        let trainJson = `{
                          "station_name": "Manchester Piccadilly",
                          "station_code": "MAN",
                          "departures": {
                            "all": [
                              {
                                "aimed_departure_time": "07:34",
                                "aimed_arrival_time": "23:05",
                                "expected_arrival_time": "07:35",
                                "expected_departure_time": "07:36"
                              },
                              {
                                "aimed_departure_time": "08:07",
                                "aimed_arrival_time": "23:05",
                                "expected_arrival_time": "23:06",
                                "expected_departure_time": "08:07"
                              }
                            ]
                          }
                        }`;

        expect(TrainStatusParser().getTrainStatusFromResponse(trainJson)).toEqual("The train meant for: 07:34 is actually arriving at 07:36, and the train meant for: 08:07 is on time!");
    });

});
