var ScribeSpeak;
var token;
var TIME_ELAPSED;
var FULL_RECO;
var PARTIAL_RECO;
var TIMEOUT_SEC = 10000;
// Pour executer des programmes
var exec = require('child_process').exec;

exports.init = function () {
    info('[ WebSearch ] is initializing ...');
}

exports.action = function(data, callback){

    ScribeSpeak = SARAH.ScribeSpeak;

    FULL_RECO = SARAH.context.scribe.FULL_RECO;
    PARTIAL_RECO = SARAH.context.scribe.PARTIAL_RECO;
    TIME_ELAPSED = SARAH.context.scribe.TIME_ELAPSED;

    SARAH.context.scribe.activePlugin('WebSearch');

    var util = require('util');
    console.log("WebSearch call log: " + util.inspect(data, { showHidden: true, depth: null }));
    // On récupère le moteur de recherche demandé
    var searchvalue = data.val;

    SARAH.context.scribe.hook = function(event) {
        checkScribe(event, data.action, callback, searchvalue); 
    };

    token = setTimeout(function(){
        SARAH.context.scribe.hook("TIME_ELAPSED");
    }, TIMEOUT_SEC);
}

function checkScribe(event, action, callback, searchvalue) {

    if (event == FULL_RECO) {
        clearTimeout(token);
        SARAH.context.scribe.hook = undefined;
        // aurait-on trouvé ?
        decodeScribe(SARAH.context.scribe.lastReco, callback, searchvalue);

    } else if(event == TIME_ELAPSED) {
        // timeout !
        SARAH.context.scribe.hook = undefined;
        // aurait-on compris autre chose ?
        if (SARAH.context.scribe.lastPartialConfidence >= 0.7 && SARAH.context.scribe.compteurPartial > SARAH.context.scribe.compteur) {
            decodeScribe(SARAH.context.scribe.lastPartial, callback, searchvalue);
        } else {
            SARAH.context.scribe.activePlugin('Aucun (WebSearch)');
            //ScribeSpeak("Désolé je n'ai pas compris. Merci de réessayer.", true);
            return callback({ 'tts': "Désolé je n'ai pas compris. Merci de réessayer." });
        }
    } else {
        // pas traité
    }
}

function decodeScribe(search, callback, searchvalue) {

    console.log("Search: " + search);
    var rgxp = /(google|youtube|t411|ebay|leboncoin|la communauté|la communautée|des images de) (.+)/i;

    var match = search.match(rgxp);

    if (!match || match.length <= 1){
        console.log("FAIL");
        //ScribeSpeak("Je ne comprends pas");
        callback({ 'tts': "Je ne comprends pas" });
        return;
    }

    return Search(callback, searchvalue, match);
}

function Search(callback, searchvalue, match) {
        var search = match[2];

        switch(searchvalue) {

          case "google":
            var answer = 'Voici le résultat de votre recherche sur ' + search;
            var process = '%CD%/plugins/websearch/bin/search.vbs ' + search;
            exec(process);
          break;

          case "411":
            var answer = 'Voici le résultat de votre recherche sur ' + search;
            var process = '%CD%/plugins/websearch/bin/search411.vbs ' + search;
            exec(process);
          break;

          case "ebay":
            var answer = 'Voici le résultat de votre recherche sur ' + search;
            var process = '%CD%/plugins/websearch/bin/searchebay.vbs ' + search;
            exec(process);
          break;

          case "youtube":
            var answer = 'Voici le résultat de votre recherche sur ' + search;
            var process = '%CD%/plugins/websearch/bin/searchyoutube.vbs ' + search;
            exec(process);
          break;

          case "lbc":
            var answer = 'Voici le résultat de votre recherche sur ' + search;
            var process = '%CD%/plugins/websearch/bin/searchleboncoin.vbs ' + search;
            exec(process);
          break;

          case "com":
            var answer = 'Voici le résultat de votre recherche sur ' + search;
            var process = '%CD%/plugins/websearch/bin/searchsarah.vbs ' + search;
            exec(process);
          break;
          case "images":
            var answer = 'Voici les images pour ' + search;
            var process = '%CD%/plugins/websearch/bin/searchimages.vbs ' + search;
            exec(process);
          break;
        }

        //ScribeSpeak(answer);        
        callback({ 'tts': answer });
        return;
}