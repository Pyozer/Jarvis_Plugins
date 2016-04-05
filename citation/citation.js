exports.init = function () {
    info('[ Citation ] is initializing ...');
}

exports.action = function(data, callback){

    SARAH.context.scribe.activePlugin('Citation');

    var date = new Date();
    var today = date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear(); // On rajoute + 1 au mois car il renvoi à partir de 0

    var fs = require("fs");
    var path = require('path');
    var filePath = __dirname + "/CitationSave.json";
    var file_content;

    file_content = fs.readFileSync(filePath, 'utf8');
    file_content = JSON.parse(file_content);

    // On regarde si on a pas déjà cherché ce nombre
    if(typeof file_content[today] != 'undefined' && file_content[today] != "" && data.other != "true") {
        console.log('[ Citation ] Vérifié via la sauvegarde');
        var resultfinal = file_content[today];

        callback({ 'tts': resultfinal });

    } else {

    	var url = "http://evene.lefigaro.fr/citations/citation-jour.php";
    	console.log('Url Request: ' + url);

    	var request = require('request');
    	var cheerio = require('cheerio');

    	request({ 'uri': url, 'headers': { 'Accept-Charset': 'utf-8' } }, function(error, response, html) {

        	if (error || response.statusCode != 200) {
    			callback({'tts': "L'action a échoué. Erreur " + response.statusCode });
    	    }

            var $ = cheerio.load(html, { xmlMode: false, ignoreWhitespace: true, lowerCaseTags: true });

            var nbrcitation = $('.figsco__selection__list__evene__list li').length;
            console.log(nbrcitation);
            
            var Choix = Math.floor(Math.random() * nbrcitation);

            var citation = $('ul.figsco__selection__list__evene__list li.figsco__selection__list__evene__list__item').eq(Choix).find('.figsco__quote__text a').text().trim().replace('“', '').replace('”', '');
            var auteur = $('ul.figsco__selection__list__evene__list li.figsco__selection__list__evene__list__item').eq(Choix).find('.figsco__quote__from .figsco__fake__col-9 a').first().text().trim();

            if(citation == "") {
            	console.log("Impossible de récupérer les informations sur le Figaro");

            	callback({'tts': "Désolé, je n'ai pas réussi à récupérer d'informations" });
            } else {
                var resultfinal = citation + ". De " + auteur;
            	console.log("Informations: " + resultfinal);

                file_content[today] = resultfinal;
                chaine = JSON.stringify(file_content, null, '\t');
                fs.writeFile(filePath, chaine, function (err) {
                    console.log("[ Citation ] Informations enregistrés");
                });

            	callback({'tts': resultfinal });
            }
        });
    }
}