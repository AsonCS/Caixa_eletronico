var POUPANCA = '1';
var C_CORRENTE = '2';
var C_ESPECIAL = '3';

function Conta (numero, cliente, senha, tipo) {
    this.numero = numero;
    this.saldo = 0;
    this.cliente = cliente;
    this.senha = senha;
    this.tipo = tipo;
    this.sacar = (valor) => {
        if(valor <= this.saldo){
            this.saldo -= valor;
            contas.setSaldo(valor);
            return true;
        }else{
            return false;
        }
    };
    this.depositar = (valor) => {
        if(valor >= 0){
            this.saldo += valor;
            contas.setSaldo(valor);
            return true;
        }else{
            return false;
        }
    };
    this.move = () => {
        var opt, valor, menu = "Ol� " + this.cliente + "\nExtrato - 1\nDepositar - 2\nSacar - 3\nSair da conta - 0", sair = false;
        do {
            opt = prompt(menu);
            if(opt == null)
                break;
            switch (opt) {
                case "1":
                    alert("Extrato\n"+this.saldoString());
                    break;
                case "2":
                    valor = prompt("Valor para dep�sito");
                    if (valor.match("([0-9]+)([.]?)([0-9]{0,2})")) {
                        if (!this.depositar(parseFloat(valor))) {
                            alert(null, "Valor invalido!");
                        }
                    } else {
                        alert(null, "Valor invalido!");
                    }
                    break;
                case "3":
                    valor = prompt("Valor para saque");
                    if (valor.match("([0-9]+)([.]?)([0-9]{0,2})")) {
                        if (!this.sacar(parseFloat(valor))) {
                            alert("Valor invalido!");
                        }
                    } else {
                        alert("Valor invalido!");
                    }
                    break;
                case "0":
                    sair = true;
                    break;
            }
        } while (!sair);
    };
    this.saldoString = () => {
        return "Saldo: "+this.saldo.toFixed(2);
    };
}

function Poupanca (numero, cliente, senha){
    var conta = new Conta(numero, cliente, senha, POUPANCA);
    conta.TAXA = 0.0005;
    conta.update = () => {
        this.depositar(conta.saldo*conta.TAXA);
    };
    return conta;
}

function Corrente (numero, cliente, senha){
    return new Conta(numero, cliente, senha, C_CORRENTE);
}

function Corrente_especial (numero, cliente, senha){
    var conta = new Conta(numero, cliente, senha, C_ESPECIAL);
    conta.limite = 1000;
    conta.sacar = (valor) => {
        if(conta.saldo - valor < conta.limite * -1){
            return false;
        }else{
            conta.saldo -= valor;
            contas.setSaldo(valor);
            return true;
        }
    };
    conta.saldoString = () => {
        var ext_limite = conta.saldo < 0 ? conta.limite + conta.saldo : conta.limite;
        var ext_saldo = conta.saldo < 0 ? 0 : conta.saldo;
        return "Saldo: "+ext_saldo.toFixed(2)+"\nLimite: "+ext_limite.toFixed(2);
    };
    return conta;
}

function Db (){
    this.db = openDatabase('banco', '1.0', 'Banco', 10 * 1024 * 1024, (db) => {
        db.transaction((st) => {
            st.executeSql('CREATE TABLE IF NOT EXISTS contas (numero unique, cliente NOT NULL, senha NOT NULL, saldo, tipo NOT NULL, taxa, limite)');
        });
    });
    this.execute = (query, args, sucess_callback = (t, data) => {}, error_callback = (t, error) => {}) => {
        this.db.transaction((st) => {
            st.executeSql(query, args, sucess_callback, error_callback);
        });
    }
}

function Contas_DAO (db){
    this.valid = (conta) => {
        conta.numero = typeof(conta.numero)== 'undefined' ? null : conta.numero;
        conta.cliente = typeof(conta.cliente)== 'undefined' ? null : conta.cliente;
        conta.senha = typeof(conta.senha)== 'undefined' ? null : conta.senha;
        conta.saldo = typeof(conta.saldo)== 'undefined' ? 0 : conta.saldo;
        conta.tipo = typeof(conta.tipo)== 'undefined' ? null : conta.tipo;
        conta.TAXA = typeof(conta.TAXA)== 'undefined' ? 0 : conta.TAXA;
        conta.limite = typeof(conta.limite) == 'undefined' ? 0 : conta.limite;
        return conta;
    }
    this.montaConta = (data) => {
        var conta;
        switch (data.tipo) {
            case POUPANCA:
                conta = Poupanca(data.numero, data.cliente, data.senha);
                break;
            case C_CORRENTE:
                conta = Corrente(data.numero, data.cliente, data.senha);
                break;
            case C_ESPECIAL:
                conta = Corrente_especial(data.numero, data.cliente, data.senha);
                break;
        }
        conta.saldo = data.saldo;
        conta.tipo = data.tipo;
        conta.TAXA = data.taxa;
        conta.limite = data.limite;
        return conta;
    }
    this.push = (conta, sucess_callback = (t, data) => {}, error_callback = (t, error) => {}) => {
        var query = 'INSERT INTO contas VALUES ( ?, ?, ?, ?, ?, ?, ?)';
        conta = this.valid(conta);
        var args = [conta.numero, conta.cliente, conta.senha, conta.saldo, conta.tipo, conta.TAXA, conta.limite];
        db.execute(query, args, sucess_callback, error_callback);
    }
    this.getConta = (num, sen, sucess_callback = (conta) => {}, error_callback = (error) => {}) => {
        var query = 'SELECT * FROM contas WHERE numero = ? AND senha = ?';
        var args = [num, sen];
        db.execute(query, args, (t, data) => {
            if(data.rows.length > 0){
                sucess_callback(this.montaConta(data.rows.item(0)));
            }
        }, 
        (t, error) => {
            alert(error.message);
        });
    }
    this.setSaldo = (valor, num, sucess_callback = (conta) => {}, error_callback = (error) => {}) => {
        var query = 'UPDATE contas SET saldo = ? WHERE numero = ?';
        var args = [valor, num];
        db.execute(query, args);
    }
    this.render = () => {
        var query = 'UPDATE contas SET saldo = saldo * (1 + taxa) WHERE tipo = ?';
        var args = [POUPANCA];
        db.execute(query, args);
    }
}

var db = new Db();

var contas = new Contas_DAO(db);

function criar_conta(){
    var num, cli, sen, opt, menu = "Tipo de conta\nPoupan�a - 1\nCorrente - 2\nCorrente especial - 3", err;
    opt = prompt(menu);
    num = prompt("Numero da conta (max 4 digitos)");
    cli = prompt("Nome");
    sen = prompt("Senha (max 4 digitos)");
    err = (num.match("[0-9]{1,4}") && sen.match("[0-9]{1,4}") && (opt == "1" || opt == "2" || opt == "3"));
    if (!err) {
        alert("Dados invalidos");
    } else {
        var con;
        switch (opt) {
            case "1":
                con = Poupanca(num, cli, sen);
                break;
            case "2":
                con = Corrente(num, cli, sen);
                break;
            case "3":
                con = Corrente_especial(num, cli, sen);
                break;
        }
        contas.push(con, (t, data) => {alert('inserido')}, (t, error) => {alert(error.message)});
    }
}

function entrar_conta(){
    var num, sen, err;
    num = prompt("Numero da conta");
    sen = prompt("Senha");
    err = !(num.match("[0-9]{1,4}") && sen.match("[0-9]{1,4}"));
    if (err) {
        alert("Dados invalidos");
    } else {
        contas.render();
        contas.getConta(num, sen, (conta) => {conta.move();});
    }
}