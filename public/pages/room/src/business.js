class Business{
    constructor({room, media, view, socketBuilder, peerBuilder}){
        this.room = room
        this.media = media
        this.view = view

        this.socketBuilder = socketBuilder
        this.peerBuilder = peerBuilder

        this.socket = {} 
        this.currentStream = {}
        this.currentPeer = {}

        this.peers = new Map()
    }

    static initialize(deps){
        const instance = new Business(deps)
        
        return instance._init()
    }

    //initiate the entities 
    async _init(){
        this.currentStream = await this.media.getCamera(true)
        this.socket = this.socketBuilder
            .setOnUserConnected(this.onUserConnected())
            .setOnUserDisconnected(this.onUserDisconnected())
            .build()

        this.currentPeer = await this.peerBuilder
            .setOnError(this.onPeerError)
            .setOnConnectionOpened(this.onPeerConnectionOpened())
            .setOnCallReceived(this.onPeerCallReceived())
            .setOnPeerStreamReceived(this.onPeerStreamReceived())
            .build()


        this.addVideoStream('teste01')
    }

    addVideoStream(userId, stream = this.currentStream){
        const isCurrentId = false
        this.view.renderVideo({ 
            userId, 
            muted: false,
            stream,
            isCurrentId
        })
    }
    onUserConnected = function(){
        return userId => console.log('user connected', userId)
    }
    
    onUserDisconnected = function() {
        return userId => {
            console.log('user disconnected!', userId)
        }
    }
    onPeerError = function(){
        return error => console.log('error on peer!', error)
    }

    onPeerConnectionOpened = function(){
        //retrieve data from pe er server
        return (peer) => {
            const id = peer.id
            //when opened, its socket will be sent to the room
            this.socket.emit('join-room', this.room, id)

        }
    }

    //answer with the peer's stream
    onPeerCallReceived = function () {
        return call => {
            console.log('answering call', call)
            call.answer(this.currentStream)
        }
    }

    onPeerStreamReceived = function () {
        return (call, stream ) => {
            const callerId = call.peer 
            //add the received stream to the view
            this.addVideoStream(callerId, stream)
            this.peers.set(callerId, { call })
            //return the length of the map peers
            this.view.setParticipants(this.peers.size)
        }
    }
}