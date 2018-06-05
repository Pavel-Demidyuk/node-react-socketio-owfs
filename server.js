DEBUG = require('debug')('app')
DEBUG_OWFS = require('debug')('owfs')
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

const io = socketIO(server)

updateDevices = () => {
    device.getRaw(function (err, devices) {
        DEBUG_OWFS("DEVICES LIST SEND", devices)
        io.sockets.emit('devices init', devices);

    })
}

io.on('connection', socket => {
    console.log('New client connected')
    updateDevices();
    socket.on('switch', (name, state) => {
        device.switch(name, state, function () {
            updateDevices();
        })
    })

    // disconnect is fired when a client leaves the server
    socket.on('disconnect', () => {
        console.log('user disconnected')
    })
})

function refresh() {
    updateDevices();
    setTimeout(refresh, 5000);
}
refresh();

server.listen(port, () => console.log(`Listening on port ${port}`))