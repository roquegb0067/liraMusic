async function carregarMusicas() {
  try {
    const resposta = await fetch('http://127.0.0.1:8080/api/musicas');

    if (!resposta.ok) {
      throw new Error(`Erro no servidor: ${resposta.status}`);
    }

    const musicas = await resposta.json();
    salvarMusicasNoStorage(musicas)

    const visor = document.getElementById('listaMusicasVisor');
    visor.innerHTML = "";

    musicas.forEach(musica => {
      const nomeMusica = musica.caminho.split('/').pop();

      const card = document.createElement('div');
      card.className = 'cardMusica';
      card.innerHTML = `<p class="tituloMusica">${nomeMusica}</p>`;
      
      // Usar addEventListener em vez de onclick inline
      card.addEventListener('click', () => {
        reproduzir(musica.caminho);
      });
      
      visor.appendChild(card);
    });

  } catch (erro) {
    console.error("Falha ao buscar músicas:", erro);
    document.getElementById('listaMusicasVisor').innerHTML = `<p style="color: red;">Erro ao carregar músicas.</p>`;
  }
}

carregarMusicas();

function salvarMusicasNoStorage(musicas) {
  localStorage.setItem('minhas_musicas', JSON.stringify(musicas));
}