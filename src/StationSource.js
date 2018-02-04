"use strict";
const AWS = require('aws-sdk');

const STATION_INFO = {
    "Manchester Piccadilly": "MAN",
    "Piccadilly": "MAN"
};

exports.StationSource = function () {
    function stationCodeFrom(stationName) {
        return STATION_INFO[stationName];
    }

    return {
        createAndSaveToDynamo: function (stationName, success) {
            AWS.config.update({region: 'eu-west-2'});

            let dynamodb = new AWS.DynamoDB({apiVersion: '2012-10-08'});

            let stationCode = stationCodeFrom(stationName);
            var params = {
                TableName: 'UserData',
                Item: {
                    'UserId': {
                        S: '123'
                    },
                    'DestinationStation': {
                        S: stationCode
                    }
                }
            };

            dynamodb.putItem(params, function (err, data) {
                if (err) console.log(err, err.stack); // an error occurred
                else {
                    console.log(data);
                    success(stationCode);
                }
            });

        }
        };
}
    ;