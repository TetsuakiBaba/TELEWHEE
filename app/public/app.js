
const socket = io();
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
const messages = document.getElementById('messages');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');

let localStream;
let remoteStream = new MediaStream();
let peerConnection;
let dataChannel;

const configuration = {
    iceServers: [
        {
            urls: 'stun:stun.l.google.com:19302'
        }
    ]
};

async function init() {
    try {
        localStream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: { ideal: 1920 },
                height: { ideal: 1080 },
            },
            audio: true
        });
        localVideo.srcObject = localStream;
        socket.emit('ready');
    } catch (error) {
        console.error('Error accessing media devices.', error);
    }
}

socket.on('offer', async (offer) => {
    console.log('Received offer:', offer);
    await createPeerConnection();
    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    socket.emit('answer', answer);
});

socket.on('answer', async (answer) => {
    console.log('Received answer:', answer);
    await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
});

socket.on('candidate', async (candidate) => {
    console.log('Received candidate:', candidate);
    await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
});

socket.on('ready', async () => {
    if (!peerConnection) {
        await createPeerConnection();
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        socket.emit('offer', offer);
    }
});

async function createPeerConnection() {
    if (peerConnection) return;

    console.log('Creating peer connection');
    peerConnection = new RTCPeerConnection(configuration);

    dataChannel = peerConnection.createDataChannel("data");
    dataChannel.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'chat') {
            createChatText(data.text, 'l');
        }
    };

    peerConnection.ondatachannel = (event) => {
        dataChannel = event.channel;
        dataChannel.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'chat') {
                createChatText(data.text, 'l');
            }
        };
    };

    peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
            console.log('Sending candidate:', event.candidate);
            socket.emit('candidate', event.candidate);
        }
    };

    peerConnection.ontrack = (event) => {
        console.log('Received remote track:', event.streams);
        event.streams[0].getTracks().forEach(track => {
            remoteStream.addTrack(track);
        });
        remoteVideo.srcObject = remoteStream;
        // 1秒おきにremoteVideoの解像度等の情報を表示
        setInterval(() => {
            // console.log(remoteVideo, remoteVideo.videoWidth, remoteVideo.videoHeight, remoteVideo.currentTime);
            document.querySelector('#remote_video_information').textContent = `${remoteVideo.videoWidth}x${remoteVideo.videoHeight}`;
        }, 1000);
    };

    localStream.getTracks().forEach(track => {
        console.log('Adding local track:', track);
        peerConnection.addTrack(track, localStream);
    });
}

function createChatText(text, side = 'r') {
    let chat_element = document.createElement('div');
    chat_element.classList = `balloon_${side}`;
    let faceicon_element = document.createElement('div');
    faceicon_element.classList = 'faceicon';
    chat_element.appendChild(faceicon_element);

    let chat_text = document.createElement('p');
    chat_text.classList = 'says';
    chat_text.innerHTML = `${text}`;
    // chat_textをchat_elementの最初に追加
    // chat_element.insertBefore(chat_text, chat_element.firstChild);
    chat_element.appendChild(chat_text);

    // messages.appendChild(chat_element);
    messages.insertBefore(chat_element, messages.firstChild);
}
sendButton.onclick = () => {
    const message = {
        type: 'chat',
        text: messageInput.value
    };
    dataChannel.send(JSON.stringify(message));
    createChatText(message.text, 'r');
    messageInput.value = '';
};

init();

document.addEventListener('DOMContentLoaded', async () => {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoInput = document.getElementById('videoInput');
    devices.forEach(device => {
        if (device.kind === 'videoinput') {
            const option = document.createElement('option');
            option.value = device.deviceId;
            option.text = device.label || `Camera ${videoInput.length + 1}`;
            videoInput.appendChild(option);
        }
    });

    videoInput.onchange = async () => {
        // 既存のトラックを停止
        localStream.getTracks().forEach(track => {
            track.stop();
        });

        // 新しいストリームを取得
        localStream = await navigator.mediaDevices.getUserMedia({
            video: {
                deviceId: { exact: videoInput.value },
                width: { ideal: 1920 },
                height: { ideal: 1080 },
            },
            audio: true
        });

        // ビデオ要素に新しいストリームを設定
        localVideo.srcObject = localStream;

        // 既存のビデオトラックを更新
        const videoSender = peerConnection.getSenders().find(sender => sender.track.kind === 'video');
        if (videoSender) {
            videoSender.replaceTrack(localStream.getVideoTracks()[0]);
        }

        // オーディオトラックを更新
        const audioSender = peerConnection.getSenders().find(sender => sender.track.kind === 'audio');
        if (audioSender) {
            audioSender.replaceTrack(localStream.getAudioTracks()[0]);
        }
    };

    function getNetworkQuality(effectiveType, downlink, rtt) {
        if (effectiveType === '4g' && downlink >= 5 && rtt <= 50) {
            return '<i class="bi bi-reception-4"></i>';
        } else if (effectiveType === '4g' && downlink >= 2 && rtt <= 100) {
            return '<i class="bi bi-reception-3"></i>';
        } else if ((effectiveType === '3g' || effectiveType === '4g') && downlink >= 0.5 && rtt <= 300) {
            return '<i class="bi bi-reception-2"></i>';
        } else {
            return '<i class="bi bi-reception-0"></i>';
        }
    }

    if ('connection' in navigator) {
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

        const networkQuality = getNetworkQuality(connection.effectiveType, connection.downlink, connection.rtt);
        document.querySelector('#network_quality').innerHTML = networkQuality;

        connection.addEventListener('change', () => {
            const updatedNetworkQuality = getNetworkQuality(connection.effectiveType, connection.downlink, connection.rtt);
            document.querySelector('#network_quality').innerHTML = updatedNetworkQuality;
        });
    } else {
        console.log('Network Information API is not supported by this browser.');
    }



});
