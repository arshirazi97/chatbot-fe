// Variable to store the user ID generated by the initialize-agent endpoint
let userId = null;
const apiUrl = "https://bixbot-service-2gklzrsouq-ue.a.run.app";

let isRecording = false;
let mediaRecorder;
let audioChunks = [];

async function initializeAgent() {
    try {
        const response = await fetch(`${apiUrl}/initialize-agent`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            mode: "cors",
            body: JSON.stringify({
                client_company: "everlane",
            }),
        });

        const data = await response.json();
        userId = data.user_id;
        console.log("User ID:", userId);
    } catch (error) {
        console.error("Error initializing agent:", error);
    }
}

async function askQuery(query) {
    console.log("Asking query now...");
    console.log(query);

    try {
        const requestBody = {
            user_id: userId,
            client_company: "everlane",
            query: query,
        };

        console.log("Request body:", requestBody);

        const response = await fetch(`${apiUrl}/ask-text-queries`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            mode: "cors",
            body: JSON.stringify({
                user_id: userId,
                client_company: "everlane",
                query: query,
            }),
        });

        const data = await response.json();
        const botResponse = data.response;
        console.log("Bot response:", botResponse);

        // Identify the sender (Bot) and add the bot response to the chat on the left side
        simulateChatGPTTyping(botResponse, "Bot", "bg-gray-300", "text-gray-800", "self-start");
    } catch (error) {
        console.error("Error processing query:", error);
    }
}

async function clearMemory() {
    try {
        console.log("Clearing memory...");
        const response = await fetch(`${apiUrl}/clear-memory`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            mode: "cors",
            body: JSON.stringify({
                user_id: userId,
            }),
        });

        const data = await response.json();
        console.log("Memory cleared successfully:", data);
    } catch (error) {
        console.error("Error clearing memory:", error);
    }
}

function displayInitialBotMessage() {
    const initialBotMessage = "Hi, how can I help you? I am a customer service consultant from everlane.";
    simulateChatGPTTyping(initialBotMessage, "Bot", "bg-gray-300", "text-gray-800", "self-start");
}

// Function to simulate ChatGPT-like typing effect
function simulateChatGPTTyping(message, sender, bgColor, textColor, alignmentClass) {
    const chatDiv = document.getElementById("chat");
    const typingDiv = document.createElement("div");
    typingDiv.className = `w-full p-3 rounded-md ${bgColor} ${textColor} ${alignmentClass}`;

    const senderDiv = document.createElement("div");
    senderDiv.className = "font-bold";
    senderDiv.textContent = sender;

    const typingIndicator = document.createElement("div");
    typingIndicator.className = "typing-indicator";
    chatDiv.appendChild(typingDiv);
    typingDiv.appendChild(senderDiv);
    typingDiv.appendChild(typingIndicator);

    // Check if the message is defined and not an empty string
    if (message && message.length > 0) {
        // Simulate typing before displaying the actual message
        const textDiv = document.createElement("div");
        textDiv.className = "message-text";
        typingDiv.appendChild(textDiv);

        let index = 0;
        const typingInterval = setInterval(() => {
            if (index < message.length) {
                textDiv.textContent += message.charAt(index);
                index++;
                chatDiv.scrollTo(0, chatDiv.scrollHeight);
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
    const textInput = document.getElementById("textInput");
    const message = textInput.value.trim();

    if (message !== "") {
        // Identify the sender (You) and add the user message to the chat on the right side
        addMessage("You", message, "bg-blue-500", "text-white", "self-end");

        // Clear the text input
        textInput.value = "";

        // Call askQuery to process the user's query and get the bot's response
        askQuery(message);
    }
}

function startRecording() {
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then((stream) => {
            mediaRecorder = new MediaRecorder(stream);
            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunks.push(event.data);
                }
            };
            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                const audioUrl = URL.createObjectURL(audioBlob);

                // Send the recorded audio to the server
                sendAudioMessage(audioBlob);

                // Display the audio message in the chat
                addAudioMessage("You", audioUrl, "self-end");

                // Reset recording variables
                audioChunks = [];
                isRecording = false;
            };

            mediaRecorder.start();
            document.getElementById("startRecordingBtn").disabled = true;
            document.getElementById("stopRecordingBtn").disabled = false;
            isRecording = true;
        })
        .catch((error) => {
            console.error('Error accessing microphone:', error);
        });
}

function stopRecording() {
    if (isRecording) {
        mediaRecorder.stop();
        document.getElementById("startRecordingBtn").disabled = false;
        document.getElementById("stopRecordingBtn").disabled = true;
    }
}

async function sendAudioMessage(audioBlob) {
    const requestBody = {
        user_id: userId,
        company_name: 'everlane',
        audio: audioBlob,
    };

    console.log("Audio Message Request Body:", requestBody);

    try {
        const response = await fetch(`${apiUrl}/ask-audio-queries`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            mode: 'cors',
            body: JSON.stringify(requestBody),
        });

        const data = await response.json();
        const botResponse = data.response;

        addAudioMessage("Bot", botResponse, "self-start");
    } catch (error) {
        console.error('Error processing audio query:', error);
    }
}



function addAudioMessage(sender, audioUrl, alignmentClass) {
    const chatDiv = document.getElementById("chat");
    const messageDiv = document.createElement("div");
    messageDiv.className = `p-3 rounded-md ${alignmentClass}`;

    const senderDiv = document.createElement("div");
    senderDiv.className = "font-bold";
    senderDiv.textContent = sender;

    const audioDiv = document.createElement("audio");
    audioDiv.src = audioUrl;
    audioDiv.controls = true;

    messageDiv.appendChild(senderDiv);
    messageDiv.appendChild(audioDiv);

    chatDiv.appendChild(messageDiv);
    chatDiv.scrollTop = chatDiv.scrollHeight;
}


function addMessage(sender, text, bgColor, textColor, alignmentClass) {
    const chatDiv = document.getElementById("chat");
    const messageDiv = document.createElement("div");
    // Include alignment class for positioning
    messageDiv.className = `p-3 rounded-md ${bgColor} ${textColor} ${alignmentClass}`;

    const senderDiv = document.createElement("div");
    senderDiv.className = "font-bold";
    senderDiv.textContent = sender;

    const textDiv = document.createElement("div");
    textDiv.textContent = text;

    messageDiv.appendChild(senderDiv);
    messageDiv.appendChild(textDiv);

    chatDiv.appendChild(messageDiv);

    // Scroll to the bottom of the chat
    chatDiv.scrollTop = chatDiv.scrollHeight;
}

function main() {
    initializeAgent();

    let initialBotMessageDisplayed = false;

    const chatContainer = document.getElementById("chatContainer");
    const chatButton = document.getElementById("chatButton");

    chatContainer.classList.add("hidden");

    chatButton.addEventListener("click", () => {
        chatContainer.classList.toggle("hidden");

        // If chat container is shown and initial bot message hasn't been displayed, simulate it
        if (!chatContainer.classList.contains("hidden") && !initialBotMessageDisplayed) {
            displayInitialBotMessage();
        }
    });

    // Add an event listener for beforeunload or unload events to clear memory when the user closes the chat window or reloads the page
    window.addEventListener("beforeunload", clearMemory);
}

main();
