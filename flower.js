// The amount of circles around each "center"
const nodes = 6;

// The distance between the circles
let rads = null;

// How many levels deep do we keep creating "circles around centers"
// If set to `null`, will automatically be set to fit within the screen
let maxLevel = null;

// The lower this number, the bigger the circles become when you move down with your mouse
const mouseYDivider = 2;

let moved = false;
let rings = [];
let grow = 3;

function setup() {

    colorMode(HSB);

    document.addEventListener('dblclick', function() {
        fullscreen(!fullscreen());
    });


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
        console.log('rads', rads);

    }

    if (!maxLevel) {
        maxLevel = Math.round(largestScreenDimention / rads);
        if (largestScreenDimention > 1000) maxLevel--;
        if (maxLevel > 7) maxLevel = 7;
    }

    const canvas = createCanvas(windowWidth, windowHeight);
    recreateRings();
    trip();
    flip();

}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    recreateRings();
}

function draw() {

    background(0, 0, 0, 0.08);

    for(let i = 0; i < rings.length; i++){
        rings[i].draw();
    }

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
    const addedCoords = []

    rings = []
    rings.push(new Circle(startx, starty, rads));

    function makeRings(x, y, level) {

        level = level | 0;

        for(let i = 0; i < nodes; i++) {

            let newX = x + rads / 2 * cos(2 * PI * i / nodes);
            let newY = y + rads / 2 * sin(2 * PI * i / nodes);

            let coords = newX + ',' + newY;

            if (addedCoords.indexOf(coords) == -1) {
                rings.push(new Circle(newX, newY, rads));
                addedCoords.push(coords)
            }

            if (level < maxLevel) {
                makeRings(newX, newY, level + 1)
            }

        }

    }

    makeRings(startx, starty)

}


class Circle {

    constructor(x, y, r) {
        this.x = x;
        this.y = y;
        this.r = r;
    }

    draw() {
        let color = 0;
        moved = true;
        color = map(mouseX, 0, width, 0, 255);
        stroke(color, 150, intensity);
        noFill();
        ellipse(this.x, this.y, mouseY / mouseYDivider, mouseY / mouseYDivider);
        moved = false;
    }

}

function flip() {
    grow = Math.random() < .5
    setTimeout(flip, 800)
}

function trip() {

    if (grow) {
        mouseY += 2
        mouseX += 30
    } else {
        mouseY -= 2
        if (mouseX > 0) {
            mouseX -= 60
        }
    }

    setTimeout(trip, 50)

}
