var Promise = require('bluebird');
var Client = require("owfs").Client; // real client !! DO NOT REMOVE!!
var devicesConfig = require('../devices_real.js');

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



//
// var read = function (device) {
//     devicePath = checkFormat(device.path);
//     return Promise.all([
//         readFullPath(devicePath + '/' + 'PIO.ALL'),
//         readFullPath(devicePath + '/' + 'PIO.A'),
//         readFullPath(devicePath + '/' + 'PIO.B'),
//         readFullPath(devicePath + '/' + 'sensed.ALL'),
//         readFullPath(devicePath + '/' + 'sensed.A'),
//         readFullPath(devicePath + '/' + 'sensed.B')
//     ]).then(function (data) {
//         return new Promise(function (resolve, reject) {
//             if (typeof data[0] == 'undefined') {
//                 // thermo
//                 resolve(
//                     {
//                         device: devicePath,
//                         data: data[6],
//                     }
//                 );
//             }
//             else {
//                 // switcher
//                 resolve(
//                     {
//                         device: devicePath,
//                         'PIO.ALL': data[0],
//                         'PIO.A': data[1],
//                         'PIO.B': data[2],
//                         'sensed.ALL': data[3],
//                         'sensed.A': data[4],
//                         'sensed.B': data[5],
//                     }
//                 );
//             }
//         })
//     })
// };

var readFullPath = function (fullPath) {
    fullPath = checkFormat(fullPath);


    return new Promise(function (resolve, reject) {
        client.read(fullPath, function (err, data) {
            DEBUG_OWFS("FULL PATH", fullPath);
            DEBUG_OWFS("OWFS ERROR", err)

            if (err)
                reject(err)
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
                resolve(read(fullPath.split("/")[1]));
        });
    });
};

var getAllDevicesData = function (blacklist) {
    return dirall.call(client, '/').then(function (entries) {
        return Promise.filter(entries, function (entry) {
            return !blacklist || !entry.match(blacklist);
        }).then(function (entries) {
            return Promise.all(entries.map(read, {concurrency: concurrency}));
        });
    });
}

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
                        sensor: Number(data[i][1])
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
                write(deviceConfig.switcher_path, state, callback)
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