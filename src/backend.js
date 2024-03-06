let peerConnection = null;

let dataChannel = null;
let offer = null;

const SettingUpPeerConnection = () => {
    peerConnection = new RTCPeerConnection({
        iceServers: [
            { urls: "stun:stun.stunprotocol.org" },
            { urls: "stun:stun.l.google.com:19302" },
        ],
    });

    dataChannel = peerConnection.createDataChannel("chat", { reliable: true });

    peerConnection.onicecandidate = e => {
        if (e.candidate) {
            alert("New ICE candidate: " + JSON.stringify(e.candidate));
        }
    }

    peerConnection.createOffer()
    .then(offer => {
        return peerConnection.setLocalDescription(offer);
    })
    .then(() => {
        console.log("Sending offer to server");
        return fetch("http://localhost:8080/offer", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ offer: peerConnection.localDescription }),
        });
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Server error: ${response.statusText}`);
        }
        return response.json();
    })
    .then(data => console.log("Server response:", data))
    .catch(e => console.error("Error sending offer:", e));

}

SettingUpPeerConnection();