import React from 'react'
import ReactDOM from 'react-dom'
import Switchers from './Switchers' // import the App component that we created earlier.
import Thermos from './Thermos' // import the App component that we created earlier.
import registerServiceWorker from './registerServiceWorker'
import socketIOClient from "socket.io-client";

var config = require('./config.js')
var endpoint = config.server_host + ':' + config.server_port
const socket = socketIOClient(endpoint);

ReactDOM.render(
    <div>
        <Switchers socket={socket} endpoint={endpoint}/>
        <Thermos socket={socket} endpoint={endpoint} limit={config.thermo_display_limit}/>
    </div>
    , document.getElementById('root'))
registerServiceWorker()