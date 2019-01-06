const http = require("http")
	, fs = require("fs")
	, WebSocketServer = require("ws").Server
	, WebSocketWrapper = require("ws-server-wrapper")
	, moduleConcat = require("module-concat")
	, koa = require("koa")
	, router = require("koa-router")();

// Create new HTTP server using koa and a new WebSocketServer
let app = new koa()
	, server = http.createServer(app.callback())
	, socketServer = new WebSocketWrapper(
			new WebSocketServer({server: server})
		);

const nameimport = require("./server/names.js");
const names = new nameimport();

const msgeval = require("./server/processmessage.js");
const msg_eval = new msgeval();

// Save all logged in `users`; keys are usernames
var users = {};
var hotel = {};

// takes in a socket. or a room.
// updates a "hotel" list that groups users sockets by rooms.
function usersInRoom(user, room = ""){
	let output = {};
	let match;

	if (room === "")
		match = users[user]._data.room;
	else {
		match = room;
	}

	// Gets a shorter list of users that share the same room.
	for(var i in users){
		if (users[i]._data.room === match)
			output[i] = users[i];
	}
	// Assigns that shorter list to the room name.
	hotel[match] = output;
}




socketServer.on("connection", function(socket) {
	socket.on("entry", function() {
		username = names.gen_name();
		while(username === "system" || (users[username] && users[username] !== this)){
			username = names.gen_name();
		}
		this.set("username", username);

		users[username] = this;
	})

	.on("joined room", function(path){
		this.set("room", path)

		console.log("");
		console.log("List of users:");

		for(var i in users){
			console.log(users[i]._data);
		}

		usersInRoom(this.get("username"));
	})

	.on("disconnect", function() {
		const sameroom = hotel[this.get("room")];
		for(var i in sameroom) {
			users[i].emit("close line", this.get("username"));
		}
		const username = socket.get("username");
		if(users[username]) {
			delete users[username];
		}
		usersInRoom("",this.get("room"));
	})

	.on("rolling update", function(msg){
		let p_msg = msg_eval.process(msg);
		// msg[0] is type, msg[1] is trimmed output.

		if (p_msg[0] == "none"){
			const sender = this.get("username");
			const sameroom = hotel[this.get("room")];
			for(var i in sameroom) {
				users[i].emit("update line", p_msg[1], sender);
			}
		}

		else if (p_msg[1] !== ""){
			newmsg = p_msg[0] + " | " + p_msg[1];
			if (p_msg[0] === "math"){
				newmsg = p_msg[1];
			}
			const sender = this.get("username");
			const sameroom = hotel[this.get("room")];
			for(var i in sameroom) {
				users[i].emit("update line", newmsg, sender);
			}
		}
	})

	// Opens a new line.
	.on("open line", function(){
		const sender = this.get("username");
		const color = names.gen_color(this.get("username"));
		// const sameroom = usersInRoom(sender);
		const sameroom = hotel[this.get("room")];
		for(var i in sameroom) {
			users[i].emit("open line", sender, color);
		}
	})

	// Closes a line. No line left behind.
	.on("close line", function(){
		const sameroom = hotel[this.get("room")];
		for(var i in sameroom) {			users[i].emit("close line", this.get("username"));
		}
	})

	// Updates the content of a currently opened line.
	.on("update line", function(msg){
		const sameroom = hotel[this.get("room")];
		for(var i in sameroom) {
			users[i].emit("update line", msg, this.get("username"));
		}
	})

	// Called to turn an open line into a published line.
	.on("publish line", function(msg){

		let p_msg = msg_eval.process(msg);
		let sameroom = hotel[this.get("room")];
		let username = this.get("username");

		if (p_msg[0] == "none" && p_msg[1] !== ""){
			for(var i in sameroom) {
				users[i].emit("update line", username, msg);
				users[i].emit("publish line", username, msg);
			}
		}

		else if (p_msg[1] !== ""){
			msg = p_msg[0] + " | " + p_msg[1];
			for(var i in sameroom) {
				users[i].emit("update line", username, msg);
			}

			if (p_msg[0] === "name"){
				let oldusername = this.get("username")
				this.set("username", p_msg[1])
				for(var i in sameroom) {
					users[i].emit("server message", oldusername + " has changed their name to " + p_msg[1] + ".");
				}
			}
			else if(true){
				for(var i in sameroom) {
					users[i].emit("publish line", username);
				}
			}
		}
	})

});

// Setup koa router
app.use(router.routes());
// Serve index.html and client.js

router.get("/r/(.*)", (ctx, next) => {
	ctx.type = "text/html";
	ctx.body = fs.createReadStream(__dirname + "/public/index.html");
});

router.get("/client.js", (ctx, next) => {
	ctx.type = "text/javascript";
	ctx.body = fs.createReadStream(__dirname + "/public/client_build.js");
});

// Build client.js using "node-module-concat",
// Run server on :3000 when done.
moduleConcat(__dirname + "/public/client.js", __dirname + "/public/client_build.js", function(err, stats) {
	if(err) {
		throw err;
	}

	const files = stats.files;
	console.log(`${files.length} files combined into build:\n`, files);

	const PORT = process.env.PORT || 3000;
	server.listen(PORT, () => {
		console.log("Listening on port " + PORT);
	});
});
