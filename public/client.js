/* eslint-disable no-undef */
const WebSocketWrapper = require('ws-wrapper');
window.socket = new WebSocketWrapper(
  new WebSocket('ws://' + location.host)
);

socket.on('disconnect', function () {
});

socket.on('error', () => {
  socket.disconnect();
});

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', runafterDOMload);
} else { // `DOMContentLoaded` already fired
  runafterDOMload();
}

function runafterDOMload() {
  // slowly on a path to kill all jquery native stronk
  $newMessage = document.querySelector('#newMessage');
  $newMessage.addEventListener('submit', function sendMessage(e) {
    $message = document.querySelector('#message');
    // console.log('messageval:', $('#message').val());
    // console.log('$message:', $message);
    // console.log('messagetc:', $message.value);
    socket.emit('message', $message.value);
    e.preventDefault();
  });

  socket.request('entry');
  // okay, yeah so the entry request never needed a second argument.
  // socket.request('entry', $('#username').val());
  socket.emit('joined room', location.pathname);

  socket.on('open line', function (name, color) {
    if (document.getElementById('id:' + name) === null) {
      const placement = document.getElementById('messageList');
      const newDiv = document.createElement('div');
      const newName = document.createElement('span');
      const newMess = document.createElement('span');
      newDiv.id = 'id:' + name;
      newName.classList.add('name');
      newName.style.color = color;
      newDiv.classList.add('slidein');
      newName.textContent = name + ': ';
      newMess.textContent = '';
      newDiv.appendChild(newName);
      newDiv.appendChild(newMess);
      placement.appendChild(newDiv);
      scrollToBottom();
    }
  });

  socket.on('update line', function (msg = '', name) {
    const namedelement = document.getElementById('id:' + name).children[1];
    if (namedelement !== null) {
      namedelement.innerHTML = msg;
    }
  });

  socket.on('publish line', function (name) {
    var div = document.getElementById('id:' + name);
    div.removeAttribute('id');
    div.classList.add('fadein');
    div.classList.remove('slidein');
    // If tabbed out, change the title.
    // if (document.hidden){changeTitle();}
  });

  socket.on('close line', function (name, fade = 0) {
    let closedMess = document.getElementById('id:' + name);
    closedMess.classList.remove('slidein');
    if (fade === 0) {
      closedMess.classList.add('blipout');
    } else {
      closedMess.classList.add('fade');
    }
    function delaykill() {
      closedMess = document.getElementById('id:' + name);
      if (closedMess !== null) {
        closedMess.remove();
      }
    }
    // i used to do a variable assignmnet to this function call
    // unsure if it's needed, NTS in case of weird behavior
    setTimeout(delaykill, 305);
  });

  // There's room for a CSS animation to go left to write rewriting into servertext.
  socket.on('server message', function (msg, color = '#9999ff') {
    const placement = document.getElementById('messageList');
    const newDiv = document.createElement('div');
    const newMess = document.createElement('li');
    newDiv.classList.add('slideinnocol');
    newMess.style.color = color;
    newMess.innerHTML = msg;
    newDiv.appendChild(newMess);
    placement.appendChild(newDiv);
    scrollToBottom();
  });

  // Selects form when enter pressed.
  var sendform = document.getElementById('message');

  var isLineOpen = 0;

  function enterFocus(e, type = 0) {
    if (e.which === 13 || e.keyCode === 13) {
      if (document.activeElement === document.body) { sendform.focus(); } else if (document.activeElement == sendform) {
        if (sendform.value !== '') {
          socket.emit('publish line', sendform.value);
        }
        sendform.value = '';
        sendform.blur();
      }
    }

    function gainFocus() {
      if (isLineOpen === 0) { socket.emit('open line'); }
      isLineOpen = 1;
    }

    function loseFocus() {
      if (sendform.value === '' && isLineOpen === 1) { socket.emit('close line'); }
      isLineOpen = 0;
    }

    if (document.activeElement === sendform) {
      gainFocus();
    } else {
      loseFocus();
    }
  }

  function form_keyup(e) {
    if (document.activeElement === sendform) { socket.emit('rolling update', sendform.value); }
  }

  var messageDiv = document.getElementById('messageList');

  function scrollToBottom() {
    const isScrolledToBottom = messageDiv.scrollHeight - messageDiv.clientHeight <= messageDiv.scrollTop + 40;
    if (isScrolledToBottom) {
      var scroll_interval = setInterval(function () { messageDiv.scrollTop = messageDiv.scrollHeight; }, 20);
      var scroll_timeout = setTimeout(function () { clearInterval(scroll_interval); }, 300);
    }
  }

  // Declaring all the event listeners.
  sendform.addEventListener('keyup', form_keyup);
  sendform.addEventListener('focus', enterFocus);
  sendform.addEventListener('blur', enterFocus);
  document.body.addEventListener('keyup', enterFocus, 1);

}
