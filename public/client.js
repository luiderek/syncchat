const WebSocketWrapper = require("ws-wrapper");
window.socket = new WebSocketWrapper(
	new WebSocket("ws://" + location.host)
);

socket.on("disconnect", function() {
});

socket.on("error", () => {
	socket.disconnect();
});


if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", runafterDOMload);
} else {  // `DOMContentLoaded` already fired
    runafterDOMload();
}

function runafterDOMload(){
	$("#newMessage").on("submit", function sendMessage(e) {
		// socket.emit("message", $("#message").val() );
		e.preventDefault();
	});

	socket.request("entry", $("#username").val() );
	socket.emit("joined room", location.pathname);

	socket.on('open line', function(name, color) {
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

	socket.on('update line', function(msg = "", name) {
		namedelement = document.getElementById('id:'+name).children[1];
		if (namedelement !== null) {
			namedelement.innerHTML = msg;
		}
	});

	socket.on('publish line', function(name) {
		var div = document.getElementById('id:' + name);
		div.id = ".";
		div.classList.add("fadein");
		div.classList.remove("slidein");
		// If tabbed out, change the title.
		// if (document.hidden){changeTitle();}
	});

	socket.on('close line', function(name, fade = 0) {
		closedMess = document.getElementById('id:'+name);
		closedMess.classList.remove("slidein");
		if (fade = 0){
			closedMess.classList.add("blipout");
		}
		else {
			closedMess.classList.add("fade");
		}
		function delaykill(){
			closedMess = document.getElementById('id:'+name)
			if (closedMess !== null){
				closedMess.remove();
				closedMess.id = ".";
			}
		}
		closetimeout = setTimeout(delaykill, 305);
	});


	// There's room for a CSS animation to go left to write rewriting into servertext.
	socket.on('server message', function(msg, color = "#9999ff") {
		placement = document.getElementById("messageList");
		let newDiv = document.createElement("div"),
				newMess = document.createElement("li");
		newDiv.classList.add("slideinnocol");
		newMess.style.color = color;
		newMess.innerHTML = msg;
		newDiv.appendChild(newMess);
		placement.appendChild(newDiv);
		scrollToBottom();
	});

	// Selects form when enter pressed.
	var sendform = document.getElementById("message");

	var line_open_status = 0;

	function enter_focus(e, type = 0){
		if (e.which === 13 || e.keyCode === 13) {
			if(document.activeElement === document.body)
			sendform.focus();
			else if (document.activeElement == sendform){
				if (sendform.value !== ""){
					socket.emit('publish line', sendform.value);
				}
				sendform.value = "";
				sendform.blur();
			}
		}

		function gain_focus(){
			if (line_open_status === 0)
			socket.emit('open line');
			line_open_status = 1;
		}

		function lose_focus(){
			if (sendform.value === "" && line_open_status === 1)
			socket.emit('close line');
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
		socket.emit('rolling update', sendform.value);
	}


	var messageDiv = document.getElementById("messageList");

	function scrollToBottom(){
		let isScrolledToBottom = messageDiv.scrollHeight - messageDiv.clientHeight <= messageDiv.scrollTop + 40;
		if (isScrolledToBottom){
			var scroll_interval = setInterval(function(){messageDiv.scrollTop = messageDiv.scrollHeight;}, 20);
			var scroll_timeout = setTimeout(function(){clearInterval(scroll_interval)}, 300);
		}
	}


	// Declaring all the event listeners.
	sendform.addEventListener('keyup', form_keyup);
	sendform.addEventListener('focus', enter_focus);
	sendform.addEventListener('blur', enter_focus);
	document.body.addEventListener('keyup', enter_focus, 1);

};
