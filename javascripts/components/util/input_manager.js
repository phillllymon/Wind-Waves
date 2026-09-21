class InputManager {
    constructor() {
        this.inputs = {
            right: false, 
            left: false
        };
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        this.test = this.test.bind(this);
    }

    test() {
        console.log('here');
    }

    // used by the on-screen buttons on touch devices
    setInput(name, value) {
        this.inputs[name] = value;
    }

    startListening() {
        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);
    }

    stopListening() {
        window.removeEventListener('keydown', this.handleKeyDown);
        window.removeEventListener('keyup', this.handleKeyUp);
    }

    handleKeyDown(e) {
        if (e.keyCode === 65){
            this.inputs.left = true;
        }
        if (e.keyCode === 68){
            this.inputs.right = true;
        }
        if (e.keyCode === 83) {
            this.inputs.down = true;
        }
        if (e.keyCode === 87) {
            this.inputs.up = true;
        }
    }

    handleKeyUp(e) {
        if (e.keyCode === 65){
            this.inputs.left = false;
        }
        if (e.keyCode === 68){
            this.inputs.right = false;
        }
        if (e.keyCode === 83) {
            this.inputs.down = false;
        }
        if (e.keyCode === 87) {
            this.inputs.up = false;
        }
    }

    // handleKeyDown(e) {
    //     switch(e.keyCode) {
    //         case 65:
    //             this.inputs.left = true;
    //         case 68:
    //             this.inputs.right = true;
    //         default:
    //             break;
    //     }
    // }

    // handleKeyUp(e) {
    //     switch (e.keyCode) {
    //         case 65:
    //             this.inputs.left = false;
    //         case 68:
    //             this.inputs.right = false;
    //         default:
    //             break;
    //     }
    // }

}

export default InputManager;