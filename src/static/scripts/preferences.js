$("#search-add").on("keypress", function(e){
  if (e.which === 13) {
    add_element()
  }
});

$("#btn-add").on("click", function(){
  add_element();
});

function add_element(){
    var value = $("#search-add").val().trim();
    var holditems = grab_all_user_choices();
    if ($.inArray(value.toLowerCase(), holditems) == -1 || value != ""){
      create_node(value);
    }
    else{
      alert("TODO: Alert user of duplicate");
      $("#search-add").val("");
    }
}

function create_node(value){
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
  try{
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
  catch(err){
    alert("Fill out Price and/or Distance");
  }
}

$("#btn-save").on("click", function(e){
  e.preventDefault();
  updatePreferences();
});

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

function updatePreferences() {
  var pref = JSON.stringify(return_pref_object());
  var csrftoken = getCookie('csrftoken');
  
  $.ajax({
    url: window.location.href,
    type: "POST",
    data: {
      csrfmiddlewaretoken : csrftoken,
      preferences : pref
    },
    success: function(json) {
      console.log('success');
      $('.hidden-post-json').val('');
      console.log(json);
    },
    error: function(xhr,errmsg,err) {
      console.log(xhr); // provide a bit more info about the error to the console
    }
  })
}

function fill_form(){
  var jsonvalues = JSON.parse($(".hidden-post-json").text())
  jsonvalues = jsonvalues.preferences;

  // Fill out price
  $('input[name="pricerad"][value="' + jsonvalues.price + '"]').parent().click();

  // Fill out distance
  $('input[name="distance"][value="' + jsonvalues.distance + '"]').parent().click();

  // Check off all the checkboxes
  $.each(jsonvalues.preferencesdefault, function(key, value){
    $('input[name="' + value + '"]').parent().click();
  });  

  // Append all values
  $.each(jsonvalues.userchoices, function(key, value){
    create_node(value);
  });    
}

$( document ).ready(function() {
  try{
    fill_form();
  }catch(err){}

});