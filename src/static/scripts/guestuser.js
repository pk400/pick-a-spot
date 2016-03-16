$( document ).ready(function() {
    // Creats a random username that is saved in the sessionstorage
    if ($("#guest-dashboard").length){
        if (localStorage.getItem('guestuser')){
            $("#guest-dashboard").after( localStorage.getItem('guestuser') );
        }
        else if ($("#guest-dashboard").text() == ""){
            var guestname = "Guest - " + Math.random().toString(36).substring(10);
            localStorage.setItem('guestuser', guestname);
            $("#guest-dashboard").after( document.createTextNode( guestname ) );
        }
    }
    else{
        localStorage.removeItem('guestuser');
    }
});