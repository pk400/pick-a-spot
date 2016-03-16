$( document ).ready(function() {
	var socket = new WebSocket("ws://zenit.senecac.on.ca:9089/");
	socket.ping = setInterval(function(){
		socket.send("");
	}, 50000);
	socket.onmessage  = function(e) {
		var data = JSON.parse(e.data);
		if(data.user != $(".username").text())
	    	chat_box_append(data.value, false);
	}
	$('#comment-box').on("keypress", function(e) {
			var value = $(this).val();
			if (e.keyCode == 13 && !e.shiftKey) {
				e.preventDefault();
				if( value != "" ){
					// Append to chatbox
					chat_box_append(value, true);

					// Send out to all users
					var sending = {
						value: value,
						user: $(".username").text()
					}
					socket.send(JSON.stringify(sending));
					// Scroll to Top
					var chatbox = $("#panel-chat-box");
					chatbox.animate({ 
						scrollTop: chatbox.prop("scrollHeight") - chatbox.height() 
					}, 0);

					// Clear
					$(this).val("");
				}
	            return false; 
	        }
	});

	function chat_box_append(stringinput, self){
		var chatbox = $("#panel-chat-box");

		/*
		FORMAT: <DIV>
				<BLOCKQUOTE>TEXT
		*/
		var div = $("<div>",{
	        class: 'clearfix'
	    });
	    var blockquoteclass;

	    // decides which side to put it on
	    if(self){
	    	blockquoteclass = "me pull-right";
	    }
	    else{
	    	blockquoteclass = "you pull-left";
	    }

	    var blockquote = $("<blockquote>",{
	    	text: stringinput,
	    	class: blockquoteclass
	    });

	    div.append(blockquote);
	    chatbox.append(div);
	}

});