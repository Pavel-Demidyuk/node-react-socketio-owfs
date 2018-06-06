DEBUG = require('debug')('app')
DEBUG_OWFS = require('debug')('owfs')
DEBUG_AUTOMATION = require('debug')('automation')
DEBUG_WARNING = require('debug')('WARNING')

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

var updateInProgress = false;

updateSwitcher = () => {
    if (updateInProgress) {
        DEBUG_WARNING('UPDATE ALREADY IN PROGRESS, SKIPPING')
        return;
    }

    updateInProgress = true;
    device.getRaw('switcher', function (err, devices) {
        updateInProgress = false;
        DEBUG_OWFS("DEVICES LIST TO SEND", devices)
        io.sockets.emit('switchers_update', devices);
        var date = new Date()
    })

}

updateThermos = () => {
    if (updateInProgress) {
        DEBUG_WARNING('UPDATE ALREADY IN PROGRESS, SKIPPING')
        return;
    }

    device.getRaw('thermo', function (err, thermos) {
        device.runRules(thermos, function () {
            // do nothing so far for async run
        })
        io.sockets.emit('thermos_update', thermos);
    })
}

io.on('connection', socket => {
    DEBUG('New client connected')
    socket.on('switch', (name, state) => {
        device.turn(state, name, function () {
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