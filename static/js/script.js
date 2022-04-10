OPERATIONS = ['+', '-', '*', '÷', '^', '%']
TRIG_FUNCTIONS = ['sin', 'cos', 'tan']
OTHER_FUNCTIONS = ['log', 'sqrt']

class Calculator {
    constructor(previousOperandOutput, currentOperandOutput) {
        this.previousOperandOutput = previousOperandOutput;
        this.currentOperandOutput = currentOperandOutput;
        this.clear()
    }

    clear() {
        this.currentOperand = '';
        this.previousOperand = '';
        this.operation = undefined;
        this.justComputed = false;
        this.arc = false;
        this.hyperbolic = false;
        this.updateDisplay();
    }

    delete() {
        this.currentOperand = this.currentOperand.slice(0, -1);
        this.updateDisplay();
    }

    appendString(string) {
        if (string === '.' && this.currentOperand.slice(this.getLastOperationIndex()).includes('.')) {return}

        if (this.justComputed) {
            if (!this.justErrored) {this.previousOperand = this.currentOperand}
            else {this.previousOperand = ''}
            this.currentOperand = '';
            this.justComputed = false;
        }

        if (TRIG_FUNCTIONS.includes(string)) {
            if (this.arc) {string = 'a' + string}
            if (this.hyperbolic) {string += 'h'}
            string += '(';
        }

        if (OTHER_FUNCTIONS.includes(string)) {
            string += '(';
        }

        this.currentOperand += string;
        this.updateDisplay();
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
            let index = 0;

            for (let j = 0; j < reversedOperand.length; j++) {
                if (reversedOperand[j] === ')') {bracketCount++}
                if (reversedOperand[j] === '(') {bracketCount--}
                if (bracketCount <= 0 && OPERATIONS.includes(reversedOperand[j])) {index = j; break}
            }

            reversedOperand = `)${reversedOperand.slice(0, index)}(lairotcaf${reversedOperand.slice(index)}`;
            finalOperand += reversedOperand.split("").reverse().join("");
        }

        this.currentOperand = finalOperand.slice(1);
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
            this.currentOperand = data.equation;
            this.updateDisplay();
        });
    }

    updateDisplay() {
        this.arc = false;
        this.hyperbolic = false;
        this.previousOperandOutput.innerText = this.previousOperand;
        if (this.currentOperand === '') {this.currentOperandOutput.innerText = '0'; return}
        this.currentOperandOutput.innerText = this.currentOperand;
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
