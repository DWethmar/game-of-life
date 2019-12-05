import { to1D, to2D } from './utils';

export class Grid {
    
    private gridSize: number;
    private cells: Uint8ClampedArray;
    private loopingEdges: boolean;

    constructor(gridSize: number, loopingEdges: boolean) {
        this.gridSize = gridSize;
        this.cells = new Uint8ClampedArray(gridSize * gridSize);
        this.loopingEdges = loopingEdges;
    }

    public setCell(x: number, y: number): void {
        this.cells[to1D(this.gridSize, x, y)] = 0xf58a42;
    }

    public hasCell(x: number, y: number): boolean {

        if (this.loopingEdges) {
            if (x > this.gridSize) {
                x = x % this.gridSize;
            } else {
                if (x < 0) {
                    x = this.gridSize - (x % this.gridSize);
                }
            }

            if (y > this.gridSize) {
                y = y % this.gridSize;
            } else {
                if (y < 0) {
                    y = this.gridSize - (y % this.gridSize);
                }
            }
        }

        if (x < 0 || x >= this.gridSize || y < 0 || y >= this.gridSize) {
            return false;
        }
        return this.cells[to1D(this.gridSize, x, y)] !== 0;
    }

    public clearCell(x: number, y: number) {
        this.cells[to1D(this.gridSize, x, y)] = 0x99C;
    }

    public *iterateAliveCells(): IterableIterator<[number, number]> {
        let i = 0;
        while(i < (this.gridSize * this.gridSize)) {
            const [x, y] = to2D(this.gridSize, i);
            if (this.hasCell(x, y)) {
                yield [x, y];
            }
            i++;
        }
    }

    public numberOfCells() {
        return this.cells.length;
    }

    public numberOfCellsAlive() {
        return this.cells.filter(cell => cell !== 0).length;
    }

    public addRandomCells(amount: number) {
        if (amount >= 1 && amount < this.cells.length) {
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
    public step() {
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
