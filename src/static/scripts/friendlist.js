$("#btn-add").on("click", function(e){
  e.preventDefault();
  sendInvite();
});

$(".btn-delete").one("click", function(e){
  e.preventDefault();
  deletefriend($(this));
});

function deletefriend(element) {
  var self = element;
  var friend = self.attr("del");
  var csrftoken = getCookie('csrftoken');
  console.log('friend');
  
  var postdata = {
    csrfmiddlewaretoken: csrftoken,
    delfriend: friend,
    type : "deletefriend"
  };

  $.ajax({
    url: window.location.href,
      type: "POST",
      data: postdata,
      success: function(json) {
        self.parent().parent().hide("slow");
      }
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

function sendInvite() {
  var csrftoken = getCookie('csrftoken');
  var get_friend = document.querySelector('#friend-name').value;
  
  var postdata = {
    csrfmiddlewaretoken: csrftoken,
    newfriend: get_friend,
    type: "sendinvite"
  };

  if (get_friend != "") {
    document.querySelector('#friend-name').value = "";

    $.ajax({
      url: window.location.href,
      type: "POST",
      data: postdata,
      success: function(data) {
        var data = JSON.parse(data);
        var div = $("<div>", {
          class: 'just-added list-group-item text-left'
        });
        var label = $("<label>", {
          class: 'name',
          text: data.message
        });
        div.append(label);
        $("#friend-notification-label").empty();
        $("#friend-notification-label").append(div);
        /*
        var li = $("<li>", {
          href: '#',
          class: 'just-added list-group-item text-left '
        });

        var label = $("<label>", {
          class: 'name',
          text: get_friend
        });

        var label2 = $("<label>", {
          class: 'pull-right'
        });

        var a = $("<a>", {
          id: 'delete-'+get_friend,
          class: 'btn btn-danger btn-xs glyphicon glyphicon-trash btn-delete',
          href: '#',
          title: 'Delete',
          del: get_friend
        });

        var br = $("<div>", {
          class: 'break'
        });

        li.append(label);
        label2.append(a);
        li.append(label2);
        li.append(br);
        $(".scrollable").prepend(li);
        a.one("click",function(){
          deletefriend($(this));
        })
        //$("#friendlist").append("<li>"+get_friend+" <a href=\"#\">Remove</a></li>");*/

      }
      // on error: user does not exist
    })
  }
}