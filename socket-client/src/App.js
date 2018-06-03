import React, {Component} from "react";
import socketIOClient from "socket.io-client";

class App extends Component {
    state = {
        endpoint: "http://127.0.0.1:4001",
        devices: [],
    }

    constructor() {
        super();
        const socket = socketIOClient(this.state.endpoint);
        socket.on('devices init', (devices) => {
            // console.log("DEVICE_INIT", devices);
            this.setState({
                devices: devices
            })
        })
    }

    switch = (name, state) => {
        console.log(name, state);
        socketIOClient(this.state.endpoint).emit(
            'switch', name, state)
    }

    render() {
        if (!this.state.devices) {
            return "loading devices...";
        }

        var devicesList = this.state.devices.map((device) => {

            console.log(device)

            if (device.type === 'switcher') {
                var result =
                    <div key={device.random} className='element'>
                        <label className="mdl-switch mdl-js-switch mdl-js-ripple-effect" htmlFor={device.name}>
                            <input type="checkbox" id={device.name}
                                   className="mdl-switch__input"
                                   defaultChecked={device.sensor === 1}
                                   onClick={() => this.switch(device.name, 1 - device.sensor)}
                            >
                            </input>
                            <span className="mdl-switch__label">{device.name} {device.sensor}</span>
                        </label>
                    </div>
                return result

            }

            return <li key={device.name}>{device.name} - {device.data}</li>
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