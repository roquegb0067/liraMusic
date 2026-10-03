// Elementos da Interface
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

// ==========================================
// DETECÇÃO DE ARRASTAR (SWIPE UP) NO RODAPÉ
// ==========================================
let startY = 0;
let currentY = 0;
let isDragging = false;

// Eventos Touch (Dispositivos Móveis)
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
  const deltaY = startY - currentY;

  // Se arrastou para cima mais de 50px, abre o modal
  if (deltaY > 50) {
    abrirModal();
  }
  isDragging = false;
});

// Eventos de Mouse (Para testes em Desktop)
playerFixo.addEventListener('mousedown', (e) => {
  // Evita disparar ao clicar diretamente em botões do player
  if (e.target.closest('button') || e.target.closest('input')) return;
  
  startY = e.clientY;
  currentY = startY;
  isDragging = true;
});

window.addEventListener('mousemove', (e) => {
  if (!isDragging) return;
  currentY = e.clientY;
});

window.addEventListener('mouseup', () => {
  if (!isDragging) return;
  const deltaY = startY - currentY;

  if (deltaY > 50) {
    abrirModal();
  }
  isDragging = false;
});

// ==========================================
// CONTROLE DE ABERTURA E FECHAMENTO DO MODAL
// ==========================================
function abrirModal() {
  if (!dialog.open) {
    dialog.showModal();
  }
}

function fecharModal() {
  if (dialog.open) {
    dialog.close();
  }
}

if (btnAbrirModal) btnAbrirModal.addEventListener('click', abrirModal);
if (btnFecharModal) btnFecharModal.addEventListener('click', fecharModal);

// Fechar ao clicar no fundo escuro do modal
dialog.addEventListener('click', (e) => {
  const rect = dialog.getBoundingClientRect();
  const isInDialog = (
    rect.top <= e.clientY && e.clientY <= rect.top + rect.height &&
    rect.left <= e.clientX && e.clientX <= rect.left + rect.width
  );
  if (!isInDialog) {
    fecharModal();
  }
});

// ==========================================
// LÓGICA DE ÁUDIO E CONTROLES
// ==========================================
function formatarTempo(segundos) {
  if (isNaN(segundos) || !isFinite(segundos)) return '0:00';
  const min = Math.floor(segundos / 60);
  const seg = Math.floor(segundos % 60);
  return `${min}:${seg < 10 ? '0' : ''}${seg}`;
}

function atualizarIcones(estaTocando) {
  iconesPlay.forEach(icon => icon.style.display = estaTocando ? 'none' : 'block');
  iconesPause.forEach(icon => icon.style.display = estaTocando ? 'block' : 'none');
}

btnsPlayPause.forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation(); // Evita abrir o modal ao clicar no Play
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

// Atualizar barra de progresso (Modal + Rodapé)
audio.addEventListener('timeupdate', () => {
  if (!audio.duration) return;
  const porcentagem = (audio.currentTime / audio.duration) * 100;
  
  barrasFill.forEach(fill => fill.style.width = `${porcentagem}%`);
  temposAtuais.forEach(tempo => tempo.textContent = formatarTempo(audio.currentTime));
});

audio.addEventListener('loadedmetadata', () => {
  temposTotais.forEach(tempo => tempo.textContent = formatarTempo(audio.duration));
});

// Clique nas barras de progresso para avançar/voltar
barrasBg.forEach(barra => {
  barra.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!audio.duration) return;
    const larguraTotal = barra.clientWidth;
    const cliqueX = e.offsetX;
    audio.currentTime = (cliqueX / larguraTotal) * audio.duration;
  });
});

// Controle de Volume
if (sliderVolume) {
  sliderVolume.addEventListener('input', (e) => {
    audio.volume = e.target.value;
  });
}

// Botões Curtir
btnsLike.forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    btn.classList.toggle('liked');
  });
});
