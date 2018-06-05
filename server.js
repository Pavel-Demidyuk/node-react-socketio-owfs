DEBUG = require('debug')('app')
DEBUG_OWFS = require('debug')('owfs')
DEBUG_AUTOMATION = require('debug')('automation')

const express = require('express')
const http = require('http')
const socketIO = require('socket.io')
const device = require('./models/device')
const config = require('./configs/config')


// our localhost port
const port = config.server_port

const app = express()

// our server instance
const server = http.createServer(app)
const io = socketIO(server)

updateSwitcher = () => {
    device.getRaw('switcher', function (err, devices) {
        DEBUG_OWFS("DEVICES LIST TO SEND", devices)
        io.sockets.emit('switchers_update', devices);

    })
}

updateThermos = () => {
    device.getRaw('thermo', function (err, thermos) {
        device.runRules(thermos, function(){
            // do nothing so far for async run
        })
        io.sockets.emit('thermos_update', thermos);
    })
}

io.on('connection', socket => {
    DEBUG('New client connected')
    updateSwitcher();
    socket.on('switch', (name, state) => {
        device.switch(name, state, function () {
            updateSwitcher();
        })
    })
    socket.on('disconnect', () => {
        DEBUG('user disconnected')
    })
})

function refreshSwitchers_Cron() {
    updateSwitcher();
    setTimeout(refreshSwitchers_Cron, config.devices_refresh_interval);
}

function refreshThermo_Cron() {
    updateThermos();
    setTimeout(refreshThermo_Cron, config.thermos_refresh_interval);
}

server.listen(port, () => DEBUG(`Listening on port ${port}`))

refreshSwitchers_Cron();
refreshThermo_Cron();