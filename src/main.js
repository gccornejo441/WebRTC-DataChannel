let peerConnection;

var sendChannel = null;
var receiveChannel = null;

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

    peerConnection.ondatachannel = event => {
        receiveChannel = event.channel;
        sendChannel = receiveChannel; 
        setupDataChannelEventHandlers(sendChannel); 
    };
}

function setupDataChannelEventHandlers(channel) {
    channel.onopen = () => handleSendChannelStatusChange(channel);
    channel.onclose = () => handleSendChannelStatusChange(channel);
    channel.onmessage = handleReceiveMessage;
    channel.onerror = () => alert("Error! on the data channel.");
}


let createOffer = async () => {
    setupPeerConnection();

    sendChannel = peerConnection.createDataChannel("chat");
    setupDataChannelEventHandlers(sendChannel);

    let offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    document.getElementById("offer-sdp").value = JSON.stringify(offer);
}

let createAnswer = async () => {
    setupPeerConnection();

    let offer = JSON.parse(document.getElementById("offer-sdp").value);
    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

    let answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);

    document.getElementById("answer-sdp").value = JSON.stringify(answer);
}

let setAnswer = async () => {
    let answer = JSON.parse(document.getElementById("answer-sdp").value);
    await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
}

function handleSendChannelStatusChange(channel) {
    peerConnection.ondatachannel = event => {
        receiveChannel = event.channel;
        sendChannel = receiveChannel;
        setupDataChannelEventHandlers(sendChannel);
    };
    console.log(`${channel.label} channel state is: ${channel.readyState}`);

    if (channel.readyState === "open") {
        messageInputBox.disabled = false;
        sendButton.disabled = false;
        messageInputBox.focus();
    } else {
        messageInputBox.disabled = true;
        sendButton.disabled = true;
    }
}

function handleReceiveMessage(event) {
    const el = document.createElement("p");
    const txtNode = document.createTextNode("Received: " + event.data);
    el.appendChild(txtNode);
    receiveBox.appendChild(el);
}

function sendMessage() {
    if (sendChannel && sendChannel.readyState === "open") {
        const message = messageInputBox.value;
        sendChannel.send(message);
        
        messageInputBox.value = "";
        messageInputBox.focus();
    } else {
        console.error("Cannot send message. Data channel is not open or not available.");
    }
}

document.getElementById("add-answer").addEventListener("click", setAnswer);
document.getElementById("create-answer").addEventListener("click", createAnswer);
document.getElementById("create-offer").addEventListener("click", createOffer);

window.addEventListener('load', startup, false);
