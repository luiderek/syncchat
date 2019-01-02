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

socket.of("chat").on('open line', function(name) {
		placement = document.getElementById("messageList");

		let newDiv = document.createElement("div"),
			newName = document.createElement("li"),
			newMess = document.createElement("li");

		newDiv.id = 'id:'+name;
		newName.classList.add("name");
		// newName.style.color = color;
		// newDiv.classList.add("slidein");

		newName.textContent = name + ": ";
		newMess.textContent = "";

		newDiv.appendChild(newName);
		newDiv.appendChild(newMess);

		placement.appendChild(newDiv);
		// scrollToBottom();
	});

socket.of("chat").on('update line', function(msg = "", name, live_type) {
	namedelement = document.getElementById('id:'+name).children[1];
	if (namedelement !== null) {
			namedelement.textContent = msg;
	}
});

socket.of("chat").on('publish line', function(name) {
	var div = document.getElementById('id:' + name);
	div.id = "";
	div.classList.add("fadein");
	div.classList.remove("slidein")
	if (document.hidden){changeTitle();} // If tabbed out, notification ping.
});

socket.of("chat").on('close line', function(name) {
	closedMess = document.getElementById('id:'+name);
	// closedMess.classList.remove("slidein");
	// closedMess.classList.add("blipout");

	function delaykill(){
		if (closedMess !== null){
			closedMess.remove();
			closedMess.id = "";
		}
	}

	closetimeout = setTimeout(delaykill, 305);
});


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
				socket.of("chat").emit('open line');
      }
      else if (document.activeElement == sendform){
        socket.of("chat").emit('update line', sendform.value);
        socket.of("chat").emit('message', sendform.value);
				sendform.value = "";
				socket.of("chat").emit('close line');
	      sendform.blur();
			}
		}
  }

	function form_focus(e){
    if (document.activeElement === sendform){
			//if a line is not already open:
		}

		// If the sendform is no longer focused.
		else{
			// if a line is open, and it's contents are empty
      socket.of("chat").emit('close line');
    }
  }

	function form_keyup(e){
		if (document.activeElement === sendform)
			socket.of("chat").emit('update line', sendform.value);
	}

	// Declaring all the event listeners.
	sendform.addEventListener('keyup', form_keyup);
	sendform.addEventListener('focus', form_focus, true);
	sendform.addEventListener('blur', form_focus, true);
	document.body.addEventListener('keyup', enter_detect);


});
