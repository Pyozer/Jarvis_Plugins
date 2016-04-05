exports.init = function () {
    info('[ Horoscope ] is initializing ...');
}

exports.action = function(data, callback){

    SARAH.context.scribe.activePlugin('Horoscope');

	var config = Config.modules.horoscope;
	var signedef = config.signe;

	/* Si pas de signe astrologique on prend celui de la config */
	if(!data.horoscope) {
		var signe = signedef;
	} else {
		var signe = data.horoscope;
	}

	var url = "http://www.horoscope-gratuit.org/horoscope-" + signe + ".php";
	console.log('Url Request: ' + url);

	var request = require('request');
	var cheerio = require('cheerio');

	request({ 'uri': url, 'headers': { 'Accept-Charset': 'utf-8' }, 'encoding': 'binary' }, function(error, response, html) {

    	if (error || response.statusCode != 200) {
			clearInterval(token);
			callback({'tts': "L'action a échoué. Erreur " + response.statusCode });
			return;
	    }

        var $ = cheerio.load(html, { xmlMode: true, ignoreWhitespace: true, lowerCaseTags: true });

        var horoscope = $('table div:nth-child(1)').text().trim();
        horoscope = horoscope.replace('January', 'Janvier')
        					.replace('February', 'Février')
        					.replace('March', 'Mars')
        					.replace('April', 'Avril')
        					.replace('May', 'Mai')
        					.replace('June', 'Juin')
        					.replace('July', 'Juillet')
        					.replace('August', 'Aout')
        					.replace('September', 'Septembre')
        					.replace('October', 'Octobre')
        					.replace('November', 'Novembre')
        					.replace('December', 'Décembre');
        if(horoscope == "") {
        	console.log("Impossible de récupérer les informations sur Horoscope");

        	callback({'tts': "Désolé, je n'ai pas réussi à récupérer d'informations" });
        } else {
        	console.log("Informations: " + horoscope);

        	callback({'tts': horoscope });
        }
	    return;
    });
}