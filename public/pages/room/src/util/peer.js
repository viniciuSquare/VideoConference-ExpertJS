class PeerBuilder {
    constructor ({ peerConfig }){
        this.peerConfig = peerConfig;

        const defaultFunctionValue = () => { }
        this.onError = defaultFunctionValue
        this.onCallReceived = defaultFunctionValue
        this.onConnectionOpened = defaultFunctionValue
        this.onPeerStreamReceived = defaultFunctionValue
    }

    //peer's communication events handlers
    setOnError(fn){
        this.error = fn

        return this
    }

    setOnCallReceived(fn){
        this.onCallReceived = fn

        return this
    }

    setOnConnectionOpened(fn){
        this.setOnConnectionOpened = fn

        return this
    }

    //when others peer info is received
    setOnPeerStreamReceived(fn){
        this.onPeerStreamReceived = fn
        
        return this
    }

    _prepareCallEvent(call){
        call.on('stream', stream => this.onPeerStreamReceived(call, stream))

        this.onCallReceived(call)
    }
    
    build() { 
        //spread of the object
        const peer = new Peer(...this.peerConfig)

        peer.on('error', this.onError)
        peer.on('call', this._prepareCallEvent.bind(this) )

        return new Promise(resolve => peer.on('open', id => {
            //pass the caller
            this.onConnectionOpened(peer)
            return resolve(peer)
        }))
    }
}