// Elementos Globais
const audio = document.getElementById('meu-audio');
const modal = document.getElementById('reprodutorModal');
const btnFecharModal = document.getElementById('btn-fechar-modal');
const capaWrapper = document.getElementById('capa-wrapper');
const customPlayerFooter = document.querySelector('.custom-player');

// Seleção de múltiplos elementos (Modal + Footer Compacto)
const btnsPlayPause = document.querySelectorAll('.main-play, #btn-play-pause');
const iconesPlay = document.querySelectorAll('.icone-play');
const iconesPause = document.querySelectorAll('.icone-pause');
const barrasFill = document.querySelectorAll('.barra-fill');
const barrasBg = document.querySelectorAll('.barra-interativa');
const temposAtuais = document.querySelectorAll('.tempo-atual');
const temposTotais = document.querySelectorAll('.tempo-total');
const elemsTitulo = document.querySelectorAll('.player-titulo');
const elemsArtista = document.querySelectorAll('.player-artista');
const btnsLike = document.querySelectorAll('.btn-like');
const sliderVolume = document.querySelector('.volume-slider');

// Formata os segundos em formato MM:SS
function formatarTempo(segundos) {
  if (isNaN(segundos) || !isFinite(segundos)) return '0:00';
  const min = Math.floor(segundos / 60);
  const seg = Math.floor(segundos % 60);
  return `${min}:${seg < 10 ? '0' : ''}${seg}`;
}

// Atualiza o texto de múltiplos elementos de uma só vez
function atualizarTexto(elementos, texto) {
  elementos.forEach(elem => {
    elem.textContent = texto;
  });
}

// Sincroniza a exibição dos ícones de Play/Pause em ambas as telas
function atualizarIcones(estaTocando) {
  iconesPlay.forEach(icone => icone.style.display = estaTocando ? 'none' : 'block');
  iconesPause.forEach(icone => icone.style.display = estaTocando ? 'block' : 'none');
}

// Injeta a capa do álbum dinamicamente
function atualizarCapa(srcCapa) {
  if (capaWrapper) {
    capaWrapper.innerHTML = `<img class="capa-art" src="${srcCapa}" alt="Capa do Álbum" />`;
  }
}

// Atualiza todas as informações da música atual na UI
function atualizarDadosPlayer({ titulo, artista, capa }) {
  if (titulo) atualizarTexto(elemsTitulo, titulo);
  if (artista) atualizarTexto(elemsArtista, artista);
  if (capa) atualizarCapa(capa);
}

// Alternar entre Play e Pause
function alternarPlayPause() {
  if (!audio.src) return;
  if (audio.paused) {
    audio.play();
  } else {
    audio.pause();
  }
}

// Event Listeners para os botões de Play/Pause
btnsPlayPause.forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation(); // Impede abrir o modal ao clicar no play do footer
    alternarPlayPause();
  });
});

// Eventos de estado do Áudio
audio.addEventListener('play', () => atualizarIcones(true));
audio.addEventListener('pause', () => atualizarIcones(false));

// Atualiza barras de progresso e tempo decorrido simultaneamente
audio.addEventListener('timeupdate', () => {
  if (!audio.duration) return;
  const porcentagem = (audio.currentTime / audio.duration) * 100;
  
  barrasFill.forEach(fill => fill.style.width = `${porcentagem}%`);
  atualizarTexto(temposAtuais, formatarTempo(audio.currentTime));
});

// Atualiza a duração total assim que os metadados forem carregados
audio.addEventListener('loadedmetadata', () => {
  atualizarTexto(temposTotais, formatarTempo(audio.duration));
});

// Clique em qualquer uma das barras de progresso para avançar/voltar
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

// Botões de Curtir (sincronizados em ambas as visões)
btnsLike.forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const estadoAtual = btn.classList.contains('liked');
    btnsLike.forEach(b => b.classList.toggle('liked', !estadoAtual));
  });
});

// Função principal de reprodução dinâmica via API ou caminho
function reproduzir(caminho, tituloCustom, artistaCustom, capaCustom) {
  if (!caminho) return;

  const urlStream = `http://127.0.0.1:8080/api/musicas/stream?path=${encodeURIComponent(caminho)}`;
  const nomeMusica = tituloCustom || caminho.split('/').pop().replace(/\.[^/.]+$/, "");

  // Atualiza HTML dinamicamente
  atualizarDadosPlayer({
    titulo: nomeMusica,
    artista: artistaCustom || "Marino",
    capa: capaCustom || "/MVP/static/Screenshot_20261001_233241_Instagram.jpg"
  });

  audio.src = urlStream;
  audio.play().catch(err => console.error('Erro ao reproduzir o áudio:', err));
}

// Abrir Modal ao clicar no Player Fixo
if (customPlayerFooter && modal) {
  customPlayerFooter.addEventListener('click', () => {
    modal.showModal();
  });
}

// Fechar Modal
if (btnFecharModal && modal) {
  btnFecharModal.addEventListener('click', (e) => {
    e.stopPropagation();
    modal.close();
  });
}

// Inicialização de teste com a imagem padrão
atualizarCapa("/MVP/static/Screenshot_20261001_233241_Instagram.jpg");
