const WebSocketWrapper = require("ws-wrapper");
window.socket = new WebSocketWrapper(
	new WebSocket("ws://" + location.host)
);

socket.on("disconnect", function(wasOpen) {
	// Check `wasOpen` flag, so we don't try to logout on each disconnection
	if(wasOpen)
		logout();
	// Auto-reconnect
	console.log("Reconnecting in 5 secs..");
	setTimeout(() => {
		socket.bind(new WebSocket("ws://" + location.host) );
	}, 5000);
});

socket.on("error", () => {
	socket.disconnect();
});

socket.of("chat").on("message", addMessage);

function addMessage(fromStr, msg) {
	// Add a message to the DOM
	let p = $('<p class="message">');
	let from = $('<span class="from">');
	if(fromStr === "system")
		from.addClass("system");
	else if(fromStr === $("#username").val() )
		from.addClass("me");
	from.append(fromStr + ":");
	p.append(from);
	p.append(" " + msg);
	let list = $("#messageList").append(p)[0];
	// Now scroll down automatically
	if(list.scrollHeight - list.scrollTop - list.clientHeight <= 30)
		list.scrollTop = list.scrollHeight;
}

function login() {
	$("#loginButton").hide();
	$("#username").attr("disabled", "disabled");
	// Send request to login
	socket.of("chat").request("login", $("#username").val() )
		.then(() => {
			// Login succeeded
			$("#logoutButton, #newMessage").show();
			addMessage("system", "You have been logged in");
			$("#message").val("").focus();
		})
		.catch((err) => {
			// Login failed; just logout...
			alert(err);
			logout();
		});
}

function logout() {
	$("#logoutButton, #newMessage").hide();
	$("#loginButton").show();
	$("#username").removeAttr("disabled");
	// Send request to logout
	socket.of("chat").request("logout")
		.then(() => {
			addMessage("system", "You have been logged out");
		})
		.catch((err) => {
			console.error(err);
		});
}

$(() => {

	$("#newMessage").on("submit", function sendMessage(e) {
		socket.of("chat").emit("message", $("#message").val() );
		$("#message").val("").focus();
		e.preventDefault();
	});

	login();

	addMessage("system", "Welcome!");

	// Selects form when enter pressed.
	var sendform = document.getElementById("message");

	function enter_detect(e){
    if (e.which === 13 || e.keyCode === 13) {
      if(document.activeElement === document.body){
        sendform.focus();
				//if a line is not already open:
				//socket.of("chat").emit('open line');
      }
      else if (document.activeElement == sendform){
        socket.of("chat").emit('update line', sendform.value);
        socket.of("chat").emit('message', sendform.value);
				sendform.value = "";
				socket.emit('close line');
	      sendform.blur();
			}
		}
  }

	function form_focus(e){
    if (document.activeElement === sendform){
			//if a line is not already open:
      //socket.emit('open message', live_type)
		}

		// If the sendform is no longer focused.
		else{
			// if a line is open, and it's contents are empty
      socket.emit('close line');
    }
  }

	function form_keyup(e){
		if (document.activeElement === sendform)
			socket.emit('update line', sendform.value, live_type);
	}

	// Declaring all the event listeners.
	sendform.addEventListener('keyup', form_keyup);
	sendform.addEventListener('focus', form_focus, true);
	sendform.addEventListener('blur', form_focus, true);
	document.body.addEventListener('keyup', enter_detect);


});
