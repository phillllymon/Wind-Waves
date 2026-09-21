import React from 'react';
import ArrowButton from './arrow_button';
import MobileControls from './mobile_controls';
import {
    getUnitVector,
    vectorMag
} from '../util/vector_util';
import {
    drawForceArrows,
    makeStreamRipple,
    makeInArrow
} from './canvas_helper';

class MainDisplay extends React.Component {
    constructor(props) {
        super(props);
        this.arrows = {
            appWind: true,
            sailLift: false,
            dragOnSail: false,
            sailForce: false,
            boardLift: false,
            boardDrag: false,
            boardForce: false,
            hullDrag: false,
            totalForce: false,
        };

        this.arrowColors = {
            appWind: 'lightblue',
            sailLift: 'green',
            dragOnSail: 'red',
            sailForce: 'black',
            boardLift: 'green',
            boardDrag: 'red',
            boardForce: 'black',
            hullDrag: 'red',
            totalForce: 'black'
        }

        this.centerBoat = this.centerBoat.bind(this);
        this.toggleArrow = this.toggleArrow.bind(this);
        this.setArrowColor = this.setArrowColor.bind(this);

        this.state = {
            intro: 1
        };
    }

    get width() {
        return this.props.width || 1200;
    }

    get height() {
        return this.props.height || 800;
    }

    // canvases on high-density phone screens are drawn at up to 2x for crispness
    pixelRatio() {
        return this.props.mobile ? Math.min(window.devicePixelRatio || 1, 2) : 1;
    }

    mobileIntroPopup() {
        if (this.state.intro === 1) {
            return (
                <div className="intro intro_mobile">
                    <center>
                        Welcome to Wind & Waves!
                        <br />
                        <br />
                        Sail your boat with the buttons at the bottom:
                        <br />
                        -steer port or starboard on the left
                        <br />
                        -let your sail out or pull it in on the right
                        <br />
                        <br />
                        <button
                            className="intro_button"
                            onClick={() => this.setState({ intro: 2 })}
                        >
                            OK, got it
                        </button>
                    </center>
                </div>
            );
        }
        if (this.state.intro === 2) {
            return (
                <div className="intro intro_mobile">
                    <center>
                        Use the buttons along the top:
                        <br />
                        <br />
                        <b>Forces</b>: tap a force to toggle its arrow, tap its colored circle to set that arrow's color
                        <br />
                        <br />
                        <b>Follow</b>: keep the view centered on your boat while the sea moves past
                        <br />
                        <br />
                        <b>Views</b>: slide down the top-down and stern views. Drag the bottom edge to resize, tap Views again to hide
                        <br />
                        <br />
                        <button
                            className="intro_button"
                            onClick={() => {
                                this.setState({ intro: false });
                                this.centerBoat();
                            }}
                        >
                            OK, sail now
                        </button>
                    </center>
                </div>
            );
        }
        return null;
    }

    introPopup() {
        if (this.state.intro) {
            switch (this.state.intro) {
                case 1:
                    return (
                        <div className="intro">
                            <center>
                                Welcome to Wind & Waves!
                                <br />
                                <br />
                                Sail your boat around using WASD for controls:
                                <br />
                                -steer with A and D
                                <br />
                                -W to let your sail out
                                <br />
                                -S to pull your sail in
                                <br />
                                <br />
                                <button 
                                    className="intro_button"
                                    onClick={() => this.setState({intro: 2})}
                                >
                                    OK, got it
                                </button>
                            </center>
                        </div>
                    );
                case 2:
                    return (
                        <div className="intro" style={{'top': '25', 'transform': 'translate(-50%, 0)', 'paddingTop': '5px'}}>
                            <center>                  
                                {'\u2B06'}              
                                <br/>
                                Use the buttons along the top of this display to see <br/>the different forces acting on your boat:
                                <br/>
                                <br/>
                                -click the buttons to toggle force arrows
                                <br/>
                                -click the colored circle to set that arrow's color
                                <br />
                                <br />
                                <button
                                    className="intro_button"
                                    onClick={() => {
                                        this.setState({ intro: false });
                                        this.centerBoat();
                                    }}
                                >
                                    OK, sail now
                                </button>
                            </center>
                        </div>
                    );
                default:
                    return (
                        <div>
                        </div>
                    );
            }
            
        }
    }

    toggleArrow(e) {
        let val = this.arrows[e.target.id];
        this.arrows[e.target.id] = val ? false : true;
    }

    setArrowColor(arrow, color) {
        this.arrowColors[arrow] = color;
    }

    componentDidMount() {
        this.ctx = this.refs.canvas.getContext('2d');
        this.drawModel();
    }

    componentDidUpdate() {
        this.drawModel();
    }

    clearDisplay() {
        const ratio = this.pixelRatio();
        this.ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
        this.ctx.fillStyle = 'darkblue';
        this.ctx.fillRect(0, 0, this.width, this.height);
    }

    drawModel() {
        this.clearDisplay();
        this.drawBoat();
    }

    drawBoat() {
        let model = this.props.model;
        let boat = this.props.boat;
        let pos = boat.position;
        let dir = boat.heading * Math.PI / 180;
        let windMap = this.props.windMap;
        let ctx = this.ctx;

        //when following, the boat stays at the center and the sea slides past it
        const follow = this.props.followBoat;
        const shiftX = this.width / 2 - pos[0];
        const shiftY = this.height / 2 - pos[1];
        const wrap = (value, size) => ((value % size) + size) % size;
        const drawPos = follow ? [this.width / 2, this.height / 2] : pos;

        //display waves
        windMap.waves.forEach( (row) => {
            row.forEach( (waveInWorld) => {
                //the sea repeats every screen, so the waves never run out however far the boat sails
                const wave = follow ? {
                    pos: [
                        wrap(waveInWorld.pos[0] + shiftX, windMap.width),
                        wrap(waveInWorld.pos[1] + shiftY, windMap.height)
                    ],
                    stage: waveInWorld.stage
                } : waveInWorld;
                ctx.strokeStyle = 'blue';
                // if (wave.stage > 8){
                //     ctx.strokeStyle = 'lightblue';
                // }
                // else {
                //     ctx.strokeStyle = 'blue';
                // }
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(wave.pos[0], wave.pos[1]);
                let widthFactor = wave.stage < 12 ? wave.stage : 17 - (2*wave.stage);
                //let widthFactor = wave.stage;
                ctx.lineTo(wave.pos[0] + (1 * widthFactor + 2), wave.pos[1]);
                ctx.moveTo(wave.pos[0], wave.pos[1]);
                ctx.lineTo(wave.pos[0] - (1 * widthFactor + 2), wave.pos[1]);
                ctx.stroke();
            });
        });

        //orient to boat
        ctx.translate(drawPos[0], drawPos[1]);
        ctx.rotate(dir);

        //streamRipples
        makeStreamRipple(ctx, 0, -33, boat.velocity, boat.heading);
        makeStreamRipple(ctx, 17, 29, boat.velocity, boat.heading);
        makeStreamRipple(ctx, -17, 29, boat.velocity, boat.heading);

        //draw boat
        ctx.fillStyle = 'red';
        ctx.beginPath();
        ctx.arc(35, 10, 55, 2.8, 4.0, false);
        ctx.arc(-35, 10, 55, 4.0 + (3.14 - (2 * (4.0 - 3.14))), 3.14 - 2.8, false);
        //ctx.arc(-35, 10, 55, 9.42 - 4, false);   //slow brain not seeing why this is not equivalent...
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = 'black';
        ctx.beginPath();
        let mastPos = [0, -15];
        ctx.arc(mastPos[0], mastPos[1], 2, 0, 2 * Math.PI, true);
        ctx.fill();

        let sailAngle = boat.sailAngle * Math.PI / 180;
        let unitDir = [Math.sin(sailAngle), Math.cos(sailAngle)];
        let boomEndpoint = [
            mastPos[0] + unitDir[0] * 45, 
            mastPos[1] + unitDir[1] * 45
        ];
        ctx.beginPath();
        ctx.strokeStyle = 'black';
        ctx.moveTo(0, -15);
        ctx.lineTo(boomEndpoint[0], boomEndpoint[1]);
        ctx.stroke();

        const labels = this.props.showLabels ? { size: this.props.mobile ? 13 : 12 } : null;
        drawForceArrows(ctx, 0, 0, this.arrows, model, boat, this.arrowColors, labels);

        ctx.rotate(-dir);
        ctx.translate(-(drawPos[0]), -(drawPos[1]));

        //display true wind
        if (this.props.mobile) {
            //top right corner, clear of the controls
            const x = this.width - 60;
            makeInArrow(ctx, x, 190, Math.PI, 100, 100, 10, 'lightblue');
            ctx.fillStyle = 'lightblue';
            ctx.font = '14px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('TRUE WIND', x, 115);
        }
        else {
            makeInArrow(ctx, this.width / 2, 170, Math.PI, 100, 100, 10, 'lightblue');
        }

    }

    mainControls() {
        return (
            <div style={{'display' : 'flex'}}>
                <button 
                    style={{'position' : 'fixed', 'top' : '30', 'left' : '310'}}
                    onClick={this.centerBoat}>re-center boat
                </button>
                <button
                    style={{ 'position': 'fixed', 'top': '30', 'left': '440' }}
                    onClick={() => this.setState({intro: 1})}>see intro again
                </button>
                <button
                    style={{ 'position': 'fixed', 'top': '30', 'left': '570' }}
                    onClick={this.props.onToggleLabels}>label forces: {this.props.showLabels ? 'on' : 'off'}
                </button>
                <button
                    style={{ 'position': 'fixed', 'top': '30', 'left': '710' }}
                    onClick={this.props.onToggleFollow}>follow boat: {this.props.followBoat ? 'on' : 'off'}
                </button>
                <div
                    style={{
                        'position': 'fixed',
                        'top': '30',
                        'left': '855',
                        'color': 'lightblue'
                    }}
                >
                    TRUE WIND
                </div>
                {this.introPopup()}
                <div style={{'position': 'fixed', 'display': 'flex', 'backgroundColor': 'white'}}>
                {
                    Object.keys(this.arrows).map((key, idx) => {
                        return (
                        <div key={idx}>
                            <ArrowButton 
                                arrow={key}
                                active={this.arrows[key]} 
                                color={this.arrowColors[key]}
                                setArrowColor={this.setArrowColor}
                                toggleArrow={this.toggleArrow}
                            />
                        </div>
                        );
                
                    })
                }
                </div>
            </div>
        );
    }

    centerBoat() {
        this.props.model.boat.position = [this.width / 2, this.height / 2];
    }

    render() {
        const ratio = this.pixelRatio();
        const canvas = (
            <canvas ref="canvas"
                width={this.width * ratio}
                height={this.height * ratio}
                style={this.props.mobile ? {
                    display: 'block',
                    width: this.width + 'px',
                    height: this.height + 'px'
                } : undefined}
            />
        );

        if (this.props.mobile) {
            return (
                <div className="mobile_display">
                    {canvas}
                    <MobileControls
                        model={this.props.model}
                        showLabels={this.props.showLabels}
                        onToggleLabels={this.props.onToggleLabels}
                        followBoat={this.props.followBoat}
                        onToggleFollow={this.props.onToggleFollow}
                        viewportWidth={this.width}
                        viewportHeight={this.height}
                        inputManager={this.props.inputManager}
                        arrows={this.arrows}
                        arrowColors={this.arrowColors}
                        toggleArrow={this.toggleArrow}
                        setArrowColor={this.setArrowColor}
                        centerBoat={this.centerBoat}
                        showIntro={() => this.setState({ intro: 1 })}
                    />
                    {this.mobileIntroPopup()}
                </div>
            );
        }

        return (
            <div>
                {this.mainControls()}
                {canvas}
            </div>
        );
    }
}

export default MainDisplay;