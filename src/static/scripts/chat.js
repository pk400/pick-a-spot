function join_chat(){
	var roomparameter = window.location.href.split("?")[1]
	room = roomparameter.split("room=")[1]
	var socketid = "?socketid=" + makeid();
	var user = "?user=" + $(".username").text();

	socket = new WebSocket("ws://zenit.senecac.on.ca:9089/map?" + roomparameter + socketid + user);
	socket.onopen = function(e){
		user_joined($(".username").text());
		// Lets others know you're online
		var connected = {};
		connected.username = $(".username").text();
		connected.typesent = "userjoin";
		connected.room = room;
		socket.send(JSON.stringify(connected));

		// Adds your preferences when you join the room
		var preferencesObj = $("#preferences-obj").text();
		// {preferences, user, typesent}
		var data = JSON.parse(preferencesObj);
		data.typesent = "mappref";
		data.room = room;
		socket.send(JSON.stringify(data));

		var csrftoken = getCookie('csrftoken');
		var listofuserspromise = $.ajax({
			url: window.location.href,
			type: "POST",
			data: {
			  csrfmiddlewaretoken : csrftoken,
			  roomname : location.search.split('?room=')[1],
			  type : "listofusers",
			}
		});
		listofuserspromise.then(function(data){
		  	if (data != ""){
				var listofusers = JSON.parse(data);
	    		$.each(listofusers, function(i){
	    			user_joined(listofusers[i].username, listofusers[i].online);
	    		});
	    	}
		});
		grab_and_set_setting();
		var csrftoken = getCookie('csrftoken');
		var getlastresultpromise = $.ajax({
			url: window.location.href,
			type: "POST",
			data: {
			  csrfmiddlewaretoken : csrftoken,
			  roomname : location.search.split('?room=')[1],
			  type : "getlastresult"
			}
		});
		getlastresultpromise.then(function(data){
			if (data != "None"){
				var parseobject = JSON.parse(data);
				pickaspotmap(parseobject);
			}
		});

	}
	socket.onerror = function(e){
		console.log(e);
	}

	socket.onclose = function(e){
		console.log(e);
	}
	socket.onmessage  = function(e) {
		if (e.data == "PING")
			return;
		var data = JSON.parse(e.data);
		if(data.typesent == "chat"){
    		chat_box_append(data.value, data.user, data.originaltime);
			// Scroll to bottom of chat
			var chatbox = $("#chat-list");
			chatbox.parent().animate({ 
				scrollTop: chatbox.height() 
			}, 0);
			save_chat();
		}
    	else if(data.typesent == "mappref"){
			var user = data.user;
			var preferences = data.preferences.preferences;
			var preferencesObj = {user: user, preferences: preferences};
			log_preferences(preferencesObj);
    	}
    	else if(data.typesent == "removepref"){
			var user = data.user;
			var preferences = data.preferences.preferences;
			var preferencesObj = {user: user, preferences: preferences};	
			remove_pref(preferencesObj);
    	}
    	else if(data.typesent == "syncmap"){
    		pickaspotmap(data);
    	}
    	else if(data.typesent == "userjoin"){
    		user_joined(data.username);
    	}
    	else if(data.typesent == "userleft"){
    		user_left(data.username);
    	}
    	else if(data.typesent == "stillexists"){
    		user_joined(data.username);
    	}
    	else if(data.typesent == "updatesetting"){
    		if(data.onlineonly == true){
    			$("#preferences-online")[0].checked = true;
    		}
    		else{
    			$("#preferences-everyone")[0].checked = true;
    		}

    		if(data.random == true){
    			$("#numberpick-one")[0].checked = true;
    		}
    		else{
    			$("#numberpick-twenty")[0].checked = true;
    		}
    	}    	
	}

	// Populate chatlog
	grab_chathistory();

	setInterval(function(){
		var PING = {
			room : room,
			text : "PING",
			typesent : "PING"
		}
		socket.send(JSON.stringify(PING));
	}, 50000);

	// Adds how long the past time has been
	function check_time(){
		$(".time-passed").each(function(){
			var element = $(this);
		 	var originaltime = element.attr("data-time");
		 	var currenttime = (new Date().getTime() / 1000)
		 	// converted into minutes
		 	var timepassed = parseInt((currenttime - originaltime) / 60);
		 	if (timepassed == 0){
		 		element.text("Less than a minute ago.");
		 	}
		 	else if (timepassed == 1){
		 		element.text(timepassed + " minute ago.")
		 	}
		 	else{
		 		element.text(timepassed + " minutes ago.")
		 	}
		});
	}	
	setInterval(function(){
		check_time();
	}, 10000);	

	$("#btn-ready-pick").on("click", function(){
		var settingobj = settings();
		run_results(settingobj.onlineonly, settingobj.random);
	})
	
	$("#btn-save-run-options").on("click", function(){
		save_setting();
		var settingobj = settings();
		run_results(settingobj.onlineonly, settingobj.random);		
	});

	$("#btn-save-options").on("click", function(){
		save_setting();
	});

	$('#ready-modal').on('hidden.bs.modal', function(){
		grab_and_set_setting();
	});

	/* SETTINGS */
	function settings(){
		var onlineonly = false;
		var random = false;
		if ($('#preferences-online:checked').length == 1)
			onlineonly = true;
		if($('#numberpick-one:checked').length == 1)
			random = true;

		var settingobj = {
			onlineonly : onlineonly,
			random : random
		}

		return settingobj;
	}

	function save_setting(){
		var settingobj = settings();
	    var csrftoken = getCookie('csrftoken');
	    var settingsgrabpromise = $.ajax({
	      url: window.location.href,
	      type: "POST",
	      data: {
	        csrfmiddlewaretoken : csrftoken,
	        roomname : location.search.split('?room=')[1],
	        type : "saveroomsettings",
	        onlineonly: settingobj.onlineonly,
	        random: settingobj.random,
	        success: function(){
	        	var updatesetting = {
	        		onlineonly : settingobj.onlineonly,
	        		random : settingobj.random,
	        		typesent : 'updatesetting',
	        		room : room,
	        	}
	        	socket.send(JSON.stringify(updatesetting));
	        }
	      }
	    });
	}

	function grab_and_set_setting(){
	    var csrftoken = getCookie('csrftoken');
	    var settingsgrabpromise = $.ajax({
	      url: window.location.href,
	      type: "POST",
	      data: {
	        csrfmiddlewaretoken : csrftoken,
	        roomname : location.search.split('?room=')[1],
	        type : "grabroomsettings"
	      }
	    });
		settingsgrabpromise.then(function(data){
			if(data != "None"){
				var roomsettings = JSON.parse(data);
				var onlineonly = roomsettings[0]
				var random = roomsettings[1]
	    		if(onlineonly == "true"){
	    			$("#preferences-online")[0].checked = true;
	    		}

	    		if(random == "true"){
	    			$("#numberpick-one")[0].checked = true;
	    		}
	    	}
		});
	}

	function run_results(onlineonly, random){
	    var csrftoken = getCookie('csrftoken');
	    var prefgrabpromise = $.ajax({
	      url: window.location.href,
	      type: "POST",
	      data: {
	        csrfmiddlewaretoken : csrftoken,
	        roomname : location.search.split('?room=')[1],
	        type : "grabpref"
	      }
	    });
	    prefgrabpromise.then(function(data){
	      var preferences = JSON.parse(data);
	      if (onlineonly == true)
	      	preferences = online_only(preferences);

	      // Grabs user and default choices
	      for (var i in preferences){
	        var pref = preferences[i];

	        // Add values into holders
	        priceList.push(pref.price);
	        distanceList.push(pref.distance);
	        for (var j in pref.userchoices){
	          keywordList.push(pref.userchoices[j]);
	        }
	        for (var k in pref.preferencesdefault){
	          keywordList.push(pref.preferencesdefault[k]);
	        }        
	      }
	      var parseobject = parsePreferences();
  		  parseobject.typesent = "syncmap";
  		  parseobject.random = random
  		  parseobject.cords = []
  		  if (localStorage['lng'] && localStorage['lat']){
	  		  parseobject.cords[0] = localStorage['lng'];
	  		  parseobject.cords[1] = localStorage['lat'];
	  	  }
	  	  else{
	  	  	parseobject.cords[0] = JSON.parse($("#lonlat-obj").text())[0];
	  	  	parseobject.cords[1] = JSON.parse($("#lonlat-obj").text())[1];
	  	  }
	  	  parseobject.room = room;

	      if (random == true)
	      	pickaspotmap(parseobject, random);
	      else{
	      	socket.send(JSON.stringify(parseobject));
			var csrftoken = getCookie('csrftoken');
			$.ajax({
				url: window.location.href,
				type: "POST",
				data: {
					csrfmiddlewaretoken : csrftoken,
					type : "savelastresult",
					roomname : location.search.split('?room=')[1],
					results : JSON.stringify(parseobject)
				}
			});   
	      }
	    });		
	}
	function online_only(prefobj){
		// Grabs the list, and makes a list of who's offline
		var offlinelist = [];
		$("#online-list").find(".name").each(function(){
			// Only those with that class are offline
			var found = $(this).parent().find('.online-indicator');
			if ($(found).hasClass("fa-square-o"))
				offlinelist.push($(this).text());
		});
		var i = prefobj.length -1;
		while(i > 0){
			$.each(offlinelist, function(j){
				if (prefobj[i].user.trim() == offlinelist[j].trim()){
					prefobj.splice(i, 1);
					return false;
				}
			});
			i--;	
		}
		return prefobj;
	}

	$('#btn-chat').on("click", function() {
		var value = $('#comment-box').val();
		send_message(value);
	})

	$('#comment-box').on("keypress", function(e) {
		var value = $(this).val();
		if (e.keyCode == 13 && !e.shiftKey) {
			e.preventDefault();
			send_message(value);
            return false; 
        }
	});

	function send_message(value) {
		if( value != "" ){
			var username = $(".username").text();
			// Send out to all users
			var sending = {
				value: value,
				user: username,
				typesent: "chat",
				originaltime: parseInt(new Date().getTime() / 1000),
				room: room
			}
			socket.send(JSON.stringify(sending));
			// Clear
			$('#comment-box').val("");
		}
	}

	function chat_box_append(stringinput, username, originaltime){
		/*
		FORMAT: LI
					DIV(CHAT-BODY)
						DIV(HEADER)
							STRONG(PRIMARY)
							SPAN(ICON)
							SMALL(TEXT-MUTED)
						P(CONTENT)
		*/
		var li = $("<li>",{
			class : "clearfix"
		});
		var strongprimary = $("<strong>",{
			class : "primary-font",
			text : username
		});

		var spanicon = $("<span>", {
			class: "glyphicon glyphicon-time text-muted"
		});

		var smallmuted = $("<small>",{
			class : "time-passed text-muted",
			"data-time" : originaltime,
		});

	    var chatbodydiv = $("<div>", {
	    	class : "chat-body clearfix"
	    });

	    var headerdiv = $("<div>",{
	    	class : "header"
	    }); 

	    var pcontent = $("<p>",{
	    	class : "data-database",
	    	text : stringinput,
			"data-time" : originaltime,
			"data-username" : username	    	
	    });

	    li.append(chatbodydiv);
	    chatbodydiv.append(headerdiv);
	    chatbodydiv.append(pcontent);
	    headerdiv.append(strongprimary);
	    headerdiv.append(spanicon);
	    headerdiv.append(smallmuted);

	    // decides which side to put it on
	    if(username == $(".username").text()){
	    	li.addClass("me");
	    	strongprimary.addClass("pull-right");
	    }
	    else{
	    	li.addClass("you");
	    	spanicon.addClass("pull-right");
	    	smallmuted.addClass("pull-right");
	    }

	    $("#chat-list").append(li);
	    check_time();
	}

	function log_preferences(preferencesObj){
		var prefgrabpromise = getPreferences();
		// wait for result
		prefgrabpromise.then(function(result){
			var listofpreferences;
			try{
				listofpreferences = JSON.parse(result);
				var found = false;
				var index;
				for (var i in listofpreferences) {
					var user = listofpreferences[i].user;
					if (user == preferencesObj.user){
						found = true;
						index = i;
						break;
					}

				}
				if(found){
					// updates item
					listofpreferences[index] = preferencesObj;
				}
				else{
					// add item
					listofpreferences.push(preferencesObj);
				}
			}catch(err){
				// listofpref was empty
				// Make new one instead
				listofpreferences = [preferencesObj];
			}
			updatePreferences(JSON.stringify(listofpreferences));
		})

	}

	function save_chat(){
		var csrftoken = getCookie('csrftoken');
		$.ajax({
			url: window.location.href,
			type: "POST",
			data: {
			  csrfmiddlewaretoken : csrftoken,
			  roomname : location.search.split('?room=')[1],
			  type : "savechathistory",
			  chathistory: JSON.stringify(grab_chat())
			}
		});
	}

	function grab_chat(){
		var chatlog = [];
		$(".data-database").each(function(){
			var time = $(this).attr("data-time");
			var username = $(this).attr("data-username");
			var text = $(this).text();
			var chatline = {
				time: time,
				username: username,
				text: text
			};
			chatlog.push(chatline);
		});
		return chatlog;
	}
	// Grabs the chatbox and populates
	function grab_chathistory(){
		var csrftoken = getCookie('csrftoken');
		$.ajax({
			url: window.location.href,
			type: "POST",
			data: {
			  csrfmiddlewaretoken : csrftoken,
			  roomname : location.search.split('?room=')[1],
			  type : "grabchathistory",
			},
			success: function(data) {
				// Populates chatbox
				if (data != "None"){
					var chatlog = JSON.parse(data);
					$.each(chatlog,function(i, chatline){
						var text = chatline.text;
						var username = chatline.username;				
						var time = chatline.time;
						chat_box_append(text, username, time);
					});
					// Scroll to bottom
					var chatbox = $("#chat-list");
					chatbox.parent().animate({ 
						scrollTop: chatbox.height() 
					}, 0);
				}	
			}
		});		
	}

	function user_joined(username, online){
		/**
			FORMAT
			LI
				I(FONTAWESOME-USER)
				LABEL(USERNAME)
				LABEL(PULLRIGHT)
					I(FONTAWESOME-SQUARE)
		**/
		var alreadythere = false;
		$("#online-list").find(".name").each(function(){
			if ($(this).text().trim() == username.trim()){
				var found = $(this).parent().find('.online-indicator')[0];
				$(found).removeClass('fa-square-o').addClass('fa-square');
				alreadythere = true;
				return false;
			}
		});

		if (alreadythere == false){
			var li = $("<li>",{
				class : "list-group-item text-left col-md-12",
			});

			var iuser = $("<i>", {
				class : "pull-left fa fa-user fa-2x"
			});

			var labelname = $("<label>",{
				class : "name",
				text : username
			});

			var labelpullright = $("<label>",{
				class : "pull-right"
			});

			var isquare = $("<i>", {
				class : "online-indicator fa fa-square fa-2x"
			});
			// If the user is offline, show it as that
			if (online == "false"){
				isquare = $("<i>", {
					class : "online-indicator fa fa-square-o fa-2x"
				});
			}
			li.append(iuser);
			li.append(labelname);
			li.append(labelpullright);
			labelpullright.append(isquare);
			var list = $("#online-list");

			// Makes sure yourself is on the top of the list
			if (username == $(".username").text())
				list.prepend(li);
			else
				list.append(li);
		}
	}

	function user_left(username){
		// This means the user left in an other tab
		if ($(".username").text().trim() == username.trim()){
			var stillexists = {
				room : room,
				username : username,
				typesent : "stillexists"
			}			
			socket.send(JSON.stringify(stillexists));
			return;
		}
		// See who's online, then makes them offline
		$("#online-list").find(".name").each(function(){
			if ($(this).text().trim() == username.trim()){
				var found = $(this).parent().find('.online-indicator')[0];
				$(found).removeClass('fa-square').addClass('fa-square-o');
			}
		});
	}

	function getCookie(name) {
	    var cookieValue = null;
	    if (document.cookie && document.cookie != '') {
	          var cookies = document.cookie.split(';');
	    for (var i = 0; i < cookies.length; i++) {
	         var cookie = jQuery.trim(cookies[i]);
	    // Does this cookie string begin with the name we want?
	    if (cookie.substring(0, name.length + 1) == (name + '=')) {
	      cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
	        break;
	       }
	    }
	  }
	 return cookieValue;
	}

	function getPreferences() {
		var csrftoken = getCookie('csrftoken');
		return $.ajax({
			url: window.location.href,
			type: "POST",
			data: {
			  csrfmiddlewaretoken : csrftoken,
			  roomname : location.search.split('?room=')[1],
			  type : "grabpref"
			}
		})
	}

	function updatePreferences(listofpref){
		var csrftoken = getCookie('csrftoken');
		$.ajax({
			url: window.location.href,
			type: "POST",
			data: {
			  csrfmiddlewaretoken : csrftoken,
			  roomname : location.search.split('?room=')[1],
			  type : "updatepref",
			  listofpref: listofpref
			}
		})		
	}
    function makeid(){
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for( var i=0; i < 4; i++ )
            text += possible.charAt(Math.floor(Math.random() * possible.length));

        return text;
    }  	
}
