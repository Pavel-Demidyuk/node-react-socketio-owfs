var Promise = require('bluebird');

var devicesConfig = require('../devices_real.js');

var Client = require("owfs").Client; // real client !! DO NOT REMOVE!!
// var Client = require('../models/fake_owfs').Client;

var dirall = Promise.promisify(
    Client.prototype.dirall
);

// @todo replace hardcode
var client = new Client('localhost', '4304');
// var client = new Client();
var concurrency = 10; // number of concurrent reads


var checkFormat = function (device) {
    if (device.charAt(0) !== '/') {
        device = '/' + device;
    }
    return device;
}

function getRandomInt() {
    return Math.floor(Math.random() * Math.floor(10000000));
}

var readFullPath = function (fullPath) {
    fullPath = checkFormat(fullPath);
    return new Promise(function (resolve, reject) {
        client.read(fullPath, function (err, data) {
            DEBUG_OWFS("FULL PATH", fullPath, data);
            // DEBUG_OWFS("OWFS ERROR", err)

            if (err)
                DEBUG_OWFS (err);
                // reject(err)
            resolve(data);
        })
    })
}

var write = function (fullPath, value) {
    fullPath = checkFormat(fullPath);

    return new Promise(function (resolve, reject) {
        client.write(fullPath, value, function (err) {
            if (err)
                reject(err);
            else
                resolve(false, null);
        });
    });
};

var device = {
    getRaw: function (callback) {
        Promise.all(devicesConfig.map(function (device) {
            switch (device.type) {
                case 'switcher' : {
                    return Promise.all([
                        readFullPath(device.switcher_path),
                        readFullPath(device.sensor_path)
                    ])
                    break;
                }
                case 'thermo' : {
                    return readFullPath(device.path)
                    break;
                }
            }
        })).then(function (data) {
            var result = [];
            for (var i in devicesConfig) {
                if (Array.isArray(data[i])) {
                    result.push({
                        name: devicesConfig[i].name,
                        type: 'switcher',
                        sensor: Number(data[i][1]),
                        random: getRandomInt()
                    })
                }
                else {
                    result.push({
                        name: devicesConfig[i].name,
                        type: 'thermo',
                        data: Number(data[i])
                    })
                }
            }
            callback(false, result)
        })
    },

    switch: function (deviceName, state, callback) {
        devicesConfig.forEach(function (deviceConfig) {
            if (deviceConfig.name == deviceName) {
                write(deviceConfig.switcher_path, state).then(function(err, data){
                    callback();
                })
            }
        })
    },

    write: function (device, data, callback) {
        if (data != 1 && data != 0) {
            throw 'Value should be either 1 or 0';
        }

        write(device, data).then(function () {
            callback(false, null)
            // read(device).then(function (data) {
            //     callback(false, data)
            // })
        })
    }
}

module.exports = device;