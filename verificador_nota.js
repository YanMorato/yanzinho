let nota= prompt("Digite a sua nota(0 a 10):");
nota=Number(nota);

if (nota===10){
    console.log("Classificação:Exelente");
}else if(nota<= 9 && nota >7){
    console.log("Classificação : Bom");
}else if (nota<= 7 && nota >= 5){
    console.log(" Classificação: Regular");
}else {
    console.log("Classificação:Reprovado");
}