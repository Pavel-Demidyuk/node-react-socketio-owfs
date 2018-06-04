import React, {Component} from "react";
import socketIOClient from "socket.io-client";

class App extends Component {
    state = {
        endpoint: "http://raspberrypi.local:4001",
        devices: [],
    }

    constructor() {
        super();
        const socket = socketIOClient(this.state.endpoint);
        socket.on('devices init', (devices) => {
            console.log(devices)

            this.setState({
                devices: devices
            })
        })
    }

    switch = (name, state) => {

        console.log(name, state);
        var result = this.state.devices.map((device) => {
            if (device.name === name) {
                device.sensor = state
            }
            return device;
        })

        this.setState({
            devices: result
        })

        socketIOClient(this.state.endpoint).emit(
            'switch', name, state)

    }

    render() {

        if (!this.state.devices.length) {
            return "устанавливаем подключение...";
        }

        var devicesList = this.state.devices.map((device) => {
            if (device.type === 'switcher') {
                var style = {
                    cursor: 'pointer',
                    fill: device.sensor === 1 ? 'orange' : 'grey'
                }

                var bulb = <svg
                    xmlns="http://www.w3.org/2000/svg" style={style} width="30" height="50" viewBox="0 0 12 16">
                    <path fillRule="evenodd"
                          d="M6.5 0C3.48 0 1 2.19 1 5c0 .92.55 2.25 1 3 1.34 2.25 1.78 2.78 2 4v1h5v-1c.22-1.22.66-1.75 2-4 .45-.75 1-2.08 1-3 0-2.81-2.48-5-5.5-5zm3.64 7.48c-.25.44-.47.8-.67 1.11-.86 1.41-1.25 2.06-1.45 3.23-.02.05-.02.11-.02.17H5c0-.06 0-.13-.02-.17-.2-1.17-.59-1.83-1.45-3.23-.2-.31-.42-.67-.67-1.11C2.44 6.78 2 5.65 2 5c0-2.2 2.02-4 4.5-4 1.22 0 2.36.42 3.22 1.19C10.55 2.94 11 3.94 11 5c0 .66-.44 1.78-.86 2.48zM4 14h5c-.23 1.14-1.3 2-2.5 2s-2.27-.86-2.5-2z"/>
                </svg>


                var result =
                    <div key={device.name} onClick={() => this.switch(device.name, 1 - device.sensor)}
                         className="element">
                        {bulb}
                        <div>{device.name}&nbsp;
                            <small>{device.sensor}</small>
                        </div>
                    </div>
                return result
            }

            return <div key={device.name} className="element">
                <li>{device.name} - {device.data}</li>
            </div>
        })

        return (devicesList);

        // return (
        //     <div style={{margin: '20px'}}>
        //         {/*<button onClick={() => this.send() }>Change Color</button>*/}
        //         {/*<button id="blue" onClick={() => this.setColor('blue')}>Blue</button>*/}
        //         {/*<button id="red" onClick={() => this.setColor('red')}>Red</button>*/}
        //         <label className="mdl-switch mdl-js-switch mdl-js-ripple-effect" htmlFor="switch-2">
        //             <input type="checkbox" id="switch-2" className="mdl-switch__input"></input>
        //             <span className="mdl-switch__label">test 1</span>
        //         </label>
        //
        //         ***{ this.state.color }***
        //     </div>
        // )
    }
}

export default App;