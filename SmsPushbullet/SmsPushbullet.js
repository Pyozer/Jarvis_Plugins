var token;
var interval = 100;     // msec
var repeat = 100;        // n x interval = timeout ... 50 x 100 = 5000 msec de timeout ...
var cnt = 0;
var cpt_initial;

exports.init = function () {
    info('[ SmsPushbullet ] is initializing ...');
}

exports.action = function(data, callback){

    SARAH.context.scribe.activePlugin('SmsPushbullet');

    var config = Config.modules.SmsPushbullet;
    /* On récupère le destinataire */
    var userto = data.to;
    console.log(userto);
    /* On vérifie si le numéro existe dans la config */
    console.log(config.contact[userto]);
    if(config.contact[userto]) {
        var to = config.contact[userto];
    } else {
        callback({'tts': "Je ne connais pas le numéro pour envoyer"});
    }

    var util = require('util');
    console.log("BEFORE LOG: " + util.inspect(data, { showHidden: true, depth: null }));
    
    // valeur initiale du compteur ...
    cpt_initial = SARAH.context.SpeechReco.compteur;
    cnt = 0;
    token = setInterval(function() {
        SendSMS(SARAH, callback, config, to)
    }, interval);
}

function SendSMS(SARAH, callback, config, to) {
    var new_cpt = SARAH.context.SpeechReco.compteur;
    
    if (new_cpt != cpt_initial) {
        var search = SARAH.context.SpeechReco.lastReco;
        console.log ("Search: " + search);
        // data.dictation returne toute la phrase dite par l'utilisateur
        var rgxp = /Jarvis envoie (.+) par (sms|SMS) (a|à) (.+)/i;

        // on s'assure que Google a bien compris
        var match = search.match(rgxp);
        if (!match || match.length <= 1){
            console.log("FAIL");
            clearInterval(token);
            return callback({'tts': "Je ne comprends pas"});
        }
        var message = match[1];
        // Build URL
        var url = "http://192.168.0.16/raspberry/sendsms.php?access_token=" + config.access_token + "&source_user_iden=" + config.source_user_iden + "&target_device_iden=" + config.target_device_iden + "&to=" + to + "&message=" + encodeURI(message);
        console.log("Sending request to: " + url);

        // Send Request
        var request = require('request');
        request({ 'uri' : url }, function (err, response, body){
            if (err || response.statusCode != 200) {
                console.log(err);
                return callback({'tts': "Je n'arrive pas me connecter au raspberry, merci de vérifier la connexion"});
            } else {
                return callback({'tts': "SMS envoyé"});
            }            
        });
        clearInterval(token);
        console.log("Cnt: " + cnt);
    } else {
        cnt += interval;
        if (cnt > (interval * repeat)) {
            clearInterval(token);
            return callback ({'tts': "Google Chrome n'a pas répondu assez vite"});
        }
    }
}