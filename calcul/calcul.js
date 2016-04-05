exports.init = function () {
    info('[ Calcul ] is initializing ...');
}

exports.action = function(data, callback){

  SARAH.context.scribe.activePlugin('Calcul');

  // Retrieve config
  config = Config.modules.calcul;
  
  var operation = '';
  if(data.somme2 != null) {
  	operation = replaceAll('plus', '+', data.somme2.replace('undefined', data.somme));
  } else {
	 operation = data.somme.replace('(', '');
  }
  operation = operation.replace('%(', '(%');
  var operationSpeech = operation;
  var count = operation.match(/\)/g);
  if(count != null) {
  	if(count.length > 1) {
  		operation += ")";
  		operation = operation.replace('))', '');
  	}
  }
  
  var operationWrite = operation;
  var carré = operation.match(/%.?[0-9]+%/g);
  for(i in carré) {
  	var c = replaceAll('%', '', carré[i]);
  	operationWrite = operationWrite.replace(carré[i], c + '²');
  	operationSpeech = operationSpeech.replace(carré[i], c + ' au carré ');
  	c = '(' + c + ' * ' + c + ')';
  	operation = operation.replace(carré[i], c);
  }
  operationSpeech = replaceAll('\\\*', 'fois', operationSpeech);
  operationSpeech = replaceAll('/', 'divisé par', operationSpeech);
  
  console.log(operationWrite);
  var res = eval(operation);
  callback({ 'tts': operationSpeech.replace('(', '').replace(')', '') + ' = ' + res });
}

function replaceAll(find, replace, str) {
  return str.replace(new RegExp(find, 'g'), replace);
}