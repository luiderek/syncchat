const http = require('http');
const fs = require('fs');
const WebSocketServer = require('ws').Server;
const WebSocketWrapper = require('ws-server-wrapper');
const moduleConcat = require('module-concat');
const Koa = require('koa');
const router = require('koa-router')();
const path = require('path');

// Create new HTTP server using koa and a new WebSocketServer
const app = new Koa();
const server = http.createServer(app.callback());
const socketServer = new WebSocketWrapper(
  new WebSocketServer({ server: server })
);

const NameModule = require('./server/names.js');
const names = new NameModule();
const EvalModule = require('./server/processmessage.js');
const msgEval = new EvalModule();

// Save all logged in `users`; keys are usernames
var users = {};
var hotel = {};

// takes in a socket. or a room.
// updates a "hotel" list that groups users sockets by rooms.
function usersInRoom(user, room = '') {
  const output = {};
  let match;

  // okay this line has some problems. gotta figure out how to unbreak it
  if (room === '') {
    // for some reason users[user] is occasionally undef when refreshing too often?
    // not sure of the setoff conditions but this null check might fix it to some degree.
    if (users[user]) {
      match = users[user]._data.room;
    }
    // console.log('user:', user);
    // console.log('users[user]._data:', users[user]._data);
  } else {
    console.log('user', user);
    match = room;
  }

  // Gets a shorter list of users that share the same room.
  for (const i in users) {
    // giving the same null check here not sure if necessary but w/e
    if (users[i]) {
      if (users[i]._data.room === match) {
        output[i] = users[i];
      }
    }
  }

  // Assigns that shorter list to the room name.
  hotel[match] = output;
}

socketServer.on('connection', function (socket) {
  socket.on('entry', function () {
    let username = names.gen_name();
    while (username === 'system' || (users[username] && users[username] !== this)) {
      username = names.gen_name();
    }
    this.set('username', username);

    users[username] = this;
  })

    .on('joined room', function (path) {
      this.set('room', path);

      console.log('');
      console.log('List of users: ');

      for (var i in users) {
        console.log(users[i]._data);
      }

      console.log('');

      usersInRoom(this.get('username'));
    })

    .on('disconnect', function () {
      const sameroom = hotel[this.get('room')];
      for (var i in sameroom) {
        users[i].emit('close line', this.get('username'));
      }
      const username = socket.get('username');
      if (users[username]) {
        delete users[username];
      }
      usersInRoom('', this.get('room'));
    })

    .on('rolling update', function (msg) {
      const p_msg = msgEval.process(msg);
      // msg[0] is type, msg[1] is trimmed output.

      if (p_msg[0] == 'none') {
        const sender = this.get('username');
        const sameroom = hotel[this.get('room')];
        for (var i in sameroom) {
          users[i].emit('update line', p_msg[1], sender);
        }
      } else if (p_msg[1] !== '') {
        newmsg = p_msg[0] + ' | ' + p_msg[1];
        if (p_msg[0] === 'math') {
          newmsg = p_msg[1];
        }
        const sender = this.get('username');
        const sameroom = hotel[this.get('room')];
        for (var i in sameroom) {
          users[i].emit('update line', newmsg, sender);
        }
      }
    })

    // Opens a new line.
    .on('open line', function () {
      const sender = this.get('username');
      const color = names.gen_color(this.get('username'));
      // const sameroom = usersInRoom(sender);
      const sameroom = hotel[this.get('room')];
      for (var i in sameroom) {
        users[i].emit('open line', sender, color);
      }
    })

    // Closes a line. No line left behind.
    .on('close line', function () {
      const sameroom = hotel[this.get('room')];
      for (var i in sameroom) {
        users[i].emit('close line', this.get('username'));
      }
    })

    // Updates the content of a currently opened line.
    .on('update line', function (msg) {
      const sameroom = hotel[this.get('room')];
      for (var i in sameroom) {
        users[i].emit('update line', msg, this.get('username'));
      }
    })

    // Called to turn an open line into a published line.
    .on('publish line', function (msg) {

      const p_msg = msgEval.process(msg);
      const sameroom = hotel[this.get('room')];
      const username = this.get('username');

      if (p_msg[0] === 'none' && p_msg[1] !== '') {
        for (var i in sameroom) {
          users[i].emit('update line', p_msg[1], username);
          users[i].emit('publish line', username, p_msg[1]);
          console.log(username + ": " + p_msg[1]);
        }
      } else if (p_msg[1] !== '') {
        msg = p_msg[0] + ' | ' + p_msg[1];
        for (var i in sameroom) {
          users[i].emit('update line', username, msg);
        }

        // if I could figure out how to multicolor lines, mmmmm. hot.
        if (p_msg[0] === 'name') {
          let out = '~' + username + '~ is now *' + p_msg[1] + '*';
          out = msgEval.format(out);
          for (const i in sameroom) {
            users[i].emit('close line', this.get('username'), fade = 1);
            users[i].emit('server message', out);
          }
          this.set('username', p_msg[1]);
        } else if (p_msg[0] === 'stats') {
          for (const i in sameroom) {
            let a;
            for (a = 0; a < 30; a++) {
              users[i].emit('server message', 'spam');
            }
          }
        }
        if (p_msg[0] !== 'name') {
          for (const i in sameroom) {
            users[i].emit('publish line', username);
          }
        }
      }
    });

});

// Setup koa router
app.use(router.routes());

// Serve index.html and client.js
// __dirname is a node environmental variable
router.get('/styles.css', (ctx, next) => {
  ctx.type = 'text/css';
  ctx.body = fs.createReadStream(path.join(__dirname, '/public/styles.css'));
});

router.get('/r/(.*)', (ctx, next) => {
  ctx.type = 'text/html';
  ctx.body = fs.createReadStream(path.join(__dirname, '/public/index.html'));
});

router.get('/client.js', (ctx, next) => {
  ctx.type = 'text/javascript';
  ctx.body = fs.createReadStream(path.join(__dirname, '/public/client_build.js'));
});

router.get('/', (ctx, next) => {
  ctx.type = 'text/html';
  ctx.body = fs.createReadStream(path.join(__dirname, '/public/redirect.html'));
});

// Build client.js using "node-module-concat",
// Run server on :3000 when done.
moduleConcat(
  path.join(__dirname, '/public/client.js'),
  path.join(__dirname, '/public/client_build.js'),
  function (err, stats) {
    if (err) {
      throw err;
    }

    const files = stats.files;
    console.log(`${files.length} files combined into build:\n`, files);

    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
      console.log('Listening on port ' + PORT);
    });
  });
