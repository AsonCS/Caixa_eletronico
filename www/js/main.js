var db = new Db();
var contas = new Contas_DAO(db);

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
        var opt, valor, menu = "Olá" + movConta.cliente + "\nExtrato - 1\nDepositar - 2\nSacar - 3\nSair da conta - 0", sair = false;
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
                    alert(null, "Valor invalido!");
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

function preencher(){
    contas.getArrayConta((arrayContas) => {
        var table = document.getElementById('tab');
        var tbody = table.getElementsByTagName('tbody')[0];
        tbody.innerHTML = '';
        for(var i = 0; i < arrayContas.length; i++){
            row = "<td>"+arrayContas[i].cliente+"</td><td>"+arrayContas[i].numero+"</td><td>"+arrayContas[i].senha+"</td>";
            tbody.innerHTML += row;
        }
    });
    
}
