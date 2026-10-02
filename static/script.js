async function carregarMusicas() {
  try {
    const resposta = await fetch('http://127.0.0.1:8080/api/musicas');
    
    if (!resposta.ok) {
      throw new Error(`Erro no servidor: ${resposta.status}`);
    }

    const musicas = await resposta.json(); 
    
    // AJUSTE NO CONSOLE: Passar o array separado por vírgula permite que o console expanda o objeto Rust para você ver os detalhes
    console.log("Músicas recebidas do Rust:", musicas);

    // Limpa o visor antes de carregar a nova lista (evita duplicar se clicar duas vezes)
    const visor = document.getElementById('visor');
    visor.innerHTML = "";

    // CORREÇÃO: Usar += para somar/acumular o HTML de cada música, em vez de substituir
    musicas.forEach(musica => {
      visor.innerHTML += `<p>[ID ${musica.id}] Caminho: ${musica.caminho}</p>`;
    });

  } catch (erro) {
    console.error("Falha ao buscar músicas:", erro);
    document.getElementById('visor').innerHTML = `<p style="color: red;">Erro ao carregar músicas.</p>`;
  }
}
