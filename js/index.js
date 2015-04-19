$(function(){
	$(document).ready(function(){
		/**
		 * The global variable of timer,
		 * to cancel the timer when it is staring.
		 */
		timer = undefined;
		default_msg = $('<em>').html('Those songs are draggable...');
		$('#message').html(default_msg);
		/**
		 * When the document is ready,
		 * to load the play list in the data store. 
		 */
		playList('get');
		
		/**
		 * To hide the process of search,
		 * when keyword is submit, the process will show. 
		 */
		$('#search_process').hide();
		
		/**
		 * Initial the jPlayer component. 
		 */
		$("#jquery_jplayer_1").jPlayer( {
	        swfPath: "/js/jplayer",
	        supplied: "mp3, m4a",
	        wmode: "window"
	    });
	    
		/**
		 * When submit is click,
		 * will show the result list of keyword. 
		 */
		$('#submit').bind('click', function() {
			var num = -1;
			var query = $('#search').val();
			showList(num, query);
		});
		
		/**
		 * When show more is click,
		 * will show more result of the keyword. 
		 */
		$('.showmore').live('click', function() {
			var num = $('.showmore').attr('id');
			var query = $('.showmore').attr('name');
			showList(num, query);
		});
		
		/**
		 * When mouse over the search list and the scroll bar's height is over 1/4,
		 * it will show more result of the keyword. 
		 */
		$('#ul-div').live('mouseover', function() {
			nScrollHight = this.scrollHeight;
		    nScrollTop = this.scrollTop;
	        if(nScrollTop +  $(this).height() >= nScrollHight / 4 && $('#search_process').css('display') == 'none' && $('.more').text() != "No Result.") {
				var num = $('.showmore').attr('id');
				var query = $('.showmore').attr('name');
				showList(num, query);
			}
		});
		
		/**
		 * Let the song list to be sortable and connect with search list. 
		 */
		$('#ul-playlist').sortable({
			connectWith: "#ul-list"
		}).disableSelection();
		
		/**
		 * Let the play list to be sortable. 
		 */
		$('#pl-ul-list').sortable({
		}).disableSelection();
		
		/**
		 * When the music item is click, to play the song. 
		 */
		$('#playSong').live('click', function() {
			playMusic($(this));
		});
		
		$('#jquery_jplayer_1').bind($.jPlayer.event.error, function(event) {
			s = '<em> ERROR: ' + event.jPlayer.error.message + ' Will try next media after ';
			
			if (timer != undefined)
				clearTimeout(timer);
			
			$('#message').attr({t: 3}).html(s + '3 seconds...</em>');
			timer = setTimeout("saved('countdownError');", 1000);
		});
		
		/**
		 * When player is ended, to play the next music of the list. 
		 */
		$("#jquery_jplayer_1").bind($.jPlayer.event.ended + '.jp-next', function(event) {
			next();
		});
		
		/**
		 * When player's repeat button click, will unbind the ended handler. 
		 */
		$('.jp-repeat').bind('click', function() {
			$("#jquery_jplayer_1").unbind($.jPlayer.event.ended + '.jp-next');
		});
		
		/**
		 * When player's repeat-off button click, will bind the ended handler. 
		 */
		$('.jp-repeat-off').bind('click', function() {
			$("#jquery_jplayer_1").bind($.jPlayer.event.ended + '.jp-next', function(event) {
				next();
			});
		});
		
		/**
		 * When the player's next button is click, to play the next music of the list. 
		 */
		$('.jp-next').bind('click', function() {
			next();
		});
		
		/**
		 * When the player's previous button is click, to play the previous music of the list.  
		 */
		$('.jp-previous').bind('click', function() {
			prev();
		});
		
		/**
		 * When the play list is sort update, to save the play list. 
		 */
		$('#pl-ul-list').bind('sortupdate', function(event, ui) {
			saved('playlist');
		});
		
		/**
		 * When the song list is sort update, to save the song list. 
		 */
		$('#ul-playlist').bind('sortupdate', function(event, ui) {
			saved('songlist');
		});
		
		/**
		 * When play list's add button is click, 
		 * will check the NAME(add to list) is empty or duplicate, after checked will save the play list. 
		 */
		$('#pl-add').bind('click', function() {
			var isFind = false;
			var isEmpty = true;
			var name = $('#listname').val();
			
			$.each($('#pl-ul-list').children().children(), function() {
				isEmpty = false;
				if (this.text == name)
					isFind = true;
			});
			
			if (!isFind && name != '') {
				$('#pl-ul-list').append($('<li>').attr({class: 'ui-state-default'}).html($('<a>').attr({id: 'pl-a',href: 'javascript:void(0);'}).html($('#listname').val())));
				if (isEmpty) {
					var first = $('#pl-ul-list').first().children().first().children();
					first.css('color', '#FFA500');
					first.attr({select: 1});
					$('#pl-name').text(first.text());
				}
				playList('update');
			}
			else
				alert('The list name is duplicate or empty.');
		});
		
		/**
		 * When play list's delete button is click, 
		 * will delete the selected item of the list, and let the first of the list item to be selected. 
		 */
		$('#pl-del').bind('click', function() {
			var removeItem = $('a[select=1]').parent();
			
			// Not have delete item.
			if (removeItem.length == 0)
				$('#pl-name').html('<em>YOU MUST ADD NEW PLAYLIST.</em>');
			
			// Have delete item.
			else {
				// Delete list.
				removeItem.remove();
				songList('delete', $('#pl-name').text());
				
				// Reade next item to show.
				var next = $('#pl-ul-list').first().children().first().children();
				
				// Not have next item.
				if (next.length == 0) {
					$('#pl-name').html('<em>YOU MUST ADD NEW PLAYLIST.</em>');
					$('#ul-playlist').hide();
					$('#ul-playlist').html('').show('slow');
				}
				
				// Have next item.
				else {
					next.css('color', '#FFA500');
					next.attr({select: 1});
					$('#pl-name').text(next.text());
					songList('get');
				}
				
				playList('update');
			}
		});
		
		/**
		 * When play list's item click, 
		 * will change the selected of item, and show the item's song list in the data store. 
		 */
		$('#pl-a').live('click', function() {
			$('a[select=1]').removeAttr('style');
			$('a[select=1]').removeAttr('select');
			$(this).css('color', '#FFA500');
			$(this).attr({select: 1});
			
			if ($('#message').text() != default_msg.text()) {
				clearTimeout(timer);
				songList('update');
				playList('update');
			}
			
			$('#pl-name').text($(this).text());
			
			songList('get');
		});
		
		/**
		 * When user is logout, 
		 * will check the list is or not saved, if not, will saved all list, and logout. 
		 */
		$('#login a').bind('click', function() {
			if ($('#message').text() != default_msg.text()) {
				clearTimeout(timer);
				songList('update');
				playList('update');
				setTimeout("$(location).attr('href', $('#login a').attr('data'));", 1000);
			}
			else
				$(location).attr('href', $('#login a').attr('data'));
		});
	});
});

/**
 * To play the next music of the list. 
 */
function next() {
	var nextMedia = $('a[play=1]').parent().next().children();
	
	if (nextMedia[0] == undefined)
		nextMedia = $('#ul-playlist').children().first().children();
		
	playMusic(nextMedia);
}

/**
 * To play the previous music of the list. 
 */
function prev() {
	var preMedia = $('a[play=1]').parent().prev().children();
	
	if (preMedia[0] == undefined)
		preMedia = $('#ul-playlist').children().last().children();
	
	playMusic(preMedia);
}

/**
 * To play music of the media and show the media's information. 
 * @param {Object} aMedia
 */
function playMusic(aMedia) {
	$('a[play=1]').removeAttr('style');
	$('a[play=1]').removeAttr('Play');
	aMedia.attr({Play:1});
	aMedia.css("color", "#FFA500");
	
	if (aMedia.attr('media') == undefined) {
		jQuery.get('http://mymedia.yam.com/api/a/?pID=' + aMedia.attr('sid'), function(response) {
			if (response != '' && response != null) {
				var text = response.responseText;
				var mp3 = text.substring(text.indexOf('mp3file=') + 8, text.indexOf('.mp3') + 4);
				
				$('#jquery_jplayer_1').jPlayer("setMedia", {
					mp3: mp3,
				}).jPlayer("play");
			}
			else {
				next();
			}
		});
	}
	else
		$('#jquery_jplayer_1').jPlayer("setMedia", {
			mp3: aMedia.attr('media'),
		}).jPlayer("play");
	
	var _ul = $('<ul>');
	
	_ul.append($('<li>').html(aMedia.text()));
	
	$('.jp-title').html(_ul);
}

/**
 * Show the result list of query keyword and number of page.
 * @param {Object} num: number of page.
 * @param {Object} query: query's keyword.
 */
function showList(num, query) {
	
	if (num == -1) {
		var _ulDiv = $('<div>').attr({id: 'ul-div'});
		var _ul = $('<ul>').attr({id: 'ul-list'});
		var _showDiv = $('<div>').attr({class: 'more'}).html($('<a>').attr({class: 'showmore', name: query, href: 'javascript:void(0);'}));
		var _process = $('<div>').attr({id: 'search_process'}).html('Please wait...');
		
		_ulDiv.append(_ul).append(_showDiv).append(_process);
		
		$('#searchlist').html(_ulDiv);
		
		$('#ul-list').sortable({
			connectWith: "#ul-playlist"
		}).disableSelection();
		
		$('#ul-list').bind('sortstart', function(event, ui) {
			$('#ul-playlist').css('background', '#BBBBBB');
		});
		
		$('#ul-list').bind('sortstop', function(event, ui) {
			$('#ul-playlist').css('background', '#EEEEEE');
		});
	}
	
	$('#search_process').show();
	$('.showmore').attr('id', ++num).hide();

 	$.ajax({
		url: '/search',
		type: 'POST',
		data: {
			q: query, 
			n: num
		},
		async: true,
		dataType: 'JSON',
		success: function(response) {
			var _ul = $('#ul-list');
			var _a = $('.showmore');
			
			if (response != '' && response != null) {
				$.each(response, function() {
					_ul.append($('<li>').attr({class: 'ui-state-default'}).html($('<a>').attr({id: 'playSong', media: this[0], href: 'javascript:void(0);', sid: this[1]}).html(this[2])));
				});
				_a.text('More...');
				_a.attr({id: num});
			}
			else {
				$('.more').html('No Result.');
			}
			
			$('#search_process').hide();
			_a.show();
			
			if (num == 0)
				$('#searchlist').hide().fadeIn('slow');
		},
		error: function(resonse) {
			$('#search_process').hide();
			$('.showmore').text('Try again...');
			$('.showmore').show();
		}
	});
}

/**
 * To operate song list's data store, and given action (get, delete or update), and song name will work.
 * @param {Object} action: for get, delete or update.
 * @param {Object} songName: the song list name.
 */
function songList(action, songName) {
	switch(action) {
		case 'get':
			$.ajax({
				url: '/songlist',
				type: 'GET',
				async: true,
				data: {
					n: $('#pl-name').text()
				},
				dataType: 'JSON',
				success: function(response) {
					var _ul = $('#ul-playlist');
					_ul.html('');
					
					if (response != '' && response != null) {
						$.each(response, function() {
							var _li = $('<li>').attr({class: 'ui-state-default'});
							_li.append($('<a>').attr({id: 'playSong', href: 'javascript:void(0);', sid: this.id}).html(this.name));
							_ul.append(_li);
						});
					}
					
					_ul.hide().fadeIn('slow');
				}
			});
			break;
		case 'delete':
			$.ajax({
				url: '/songlist?n=' + songName,
				type: 'DELETE',
				async: true,
				dataType: 'text',
				success: function(response) {
				}
			});
			break;
		case 'update':
			var obj = Array();
			
			$.each($('#ul-playlist').children(), function() {
				var sid = $(this).children().attr('sid');
				var sname = $(this).children().html();
				
				obj.push({"name":sname,"id":sid});
			});
			var data = JSON.stringify(obj);
			
			$.ajax({
				url: '/songlist',
				type: 'POST',
				data: {
					n: $('#pl-name').text(),
					s: data
				},
				dataType: 'text',
				success: function(response) {
					$('#message').html('<em>All saved.</em>');
					setTimeout("$('#message').html(default_msg);", 3000);
				}
			});
			break;
	}
}

/**
 * To operate the play list's data store, and given the action what you want, will work.
 * @param {Object} action: for get or update.
 */
function playList(action) {
	switch(action) {
		case 'get':
			$.ajax({
				url: '/playlist',
				type: 'GET',
				async: true,
				dataType: 'JSON',
				success: function(response) {
					var _ul = $('#pl-ul-list');
					
					if (response != null || response != '') {
						$.each(response, function() {
							var _li = $('<li>').attr({class: 'ui-state-default'});
							_li.append($('<a>').attr({id: 'pl-a', href: 'javascript:void(0);'}).html(this.toString()));
							_ul.append(_li);
						});
					}					
					_ul.hide().fadeIn('slow');
					
					var next = _ul.first().children().first().children();
					if (next.length == 0) {
						$('#pl-name').html('<em>YOU MUST ADD NEW PLAYLIST.</em>');
					}
					else {
						next.css('color', '#FFA500');
						next.attr({select: 1});
						$('#pl-name').text(next.text());
						
						songList('get');
					}
				}
			});
			break;
		case 'update':
			var obj = Array();
			
			$.each($('#pl-ul-list').children(), function() {
				obj.push($(this).children().html());
			});
			
			var data = JSON.stringify(obj); 
			
			$.ajax({
				url: '/playlist',
				type: 'POST',
				data: {
					p: data
				},
				async: true,
				dataType: 'text',
				success: function(response) {
					$('#message').html('<em>All saved.</em>');
					setTimeout("$('#message').html(default_msg);", 3000);				},			});
			break;
	}
}

/**
 * To save the list.
 * @param {Object} action
 */
function saved(action) {
	switch(action) {
		case 'playlist':
			$('#message').attr({t: 5}).html('<em>List will be saved after 5 seconds...</em>');
			$('#message').fadeIn();
			if (timer != undefined)
				clearTimeout(timer);
			timer = setTimeout("saved('countdown')", 1000);
			break;
		case 'songlist':
			$('#message').attr({t: 5}).html('<em>List will be saved after 5 seconds...</em>');
			$('#message').fadeIn();
			if (timer != undefined)
				clearTimeout(timer);
			timer = setTimeout("saved('countdown')", 1000);
			break;
		case 'countdown':
			var _msg = $('#message');
			var _count = _msg.attr('t');
			
			if (_count > 0) {
				_msg.attr('t', --_count);
				_msg.html('<em>List will be saved after ' + _count + ' seconds...</em>');
				timer = setTimeout("saved('countdown')", 1000);
			}
			else {
				playList('update');
				songList('update');
			}
			_msg.hide().fadeIn();
			break;
		case 'countdownError':
			var _msg = $('#message');
			var _count = _msg.attr('t');
			
			if (_count > 0) {
				_msg.attr('t', --_count);
				_msg.html(s + _count + ' seconds...</em>');
				timer = setTimeout("saved('countdownError');", 1000);
			}
			else {
				_msg.html(default_msg);
				next();
			}
			_msg.hide().fadeIn();
			break;
		default:
			alert('de');
	}
}
