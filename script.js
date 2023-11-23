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

    simulateChatGPTTyping(botResponse, 'Bot', 'bg-gray-300', 'text-gray-800', 'self-start');
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
  simulateChatGPTTyping(initialBotMessage, 'Bot', 'bg-gray-300', 'text-gray-800', 'self-start');
  initialBotMessageDisplayed = true; 
  console.log('Initialization successful!');
}

// Function to simulate ChatGPT-like typing effect
function simulateChatGPTTyping(message, sender, bgColor, textColor, alignmentClass) {
  const chatDiv = document.getElementById('chat');
  const typingDiv = document.createElement('div');
  typingDiv.className = `p-3 rounded-md ${bgColor} ${textColor} ${alignmentClass}`;

  const senderDiv = document.createElement('div');
  senderDiv.className = 'font-bold';
  senderDiv.textContent = sender;

  const typingIndicator = document.createElement('div');
  typingIndicator.className = 'typing-indicator';
  typingDiv.appendChild(senderDiv);
  typingDiv.appendChild(typingIndicator);
  chatDiv.appendChild(typingDiv);

  // Check if the message is defined and not an empty string
  if (message && message.length > 0) {
    // Simulate typing before displaying the actual message
    const textDiv = document.createElement('div');
    textDiv.className = 'message-text';
    chatDiv.appendChild(textDiv);

    let index = 0;
    const typingInterval = setInterval(() => {
      if (index < message.length) {
        textDiv.textContent += message.charAt(index);
        index++;
      } else {
        clearInterval(typingInterval);
        typingDiv.removeChild(typingIndicator);
        textDiv.textContent = message;
        chatDiv.scrollTop = chatDiv.scrollHeight;
      }
    }, 50); // Adjust the delay based on your needs
  }
}

function sendMessage() {
  const textInput = document.getElementById('textInput');
  const message = textInput.value.trim();

  if (message !== '') {
    addMessage('You', message, 'bg-blue-500', 'text-white', 'self-end');
    textInput.value = '';
    askQuery(message);
  }
}

// Updated addMessage function with typing effect for the bot's response
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

let initialBotMessageDisplayed = false;

const chatContainer = document.getElementById('chatContainer');
const chatButton = document.getElementById('chatButton');

chatContainer.classList.add('hidden');

// Call initializeAgent when the chat container is shown
chatButton.addEventListener('click', () => {
  chatContainer.classList.toggle('hidden');

  // If the chat container is shown and the initial bot message hasn't been displayed, simulate it
  if (!chatContainer.classList.contains('hidden') && !initialBotMessageDisplayed) {
    initializeAgent();
  }
});

window.addEventListener('beforeunload', clearMemory);
// window.addEventListener('unload', clearMemory);
