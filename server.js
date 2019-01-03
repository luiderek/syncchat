/* This chat server uses "ws" for Node.js WebSockets.
"node-module-concat" is used to bundle the client-side code at run-time.
*/
const http = require("http")
, fs = require("fs")
, WebSocketServer = require("ws").Server
, WebSocketServerWrapper = require("ws-server-wrapper")
, modConcat = require("module-concat");

const nameimport = require("./server/names.js");
const names = new nameimport();

const msg_processer = require("./server/processmessage.js");
const msgeval = new msg_processer();

// Create new HTTP server and a new WebSocketServer
const server = http.createServer(httpResHandler)
, socketServer = new WebSocketServerWrapper(
	new WebSocketServer({server: server})
);

// Save all logged in `users`; keys are usernames
var users = {};
function userLogout(username) {
	if(users[username]) {
		delete users[username];
		// Notify all other users
		for(var i in users) {
			users[i].emit("message", "system", username + " has disconnected.");
		}
	}
}

// Upon disconnect, log out user.
socketServer.on("disconnect", (socket) => {
	const username = socket.get("username");
	userLogout(username);
});

// Setup event handlers on the WebSocketServerWrapper for the "chat" channel
// Soon I'll have to replace "chat" with rooms themselves.
socketServer.of("chat").on("login", function() {
	username = names.gen_name();
	while(username === "system" || (users[username] && users[username] !== this)){
		username = names.gen_name();
	}
	this.set("username", username);
	// Note that the "chat" channel is actually stored in `users[username]`
	users[username] = this;
})

.on("rollupdate", function(msg){
	let p_msg = msgeval.process(msg);
	// msg[0] is type, msg[1] is trimmed output.

	if (p_msg[0] == "none"){
		const sender = this.get("username");
		for(var i in users) {
			users[i].emit("update line", p_msg[1], sender);
		}
	}

	else if (p_msg[1] !== ""){
		newmsg = p_msg[0] + " | " + p_msg[1];
		if (p_msg[0] === "math")
		newmsg = p_msg[1];
		const sender = this.get("username");
		for(var i in users) {
			users[i].emit("update line", newmsg, sender);
		}

		//if type = math: what if it calculates as it types? radical.
		//if type = roll: what if it had a scrambler CSS while you typed it.
	}
})

.on("message", function(msg) {
	// short for processed message.
	let p_msg = msgeval.process(msg);
	// here is a function that takes in a message and spits back
	// a cleaned up message or a "hmm. its math / dice / a name change"
	// msg[0] is type, msg[1] is trimmed output.

	if (p_msg[0] == "none" && p_msg[1] !== ""){
		const username = this.get("username");
		for(var i in users) {
			users[i].emit("message", username, msg);
		}
	}

	else if (p_msg[1] !== ""){
		msg = + p_msg[0] + " | " + p_msg[1];
		const username = this.get("username");
		for(var i in users) {
			users[i].emit("message", username, msg);
		}

		//if type = roll: what if it had a scrambler CSS while you typed it.

		if (p_msg[0] === "name"){
			let oldusername = this.get("username")
			this.set("username", p_msg[1])

			for(var i in users) {
				users[i].emit("message", "system", oldusername + " has changed their name to "+ p_msg[1] +".");
			}
		}

		// this is broken, but also not high priority for me.
		if (p_msg[0].substring(0,4) === "help"){
			for(var i in users) {
				users[i].emit("server message", "You're on your own bud.");
			}
		}
	}
})

.on("logout", function() {
	const username = this.get("username");
	userLogout(username);
})

// and so it begins
.on("open line", function(){
	const sender = this.get("username");
	const color = names.gen_color(this.get("username"));
	for(var i in users) {
		users[i].emit("open line", sender, color);
	}
})

.on("close line", function(){
	for(var i in users) {
		users[i].emit("close line", this.get("username"));
	}
})

.on("update line", function(msg){
	// If the first character is '=', try to dynamically do math?
	for(var i in users) {
		users[i].emit("update line", msg, this.get("username"));
	}
})

.on("publish line", function(msg){

	let p_msg = msgeval.process(msg);

	if (p_msg[0] == "none" && p_msg[1] !== ""){
		const username = this.get("username");
		for(var i in users) {
			users[i].emit("update line", username, msg);
			users[i].emit("publish line", username, msg);
		}
	}

	else if (p_msg[1] !== ""){
		msg = p_msg[0] + " | " + p_msg[1];
		const username = this.get("username");
		for(var i in users) {
			users[i].emit("update line", username, msg);
		}

		if (p_msg[0] === "name"){
			let oldusername = this.get("username")
			this.set("username", p_msg[1])

			for(var i in users) {
				users[i].emit("server message", oldusername + " has changed their name to " + p_msg[1] + ".");
			}
		}
		else if (p_msg[0] === "roll"){
			const criticalfail = diceTower.roll(msg.substring(1,msg.length)).result
			for(var i in users) {
				users[i].emit("publish line", this.get("username"));
				users[i].emit("server message", criticalfail);
			}
		}
		else if(true){
			for(var i in users) {
				users[i].emit("publish line", this.get("username"));
			}
		}
	}

	// this is broken, but also not high priority for me.
	/*
	if (p_msg[0] === "help"){
	for(var i in users) {
	users[i].emit("message", "system", "You're on your own bud.");
}
*/
})





function httpResHandler(req, res) {
	// Serve index.html and client.js
	if(req.url === "/") {
		res.setHeader("Content-Type", "text/html");
		fs.createReadStream(__dirname + "/index.html").pipe(res);
	} else if(req.url === "/client.js") {
		// Build client.js using "node-module-concat"
		// TODO: Make this happen only once; not for each request!
		const src = new modConcat.ModuleConcatStream(__dirname + "/client.js", {
			"browser": true
		});
		res.setHeader("Content-Type", "text/javascript");
		src.pipe(res);
	} else {
		res.statusCode = 404;
		res.end("Not Found");
	}
}

// Start the server after building client_build.js
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
	console.log("Listening on port " + PORT);
});
