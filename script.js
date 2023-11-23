let userId = null;

const apiBaseUrl = 'http://bixbox-loadbalancer-1541544251.us-east-1.elb.amazonaws.com:8080';

async function initializeAgent() {
  try {
    const response = await fetch(`${apiBaseUrl}/initialize-agent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      mode: 'cors',
      body: JSON.stringify({
        client_company: 'everlane',
      }),
    });

    const data = await response.json();
    userId = data.user_id;
    console.log('User ID:', userId);

    displayInitialBotMessage();
  } catch (error) {
    console.error('Error initializing agent:', error);
  }
}

async function askQuery(query) {
  try {
    const response = await fetch(`${apiBaseUrl}/ask-text-queries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      mode: 'cors',
      body: JSON.stringify({
        user_id: userId,
        client_company: 'everlane',
        query: query,
      }),
    });

    const data = await response.json();
    const botResponse = data.response;

    // Identify the sender (Bot) and add the bot response to the chat on the left side
    addMessage('Bot', botResponse, 'bg-gray-300', 'text-gray-800', 'self-start');
  } catch (error) {
    console.error('Error processing query:', error);
  }
}

async function clearMemory() {
  try {
    console.log('Clearing memory...');
    const response = await fetch(`${apiBaseUrl}/clear-memory`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      mode: 'cors',
      body: JSON.stringify({
        user_id: userId,
      }),
    });

    const data = await response.json();
    console.log('Memory cleared successfully:', data);
  } catch (error) {
    console.error('Error clearing memory:', error);
  }
}

function displayInitialBotMessage() {
  const initialBotMessage = 'Hi, how can I help you? I am a customer service consultant from everlane.';
  addMessage('Bot', initialBotMessage, 'bg-gray-300', 'text-gray-800', 'self-start');
  initialBotMessageDisplayed = true;
  console.log('Initialization successful!');
}

async function sendMessage() {
  const textInput = document.getElementById('textInput');
  const message = textInput.value.trim();

  if (message !== '') {
    try {
      addMessage('You', message, 'bg-blue-500', 'text-white', 'self-end');

      textInput.value = '';
      
      await askQuery(message);
    } catch (error) {
      console.error('Error in sendMessage:', error);
    }
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

// Call initializeAgent when the chat container is shown
chatButton.addEventListener('click', () => {
  chatContainer.classList.toggle('hidden');

  // If chat container is shown and initial bot message hasn't been displayed, simulate it
  if (!chatContainer.classList.contains('hidden') && !initialBotMessageDisplayed) {
    initializeAgent();
  }
});

window.addEventListener('beforeunload', clearMemory);
// window.addEventListener('unload', clearMemory);