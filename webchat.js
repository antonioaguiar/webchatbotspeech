'use strict';
require('dotenv').config()
const express = require('express');
const app = express();

app.use(express.static(__dirname + '/views')); // html
app.use(express.static(__dirname + '/public')); // js, css, images

//console.log("PORT:"+process.env.PORT);
//console.log("USER:"+process.env.WATSON_USERNAME);
//console.log("PWSD:"+process.env.WATSON_PASSWORD);

const server = app.listen(process.env.PORT, () => {
  console.log('Express server listening on port %d in %s mode', 
  server.address().port, app.settings.env);
});

const io = require('socket.io')(server);
io.on('connection', function(socket){
  console.log('um usuário conectou');
});

//watson 
var ConversationV1 = require('watson-developer-cloud/conversation/v1');
var conversation = new ConversationV1({
  username: process.env.WATSON_USERNAME,
  password: process.env.WATSON_PASSWORD,
  version: '2017-05-26'
});
var workspace_id = process.env.WATSON_WORKSPACE_ID; // replace with workspace ID

var resposta = [];

// Start conversation with empty message.
conversation.message({ workspace_id: workspace_id}, processResponse);

// Process the conversation response.
function processResponse(err, response) {
  if (err) {
    console.error(err); // something went wrong
    return;
  }
  var endConversation = false;
  if (response.output.action === 'display_time') {
    //console.log('The current time is ' + new Date().toLocaleTimeString());
  } else if (response.output.action === 'sair') {
    //console.log(response.output.text[0]);
    endConversation = true;
  } else {
    if (response.output.text.length != 0) {
       // console.log("Watson > "+response.output.text[0]);
    }
  }
  resposta = response;
}
//fim watson
//-------------------------

// Web UI
app.get('/', (req, res) => {
  res.sendFile('index.html');
});

io.on('connection', function(socket) {
  socket.on('chat message', (text) => {
    //console.log('Usuário disse ..: ' + text);
    //watson
    enviarMensagemWatson(text);
    var txtResposta = "";
    function enviarMensagemWatson(newMessageFromUser){
      conversation.message({
        workspace_id: workspace_id,
        input: { text: newMessageFromUser },
        context : resposta.context
      }, processResponse);
    }
    function processResponse(err, response) {
      if (err) {
        console.error(err); // something went wrong
        return;
      }
      txtResposta = response.output.text;
      resposta = response;
      //console.log('Bot respondeu ..: ' + txtResposta);
      socket.emit('bot reply', txtResposta);
    }
    //fim
 
  });
});
