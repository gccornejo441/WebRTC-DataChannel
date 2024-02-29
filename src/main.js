let peerConnection;

var sendChannel = null; // RTCDataChannel for the local (sender)
var receiveChannel = null; // RTCDataChannel for the remote (receiver)

var sendButton = null;
var messageInputBox = null;
var receiveBox = null;

let servers = {
    iceServers: [
        { urls: "stun:stun.stunprotocol.org" },
        { urls: "stun:stun.l.google.com:19302" },
    ],
}

function startup() {
    sendButton = document.getElementById('sendButton');
    messageInputBox = document.getElementById('message');
    receiveBox = document.getElementById('receivebox');

    // Set event listeners for user interface widgets
    sendButton.addEventListener('click', sendMessage, false);
}

// 
function setupPeerConnection() {
    peerConnection = new RTCPeerConnection(servers);

    peerConnection.onicecandidate = event => {
        if (event.candidate) {
            document.getElementById("offer-sdp").value = JSON.stringify(peerConnection.localDescription);
        }
    };

    // Create the data channel and establish its event listeners
    peerConnection.ondatachannel = event => {
        receiveChannel = event.channel;
        receiveChannel.onmessage = handleReceiveMessage;
        receiveChannel.onopen = handleReceiveChannelStatusChange;
        receiveChannel.onclose = handleReceiveChannelStatusChange;
    };
}

// Button trigger for creating an offer
let createOffer = async () => {
    setupPeerConnection();

    sendChannel = peerConnection.createDataChannel("chat");
    sendChannel.onopen = handleSendChannelStatusChange;
    sendChannel.onclose = handleSendChannelStatusChange;
    sendChannel.onerror = handleSendChannelStatusChange;

    let offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    document.getElementById("offer-sdp").value = JSON.stringify(offer);
}

// Button trigger for creating an answer
let createAnswer = async () => {
    setupPeerConnection();

    let offer = JSON.parse(document.getElementById("offer-sdp").value);
    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

    let answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);

    document.getElementById("answer-sdp").value = JSON.stringify(answer);
}

// Button trigger for setting the answer SDP
let setAnswer = async () => {
    let answer = JSON.parse(document.getElementById("answer-sdp").value);
    await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
}

function handleSendChannelStatusChange() {
    if (sendChannel.readyState === "open") {
        messageInputBox.disabled = false;
        sendButton.disabled = false;
        messageInputBox.focus();
    } else {
        messageInputBox.disabled = true;
        sendButton.disabled = true;
    }
}

function handleReceiveChannelStatusChange() {
    // Optionally implement similar logic for receiveChannel if needed
}

function handleReceiveMessage(event) {
    const el = document.createElement("p");
    const txtNode = document.createTextNode("Received: " + event.data);
    el.appendChild(txtNode);
    receiveBox.appendChild(el);
}

function sendMessage() {
    const message = messageInputBox.value;
    sendChannel.send(message);
    
    messageInputBox.value = "";
    messageInputBox.focus();
}

document.getElementById("add-answer").addEventListener("click", setAnswer);
document.getElementById("create-answer").addEventListener("click", createAnswer);
document.getElementById("create-offer").addEventListener("click", createOffer);

window.addEventListener('load', startup, false);
