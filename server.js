const http = require("http")
	, fs = require("fs")
	, WebSocketServer = require("ws").Server
	, WebSocketWrapper = require("ws-server-wrapper")
	, moduleConcat = require("module-concat")
	, koa = require("koa")
	, logger = require('koa-morgan')
	, router = require("koa-router")();

// Create new HTTP server using koa and a new WebSocketServer
let app = new koa()
	, server = http.createServer(app.callback())
	, socketServer = new WebSocketWrapper(
			new WebSocketServer({server: server})
		);

const nameimport = require("./server/names.js");
const names = new nameimport();

const msg_processer = require("./server/processmessage.js");
const msgeval = new msg_processer();

// Save all logged in `users`; keys are usernames
var sockets = [];
var users = {};

function userRemove(username) {
	if(users[username]) {
		delete users[username];
	}
}

socketServer.on("connection", function(socket) {
	// Upon connection, wrap the socket and save it in the `sockets` array
	sockets.push(socket);

	socket.on("entry", function() {
		username = names.gen_name();
		while(username === "system" || (users[username] && users[username] !== this)){
			username = names.gen_name();
		}
		this.set("username", username);
		// Note that the "/chat" channel is actually stored in `users[username]`
		users[username] = this;
	})

	.on("disconnect", function() {
		const username = socket.get("username");
		userRemove(username);
		for(var i in users) {
			users[i].emit("close line", this.get("username"));
		}
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

	/*
	.on("logout", function() {
		const username = this.get("username");
		userRemove(username);
	})
	*/
	
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

			/*
			else if (p_msg[0] === "roll"){
				const criticalfail = diceTower.roll(msg.substring(1,msg.length)).result
				for(var i in users) {
					users[i].emit("publish line", this.get("username"));
					users[i].emit("server message", criticalfail);
				}
			}
			*/

			else if(true){
				for(var i in users) {
					users[i].emit("publish line", this.get("username"));
				}
			}
		}
	})

});

// Setup koa router
app.use(router.routes());
// Setup koa logger
app.use(logger('tiny'));
// Serve index.html and client.js

router.get("/r/(.*)", (ctx, next) => {
	ctx.type = "text/html";
	ctx.body = fs.createReadStream(__dirname + "/index.html");
});

router.get("/client.js", (ctx, next) => {
	ctx.type = "text/javascript";
	ctx.body = fs.createReadStream(__dirname + "/client_build.js");
});

// Build client.js using "node-module-concat",
// Run server on :3000 when done.
moduleConcat(__dirname + "/client.js", __dirname + "/client_build.js", function(err, stats) {
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
