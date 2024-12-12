let grid;
let shown = false;
const board = document.getElementById('board');
const directions = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1],         [0, 1],
    [1, -1], [1, 0], [1, 1]
];
document.addEventListener("DOMContentLoaded", () => {
    const rows = 8, cols = 8, bombs = 10;
    grid = CreateGrid(rows, cols, bombs);
});
document.querySelector('#start').addEventListener('click', () => RenderGrid(grid))
document.querySelector('#stop').addEventListener('click',() => ShowGrid(grid))
document.querySelector('#reset').addEventListener('click', () => location.reload() )


var rows = 8, cols = 8, bombs = 10;

function CreateGrid(rows, cols, bombs) {
    let grid = Array.from({ length: rows }, () => Array(cols).fill(null));
    let placedBombs = 0;
    while (placedBombs < bombs) {
        let row = Math.floor(Math.random() * rows);
        let col = Math.floor(Math.random() * cols);
        if (grid[row][col] === null) {
            grid[row][col] = new CasellaBomba(row, col);
            placedBombs++;
        }
    }

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (grid[r][c] instanceof CasellaBomba) continue;
            const numero = countAdjacentBombs(grid, r, c);
            grid[r][c] = new CasellaNumero(r, c, numero);
        }
    }

    return grid;
}

function RenderGrid(grid) {
    if (shown) return;
    board.innerHTML = '';
    grid.forEach((row, rIdx) => {
        row.forEach((cell, cIdx) => {
            const cellButton = document.createElement('button');
            cellButton.classList.add('cell');
            cellButton.dataset.row = rIdx;
            cellButton.dataset.col = cIdx;

            board.appendChild(cellButton);
        });
    });
    document.querySelectorAll('.cell').forEach(cell => {
        cell.addEventListener('contextmenu', (e) => handleContextMenu(e));
        cell.addEventListener('click', (e) => handleClick(e));
    });
}

function ShowGrid(grid) {
    if (!shown) shown = true;
    board.innerHTML = '';
    grid.forEach((row, rIdx) => {
        row.forEach((cell, cIdx) => {
            const cellButton = document.createElement('button');
            cellButton.classList.add('cell');
            cellButton.dataset.row = rIdx;
            cellButton.dataset.col = cIdx;
            if (cell instanceof CasellaBomba) {
                cellButton.innerHTML = '💣';
            }
            board.appendChild(cellButton);
        });
    });
    document.querySelectorAll('.cell').forEach(cell => {
        cell.addEventListener('contextmenu', (e) => handleContextMenu(e));
    });
}

function countAdjacentBombs(grid, row, col) {
    let count = 0;
    for (let [dx, dy] of directions) {
        const newRow = row + dx;
        const newCol = col + dy;
        if (newRow >= 0 && newRow < grid.length && newCol >= 0 && newCol < grid[0].length) {
            if (grid[newRow][newCol] instanceof CasellaBomba) {
                count++;
            }
        }
    }
    return count;
}

function revealAdjacentZeros(grid, row, col) {
    const stack = [[row, col]];
    const visited = new Set();

    while (stack.length > 0) {
        const [r, c] = stack.pop();
        const key = `${r},${c}`;
        if (visited.has(key)) continue;
        visited.add(key);

        const cell = grid[r][c];
        if (cell instanceof CasellaNumero && !cell.isRevealed()) {
            cell.revealNumber(document.querySelector(`.cell[data-row="${r}"][data-col="${c}"]`));
            if (cell.getNumero() === 0) {
                for (let [dx, dy] of directions) {
                    const newRow = r + dx;
                    const newCol = c + dy;
                    if (newRow >= 0 && newRow < grid.length && newCol >= 0 && newCol < grid[0].length) {
                        stack.push([newRow, newCol]);
                    }
                }
            }
        }
    }
}

function handleClick(e) {
    const row = parseInt(e.target.dataset.row);
    const col = parseInt(e.target.dataset.col);
    const cell = grid[row][col];
    if (cell instanceof CasellaNumero) {
        if (cell.getNumero() === 0) {
            revealAdjacentZeros(grid, row, col);
        } else {
            cell.revealNumber(e.target);
        }
    } else if (cell instanceof CasellaBomba) {
        shown = true;
        cell.revealBomb();
    }
}

function handleContextMenu(e) {
    console.log('context menu');
    e.preventDefault();
    const row = parseInt(e.target.dataset.row);
    const col = parseInt(e.target.dataset.col);
    const cell = grid[row][col];
    if (cell.isRevealed()) return;
    cell.setFlag(!cell.getFlag());
        e.target.innerHTML = cell.getFlag() ? '🚩' : '';
}

class Casella {
    constructor(x, y) {
        this._x = x;
        this._y = y;
        this._flag = false;
        this._revealed = false;
    }

    get x() {
        return this._x;
    }

    get y() {
        return this._y;
    }

    getFlag() {
        return this._flag;
    }

    setFlag(value) {
        this._flag = value;
    }

    isRevealed() {
        return this._revealed;
    }

    reveal() {
        this._revealed = true;
    }
}

class CasellaNumero extends Casella {
    constructor(x, y, numero) {
        super(x, y);
        this.numero = numero;
    }

    getNumero() {
        return this.numero;
    }

    revealNumber(cellButton) {
        if (this._flag) return;
        this.reveal();
        cellButton.innerHTML = this.getNumero() === 0 ? '' : this.getNumero();
    }
}

class CasellaBomba extends Casella {
    constructor(x, y) {
        super(x, y);
    }

    revealBomb() {
        if (this._flag)
            return;
        ShowGrid(grid);
    }
}