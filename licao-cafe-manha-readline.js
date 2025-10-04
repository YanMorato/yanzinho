const readline= require("readline");

const rl= readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

console.log("Vamos preparar um delicioso café da manhã,com três ingredientes!");
let ingredientes= [];
rl.question("Qual o ingrediente 1? ", (ing1)=>{
    ingredientes.push(ing1);

    rl.question("Qual o ingrediente 2? ", (ing2)=>{
        ingredientes.push(ing2);

        rl.question("Qual o ingrediente 3? ", (ing3)=>{
            ingredientes.push(ing3);

            console.log(`O seu café da manhã terá: ${ingredientes.join(", ")}`);
        });
    });
});