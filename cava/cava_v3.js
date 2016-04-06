exports.init = function () {
    info('[ CaVa ] is initializing ...');
}

exports.action = function(data, callback, config, SARAH){

  var config = config.modules.cava;
  var name = config.votre_prenom;
  // Si on utilise Scribe, décommenter la ligne juste en dessous
  //SARAH.context.scribe.activePlugin('CaVa');

  var reponses = [
    "Ca va bien, " + name + ", et vous ?",
    "Comme d'habitude, et vous ?",
    "Je me sens bien, merci. Et vous ?",
    "J'ai la patate ! Et vous ?",
    "Je sens que mes circuit chauffe un peu, mais ça va. Et vous ?"
  ];

  var choix = Math.floor(Math.random() * reponses.length);
  var answer = reponses[choix];

  SARAH.askme(answer, {
    "bien": 'good',
    "normal": 'good',
    "comme d'habitude": 'good',
    "ça va": 'good',
    "ca va": 'good',
    "sa va": 'good',
    "tranquille": 'good',
    "pas très bien": 'bad',
    "pas super": 'bad',
    "pas top": 'bad',
    "bof": 'bad',
  }, 10000, function(answer, end){ // the selected answer or false 
      if(answer == 'bad') {
          var reponses4Bad = [
            "Dommage",
            "Ah mince",
            "Je suis désolé pour vous",
            "Ah mince, n'hésitez pas à soliciter mon aide",
            "ça change de d'habitude"
          ];

          var choix = Math.floor(Math.random() * reponses4Bad.length);
          var answer4Bad = reponses4Bad[choix];

          SARAH.speak(answer4Bad);
      } else {
          var reponses4Good = [
            "Super",
            "Génial",
            "Je suis content pour vous",
            "Super, n'hésitez pas à soliciter mon aide",
            "Ah ! Je suis content pour vous"
          ];

          var choix = Math.floor(Math.random() * reponses4Good.length);
          var answer4Good = reponses4Good[choix];

          SARAH.speak(answer4Good);
      }
      end();
  });

  callback();
}