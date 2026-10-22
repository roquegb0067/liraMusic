const visorPlaylists = document.getElementById('visorPlaylists');
const listaPlaylistsContainer = document.getElementById('listaPlaylistsContainer');
const tituloPlaylistAtual = document.getElementById('tituloPlaylistAtual');

// Exemplo de lista de playlists cadastradas no frontend (ou você pode buscar do backend também)
const minhasPlaylists = ["Favoritas", "Rock", "Sertanejo", "Lo-Fi"];

// Inicializa os botões das playlists na tela
function carregarBotoesPlaylists() {
  listaPlaylistsContainer.innerHTML = "";

  minhasPlaylists.forEach(nome => {
    const btn = document.createElement('button');
    btn.className = 'playlistBtn';
    btn.type = 'button';
    btn.innerHTML = `${nome} <span>›</span>`;

    btn.addEventListener('click', () => {
      // Destaque visual no botão ativo
      document.querySelectorAll('.playlistBtn').forEach(b => b.classList.remove('ativa'));
      btn.classList.add('ativa');

      // Busca as músicas no backend enviando a playlist desejada
      buscarMusicasDaPlaylist(nome);
    });

    listaPlaylistsContainer.appendChild(btn);
  });
}

// Função principal: envia a playlist buscada ao backend e exibe as músicas
async function buscarMusicasDaPlaylist(playlistBuscada) {
  tituloPlaylistAtual.textContent = `Playlist: ${playlistBuscada}`;
  visorPlaylists.innerHTML = `<p style="color: #888;">Carregando músicas...</p>`;

  try {
    // Passa o nome da playlist como parâmetro de consulta (Query Parameter)
    const url = `http://127.0.0.1:8080/api/playlist/musicas?playlist=${encodeURIComponent(playlistBuscada)}`;
    
    const resposta = await fetch(url);

    if (!resposta.ok) {
      throw new Error(`Erro no servidor: ${resposta.status}`);
    }

    const listaMusicas = await resposta.json();

    visorPlaylists.innerHTML = "";

    if (!listaMusicas || listaMusicas.length === 0) {
      visorPlaylists.innerHTML = `<p style="color: #aaa;">Nenhuma música encontrada nesta playlist.</p>`;
      return;
    }

    // Inverte a ordem se quiser ver as últimas adicionadas primeiro
    [...listaMusicas].reverse().forEach(musica => {
      // Extrai o nome do arquivo a partir do caminho do arquivo
      const nomeArquivo = musica.caminho ? musica.caminho.split('/').pop() : (musica.titulo || 'Música Sem Nome');

      const card = document.createElement('div');
      card.className = 'cardMusica';
      card.innerHTML = `
        <p class="titulorespostaPlaylist">${nomeArquivo}</p>
        <span class="subtituloMusica">ID: ${musica.id}</span>
      `;
      
      // Evento de clique para tocar/executar a música selecionada
      card.addEventListener('click', () => {
        tocarMusica(musica);
      });
      
      visorPlaylists.appendChild(card);
    });

  } catch (erro) {
    console.error(`Falha ao buscar músicas da playlist '${playlistBuscada}':`, erro);
    visorPlaylists.innerHTML = `<p style="color: #ff4d4d;">Erro ao carregar músicas do servidor.</p>`;
  }
}

// Função de Callback para quando o usuário clicar em um card de música
function tocarMusica(musica) {
  console.log("Executando música ID:", musica.id, "Caminho:", musica.caminho);
  // Aqui você pode integrar com a tag <audio> ou com o seu player do Web Audio API
}

// Inicializar ao carregar a página
document.addEventListener('DOMContentLoaded', carregarBotoesPlaylists);
