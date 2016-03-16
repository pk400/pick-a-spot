$( document ).ready(function() {
    // Creats a random username that is saved in the sessionstorage
    if ($("#guest-dashboard").length){
        if (localStorage.getItem('guestuser')){
            $("#guest-dashboard").after( localStorage.getItem('guestuser') );
        }
        else if ($("#guest-dashboard").text() == ""){
            var guestname = "Guest - " + makeid();
            localStorage.setItem('guestuser', guestname);
            $("#guest-dashboard").after( document.createTextNode( guestname ) );
        }
    }
    else{
        localStorage.removeItem('guestuser');
    }

    function makeid(){
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for( var i=0; i < 5; i++ )
            text += possible.charAt(Math.floor(Math.random() * possible.length));

        return text;
    }    
});