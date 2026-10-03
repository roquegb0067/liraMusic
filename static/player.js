const audio = document.getElementById('meu-audio');
const btnPlayPause = document.getElementById('btn-play-pause');
const iconePlay = document.getElementById('icone-play');
const iconePause = document.getElementById('icone-pause');
const barraFill = document.getElementById('barra-progresso-fill');
const barraBg = document.getElementById('barra-progresso-bg');
const tempoAtual = document.getElementById('tempo-atual');
const tempoTotal = document.getElementById('tempo-total');
const sliderVolume = document.getElementById('slider-volume');

// Formatar segundos em formato MM:SS
function formatarTempo(segundos) {
  const min = Math.floor(segundos / 60);
  const seg = Math.floor(segundos % 60);
  return `${min}:${seg < 10 ? '0' : ''}${seg}`;
}

// Dar Play ou Pause
btnPlayPause.addEventListener('click', () => {
  if (audio.paused) {
    audio.play();
    iconePlay.style.display = 'none';
    iconePause.style.display = 'block';
  } else {
    audio.pause();
    iconePlay.style.display = 'block';
    iconePause.style.display = 'none';
  }
});

// Atualizar barra de carregamento e cronômetro
audio.addEventListener('timeupdate', () => {
  const porcentagem = (audio.currentTime / audio.duration) * 100;
  barraFill.style.width = `${porcentagem}%`;
  tempoAtual.textContent = formatarTempo(audio.currentTime);
});

// Carregar tempo total da música assim que o arquivo carregar
audio.addEventListener('loadedmetadata', () => {
  tempoTotal.textContent = formatarTempo(audio.duration);
});

// Permitir clicar na barra para avançar ou voltar a música
barraBg.addEventListener('click', (e) => {
  const larguraTotal = barraBg.clientWidth;
  const cliqueX = e.offsetX;
  const duracao = audio.duration;
  audio.currentTime = (cliqueX / larguraTotal) * duracao;
});

// Controlar Volume
sliderVolume.addEventListener('input', (e) => {
  audio.volume = e.target.value;
});
// Adicione essa parte no final do script que você já tinha:
const btnLike = document.getElementById('btn-like');

btnLike.addEventListener('click', () => {
  btnLike.classList.toggle('liked');
});
// Recuperar a lista do localStorage (retorna array vazio se não existir)
function obterMusicasDoStorage() {
  const dados = localStorage.getItem('minhas_musicas');
  return dados ? JSON.parse(dados) : [];
}
function passarAudioReproducao(audio_clicado) {

}
function reproduzir(audio_play_autual) {
  document.getElementById('rep_audio').innerHTML=`<audio id="meu-audio" src="${audio_play_autual}"></audio>`
}