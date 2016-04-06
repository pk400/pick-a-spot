$( document ).ready(function() {
	window.onpopstate = function(e){
		console.log(e.state);
	    if(e.state == null) { 
	    	// state data not available
	    	// reloads page
	        location.reload();
	    }
	    else{
	    	var data = e.state;
	    	var pageUrl = 'http://zenit.senecac.on.ca:9089/map/?room=' + data.roomname;
	    	window.location.href = pageUrl;
	    }
	}
  	var csrftoken = getCookie('csrftoken');
  	var checkpara = window.location.href.split("?room=")[1]
  	// make room if it exists

  	// When user clicks the save button on the preferences modal
  	$('#btn-save').on('click', function() {
		var prefobject = {};
		prefobject.user = $(".username").text();
		prefobject.preferences = return_pref_object();
		updatePreferences();

		$(".map-container").show();
		make_room(JSON.stringify(prefobject));
		$(".optionschoice").hide();
		slideLeft.close();
	})

	if (checkpara == null){
		$("#createroom-btn").on("click", function(){
			var hiddenpref = $('#preferences-obj').text();
			if(hiddenpref == "") {
				slideLeft.open();
			}
			else {
				var prefobject = {};
				prefobject.user = $(".username").text();
				prefobject.preferences = return_pref_object();
				updatePreferences();

				$(".map-container").show();
				make_room(JSON.stringify(prefobject));
				$(".optionschoice").hide();
				slideLeft.close();
			}
		})
	}
	// if room exists, join with preferences
	else{
		// Guest mode, make sure preferences are set
		if ($("#guest-dashboard").length && $("#preferences-obj").text() == ""){
			$(".optionschoice").hide();
			$(".preferences-container").show();
			$("#btn-preferences").on("click", function(){
				var prefobject = {};
				prefobject.user = $(".username").text();
				prefobject.preferences = {};
				prefobject.preferences.preferences = return_pref_object();
				var listofpref = [prefobject];
				listofpref = JSON.stringify(listofpref);
				if(prefobject != null){
					// Saves in storage
					// Save prefobject instead
					var prefobjstr = JSON.stringify(prefobject)
					localStorage.setItem("listofpref", prefobjstr);					
					$(".preferences-container").hide();
					$(".map-container").show();
					$("#preferences-obj").text(prefobjstr);
					initMap();
					join_chat();
				}
			})
		}
		else{
			$(".optionschoice").hide();
			$(".map-container").show();
			initMap();
			join_chat();
		}
	}

	function fill_pref() {
  		var jsonvalues = JSON.parse($(".hidden-post-json").text());
	}

	function make_room(listofpref){
		initMap();
		var roomname = makeid();
		$.ajax({
			url: window.location.href,
			type: "POST",
			data: {
				owner: $(".username").text(),
				type: "makeroom",
				roomname: roomname ,
				listofpref: listofpref,
				csrfmiddlewaretoken: csrftoken,
			},
			success: function(json) {
				var pageUrl = '?room=' + roomname;
				window.history.pushState({'roomname' : roomname }, "", pageUrl);
				join_chat();

				if ($("#room-instances-dropdown").length == 0){
					var ul = $("<ul>",{
						id : "room-instances-dropdown",
						class : "dropdown-menu",
						role : "menu"
					});
					console.log(ul);
					$("#room-instances-li").append(ul);
				}
				/* FORMAT
					LI
						A
							SPAN
				*/
				var anchor = $("<a>",{
					href : "/map?room=" + roomname,
				});

				var span = $("<span>",{
					"data-duration" : "86400", // 24 hours in seconds
					class : "badge room-time-left"
				})

				var li = $("<li>");

				li.append(anchor);
				anchor.append(span);
				span.after("Room-" + roomname)
				$("#room-instances-dropdown").append(li);

				var count = parseInt($("#room-instances-badge-count").text()) + 1;
				$("#room-instances-badge-count").text(count);
			},
			error: function(json) {
			}
		})
	}

    function makeid(){
        var text = "";
        var possible = "ABCDEFGHJKMNOPQRSTUVWXYZabcdefghjkmnopqrstuvwxyz0123456789";

        for( var i=0; i < 8; i++ )
            text += possible.charAt(Math.floor(Math.random() * possible.length));

        return text;
    }
});