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


/*$(".register-form").submit(function(e) {
  e.preventDefault();
  $.ajax({
    url: window.location.href,
    type: "POST",
    data: {
      csrfmiddlewaretoken: getCookie('csrftoken'),
      username: document.querySelector('#id_username').value,
      email: document.querySelector('#id_email').value
    },
    success: function(json) {
      console.log(json);
    },
    error: function(json) {
      console.log('error');
    }
  })
})*/


/*function validate(a) {
  console.log(a);

  var u = document.querySelector('#id_username').value;
  var e = document.querySelector('#id_email').value;
  console.log(u);

  document.querySelector('#id_username').value = u;
  $.ajax({
    url: window.location.href,
    type: "POST",
    data: {
      csrfmiddlewaretoken: getCookie('csrftoken'),
      username: u,
      email: e
    },
    success: function(json) {
      document.querySelector('#id_username').value = u;
      console.log(u);
    },
    error: function(json) {
      document.querySelector('#id_username').value = u;
      document.getElementById('id_username').value = u;
      $('#id_username').value = u;
      console.log($('id_username').value);
      console.log(u);
    }
  })
}*/