const Modal = {
    // Alternancia entre mostrar o Modal e esconde-lo
    toggle() {
        modal = document.querySelector('.modal-overlay')
        modal.classList.toggle('active')
    }
}

const Storage = {
    get() {
        return JSON.parse(localStorage.getItem('dev.finances:transactions')) || []
    },

    set(transactions) {
        localStorage.setItem('dev.finances:transactions', JSON.stringify(transactions))
    }
}

const Transaction = {
    all: Storage.get(),

    add(transaction) {
        this.all.push(transaction)

        App.reload()
    },

    remove(index) {
        this.all.splice(index, 1)

        App.reload()
    },

    incomes() {
        let income = 0
        this.all.forEach(transaction => {
            income += transaction.amount > 0 ? transaction.amount : 0
        })

        return income
    },

    expenses() {
        let expense = 0
        this.all.forEach(transaction => {
            expense += transaction.amount < 0 ? transaction.amount : 0
        })

        return expense
    },

    total() {
        return this.incomes() + this.expenses()
    }
}

const DOM = {
    transactionsContainer: document.querySelector('#data-table tbody'),

    addTransaction(transaction, index) {
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
        tr.dataset.index = index

        DOM.transactionsContainer.appendChild(tr)
    },

    innerHTMLTransaction(transaction, index) {
        const CSSclass = transaction.amount > 0 ? 'income' : 'expense'

        const amount = Utils.formatCurrency(transaction.amount)

        const html = `
        <td class="description">${transaction.description}</td>
        <td class="${CSSclass}">${amount}</td>
        <td class="date">${transaction.date}</td>
        <td>
            <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover transação" />
        </td>
        `

        return html
    },

    updateBalance() {
        document.getElementById('incomeDisplay').innerHTML = Utils.formatCurrency(Transaction.incomes())
        document.getElementById('expenseDisplay').innerHTML = Utils.formatCurrency(Transaction.expenses())
        document.getElementById('totalDisplay').innerHTML = Utils.formatCurrency(Transaction.total())
    },

    clearTransactions() {
        this.transactionsContainer.innerHTML = ''
    }
}

const Utils = {
    formatAmount(value) {
        value *= 100

        return Math.round(value)
    },

    formatDate(date) {
        const splittedDate = date.split('-')
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    },

    formatCurrency(value) {
        const signal = Number(value) < 0 ? '-' : ''

        value = String(value).replace(/\D/g, '')

        value = Number(value) / 100

        value = value.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        })

        return signal + value
    }
}

const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    getValues() {
        return {
            description: this.description.value,
            amount: this.amount.value,
            date: this.date.value
        }
    },

    validateFields() {
        const { description, amount, date } = this.getValues()

        if (description.trim() === '' || amount.trim() === '' || date.trim() === '') {
            throw new Error('Por favor, preencha todos os campos')
        }
    },

    formatValues() {
        let { description, amount, date } = this.getValues()

        amount = Utils.formatAmount(amount)

        date = Utils.formatDate(date)

        return {
            description,
            amount,
            date
        }
    },

    saveTransaction(transaction) {
        Transaction.add(transaction)
    },

    clearFields() {
        this.description.value = ''
        this.amount.value = ''
        this.date.value = ''
    },

    submit(event) {
        event.preventDefault()

        try {
            // Faz a validação dos campos e impede valores vazios.
            this.validateFields()

            // Formata os valores para serem salvos no formato correto.
            const transaction = this.formatValues()

            // Salva os dados.
            this.saveTransaction(transaction)

            // Limpa os campos do formulario para proxima utilização.
            this.clearFields()

            // Fecha o Modal
            Modal.toggle()
        } catch (error) {
            alert(error.message)
        }
    }
}

const App = {
    init() {
        // shorthand (Atalho) da arrow function ? onde ele atomaticamente ira passar os parametros necessários para a função.
        Transaction.all.forEach(DOM.addTransaction)
        // Transaction.all.forEach((transaction, index) => {
        //     DOM.addTransaction(transaction, index)
        // })

        DOM.updateBalance()

        Storage.set(Transaction.all)
    },
    reload() {
        DOM.clearTransactions()
        App.init()
    }
}

App.init()
