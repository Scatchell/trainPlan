"use strict";
const StationData = require('../src/StationData').StationData;

describe("TrainStatusParser", function () {
    const NO_OP = function () {
    };


    beforeEach(function () {
    });

    it("should map station names to station code in params", function () {

        let dynamodbMock = jasmine.createSpyObj('dynamodbMock', ['putItem']);

        StationData(dynamodbMock).createAndSaveStationCode("Manchester Piccadilly", "Liverpool South Parkway", NO_OP);

        let expectedParams = {
            TableName: 'UserData',
            Item: {
                'UserId': {
                    S: '123'
                },
                'OriginStation': {
                    S: "MAN"
                },
                'DestinationStation': {
                    S: "LPY"
                }
            }
        };

        expect(dynamodbMock.putItem).toHaveBeenCalledWith(expectedParams, jasmine.any(Function))
    });

    it("should not try to save if destination station code cannot be found", function () {
        let dynamodbMock = jasmine.createSpyObj('dynamodbMock', ['putItem']);

        expect(function () {
            StationData(dynamodbMock).createAndSaveStationCode("Manchester Piccadilly", "unknown", NO_OP);
        }).toThrowError("Station not found");

        expect(dynamodbMock.putItem).not.toHaveBeenCalled();
    });

    it("should not try to save if origin station code cannot be found", function () {
        let dynamodbMock = jasmine.createSpyObj('dynamodbMock', ['putItem']);

        expect(function () {
            StationData(dynamodbMock).createAndSaveStationCode("unknown", "Liverpool South Parkway", NO_OP);
        }).toThrowError("Station not found");

        expect(dynamodbMock.putItem).not.toHaveBeenCalled();
    });

});
