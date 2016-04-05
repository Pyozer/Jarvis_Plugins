exports.init = function () {
    info('[ Presentation ] is initializing ...');
}

exports.action = function(data, callback) {

	SARAH.context.scribe.activePlugin('Presentation');

	var config = Config.modules.presentation;
	var tts = config.phrase;
	
	callback({'tts': tts});
}