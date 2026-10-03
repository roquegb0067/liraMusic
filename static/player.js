const audio = document.getElementById('meu-audio');
const btnPlayPause = document.getElementById('btn-play-pause');
const iconePlay = document.getElementById('icone-play');
const iconePause = document.getElementById('icone-pause');
const barraFill = document.getElementById('barra-progresso-fill');
const barraBg = document.getElementById('barra-progresso-bg');
const tempoAtual = document.getElementById('tempo-atual');
const tempoTotal = document.getElementById('tempo-total');
const sliderVolume = document.getElementById('slider-volume');
const btnLike = document.getElementById('btn-like');
const elemTitulo = document.getElementById('player-titulo');
const elemArtista = document.getElementById('player-artista');

// Formatar segundos em formato MM:SS
function formatarTempo(segundos) {
  if (isNaN(segundos) || !isFinite(segundos)) return '0:00';
  const min = Math.floor(segundos / 60);
  const seg = Math.floor(segundos % 60);
  return `${min}:${seg < 10 ? '0' : ''}${seg}`;
}

// Atualizar exibição dos ícones
function atualizarIcones(estaTocando) {
  iconePlay.style.display = estaTocando ? 'none' : 'block';
  iconePause.style.display = estaTocando ? 'block' : 'none';
}

// Alternar entre Play e Pause
btnPlayPause.addEventListener('click', () => {
  if (!audio.src) return; // Não faz nada se não houver música carregada
  if (audio.paused) {
    audio.play();
  } else {
    audio.pause();
  }
});

// Sincronizar ícones com o estado do áudio
audio.addEventListener('play', () => atualizarIcones(true));
audio.addEventListener('pause', () => atualizarIcones(false));

// Atualizar barra de progresso e tempo decorrido
audio.addEventListener('timeupdate', () => {
  if (!audio.duration) return;
  const porcentagem = (audio.currentTime / audio.duration) * 100;
  barraFill.style.width = `${porcentagem}%`;
  tempoAtual.textContent = formatarTempo(audio.currentTime);
});

// Carregar duração total do áudio
audio.addEventListener('loadedmetadata', () => {
  tempoTotal.textContent = formatarTempo(audio.duration);
});

// Clique na barra para avançar/voltar
barraBg.addEventListener('click', (e) => {
  if (!audio.duration) return;
  const larguraTotal = barraBg.clientWidth;
  const cliqueX = e.offsetX;
  audio.currentTime = (cliqueX / larguraTotal) * audio.duration;
});

// Controle de Volume
sliderVolume.addEventListener('input', (e) => {
  audio.volume = e.target.value;
});

// Botão Curtir
btnLike.addEventListener('click', () => {
  btnLike.classList.toggle('liked');
});

// Obter lista do localStorage
function obterMusicasDoStorage() {
  const dados = localStorage.getItem('minhas_musicas');
  return dados ? JSON.parse(dados) : [];
}

// Extrair nome da música do caminho completo
function extrairNomeMusica(caminho) {
  return caminho.split('/').pop();
}

// Trocar de faixa e atualizar interface
function reproduzir(caminho) {
  if (!caminho) return;

  audio.src = caminho;
  
  // Extrair e atualizar o nome da música no player
  const nomeMusica = extrairNomeMusica(caminho);
  if (elemTitulo) elemTitulo.textContent = nomeMusica;

  audio.play().catch(err => console.error('Erro ao reproduzir o áudio:', err));
}
