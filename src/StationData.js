"use strict";

const STATION_INFO = {
    "Manchester Piccadilly": "MAN",
    "Piccadilly": "MAN",
    "Liverpool South Parkway": "LPY",
    "South Parkway": "LPY"
};

exports.StationData = function (dynamodb) {
    const NO_OP = function () {
    };

    function stationCodeFrom(stationName) {
        return STATION_INFO[stationName];
    }

    return {
        getStationCodes: function () {
            const params = {
                TableName: 'UserData',
                Key: {
                    'UserId': {S: '123'},
                },
                ProjectionExpression: 'OriginStation, DestinationStation'
            };

            return new Promise(function (resolve, reject) {
                dynamodb.getItem(params, NO_OP).on('success', function (response) {
                    let originStationCode = response.data.Item['OriginStation']['S'];
                    let destStationCode = response.data.Item['DestinationStation']['S'];
                    resolve({origin: originStationCode, destination: destStationCode});
                }).on('error', function (err) {
                    reject(Error(err));
                });
            });
        },
        createAndSaveStationCode: function (originStationName, destStationName, success) {
            const originStationCode = stationCodeFrom(originStationName);
            const destStationCode = stationCodeFrom(destStationName);

            if (!originStationCode || !destStationCode) {
                throw new Error("Station not found", "STATION_NOT_FOUND");
            }

            const params = {
                TableName: 'UserData',
                Item: {
                    'UserId': {
                        S: '123'
                    },
                    'OriginStation': {
                        S: originStationCode
                    },
                    'DestinationStation': {
                        S: destStationCode
                    }
                }
            };

            dynamodb.putItem(params, function (err, data) {
                if (err) console.log(err, err.stack); // an error occurred
                else {
                    success(originStationCode, destStationCode);
                }
            });

        }
    };
}
;