export const vectorMag = (vector) => {
    let dx = vector[0];
    let dy = vector[1];
    return Math.sqrt((dx*dx) + (dy*dy));
};

export const getUnitVector = (vector) => {
    let mag = vectorMag(vector);
    return [vector[0] / mag, vector[1] / mag];
};

export const getHeading = (vector) => {
    let x = vector[0];
    let y = vector[1];
    let posX = Math.abs(x);
    let posY = Math.abs(y);
    let angle = Math.atan(posY / posX);
    if (x > 0 && y > 0) angle += Math.PI / 2;
    if (x < 0 && y < 0) angle += 3 * Math.PI / 2;
    if (y < 0 && x > 0) angle = Math.PI / 2 - angle;
    if (x < 0 && y > 0) angle = 3 * Math.PI / 2 - angle;  
    
    return angle;
};

export const getHeadingDeg = (vector) => {
    return toDegrees(getHeading(vector));
};

export const toDegrees = (radAngle) => {
    return radAngle * 180 / Math.PI;
};

export const toRadians = (degAngle) => {
    return degAngle * Math.PI / 180;
};