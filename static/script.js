async function carregarMusicas() {
  try {
    const resposta = await fetch('http://127.0.0.1:8080/api/musicas');

    if (!resposta.ok) {
      throw new Error(`Erro no servidor: ${resposta.status}`);
    }

    const musicas = await resposta.json();

    // AJUSTE NO CONSOLE: Passar o array separado por vírgula permite que o console expanda o objeto Rust para você ver os detalhes
    salvarMusicasNoStorage(musicas)

    // Limpa o visor antes de carregar a nova lista (evita duplicar se clicar duas vezes)
    const visor = document.getElementById('listaMusicasVisor');
    visor.innerHTML = "";

    // CORREÇÃO: Usar += para somar/acumular o HTML de cada música, em vez de substituir

    musicas.forEach(musica => {
  // Divide o caminho por barras e pega o último elemento (o nome da música)
    const nomeMusica = musica.caminho.split('/').pop();

      visor.innerHTML += `
      <div onclick="reproduzir('${musica.caminho}')" class="cardMusica">
       <p class="tituloMusica">${nomeMusica}</p>
      </div>`;
    });

  } catch (erro) {
    console.error("Falha ao buscar músicas:", erro);
    document.getElementById('visor').innerHTML = `<p style="color: red;">Erro ao carregar músicas.</p>`;
  }
}
carregarMusicas()
// Salva a lista de músicas no localStorage
function salvarMusicasNoStorage(musicas) {
  localStorage.setItem('minhas_musicas', JSON.stringify(musicas));
}
