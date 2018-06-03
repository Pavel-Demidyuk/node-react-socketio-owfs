import React, {Component} from "react";
import socketIOClient from "socket.io-client";

class App extends Component {
    state = {
        endpoint: "http://192.168.1.2:4001",
        devices: [],
    }

    constructor() {
        super();
        const socket = socketIOClient(this.state.endpoint);
        socket.on('devices init', (devices) => {
            this.setState({
                devices: devices
            })
        })
    }

    switch = (name, state) => {
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
        if (!this.state.devices) {
            return "loading devices...";
        }

        var devicesList = this.state.devices.map((device) => {
            if (device.type === 'switcher') {
                var result =
                    <div key={device.random} className='element'>
                        {device.name} {device.sensor} <input className="tgl tgl-ios" id={device.name} type="checkbox"
                               defaultChecked={device.sensor === 1}
                               onClick={() => this.switch(device.name, 1 - device.sensor)}
                        />
                        <label className="tgl-btn" htmlFor={device.name}></label>
                        <br/>
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