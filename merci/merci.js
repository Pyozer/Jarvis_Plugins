exports.init = function () {
    info('[ Merci ] is initializing ...');
}

exports.action = function(data, callback){

	SARAH.context.scribe.activePlugin('Merci');

	// CONFIG
	config = Config.modules.merci;
	if (!config.name){
		console.log("merci config missing");
		callback({ 'tts': "J'ai besoin de ton nom pour répondre" });
		return;
	}
	var name = config.name;

	var answers = new Array(
		"Mais de rien " + name,
		"ça me fait plaisir",
		"Hé ouais, je gère !",
		"Tu sais " + name + ", je suis ton plus fidèle serviteur",
		"Ouais ouais " + name  + " mais t'habitue pas trop",
		"Ah ! Enfin. J'ai failli attendre",
		"J'ai pas trop le choix",
		"ça me fait très plaisir " + name,
		"Dé nada"
	);

	var choix = Math.floor(Math.random() * answers.length);

	callback({'tts' : answers[choix] });
}