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
function reproduzir(caminho, artista = "Desconhecido", urlCapa = null) {
  if (!caminho) {
    console.error('Caminho da música não fornecido');
    return;
  }

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
