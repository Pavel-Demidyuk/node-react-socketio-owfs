module.exports = {
    devices_refresh_interval : 3000, // частота принудительного обновления выключателей (милисекунды)
    thermos_refresh_interval : 5000, // частота принудительного обновления термометров (милисекунды)
    thermo_display_limit : 15, // колво отображаемых последних температур
    server_host: 'raspberrypi.local',
    server_port : 4001,
    app_port : 3000,
    automation: false // выключатель автоматизации
}