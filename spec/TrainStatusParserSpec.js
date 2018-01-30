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
        let trainJson = `{"date":"2018-01-29","time_of_day":"22:26","request_time":"2018-01-29T22:26:29+00:00","station_name":"Manchester Piccadilly","station_code":"MAN","departures":{"all":[{"mode":"train","service":"21731000","train_uid":"Y81771","platform":"14","operator":"TP","operator_name":"First TransPennine Express","aimed_departure_time":"06:34","aimed_arrival_time":"23:05","aimed_pass_time":null,"origin_name":"Newcastle","destination_name":"Liverpool Lime Street (High Level)","source":"Network Rail","category":"XX","service_timetable":{"id":"https://transportapi.com/v3/uk/train/service/train_uid:Y81771/2018-01-29/timetable.json?app_id=f3857c5d&app_key=353694b8cadf984328fd5eff095f60a9&live=true"},"status":"LATE","expected_arrival_time":"23:06","expected_departure_time":"07:34","best_arrival_estimate_mins":39,"best_departure_estimate_mins":41}]}}`;

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
