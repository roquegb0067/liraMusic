// ==========================================
// ELEMENTOS DA INTERFACE
// ==========================================

const dialog = document.getElementById('reprodutorModal');
const btnAbrirModal = document.getElementById('btn-abrir-modal');
const btnFecharModal = document.getElementById('btn-fechar-modal');
const playerFixo = document.querySelector('.custom-player');

const audio = document.getElementById('meu-audio');

const btnsPlayPause = document.querySelectorAll('.main-play');
const iconesPlay = document.querySelectorAll('.icone-play');
const iconesPause = document.querySelectorAll('.icone-pause');

const barrasBg = document.querySelectorAll('.barra-interativa');
const barrasFill = document.querySelectorAll('.barra-fill');

const temposAtuais = document.querySelectorAll('.tempo-atual');
const temposTotais = document.querySelectorAll('.tempo-total');

const sliderVolume = document.querySelector('.volume-slider');

const btnsLike = document.querySelectorAll('.btn-like');

// IMPORTANTE:
// existem dois títulos:
// 1. título do modal
// 2. título do player inferior
const elementosTitulo = document.querySelectorAll('.player-titulo');

// E também dois artistas
const elementosArtista = document.querySelectorAll('.player-artista');


// ==========================================
// MÚSICAS DO LOCALSTORAGE
// ==========================================

function obterMusicasDoStorage() {

  const dados = localStorage.getItem('minhas_musicas');

  if (!dados) {
    return [];
  }

  try {
    return JSON.parse(dados);
  } catch (erro) {
    console.error('Erro ao ler minhas_musicas:', erro);
    return [];
  }
}


// ==========================================
// PEGAR NOME DA MÚSICA
// ==========================================

function extrairNomeMusica(caminho) {

  if (!caminho) {
    return 'Música desconhecida';
  }

  return caminho.split('/').pop();
}


// ==========================================
// REPRODUZIR
// ==========================================

function reproduzir(caminho) {
  if (!caminho) {
    console.error('Caminho da música não fornecido');
    return;
  }

  // URL para o streaming via API
  const url = `http://127.0.0.1:8080/api/musicas/stream?path=${encodeURIComponent(caminho)}`;
  // Exemplo no Frontend (encodeURIComponent evita problemas com barras e espaços no caminho)

  const nomeMusica = caminho.split('/').pop();
  const elemTitulo = document.getElementById('player-titulo');
  
  if (elemTitulo) {
    elemTitulo.textContent = nomeMusica;
  }

  audio.src = url;
  audio.play().catch(err => console.error('Erro ao reproduzir o áudio:', err));
}