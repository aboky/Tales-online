import io from 'socket.io-client'


let socket = io.connect('http://localhost:3000')



export function askNewPlayer() {
    socket.emit('new player')
}

socket.on('all players', (data) => {
    console.log('affichage joueurs : '+data)
    for (let i = 0; i < data.length; i++) {
        addNewPlayer(data[i].id, data[i].x, data[i].y)
    }

})

socket.on('new player', () => {
    console.log(data)
    addNewPlayer(data.id, data.x, data.y)
})

socket.on('remove player', (id) => {
    removePlayer(id)
})

