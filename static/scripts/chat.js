function join_chat(){
	var roomparameter = window.location.href.split("?")[1]
	var socketid = "?=socketid" + makeid();
	function make_socket(){
		socket = new WebSocket("ws://zenit.senecac.on.ca:9089/map?" + roomparameter + socketid);

		socket.onopen = function(e){
			var preferencesObj = $("#preferences-obj").text();
			// {preferences, user, typesent}
			var data = JSON.parse(preferencesObj);
			data.typesent = "mappref";
			socket.send(JSON.stringify(data));
		}
		socket.onerror = function(e){
			//console.log(e);
		}

		socket.onclose = function(e){
			//console.log(e);
		}
		socket.onmessage  = function(e) {
			var data = JSON.parse(e.data);
			if(data.typesent == "chat")
	    		chat_box_append(data.value, data.user, data.originaltime);
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
		}
	}

	// Bug with dJango, on message stops working after a while
	// Have to rejoin
	make_socket();
	setInterval(function(){
		socket.close();
		make_socket();
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
	      preferences = JSON.parse(data);
	      for (var i in preferences){
	        var pref = preferences[i].preferences;

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
  		  parseobject.cords = []
  		  if (localStorage['lng'] && localStorage['lat']){
	  		  parseobject.cords[0] = localStorage['lng'];
	  		  parseobject.cords[1] = localStorage['lat'];
	  	  }
	  	  else{
	  	  	parseobject.cords[0] = JSON.parse($("#lonlat-obj").text())[0];
	  	  	parseobject.cords[1] = JSON.parse($("#lonlat-obj").text())[1];
	  	  }
	      socket.send(JSON.stringify(parseobject));
	    });
	})

	$('#comment-box').on("keypress", function(e) {
			var value = $(this).val();
			if (e.keyCode == 13 && !e.shiftKey) {
				e.preventDefault();
				if( value != "" ){
					var username = $(".username").text();
					// Send out to all users
					var sending = {
						value: value,
						user: username,
						typesent: "chat",
						originaltime: parseInt(new Date().getTime() / 1000)
					}
					socket.send(JSON.stringify(sending));
					// Scroll to Top
					var chatbox = $("#panel-chat-box");
					chatbox.animate({ 
						scrollTop: chatbox.prop("scrollHeight") - chatbox.height() 
					}, 0);

					// Clear
					$(this).val("");
				}
	            return false; 
	        }
	});

	function chat_box_append(stringinput, username, originaltime){
		console.log(originaltime);
		var chatbox = $("#panel-chat-box");

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
			"data-time" : originaltime
		});

	    var chatbodydiv = $("<div>", {
	    	class : "chat-body clearfix"
	    });

	    var headerdiv = $("<div>",{
	    	class : "header"
	    }); 

	    var pcontent = $("<p>",{
	    	text : stringinput
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

	function remove_pref(preferencesObj){
		var prefgrabpromise = getPreferences();
		// wait for result
		prefgrabpromise.then(function(result){
			var listofpreferences;
			try{
				listofpreferences = JSON.parse(result);
				var found = $.inArray(preferencesObj.username, listofpreferences);
				if (found >= 0){
					// removed
					listofpreferences.splice(found, 1);
				}
			}catch(err){
			// listofpref was empty
			}
			updatePreferences(JSON.stringify(listofpreferences));
		})		
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
