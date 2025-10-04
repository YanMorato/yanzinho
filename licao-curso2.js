let num1= prompt("Insira primeiro número:");
let num2= prompt("Insira o segundo número:");

num1= Number(num1);
num2= Number(num2);

if(num1 > num2){
    console.log(`O maior numero é o: ${num1} `);
}else if(num1 == num2){
    console.log("Os numeros tem o mesmo valor");
}else
    console.log(`O maior numero e o: ${num2} `);
                                     
