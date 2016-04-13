var ScribeSpeak;
var token;
var TIME_ELAPSED;
var FULL_RECO;
var PARTIAL_RECO;
var TIMEOUT_SEC = 10000;

exports.init = function () {
    info('[ DitBonjourA ] is initializing ...');
}

exports.action = function(data, callback){

	ScribeSpeak = SARAH.ScribeSpeak;

	FULL_RECO = SARAH.context.scribe.FULL_RECO;
	PARTIAL_RECO = SARAH.context.scribe.PARTIAL_RECO;
	TIME_ELAPSED = SARAH.context.scribe.TIME_ELAPSED;

	SARAH.context.scribe.activePlugin('DitBonjourA');

	var util = require('util');
	console.log("DitBonjourA call log: " + util.inspect(data, { showHidden: true, depth: null }));

	SARAH.context.scribe.hook = function(event) {
		checkScribe(event, data.action, callback); 
	};

	token = setTimeout(function(){
		SARAH.context.scribe.hook("TIME_ELAPSED");
	}, TIMEOUT_SEC);
}

function checkScribe(event, action, callback) {

	if (event == FULL_RECO) {
		clearTimeout(token);
		SARAH.context.scribe.hook = undefined;
		// aurait-on trouvé ?
		decodeScribe(SARAH.context.scribe.lastReco, callback);

	} else if(event == TIME_ELAPSED) {
		// timeout !
		SARAH.context.scribe.hook = undefined;
		// aurait-on compris autre chose ?
		if (SARAH.context.scribe.lastPartialConfidence >= 0.7 && SARAH.context.scribe.compteurPartial > SARAH.context.scribe.compteur) {
			decodeScribe(SARAH.context.scribe.lastPartial, callback);
		} else {
			SARAH.context.scribe.activePlugin('Aucun (DitBonjourA)');
			//ScribeSpeak("Désolé je n'ai pas compris. Merci de réessayer.", true);
			return callback({ 'tts': "Désolé je n'ai pas compris. Merci de réessayer." });
		}
	} else {
		// pas traité
	}
}

function decodeScribe(search, callback) {

	console.log("Search: " + search);
	var rgxp = /(dit|dis|dire) bonjour (à|a|aux|au) (.+)/i;
	var match = search.match(rgxp);

	if (!match || match.length <= 1){
		console.log("FAIL");
		//ScribeSpeak("Je ne comprends pas");
		callback({ 'tts': "Je ne comprends pas" });
		return;
	}

	var determinant = match[2];
	var person = match[3];
	return tellhello(callback, determinant, person);
}

function tellhello(callback, determinant, person) {

	if(determinant == "aux" || determinant == "au") {
		var prefix = "les ";
	} else {
		var prefix = "";
	}

	//ScribeSpeak("Bonjour " + prefix + person);
	callback({ 'tts': "Bonjour " + prefix + person });
	return;
}