exports.init = function () {
    info('[ HeureCoucher ] is initializing ...');
}

exports.action = function(data, callback){

	SARAH.context.scribe.activePlugin('HeureCoucher');

	var config = Config.modules.HeureCoucher;
	var name = config.name;
	var fs = require("fs");
	var path = require('path');
 	var filePath = __dirname + '/heure_coucher.json';
	var file_content;

	file_content = fs.readFileSync(filePath, 'utf8');
	file_content = JSON.parse(file_content);

	var heure_coucher = file_content.heure_coucher;
	var minute_coucher = file_content.minute_coucher;

	if(data.time == "settime") {

		var coucher_json = {};

		if(data.tpshours) {
			coucher_json.heure_coucher = data.tpshours;
		} else {
			coucher_json.heure_coucher = "";
		}
		if(data.tpsminute) {
			coucher_json.minute_coucher = data.tpsminute;
		} else {
			coucher_json.minute_coucher = "";
		}

		chaine = JSON.stringify(coucher_json, null, '\t');
		fs.writeFile(filePath, chaine, function (err) {
			console.log("[ HeureCoucher ] Nouvelle heure de coucher enregistré");
		});


		var text = "On change l'heure pour " + coucher_json.heure_coucher + " heure " + coucher_json.minute_coucher;
	} else {
		var date = new Date();

		switch(data.time) {

			case 'checktime':
				var time_rest = (heure_coucher * 3600 + minute_coucher * 60) - (date.getHours() * 3600 + date.getMinutes() * 60);
				if(time_rest <= 0) {
					var text = "Oui " + name + ", il est l'heure de se coucher";
				} else {
					var time_in_hour = time_rest / 3600
					var heure_rest = parseInt(time_in_hour);
					var minute_rest = (time_in_hour - heure_rest) * 60;

					var heure_rest = heure_rest > 0 ? Math.floor(heure_rest) + " heure " : "";
					var minute_rest = minute_rest > 0 ? Math.floor(minute_rest) + " minute " : "";

					var text = "Non " + name + ", vous avez encore " + heure_rest + " " + minute_rest;
				}
			break;

			case 'gettimeforsleep':
				var text = "Votre heure de couché est à " + heure_coucher + " heure " + minute_coucher;
			break;
		}
	}
	// Callback with TTS
	console.log(text);
	callback({'tts': text});
}