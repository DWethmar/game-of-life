import { Grid } from './grid';

const gridSize = 100;

test('Check grid size', () => {
    const grid = new Grid(gridSize, false);
    expect(grid.numberOfCells()).toBe(gridSize * gridSize);
});

test('Check alive cells', () => {
    const grid = new Grid(gridSize, false);
    grid.addRandomCells(gridSize / 2);
    expect(grid.numberOfCellsAlive()).toBe(gridSize / 2);
});

test('Set and check alive cell', () => {
    const grid = new Grid(gridSize, false);

    grid.setCell(10, 10);
    expect(grid.hasCell(10, 10)).toBe(true);

    expect(grid.hasCell(20, 20)).toBe(false);
    grid.setCell(20, 20);
    expect(grid.hasCell(20, 20)).toBe(true);

    expect(grid.hasCell(0, 0)).toBe(false);
    expect(grid.hasCell(-10, -10)).toBe(false);
});

// https://www.conwaylife.com/wiki/Blinker
test('Create blinker and check if it really blinks', () => {
    const grid = new Grid(gridSize, false);

    // Check top of blinker.
    expect(grid.hasCell(1, 0)).toBe(false);

    grid.setCell(0, 1);
    grid.setCell(1, 1);
    grid.setCell(2, 1);

    grid.step();
    expect(grid.hasCell(1, 0)).toBe(true);
    grid.step();
    expect(grid.hasCell(1, 0)).toBe(false);
});

