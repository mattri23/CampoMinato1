document.querySelector('#start').addEventListener('click', )
document.querySelector('#stop').addEventListener('click', )
document.querySelector('#reset').addEventListener('click', )

class CampoMinato {

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

    set flag(value) {
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

    revealNumber() {
        this.reveal();
        // Logica per rivelare il numero
    }
}

class CasellaBomba extends Casella {
    constructor(x, y) {
        super(x, y);
    }

    revealBomb() {
        this.reveal();
        // Logica per rivelare la bomba
    }
}