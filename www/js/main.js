var debug = false;
var db = new Db();
var contas = new Contas_DAO(db);

function criar_conta(){
	var nome = document.getElementById('form').firstname.value;
	var tipo = document.getElementById('form').tipocont.value;
	var numconta = document.getElementById('form').numconta.value;
	var senha = document.getElementById('form').senha.value;
	contas.criarConta(numconta, nome, senha, tipo, (conta) => {
            alert('inserido');            
        }, (error) => {alert(error.message)});
    document.getElementById('form').reset();
}

function entra_conta(){
	var numconta = document.getElementById('form').numconta.value;
	var senha = document.getElementById('form').senha.value;
    contas.getConta(numconta, senha, (conta) => {
        var con = JSON.stringify(conta);
        sessionStorage.conta = con;
        location = "manipularconta.html";
    }, (error) => {alert(error.message)});
}

function manipular_conta(){
    if(typeof(sessionStorage.conta) == 'undefined'){
        sessionStorage.removeItem('conta');
        location = "index.html";
    }
    var conta = JSON.parse(sessionStorage.conta);
    conta = contas.montaConta(conta);
    console.log(conta);
    document.getElementById('cliente').innerHTML = conta.cliente;
    document.getElementById('extrato').innerHTML = conta.saldoString();
}

function mc_depositar(){
    var conta = JSON.parse(sessionStorage.conta);
    conta = contas.montaConta(conta);
    var valor = document.getElementById('val_dep').value;
    valor = parseInt(valor);
    if(isNaN(valor)){
        alert('Valor invalido!');
        return;
    }
    contas.depositar(valor, conta.numero, conta.senha, (con) => {
        con = JSON.stringify(con);
        sessionStorage.conta = con;        
        location.reload();
    }, (error) => {alert(error.message)});
}

function mc_sacar(){
    var conta = JSON.parse(sessionStorage.conta);
    conta = contas.montaConta(conta);
    var valor = document.getElementById('val_saque').value;
    valor = parseInt(valor);
    if(isNaN(valor)){
        alert('Valor invalido!');
        return;
    }
    contas.sacar(valor, conta.numero, conta.senha, (con) => {
        con = JSON.stringify(con);
        sessionStorage.conta = con;        
        location.reload();
    }, (error) => {alert(error.message)});    
}

function mc_sair(){
    sessionStorage.removeItem('conta');
    location = "index.html";
}

/*
function main(){
    var menu_ini = "Criar conta - 1\nEntrar na Conta - 2\nSair - 0", sair = false, ent = null;
    ent = prompt(menu_ini);
    if (ent == null)preencher();
    switch (ent) {
        case "1":
            criar_conta();
            break;
        case "2":
            entrar_conta();
            break;
        case "0":
            preencher();
            break;
        default:
            main();
    }
}

function criar_conta(){
    var num = null, cli = null, sen = null, opt = null, menu = "Tipo de conta\nPoupança - 1\nCorrente - 2\nCorrente especial - 3", err;
    opt = prompt(menu);
    if(opt == null)main();
    num = prompt("Numero da conta (max 4 digitos)");
    if(num == null)main();
    cli = prompt("Nome");
    if(cli == null)main();
    sen = prompt("Senha (max 4 digitos)");
    if(sen == null)main();
    err = (num.match("[0-9]{1,4}") && sen.match("[0-9]{1,4}") && (opt == "1" || opt == "2" || opt == "3"));
    if (!err) {
        alert("Dados invalidos");
    } else {
        contas.criarConta(num, cli, sen, opt, (conta) => {
            alert('inserido');
            main();
        }, (error) => {alert(error.message)});
    }
}

function entrar_conta(){
    var num = null, sen = null, err;
    num = prompt("Numero da conta");
    if(num == null)main();
    sen = prompt("Senha");
    if(sen == null)main();
    err = !(num.match("[0-9]{1,4}") && sen.match("[0-9]{1,4}"));
    if (err) {
        alert("Dados invalidos");
    } else {
        contas.getConta(num, sen, (conta) => {
            move(conta);
        },(error) => {
            alert(error.message);
            main();
        });
    }
}

function move(movConta){
    if(movConta == null){
        main();
    }else{
        var opt, valor, menu = "Olá " + movConta.cliente + "\nExtrato - 1\nDepositar - 2\nSacar - 3\nSair da conta - 0", sair = false;
        opt = prompt(menu);
        if(opt == null)main();
        switch (opt) {
            case "1":
                alert("Extrato\n"+movConta.saldoString());
                move(movConta);
                break;
            case "2":
                valor = prompt("Valor para depósito");
                if(valor == null)move(movConta);
                if (valor.match("([0-9]+)([.]?)([0-9]{0,2})")) {
                    contas.depositar(parseFloat(valor), movConta.numero, movConta.senha, (con) => {
                        move(con);
                    },
                    (error, con) => {
                        alert(error.message);
                        move(con);
                    });
                } else {
                    alert("Valor invalido!");
                }
                break;
            case "3":
                valor = prompt("Valor para saque");
                if(valor == null)move(movConta);
                if (valor.match("([0-9]+)([.]?)([0-9]{0,2})")) {
                    contas.sacar(parseFloat(valor), movConta.numero, movConta.senha, (con) => {
                        move(con);
                    },
                    (error, con) => {
                        alert(error.message);
                        move(con);
                    });
                } else {
                    alert("Valor invalido!");
                }
                break;
            case "0":
                main();
                break;
            default:
                move(movConta);
        }
    }
}
*/

function preencher(){
    contas.getArrayConta((arrayContas) => {
        var table = document.getElementById('tab');
        var tbody = table.getElementsByTagName('tbody')[0];
        tbody.innerHTML = '';
        for(var i = 0; i < arrayContas.length; i++){
            var row = "<td>"+arrayContas[i].cliente+"</td>";
            row += "<td>"+arrayContas[i].numero+"</td>";
            row += "<td>"+arrayContas[i].senha+"</td>";
            row += "<td>"+arrayContas[i].saldo.toFixed(4)+"</td>";
            row += "<td>"+arrayContas[i].tipo+"</td>";
            row += "<td>"+arrayContas[i].taxa+"</td>";
            row += "<td>"+arrayContas[i].limite+"</td>";
            tbody.innerHTML += row;
        }
    });
    
}
