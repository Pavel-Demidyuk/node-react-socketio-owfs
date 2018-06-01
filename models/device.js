// var model = require('../../models/db/db');
var Promise = require('bluebird');
var sleep = require('sleep').sleep;
// var Client = require("owfs").Client; // real client !! DO NOT REMOVE!!
var Client = require('../models/fake_owfs').Client;

var dirall = Promise.promisify(
    Client.prototype.dirall
);

// @todo replace hardcode
var client = new Client('127.0.0.1', '4304');
var concurrency = 10; // number of concurrent reads


var checkFormat = function (device) {
    if (device.charAt(0) !== '/') {
        device = '/' + device;
    }
    return device;
}

var read = function (device) {
    device = checkFormat(device);

    return Promise.all([
        readFullPath(device + '/' + 'PIO.ALL'),
        readFullPath(device + '/' + 'PIO.A'),
        readFullPath(device + '/' + 'PIO.B'),
        readFullPath(device + '/' + 'sensed.ALL'),
        readFullPath(device + '/' + 'sensed.A'),
        readFullPath(device + '/' + 'sensed.B'),
        readFullPath(device + '/' + 'data'), // @todo change to actual name
    ]).then(function (data) {
        return new Promise(function (resolve, reject) {
            if (typeof data[0] == 'undefined') {
                // thermo
                resolve(
                    {
                        device: device,
                        data: data[6],
                    }
                );
            }
            else {
                // switcher
                resolve(
                    {
                        device: device,
                        'PIO.ALL': data[0],
                        'PIO.A': data[1],
                        'PIO.B': data[2],
                        'sensed.ALL': data[3],
                        'sensed.A': data[4],
                        'sensed.B': data[5],
                    }
                );
            }
        })
    })
};

var readFullPath = function (fullPath) {
    fullPath = checkFormat(fullPath);

    return new Promise(function (resolve, reject) {
        client.read(fullPath, function (err, data) {
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

var toggle = function (fullPath) {
    fullPath = checkFormat(fullPath);
    return new Promise(function (resolve, reject) {
        readFullPath(fullPath).then(function (value) {
            write(fullPath, 1 - value).then(function () {
                read(fullPath.split("/")[1]).then(function (data) {
                    resolve(data);
                })
            })
        })
    })
}

var getAllDevicesData = function (blacklist) {
    return dirall.call(client, '/').then(function (entries) {
        return Promise.filter(entries, function (entry) {
            return !blacklist || !entry.match(blacklist);
        }).then(function (entries) {
            return Promise.all(entries.map(read, {concurrency: concurrency}));
        });
    });
}

var groundAll = function () {
    return new Promise(function (resolve, reject) {
        getAllDevicesData().then(function (devices) {
            devices.forEach(function (device) {
                client.write(device.device + '/PIO.A', 0, function () {
                    client.write(device.device + '/PIO.B', 0, function () {
                        resolve();
                    });
                });
            })
        })
    })
}

var device = {
    findPair: function (fullPath) {
        var self = this;
        fullPath = checkFormat(fullPath);

        var deviceName = checkFormat(fullPath.split('/')[1]);

        return new Promise(function (resolve, reject) {
            var pair = {}
            self.getRaw(function (err, startValues) {
                toggle(fullPath).then(function () {
                    getAllDevicesData().then(function (endValues) {
                        endValues.forEach(function (endValue) {
                            var testedDeviceName = endValue.device;
                            if (testedDeviceName == deviceName) {
                                // we shouldn't test device itself
                                return;
                            }
                            else {
                                try {
                                    startValues.forEach(function (startValue) {
                                        if (startValue.device == testedDeviceName) {
                                            if (startValue['sensed.A'] !== endValue['sensed.A']) {
                                                pair = {
                                                    'switcher': fullPath,
                                                    'sensor': startValue.device + '/PIO.A'
                                                }
                                                throw 'ok';
                                            }
                                            if (startValue['sensed.B'] !== endValue['sensed.B']) {
                                                pair = {
                                                    'switcher': fullPath,
                                                    'sensor': startValue.device + '/PIO.B'
                                                }
                                                throw 'ok';
                                            }
                                        }
                                    })
                                }
                                catch (e) {
                                    DEBUG(e);
                                }
                            }
                        })

                    }).then(function () {
                        sleep(1);
                        groundAll().then(resolve(pair));
                    })
                })
            })
        })
    },

    getRaw: function (callback) {
        getAllDevicesData().then(function (data) {
            callback(false, data)
        })
    },

    write: function (device, data, callback) {
        if (data != 1 && data != 0) {
            throw 'Value should be either 1 or 0';
        }

        write(device, data).then(function () {
            read(device).then(function (data) {
                callback(false, data)
            })
        })
    }
}

module.exports = device;