var Client = function (host, port) {
    DEBUG('Fake OWFS client initiated:', host, port);

    this.values = [
        {
            device: '/3A.999248336241',
            '/PIO.A': '0',
            '/PIO.B': '0',
            '/PIO.ALL': '0,0',
            '/sensed.ALL': '0,0',
            '/sensed.A': '0',
            '/sensed.B': '0',
        },
        {
            device: '/3A.D8FE434D9855',
            '/PIO.A': '0',
            '/PIO.B': '0',
            '/PIO.ALL': '0,0',
            '/sensed.ALL': '0,0',
            '/sensed.A': '0',
            '/sensed.B': '0',
        }, {
            device: '/3A.98542F112D05',
            '/PIO.A': '0',
            '/PIO.B': '0',
            '/PIO.ALL': '0,0',
            '/sensed.ALL': '0,0',
            '/sensed.A': '0',
            '/sensed.B': '0',
        },
        {
            device: '/path_to_termo_1',
            '/data' : 25
        },
        {
            device: '/path_to_termo_2',
            '/data' : 30
        },

    ];

    this.relations = [
        {
            switcher: '/3A.999248336241/PIO.A',
            sensor: '/3A.D8FE434D9855/PIO.B'
        },
        {
            switcher: '/3A.98542F112D05/PIO.A',
            sensor: '/3A.D8FE434D9855/PIO.A'
        },
    ]
}

Client.prototype.dirall = function (path, callback) {
    var result = []

    for (var i in this.values) {
        result.push(this.values[i].device);
    }

    callback(false, result);
}

Client.prototype.read = function (path, callback) {
    // DEBUG_OWFS("read", path);
    var deviceName = '/' + path.split('/')[1]
    var path = '/' + path.split('/')[2]

    callback(false, this.findDevice(deviceName)[0][path]);

}

Client.prototype.write = function (fullPath, value, callback) {
    DEBUG_OWFS("write", fullPath, value);

    var device, index;
    var pio_path = fullPath.split('/')[2];
    if (pio_path != 'PIO.A' && pio_path != 'PIO.B') {
        throw 'Can write only to PIO.A or PIO.B';
    }
    [device, index] = this.findDevice('/' + fullPath.split('/')[1]);
    this.values[index]['/' + pio_path] = value;
    if (pio_path == 'PIO.A') {
        var pioAll = value + ',' + this.values[index]['/PIO.ALL'].split(",")[1]
        this.values[index]['/sensed.A'] = value;
    }
    else {
        var pioAll = this.values[index]['/PIO.ALL'].split(",")[0] + ',' + value;
        this.values[index]['/sensed.B'] = value;
    }
    this.values[index]['/PIO.ALL'] = pioAll;
    this.values[index]['/sensed.ALL'] = pioAll;

    this.updateRelations(fullPath, value, callback);
    callback(false);
}

Client.prototype.findDevice = function (deviceName) {
    for (var i in this.values) {
        var dev = this.values[i];
        if (dev.device == deviceName) {
            return [dev, i];
        }
    }

    throw 'Can\'t find a device by the name ' + deviceName;
}

Client.prototype.updateRelations = function (fullPath, value, callback) {
    for (var i in this.relations) {
        if (this.relations[i].switcher == fullPath) {
            // DEBUG(this.relations[i].sensor);
            this.write(this.relations[i].sensor, value, callback);
        }
    }
}

var owfs = {
    Client: Client
}

module.exports = owfs;