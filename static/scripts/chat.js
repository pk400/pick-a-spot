function join_chat(){
	var roomparameter = window.location.href.split("?")[1]
	var socketid = "?=socketid" + makeid();
	socket = new WebSocket("ws://zenit.senecac.on.ca:9089/map?" + roomparameter + socketid);

	socket.onopen = function(e){
		var preferencesObj = $("#preferences-obj").text();
		// {preferences, user, typesent}
		var data = JSON.parse(preferencesObj);
		data.typesent = "mappref";
		socket.send(JSON.stringify(data));
	}
	socket.ping = setInterval(function(){
		socket.send("----");
	}, 50000);
	socket.onerror = function(e){
		console.log(e);
	}

	socket.onclose = function(e){
		console.log(e);
	}
	socket.onmessage  = function(e) {
		var data = JSON.parse(e.data);
		if(data.typesent == "chat")
    		chat_box_append(data.value, data.user);
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
						typesent: "chat"
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

	function chat_box_append(stringinput, username){
		var chatbox = $("#panel-chat-box");

		/*
		FORMAT: <DIV>
				<BLOCKQUOTE>TEXT
		*/
		var div = $("<div>",{
	        class: 'clearfix'
	    });
	    var blockquoteclass;

	    // decides which side to put it on
	    if(username == $(".username").text()){
	    	blockquoteclass = "me pull-right";
	    }
	    else{
	    	blockquoteclass = "you pull-left";
	    }

	    var blockquote = $("<blockquote>",{
	    	text: stringinput,
	    	class: blockquoteclass
	    });

	    div.append(blockquote);
	    chatbox.append(div);
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
