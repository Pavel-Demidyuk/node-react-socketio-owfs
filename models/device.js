var Promise = require('bluebird');

var devicesConfig = require('../configs/devices');

switch (process.env.NODE_ENV) {
    case 'dev':
        var Client = require('../models/fake_owfs').Client;
        break;

    case 'prod':
        var Client = require("owfs").Client;
        break;

    default:
        var Client = require("owfs").Client;
}

var client = new Client('localhost', '4304');


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
            DEBUG_OWFS("FULL PATH READ", fullPath, data);
            // DEBUG_OWFS("OWFS ERROR", err)

            if (err)
                DEBUG_OWFS(err);
            // reject(err)
            resolve(data);
        })
    })
}

var write = function (fullPath, value) {
    fullPath = checkFormat(fullPath);
    DEBUG_OWFS("->>>> FULL PATH WRITE", fullPath, value);
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
    getRaw: function (type, callback) {
        Promise.all(devicesConfig.map(function (device) {
            if (device.type === type) {
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
            }
        })).then(function (data) {
            var result = [];
            for (var i in devicesConfig) {
                if (devicesConfig[i].type != type) {
                    continue;
                }

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
                write(deviceConfig.switcher_path, state).then(function (err, data) {
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
    },

    runRules: function (thermosData) {
        // app [ { name: 'Рекуператор C°', type: 'thermo', data: 34.46 },
        //     app   { name: 'Теплый пол C°', type: 'thermo', data: 8.66 } ] +1ms

        var self = this;
        devicesConfig.forEach(function (device) {
            if (device.type != 'thermo') {
                return;
            }
            else {
                thermosData.forEach(function (thermoData) {
                    if (thermoData.name == device.name
                        && typeof device.rules != 'undefined'
                        && device.rules.length > 0
                    ) {
                        device.rules.forEach(function (rule) {
                            for (var condition in rule) {
                                var fullPath, action,
                                    symbol = condition.charAt(0),
                                    temperature = condition.substr(1);

                                [fullPath, action] = rule[condition].split(' ')

                                switch (symbol) {
                                    case '>' : {
                                        if (thermoData.data > temperature) {
                                            DEBUG_AUTOMATION("AUTOMATION: ", fullPath, action);
                                            self.write(fullPath, action == 'ON' ? 1 : 0, function(){
                                                // self.runRules(thermosData);
                                            })
                                        }
                                        break;
                                    }
                                    case '<' : {
                                        if (thermoData.data < temperature) {
                                            DEBUG_AUTOMATION("AUTOMATION: ", fullPath, action);
                                            self.write(fullPath, action == 'ON' ? 1 : 0, function(){
                                                // self.runRules(thermosData);
                                            })
                                        }
                                        break;
                                    }
                                }
                            }
                        })
                    }
                })
            }
        })
    }
}

module.exports = device;