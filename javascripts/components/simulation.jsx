import React from 'react';
import TopDiagram from './display/top_diagram';
import MainDisplay from './display/main_display';
import GameDisplay from './display/game_display';
import SternDiagram from './display/stern_diagram';
import InputManager from './util/input_manager';
import Model from './physics/model';
import Boat from './physics/boat';
import WindMap from './physics/wind_map';
import Game from './game/game';
import { isMobileDevice, getViewportSize } from './util/device';

class Simulation extends React.Component {
    constructor(props) {
        super(props);
        this.inputManager = new InputManager();
        this.mobile = isMobileDevice();
        const size = this.mobile ? getViewportSize() : { width: 1200, height: 800 };
        this.windMap = new WindMap(size.width, size.height);
        this.model = new Model(new Boat, this.windMap);
        if (this.mobile) {
            this.model.boat.position = [size.width / 2, size.height / 2];
        }
        this.game = new Game(this.model);
        this.state = {
            model: this.model,
            mode: 'simulation',
            viewport: size,
            showLabels: false,
            followBoat: false
        }
        this.toggleLabels = this.toggleLabels.bind(this);
        this.toggleFollow = this.toggleFollow.bind(this);
        this.handleResize = this.handleResize.bind(this);
        this.startSimulation = this.startSimulation.bind(this);
        this.mainLoop = this.mainLoop.bind(this);
        this.showCorrectDisplay = this.showCorrectDisplay.bind(this);
    }

    componentDidMount() {
        this.inputManager.startListening();
        if (this.mobile) {
            document.body.classList.add('mobile');
            window.addEventListener('resize', this.handleResize);
        }
        setTimeout( () => {
            this.startSimulation();
        }, 1000);
    }

    componentWillUnmount() {
        this.inputManager.stopListening();
        if (this.mobile) {
            document.body.classList.remove('mobile');
            window.removeEventListener('resize', this.handleResize);
        }
    }

    toggleLabels() {
        this.setState((prev) => ({ showLabels: !prev.showLabels }));
    }

    toggleFollow() {
        if (this.state.followBoat) {
            //the boat was drawn at the screen center, so make that its real position too
            this.model.boat.position = [this.windMap.width / 2, this.windMap.height / 2];
        }
        this.setState({ followBoat: !this.state.followBoat });
    }

    handleResize() {
        const size = getViewportSize();
        const current = this.state.viewport;
        if (size.width === current.width && size.height === current.height) return;
        this.windMap.resize(size.width, size.height);
        this.model.boat.position = [size.width / 2, size.height / 2];
        this.setState({ viewport: size });
    }

    startSimulation() {
        this.lastTime = Date.now();
        this.mainLoop();
    }

    mainLoop() {
        const dt = (Date.now() - this.lastTime) / 1000;

        this.model.update(this.inputManager.inputs, dt);
        if (this.state.mode === 'game') {
            this.game.update();
        }
        this.setState({
            model: this.model
        });

        this.lastTime = Date.now();
        window.requestAnimationFrame(this.mainLoop);
    }

    showCorrectDisplay() {
        switch (this.state.mode) {
            case 'simulation':
                return (
                    <div>
                        <MainDisplay
                            model={this.state.model}
                            boat={this.state.model.boat}
                            windMap={this.state.model.windMap}
                            showLabels={this.state.showLabels}
                            onToggleLabels={this.toggleLabels}
                            followBoat={this.state.followBoat}
                            onToggleFollow={this.toggleFollow}
                        />
                    </div>
                );
            case 'game':
                return (
                    <div>
                        <GameDisplay
                            model={this.state.model}
                            boat={this.state.model.boat}
                            windMap={this.state.model.windMap}
                            game={this.game}
                        />
                    </div>
                );
            default:
                return (
                    <div>
                        mode not set
                    </div>
                );
        }
    }

    render () {
        if (this.mobile) {
            return (
                <div className="mobile_root">
                    <MainDisplay
                        mobile={true}
                        showLabels={this.state.showLabels}
                        onToggleLabels={this.toggleLabels}
                        followBoat={this.state.followBoat}
                        onToggleFollow={this.toggleFollow}
                        width={this.state.viewport.width}
                        height={this.state.viewport.height}
                        inputManager={this.inputManager}
                        model={this.state.model}
                        boat={this.state.model.boat}
                        windMap={this.state.model.windMap}
                    />
                </div>
            );
        }
        return (
            <div style={{'display' : 'flex'}}>
                <div>
                    <TopDiagram   
                        model={this.state.model}
                        showLabels={this.state.showLabels}
                    />
                    <SternDiagram
                        model={this.state.model}
                        showLabels={this.state.showLabels}
                    />
                </div>
                {this.showCorrectDisplay()}
            </div>
        );
    }
}

export default Simulation;