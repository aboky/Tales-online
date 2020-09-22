import Phaser from 'phaser'
import io from 'socket.io-client'



class TalesScene extends Phaser.Scene {

    cursors;
    player;
    players = {};
    xAxis;
    yAxis;
    playerInfos;
    topLayer;
    playerID;

    constructor(config) {
        super(config)
        this.socket = io.connect('http://localhost:3000')
    }


    preload() {

        let characterNumber = Phaser.Math.Between(0, 5)
        this.load.spritesheet('player', 'http://localhost:3000/assets/player.png', { frameWidth: 64, frameHeight: 64 })
        this.load.image('tiles', 'http://localhost:3000/assets/pokemon_tileset.png')
        this.load.tilemapTiledJSON('map', 'http://localhost:3000/assets/map.json')

    }
    create() {
        let map = this.make.tilemap({ key: 'map' })
        let tileset = map.addTilesetImage('pokemon_tileset', 'tiles')

        //layers
        let groundLayer = map.createStaticLayer('ground', tileset, 0, 0)
        let aboveLayer = map.createStaticLayer('above', tileset, 0, 0)
        this.topLayer = map.createStaticLayer('top', tileset, 0, 0).setDepth(1)


        //find the spawn point on the map
        const spawnPoint = map.findObject("objects", obj => obj.name === "spawn")



        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('player', {
                start: 12,
                end: 17,
                first: 12
            }),
            frameRate: 10,
            repeat: -1
        })
        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('player', {
                start: 0,
                end: 5,
                first: 0
            }),
            frameRate: 10,
            repeat: -1
        })
        this.anims.create({
            key: 'backward',
            frames: this.anims.generateFrameNumbers('player', {
                start: 6,
                end: 11,
                first: 6
            }),
            frameRate: 10,
            repeat: -1
        })
        this.anims.create({
            key: 'forward',
            frames: this.anims.generateFrameNumbers('player', {
                start: 18,
                end: 23,
                first: 18
            }),
            frameRate: 10,
            repeat: -1
        })
        this.anims.create({
            key: 'forward_slash',
            frames: this.anims.generateFrameNumbers('player', {
                start: 36,
                end: 39,
                first: 36
            }),
            frameRate: 10,
            repeat: -1
        })
        this.anims.create({
            key: 'backward_slash',
            frames: this.anims.generateFrameNumbers('player', {
                start: 28,
                end: 31,
                first: 28
            }),
            frameRate: 10,
            repeat: -1
        })
        this.anims.create({
            key: 'left_slash',
            frames: this.anims.generateFrameNumbers('player', {
                start: 32,
                end: 35,
                first: 32
            }),
            frameRate: 10,
            repeat: -1
        })
        this.anims.create({
            key: 'right_slash',
            frames: this.anims.generateFrameNumbers('player', {
                start: 24,
                end: 27,
                first: 24
            }),
            frameRate: 10,
            repeat: -1
        })
        this.anims.create({
            key: 'left_stop',
            frames: [{ key: 'player', frame: 12 }]
        })
        this.anims.create({
            key: 'right_stop',
            frames: [{ key: 'player', frame: 0 }]
        })
        this.anims.create({
            key: 'forward_stop',
            frames: [{ key: 'player', frame: 18 }]
        })
        this.anims.create({
            key: 'backward_stop',
            frames: [{ key: 'player', frame: 6 }]
        })
        //controls
        this.camera = this.cameras.main
        this.cameras.main.setZoom(1.5)


        this.camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels)
        this.cursors = this.input.keyboard.createCursorKeys()

        this.setSocketEvents()

        //map collisions

        //announce new player
        this.askNewPlayer()

    }

    update() {
        console.log('number of pad : ' + this.input.gamepad.total)
        let pad = Phaser.Input.Gamepad.Gamepad
        if (this.input.gamepad.total) {
            pad = this.input.gamepad.getPad(0)
            xAxis = pad ? pad.axes[0].getValue() : 0
            yAxis = pad ? pad.axes[1].getValue() : 0
        }

        if (this.player) {
            if (this.cursors.left.isDown || this.xAxis < 0) {
                this.player.setVelocityX(-160)
                if (!this.cursors.space.isDown) {
                    this.player.emit('move_animation', 'left')
                    this.player.anims.play('left', true)
                } else {
                    this.player.emit('move_animation', 'left_slash')
                    this.player.anims.play('left_slash', true)
                }

            } else if (this.cursors.right.isDown || this.xAxis > 0) {
                this.player.setVelocityX(+160)
                if (!this.cursors.space.isDown) {
                    this.player.emit('move_animation', 'right')
                    this.player.anims.play('right', true)

                } else {
                    this.player.emit('move_animation', 'right_slash')
                    this.player.anims.play('right_slash', true)
                }

            } else if (this.cursors.down.isDown || this.yAxis > 0) {
                this.player.setVelocityY(+160)
                if (!this.cursors.space.isDown) {
                    this.player.emit('move_animation', 'backward')
                    this.player.anims.play('forward', true)
                } else {
                    this.player.emit('move_animation', 'forward_slash')
                    this.player.anims.play('forward_slash', true)
                }

            } else if (this.cursors.up.isDown || this.yAxis < 0) {
                this.player.setVelocityY(-160)
                if (!this.cursors.space.isDown) {
                    this.player.emit('move_animation', 'backward')
                    this.player.anims.play('backward', true)
                } else {
                    this.player.emit('move_animation', 'backward_slash')
                    this.player.anims.play('backward_slash', true)
                }
            } else {
                this.player.setVelocity(0)
                if (!this.cursors.space.isDown) {
                    this.player.emit('move_animation', 'forward_stop')
                    this.player.anims.play('forward_stop')

                } else {
                    this.player.emit('move_animation', 'forward_slash')
                    this.player.anims.play('forward_slash')
                }


            }

            //send position
            //this.setPlayerPosition()
        }

    }

    sendMoves(key) {
        console.log('animation test detected ! : ' + key)
        this.socket.emit('direction', { key: key, x: this.player.x, y: this.player.y })
    }

    addNewPlayer(id, x, y) {
        console.log('x=' + x + ", y=" + y)
        this.players[id] = this.physics.add.sprite(x, y, 'player')
        this.players[id].body.setSize(32, 32)
        this.physics.add.collider(this.players[id], this.topLayer)
    }
    removePlayer(id) {
        this.players[id].destroy()
        delete this.players[id]
    }
    askNewPlayer() {
        this.socket.emit('new player', this.socket.player)
    }

    setPlayerPosition() {
        this.socket.emit('move', { x: this.player.x, y: this.player.y })
    }

    setSocketEvents() {
        //socket management
        this.socket.on('all players', (data) => {
            console.log('affichage joueurs : ')
            for (let i = 0; i < data.length; i++) {
                console.log("id=" + data[i].id + ", x=" + data[i].x + " ,y=" + data[i].y)
                if (this.playerID !== data[i].id) {
                    this.addNewPlayer(data[i].id, data[i].x, data[i].y)
                }
            }
        })
        this.socket.on('new player', (data) => {
            console.log("new player is : id=" + data.id + " ,x=" + data.x + " ,y=" + data.y)
            this.addNewPlayer(data.id, data.x, data.y)
        })
        this.socket.on('remove player', (id) => {
            this.removePlayer(id)
        })
        this.socket.on('your player', (data) => {
            this.playerID = data.id
            this.player = this.physics.add.sprite(data.x, data.y, 'player')
            this.player.body.setSize(32, 32)
            this.player.on('move_animation', this.sendMoves, this)

            //camera
            this.camera.startFollow(this.player)
            //collisions
            this.topLayer.setCollisionByProperty({ collides: true })
            this.physics.add.collider(this.player, this.topLayer)
        })
        this.socket.on('move', (data) => {
            this.players[data.id].x = data.x
            this.players[data.id].y = data.y
        })
        this.socket.on('direction', (data) => {
            console.log('animation client : ' + data.key)
            this.players[data.id].play(data.key)
            this.players[data.id].x = data.x
            this.players[data.id].y = data.y
            switch (data.key) {
                case 'left':
                    this.players[data.id].setVelocityX(-160)
                    break;
                case 'right':
                    this.players[data.id].setVelocityX(+160)

                    break;
                case 'forward':
                    this.players[data.id].setVelocityY(-160)

                    break;
                case 'backward':
                    this.players[data.id].setVelocityY(+160)

                    break;
                case 'forward_stop':
                    this.players[data.id].setVelocity(0)
                    break;

                default:
                    break;
            }
        })
    }
}

var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    input: {
        gamepad: true
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: true
        }
    },
    scene: TalesScene
}


let game = new Phaser.Game(config)
