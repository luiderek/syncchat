function evaluatorModule(msg) {
  // Possible types: math, dice, name, help
  let type = "none";
  msg = ''+msg; msg = msg.trim();

  var mexp = require('math-expression-evaluator');

  // function that returns the [type,trimed] of message.
  this.process = function(msg){
    switch (msg.substring(0,1)){
      case "/":
        switch (true){

          case msg.substring(1,6) === "roll ":
            msg = msg.substring(3,msg.length);
          case msg.substring(1,3) === "r ":
            msg = msg.substring(3,msg.length);
            type = "roll";
            break;

          // User, nick, name, all call the name function.
          case msg.substring(1,8) === "rename ":
            msg = msg.substring(2,msg.length);
          case msg.substring(1,6) === "nick ":
          case msg.substring(1,6) === "name ":
            msg = msg.substring(6,msg.length);
            type = "name";
            break;

          case msg.substring(1,5) === "help":
            msg = msg.substring(3,msg.length);
          case msg.substring(1,2) === "?":
            msg = msg.substring(2,msg.length).trim();
            type = "help";
            if (msg = ""){
              msg = "placeholdertext";
            }
            break;

          default:
            type = "none";
            msg = "";
            break;
          }
        break;

      case "=":
        type = "math";
        msg = msg.substring(1,msg.length);
        try {
          var value = mexp.eval(msg);
          msg = msg + " = " + value;
          send_message("txt");
        } catch (error) {}
        break;

      default:
        type = "none";
        break;
    }
    return [type,msg];
  }

}

module.exports = evaluatorModule;



/*



socket.on('message eval', function (msg, toggle = 1) {
  msg = '' + msg; // using the evils of javascript for the power of good.
  msg = msg.trim(); // removing excess spaces
  maxmsglength = 200;
  msg = msg.substring(0, Math.min(maxmsglength, msg.length));

  function send_message(msg_type) {
    if (msg !== "") {
      if (msg_type == "txt"){
        if (toggle == 0) {
          io.in(client.room).emit('chat message', msg, client.name, client.color);
        } else {
          io.in(client.room).emit('update message', msg, client.name, 1);
          io.in(client.room).emit('publish message', client.name);
        }
      }
      else if (msg_type == "img"){
        io.in(client.room).emit('image', msg, client.name, client.color);
      }
    }
  }

  switch (true) {

    default:
      send_message("txt");
      break;

    case msg.substring(0, 1) === "/":
      switch (true) {


        case msg.substring(0, 3) == "/r ":
          rollstring = msg.substring(3, msg.length);
        case msg.substring(0, 6) == "/roll ":
          if (typeof rollstring === 'undefined')
            rollstring = msg.substring(6, msg.length);

          try {
            rollresult = cup.roll(rollstring);

            var newstring = '';
            for (i = 0; i < rollresult.length; i++) {
              if (i > 0)
                newstring += '|  '
              newstring += '[' + rollresult[i]['rolls'] + '] '
              if (rollresult[i]['rolls'].length > 1)
                newstring += 'Sum: ' + rollresult[i]['total'] + '  ';
            }

            if (newstring.length > 160) {
              newstring = newstring.substring(0, 160);
              newstring += " ..."
            }

            io.in(client.room).emit('server message', newstring);
            msg = rollstring;
            send_message("txt");

          } catch (error) {
            break;
          }
          break;

        case msg.substring(0, 2) === "/?":
        case msg.substring(0, 5) == "/help":
          if (msg.substring(0, 10) === "/help math" || msg.substring(0, 7) === "/? math") {
            io.in(client.room).emit('server message', "We all need help with math. See here: https://www.npmjs.com/package/math-expression-evaluator")
            break;
          }

          io.in(client.room).emit('server message', "/roll <dice notation> for nerds and conflict resolution. Start messages with '=' to do math.")
          io.in(client.room).emit('server message', "Really " + client.name + "? You really need help? /name for changing names. /help for help. Enter to open the chat bar.")

          break;

        case msg.substring(0, 5) == "/nick":
        case msg.substring(0, 5) == "/name":
          var maxnamelength = 6 + 24;
          var name = client.name;
          var new_name = msg.substring(6, Math.min(maxnamelength, msg.length)).trim();
          if (_.findIndex(users, {
            name: new_name
          }) == -1 && new_name != "") {
            client.name = new_name;
            client.color = generate_color(client.name)
          } else {
            client.name = generate_name();
            client.color = generate_color(client.name)
          }
          io.in(client.room).emit('server message', name + ' has changed name into ' + client.name);
          io.in(client.room).emit('close message', name);
          io.in(client.room).emit('usercount', names_in_room(client.room));
          break;

      }
      break;

    case msg.substring(0, 1) == "=":
      try {
        var value = mexp.eval(msg.substring(1, msg.length));
        msg = msg.substring(1, msg.length) + " = " + value;
        send_message("txt");
      } catch (error) {}
      break;

  }
});

*/
