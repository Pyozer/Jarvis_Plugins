exports.init = function () {
    info('[ Bruitages ] is initializing ...');
}

exports.action = function(data, callback) {

	SARAH.context.scribe.activePlugin('Bruitages');
	
	var reponse = data.reponse;
	console.log(reponse);
	callback(reponse);
}