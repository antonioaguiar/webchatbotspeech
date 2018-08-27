'use strict';

const socket = io();

const outputYou = document.querySelector('.output-you');
const outputBot = document.querySelector('.output-bot');
const outputLog = document.querySelector('.output-log');
const btnmicrofone = document.querySelector('#btnmicrofone');

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

recognition.lang = 'pt-BR';
recognition.interimResults = false;
recognition.maxAlternatives = 1;
 
btnmicrofone.addEventListener('click', () => {
  recognition.start();
  btnmicrofone.className = "buttonMicOn";
});

recognition.addEventListener('speechstart', () => {
  console.log('Speech has been detected.');
  //console.log(btnmicrofone.className);
  //btnmicrofone.className = "buttonMicOn";
});

recognition.addEventListener('result', (e) => {
  
  console.log('Result has been detected.');

  let last = e.results.length - 1;
  let text = e.results[last][0].transcript;

  outputYou.textContent = text;

  outputLog.innerHTML += '<br><em><b>Você disse  </b>'+text+'</em>';

  //console.log('Confidence: ' + e.results[0][0].confidence);
  //console.log('Mensagem: '  + text);
  btnmicrofone.className = "buttonMic";
  socket.emit('chat message', text);
});

recognition.addEventListener('speechend', () => {
  recognition.stop();
});

recognition.addEventListener('error', (e) => {
  outputBot.textContent = 'Error: ' + e.error;
  outputLog.innerHTML += '<br><em><b>Error:</b>' + e.error+'</em></br>';
});

function synthVoice(text) {
  const synth = window.speechSynthesis;
  const utterance = new SpeechSynthesisUtterance();
  utterance.text = text;
  synth.speak(utterance);
}

socket.on('bot reply', function (replyText) {
  synthVoice(replyText);
  if (replyText == '') 
      replyText = '(Sem resposta...)';
  outputBot.textContent = replyText;
  //outputLog.textContent += 'Chatbot disse.: '+replyText+'</br>';
  outputLog.innerHTML += '<br><em><b>Chatbot disse  </b>'+replyText+'</em><br>';
});
