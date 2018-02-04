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

    AWS.config.update({region: 'eu-west-2'});
    let dynamodb = new AWS.DynamoDB({apiVersion: '2012-10-08'});

    return {
        getStationCode: function (success) {
            const params = {
                TableName: 'UserData',
                Key: {
                    'UserId': {S: '123'},
                },
                ProjectionExpression: 'DestinationStation'
            };

            dynamodb.getItem(params, function (err, data) {
                if (err) {
                    console.log("Error", err);
                } else {
                    console.log("Success", data.Item);
                }
            }, function () {
            }).on('success', function (response) {
                let destStationCode = response.data.Item['DestinationStation']['S'];
                success(destStationCode);
            }).on('error', function (err) {
                throw err;
            });
        },
        createAndSaveStationCode: function (stationName, success) {
            const stationCode = stationCodeFrom(stationName);
            const params = {
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