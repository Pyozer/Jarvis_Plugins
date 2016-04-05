exports.init = function () {
    info('[ Insultes ] is initializing ...');
}

exports.action = function(data, callback) {

	SARAH.context.scribe.activePlugin('Insultes');

	var reponse = data.reponse;
	console.log("Insulte: " + reponse);
	callback(reponse);
}