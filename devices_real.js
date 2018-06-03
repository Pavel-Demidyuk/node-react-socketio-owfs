// this is hardcode list of devices for the testing purposes

var devices = [
    {
        name: 'switcher_1',
        type: 'switcher',
        switcher_path: '/3A.B7C507000000/PIO.A',
        sensor_path: '/3A.B7C507000000/PIO.B'
    },

    {
        name: 'switcher_2',
        type: 'switcher',
        switcher_path: '/3A.9FC307000000/PIO.A',
        sensor_path: '/3A.9FC307000000/PIO.A'
    },
    {
        name: 'thermo_1',
        type: 'thermo',
        path: '/path_to_termo_1/data',
    },
    {
        name: 'thermo_2',
        type: 'thermo',
        path: '/path_to_termo_2/data',
    },
]


module.exports = devices;