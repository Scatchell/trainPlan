"use strict";

const STATION_INFO = {
    "Manchester Piccadilly": "MAN",
    "Piccadilly": "MAN",
    "Liverpool South Parkway": "LPY",
    "South Parkway": "LPY",
    "Wilmslow": "WML",

    "Altrincham": "ALT",
    "Ardwick": "ADK",
    "Ashburys": "ABY",
    "Ashton-under-Lyne": "AHN",
    "Atherton": "ATN",
    "Belle Vue": "BLV",
    "Blackrod": "BLK",
    "Bolton": "BON",
    "Bramhall": "BML",
    "Bredbury": "BDY",
    "Brinnington": "BNT",
    "Broadbottom": "BDB",
    "Bromley Cross": "BMC",
    "Bryn": "BYN",
    "Burnage": "BNA",
    "Castleton": "CAS",
    "Chassen Road": "CSR",
    "Cheadle Hulme": "CHU",
    "Clifton": "CLI",
    "Daisy Hill": "DSY",
    "Davenport": "DVN",
    "Deansgate": "DGT",
    "Denton": "DTN",
    "East Didsbury": "EDY",
    "Eccles": "ECC",
    "Fairfield": "FRF",
    "Farnworth": "FNW",
    "Flixton": "FLI",
    "Flowery Field": "FLF",
    "Gathurst": "GST",
    "Gatley": "GTY",
    "Godley": "GDL",
    "Gorton": "GTO",
    "Greenfield": "GNF",
    "Guide Bridge": "GUI",
    "Hag Fold": "HGF",
    "Hale": "HAL",
    "Hall i' th' Wood": "HID",
    "Hattersley": "HTY",
    "Hazel Grove": "HAZ",
    "Heald Green": "HDG",
    "Heaton Chapel": "HTC",
    "Hindley": "HIN",
    "Horwich Parkway": "HWI",
    "Humphrey Park": "HUP",
    "Hyde Central": "HYC",
    "Hyde North": "HYT",
    "Ince": "INC",
    "Irlam": "IRL",
    "Kearsley": "KSL",
    "Levenshulme": "LVM",
    "Littleborough": "LTL",
    "Lostock": "LOT",
    "Manchester Airport": "MIA",
    "Manchester Oxford Road": "MCO",
    "Manchester United": "MUF",
    "Marple": "MPL",
    "Mauldeth Road": "MAU",
    "Middlewood": "MDL",
    "Mills Hill": "MIH",
    "Moorside": "MSD",
    "Moses Gate": "MSS",
    "Mossley": "MSL",
    "Moston": "MSO",
    "Navigation Road": "NVR",
    "Newton for Hyde": "NWN",
    "Orrell": "ORR",
    "Patricroft": "PAT",
    "Pemberton": "PEM",
    "Reddish North": "RDN",
    "Reddish South": "RDS",
    "Rochdale": "RCD",
    "Romiley": "RML",
    "Rose Hill Marple": "RSH",
    "Ryder Brow": "RRB",
    "Salford Central": "SFD",
    "Salford Crescent": "SLD",
    "Smithy Bridge": "SMB",
    "Stalybridge": "SYB",
    "Stockport": "SPT",
    "Strines": "SRN",
    "Swinton": "SNN",
    "Trafford Park": "TRA",
    "Urmston": "URM",
    "Walkden": "WKD",
    "Westhoughton": "WHG",
    "Wigan North Western": "WGN",
    "Wigan Wallgate": "WGW",
    "Woodley": "WLY",
    "Woodsmoor": "WSR",
};

exports.StationData = function (dynamodbDocClient) {
    const NO_OP = function () {
    };

    function stationCodeFrom(stationName) {
        return STATION_INFO[stationName];
    }

    return {
        getStationDetails: function () {
            const params = {
                TableName: 'userData',
                Key: {
                    'userId': '123',
                },
                AttributesToGet: ['originStation', 'destinationStation', 'earlyTime', 'lateTime']
            };

            return new Promise(function (resolve, reject) {
                dynamodbDocClient.get(params, NO_OP).on('success', function (response) {
                    let originStationCode = response.data.Item['originStation'];
                    let destStationCode = response.data.Item['destinationStation'];
                    let earlyTime = response.data.Item['earlyTime'];
                    let lateTime = response.data.Item['lateTime'];

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
        createAndSaveStationInformation: function (originStationName, destStationName, success) {
            const originStationCode = stationCodeFrom(originStationName);
            const destStationCode = stationCodeFrom(destStationName);

            if (!originStationCode || !destStationCode) {
                throw new Error("Station not found", "STATION_NOT_FOUND");
            }

            const params = {
                TableName: 'userData',
                Key: {
                    'userId': '123'
                },
                UpdateExpression: "set originStation = :originStation, destinationStation = :destinationStation",
                ExpressionAttributeValues: {
                    ":originStation": originStationCode,
                    ":destinationStation": destStationCode
                },
                ReturnValues: "UPDATED_NEW",
            };

            dynamodbDocClient.update(params, function (err, data) {
                if (err) {
                    console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
                }
                else {
                    success(originStationCode, destStationCode);
                }
            });

        },
        createAndSaveTimeInformation: function (earlyTime, lateTime, success) {
            const params = {
                TableName: 'userData',
                Key: {
                    'userId': '123'
                },
                UpdateExpression: "set earlyTime = :earlyTime, lateTime = :lateTime",
                ExpressionAttributeValues: {
                    ":earlyTime": earlyTime,
                    ":lateTime": lateTime
                },
                ReturnValues: "UPDATED_NEW",
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
}
;