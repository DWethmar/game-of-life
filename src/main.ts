import 'babel-polyfill';
import * as PIXI from 'pixi.js'
import _ from 'lodash';
import { Grid } from './grid';
import { getIntParam, getBooleanParam } from './utils';

let gridSize                = 50;
const maxGridSize           = 250;
let cellSize                = 10;
const maxCellSize           = 15;
let FPS                     = 12;
const MaxFPS                = 60;
let aliveCellPercentage     = 25;
const loopingEdges          = getBooleanParam('looping-edges', false);

const cellColor             = 0xFFFF00;
const cellBackgroundColor   = 0xFFA500;
const backgroundColor       = 0x000000;
const gridColor             = 0x808080;

gridSize            = getIntParam('gridSize', gridSize, maxGridSize);
cellSize            = getIntParam('cellSize', cellSize, maxCellSize);
FPS                 = getIntParam('FPS', FPS, MaxFPS);
aliveCellPercentage = getIntParam('start-percentage', aliveCellPercentage, gridSize * gridSize);

const container = document.getElementById('gof');

// Setup PIXI.js
const app = new PIXI.Application({
    width: gridSize * cellSize,
    height: gridSize * cellSize,
    backgroundColor: backgroundColor
});
let scene = new PIXI.Container();
app.stage.addChild(scene);
if (container) {
    container.appendChild(app.view);
}

const grid = new Grid(gridSize, loopingEdges);
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
    line.lineStyle(1, gridColor, 1);
    line.moveTo(0, x * cellSize);
    line.lineTo(cellSize * gridSize, x * cellSize);
    app.stage.addChild(line);
};
for (var y = 0; y < gridSize; y++) {
    const line = new PIXI.Graphics();
    line.lineStyle(1, gridColor, 1);
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
    grid.step();
    const cell = new PIXI.Graphics();
    cell.beginFill(cellColor);
    for (const [x, y] of grid.iterateAliveCells()) {
        cell.beginFill(cellBackgroundColor);
        cell.drawRect(2 + x * cellSize, 2 + y * cellSize, cellSize, cellSize);

        cell.beginFill(cellColor);
        cell.drawRect(x * cellSize, y * cellSize, cellSize, cellSize);
    }
    cell.endFill()
    scene.addChild(cell);
    app.stage.addChild(scene);

    updateFPSCounter(app.ticker.FPS);
    UpdateAliveCellsCounter(grid.numberOfCellsAlive(), grid.numberOfCells());
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
