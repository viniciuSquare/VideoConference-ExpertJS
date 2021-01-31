const server = require('http').createServer((req, res)=>{
    res.writeHead(204,{
        'Acces-Control-Allow-Origin':'*',
        'Acces-Control-Allow-Methods': 'OPTIONS, GET, POST',
    })
    res.end('hey there')

})

const socketIo = require('socket.io')
const io = socketIo(server, {
    cors: {
        origin: '*', 
        credentials: false
    }
})

io.on('connection', socket => {
    console.log('connection', socket.id)

    socket.on('join-room', (roomId, userId) =>{
        // add user on the same room
        socket.join(roomId)
    
        socket.to(roomId).broadcast.emit('user-connected', userId)
    
        socket.on('disconnect', ()=>{
            console.log("disconnected!", roomId, userId)
            socket.to(roomId).broadcast.emit('user-disconnected', userId)
        })
    })

})

const startServer = () => {
    const { address, port } = server.address()
    console.log(`server runnin at ${address}:${port}`)
}

server.listen(process.env.PORT || 3000, startServer)