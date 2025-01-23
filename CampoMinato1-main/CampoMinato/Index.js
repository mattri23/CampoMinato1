let grid;
let shown = false;
let first = true;
let started = false;
let rows, cols, bombs;
const board = document.getElementById('board');
const directions = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1],         [0, 1],
    [1, -1], [1, 0], [1, 1]
];
document.addEventListener("DOMContentLoaded", () => {
    setDifficulty()
    grid = CreateGrid(rows, cols, bombs);
});
document.querySelector('#start').addEventListener('click', () => {
    setDifficulty();
    grid = CreateGrid(rows, cols, bombs); // ricrea la griglia con le giuste dimensioni
    RenderGrid(grid);
});

document.querySelector('#stop').addEventListener('click', () => {
    stopTimer();
    ShowGrid(grid);
});
document.querySelector('#reset').addEventListener('click', () => location.reload() );


//per la scelta della difficoltà
function setDifficulty() {
    if (started) return;
    let difficulty = document.getElementById('difficulty').value;
    switch(difficulty) {
        case 'easy':
            rows = 8;
            cols = 8;
            bombs = 10;
            break;
        case 'medium':
            rows = 16;
            cols = 16;
            bombs = 40;
            break;
        case 'hard':
            rows = 16;
            cols = 30;
            bombs = 99;
            break;
    }
    document.documentElement.style.setProperty('--grid-cols', cols);
}

function changeDifficulty() {
    if (started) return;
    const difficulty = document.getElementById('difficulty').value;
    let board = document.getElementById('board');
    board.classList.remove('easy', 'medium', 'hard'); // Rimuove tutte le classi di difficoltà
    switch (difficulty) {
        case 'easy':
            board.classList.add('easy');
            cols = 8;
            break;
        case 'medium':
            board.classList.add('medium');
            cols = 16;
            break;
        case 'hard':
            board.classList.add('hard');
            cols = 30;
            break;
    }
    document.documentElement.style.setProperty('--grid-cols', cols);
    grid = CreateGrid(rows, cols, bombs);
}

document.getElementById('difficulty').addEventListener('change', changeDifficulty);

//timer

let timerInterval;
let timeElapsed = 0;

function startTimer() {
    timeElapsed = 0;
    document.getElementById('timer').textContent = `Time: ${timeElapsed}s`;
    timerInterval = setInterval(() => {
        timeElapsed++;
        document.getElementById('timer').textContent = `Time: ${timeElapsed}s`;
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
}

//pe generare la griglia

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


//per stampare la griglia

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

//per mostrare la griglia alla sconfitta con solamente le bombe

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
    stopTimer();
    document.querySelector('#result').innerHTML = 'You Lose!';
}

//per contare le bombe adiacenti

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

//per mostrare le caselle adiacenti a 0

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

//per gestire il click sulle caselle

function handleClick(e) {
    const row = parseInt(e.target.dataset.row);
    const col = parseInt(e.target.dataset.col);
    let cell = grid[row][col];

    if (first) {
        startTimer();
        first = false;
        while (cell instanceof CasellaBomba || cell.getNumero() !== 0) {
            grid = CreateGrid(rows, cols, bombs);
            cell = grid[row][col];
        }
        RenderGrid(grid);
    }

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
    checkWin() ? stopTimer() : null;
}

//per mettere le bandiere

function handleContextMenu(e) {
    e.preventDefault();
    const row = parseInt(e.target.dataset.row);
    const col = parseInt(e.target.dataset.col);
    const cell = grid[row][col];
    if (cell.isRevealed()) return;
    cell.setFlag(!cell.getFlag());
        e.target.innerHTML = cell.getFlag() ? '🚩' : '';
}

//per gestire la vittoria/sconfitta

function checkWin() {
    for (let row of grid) {
        for (let cell of row) {
            if (cell instanceof CasellaNumero && !cell.isRevealed()) {
                return false;
            }
        }
    }
    document.querySelector('#result').innerHTML = "You Win in " + timeElapsed + " seconds!";
    return true;
}

//classi per le caselle

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
        cellButton.id = "clicked";
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