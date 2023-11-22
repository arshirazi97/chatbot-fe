// Variable to store the user ID generated by the initialize-agent endpoint
let userId = null;

async function initializeAgent() {
  try {
    const response = await fetch('http://3.95.250.60:8080/initialize-agent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_company: 'everlane',
      }),
    });

    const data = await response.json();
    userId = data.user_id;
    console.log('User ID:', userId);

    // Display the initial bot message after initializing the agent
    displayInitialBotMessage();
  } catch (error) {
    console.error('Error initializing agent:', error);
  }
}

async function askQuery(query) {
  try {
    const response = await fetch('http://3.95.250.60:8080/ask-queries', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
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
    const response = await fetch('http://3.95.250.60:8080/clear-memory', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
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
  initialBotMessageDisplayed = true; // Set the flag to true after displaying the initial bot message
  console.log('Initialization successful!');
}

function sendMessage() {
  const textInput = document.getElementById('textInput');
  const message = textInput.value.trim();

  if (message !== '') {
    // Identify the sender (You) and add the user message to the chat on the right side
    addMessage('You', message, 'bg-blue-500', 'text-white', 'self-end');

    // Clear the text input
    textInput.value = '';

    // Call askQuery to process the user's query and get the bot's response
    askQuery(message);
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

// Add an event listener for beforeunload or unload events to clear memory when the user closes the chat window or reloads the page
window.addEventListener('beforeunload', clearMemory);
// If 'beforeunload' doesn't work for your use case, you can try using 'unload' event instead:
// window.addEventListener('unload', clearMemory);
