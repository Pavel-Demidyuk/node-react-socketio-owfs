var Promise = require('bluebird');
var appConfig = require('../configs/config');
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

    turn: function (state, input, callback) {
        DEBUG_OWFS('>>>*TURN ' + state + ' device ' + input)
        var sensorState, switcherState;
        devicesConfig.forEach(function(device){
            if (device.name == input || device.switcher_path == input) {
                Promise.all([
                    readFullPath(device.switcher_path),
                    readFullPath(device.sensor_path),
                ]).then(function(data){
                    [switcherState, sensorState] = data
                    if (state == sensorState) {
                        // do nothing, already switched
                        DEBUG_WARNING(
                            'Can\'t update '
                            + input
                            + ' to state ' + state + ' beacuse it\'s already in this state')
                        callback(false);
                    }
                    else {
                        write(device.switcher_path, 1 - switcherState, callback)
                    }
                })
            }
        })
    },

    runRules: function (thermosData) {
        if (!appConfig.automation) {
            DEBUG_AUTOMATION('Automation is turned off in the configs');
            return;
        }

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

                                var action = action == 'ON' ? 1 : 0;
                                switch (symbol) {
                                    case '>' : {
                                        if (thermoData.data > temperature) {
                                            DEBUG_AUTOMATION("AUTOMATION: ", fullPath, action);
                                            self.turn(action, fullPath, function () {
                                                // self.runRules(thermosData);
                                            })
                                        }
                                        break;
                                    }
                                    case '<' : {
                                        if (thermoData.data < temperature) {
                                            DEBUG_AUTOMATION("AUTOMATION: ", fullPath, action);
                                            self.turn(action, fullPath, function () {
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