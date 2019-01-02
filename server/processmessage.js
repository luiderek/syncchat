function evaluatorModule(msg) {
  // Possible types: math, dice, name, help
  let type = "none";
  msg = ''+msg; msg = msg.trim();

  // Length Trimming.
  const maxmsglength = 300;
  msg = msg.substring(0, Math.min(maxmsglength, msg.length));

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
            msg = msg.substring(3, msg.length);
          case msg.substring(1,2) === "?":
            msg = msg.substring(2, msg.length);
            type = "help";
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
