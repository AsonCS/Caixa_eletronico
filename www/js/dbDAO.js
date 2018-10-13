/**
 * 
 * @author AsonCS
 * @description Controla as contas e o banco de dados
 */


class Conta {

    /**
     * 
     * @description Retorna constante para tipo da conta.
     * @returns {number} POUPANCA value 1
     */
    static POUPANCA () {return '1'}

    /**
     * 
     * @description Retorna constante para tipo da conta.
     * @returns {number} C_CORRENTE value 2
     */
    static C_CORRENTE () {return '2'}

    /**
     * 
     * @description Retorna constante para tipo da conta.
     * @returns {number} C_ESPECIAL value 3
     */
    static C_ESPECIAL () {return '3'}

    /**
     * 
     * @description Super classe de Conta para todos os tipos.
     * @param {number} numero Numero da conta
     * @param {string} cliente Nome do Cliente
     * @param {number} senha Senha da conta
     * @param {number} tipo Tipo da conta, use métodos static: {POUPANCA() = 1; C_CORRENTE() = 2, C_ESPECIAL() = 3}
     */
    constructor(numero, cliente, senha, tipo) {
        this.numero = numero;
        this.saldo = 0;
        this.cliente = cliente;
        this.senha = senha;
        this.tipo = tipo;

        /**
         * 
         * @param {number} valor Valor do saque.
         * @returns {boolean} True ou False.
         */
        this.sacar = (valor) => {
            if (valor <= this.saldo) {
                this.saldo -= valor;
                return true;
            }
            else {
                return false;
            }
        };

        /**
         * 
         * @param {number} valor Valor do deposito.
         * @returns {boolean} True ou False.
         */
        this.depositar = (valor) => {
            if (valor >= 0) {
                this.saldo += valor;
                return true;
            }
            else {
                return false;
            }
        };

        /**
         * 
         * @returns {string} Saldo em texto
         */
        this.saldoString = () => {
            return "Saldo: " + this.saldo.toFixed(2);
        };
    }
}

class Poupanca extends Conta {

    /**
     * 
     * @description Classe Poupanca, com a propriedade taxa e tipo POUPANCA.
     * @param {number} numero Numero da conta
     * @param {string} cliente Nome do Cliente
     * @param {number} senha Senha da conta
     */
    constructor(numero, cliente, senha) {
        super(numero, cliente, senha);
        this.tipo = Conta.POUPANCA();
        this.taxa = 0.0005;
    }
}

class Corrente extends Conta {

    /**
     * 
     * @description Classe Corrente, com a propriedade tipo C_CORRENTE.
     * @param {number} numero Numero da conta
     * @param {string} cliente Nome do Cliente
     * @param {number} senha Senha da conta
     */
    constructor(numero, cliente, senha) {
        super(numero, cliente, senha);
        this.tipo = Conta.C_CORRENTE();        
    }
}

class Corrente_especial extends Conta {

    /**
     * 
     * @description Classe Corrente_especial, com a propriedade tipo C_ESPECIAL e com métodos sacar() e depositar() alterados.
     * @param {number} numero Numero da conta
     * @param {string} cliente Nome do Cliente
     * @param {number} senha Senha da conta
     */
    constructor(numero, cliente, senha) {
        super(numero, cliente, senha);
        this.tipo = Conta.C_ESPECIAL();
        this.limite = 1000;

        /**
         * 
         * @param {number} valor Valor do saque.
         * @returns {boolean} True ou False.
         */
        this.sacar = (valor) => {
            if(this.saldo - valor < this.limite * -1){
                return false;
            }else{
                this.saldo -= valor;
                return true;
            }
        };

        /**
         * 
         * @returns {string} Saldo em texto
         */
        this.saldoString = () => {
            var ext_limite = this.saldo < 0 ? this.limite + this.saldo : this.limite;
            var ext_saldo = this.saldo < 0 ? 0 : this.saldo;
            return "Saldo: "+ext_saldo.toFixed(2)+"\nLimite: "+ext_limite.toFixed(2);
        };    
    }
}

class Db {

    /**
     * 
     * @description Cria a conexão com banco de dados, cria o banco se ele não existir
     */
    constructor() {
        var db = openDatabase('banco', '1.0', 'Banco', 10 * 1024 * 1024, (con) => {
            con.transaction((st) => {
                st.executeSql('CREATE TABLE IF NOT EXISTS contas (numero unique, cliente NOT NULL, senha NOT NULL, saldo, tipo NOT NULL, taxa, limite)');
            });
        });

        /**
         * 
         * @param {string} query Script SQL para executar no banco.
         * @param {array} args Argumentos para substituir '?' presentes na query.
         * @param {Function} sucess_callback Executado se tiver sucesso, recebe (t: t, data: data) como parametros.
         * @param {Function} error_callback Executado se tiver erro, recebe (t: t, error: error) como parametros.
         */
        this.execute = (query, args, sucess_callback = (t, data) => {}, error_callback = (t, error) => {}) => {
            db.transaction((st) => {
                st.executeSql(query, args, sucess_callback, error_callback);
            });
        };
    }
}

class Contas_DAO {

    /**
     * 
     * @description Controla os objetos Poupanca, Corrente e Corrente_especial fazendo os alterações no banco.
     * @param {Db} db Classe Db deste arquivo.
     */
    constructor(db) {

        /**
         * 
         * @param {number} code Código para montar erro.
         */
        var err = (code) => {
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
        };

        /**
         * 
         * @param {Conta} conta Configura objeto
         */
        var valid = (conta) => {
            conta.numero = typeof (conta.numero) == 'undefined' ? null : conta.numero;
            conta.cliente = typeof (conta.cliente) == 'undefined' ? null : conta.cliente;
            conta.senha = typeof (conta.senha) == 'undefined' ? null : conta.senha;
            conta.saldo = typeof (conta.saldo) == 'undefined' ? 0 : conta.saldo;
            conta.tipo = typeof (conta.tipo) == 'undefined' ? null : conta.tipo;
            conta.taxa = typeof (conta.taxa) == 'undefined' ? 0 : conta.taxa;
            conta.limite = typeof (conta.limite) == 'undefined' ? 0 : conta.limite;
            return conta;
        };

        /**
         * 
         * @param {number} numero Número da conta.
         * @param {string} cliente Nome do cliente.
         * @param {number} senha Número da senha.
         * @param {number} tipo Tipo da conta, use métodos static: {POUPANCA() = 1; C_CORRENTE() = 2, C_ESPECIAL() = 3}
         * @param {Function} sucess_callback Executado se tiver sucesso, recebe (conta: Conta) como parametro.
         * @param {Function} error_callback Executado se tiver erro, recebe (error: error) como parametro.
         */
        this.criarConta = (numero, cliente, senha, tipo, sucess_callback = (conta) => { }, error_callback = (error) => { }) => {
            var conta;
            switch (tipo) {
                case Conta.POUPANCA():
                    conta = new Poupanca(numero, cliente, senha);
                    break;
                case Conta.C_CORRENTE():
                    conta = new Corrente(numero, cliente, senha);
                    break;
                case Conta.C_ESPECIAL():
                    conta = new Corrente_especial(numero, cliente, senha);
                    break;
            }
            this.push(conta, sucess_callback, error_callback);
        };

        /**
         * 
         * @param {Conta} data Objeto Conta com tipo para montar o objeto correspondente.
         */
        var montaConta = (data) => {
            var conta;
            switch (data.tipo) {
                case Conta.POUPANCA():
                    conta = new Poupanca(data.numero, data.cliente, data.senha);
                    break;
                case Conta.C_CORRENTE():
                    conta = new Corrente(data.numero, data.cliente, data.senha);
                    break;
                case Conta.C_ESPECIAL():
                    conta = new Corrente_especial(data.numero, data.cliente, data.senha);
                    break;
            }
            conta.saldo = data.saldo;
            conta.tipo = data.tipo;
            conta.taxa = data.taxa;
            conta.limite = data.limite;
            return conta;
        };

        /**
         * 
         * @param {Conta} conta Objeto para ser inserido no banco de dados.
         * @param {Function} sucess_callback Executado se tiver sucesso, recebe (conta: Conta) como parametro.
         * @param {Function} error_callback Executado se tiver erro, recebe (error: error) como parametro.
         */
        this.push = (conta, sucess_callback = (conta) => { }, error_callback = (error) => { }) => {
            this.render();
            var query = 'INSERT INTO contas VALUES ( ?, ?, ?, ?, ?, ?, ?)';
            conta = valid(conta);
            var args = [conta.numero, conta.cliente, conta.senha, conta.saldo, conta.tipo, conta.taxa, conta.limite];
            db.execute(query, args, (t, data) => {
                this.getConta(conta.numero, conta.senha, (conta) => {
                    sucess_callback(conta);
                });
            }, (t, error) => {
                error_callback(error);
            });
        };

        /**
         * 
         * @param {Function} sucess_callback Executado se tiver sucesso, recebe (arrayContas: []) como parametro.
         * @param {Function} error_callback Executado se tiver erro, recebe (error: error) como parametro.
         */
        this.getArrayConta = (sucess_callback = (arrayContas) => { }, error_callback = (error) => { }) => {
            var query = 'SELECT * FROM contas';
            db.execute(query, [], (t, data) => {
                var arrayContas = new Array();
                for (var i = 0; i < data.rows.length; i++) {
                    arrayContas.push(montaConta(data.rows.item(i)));
                }
                if (arrayContas.length > 0) {
                    sucess_callback(arrayContas);
                }
                else {
                    error_callback(err(2));
                }
            }, (t, error) => error_callback(error));
        };

        /**
         * 
         * @param {number} num Número da conta.
         * @param {number} sen Senha da conta.
         * @param {Function} sucess_callback Executado se tiver sucesso, recebe (conta: Conta) como parametro.
         * @param {Function} error_callback Executado se tiver erro, recebe (error: error, conta: Conta) como parametros.
         */
        this.getConta = (num, sen, sucess_callback = (conta) => { }, error_callback = (error, conta) => { }) => {
            this.render();
            var query = 'SELECT * FROM contas WHERE numero = ? AND senha = ?';
            var args = [num, sen];
            db.execute(query, args, (t, data) => {
                if (data.rows.length > 0) {
                    sucess_callback(montaConta(data.rows.item(0)));
                }
                else {
                    error_callback(err(3), null);
                }
            }, (t, error) => {
                error_callback(error, null);
            });
        };

        /**
         * 
         * @param {number} valor Valor para depositar.
         * @param {number} num Número da conta.
         * @param {number} sen Senha da conta.
         * @param {Function} sucess_callback Executado se tiver sucesso, recebe (conta: Conta) como parametro.
         * @param {Function} error_callback Executado se tiver erro, recebe (error: error, conta: Conta) como parametros.
         */
        this.depositar = (valor, num, sen, sucess_callback = (conta) => { }, error_callback = (error, conta) => { }) => {
            this.getConta(num, sen, (conta) => {
                var ret = conta.depositar(valor);
                if (ret) {
                    var query = 'UPDATE contas SET saldo = ? WHERE numero = ? AND senha = ?';
                    var args = [conta.saldo, conta.numero, conta.senha];
                    db.execute(query, args, (t, data) => sucess_callback(conta), (t, error) => {
                        conta.sacar(valor);
                        error_callback(error, conta);
                    });
                }
                else {
                    error_callback(err(1), conta);
                }
            }, (error) => error_callback(error, null));
        };

        /**
         * 
         * @param {number} valor Valor para sacar.
         * @param {number} num Número da conta.
         * @param {number} sen Senha da conta.
         * @param {Function} sucess_callback Executado se tiver sucesso, recebe (conta: Conta) como parametro.
         * @param {Function} error_callback Executado se tiver erro, recebe (error: error, conta: Conta) como parametros.
         */
        this.sacar = (valor, num, sen, sucess_callback = (conta) => { }, error_callback = (error, conta) => { }) => {
            this.getConta(num, sen, (conta) => {
                var ret = conta.sacar(valor);
                if (ret) {
                    var query = 'UPDATE contas SET saldo = ? WHERE numero = ? AND senha = ?';
                    var args = [conta.saldo, conta.numero, conta.senha];
                    db.execute(query, args, (t, data) => sucess_callback(conta), (t, error) => {
                        conta.depositar(valor);
                        error_callback(error, conta);
                    });
                }
                else {
                    error_callback(err(1), conta);
                }
            }, (error) => error_callback(error, null));
        };

        /**
         * 
         * @description Executa query para rendimento das poupanças cadastradas no banco.
         */
        this.render = () => {
            var query = 'UPDATE contas SET saldo = saldo * (1 + taxa) WHERE tipo = ?';
            var args = [Conta.POUPANCA()];
            db.execute(query, args);
        };
    }
}
