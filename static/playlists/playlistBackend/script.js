const API_URL = 'http://127.0.0.1:8080/api';
let playlistSelecionadaId = null;
let playlistSelecionadaNome = '';

// Elementos da DOM
const listaPlaylistsContainer = document.getElementById('listaPlaylistsContainer');
const inputNomeNovaPlaylist = document.getElementById('nomeNovaPlaylist');
const btnCriarPlaylist = document.getElementById('btnCriarPlaylist');
const painelGerenciamento = document.getElementById('painelGerenciamento');
const tituloPainelPlaylist = document.getElementById('tituloPainelPlaylist');
const musicasNaPlaylistVisor = document.getElementById('musicasNaPlaylistVisor');
const musicasGeraisVisor = document.getElementById('musicasGeraisVisor');

// 1. Carregar Playlists ao iniciar
async function carregarPlaylists() {
  try {
    const resposta = await fetch(`${API_URL}/playlists`);
    if (!resposta.ok) throw new Error("Erro ao buscar playlists");
    
    const playlists = await resposta.json();
    listaPlaylistsContainer.innerHTML = "";

    playlists.forEach(playlist => {
      const btn = document.createElement('button');
      btn.className = 'playlistBtn';
      btn.type = 'button';
      btn.innerHTML = `${playlist.nome} <span>›</span>`;

      btn.addEventListener('click', () => {
        document.querySelectorAll('.playlistBtn').forEach(b => b.classList.remove('ativa'));
        btn.classList.add('ativa');
        
        playlistSelecionadaId = playlist.id;
        playlistSelecionadaNome = playlist.nome;
        
        tituloPainelPlaylist.textContent = `Editando: ${playlist.nome}`;
        painelGerenciamento.style.display = 'flex';

        // Carrega os dados da playlist selecionada e as músicas gerais
        carregarMusicasDaPlaylist(playlist.id);
        carregarMusicasGerais();
      });

      listaPlaylistsContainer.appendChild(btn);
    });
  } catch (erro) {
    console.error("Erro:", erro);
    listaPlaylistsContainer.innerHTML = `<p style="color: red; font-size: 13px;">Erro ao carregar playlists.</p>`;
  }
}

// 2. Criar Nova Playlist (POST)
btnCriarPlaylist.addEventListener('click', async () => {
  const nome = inputNomeNovaPlaylist.value.trim();
  if (!nome) return alert("Digite um nome para a playlist!");

  try {
    const resposta = await fetch(`${API_URL}/playlists`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome: nome })
    });

    if (!resposta.ok) throw new Error("Erro ao criar playlist");

    inputNomeNovaPlaylist.value = "";
    carregarPlaylists(); // Atualiza a lista lateral
  } catch (erro) {
    console.error("Erro ao criar:", erro);
    alert("Não foi possível criar a playlist.");
  }
});

// 3. Buscar todas as músicas existentes no Back-End (Baseado no seu código)
async function carregarMusicasGerais() {
  try {
    const resposta = await fetch(`${API_URL}/musicas`);
    if (!resposta.ok) throw new Error(`Erro no servidor: ${resposta.status}`);

    const musicas = await resposta.json();
    musicasGeraisVisor.innerHTML = "";

    musicas.forEach(musica => {
      const nomeMusica = musica.caminho.split('/').pop();

      const card = document.createElement('div');
      card.className = 'cardAcao';
      card.innerHTML = `
        <span class="titulorespostaPlaylist" style="font-size: 13px; max-width: 70%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${nomeMusica}</span>
        <button class="btnAcaoAdd" type="button">+ Adicionar</button>
      `;
      
      card.querySelector('.btnAcaoAdd').addEventListener('click', () => {
        adicionarMusicaNaPlaylist(playlistSelecionadaId, musica.id);
      });
      
      musicasGeraisVisor.appendChild(card);
    });

  } catch (erro) {
    console.error("Falha ao buscar músicas gerais:", erro);
    musicasGeraisVisor.innerHTML = `<p style="color: red; font-size: 13px;">Erro ao carregar músicas.</p>`;
  }
}

// 4. Carregar músicas que já estão dentro da playlist selecionada
async function carregarMusicasDaPlaylist(playlistId) {
  try {
    const resposta = await fetch(`${API_URL}/playlist/musicas?id=${playlistId}`);
    if (!resposta.ok) throw new Error("Erro ao buscar músicas da playlist");

    const musicas = await resposta.json();
    musicasNaPlaylistVisor.innerHTML = "";

    if (musicas.length === 0) {
      musicasNaPlaylistVisor.innerHTML = `<p style="color: #666; font-size: 13px;">Esta playlist está vazia.</p>`;
      return;
    }

    musicas.forEach(musica => {
      const nomeMusica = musica.caminho.split('/').pop();

      const card = document.createElement('div');
      card.className = 'cardAcao';
      card.innerHTML = `
        <span class="titulorespostaPlaylist" style="font-size: 13px; max-width: 70%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${nomeMusica}</span>
        <button class="btnAcaoRemover" type="button">Remover</button>
      `;
      
      card.querySelector('.btnAcaoRemover').addEventListener('click', () => {
        removerMusicaDaPlaylist(playlistId, musica.id);
      });
      
      musicasNaPlaylistVisor.appendChild(card);
    });

  } catch (erro) {
    console.error("Erro:", erro);
    musicasNaPlaylistVisor.innerHTML = `<p style="color: red; font-size: 13px;">Erro ao carregar músicas da playlist.</p>`;
  }
}

// 5. Enviar requisição para Adicionar Música na Playlist (POST ou PUT)
async function adicionarMusicaNaPlaylist(playlistId, musicaId) {
  try {
    const resposta = await fetch(`${API_URL}/playlist/adicionar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playlist_id: playlistId, musica_id: musicaId })
    });

    if (!resposta.ok) throw new Error("Erro ao adicionar música");

    // Atualiza a visualização das músicas da playlist
    carregarMusicasDaPlaylist(playlistId);
  } catch (erro) {
    console.error("Erro:", erro);
    alert("Falha ao adicionar música à playlist.");
  }
}

// 6. Enviar requisição para Remover Música da Playlist (DELETE)
async function removerMusicaDaPlaylist(playlistId, musicaId) {
  try {
    const resposta = await fetch(`${API_URL}/playlist/remover`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playlist_id: playlistId, musica_id: musicaId })
    });

    if (!resposta.ok) throw new Error("Erro ao remover música");

    // Atualiza a visualização
    carregarMusicasDaPlaylist(playlistId);
  } catch (erro) {
    console.error("Erro:", erro);
    alert("Falha ao remover música da playlist.");
  }
}

// Inicializar carregando as playlists ao abrir a página
document.addEventListener('DOMContentLoaded', carregarPlaylists);
