//script para execultar meus arquivos js por click

function execultarExercicio (nome){
    //Remove o script anterior
    const scriptsAnteriores = document.querySelectorAll('script[data-exercicio]');
    scriptsAnteriores.forEach(s => s.remove());

    //Importar dinâmicamente meus exercicios
     const script = document.createElement('script');
     script.src = `${nome}.js`;
     script.onload = () => {
        console.log(`Exercicio "${nome}" carregado.`);
     };
     script.onerror = () => {
        console.error(`Erro ao carregar o exercicio "${nome}"`);
     };
     document.body. appendChild (script);
     document.getElementById ("exercicioAtual"). textContent = `Execultando: ${nome}`;
     console.clear ();
}