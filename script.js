// JavaScript for voice input using Web Speech API
const recognition = new webkitSpeechRecognition();

let voiceBlob = null;

recognition.onresult = (event) => {
  const transcript = event.results[0][0].transcript;
  sendVoiceMessage(transcript);
};

function startVoiceRecognition() {
  recognition.start();
}

function stopVoiceRecognition() {
  recognition.stop();
}

function sendVoiceMessage(transcript) {
  // Create an ArrayBuffer from the transcript (assuming transcript is properly encoded audio data)
  const arrayBuffer = new TextEncoder().encode(transcript);

  // Create a Blob from the ArrayBuffer with 'audio/m4a' type
  const blob = new Blob([arrayBuffer], { type: 'audio/m4a' });

  // Save the Blob for playback
  voiceBlob = blob;

  saveVoiceNoteToFile(blob);
  addVoiceMessage('You', blob, 'bg-blue-500', 'text-white', 'self-end');
}


function saveVoiceNoteToFile(blob) {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'voice_note.mp3'; // Change the file extension to '.mp3'
  link.click();
}

function playVoiceMessageFromFile() {
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'audio/*';

  fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
      playVoiceMessage(file);
    }
  });

  fileInput.click();
}

function addVoiceMessage(sender, voiceBlob, bgColor, textColor, alignmentClass) {
  const chatDiv = document.getElementById('chat');
  const messageDiv = document.createElement('div');
  // Include alignment class for positioning
  messageDiv.className = `p-3 rounded-md ${bgColor} ${textColor} ${alignmentClass}`;

  const senderDiv = document.createElement('div');
  senderDiv.className = 'font-bold';
  senderDiv.textContent = sender;

  const playButton = document.createElement('button');
  playButton.innerHTML = '&#9654;'; // Unicode play symbol
  playButton.onclick = () => playVoiceMessage(voiceBlob);

  // Append the sender div, play button, and voice message to the message div
  messageDiv.appendChild(senderDiv);
  messageDiv.appendChild(playButton);

  // Append the message div to the chat container
  chatDiv.appendChild(messageDiv);

  // Scroll to the bottom of the chat
  chatDiv.scrollTop = chatDiv.scrollHeight;
}



function playVoiceMessage(blob) {
  const audio = new Audio(URL.createObjectURL(blob));
  audio.controls = true;

  const audioContainer = document.createElement('div');
  audioContainer.appendChild(audio);

  const chatDiv = document.getElementById('chat');
  const messageDiv = document.createElement('div');
  messageDiv.className = 'p-3 rounded-md bg-blue-500 text-white self-end';

  const senderDiv = document.createElement('div');
  senderDiv.className = 'font-bold';
  senderDiv.textContent = 'You';

  messageDiv.appendChild(senderDiv);
  messageDiv.appendChild(audioContainer);

  chatDiv.appendChild(messageDiv);

  // Scroll to the bottom of the chat
  chatDiv.scrollTop = chatDiv.scrollHeight;

  // Auto-play the audio
  audio.play().catch(error => {
    console.error('Error playing audio:', error.message);
  });
}


// Function to save data to localStorage
function saveToLocalStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// Function to retrieve data from localStorage
function getFromLocalStorage(key) {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
}

function sendMessage() {
  const textInput = document.getElementById('textInput');
  const message = textInput.value.trim();

  if (message !== '') {
    // Identify the sender (You) and add the user message to the chat on the right side
    addMessage('You', message, 'bg-blue-500', 'text-white', 'self-end');

    // Clear the text input
    textInput.value = '';

    // Simulate bot response (replace with actual backend integration)
    setTimeout(() => {
      const botResponse = 'This is a sample bot response.';
      // Identify the sender (Bot) and add the bot response to the chat on the left side
      addMessage('Bot', botResponse, 'bg-gray-300', 'text-gray-800', 'self-start');
    }, 500);
  }
}

function addMessage(sender, text, bgColor, textColor, alignmentClass) {
  const chatDiv = document.getElementById('chat');
  const messageDiv = document.createElement('div');
  // Include alignment class for positioning
  messageDiv.className = `p-3 rounded-md ${bgColor} ${textColor} ${alignmentClass}`;

  const senderDiv = document.createElement('div');
  senderDiv.className = 'font-bold';
  senderDiv.textContent = sender;

  const textDiv = document.createElement('div');
  textDiv.textContent = text;

  messageDiv.appendChild(senderDiv);
  messageDiv.appendChild(textDiv);

  chatDiv.appendChild(messageDiv);

  // Scroll to the bottom of the chat
  chatDiv.scrollTop = chatDiv.scrollHeight;
}

// Initialize variable to track whether initial bot message has been displayed
let initialBotMessageDisplayed = false;

// Show/hide chat container and button
const chatContainer = document.getElementById('chatContainer');
const chatButton = document.getElementById('chatButton');

// Initially hide the chat container
chatContainer.classList.add('hidden');

chatButton.addEventListener('click', () => {
  chatContainer.classList.toggle('hidden');
  
  // If chat container is shown and initial bot message hasn't been displayed, simulate it
  if (!chatContainer.classList.contains('hidden') && !initialBotMessageDisplayed) {
    setTimeout(() => {
      const initialBotMessage = 'Hello! How can I help you today?';
      addMessage('Bot', initialBotMessage, 'bg-gray-300', 'text-gray-800', 'self-start');
      initialBotMessageDisplayed = true; // Set the flag to true after displaying the initial bot message
    }, 500);
  }
});
