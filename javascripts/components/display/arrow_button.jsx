import React from 'react';

class ArrowButton extends React.Component {
    constructor(props) {
        super(props);
        this.changeColor = this.changeColor.bind(this);
        this.colorMenu = this.colorMenu.bind(this);
        this.toggleColorMenu = this.toggleColorMenu.bind(this);
        this.state = {
            showColors: false
        };

        this.colors = [
            'red', 
            'blue',
            'lightblue',
            'darkblue',
            'green',
            'black',
            'white'
        ];

        this.forceLabels = {
            appWind: 'Apparent Wind',
            sailLift: 'Lift on Sail',
            dragOnSail: 'Drag on Sail',
            sailForce: 'Force on Sail',
            boardLift: 'Lift on Centerboard',
            boardDrag: 'Drag on Centerboard',
            boardForce: 'Force on Centerboard',
            hullDrag: 'Drag on Hull',
            totalForce: 'Total Force on Boat'
        }
    }

    toggleColorMenu() {
        this.setState({
            showColors: (this.state.showColors ? false : true)
        });
    }

    changeColor(color) {
        this.props.setArrowColor(this.props.arrow, color);
        this.toggleColorMenu();
    }

    colorMenu() {
        let that = this;
        if (this.state.showColors && this.props.large) {
            //touch layout: swatches sit in their own row under the button
            return (
                <div className="colorRowLarge">
                    {
                        this.colors.map((color, idx) => {
                            return (
                                <div key={idx}
                                    onClick={() => that.changeColor(color)}
                                    style={{
                                        'height': '36px',
                                        'width': '36px',
                                        'borderRadius': '18px',
                                        'margin': '4px 10px 4px 0',
                                        'border': '1px solid gray',
                                        'backgroundColor': `${color}`
                                    }}
                                />
                            );
                        })
                    }
                </div>
            );
        }
        else if (this.state.showColors) {
            return (
                <div style={{'position' : 'relative'}}>
                <div style={{
                    'display' : 'flex',
                    'position' : 'absolute',
                    'top' : '20px',
                    'left' : '-20px'
                    }}>
                    {
                        this.colors.map( (color, idx) => {
                            return (
                                <div key={idx}
                                    onClick={() => that.changeColor(color)} 
                                    style={{
                                    'height': '20px',
                                    'width': '20px',
                                    'borderRadius': '10px',
                                    'backgroundColor': `${ color }`
                                    }}
                                />
                            );
                        })
                    }
                </div>
                </div>
            );
        }
        else {
            return null;
        }
    }

    render() {
        if (this.props.large) {
            return (
                <div className="arrowRowLarge">
                    <div style={{'display': 'flex', 'alignItems': 'center'}}>
                        <div
                            className="colorDotLarge"
                            style={{'backgroundColor': `${this.props.color}`}}
                            onClick={this.toggleColorMenu}
                        />
                        <div
                            className="arrowButton arrowButtonLarge"
                            style={this.props.active ? {'backgroundColor' : this.props.color} : {}}
                            id={this.props.arrow}
                            onClick={this.props.toggleArrow}
                        >{this.forceLabels[this.props.arrow]}</div>
                    </div>
                    {this.colorMenu()}
                </div>
            );
        }
        return (
            <div style={{'display' : 'flex'}}>
                <div 
                    style={{
                    'height': '20px',
                    'width': '20px',
                    'borderRadius': '10px',
                    'marginLeft' : '10px',
                    'backgroundColor': `${this.props.color}`
                    }}
                    onClick={this.toggleColorMenu}
                />
                {this.colorMenu()}
                <div
                    className="arrowButton"
                    style={this.props.active ? {'backgroundColor' : this.props.color} : {}}
                    id={this.props.arrow}
                    onClick={this.props.toggleArrow}
                >{this.forceLabels[this.props.arrow]}</div>
            </div>
        );
    }
}

export default ArrowButton;