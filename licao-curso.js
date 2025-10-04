let x;
do {
    x = parseInt(prompt("Digite o número inicial:"));
} while (isNaN(x));

let y;
do {
    y = parseInt(prompt(`Digite um número maior que ${x}:`));
} while (isNaN(y) || y <= x);

for (let i = x; i <= y; i++) {
    if (i % 2 === 0) {
        console.log(`O número ${i} é par`);
    } else {
        console.log(`O número ${i} não é par`);
    }
}