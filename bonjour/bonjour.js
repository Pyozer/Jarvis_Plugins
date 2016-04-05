exports.init = function () {
    info('[ Bonjour ] is initializing ...');
}

exports.action = function(data, callback){

  SARAH.context.scribe.activePlugin('Bonjour');

  var reponses = [
    "Bonjour monsieur",
    "Ravi de vous voir monsieur",
    "Coucou monsieur",
    "Vous revoila",
    "Cela faisait longtemps"
  ];

  var date = new Date();
  var heure_day = date.getHours();
  /* Si on est le soir alors on dit bonsoir */
  if(heure_day > 18) {
    reponses[0] = "Bonsoir monsieur";
  }

  var choix = Math.floor(Math.random() * reponses.length);
  var answer = reponses[choix];

  callback({ 'tts': answer });
}