exports.init = function () {
    info('[ Raspberry ] is initializing ...');
}

exports.action = function(data, callback){

  SARAH.context.scribe.activePlugin('Raspberry');

  // CONFIG
  var config = Config.modules.raspberry;
  if (!config.iprasp){
    console.log("raspberry config missing");
    return callback({ 'tts': "Désolé, mais il me manque l'ip du raspberry" });
  }
  var iprasp = config.iprasp;
  var time = config.time;
  var boucle = config.boucle;

  var type = data.type;
  var led = data.led;

  var gpio = null;

  switch(type) {
    case 'allumer':
      etat = 1;
    break;
    case 'eteindre':
      etat = 0;
    break;
    case 'blink':
      etat = "blink";
      script = "blink_effect";
    break;
  }

  switch(led) {
    case 'first_red':
      gpio = 0;
      script = "control_led";
    break;
    case 'first_yellow':
      gpio = 2;
      script = "control_led";
    break;
    case 'all_red':
      gpio = "red";
      script = "all_led";
    break;
    case 'all_yellow':
      gpio = "yellow";
      script = "all_led";
    break;
    case 'all':
      gpio = "all";
      script = "all_led";
    break;
  }

  if(etat == "blink") {
    var params = '?time=' + time + '&boucle=' + boucle + '&' + script + '=true';
  } else {
    var params = '?pin=' + gpio + '&etat=' + etat + '&' + script + '=true';
  }
  
  var request = require('request');
  var url = 'http://' + iprasp + '/raspberry/index.php' + params;
  //if(config.devmode == "true") {
    console.log("Type: " + type);
    console.log("LED: " + led);
    console.log("Etat: " + etat);
    console.log("GPIO: " + gpio);
    console.log(url);
  //}
  request({ 'uri' : url, 'encoding': 'binary' }, function (err, response, body) {
    if(err || response.statusCode != 200) {
      callback({ 'tts': "Je n'arrive pas à accéder aux raspberry" });
    } else {
      callback({ 'tts' : "C'est fait" });
    }
  });
}