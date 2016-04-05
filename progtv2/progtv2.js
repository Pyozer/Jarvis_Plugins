exports.init = function () {
    info('[ ProgTv2 ] is initializing ...');
}

exports.action = function(data, callback) {

  SARAH.context.scribe.activePlugin('ProgTv2');

  config = Config.modules.progtv2;

  // --- Gestion des bouquests ---
  var bouquets = new Array();

  if (data.bouquet) {
    bouquets.push(data.bouquet.replace(" ", ""));
  } else {
    var bouquets_favoris = config.bouquets_favoris;

    if (bouquets_favoris) {
      bouquets_favoris = bouquets_favoris.split(',');

      for (var i = 0;i < bouquets_favoris.length;i++) {
        bouquets.push(bouquets_favoris[i].replace(" ", ""));
      }
    }

    if (bouquets.length == 0) {
      console.log('ProgTV2 : Veuillez indiquer vos bouquets favorits dans le fichier prop');
      callback({'tts': "Je n'ai pas pu effectuer l'action. Veuillez indiquer vos bouquets favorits dans le fichier prope"});
      return; 
    }
  }

  // --- Gestion des chaines ---
  var chaines = new Array();

  if (data.chaine) {
    chaines.push(parseInt(data.chaine));
  } else {
    var chaines_favoris = config.chaines_favoris;

    if (chaines_favoris) {
      chaines_favoris = chaines_favoris.split(',');

      for (var i = 0; i<chaines_favoris.length; i++) {
        chaines.push(parseInt(chaines_favoris[i]));
      }
    }

    if (chaines.length == 0) {
      console.log('ProgTV2 : Veuillez indiquer vos chaines favorites dans le fichier prop');
      callback({'tts': "Je n'ai pas pu effectuer l'action. Veuillez indiquer vos chaines favorites dans le fichier prope"});
      return; 
    }
  }

  getData(data.period, bouquets, chaines, '', callback);
}

var getData = function(period, bouquets, chaines, tts, callback) {
  var request = require('request');

  var url = getUrlFromPeriodAndBouquet(period, bouquets[0]);

  request({ 'uri' : url }, function (err, response, body) {
    if (err || response.statusCode != 200) {
      console.log('ProgTV2 : error on url : ' + url);
      tts = "Je n'ai pas pu effectuer l'action";
      return callback({'tts' : tts});
    }

    var text = scrap(body, chaines);
    
    if (text == "Je n'ai pas pu effectuer l'action") {
      return callback({'tts' : text});
    } else {
      tts += text;
    }

    bouquets.splice(0, 1); // Delete first item
    
    if (bouquets.length > 0) {
      getData(period, bouquets, chaines, tts, callback);
    } else {
      return callback({'tts' : tts});
    }
  });
}

var getUrlFromPeriodAndBouquet = function(period, bouquet) {
  var url = 'http://www.programme.tv';

  if (!period) {
    url += '/actuellement/' + bouquet;
  } else {
    if (period == 'soiree') {
      url += '/' + bouquet;
    } else if (period == 'actuellement') {
      url += '/actuellement/' + bouquet;
    } else {
      url += '/' + bouquet + '/soiree/' + period + '.php';
    }
  }

  return url;
}

var scrap = function(body, chaines) {
  var $ = require('cheerio').load(body, { xmlMode: true, ignoreWhitespace: false, lowerCaseTags: false });

  var progtv = new Array();

  $('#programs li:not(.pub)').each(function(index) {
    
    var channelName = $(this).find('.bheader a').attr('title').replace('Programme ', '');
    var hourStart = $(this).find('.hour').text();
    var title = $(this).find('.bcontent a').attr('title');
    if (title == '' || title == undefined) { title = $(this).find('.bcontent h3').text(); }
    var subtitle = $(this).find('.bcontent .subtitle a').attr('title');
    if (subtitle == '' || subtitle == undefined) { subtitle = $(this).find('.bcontent .subtitle').text(); }
    subtitle = subtitle.replace(title, '');
    var hourEnd = $(this).find('.bcontent .figure .progressbar-end').text();
    var progression = $(this).find('.bcontent .figure .pogressbar-percent').text().replace('%', '');

    var channelId = getChannelIdFromChannelName(channelName);
    
    progtv.push({"channelId" : channelId, "channelName" : channelName, "hourStart" : hourStart, "hourEnd" : hourEnd, "title" : title, "subtitle" : subtitle, "progression" : progression});
  });

  progtv.sort(sortArrayWithKey); // Tri du tableau sur la clé "channelId"
  var infos = getInfosChannels(progtv, chaines);

  return infos;
}

var getChannelIdFromChannelName = function(channelName) {
  var channelId;
  // --- Liste des chaines triées par bouquet ---

  // --- tnt ---
  if (channelName == 'TF1')                     {channelId = 1;}
  else if (channelName == 'France 2')           {channelId = 2;}
  else if (channelName == 'France 3')           {channelId = 3;}
  else if (channelName == 'Canal+')             {channelId = 4;}
  else if (channelName == 'Arte')               {channelId = 5;}
  else if (channelName == 'M6')                 {channelId = 6;}
  else if (channelName == 'France 5')           {channelId = 7;}
  else if (channelName == 'D8')                 {channelId = 8;}
  else if (channelName == 'W9')                 {channelId = 9;}
  else if (channelName == 'TMC')                {channelId = 10;}
  else if (channelName == 'NT1')                {channelId = 11;}
  else if (channelName == 'NRJ 12')             {channelId = 12;}
  else if (channelName == 'LCP - Public Senat') {channelId = 13;}
  else if (channelName == 'France 4')           {channelId = 14;}
  else if (channelName == 'BFM TV')             {channelId = 15;}
  else if (channelName == 'itele')              {channelId = 16;}
  else if (channelName == 'D17')                {channelId = 17;}
  else if (channelName == 'Gulli')              {channelId = 18;}
  else if (channelName == 'France Ô')           {channelId = 19;}
  else if (channelName == 'HD1')                {channelId = 20;}
  else if (channelName == 'L\'Equipe 21')       {channelId = 21;}
  else if (channelName == '6ter')               {channelId = 22;}
  else if (channelName == 'Numéro 23')          {channelId = 23;}
  else if (channelName == 'RMC Découverte')     {channelId = 24;}
  else if (channelName == 'Chérie 25')          {channelId = 25;}
  // --- belgique-suisse ---
  else if (channelName == 'La Une')             {channelId = 26;}
  else if (channelName == 'La Trois')           {channelId = 27;}
  else if (channelName == 'Club RTL')           {channelId = 28;}
  else if (channelName == 'Plug RTL')           {channelId = 29;}
  else if (channelName == 'RTS Deux')           {channelId = 30;}
  else if (channelName == 'La Deux')            {channelId = 31;}
  else if (channelName == 'RTL TVI')            {channelId = 32;}
  else if (channelName == 'RTS Un')             {channelId = 33;}
  // --- tnt-locale ---
  else if (channelName == 'IDF1')               {channelId = 34;}
  else if (channelName == 'Demain TV BDM TV Cinaps Tv Télé bocal') {channelId = 35;}
  else if (channelName == 'NRJ Paris')          {channelId = 36;}
  // --- generaliste ---
  else if (channelName == 'Paris Première')     {channelId = 37;}
  else if (channelName == 'Série club')         {channelId = 38;}
  else if (channelName == 'Téva')               {channelId = 39;}
  else if (channelName == 'TF6')                {channelId = 40;}
  else if (channelName == 'Syfy')               {channelId = 41;}
  else if (channelName == 'TvBreizh')           {channelId = 42;}
  else if (channelName == 'Vivolta')            {channelId = 43;}
  else if (channelName == 'June')               {channelId = 44;}
  else if (channelName == 'Cuisine+')           {channelId = 45;}
  else if (channelName == 'AB4')                {channelId = 46;}
  else if (channelName == 'Pink TV')            {channelId = 47;}
  else if (channelName == 'RTL 9')              {channelId = 48;}
  else if (channelName == '13ème Rue')          {channelId = 49;}
  else if (channelName == 'Jimmy')              {channelId = 50;}
  else if (channelName == 'Comédie +')          {channelId = 51;}
  else if (channelName == 'TV5MONDE')           {channelId = 52;}
  else if (channelName == 'AB1')                {channelId = 53;}
  else if (channelName == 'Game One')           {channelId = 54;}
  else if (channelName == 'AB3')                {channelId = 55;}
  else if (channelName == 'KTO')                {channelId = 56;}
  else if (channelName == 'Maison+')            {channelId = 57;}
  // --- canal-tps ---
  else if (channelName == 'Canal+')             {channelId = 58;}
  else if (channelName == 'Canal+ décalé')      {channelId = 59;}
  else if (channelName == 'Canal+ sport')       {channelId = 60;}
  else if (channelName == 'Canal+ Séries')      {channelId = 61;}
  else if (channelName == 'Canal+ cinéma')      {channelId = 62;}
  else if (channelName == 'Canal+ family')      {channelId = 63;}
  // --- cinema ---
  else if (channelName == 'Ciné + Premier')     {channelId = 64;}
  else if (channelName == 'Ciné + Emotion')     {channelId = 65;}
  else if (channelName == 'Ciné + Famiz')       {channelId = 66;}
  else if (channelName == 'Ciné + Classic')     {channelId = 67;}
  else if (channelName == 'OCS Choc')           {channelId = 68;}
  else if (channelName == 'OCS Géants')         {channelId = 69;}
  else if (channelName == 'Disney Cinemagic +1'){channelId = 70;}
  else if (channelName == 'Ciné Polar')         {channelId = 71;}
  else if (channelName == 'TCM')                {channelId = 72;}
  else if (channelName == 'Paramount Channel')  {channelId = 73;}
  else if (channelName == 'Ciné + Frisson')     {channelId = 74;}
  else if (channelName == 'Ciné + Club')        {channelId = 75;}
  else if (channelName == 'OCS Max')            {channelId = 76;}
  else if (channelName == 'OCS City')           {channelId = 77;}
  else if (channelName == 'Disney Cinemagic')   {channelId = 78;}
  else if (channelName == 'Action')             {channelId = 79;}
  else if (channelName == 'Ciné FX')            {channelId = 80;}
  else if (channelName == 'XXL')                {channelId = 81;}
  // --- sport ---
  else if (channelName == 'Eurosport')          {channelId = 82;}
  else if (channelName == 'beIN Sport 1')       {channelId = 83;}
  else if (channelName == 'beIN Sport 2')       {channelId = 84;}
  else if (channelName == 'Canal+ sport')       {channelId = 85;}
  else if (channelName == 'Equidia Life')       {channelId = 86;}
  else if (channelName == 'Ma Chaîne Sport')    {channelId = 87;}
  else if (channelName == 'OMtv')               {channelId = 88;}
  else if (channelName == 'Girondins TV')       {channelId = 89;}
  else if (channelName == 'Eurosport 2')        {channelId = 90;}
  else if (channelName == 'Sport+')             {channelId = 91;}
  else if (channelName == 'AB Moteurs')         {channelId = 92;}
  else if (channelName == 'Info Sport +')       {channelId = 93;}
  else if (channelName == 'Equidia')            {channelId = 94;}
  else if (channelName == 'Motors TV')          {channelId = 95;}
  else if (channelName == 'OLTV')               {channelId = 96;}
  // --- information_documentaire ---
  else if (channelName == 'LCI')                {channelId = 97;}
  else if (channelName == 'France 24')          {channelId = 98;}
  else if (channelName == 'Planète + Thalassa') {channelId = 99;}
  else if (channelName == 'Planète+ Justice')   {channelId = 100;}
  else if (channelName == 'Discovery Science')  {channelId = 101;}
  else if (channelName == 'Voyage')             {channelId = 102;}
  else if (channelName == 'Toute l\'histoire')  {channelId = 103;}
  else if (channelName == 'Animaux')            {channelId = 104;}
  else if (channelName == 'Seasons')            {channelId = 105;}
  else if (channelName == 'Chasse et pêche')    {channelId = 106;}
  else if (channelName == 'National Geographic'){channelId = 107;}
  else if (channelName == 'Planète +')          {channelId = 108;}
  else if (channelName == 'Planète + No Limit') {channelId = 109;}
  else if (channelName == 'Discovery Channel')  {channelId = 110;}
  else if (channelName == 'Ushuaia TV')         {channelId = 111;}
  else if (channelName == 'Histoire')           {channelId = 112;}
  else if (channelName == 'Escales')            {channelId = 113;}
  else if (channelName == 'Encyclo')            {channelId = 114;}
  else if (channelName == 'Stylia')             {channelId = 115;}
  else if (channelName == 'E !')                {channelId = 116;}
  // --- jeunesse ---
  else if (channelName == 'Disney Channel')     {channelId = 117;}
  else if (channelName == 'Nickelodéon')        {channelId = 118;}
  else if (channelName == 'Cartoon Network')    {channelId = 119;}
  else if (channelName == 'Canal J')            {channelId = 120;}
  else if (channelName == 'Piwi+')              {channelId = 121;}
  else if (channelName == 'Disney Cinemagic +1'){channelId = 122;}
  else if (channelName == 'TIJI')               {channelId = 123;}
  else if (channelName == 'Disney Junior')      {channelId = 124;}
  else if (channelName == 'Boomerang')          {channelId = 125;}
  else if (channelName == 'TéléToon+')          {channelId = 126;}
  else if (channelName == 'Disney Cinemagic')   {channelId = 127;}
  else if (channelName == 'Mangas')             {channelId = 128;}
  // --- musique ---
  else if (channelName == 'MCM')                {channelId = 129;}
  else if (channelName == 'MCM Pop')            {channelId = 130;}
  else if (channelName == 'M6 Music')           {channelId = 131;}
  else if (channelName == 'M6 Music Club')      {channelId = 132;}
  else if (channelName == 'MTV Base France')    {channelId = 133;}
  else if (channelName == 'MTV Idol')           {channelId = 134;}
  else if (channelName == 'MTV Rocks')          {channelId = 135;}
  else if (channelName == 'Melody')             {channelId = 136;}
  else if (channelName == 'MCM Top')            {channelId = 137;}
  else if (channelName == 'M6 Music Black')     {channelId = 138;}
  else if (channelName == 'MTV')                {channelId = 139;}
  else if (channelName == 'MTV Hits')           {channelId = 140;}
  else if (channelName == 'MTV Pulse')          {channelId = 141;}
  else if (channelName == 'NRJ Hits')           {channelId = 142;}
  else if (channelName == 'Mezzo')              {channelId = 143;}
  else                                          {channelId = 0;}

  return channelId;
}

var getInfosChannels = function(progtv, chaines) {

  if (progtv.length == 0 || chaines.length == 0) {
    return "Je n'ai pas pu effectuer l'action";
  }

  var tts = '';

  for (var i = 0;i < progtv.length;i++) {
    var aChannel = progtv[i];
    if (chaines.indexOf(aChannel.channelId) > -1) {
      // L'id de la chaine souhaitée est bien dans la liste du programme tv
      tts += " Sur " + aChannel.channelName + ', ' + aChannel.title;

      if (aChannel.subtitle != '' && aChannel.subtitle != undefined) {
        tts += ', ' + aChannel.subtitle;
      }

      tts += ', à ' + aChannel.hourStart;

      if (aChannel.progression != '' && aChannel.progression != undefined) {
        var date = new Date();

        var startTimeInMin = parseInt(transformHourInMinutes(getHourFromString(aChannel.hourStart))) + parseInt(getMinuteFromString(aChannel.hourStart));
        var nowInMin = parseInt(transformHourInMinutes(date.getHours())) + parseInt(date.getMinutes());
        var diff = getDiffBetweenMinutes(startTimeInMin, nowInMin);

        tts += ', commencé depuis ' + getFormatedTimeFromMinutes(diff) + '.';
      } else {
        tts += '.';
      } 
    }
  }

  return tts;
}

var transformHourInMinutes = function(hour) {
  return hour * 60;
}

var getHourFromString = function(string) {
  var hour = string.substr(0, 2);

  if (hour.substr(0,1) == "0") {
    hour = hour.substr(1,1);
  }

  return hour;
}

var getMinuteFromString = function(string) {
  var min = string.substr(3, 2);

  if (min.substr(0,1) == "0") {
    min = min.substr(1,1);
  }

  return min;
}

var getDiffBetweenMinutes = function(startInMinutes, endInMinutes) {
  var diff = 0;
  
  if (startInMinutes < endInMinutes) {
    diff = endInMinutes - startInMinutes;
  } else {
    diff = ((24 * 60) - startInMinutes) + endInMinutes;
  }

  return diff;
}

var getFormatedTimeFromMinutes = function(minutes) {

  if (minutes < 60) {
    return minutes + " minutes";
  }

  var hour = Math.floor(minutes / 60);
  var min = minutes % 60;

  var stringMin = " et " + min + " minute";

  if (min == 0) {
    stringMin = "";
  }

  return hour + " heure " + stringMin;
}

function sortArrayWithKey(a,b) {
  if (a.channelId < b.channelId)
     return -1;
  if (a.channelId > b.channelId)
    return 1;
  return 0;
}