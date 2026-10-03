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
// Seleciona todos os botões de navegação do cabeçalho
const botoesNav = document.querySelectorAll('#cabecalho .btn-nav');

botoesNav.forEach(botao => {
  botao.addEventListener('click', () => {
    // 1. Procura o botão que está ativo no momento e remove a classe 'ativo' dele
    const botaoAtivoAtual = document.querySelector('#cabecalho .btn-nav.ativo');
    if (botaoAtivoAtual) {
      botaoAtivoAtual.classList.remove('ativo');
    }
    
    // 2. Adiciona a classe 'ativo' (cor branca) apenas no botão que você acabou de clicar
    botao.classList.add('ativo');
  });
});
