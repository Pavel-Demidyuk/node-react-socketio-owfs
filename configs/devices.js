// this is hardcode list of devices for the testing purposes

var devices = [
    {
        name: 'рекуператор',
        type: 'switcher',
        switcher_path: '/3A.EEC507000000/PIO.A',
        sensor_path: '/3A.7DC607000000/sensed.A'
    },

    {
        name: 'теплый пол',
        type: 'switcher',
        switcher_path: '/3A.EEC507000000/PIO.B',
        sensor_path: '/3A.7DC607000000/sensed.B'
    },
    {
        name: 'Рекуператор C°',
        type: 'thermo',
        path: '/28.FF6754610400/temperature',
        rules: [
            {
                '>27': '/3A.EEC507000000/PIO.A OFF'
            },
            {
                '<25': '/3A.EEC507000000/PIO.B ON',
            }
        ]
    },
    {
        name: 'Теплый пол C°',
        type: 'thermo',
        path: '/28.C3772D050000/temperature',
    }
]


module.exports = devices;