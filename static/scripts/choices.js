$( document ).ready(function() {
	$("#preferences-obj").text(localStorage.listofpref);
  	var csrftoken = getCookie('csrftoken');
  	var checkpara = window.location.href.split("?room=")[1]
  	// make room if it exists
	if (checkpara == null){
		$("#pickoption").one("click", function(){
			$(".optionschoice").hide();
			$(".map-container").show();
			var data = $("#preferences-obj").text();
			var prefobject = JSON.parse(data);
			var listofpref = [prefobject];
			listofpref = JSON.stringify(listofpref);
			make_room(listofpref);
		});

		$("#quickoption").one("click", function(){
			$(".optionschoice").hide();
			if ($("#preferences-obj").text() == ""){
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
						make_room(listofpref);
					}
				})
			}
			else{
				var listofpref = $("#preferences-obj").text();
				$(".map-container").show();					
				make_room(listofpref);				
			}
		});
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
				window.history.pushState('', '', pageUrl);
				join_chat();
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