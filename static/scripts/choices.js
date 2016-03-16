$( document ).ready(function() {
	
	$("#pickoption").one("click", function(){
		$(".optionschoice").hide();
		$(".map-container").show();
		initMap();
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
			}
		})
	});

});