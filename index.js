'use strict';
let http = require('http');
let starWarsAPI = `www.swapi.co`;

exports.handler = function(event, context, callback) {

	console.log("event result:" );
	console.log(event);
	try {
		let intentName = event.result.metadata.intentName

		if(intentName === "TrainLateIntent") {
			callback(null, {"speech": "You'll be fine!"})
		} else {
			callback(null, {"speech": "Sorry, I don't understand that. Try again!"})
		}
	} catch (e) {
		if(e instanceof TypeError) {
			callback(null, {"speech": "Sorry, something went wrong with the request! Maybe it was formatted incorrectly."});
		}
		callback(null, {"speech": "Sorry, something went wrong!"})
	}
}

//let options = searchPeopleRequestOptions(firstName, lastName);

//   makeRequest(options, function( data, error) {
//     let person = data.results[0];
//     if (person) {
//         let height = person.height;
//         let response = person.name + " is " + height + " centimeters tall.";
//         callback(null, {"speech": response});
//     }
//     else {
//         callback(null, {"speech": "I'm not sure!"});
//     }
//   });

function searchPeopleRequestOptions(firstName, lastName) {
	return {
		host: starWarsAPI,
		path: `/api/people/?search=`+firstName+'+'+lastName
	};
}

function makeRequest(options, callback) {
	var request = http.request(options,
		function(response) {
			var responseString = '';
			response.on('data', function(data) {
				responseString += data;
			});
			response.on('end', function() {
				var responseJSON = JSON.parse(responseString);
				callback(responseJSON, null);
			});
		});
	request.end();
}
