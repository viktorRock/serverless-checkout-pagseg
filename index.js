'use strict';

const Buffer = require('safe-buffer').Buffer;
var request = require('request');
// Preparing auth header
const API_TOKEN = "d8b71b55b1aa3acf2e07bc17d1a3759a"
const auth = "Basic " + new Buffer(API_TOKEN + ":").toString("base64")
const chargeEndpoint = 'https://api.iugu.com/v1/charge'

// [START functions_helloworld_debug]
require('@google-cloud/debug-agent').start();
// [END functions_helloworld_debug]

/*
* Cloud Function.
*
* @param {object} event The Cloud Functions event.
* @param {function} callback The callback function.
*/
exports.helloWorld = function helloWorld (event, callback) {
	console.log(`My Cloud Function: ${event.data.message}`);
	callback();
};


/*
* HTTP Cloud Function.
*
* @param {Object} req Cloud Function request context.
* @param {Object} res Cloud Function response context.
*/
exports.getPagSeg = function getPagSeg (req, res) {
	res.send(`Ola ${req.body.name ||  'World'}!`);
};

/*
* HTTP Cloud Function.
*
* @param {Object} req Cloud Function request context.
* @param {Object} res Cloud Function response context.
*/
exports.iuguCheckoutGET = function iuguCheckoutGET (req, res) {
	console.log('gcloud functions  iuguCheckoutGET');
	var options = { 
		method: 'POST',
		headers: { 'Authorization' : auth },
		url: chargeEndpoint,
		form: req.body
	}

	if(oneClickPayValidation(req.body)){
		res = makeRequest(options);
		console.log('sending response');
		res.send(JSON.stringify(res.body));
	}else{
		res.status = 400
		res.body = {
			'message': 'Please pass a payment method id, a description, a price, a quantity and an email in the request body'
		}
		res.send(JSON.stringify(res.body));
	}
};



function oneClickPayValidation(body){
  // checking and preparing Iugu API parameters
  if (isNull(body.customer_payment_method_id) || isNull(body.email) || !validateItems(body.items)) {
  	console.log(body);
  	console.log("error on oneClickPayValidation");
  	return false;
  }
  return true;
}

function isNull(variable) {
	return variable == null;
}

function validateItems(items){
	if(!items){
		console.log("No items found");
		return false;
	}
	else if (isNull(items.description) || isNull(items.price_cents) || isNull(items.quantity)) {
		console.log("items elements error");
		return false;
	}
	return true;
}

function makeRequest(options){
	  // performing Iugu API request
	  console.log('makeRequest options: ' + options)
	  request(options, function (error, response, body) {
	  	console.log('makeRequest body: ' + body)

	  	if (error) throw new Error(error)

	  		var csuccess = getParam(JSON.parse(body), 'success')

	  	if (csuccess != true) {
	  		res.status = 500
	  		res.body = {
	  			message: 'Iugu response received, but contains errors',
	  			iuguresponse: body,
	  		}
	  		return res
	  	} else {
	  		res.status = 200
	  		res.body = {
	  			message: 'Iugu response received',
	  			iuguresponse: body,
	  		}
	  		return res
	  	}

	  })
	}