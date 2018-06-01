import React, {Component} from "react";
import socketIOClient from "socket.io-client";

class App extends Component {
    constructor() {
        super();
        this.state = {
            endpoint: "http://127.0.0.1:4001",
            color: 'white'
        }
    }

    // sending sockets
    send = () => {
        const socket = socketIOClient(this.state.endpoint);
        socket.emit('change color', this.state.color) // change 'red' to this.state.color
    }

    // adding the function
    setColor = (color) => {
        // this.setState({color})
    }

    render() {
        // testing for socket connections

        const socket = socketIOClient(this.state.endpoint);
        // socket.on('change color', (col) => {
        //     document.body.style.backgroundColor = col
        // })

        socket.on('devices init', (devices) => {
            console.log("!!!!!!", devices);

            // this.setState({color: "green"})
            // this.setState(devices)
            // this.state.devices = devices;
        })






        return (
            <div style={{margin: '20px'}}>
                {/*<button onClick={() => this.send() }>Change Color</button>*/}
                {/*<button id="blue" onClick={() => this.setColor('blue')}>Blue</button>*/}
                {/*<button id="red" onClick={() => this.setColor('red')}>Red</button>*/}
                <label className="mdl-switch mdl-js-switch mdl-js-ripple-effect" htmlFor="switch-2">
                    <input type="checkbox" id="switch-2" className="mdl-switch__input"></input>
                    <span className="mdl-switch__label">test 1</span>
                </label>
            </div>
        )
    }
}

export default App;