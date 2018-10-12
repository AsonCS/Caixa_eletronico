var Tipo = {};
Tipo.POUPANCA = '1';
Tipo.C_CORRENTE = '2';
Tipo.C_ESPECIAL = '3';

function Conta (numero, cliente, senha, tipo) {
    this.numero = numero;
    this.saldo = 0;
    this.cliente = cliente;
    this.senha = senha;
    this.tipo = tipo;
    this.sacar = (valor) => {
        if(valor <= this.saldo){
            this.saldo -= valor;
            return true;
        }else{
            return false;
        }
    };
    this.depositar = (valor) => {
        if(valor >= 0){
            this.saldo += valor;
            return true;
        }else{
            return false;
        }
    };
    this.saldoString = () => {
        return "Saldo: "+this.saldo.toFixed(2);
    };
}

function Poupanca (numero, cliente, senha){
    var conta = new Conta(numero, cliente, senha, Tipo.POUPANCA);
    conta.TAXA = 0.0005;
    return conta;
}

function Corrente (numero, cliente, senha){
    return new Conta(numero, cliente, senha, Tipo.C_CORRENTE);
}

function Corrente_especial (numero, cliente, senha){
    var conta = new Conta(numero, cliente, senha, Tipo.C_ESPECIAL);
    conta.limite = 1000;
    conta.sacar = (valor) => {
        if(conta.saldo - valor < conta.limite * -1){
            return false;
        }else{
            conta.saldo -= valor;
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
    this.err = (code) => {
        var erro = {};
        switch (code) {
            case 1:
                erro.code = code;
                erro.message = 'Valor invalido';
                break;
            case 2:
                erro.code = code;
                erro.message = 'Erro no array';
                break;
            case 3:
                erro.code = code;
                erro.message = 'Usuario ou senha invalida';
                break;
            default:
            erro.code = 0;
            erro.message = 'Erro';
        }        
        return erro;
    }
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
    this.criarConta = (numero, cliente, senha, tipo, sucess_callback = (conta) => {}, error_callback = (error) => {}) => {
        var conta;
        switch (tipo) {
            case Tipo.POUPANCA:
                conta = Poupanca(numero, cliente, senha);
                break;
            case Tipo.C_CORRENTE:
                conta = Corrente(numero, cliente, senha);
                break;
            case Tipo.C_ESPECIAL:
                conta = Corrente_especial(numero, cliente, senha);
                break;
        }
        this.push(conta, sucess_callback, error_callback);
    }
    this.montaConta = (data) => {
        var conta;
        switch (data.tipo) {
            case Tipo.POUPANCA:
                conta = Poupanca(data.numero, data.cliente, data.senha);
                break;
            case Tipo.C_CORRENTE:
                conta = Corrente(data.numero, data.cliente, data.senha);
                break;
            case Tipo.C_ESPECIAL:
                conta = Corrente_especial(data.numero, data.cliente, data.senha);
                break;
        }
        conta.saldo = data.saldo;
        conta.tipo = data.tipo;
        conta.TAXA = data.taxa;
        conta.limite = data.limite;
        return conta;
    }
    this.push = (conta, sucess_callback = (conta) => {}, error_callback = (error) => {}) => {
        this.render();
        var query = 'INSERT INTO contas VALUES ( ?, ?, ?, ?, ?, ?, ?)';
        conta = this.valid(conta);
        var args = [conta.numero, conta.cliente, conta.senha, conta.saldo, conta.tipo, conta.TAXA, conta.limite];
        db.execute(query, args, (t, data) => {
            this.getConta(conta.numero, conta.senha, (conta) => {
                sucess_callback(conta);
            });
        },
        (t, error) => {
            error_callback(error);
        });
    }
    this.getArrayConta = (sucess_callback = (arrayContas) => {}, error_callback = (error) => {}) => {
        var query = 'SELECT * FROM contas';
        db.execute(query, [], (t, data) => {
            var arrayContas = new Array();
            for(var i = 0; i < data.rows.length; i++){
                arrayContas.push(this.montaConta(data.rows.item(i)));
            }
            if(arrayContas > 0){
                sucess_callback(arrayContas);
            }else{
                error_callback(this.err(2));
            }
        },(t, error) => error_callback(error));
    }
    this.getConta = (num, sen, sucess_callback = (conta) => {}, error_callback = (error, conta) => {}) => {
        this.render();
        var query = 'SELECT * FROM contas WHERE numero = ? AND senha = ?';
        var args = [num, sen];
        db.execute(query, args, (t, data) => {
            if(data.rows.length > 0){
                sucess_callback(this.montaConta(data.rows.item(0)));
            }else{
                error_callback(this.err(3), null);
            }
        }, 
        (t, error) => {
            error_callback(error, null);
        });
    }
    this.depositar = (valor, num, sen, sucess_callback = (conta) => {}, error_callback = (error, conta) => {}) => {
        this.getConta(num, sen, (conta) => {
            var ret = conta.depositar(valor);
            if(ret){
                var query = 'UPDATE contas SET saldo = ? WHERE numero = ? AND senha = ?';
                var args = [conta.saldo, conta.numero, conta.senha];
                db.execute(query, args, (t, data) => sucess_callback(conta), (t, error) => {
                    conta.sacar(valor);
                    error_callback(error, conta);
                });
            }else{
                error_callback(this.err(1), conta);
            }
        },
        (error) => error_callback(error, null));      
    }
    this.sacar = (valor, num, sen, sucess_callback = (conta) => {}, error_callback = (error, conta) => {}) => {
        this.getConta(num, sen, (conta) => {
            var ret = conta.sacar(valor);
            if(ret){
                var query = 'UPDATE contas SET saldo = ? WHERE numero = ? AND senha = ?';
                var args = [conta.saldo, conta.numero, conta.senha];
                db.execute(query, args, (t, data) => sucess_callback(conta), (t, error) => {
                    conta.depositar(valor);
                    error_callback(error, conta);
                });
            }else{
                error_callback(this.err(1), conta);
            }
        },
        (error) => error_callback(error, null)); 
    }
    this.render = () => {
        var query = 'UPDATE contas SET saldo = saldo * (1 + taxa) WHERE tipo = ?';
        var args = [Tipo.POUPANCA];
        db.execute(query, args);
    }
}