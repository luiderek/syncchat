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
	/* `this` refers to the WebSocketWrapper "chat" channel, which is unique
		for a given WebSocket */

	username = names.gen_name();

	while(username === "system" ||
		(users[username] && users[username] !== this)){
			username = names.gen_name();
		}

		// Notify all other users of user login
	for(var i in users) {
		users[i].emit("message", "system", username + " has connected.");
	}

	// Save the username
	this.set("username", username);

	// Note that the "chat" channel is actually stored in `users[username]`
	users[username] = this;
}

).on("message", function(msg) {
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
// test
	else if (p_msg[1] !== ""){
		msg = "Type: " + p_msg[0] + " | " + p_msg[1];
		const username = this.get("username");
			for(var i in users) {
				users[i].emit("message", username, msg);
			}

		//if type = math: what if it calculates as it types? radical.
		//if type = roll: what if it had a scrambler CSS while you typed it.


		if (p_msg[0] === "name"){
			let oldusername = this.get("username")
			this.set("username", p_msg[1])

			for(var i in users) {
				users[i].emit("message", "system", oldusername + " has changed their name to "+ p_msg[1] +".");
			}
		}

		if (p_msg[0] === "help"){
			for(var i in users) {
				users[i].emit("message", "system", "You're on your own bud.");
			}
		}
	}
})

.on("logout", function() {
	const username = this.get("username");
	userLogout(username);
});

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
