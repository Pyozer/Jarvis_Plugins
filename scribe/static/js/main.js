var intervals = [];
var secureMute;
var nextMute;
$(document).ready(function(){
	initVoiceDot();
	initHour();
});

function initHour(){
	setInterval(function(){
		var now = new Date();
		$('#hour-container span').html(now.getHours() + ':' + now.getMinutes() + ':' + now.getSeconds());
	}, 1);
}

function initVoiceDot(){
	for(i = 0;i < 100;i++) {
		$('#speak-container').append('<div class="tonality"></div>');
	}
	muteAnimation();
}

function speakAnimation(){
	clearAnimation();
	$('.tonality').each(function(i,element){
		intervals.push(setInterval(function(){
			var rand = Math.floor((Math.random() * ($( window ).height()/1.5) ) + 5);
			$(element).css('height',(rand/2)+'px');
			$(element).css('margin-top',-(rand/4)+'px');
		},200));
	});
}

function clearAnimation(){
	$('.tonality').css('height','2px').css('margin-top','0px').css('opacity','1');
	for (var i = 0; i < intervals.length; i++) {
		window.clearInterval(intervals[i]);
	}
}

function muteAnimation(){
	clearAnimation();
	$('.glow').css('left','90%');
	$('.tonality').each(function(i,element){
		intervals.push(setInterval(function(){
			var rand = Math.floor((Math.random() * ($( window ).height()/1.5) ) + 5);
			$(element).css('margin-top',-(rand/4)+'px');
			$(element).css('opacity',Math.random());
		},300));
	});
}