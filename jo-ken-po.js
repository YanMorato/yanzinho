alert("Bem-vindo ao jo-ken-po do Yan!")

function jokenPo (){//Para eu declarar uma função precisarei escolher o nome,após isso devo colocar parenteses e depois as chaves
    let vitorias = 0;
    let derrotas = 0;
    let empates = 0;
    let revanche = true;

    while (revanche){//Enquanto a variavel "revanche" for verdadeira o jogo irá continuar
        let escolhaDoJogador = prompt("Escolha entre: pedra, papel ou tesoura").toLowerCase();

        if(escolhaDoJogador !== "pedra" && escolhaDoJogador !== "papel" && escolhaDoJogador !== "tesoura"){
        console.log("Escolha invalida.Digite: pedra, papel ou tesoura");
        continue;    
        //Esse bloco de codigo diz a respeito a escolha do jogador    
    }
    //Agora estamos na escolha do computador
    //Para fazer a escolha do computadoreu vou utilizar array
    //As opções do meu array serão: pedra=0, papel=1 ou tesoura=2

    let opcoes = [
        "pedra",// Indice 0
        "papel",//Indice 1
        "tesoura"//Indice 2
    ];

    let escolhaDoComputador = opcoes [
        Math.floor(Math.random()*3)
    ];

    console.log(`A sua escolha foi: ${escolhaDoJogador}`);
    console.log(`O computador escolheu: ${escolhaDoComputador}`);
     
    if
    (escolhaDoJogador === escolhaDoComputador){
        console.log("Deu empate!");
        empates++;

    }else if(
    (escolhaDoJogador === "pedra" && escolhaDoComputador === "tesoura")
    ||
    (escolhaDoJogador === "papel" && escolhaDoComputador === "pedra")
    ||
    (escolhaDoJogador === "tesoura" && escolhaDoComputador === "papel")
    ){
        console.log("Você venceu!")
        vitorias++;
    }else{
        console.log("Você perdeu :(");
        derrotas++;
    }
     
    console.log(`O placar é: vitórias ${vitorias}, derrotas: ${derrotas}, empates: ${empates} `);

    let jogarDenovo = prompt("Quer jogar novamente? s/n"). toLowerCase();
     if(jogarDenovo !== "s"){
        revanche = false;
        console.log("Obrigado por jogar!");
     }
    
  }
}
// igual: ==, diferente: !==, e: &&

jokenPo();


   