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

socket.of("chat").on('open line', function(name, color) {
	if (document.getElementById("id:"+name) === null){

		placement = document.getElementById("messageList");

		let newDiv = document.createElement("div"),
			newName = document.createElement("li"),
			newMess = document.createElement("li");

		newDiv.id = 'id:'+name;
		newName.classList.add("name");
		newName.style.color = color;
		newDiv.classList.add("slidein");

		newName.textContent = name + ": ";
		newMess.textContent = "";

		newDiv.appendChild(newName);
		newDiv.appendChild(newMess);

		placement.appendChild(newDiv);
		scrollToBottom();
	}
});

socket.of("chat").on('update line', function(msg = "", name) {
	namedelement = document.getElementById('id:'+name).children[1];
	if (namedelement !== null) {
			namedelement.textContent = msg;
	}
});

socket.of("chat").on('publish line', function(name) {
	var div = document.getElementById('id:' + name);
	div.id = ".";
	div.classList.add("fadein");
	div.classList.remove("slidein");
	// If tabbed out, change the title.
	if (document.hidden){changeTitle();}
});

socket.of("chat").on('close line', function(name) {
	closedMess = document.getElementById('id:'+name);
	closedMess.classList.remove("slidein");
	closedMess.classList.add("blipout");

	function delaykill(){
		closedMess = document.getElementById('id:'+name)
		if (closedMess !== null){
			closedMess.remove();
			closedMess.id = ".";
		}
	}
	closetimeout = setTimeout(delaykill, 305);
});

socket.of("chat").on('server message', function(msg, color = "##8b8bff") {
	placement = document.getElementById("messageList");
	let newMess = document.createElement("li");
	newMess.style.color = color;
	newContent = document.createTextNode(msg);
	newMess.appendChild(newContent);
	placement.appendChild(newMess);
	scrollToBottom();
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
			socket.of("chat").emit("close line");
		})
		.catch((err) => {
			console.error(err);
		});
}


function scrollToBottom(){
	let isScrolledToBottom = messageDiv.scrollHeight - messageDiv.clientHeight <= messageDiv.scrollTop + 30;
	if (isScrolledToBottom){
		var scroll_interval = setInterval(function(){messageDiv.scrollTop = messageDiv.scrollHeight;}, 25);
		var scroll_timeout = setTimeout(function(){clearInterval(scroll_interval)}, 300);
	}
}

function changeTitle(){
	update_count++;
	var newTitle = '(' + update_count +') ' + title;
	document.title = newTitle;
	// Maybe get it to flash the favicon as well? 1
}

$(() => {

	$("#newMessage").on("submit", function sendMessage(e) {
		// socket.of("chat").emit("message", $("#message").val() );
		e.preventDefault();
	});

	login();

	//addMessage("system", "Welcome!");

	// Selects form when enter pressed.
	var sendform = document.getElementById("message");

	var line_open_status = 0;

	function enter_focus(e, type = 0){
    if (e.which === 13 || e.keyCode === 13) {
      if(document.activeElement === document.body)
        sendform.focus();
      else if (document.activeElement == sendform){
				if (sendform.value !== ""){
					//socket.of("chat").emit('update line', sendform.value);
					socket.of("chat").emit('rollupdate', sendform.value);
					socket.of("chat").emit('publish line', sendform.value);
					//socket.of("chat").emit('message', sendform.value);
				}

				sendform.value = "";
	      sendform.blur();
			}
		}

		function gain_focus(){
			if (line_open_status === 0)
				socket.of("chat").emit('open line');
				line_open_status = 1;
			}


		function lose_focus(){
			if (sendform.value === "" && line_open_status === 1)
				socket.of("chat").emit('close line');
				line_open_status = 0;
			}

		if (document.activeElement === sendform){
			gain_focus();
		}
		else{
			lose_focus();
		}
	}

	function form_keyup(e){
		if (document.activeElement === sendform)
			socket.of("chat").emit('rollupdate', sendform.value);
	}

	// Declaring all the event listeners.
	sendform.addEventListener('keyup', form_keyup);

	sendform.addEventListener('focus', enter_focus);
	sendform.addEventListener('blur', enter_focus);
	document.body.addEventListener('keyup', enter_focus, 1);


});
