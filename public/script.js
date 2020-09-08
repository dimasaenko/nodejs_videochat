const socket = io('/')
const videoGrid = document.getElementById('video-grid')
const peer = new Peer(undefined, {
    host: '/',
    port: 3001
})
const peers = {}
const myVideo = document.createElement('video')
myVideo.muted = true
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    addVideoStream(myVideo, stream)

    peer.on('call', call => {
        call.answer(stream)
        const video = document.createElement('video')
        call.on('stream', userVideoStream => {
            addVideoStream(video, stream)
        })
    })
    socket.on('user-connected', userId => {
        connectToNewUser(userId, stream)
    })
}).catch(err => {
    console.error(err.message)
    console.error(err.name)
})

socket.on('user-disconnected', userId => {
    peers[userId].close()
})

peer.on('open', userId => {
    socket.emit('join-room', ROOM_ID, userId)
})

function addVideoStream(video, stream) {
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => video.play())
    videoGrid.append(video)
}

function connectToNewUser(userId, stream) {
    const call = peer.call(userId, stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
    })
    call.on('close', () => {
        video.remove()
    })
    peers[userId] = call
}