import React, {Component} from "react";
import {LineChart} from 'react-easy-chart';

class App extends Component {
    state = {
        current_values: [],
        thermosGraphData: [],
    }

    constructor(props) {
        super();
        var socket = props.socket;
        socket.on('thermos_update', (thermos) => {
            console.log("THERMOS_UPDATE", thermos);

            var thermosGraphData = this.state.thermosGraphData
            var current_values = [];
            thermos.forEach(function (singleThermo) {

                current_values.push({
                    name: singleThermo.name,
                    value: singleThermo.data
                })

                var date = new Date();
                if (typeof thermosGraphData[singleThermo.name] === 'undefined') {
                    thermosGraphData[singleThermo.name] = []
                    thermosGraphData[singleThermo.name][0] = []
                }

                if (thermosGraphData[singleThermo.name][0].length >= props.limit) {
                    thermosGraphData[singleThermo.name][0].shift();
                }
                thermosGraphData[singleThermo.name][0].push({
                    x: date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds(),
                    y: singleThermo.data
                })
            })
            this.setState({
                thermosGraphData: thermosGraphData,
                current_values: current_values
            })
        })
    }

    render() {
        console.log("RENDERING THERMOS");
        if (!Object.keys(this.state.thermosGraphData)) {
            return <small>ждем ответ от сервера (термометры)...</small>;
        }

        var thermosList = [];

        var self = this;
        this.state.current_values.forEach(function (thermo) {
            var result =
                <div key={thermo.name} className="element">
                    <div>{thermo.name} - {thermo.value}</div>
                    <LineChart
                        axes={true}
                        xType={'text'}
                        width={850}
                        height={350}
                        interpolate={'cardinal'}
                        yDomainRange={[15, 35]}
                        axisLabels={{x: 'My x Axis', y: 'My y Axis'}}
                        data={self.state.thermosGraphData[thermo.name]}
                    />
                </div>

            thermosList.push(result)
        })
        return (thermosList);
    }
}

export default App;