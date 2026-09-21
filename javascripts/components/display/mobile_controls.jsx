import React, { useState } from 'react';
import ArrowButton from './arrow_button';
import TopDiagram from './top_diagram';
import SternDiagram from './stern_diagram';

const BAR_HEIGHT = 60;        //room for the top button bar above the views
const HANDLE_HEIGHT = 28;     //the drag strip along the drawer's bottom edge
const MIN_VIEWS_HEIGHT = 120;

// Held-down button: the input stays on for as long as the finger is on it.
// Pointer capture keeps it pressed if the finger slides off, and each button
// tracks its own pointer so steering and sail trim work at the same time.
const HoldButton = ({ icon, label, onChange }) => {
    const [pressed, setPressed] = useState(false);

    const set = (value) => {
        setPressed(value);
        onChange(value);
    };

    const press = (e) => {
        e.preventDefault();
        try {
            e.currentTarget.setPointerCapture(e.pointerId);
        } catch (err) {
            //pointer already gone, nothing to capture
        }
        set(true);
    };

    return (
        <button
            className={'hold_button' + (pressed ? ' pressed' : '')}
            onPointerDown={press}
            onPointerUp={() => set(false)}
            onPointerCancel={() => set(false)}
            onLostPointerCapture={() => set(false)}
            onContextMenu={(e) => e.preventDefault()}
        >
            <span className="hold_icon">{icon}</span>
            <span className="hold_label">{label}</span>
        </button>
    );
};

// one switch for every view: names floating beside each arrow
const LabelToggle = ({ active, onToggle }) => {
    return (
        <div className="arrowRowLarge">
            <div
                className={'arrowButton arrowButtonLarge labelToggle' + (active ? ' active' : '')}
                onClick={onToggle}
            >
                {active ? '\u2713 ' : ''}Label forces
            </div>
        </div>
    );
};

class MobileControls extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            panelOpen: false,
            viewsOpen: false,
            topForcesOpen: false,
            viewsHeight: this.defaultViewsHeight()
        };
        this.resizing = null;
        this.togglePanel = this.togglePanel.bind(this);
        this.toggleViews = this.toggleViews.bind(this);
        this.toggleTopForces = this.toggleTopForces.bind(this);
        this.startResize = this.startResize.bind(this);
        this.moveResize = this.moveResize.bind(this);
        this.endResize = this.endResize.bind(this);
    }

    // the forces panel and the views drawer share the screen, so one closes the other
    togglePanel() {
        this.setState({ panelOpen: !this.state.panelOpen, viewsOpen: false });
    }

    toggleViews() {
        this.setState({ viewsOpen: !this.state.viewsOpen, panelOpen: false, topForcesOpen: false });
    }

    toggleTopForces() {
        this.setState({ topForcesOpen: !this.state.topForcesOpen });
    }

    maxViewsHeight() {
        return Math.max(MIN_VIEWS_HEIGHT, this.props.viewportHeight - BAR_HEIGHT - HANDLE_HEIGHT - 8);
    }

    // just tall enough for both diagrams side by side at the biggest size that fits the width
    defaultViewsHeight() {
        const scale = this.viewsScale(Infinity);
        const wanted = Math.round(400 * scale + 16);
        return Math.min(Math.max(wanted, MIN_VIEWS_HEIGHT), this.maxViewsHeight());
    }

    // both diagrams share one scale: 300px wide each, 300px and 400px tall
    viewsScale(height) {
        const byHeight = (height - 16) / 400;
        const byWidth = (this.props.viewportWidth - 48) / 600;
        return Math.max(0.2, Math.min(1, byHeight, byWidth));
    }

    startResize(e) {
        e.preventDefault();
        try {
            e.currentTarget.setPointerCapture(e.pointerId);
        } catch (err) {
            //pointer already gone
        }
        this.resizing = { startY: e.clientY, startHeight: this.currentViewsHeight() };
    }

    moveResize(e) {
        if (!this.resizing) return;
        const height = this.resizing.startHeight + (e.clientY - this.resizing.startY);
        this.setState({
            viewsHeight: Math.min(Math.max(height, MIN_VIEWS_HEIGHT), this.maxViewsHeight())
        });
    }

    endResize() {
        this.resizing = null;
    }

    // the screen can shrink (rotation) after the drawer was sized
    currentViewsHeight() {
        return Math.min(this.state.viewsHeight, this.maxViewsHeight());
    }

    topForcesPopover() {
        const diagram = this.topDiagram;
        if (!this.state.topForcesOpen || !diagram) return null;
        return (
            <div className="mobile_popover">
                <LabelToggle active={this.props.showLabels} onToggle={this.props.onToggleLabels} />
                {
                    Object.keys(diagram.arrows).map((key) => {
                        return (
                            <ArrowButton
                                key={key}
                                large={true}
                                arrow={key}
                                active={diagram.arrows[key]}
                                color={diagram.arrowColors[key]}
                                setArrowColor={diagram.setArrowColor}
                                toggleArrow={diagram.toggleArrow}
                            />
                        );
                    })
                }
            </div>
        );
    }

    viewsDrawer() {
        const height = this.currentViewsHeight();
        const scale = this.viewsScale(height);
        const hidden = !this.state.viewsOpen;
        return (
            <div className={'mobile_views' + (hidden ? '' : ' open')}>
                <div className="mobile_views_body" style={{ height: height + 'px' }}>
                    <div className="mobile_views_column">
                        <TopDiagram
                            ref={(diagram) => { this.topDiagram = diagram; }}
                            mobile={true}
                            hidden={hidden}
                            scale={scale}
                            model={this.props.model}
                            showLabels={this.props.showLabels}
                        />
                        <button
                            className={'mobile_bar_button mobile_views_forces' + (this.state.topForcesOpen ? ' active' : '')}
                            onClick={this.toggleTopForces}
                        >
                            Top-view forces
                        </button>
                    </div>
                    <SternDiagram
                        mobile={true}
                        hidden={hidden}
                        scale={scale}
                        model={this.props.model}
                        showLabels={this.props.showLabels}
                    />
                    {this.topForcesPopover()}
                </div>
                <div
                    className="mobile_views_handle"
                    onPointerDown={this.startResize}
                    onPointerMove={this.moveResize}
                    onPointerUp={this.endResize}
                    onPointerCancel={this.endResize}
                >
                    <span className="mobile_views_grip" />
                </div>
            </div>
        );
    }

    render() {
        const { inputManager, arrows, arrowColors } = this.props;
        const setInput = (name) => (value) => inputManager.setInput(name, value);

        return (
            <div className="mobile_controls">
                {this.viewsDrawer()}

                <div className="mobile_top_bar">
                    <button
                        className={'mobile_bar_button' + (this.state.viewsOpen ? ' active' : '')}
                        onClick={this.toggleViews}
                    >
                        Views
                    </button>
                    <button
                        className={'mobile_bar_button' + (this.state.panelOpen ? ' active' : '')}
                        onClick={this.togglePanel}
                    >
                        Forces
                    </button>
                    <button
                        className={'mobile_bar_button' + (this.props.followBoat ? ' active' : '')}
                        onClick={this.props.onToggleFollow}
                    >
                        Follow
                    </button>
                    <button className="mobile_bar_button" onClick={this.props.centerBoat}>
                        Center
                    </button>
                </div>
                <button className="mobile_bar_button mobile_help" onClick={this.props.showIntro}>
                    ?
                </button>

                {this.state.panelOpen &&
                    <div className="mobile_panel">
                        <LabelToggle active={this.props.showLabels} onToggle={this.props.onToggleLabels} />
                        {
                            Object.keys(arrows).map((key) => {
                                return (
                                    <ArrowButton
                                        key={key}
                                        large={true}
                                        arrow={key}
                                        active={arrows[key]}
                                        color={arrowColors[key]}
                                        setArrowColor={this.props.setArrowColor}
                                        toggleArrow={this.props.toggleArrow}
                                    />
                                );
                            })
                        }
                    </div>
                }

                <div className="mobile_drive mobile_drive_left">
                    <HoldButton icon={'\u25C0'} label="Steer port" onChange={setInput('left')} />
                    <HoldButton icon={'\u25B6'} label="Steer starboard" onChange={setInput('right')} />
                </div>
                <div className="mobile_drive mobile_drive_right">
                    <HoldButton icon={'\u25B2'} label="Let out" onChange={setInput('up')} />
                    <HoldButton icon={'\u25BC'} label="Pull in" onChange={setInput('down')} />
                </div>
            </div>
        );
    }
}

export default MobileControls;
