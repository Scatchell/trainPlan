"use strict";
const TrainStatus = require('../src/TrainStatus').TrainStatus;

describe("TrainStatus", function () {
    const NO_OP = () => {
    };
    describe("TrainStatus response conversion", function () {

        let filterDetails = {earlyTime: '07:00:00', lateTime: '09:00:00'};

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

            expect(TrainStatus().fromResponse(trainJson, filterDetails)).toEqual("The train meant for: 07:34 is on time!");
        });

        it("should respect the early and late time filters", function () {
            let filterDetails = {earlyTime: '09:00', lateTime: '10:00'};

            let trainJson = `{
                          "station_name": "Manchester Piccadilly",
                          "station_code": "MAN",
                          "departures": {
                            "all": [
                              {
                                "aimed_departure_time": "09:34",
                                "aimed_arrival_time": "23:05",
                                "expected_arrival_time": "23:06",
                                "expected_departure_time": "09:34"
                              }
                            ]
                          }
                        }`;

            expect(TrainStatus().fromResponse(trainJson, filterDetails)).toEqual("The train meant for: 09:34 is on time!");
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

            expect(TrainStatus().fromResponse(trainJson, filterDetails)).toEqual("The train meant for: 07:34 is actually arriving at 07:36");
        });

        it("should alert the user when no trains exist", function () {
            let trainJson = `{
                            "date": "2018-01-29",
                            "time_of_day": "22:26",
                            "request_time": "2018-01-29T22:26:29+00:00",
                            "station_name": "Manchester Piccadilly",
                            "station_code": "MAN",
                            "departures": {"all": []}
                        }`;

            expect(TrainStatus().fromResponse(trainJson, filterDetails)).toContain("There are no trains currently running");
        });

        describe("filtering time", function () {
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

            it("should ignore trains not aimed to leave within the set filterDetails time", function () {
                expect(TrainStatus().fromResponse(trainJson, filterDetails)).toEqual("There are no trains currently running between 7 and 9");
            });

            it("should format correctly for minutes", function () {
                let filterDetails = {earlyTime: '07:35:00', lateTime: '09:30:00'};

                expect(TrainStatus().fromResponse(trainJson, filterDetails)).toEqual("There are no trains currently running between 7:35 and 9:30");
            });
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

            expect(TrainStatus().fromResponse(trainJson, filterDetails)).toEqual("The train meant for: 07:34 is actually arriving at 07:36, and the train meant for: 08:07 is on time!");
        });
    });

    describe('transport API requests', function () {
        const originalEnv = Object.assign({}, process.env);
        let requesterSpy;

        beforeEach(() => {
            process.env.APP_ID = 'mock_app_id';
            process.env.APP_KEY = 'mock_app_key';

            requesterSpy = {
                get: () => {
                }
            };

            spyOn(requesterSpy, 'get').and.returnValue({
                on: () => {
                }
            });
        });

        it("should make request with correct details", function () {
            const trainDetails = {
                origin: "origin",
                destination: "destination",
                earlyTime: "earlyTime",
                lateTime: "lateTime"
            };

            const success = NO_OP;

            TrainStatus().respondWithTrainStatus(trainDetails, requesterSpy, success);
            const expectedRequest = {
                host: 'transportapi.com',
                path: '/v3/uk/train/station/origin/live.json?app_id=mock_app_id&app_key=mock_app_key&calling_at=' + trainDetails.destination + '&darwin=false&train_status=passenger'
            };
            expect(requesterSpy.get).toHaveBeenCalledWith(expectedRequest, jasmine.any(Function));
        });

        afterEach(() => {
            process.env = originalEnv;
        });
    });

});
