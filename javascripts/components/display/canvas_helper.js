import {
    vectorMag,
    getHeading,
    toRadians,
    toDegrees
} from '../util/vector_util';

export const arrowLabels = {
    appWind: 'apparent wind',
    sailLift: 'sail lift',
    dragOnSail: 'sail drag',
    sailForce: 'sail force',
    boardLift: 'board lift',
    boardDrag: 'board drag',
    boardForce: 'board force',
    hullDrag: 'hull drag',
    totalForce: 'total force'
};

// Floating text at the point (x, y) of the current (possibly rotated) frame,
// pushed out along (dirX, dirY). The text stays upright whatever the rotation.
export const drawArrowLabel = (ctx, x, y, dirX, dirY, text, size = 12) => {
    const m = ctx.getTransform();
    const scale = Math.hypot(m.a, m.b);
    const px = m.a * x + m.c * y + m.e;
    const py = m.b * x + m.d * y + m.f;
    //direction as it appears on screen
    const ux = (m.a * dirX + m.c * dirY) / scale;
    const uy = (m.b * dirX + m.d * dirY) / scale;

    ctx.save();
    ctx.setTransform(scale, 0, 0, scale, px, py);
    ctx.font = size + 'px sans-serif';
    ctx.textBaseline = 'middle';
    const align = ux > 0.35 ? 'left' : (ux < -0.35 ? 'right' : 'center');
    ctx.textAlign = align;
    const tx = ux * 6;
    const ty = uy * (6 + size * 0.6);

    //slide the text back on screen if it would run off the canvas
    const margin = 2 * scale;
    const textWidth = ctx.measureText(text).width * scale;
    const anchorX = px + tx * scale;
    const left = align === 'left' ? anchorX : (align === 'right' ? anchorX - textWidth : anchorX - textWidth / 2);
    let shiftX = 0;
    if (left < margin) shiftX = margin - left;
    else if (left + textWidth > ctx.canvas.width - margin) shiftX = ctx.canvas.width - margin - (left + textWidth);
    const halfHeight = (size / 2 + 2) * scale;
    const anchorY = py + ty * scale;
    let shiftY = 0;
    if (anchorY - halfHeight < margin) shiftY = margin - (anchorY - halfHeight);
    else if (anchorY + halfHeight > ctx.canvas.height - margin) shiftY = ctx.canvas.height - margin - (anchorY + halfHeight);
    ctx.setTransform(scale, 0, 0, scale, px + shiftX, py + shiftY);
    //dark outline so it reads on any water color
    ctx.lineWidth = 3;
    ctx.lineJoin = 'round';
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.strokeText(text, tx, ty);
    ctx.fillStyle = 'white';
    ctx.fillText(text, tx, ty);
    ctx.restore();
};

export const makeInArrow = (ctx, x, y, angle, offset, length, width, color, label, labelSize) => {
    let arrowLength = Math.pow(length, 0.6) + 5;
    ctx.beginPath();
    ctx.lineWidth = width;
    ctx.strokeStyle = color;
    ctx.moveTo(
        x - (offset * Math.sin(angle)),
        y + (offset * Math.cos(angle))
    );
    ctx.lineTo(
        x - ((offset + arrowLength) * Math.sin(angle)),
        y + ((offset + arrowLength) * Math.cos(angle))
    );
    ctx.stroke();
    ctx.lineWidth = 1;
    ctx.fillStyle = color;
    ctx.moveTo(
        x - ((offset - 2) * Math.sin(angle)),
        y + ((offset - 2) * Math.cos(angle))
    );
    ctx.lineTo(
        x - ((offset + 8) * Math.sin(angle + 0.15)),
        y + ((offset + 8) * Math.cos(angle + 0.15))
    );
    ctx.lineTo(
        x - ((offset + 8) * Math.sin(angle - 0.15)),
        y + ((offset + 8) * Math.cos(angle - 0.15))
    );
    ctx.closePath();
    ctx.stroke();
    ctx.fill();

    if (label) {
        const tail = offset + arrowLength;
        drawArrowLabel(
            ctx,
            x - (tail * Math.sin(angle)),
            y + (tail * Math.cos(angle)),
            -Math.sin(angle),
            Math.cos(angle),
            label,
            labelSize
        );
    }
};

export const makeOutArrow = (ctx, x, y, angle, offset, length, width, color, label, labelSize) => {
    let arrowLength = Math.pow(length, 0.6) + 5;
    ctx.beginPath();
    ctx.lineWidth = width;
    ctx.strokeStyle = color;
    ctx.moveTo(
        x + (offset * Math.sin(angle)),
        y - (offset * Math.cos(angle))
    );
    ctx.lineTo(
        x + ((offset + arrowLength) * Math.sin(angle)),
        y - ((offset + arrowLength) * Math.cos(angle))
    );
    ctx.stroke();
    ctx.lineWidth = 1;
    ctx.fillStyle = color;
    ctx.moveTo(
        x + ((offset + arrowLength + 2) * Math.sin(angle)),
        y - ((offset + arrowLength + 2) * Math.cos(angle))
    );
    ctx.lineTo(
        x + ((offset + arrowLength - 8) * Math.sin(angle + 0.15)),
        y - ((offset + arrowLength - 8) * Math.cos(angle + 0.15))
    );
    ctx.lineTo(
        x + ((offset + arrowLength - 8) * Math.sin(angle - 0.15)),
        y - ((offset + arrowLength - 8) * Math.cos(angle - 0.15))
    );
    ctx.closePath();
    ctx.stroke();
    ctx.fill();

    if (label) {
        const tip = offset + arrowLength + 2;
        drawArrowLabel(
            ctx,
            x + (tip * Math.sin(angle)),
            y - (tip * Math.cos(angle)),
            Math.sin(angle),
            -Math.cos(angle),
            label,
            labelSize
        );
    }
};

export const makeStreamRipple = (ctx, x, y, velocity, heading) => {
    let boatVel = velocity;
    let boatSpeed = vectorMag(boatVel);
    let boatVelHeading = getHeading(boatVel);
    let relBoatVelHeading = toRadians(toDegrees(boatVelHeading) - heading);
    let streamVector = [
        boatSpeed * Math.sin(relBoatVelHeading),
        boatSpeed * Math.cos(relBoatVelHeading)
    ];
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'lightblue';
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(
        x - streamVector[0],
        y + streamVector[1]
    );
    ctx.stroke();
};

// labels: null, or { size } to float a name beside each arrow
export const drawForceArrows = (ctx, x, y, arrows, model, boat, arrowColors = {}, labels = null) => {
    const label = (key) => (labels ? arrowLabels[key] : undefined);
    const labelSize = labels ? labels.size : undefined;

    //apparentWindArrow
    let appDir = boat.appWindDir;
    let appSpeed = boat.appWindSpeed;
    let appHeading = getHeading(appDir);
    let relAppHeading = toRadians(toDegrees(appHeading) - boat.heading);
    if (arrows.appWind) {
        makeInArrow(ctx, x, y, relAppHeading, 100, appSpeed, 6, (arrowColors.appWind ? arrowColors.appWind : 'lightblue'), label('appWind'), labelSize);
    }

    //windDragArrow
    //let appDir = boat.appWindDir;
    let dragAmt = vectorMag(model.dragOnSail);
    let relDragHeading = toRadians(toDegrees(getHeading(appDir)) - boat.heading);
    if (arrows.dragOnSail) {
        makeOutArrow(ctx, x, y, relDragHeading, 50, dragAmt, 6, (arrowColors.dragOnSail ? arrowColors.dragOnSail : 'lightblue'), label('dragOnSail'), labelSize);
    }

    //windLiftArrow
    let liftVec = model.liftOnSail;
    let liftAmt = vectorMag(liftVec);
    let liftHeading = getHeading(liftVec);
    let relLiftHeading = toRadians(toDegrees(liftHeading) - boat.heading);
    if (arrows.sailLift) {
        makeOutArrow(ctx, x, y, relLiftHeading, 50, liftAmt, 6, (arrowColors.sailLift ? arrowColors.sailLift : 'lightblue'), label('sailLift'), labelSize);
    }

    //windForceArrow
    let forceVec = model.forceOnSail;
    let forceAmt = vectorMag(forceVec);
    let forceHeading = getHeading(forceVec);
    let relForceHeading = toRadians(toDegrees(forceHeading) - boat.heading);
    if (arrows.sailForce) {
        makeOutArrow(ctx, x, y, relForceHeading, 50, forceAmt, 6, (arrowColors.sailForce ? arrowColors.sailForce : 'lightblue'), label('sailForce'), labelSize);
    }

    //boardDragArrow
    let boardDragVec = model.dragOnBoard;
    let boardDragAmt = vectorMag(boardDragVec);
    let boardDragHeading = getHeading(boardDragVec);
    let relBoardDragHeading = toRadians(toDegrees(boardDragHeading) - boat.heading);
    if (arrows.boardDrag) {
        makeOutArrow(ctx, x, y, relBoardDragHeading, 70, boardDragAmt, 6, (arrowColors.boardDrag ? arrowColors.boardDrag : 'lightblue'), label('boardDrag'), labelSize);
    }

    //boardLiftArrow
    let boardLiftVec = model.liftOnBoard;
    let boardLiftAmt = vectorMag(boardLiftVec);
    let boardLiftHeading = getHeading(boardLiftVec);
    let relBoardLiftHeading = toRadians(toDegrees(boardLiftHeading) - boat.heading);
    if (arrows.boardLift) {
        makeOutArrow(ctx, x, y, relBoardLiftHeading, 50, boardLiftAmt, 6, (arrowColors.boardLift ? arrowColors.boardLift : 'lightblue'), label('boardLift'), labelSize);
    }

    //boardForceArrow
    let boardForceVec = model.forceOnBoard;
    let boardForceAmt = vectorMag(boardForceVec);
    let boardForceHeading = getHeading(boardForceVec);
    let relBoardForceHeading = toRadians(toDegrees(boardForceHeading) - boat.heading);
    if (arrows.boardForce) {
        makeOutArrow(ctx, x, y, relBoardForceHeading, 50, boardForceAmt, 6, (arrowColors.boardForce ? arrowColors.boardForce : 'lightblue'), label('boardForce'), labelSize);
    }

    //hullDragArrow
    let hullDragVec = model.dragOnHull;
    let hullDragAmt = vectorMag(hullDragVec);
    let hullDragHeading = getHeading(hullDragVec);
    let relHullDragHeading = toRadians(toDegrees(hullDragHeading) - boat.heading);
    if (arrows.hullDrag) {
        makeOutArrow(ctx, x, y, relHullDragHeading, 70, hullDragAmt, 6, (arrowColors.hullDrag ? arrowColors.hullDrag : 'lightblue'), label('hullDrag'), labelSize);
    }

    //totalForceArrow
    let totalForceVec = model.totalForce;
    let totalForceAmt = vectorMag(totalForceVec);
    let totalForceHeading = getHeading(totalForceVec);
    let reltotalForceHeading = toRadians(toDegrees(totalForceHeading) - boat.heading);
    if (arrows.totalForce) {
        makeOutArrow(ctx, x, y, reltotalForceHeading, 50, totalForceAmt, 6, (arrowColors.totalForce ? arrowColors.totalForce : 'lightblue'), label('totalForce'), labelSize);
    }
};

