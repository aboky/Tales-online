let express = require('express')
let app = express()
let server = require('http').createServer(app)
let io = require('socket.io').listen(server)



//allow cors
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
    next()
  
  });

//serve static files, better if we use a cdn for massive multiplayer games
//app.use('/css',express.static(__dirname + '/css'));
app.use('/js',express.static(__dirname + '/js'))
app.use('/assets',express.static(__dirname + '/assets'))


//keep track of the last id assignated to a new player
server.lastPlayerID = 0

io.on('connection', (socket) => {
    
    //game interaction
    socket.on('new player', () => {
        console.log('a new player connected')
        //create object player recorded in socket
        socket.player = {
            id: server.lastPlayerID++,
            x: randomInt(450, 500),
            y: randomInt(450, 500),
            charNum: randomInt(0, 5)
        }
        console.log('player : ' + socket.player.id)
        console.log('character nb : '+socket.player.charNum)
        
        socket.emit('your player', socket.player)
        //send the list of players to the new player
        socket.emit('all players', getAllPlayers())
        //send everyone else the new player object
        socket.broadcast.emit('new player', socket.player)
    })
    //position
    socket.on('move', (positions) => {
        console.log('player at : x : '+positions.x+', y : '+positions.y)
        socket.player.x = positions.x
        socket.player.y = positions.y
        socket.broadcast.emit('move', socket.player)
    })
    socket.on('direction', (data) => {
        console.log('animation serveur : '+data.key)
        socket.player.x = data.x
        socket.player.y = data.y
        
        socket.broadcast.emit('direction', {
            key: data.key,
            id: socket.player.id,
            x: socket.player.x,
            y: socket.player.y
        })
    })
    //deco
    socket.on('disconnect', () => {
        socket.broadcast.emit('remove player', socket.player.id)
    })
})


server.listen(3000, () => {
    console.log('listening on :3000')
})


/**
 * returns all players
 */
function getAllPlayers() {
    let players = []
    //io.sockets is an array containing all sockets opened
    //io.sockets.connected contains only connected sockets
    console.log('players : '+Object.keys(io.sockets.connected))
    Object.keys(io.sockets.connected).forEach( (socketID) => {
        let player = io.sockets.connected[socketID].player
        if (player) {
            players.push(player)
        }
    })
    return players
}


function randomInt (low, high) {
    return Math.floor(Math.random() * (high - low) + low);
}