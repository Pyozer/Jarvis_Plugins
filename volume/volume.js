exports.init = function () {
    info('[ Volume ] is initializing ...');
}

exports.action = function(data, callback){

  SARAH.context.scribe.activePlugin('Volume');

  // Verify config
  config = Config.modules.volume;
  if (!config.os_version){
    console.log("Missing Volume config");
    return callback({ 'tts': "Il me manque une configuration pour le plugine volume" });
  }

  var exec = require('child_process').exec;
  // Activé le son
  if (data.soundValue == "hpon") {
    var command = "mutesysvolume 0";
    var txt = new Array;
    txt[0] = "Coucou, me revoila !";
    txt[1] = "Me revoila !";
    txt[2] = "Je suis de retour";
  }
  // Désactivé le son
  if (data.soundValue == "hpoff") {
    var command = "mutesysvolume 1";
    var txt = "";
  }
  // Monter le son
  if (data.soundValue == "monte") {
    var command = "changesysvolume 10000";
    var txt = new Array;
    txt[0] = "Voila, je parle plus fort !";
    txt[1] = "Je parle plus fort";
    txt[2] = "J'ai monté le son";
  }
  // Baissé le son
  if (data.soundValue == "baisse") {
    var command = "changesysvolume -10000";
    var txt = new Array;
    txt[0] = "Voila, je parle moins fort !";
    txt[1] = "Je parle moins fort";
    txt[2] = "J'ai baissé le son";
  }

  if (config.os_version == "32") {
    var process = '%CD%/plugins/volume/bin/nircmdc.exe';
  }
  if (config.os_version == "64") {
    var process = '%CD%/plugins/volume/bin/nircmdc64.exe';
  }
  process +=  ' ' + command;

  // On éxécute le process
  var child = exec(process, function (error, stdout, stderr) {
    console.log(process);  
  });

  var choix = Math.floor(Math.random() * txt.length);
  var answer = txt[choix];

  // On renvoi la phrase à dire
  callback({ 'tts': answer });
}