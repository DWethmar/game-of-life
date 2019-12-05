import 'babel-polyfill';
import * as PIXI from 'pixi.js'
import _ from 'lodash';

let gridSize = 50;
const maxGridSize = 250;

let cellSize = 10;
const maxCellSize = 15;

let FPS = 12;
const MaxFPS = 60;

let aliveCellPercentage = 25;

var urlParams = new URLSearchParams(window.location.search);

function getIntParam(name: string, defaultValue: number, maxValue: number) {
    if (urlParams.has(name) && urlParams.get(name) !== null) {
        const param = parseInt(urlParams.get(name) as string, 10);
        if(param !== NaN && param <= maxValue) {
            return param;
        }
    }
    return defaultValue;
}

gridSize            = getIntParam('gridSize', gridSize, maxGridSize);
cellSize            = getIntParam('cellSize', cellSize, maxCellSize);
FPS                 = getIntParam('FPS', FPS, MaxFPS);
aliveCellPercentage = getIntParam('start-percentage', aliveCellPercentage, gridSize * gridSize);

const container = document.getElementById('gof');
const app = new PIXI.Application({
    width: gridSize * cellSize,
    height: gridSize * cellSize,
});

let scene = new PIXI.Container();
app.stage.addChild(scene);
if (container) {
    container.appendChild(app.view);
}

function to1D(gridSize: number, x: number, y: number) {
    return x * gridSize + y;
}

function to2D(gridSize: number, i: number): [number, number] {
    return [
        i % gridSize,              // x
        Math.floor(i / gridSize)   // y
    ];
}

class Grid {
    gridSize: number;
    cells: Uint8ClampedArray;

    constructor(gridSize: number) {
        this.gridSize = gridSize;
        this.cells = new Uint8ClampedArray(gridSize * gridSize);
    }

    setCell(x: number, y: number): void {
        this.cells[to1D(this.gridSize, x, y)] = 0xf58a42;
    }

    hasCell(x: number, y: number): boolean {
        if (x <= 0 || x >= this.gridSize || y <= 0 || y >= this.gridSize) {
            return false;
        }
        return this.cells[to1D(this.gridSize, x, y)] !== 0;
    }

    clearCell(x: number, y: number) {
        this.cells[to1D(this.gridSize, x, y)] = 0x99C;
    }

    *iterateAliveCells(): IterableIterator<[number, number]> {
        let i = 0;
        while(i < (this.gridSize * this.gridSize)) {
            const [x, y] = to2D(this.gridSize, i);
            if (grid.hasCell(x, y)) {
                yield [x, y];
            }
            i++;
        }
    }

    numberOfCells() {
        return this.cells.length;
    }

    numberOfAliveCells() {
        return this.cells.filter(x => x != 0).length;
    }

    addRandomCells(amount: number) {
        if (amount >= 1) {
            for (let i = 0; i < amount; i++) {
                this.cells[i] = 1;
            }
            for (var i = this.cells.length - 1; i > 0; i--) {
                var j = Math.floor(Math.random() * (i + 1));
                var temp =  this.cells[i];
                this.cells[i] =  this.cells[j];
                this.cells[j] = temp;
            }
        }
    }

    /**
     * 1. Any live cell with fewer than two live neighbors dies, as if by underpopulation.
     * 2. Any live cell with two or three live neighbors lives on to the next generation.
     * 3. Any live cell with more than three live neighbors dies, as if by overpopulation.
     * 4. Any dead cell with exactly three live neighbors becomes a live cell, as if by reproduction.
     */
    tick() {
        const newCells = new Uint8ClampedArray(this.gridSize * this.gridSize);
        for (let x = 0; x < this.gridSize; x++) {
            for (let y = 0; y < this.gridSize; y++) {
                const neighbors = [
                    this.hasCell(x, y - 1),
                    this.hasCell(x + 1, y - 1),
                    this.hasCell(x + 1, y),
                    this.hasCell(x + 1, y + 1),
                    this.hasCell(x, y + 1),
                    this.hasCell(x - 1, y + 1),
                    this.hasCell(x - 1, y),
                    this.hasCell(x - 1, y - 1)
                ].reduce(
                    (aliveNeighbors, hasNeighbor): number => {
                        if (hasNeighbor) {
                            aliveNeighbors++;
                        }
                        return aliveNeighbors;
                    }, 0
                );
                if (this.hasCell(x, y) && (neighbors === 2 || neighbors === 3)) {
                    newCells[to1D(this.gridSize, x, y)] = 0x99C;
                } else {
                    if (neighbors === 3) {
                        newCells[to1D(this.gridSize, x, y)] = 0x99C;
                    }
                }
            }
        }
        this.cells = newCells;
    }
}

const grid = new Grid(gridSize);
const startWithCells = Math.floor((aliveCellPercentage / 100) * (gridSize * gridSize));
if (aliveCellPercentage > 0) {
    grid.addRandomCells(startWithCells);
}
const startedWithCells = document.getElementById('started-with')
if (startedWithCells) {
    startedWithCells.innerHTML = startWithCells.toString();
}

// Draw a grid.
for (var x = 0; x < gridSize; x++) {
    const line = new PIXI.Graphics();
    line.lineStyle(1, 0x888888, 1);
    line.moveTo(0, x * cellSize);
    line.lineTo(cellSize * gridSize, x * cellSize);
    app.stage.addChild(line);
};
for (var y = 0; y < gridSize; y++) {
    const line = new PIXI.Graphics();
    line.lineStyle(1, 0x888888, 1);
    line.moveTo(y * cellSize, 0);
    line.lineTo(y * cellSize, cellSize * gridSize);
    app.stage.addChild(line);
};

// Update FPS Counter
const FPSCounter = document.getElementById('fps-counter')
const updateFPSCounter = _.debounce((fps: number) => {
    if (FPSCounter) {
        FPSCounter.innerHTML = Math.floor(fps).toString();
    }
}, 100, { 'maxWait': 100 });

// Update Alive cells Counter
const AliveCellsCounter = document.getElementById('cells-alive')
const UpdateAliveCellsCounter = _.debounce((alive: number, total: number) => {
    if (AliveCellsCounter) {
        AliveCellsCounter.innerHTML = `${alive.toString()}/${total.toString()} - ${((alive/total) * 100).toFixed(2).toString()}%`;
    }
}, 100, { 'maxWait': 100 });

const startButton = document.getElementById('start') as HTMLButtonElement;
const pauseButton = document.getElementById('pause')as HTMLButtonElement;
const stepButton = document.getElementById('step') as HTMLButtonElement;

function step() {
    app.stage.removeChild(scene);
    scene = new PIXI.Container();
    grid.tick();
    const cell = new PIXI.Graphics();
    cell.beginFill(0xDAF7A6);
    for (const [x, y] of grid.iterateAliveCells()) {
        cell.drawRect(x * cellSize, y * cellSize, cellSize, cellSize);
    }
    cell.endFill()
    scene.addChild(cell);
    app.stage.addChild(scene);

    updateFPSCounter(app.ticker.FPS);
    UpdateAliveCellsCounter(grid.numberOfAliveCells(), grid.numberOfCells());
}

step();
setControls();

function setControls() {
    if (app.ticker.started) { 
        startButton.disabled = true;
        pauseButton.disabled = false;
        stepButton.disabled = true;
    } else {
        startButton.disabled = false;
        pauseButton.disabled = true;
        stepButton.disabled = false;
    }
}

// Controls
if (startButton) {
    startButton.onclick = () => {
        if (!app.ticker.started) {
            app.ticker.start();
        }
        setControls();
    };
}

if (pauseButton) {
    pauseButton.onclick = () => {
        if (app.ticker.started) {
            app.ticker.stop();
        }
        setControls();
    };
}

if (stepButton) {
    stepButton.onclick = () => {
        step();
        app.render();
    };
    setControls();
}

app.ticker.autoStart = false;
app.ticker.maxFPS = FPS;
app.ticker.add(step);
app.ticker.start();
