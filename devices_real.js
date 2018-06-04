// this is hardcode list of devices for the testing purposes

var devices = [
    {
        name: 'первый рубильник',
        type: 'switcher',
        switcher_path: '/3A.B7C507000000/PIO.A',
        sensor_path: '/3A.9FC307000000/PIO.B'
    },

    {
        name: 'второй рубильник',
        type: 'switcher',
        switcher_path: '/3A.B7C507000000/PIO.A',
        sensor_path: '/3A.9FC307000000/PIO.A'
    },
    {
        name: 'термометр',
        type: 'thermo',
        path: '/28.FF6754610400/temperature',
    }
]


module.exports = devices;