$( document ).ready(function() {
  	var csrftoken = getCookie('csrftoken');
  	var checkpara = window.location.href.split("?room=")[1]
	if (checkpara == null){
		$("#pickoption").one("click", function(){
			$(".optionschoice").hide();
			$(".map-container").show();
			initMap();
			join_chat();
		});

		$("#quickoption").one("click", function(){
			$(".optionschoice").hide();
			$(".preferences-container").show();
			$("#btn-preferences").on("click", function(){
				var prefobject = return_pref_object();
				if(prefobject != null){
					$(".preferences-container").hide();
					$(".map-container").show();
					initMap();
					var roomname = makeid();
					$.ajax({
						url: window.location.href,
						type: "POST",
						data: {
							roomname: roomname ,
							pref: prefobject,
	    					csrfmiddlewaretoken: csrftoken,
						},
						success: function(json) {
							var pageUrl = '?room=' + roomname;
							window.history.pushState('', '', pageUrl);
							join_chat();
						},
						error: function(json) {
							console.log({roomname: roomname ,pref: prefobject});
						}
					})
				}
			})
		});
	}
	else{
		$(".optionschoice").hide();
		$(".map-container").show();
		initMap();
		join_chat();	
	}

    function makeid(){
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for( var i=0; i < 8; i++ )
            text += possible.charAt(Math.floor(Math.random() * possible.length));

        return text;
    }   
});