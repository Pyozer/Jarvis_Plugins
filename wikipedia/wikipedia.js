var ScribeSpeak;
var token;
var TIME_ELAPSED;
var FULL_RECO;
var PARTIAL_RECO;
var TIMEOUT_SEC = 10000;

exports.init = function () {
    info('[ Wikipedia ] is initializing ...');
}

exports.action = function(data, callback){
	
	ScribeSpeak = SARAH.ScribeSpeak;

	FULL_RECO = SARAH.context.scribe.FULL_RECO;
	PARTIAL_RECO = SARAH.context.scribe.PARTIAL_RECO;
	TIME_ELAPSED = SARAH.context.scribe.TIME_ELAPSED;

	SARAH.context.scribe.activePlugin('Wikipedia');

	var util = require('util');
	console.log("Wikipedia call log: " + util.inspect(data, { showHidden: true, depth: null }));

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
			SARAH.context.scribe.activePlugin('Aucun (Wikipedia)');
			ScribeSpeak("Désolé je n'ai pas compris. Merci de réessayer.", true);
			return callback();
		}
	} else {
		// pas traité
	}
}

function decodeScribe(search, callback) {
	
	console.log ("Search: " + search);
	// data.dictation returne toute la phrase dite par l'utilisateur
	var rgxp = /(définit le mot|définir le mot|recherche|cherche|tu peux définir le mot|définition de) (.+)/i;

	// on s'assure que Google a bien compris
	var match = search.match(rgxp);
	if (!match || match.length <= 1){
		console.log("FAIL");
		ScribeSpeak("Je ne comprends pas");
		callback();
		return;
	}

	// on peut maintenant s'occuper des mots qui sont recherchés
	search = match[2];
	return Wiki(search, callback);
}

function Wiki(search, callback){

	var fs = require("fs");
	var path = require('path');
 	var filePath = __dirname + "/SaveInfos.json";
	var file_content;

	file_content = fs.readFileSync(filePath, 'utf8');
	file_content = JSON.parse(file_content);

	if(typeof file_content[search] != 'undefined' && file_content[search] != "") {
		var infos = file_content[search];
		console.log("Informations: " + infos);
		ScribeSpeak(infos);
		callback();
		return;

	} else {
		var url = 'https://fr.wikipedia.org/w/api.php?action=query&prop=extracts&exintro&titles=' + search + '&format=json';
		var request = require('request');
		request({ 'uri' : url, 'json' : true }, function (err, response, body) {
			
		    if (err || response.statusCode != 200) {
				ScribeSpeak("L'action a échoué. Erreur " + response.statusCode);
				callback();
				return;
		    }
		    
		    var txt = '';
		    var extract = getFirst(body.query.pages).extract;
			
			if(!extract) {
				ScribeSpeak("Je n'ai rien trouvé sur Wikipédia pour " + search);
				callback();
				return;
			}
			// On supprime les balises html
			var list = extract.replace(/<\/?[a-z][a-z0-9]*[^<>]*>/img,'*').split('*');
		    for(i = 0;i < list.length;i++) {
		    	txt = txt + list[i];
		    }
		    txt = txt.split('. ')[0] + '.';

		    if(txt.length < 1) {
		    	ScribeSpeak("L'action a échoué");
		    	callback();
		    } else {
		    	file_content[search] = txt;
	        	chaine = JSON.stringify(file_content, null, '\t');
				fs.writeFile(filePath, chaine, function (err) {
					console.log("[ Wikipedia ] Informations enregistrés");
				});

		    	console.log('Résultat: ' + txt);
		    	ScribeSpeak(txt);
		    	callback();
		    }
		    return;
		});
	}
}

function getFirst(obj){
	return obj[Object.keys(obj)[0]];
}