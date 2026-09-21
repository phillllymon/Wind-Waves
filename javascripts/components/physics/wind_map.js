import {
    vectorMag,
    getUnitVector
} from '../util/vector_util';
import {
    windConfig
} from './wind_config';

class WindMap {
    constructor(width, height) {
        this.windSpeed = 60;
        this.windHeading = 0;
        this.width = width;
        this.height = height;
        this.waves = this.generateWaves();
    }

    resize(width, height) {
        this.width = width;
        this.height = height;
        this.waves = this.generateWaves();
    }

    generateWaves() {
        // let numCols = this.width/15;
        // let numRows = this.height/15;
        // let waves = [];
        // for (let i = 0; i < numRows; i++) {
        //     let row = [];
        //     for (let j = 0; j < numCols; j++) {
        //         let xCoord = 15 * j + ((Math.random() - 0.5) * 10);
        //         let yCoord = 15 * i + ((Math.random() - 0.5) * 10);
        //         row.push([xCoord, yCoord]);
        //     }
        //     waves.push(row);
        // }
        // return waves;
        let waves = [[]];
        for (let i = 0; i < windConfig.numWaves; i++) {
            let xCoord = this.width * Math.random();
            let yCoord = this.height * Math.random();
            let newWave = {};
            newWave.pos = [xCoord, yCoord];
            newWave.timeToNextStage = windConfig.timeWaveStage * Math.random();
            newWave.stage = Math.floor(windConfig.numWaveStages * Math.random());
            waves[0].push(newWave);
        }
        return waves;
    }

    updateWaves(dt) {
        this.waves.forEach( (row) => {
            row.forEach( (wave) => {
                wave.pos[1] += this.windSpeed * dt;
                wave.timeToNextStage -= dt;
                if (wave.timeToNextStage < 0){
                    wave.stage += 1;
                    if (wave.stage >= windConfig.numWaveStages) {
                        let xCoord = this.width * Math.random();
                        let yCoord = this.height * Math.random();
                        wave.pos = [xCoord, yCoord];
                        wave.timeToNextStage = windConfig.timeWaveStage;
                        wave.stage = 0;
                    }
                    wave.timeToNextStage = windConfig.timeWaveStage;
                }
            });
        });
    }

    getWindDir() {
        let radHeading = (this.windHeading + 180) * Math.PI / 180;
        return [Math.sin(radHeading), -Math.cos(radHeading)];
    }

    getWindVector() {
        let windDir = this.getWindDir();
        return [windDir[0] * this.windSpeed, windDir[1] * this.windSpeed];
    }
}

export default WindMap;