let anoAtual= prompt("Insira o ano em que estamos?");
let anoNascimento= prompt("Insira o ano em que você nasceu?");

let idade= Number(anoAtual)- Number(anoNascimento);

console.log(`Você tem ${idade} anos.`);
