import React from 'react';
import ArrowButton from './arrow_button';
import {
    toRadians,
    toDegrees,
    getHeading,
    vectorMag
} from '../util/vector_util';
import {
    makeInArrow,
    makeOutArrow,
    makeStreamRipple,
    drawForceArrows
} from './canvas_helper';

class TopDiagram extends React.Component {
    constructor(props) {
        super(props);
        this.appDir = [0, 0];
        this.appHeading = 0;

        this.arrows = {
            appWind: true,
            sailLift: false,
            dragOnSail: false,
            sailForce: true,
            boardLift: false,
            boardDrag: false,
            boardForce: true,
            hullDrag: false,
            totalForce: false
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

        this.toggleArrow = this.toggleArrow.bind(this);
        this.setArrowColor = this.setArrowColor.bind(this);
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
        this.drawDiagram();
    }

    componentDidUpdate() {
        //the mobile drawer keeps this mounted while closed, no need to paint it
        if (this.props.hidden) return;
        this.drawDiagram();
    }

    clearDisplay() {
        this.ctx.fillStyle = 'blue';
        this.ctx.fillRect(0, 0, 300, 300);
    }

    drawDiagram() {
        this.clearDisplay();
        this.drawBoat();
    }

    drawBoat() {
        let model = this.props.model;
        let boat = model.boat;
        let ctx = this.ctx;

        //streamRipples
        makeStreamRipple(ctx, 150, 80, boat.velocity, boat.heading);
        makeStreamRipple(ctx, 183, 210, boat.velocity, boat.heading);
        makeStreamRipple(ctx, 117, 210, boat.velocity, boat.heading);

        //boat
        ctx.beginPath();
        ctx.fillStyle = 'brown';
        ctx.beginPath();
        ctx.arc(230, 170, 120, 2.8, 3.99, false);
        ctx.arc(70, 170, 120, -0.85, 3.14 - 2.8, false);
        ctx.closePath();
        ctx.fill();

        //mast
        ctx.beginPath();
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(150, 115, 3, 0, 2 * Math.PI, true);
        ctx.fill();
        
        //keep label text a readable size when the mobile drawer shrinks this canvas
        const labels = this.props.showLabels ? { size: Math.round(12 / Math.max(this.props.scale || 1, 0.6)) } : null;
        drawForceArrows(ctx, 150, 150, this.arrows, model, boat, this.arrowColors, labels);

        //sheetAngleIndicator
        let sheetAngle = toRadians(boat.mainSheetPos);
        let indicatorLength = 60;
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'white';
        ctx.beginPath();
        ctx.moveTo(150, 111);
        ctx.lineTo(
            150 + indicatorLength * Math.sin(sheetAngle),
            111 + indicatorLength * Math.cos(sheetAngle)
        );
        ctx.moveTo(150, 111);
        ctx.lineTo(
            150 - indicatorLength * Math.sin(sheetAngle),
            111 + indicatorLength * Math.cos(sheetAngle)
        );
        ctx.stroke();

        //boom
        let boomAngle = toRadians(boat.sailAngle);
        let boomLength = 80;
        ctx.lineWidth = 3;
        ctx.strokeStyle = 'black'
        ctx.beginPath();
        ctx.moveTo(150, 115);
        ctx.lineTo(
            150 + boomLength * Math.sin(boomAngle),
            115 + boomLength * Math.cos(boomAngle)
        );
        ctx.stroke();

        //center point
        ctx.beginPath();
        ctx.fillStyle = 'blue';
        ctx.beginPath();
        ctx.arc(150, 150, 2, 0, 2 * Math.PI, true);
        ctx.fill();

        //rudder
        let angle = toRadians(boat.rudderAngle);
        let rudderLength = 20;
        ctx.beginPath();
        ctx.arc(150, 210, 2, 0, 2 * Math.PI, true);
        ctx.moveTo(150, 210);
        ctx.lineWidth = 3;
        ctx.lineTo(
            150 - rudderLength * Math.sin(angle), 
            210 + rudderLength * Math.cos(angle)
            );
        ctx.stroke();
        //tiller
        let tillerLength = 30;
        ctx.beginPath();
        ctx.moveTo(150, 210);
        ctx.lineWidth = 1;
        ctx.lineTo(
            150 + tillerLength * Math.sin(angle),
            210 - tillerLength * Math.cos(angle)
        );
        ctx.stroke();
        

    }

    render (){
        if (this.props.mobile) {
            //the drawer shows the arrow toggles itself
            const scale = this.props.scale || 1;
            return (
                <canvas ref="canvas"
                    width="300px"
                    height="300px"
                    style={{
                        display: 'block',
                        width: (300 * scale) + 'px',
                        height: (300 * scale) + 'px'
                    }}
                />
            );
        }
        return (
            <div style={{'width' : '300px'}}>
                <canvas ref="canvas"
                    width="300px"
                    height="300px"
                />
                <div style={{ 'display': 'flex', 'flexDirection': 'row', 'flexWrap': 'wrap'}}>
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
}

export default TopDiagram;