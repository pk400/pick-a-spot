setInterval(function(){ 
    $(".room-time-left").each(function(){
        var duration = parseInt($(this).attr("data-duration"));
        if (duration > 0){
            $(this).text(hhmmss(duration));
            $(this).attr("data-duration", parseInt(duration-1));
        }
        else{
            $(this).parent().hide('slow', function(){ $(this).remove(); });
        }
    });
    
}, 1000)


function pad(num) {
    return ("0"+num).slice(-2);
}
function hhmmss(secs) {
  var minutes = Math.floor(secs / 60);
  secs = secs%60;
  var hours = Math.floor(minutes/60)
  minutes = minutes%60;
  return pad(hours)+":"+pad(minutes)+":"+pad(secs);
};


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

function addfriend(element){
  var csrftoken = getCookie('csrftoken');
  var self = element;
  var sender = self.attr("data-username");

  var postdata = {
    csrfmiddlewaretoken: csrftoken,
    sender: sender,
    type: "addfriend"
  };
    $.ajax({
      url: window.location.href,
      type: "POST",
      data: postdata,
      success: function(data) {
        removeli(self)
        
      }
    })
}

function declinefriend(element){
  var csrftoken = getCookie('csrftoken');
  var self = element;
  var sender = self.attr("data-username");

  var postdata = {
    csrfmiddlewaretoken: csrftoken,
    sender: sender,
    type: "declinefriend"
  };
    $.ajax({
      url: window.location.href,
      type: "POST",
      data: postdata,
      success: function(data) {
        removeli(self)
      }
    })
}

function removenotification(element){
  var csrftoken = getCookie('csrftoken');
  var self = element;
  var notificationid = self.attr("data-notificationid");
  var postdata = {
    csrfmiddlewaretoken: csrftoken,
    notificationid: notificationid,
    type: "removenotification"
  };
  $.ajax({
    url: window.location.href,
    type: "POST",
    data: postdata,
    success: function(data) {
      removeli(self)
    }
  })
}

function removeli(element){
  var self = element;
  var li = self.parent().parent();
  var ul = self.parent().parent().parent();
  li.remove();
  if (ul.has("li").length == 0){
    ul.hide();
  }
  var count = parseInt($("#notifications-badge-count").text());
  $("#notifications-badge-count").text(count - 1);


}

$(".friend-button-accept").on("click", function(e){
  e.preventDefault();
  addfriend($(this));
});

$(".friend-button-decline").on("click", function(e){
  e.preventDefault();
  declinefriend($(this));
});

$(".notification-button-decline").on("click", function(e){
  e.preventDefault();
  removenotification($(this));
});

$('.dropdown').on('click', function(event){
    var events = $._data(document, 'events') || {};
    events = events.click || [];
    for(var i = 0; i < events.length; i++) {
        if(events[i].selector) {

            //Check if the clicked element matches the event selector
            if($(event.target).is(events[i].selector)) {
                events[i].handler.call(event.target, event);
            }

            // Check if any of the clicked element parents matches the
            // delegated event selector (Emulating propagation)
            $(event.target).parents(events[i].selector).each(function(){
                events[i].handler.call(this, event);
            });
        }
    }
    event.stopPropagation(); //Always stop propagation
});