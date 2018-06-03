// this is hardcode list of devices for the testing purposes

var devices = [
    {
        name: 'switcher_1',
        type: 'switcher',
        switcher_path: '/3A.999248336241/PIO.A',
        sensor_path: '/3A.D8FE434D9855/PIO.B'
    },

    {
        name: 'switcher_2',
        type: 'switcher',
        switcher_path: '/3A.98542F112D05/PIO.A',
        sensor_path: '/3A.D8FE434D9855/PIO.A'
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