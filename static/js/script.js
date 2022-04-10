OPERATIONS = ['+', '-', '*', '÷', '^', '%'];
TRIG_FUNCTIONS = ['sin', 'cos', 'tan'];
FUNCTIONS = [
    'log', 'sqrt',  'asin', 'acos', 'atan', 'asinh', 'acosh', 'atanh', 
    'sin', 'cos', 'tan', 'sinh', 'cosh', 'tanh'
];

class Calculator {
    constructor(previousOperandOutput, currentOperandOutput) {
        this.previousOperandOutput = previousOperandOutput;
        this.currentOperandOutput = currentOperandOutput;
        this.clear();
    }

    clear() {
        this.currentOperand = '';
        this.previousOperand = '';
        this.justComputed = false;
        this.justErrored = false;
        this.arc = false;
        this.hyperbolic = false;
        this.updateDisplay();
    }

    delete() {
        if (this.justErrored || this.justComputed) {this.clear(); return}

        for (let i = 0; i < FUNCTIONS.length; i++) {
            if (this.currentOperand.endsWith(FUNCTIONS[i] + '(')) {
                this.currentOperand = this.currentOperand.slice(0, -FUNCTIONS[i].length - 1);
                this.updateDisplay();
                return;
            }
        }

        this.currentOperand = this.currentOperand.slice(0, -1);
        this.updateDisplay();
    }

    appendString(string) {
        if (string === '.' && this.currentOperand.slice(this.getLastOperationIndex()).includes('.')) {return}

        if (this.justComputed) {
            if (!this.justErrored) {this.previousOperand = this.currentOperand}
            else {this.previousOperand = ''; this.justErrored = false}
            if (!OPERATIONS.includes(string)) {this.currentOperand = ''}
            this.justComputed = false;
        }

        if (TRIG_FUNCTIONS.includes(string)) {
            if (this.arc) {string = 'a' + string}
            if (this.hyperbolic) {string += 'h'}
        }

        if (FUNCTIONS.includes(string)) {
            string += '(';
        }

        this.currentOperand += string;
        this.updateDisplay();
    }

    compute() {
        this.appendMultiplication();
        this.convertFactorial();
        this.previousOperand = this.currentOperandOutput.innerText;
        this.justComputed = true;

        fetch(`/api?equation=${this.currentOperand.replace('+', 'Ψ')}`)
        .then(response => response.json())
        .then(data => {
            if (data.is_error) {this.justErrored = true}
            else {this.previousOperand += ' ='}
            this.currentOperand = data.equation;
            this.updateDisplay();
        });
    }

    updateDisplay() {
        this.arc = false;
        this.hyperbolic = false;
        this.previousOperandOutput.innerText = this.previousOperand;

        if (this.currentOperand === '') {this.currentOperandOutput.innerText = '0'; return}

        if (this.justErrored) {
            this.currentOperandOutput.style.fontSize = '1.5rem'
            this.currentOperandOutput.style.wordWrap = 'normal';
            this.currentOperandOutput.style.wordBreak = 'normal';
        } else {
            this.currentOperandOutput.style.fontSize = '2.5rem';
            this.currentOperandOutput.style.wordWrap = 'break-word';
            this.currentOperandOutput.style.wordBreak = 'break-all';
        }

        this.currentOperandOutput.innerText = this.currentOperand;
    }

    appendMultiplication() {
        const first = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', ')', 'e', 'i', 'π', '!'];
        const second = ['(', 'e', 'i', 'π', 's', 'c', 't', 'a'];

        for (let i = 0; i < first.length; i++) {
            const f = first[i];
            for (let j = 0; j < second.length; j++) {
                const s = second[j];
                this.currentOperand = this.currentOperand.replace(`${f}${s}`, `${f}*${s}`);
            }
        }
    }

    convertFactorial() {
        const currentOperand = '-' + this.currentOperand;
        const operands = currentOperand.split('!');
        if (operands === 1) {return}
        let finalOperand = '';
        
        for (let i = 0; i < operands.length; i++) {
            let reversedOperand = operands[i].split("").reverse().join("");
            if (i === operands.length - 1) {finalOperand += operands[i]; break}
            let bracketCount = 0;
            let insertAt = 0;

            for (let j = 0; j < reversedOperand.length; j++) {
                if (reversedOperand[j] === ')') {bracketCount++}
                if (reversedOperand[j] === '(') {bracketCount--}
                if (bracketCount <= 0 && OPERATIONS.includes(reversedOperand[j])) {insertAt = j; break}
            }

            reversedOperand = `)${reversedOperand.slice(0, insertAt)}(lairotcaf${reversedOperand.slice(insertAt)}`;
            finalOperand += reversedOperand.split("").reverse().join("");
        }

        this.currentOperand = finalOperand.slice(1);
    }

    getLastOperationIndex() {
        let lastOperationIndex = 0;

        for (let i = 0; i < OPERATIONS.length; i++) {
            const lastIIndex = this.currentOperand.lastIndexOf(OPERATIONS[i]);
            lastOperationIndex = lastIIndex > lastOperationIndex ? lastIIndex : lastOperationIndex;
        }

        return lastOperationIndex;
    }
}


const standardButtons = document.querySelectorAll('[data-button]');
const arcButton = document.querySelector('[data-arc]');
const hypButton = document.querySelector('[data-hyp]');
const equalsButton = document.querySelector('[data-equals]');
const deleteButton = document.querySelector('[data-delete]');
const allClearButton = document.querySelector('[data-all-clear]');
const previousOperandOutput = document.querySelector('[data-previous-operand]');
const currentOperandOutput = document.querySelector('[data-current-operand]');

const calculator = new Calculator(previousOperandOutput, currentOperandOutput);

for (let i = 0; i < standardButtons.length; i++) {
    const button = standardButtons[i];
    button.addEventListener('click', () => {calculator.appendString(button.innerText)})
}

arcButton.addEventListener('click', () => {calculator.arc = true})
hypButton.addEventListener('click', () => {calculator.hyperbolic = true})
equalsButton.addEventListener('click', () => {calculator.compute()})
deleteButton.addEventListener('click', () => {calculator.delete()})
allClearButton.addEventListener('click', () => {calculator.clear()})
