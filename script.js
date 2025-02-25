const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const sound = document.getElementById('sound');

class Domino {
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.angle = 0;
        this.isFalling = false;
        this.nextDomino = null;
        this.startTime = null;
    }

    draw() {
        ctx.fillStyle = 'black';
        ctx.save();
        ctx.translate(this.x + this.w/2, this.y);
        ctx.rotate(this.angle * Math.PI / 180);
        ctx.fillRect(-this.w/2, -this.h, this.w, this.h);
        ctx.restore();
    }

    startFalling() {
        this.isFalling = true;
        this.startTime = Date.now();
    }

    update() {
        if (this.isFalling) {
            let timePassed = Date.now() - this.startTime;
            let duration = 500; // milliseconds for the fall
            this.angle = (timePassed / duration) * 90;
            if (this.angle >= 90) {
                this.angle = 90;
                this.isFalling = false;
                sound.play();
                if (this.nextDomino) {
                    setTimeout(() => {
                        this.nextDomino.startFalling();
                    }, 100);
                }
            }
        }
    }
}

function createDominos(n, x, y, w, h, scale) {
    let dominos = [];
    let currentX = x;
    for (let i = 0; i < n; i++) {
        let domino = new Domino(currentX, y, w, h);
        dominos.push(domino);
        let nextW = w * scale;
        let nextH = h * scale;
        let nextX = currentX + w/2 + h - nextW/2;
        currentX = nextX;
        w = nextW;
        h = nextH;
    }
    for (let i = 0; i < dominos.length - 1; i++) {
        dominos[i].nextDomino = dominos[i+1];
    }
    return dominos;
}

let dominos = createDominos(5, 50, 500, 20, 40, 1.2);
let chainStarted = false;

function handleTouchStart(event) {
    if (chainStarted) return;
    let touch = event.touches[0];
    let rect = canvas.getBoundingClientRect();
    let x = touch.pageX - rect.left;
    let y = touch.pageY - rect.top;
    let firstDomino = dominos[0];
    if (x >= firstDomino.x && x <= firstDomino.x + firstDomino.w && y >= firstDomino.y - firstDomino.h && y <= firstDomino.y) {
        firstDomino.startFalling();
        chainStarted = true;
    }
}

canvas.addEventListener('touchstart', handleTouchStart, false);

function animate() {
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    dominos.forEach(d => d.draw());
    dominos.forEach(d => d.update());
    requestAnimationFrame(animate);
}

animate();
