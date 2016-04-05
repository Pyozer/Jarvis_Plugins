exports.init = function () {
    info('[ Minuteur ] is initializing ...');
}

exports.action = function(data, callback){

	SARAH.context.scribe.activePlugin('Minuteur');

	var config = Config.modules.minuteur;
	// on regarde que la variable temps n'est pas vide
	if(!data.temps || !data.type){
	  return callback({ 'tts': "Désolé je n'ai pas compris" });
	}
	if(!config.song) {
		return callback({ 'tts': "Désolé, il me manque le nom du song à jouer..." });
	}

	// on récupére le temps et on l'imprime pour le debug
	var temps = data.temps;
	var type = data.type;
	console.log(temps + " " + type);

	// on créer la fonction  pour le mp3
	var minut = function(msg) {
	    SARAH.play('C:/Jarvis/plugins/minuteur/sample/' + config.song);
	    SARAH.speak(msg);
	}

	switch(type) {
		case 'sec':
			var temps_in_ms = temps * 1000;
		break;
		case 'min':
			var temps_in_ms = temps * 60 * 1000;
		break;
		case 'hour':
			var temps_in_ms = temps * 60 * 60 * 1000;
		break;
		case 'day':
			var temps_in_ms = temps * 60 * 60 * 24 * 1000;
		break;
	}

	// on fait appel à la fonction minuteur
	setTimeout(function() {
		minut('Le compte à rebour est fini !')
	}, temps_in_ms);

	callback({ 'tts': "Je lance le minuteur pour " + temps + " " + type }); 
};