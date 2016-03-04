$("#search-add").on("keypress", function(e){
	if (e.which === 13) {
		add_element_()
	}
});

$("#btn-add").on("click", function(){
	add_element_();
});

function add_element_(){
		var value = $("#search-add").val().trim();
    var holditems = grab_all_user_choices();
    if ($.inArray(value.toLowerCase(), holditems) == -1 || value != ""){
      // Making elements that will be added
      /* Format: <label>
                  <span>Text</span><i>
                 </label>
      */
      var label = $("<label>",{
        class: 'btn'
      });

      var span = $("<span>",{
        text: value + " ",
        class: "user-food-option"
      });

      var icon = $("<i>",{
        class: "fa fa-times"
      });

      label.append(span);
      label.append(icon);
      $("#user-food-options").append(label);
      // Adds item to the list on the right
      remove_from_list(label);
      $("#search-add").val("");
		}
    else{
    	alert("TODO: Alert user of duplicate");
      $("#search-add").val("");
    }
}

function remove_from_list(element){
	element.on("click", function(){
  	$(this).remove();
  });
}

function grab_all_user_choices(){
	var holditems = [];
   $(".user-food-option").each(function(){
        holditems.push($(this).text().trim().toLowerCase());
  });
  return holditems;
}

function return_pref_object(){
  var preferences = {};
  preferences.price = document.querySelector('input[name="pricerad"]:checked').value;
  preferences.distance = document.querySelector('input[name="distance"]:checked').value;
  var preferencesdefault = [];
  $("#default-food-options").find(".active>input").each(function(){
    preferencesdefault.push(this.name);
  })
  preferences.preferencesdefault = preferencesdefault;
  preferences.userchoices = grab_all_user_choices();
  return preferences;
}

$("#btn-save").on("click", function(){alert(JSON.stringify(return_pref_object())); console.log(return_pref_object())});