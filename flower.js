// The amount of circles around each "center"
// For the flower of life this is 6, but other values can give interesting shapes too
const nodes = 6;

// The distance between the circles
// If set to `null`, will be automatically determined based on screen size
let rads = null;

// How many levels deep do we keep creating "circles around centers"
// If set to `null`, will be automatically determined based on screen size
let maxLevel = null;

// The lower this number, the bigger the circles become when you move down with your mouse
const mouseYDivider = 2;

let rings = [];
let grow = 3;
let colorShiftDirection = 1;
let lastPointerMove = 0;
let lastStep = 0;
let lastDraw = 0;

function setup() {

    colorMode(HSB);

    document.addEventListener('dblclick', function() {
        fullscreen(!fullscreen());
    });

    const pointerMoved = function() {
        lastPointerMove = millis();
    };

    document.addEventListener('mousemove', pointerMoved);
    document.addEventListener('touchmove', pointerMoved);


    let largestScreenDimention;

    if (windowWidth > windowHeight) {
        largestScreenDimention = windowWidth;
    } else {
        largestScreenDimention = windowHeight;
    }

    if (!rads) {

        let dividingFactor;

        if (largestScreenDimention > 1000) {
            dividingFactor = 5;
        } else {
            dividingFactor = 3;
        }

        rads = Math.round(largestScreenDimention / dividingFactor);

    }

    if (!maxLevel) {
        maxLevel = Math.round(largestScreenDimention / rads) - 1;
        if (maxLevel > 7) maxLevel = 7;
    }

    const canvas = createCanvas(windowWidth, windowHeight);

    // 1px lines, plus half a physical pixel to give them a bit more body
    strokeWeight(1 + 0.5 / pixelDensity());

    recreateRings();
    flipGrowDirection();
    colorShiftFlipper();

}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    recreateRings();
}

function draw() {

    const now = millis();

    // The automatic movement only changes the picture every 50ms, so 20 frames
    // per second is enough. While the mouse (or a finger) moves, draw at full
    // speed so its trails stay smooth.
    frameRate(now - lastPointerMove < 1000 ? 60 : 20);

    // A step every 50ms, with some slack because frames never arrive exactly on time
    if (now - lastStep >= 45) {
        moveMouseAutomatically();
        lastStep = now;
    }

    // Fade out what was drawn before by 8% for every 60th of a second that
    // passed, so the trails fade at the same speed at any frame rate
    const fades = constrain(Math.round((now - lastDraw) / (1000 / 60)), 1, 3);
    lastDraw = now;

    for (let i = 0; i < fades; i++) {
        background(0, 0, 0, 0.08);
    }

    // All circles have the same color and size, so they're drawn as one path
    const radius = Math.abs(mouseY / mouseYDivider) / 2;

    stroke(map(mouseX, 0, width, 0, 255), 150, intensity);
    drawingContext.beginPath();

    for (let i = 0; i < rings.length; i++) {
        rings[i].addToPath(radius);
    }

    drawingContext.stroke();

}


let intensity = 128

function mouseWheel(event) {

    rads -= event.delta

    if (rads < 0) {
        rads = 0
    } else if (rads > 500) {
        rads = 500
    }

    recreateRings()

}


function recreateRings() {

    const startx = width / 2;
    const starty = height / 2;

    // Different paths lead to the same spot with slightly different floating
    // point coordinates, so spots are compared by their rounded coordinates
    const addedCoords = new Set();

    rings = [];

    function addRing(x, y) {

        const coords = Math.round(x * 100) + ',' + Math.round(y * 100);

        if (addedCoords.has(coords)) {
            return false;
        }

        addedCoords.add(coords);
        rings.push(new Circle(x, y, rads));

        return true;

    }

    addRing(startx, starty);

    // Work outwards level by level, only continuing from circles that weren't
    // there yet
    let centers = [[startx, starty]];

    for (let level = 0; level <= maxLevel; level++) {

        const newCenters = [];

        for (const [x, y] of centers) {
            for (let i = 0; i < nodes; i++) {

                const newX = x + rads / 2 * cos(2 * PI * i / nodes);
                const newY = y + rads / 2 * sin(2 * PI * i / nodes);

                if (addRing(newX, newY)) {
                    newCenters.push([newX, newY]);
                }

            }
        }

        centers = newCenters;

    }

}


class Circle {

    constructor(x, y, r) {
        this.x = x;
        this.y = y;
        this.r = r;
    }

    addToPath(radius) {
        drawingContext.moveTo(this.x + radius, this.y);
        drawingContext.arc(this.x, this.y, radius, 0, TWO_PI);
    }

}

function flipGrowDirection() {
    grow = Math.random() < .5;
    setTimeout(flipGrowDirection, random(400, 1200));
}

function colorShiftFlipper() {
    colorShiftDirection = random([-1, 1]);
    setTimeout(colorShiftFlipper, random(400, 1200));
}

function moveMouseAutomatically() {

    if (grow) {
        mouseY += 2
    } else {
        mouseY -= 2
    }

    mouseX += colorShiftDirection * width / 64;

    if (mouseX < 0 || mouseX > width) {

        if (mouseX < 0) {
            mouseX = 0;
        } else if (mouseX > width) {
            mouseX = width;
        }

        colorShiftDirection = !colorShiftDirection;

    }

    if (mouseY < 0) {
        mouseY = 0;
    } else if (mouseY > height) {
        mouseY = height;
    }

}
