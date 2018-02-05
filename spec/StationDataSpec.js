"use strict";
const StationData = require('../src/StationData').StationData;

describe("TrainStatusParser", function () {
    const NO_OP = function () {
    };

    let expectedParams;
    let dynamodbMock;

    beforeEach(function () {
        expectedParams = {
            TableName: 'userData',
            Key: {
                'userId': '123'
            },
            UpdateExpression: "set originStation = :originStation, destinationStation = :destinationStation",
            ExpressionAttributeValues: {
                ":originStation": 'MAN',
                ":destinationStation": 'LPY'
            },
            ReturnValues: "UPDATED_NEW",
        };

        dynamodbMock = jasmine.createSpyObj('dynamodbMock', ['update', 'getItem']);
    });

    it("should map station names to station code in params", function () {
        StationData(dynamodbMock).createAndSaveStationInformation("Manchester Piccadilly", "Liverpool South Parkway", NO_OP);

        expect(dynamodbMock.update).toHaveBeenCalledWith(expectedParams, jasmine.any(Function))
    });

    it("should not try to save if destination station code cannot be found", function () {
        expect(function () {
            StationData(dynamodbMock).createAndSaveStationInformation("Manchester Piccadilly", "unknown", NO_OP);
        }).toThrowError("Station not found");

        expect(dynamodbMock.update).not.toHaveBeenCalled();
    });

    it("should not try to save if origin station code cannot be found", function () {
        expect(function () {
            StationData(dynamodbMock).createAndSaveStationInformation("unknown", "Liverpool South Parkway", NO_OP);
        }).toThrowError("Station not found");

        expect(dynamodbMock.update).not.toHaveBeenCalled();
    });

    //todo figure out a way to test this (extract implementation function into helper?)
    // fit("should get station details", function (done) {
    //     StationData(dynamodbMock).getStationDetails().then(
    //         function (stationDetails) {
    //             expect(stationDetails).toEqual({});
    //             done();
    //         }
    //     );
    // })

});
