$("#btn-add").on("click", function(e){
  e.preventDefault();
  addfriend();
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

function addfriend() {
  var csrftoken = getCookie('csrftoken');
  var get_friend = document.querySelector('#friend-name').value;
  
  if (get_friend != "") {
    document.querySelector('#friend-name').value = "";

    $.ajax({
      url: window.location.href,
      type: "POST",
      data: {
        csrfmiddlewaretoken: csrftoken,
        friend: get_friend
      },
      success: function(json) {
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
          class: 'btn btn-danger  btn-xs glyphicon glyphicon-trash',
          href: '#',
          title: 'Delete'
        });

        var br = $("<div>", {
          class: 'break'
        });

        li.append(label);
        label2.append(a);
        li.append(label2);
        li.append(br);
        $(".scrollable").prepend(li);

        //$("#friendlist").append("<li>"+get_friend+" <a href=\"#\">Remove</a></li>");
      }
      // on error: user does not exist
    })
  }

  function deletefriend() {
    var csrftoken = getCookie('csrftoken');
  }
}
