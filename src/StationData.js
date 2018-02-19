"use strict";

var https = require('https');

exports.StationData = function (dynamodbDocClient) {
    var NO_OP = function NO_OP() {};

    function stationCodeFrom(stationName) {
        var appId = process.env.APP_ID;
        var appKey = process.env.APP_KEY;

        var options = {
            host: 'transportapi.com',
            path: encodeURI("/v3/uk/places.json?app_id=" + appId + "&app_key=" + appKey + "&query=" + stationName + "&type=train_station")
        };

        return new Promise(function (resolve, reject) {
            var req = https.get(options, function (res) {
                var bodyChunks = [];
                res.on('data', function (chunk) {
                    bodyChunks.push(chunk);
                }).on('end', function () {
                    var body = Buffer.concat(bodyChunks);
                    var transportApiJsonRes = JSON.parse(body);
                    console.log(transportApiJsonRes);

                    var results = transportApiJsonRes.member;
                    if (results.length === 1) {
                        resolve(results[0].station_code);
                    } else {
                        reject(Error("Multiple stations returned", "MULTIPLE_STATIONS_FOUND"));
                    }
                });
            });

            req.on('error', function (err) {
                console.error("Unable to retrieve station name. Error JSON:", JSON.stringify(err, null, 2));
                reject(Error(err));
            });
        });
    }

    return {
        getStationDetails: function getStationDetails() {
            var params = {
                TableName: 'userData',
                Key: {
                    'userId': '123'
                },
                AttributesToGet: ['originStation', 'destinationStation', 'earlyTime', 'lateTime']
            };

            return new Promise(function (resolve, reject) {
                dynamodbDocClient.get(params, NO_OP).on('success', function (response) {
                    var originStationCode = response.data.Item['originStation'];
                    var destStationCode = response.data.Item['destinationStation'];
                    var earlyTime = response.data.Item['earlyTime'];
                    var lateTime = response.data.Item['lateTime'];

                    resolve({
                        origin: originStationCode,
                        destination: destStationCode,
                        earlyTime: earlyTime,
                        lateTime: lateTime
                    });
                }).on('error', function (err) {
                    reject(Error(err));
                });
            });
        },
        createAndSaveStationInformation: function createAndSaveStationInformation(originStationName, destStationName, success) {
            stationCodeFrom(originStationName).then(function (originStationCodeResult) {
                stationCodeFrom(destStationName).then(function (destStationCodeResult) {
                    var originStationCode = originStationCodeResult;
                    var destStationCode = destStationCodeResult;

                    if (!originStationCode || !destStationCode) {
                        throw new Error("Station not found", "STATION_NOT_FOUND");
                    }

                    var params = {
                        TableName: 'userData',
                        Key: {
                            'userId': '123'
                        },
                        UpdateExpression: "set originStation = :originStation, destinationStation = :destinationStation",
                        ExpressionAttributeValues: {
                            ":originStation": originStationCode,
                            ":destinationStation": destStationCode
                        },
                        ReturnValues: "UPDATED_NEW"
                    };

                    dynamodbDocClient.update(params, function (err, data) {
                        if (err) {
                            console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
                        } else {
                            success(originStationCode, destStationCode);
                        }
                    });
                }).catch(function (err) {
                    console.error("Unable to retrieve station name. Error JSON:", JSON.stringify(err, null, 2));
                    throw new Error("Station not found", "STATION_NOT_FOUND");
                });
            }).catch(function (err) {
                console.error("Unable to retrieve station name. Error JSON:", JSON.stringify(err, null, 2));
                throw new Error("Station not found", "STATION_NOT_FOUND");
            });
        },
        createAndSaveTimeInformation: function createAndSaveTimeInformation(earlyTime, lateTime, success) {
            var params = {
                TableName: 'userData',
                Key: {
                    'userId': '123'
                },
                UpdateExpression: "set earlyTime = :earlyTime, lateTime = :lateTime",
                ExpressionAttributeValues: {
                    ":earlyTime": earlyTime,
                    ":lateTime": lateTime
                },
                ReturnValues: "UPDATED_NEW"
            };

            console.log("Updating the time...");
            dynamodbDocClient.update(params, function (err, data) {
                if (err) {
                    console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
                } else {
                    success(earlyTime, lateTime);
                }
            });
        }
    };
};