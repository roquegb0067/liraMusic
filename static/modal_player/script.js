// ==========================================
// SELEÇÃO DE ELEMENTOS DA INTERFACE
// ==========================================
const audio = document.getElementById('meu-audio');
const dialog = document.getElementById('reprodutorModal');
const btnAbrirModal = document.getElementById('btn-abrir-modal');
const btnFecharModal = document.getElementById('btn-fechar-modal');
const playerFixo = document.querySelector('.custom-player');

// Múltiplos elementos (Modal + Player Fixo Rodapé)
const btnsPlayPause = document.querySelectorAll('.main-play, #btn-play-pause');
const iconesPlay = document.querySelectorAll('.icone-play');
const iconesPause = document.querySelectorAll('.icone-pause');

const barrasBg = document.querySelectorAll('.barra-interativa');
const barrasFill = document.querySelectorAll('.barra-fill');
const temposAtuais = document.querySelectorAll('.tempo-atual');
const temposTotais = document.querySelectorAll('.tempo-total');

const elemsTitulo = document.querySelectorAll('.player-titulo');
const elemsArtista = document.querySelectorAll('.player-artista');
const capaWrapper = document.getElementById('capa-wrapper');

const sliderVolume = document.querySelector('.volume-slider');
const btnsLike = document.querySelectorAll('.btn-like');

// ==========================================
// FUNÇÕES UTILITÁRIAS E DE STORAGE
// ==========================================
function formatarTempo(segundos) {
  if (isNaN(segundos) || !isFinite(segundos)) return '0:00';
  const min = Math.floor(segundos / 60);
  const seg = Math.floor(segundos % 60);
  return `${min}:${seg < 10 ? '0' : ''}${seg}`;
}

function extrairNomeMusica(caminho) {
  return caminho.split('/').pop().replace(/\.[^/.]+$/, "");
}

function obterMusicasDoStorage() {
  const dados = localStorage.getItem('minhas_musicas');
  return dados ? JSON.parse(dados) : [];
}

function atualizarIcones(estaTocando) {
  iconesPlay.forEach(icon => icon.style.display = estaTocando ? 'none' : 'block');
  iconesPause.forEach(icon => icon.style.display = estaTocando ? 'block' : 'none');
}

// ==========================================
// REPRODUÇÃO E INJEÇÃO DINÂMICA DE DADOS
// ==========================================
let artista = "LiraMusic";
let urlCapa = '/MVP/static/Screenshot_20261001_233241_Instagram.jpg'
function reproduzir(caminho, artista, urlCapa) {
  if (!caminho) {
    console.error('Caminho da música não fornecido');
    return;
  }
  console.log(caminho)
  // URL para streaming via API
  const urlStream = `http://127.0.0.1:8080/api/musicas/stream?path=${encodeURIComponent(caminho)}`;
  const nomeMusica = extrairNomeMusica(caminho);

  // Injeta Título e Artista em ambas as telas (Modal e Player Compacto)
  elemsTitulo.forEach(elem => elem.textContent = nomeMusica);
  elemsArtista.forEach(elem => elem.textContent = artista);

  // Injeta a imagem da capa no container do Modal
  if (capaWrapper && urlCapa) {
    capaWrapper.innerHTML = `<img class="capa-art" src="${urlCapa}" alt="Capa do Álbum" />`;
  }

  audio.src = urlStream;
  audio.play().catch(err => console.error('Erro ao reproduzir o áudio:', err));
}

// ==========================================
// CONTROLE DE ÁUDIO E SINCRONIZAÇÃO
// ==========================================
btnsPlayPause.forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation(); // Evita abrir o modal ao clicar no Play do rodapé
    if (!audio.src) return;
    if (audio.paused) {
      audio.play();
    } else {
      audio.pause();
    }
  });
});

audio.addEventListener('play', () => atualizarIcones(true));
audio.addEventListener('pause', () => atualizarIcones(false));

// Atualiza progresso e tempo decorrido simultaneamente
audio.addEventListener('timeupdate', () => {
  if (!audio.duration) return;
  const porcentagem = (audio.currentTime / audio.duration) * 100;

  barrasFill.forEach(fill => fill.style.width = `${porcentagem}%`);
  temposAtuais.forEach(tempo => tempo.textContent = formatarTempo(audio.currentTime));
});

// Duração total ao carregar metadados
audio.addEventListener('loadedmetadata', () => {
  temposTotais.forEach(tempo => tempo.textContent = formatarTempo(audio.duration));
});

// Clique na barra para buscar ponto da música (Seek)
barrasBg.forEach(barra => {
  barra.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!audio.duration) return;
    const rect = barra.getBoundingClientRect();
    const cliqueX = e.clientX - rect.left;
    audio.currentTime = (cliqueX / rect.width) * audio.duration;
  });
});

// Controle de Volume
if (sliderVolume) {
  sliderVolume.addEventListener('input', (e) => {
    audio.volume = e.target.value;
  });
}

// Botões Curtir (Sincroniza o estado em ambos os players)
btnsLike.forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const jaCurtido = btn.classList.contains('liked');
    btnsLike.forEach(b => b.classList.toggle('liked', !jaCurtido));
  });
});

// ==========================================
// GESTO DE ARRASTAR (SWIPE UP) NO RODAPÉ
// ==========================================
let startY = 0;
let currentY = 0;
let isDragging = false;

if (playerFixo) {
  // Touch (Dispositivos Móveis)
  playerFixo.addEventListener('touchstart', (e) => {
    startY = e.touches[0].clientY;
    currentY = startY;
    isDragging = true;
  }, { passive: true });

  playerFixo.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    currentY = e.touches[0].clientY;
  }, { passive: true });

  playerFixo.addEventListener('touchend', () => {
    if (!isDragging) return;
    if (startY - currentY > 50) abrirModal();
    isDragging = false;
  });

  // Mouse (Desktop)
  playerFixo.addEventListener('mousedown', (e) => {
    if (e.target.closest('button') || e.target.closest('input')) return;
    startY = e.clientY;
    currentY = startY;
    isDragging = true;
  });
}

window.addEventListener('mousemove', (e) => {
  if (!isDragging) return;
  currentY = e.clientY;
});

window.addEventListener('mouseup', () => {
  if (!isDragging) return;
  if (startY - currentY > 50) abrirModal();
  isDragging = false;
});

// ==========================================
// CONTROLE DO MODAL DIALOG
// ==========================================
function abrirModal() {
  if (dialog && !dialog.open) {
    dialog.showModal();
  }
}

function fecharModal() {
  if (dialog && dialog.open) {
    dialog.close();
  }
}

if (btnAbrirModal) btnAbrirModal.addEventListener('click', abrirModal);
if (btnFecharModal) btnFecharModal.addEventListener('click', fecharModal);

if (dialog) {
  dialog.addEventListener('click', (e) => {
    const rect = dialog.getBoundingClientRect();
    const isInDialog = (
      rect.top <= e.clientY && e.clientY <= rect.top + rect.height &&
      rect.left <= e.clientX && e.clientX <= rect.left + rect.width
    );
    if (!isInDialog) fecharModal();
  });
}

/*
AVANÇAR E RETORNAR MÚSICA
*/
const playlist = JSON.parse(localStorage.getItem('minhas_musicas'));

// 2. Variável para controlar a posição atual (começa na primeira música, índice 0)
//Controle da reprodução pela variável
//#######№############################
let indiceAtual = 0;


function MusicaAtual(musicaTocando) {
  indiceAtual = musicaTocando;
}
// 3. Função para tocar/exibir a música atual
function atualizarMusica() {
  const musicaAtual = playlist[indiceAtual];
  //let caminho = musicaAtual.caminho;
  reproduzir(musicaAtual.caminho, artista, urlCapa);
  console.log(`Caminho: ${musicaAtual.caminho}`);
}

// 4. Função para ir para a PRÓXIMA (+1)
function proximaMusica() {
  if (indiceAtual < playlist.length - 1) {
    indiceAtual++; // Avança um índice
  } else {
    indiceAtual = 0; // Se for a última, volta para a primeira (loop)
  }
  atualizarMusica();
}

// 5. Função para VOLTAR para a anterior (-1)
function musicaAnterior() {
  if (indiceAtual > 0) {
    indiceAtual--; // Volta um índice
  } else {
    indiceAtual = playlist.length - 1; // Se for a primeira, vai para a última
  }
  atualizarMusica();
}
// Detecta quando a música atual termina
audio.addEventListener('ended', () => {
    musicaAnterior();
});
