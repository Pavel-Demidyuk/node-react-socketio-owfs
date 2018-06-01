DEBUG = require('debug')('app')
DEBUG_OWFS= require('debug')('owfs')
DEBUG_MYSQL = require('debug')('mysql')
DEBUG_CLIENT = require('debug')('client')

const express = require('express')
const http = require('http')
const socketIO = require('socket.io')
const device = require('./models/device')


// our localhost port
const port = 4001

const app = express()

// our server instance
const server = http.createServer(app)

// This creates our socket using the instance of the server
const io = socketIO(server)

// This is what the socket.io syntax is like, we will work this later
io.on('connection', socket => {
    console.log('New client connected')

    device.getRaw(function(err, devices){
        DEBUG("init", devices)
        io.sockets.emit('devices init', devices);
    })


    // just like on the client side, we have a socket.on method that takes a callback function
    socket.on('change color', (color) => {
        // once we get a 'change color' event from one of our clients, we will send it to the rest of the clients
        // we make use of the socket.emit method again with the argument given to use from the callback function above
        console.log('Color Changed to: ', color)
        io.sockets.emit('change color', color)
    })

    // disconnect is fired when a client leaves the server
    socket.on('disconnect', () => {
        console.log('user disconnected')
    })
})

function myFunc(arg) {
    // io.sockets.emit('change color', 'red')
    // setTimeout(myFunc, 1000, 'funky');
}

myFunc();

server.listen(port, () => console.log(`Listening on port ${port}`))