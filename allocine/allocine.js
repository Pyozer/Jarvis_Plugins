exports.action = function(data, callback){

  SARAH.context.scribe.activePlugin('Allocine');

  var place = data.place || 'P1346';
  
  var url = 'http://mobile.allocine.fr/salle/seances_gen_csalle=' + place + '.html';
  console.log('Request Url: ' + url);
  var request = require('request');
  var cheerio = require('cheerio');

  var options = {
    'Accept-Charset': 'utf-8'
  };
    
  request({ 'uri': url, 'headers': options }, function (err, response, body){
    
    if (err || response.statusCode != 200) {
      callback({'tts': "L'action a échoué"});
      return;
    }
    var $ = cheerio.load(body, { xmlMode: false, ignoreWhitespace: false, lowerCaseTags: false });
    var options = list($);
    options.tts = 'Voici la liste des films au ' + options.theatre + ': ' + options.movies.join(', ');
    console.log("Film à l'affiche: " + options.movies.join(', '));
    
    if (data.movie){
      options.hours = hours($, data.movie);
      options.tts = 'Voici les horaires de '+ options.movies[data.movie] +' au ' + options.theatre + ': ';
      options.tts += options.hours.join(', ');
      console.log("Scéances: " + options.hours.join(', '));
    } else {
      update(options.movies, place);
    }
   
    callback(options);
  });
}

  // ------------------------------------------
  //  HELPER
  // ------------------------------------------


if (!String.prototype.encodeHTML) {
  String.prototype.encodeHTML = function () {
    return this.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  };
}

// ------------------------------------------
//  SCRAPING
// ------------------------------------------

var list = function($){
  var theatre = $('div.titre b').text();
  var movies  = $('div.cell a[href^="/film"]').map(function(){
    return $(this).text();
  });
  var allmovies = new Array();
  movies.map(function(index, titlemovie){
      allmovies[index] = titlemovie;
  });
  var options = {
    "theatre": theatre,
    "movies": allmovies
  };
  return options;
}

var hours = function($, pos){
  var heuresget = $('div.cell').eq(pos).find('div[style*=red]').map(function(){
    return clean($(this).text());
  });
  var allhours = new Array();
  heuresget.map(function(index, heure){
      allhours[index] = heure;
  });
  return allhours;
}

var clean = function(hours){
  hours = hours.replace(/<br>/g,'. ').replace(/Lun[-,]* /g,'. Lundi')
               .replace(/Mar[-,]* /g,'. Mardi')
               .replace(/Mer[-,]* /g, '. Mercredi')
               .replace(/Jeu[-,]* /g,'. Jeudi')
               .replace(/Ven[-,]* /g, '. Vendredi')
               .replace(/Sam[-,]* /g,'. Samedi')
               .replace(/Dim[-,]* /g, '. Dimanche');
  return hours;
}

// ------------------------------------------
//  UPDATING XML
// ------------------------------------------

var update = function(movies, place){
  if (!movies || movies.length == 0){ return; }
  
  var fs   = require('fs');
  var file = __dirname + '/allocine.xml';
  var xml  = fs.readFileSync(file, 'utf8');
  
  var replace  = '§ -->\n';
      replace += '<rule id="ruleMovieName">\n';
      replace += '  <tag>out.place="'+place+'";</tag>\n';
      replace += '  <one-of>\n';
      
  for(var i = 0 ; i < movies.length ; i++){
      var movie =  movies[i]; movie = movie.indexOf(':') > 0 ? movie.substring(0,movie.indexOf(':')) : movie; // Split at ':'
      replace += '    <item>'+movie.encodeHTML()+'<tag>out.movie="'+i+'";</tag></item>\n';
  }
      replace += '  </one-of>\n';
      replace += '</rule>\n';
      replace += '<!-- §';
  
  var regexp = new RegExp('§[^§]+§','gm');
  var xml    = xml.replace(regexp,replace);
  
  fs.writeFileSync(file, xml, 'utf8');
}