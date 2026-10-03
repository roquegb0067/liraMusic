// Variável global para guardar a lista de músicas que veio do banco Rust
let listaDeMusicasGlobal = [];

function extrairDadosDoCaminho(caminhoOriginal) {
  let nomeArquivo = caminhoOriginal.split('/').pop();

  const poluidores = [
    /\.m4a\(/i, /\.mp3\)/i, /GR6 Explode/gi, /Clipe Oficial/gi, 
    /Vídeo Oficial/gi, /Official Video/gi, /Video Clipe Oficial/gi, 
    /Video Clipe/gi, /kondzilla\.com/gi, /Love Funk/gi, /Web Clipe/gi,
    /M4A₁₂₈K/gi, /_320K\)/gi, /COM GRAVE/gi, /instrumental bass/gi, 
    /ELETROFUNK ISSO É DESANDE/gi, /ELETROFUNK/gi, /Prod\..*?\)/gi, /Feat\..*?\)/gi,
    /Legendado\s+PT_BR/gi, /Legendado/gi
  ];

  poluidores.forEach(reg => {
    nomeArquivo = nomeArquivo.replace(reg, "");
  });

  nomeArquivo = nomeArquivo.replace(/\s+/g, " ").trim();
  nomeArquivo = nomeArquivo.replace(/[🥵|🇧🇷|🔌|🔥|🐊|🎶]+/g, "").trim();

  let artista = "Vários Artistas";
  let musica = nomeArquivo;

  const partes = nomeArquivo.split(/\s+[-–—_]\s+|\s+[-–—_]|[–—_]\s+/);

  if (partes.length >= 2) {
    const primeiroTermo = partes[0].trim();
    if (["BARBIE", "VIDRO FUMÊ"].includes(primeiroTermo.toUpperCase())) {
      musica = primeiroTermo;
      artista = partes.slice(1).join(" & ").trim();
    } else {
      artista = primeiroTermo;
      musica = partes.slice(1).join(" - ").trim();
    }
  } else {
    if (nomeArquivo.toLowerCase().includes("mtg")) {
      artista = "MTG";
      musica = nomeArquivo.replace(/mtg/gi, "").trim();
    }
  }

  artista = artista.replace(/^[-_\s]+|[-_\s]+\$/g, "").trim();
  musica = musica.replace(/^[-_\s\(\)]+|[-_\s\(\)]+\$/g, "").trim();

  return { artista, musica };
}

// 1. Variável global onde as músicas do backend serão armazenadas
let listaDeMusicasGlobal = [];

// 2. Função auxiliar para extrair e limpar o Artista e Nome da Música a partir do caminho
function extrairDadosDoCaminho(caminho) {
  if (!caminho) return { artista: "Desconhecido", musica: "Sem título" };

  // Pega apenas o nome do arquivo (sem pastas)
  let nomeArquivo = caminho.split('/').pop();

  // Remove a extensão do arquivo (ex: .m4a, .mp3)
  nomeArquivo = nomeArquivo.replace(/\.[^/.]+$/, "");

  // Remove sufixos comuns de downloads do Snaptube/YouTube, como (M4A_128K), (Legendado), etc.
  nomeArquivo = nomeArquivo.replace(/\(.*?\)/g, "").replace(/\[.*?\]/g, "").trim();

  // Tenta separar pelo padrão "Artista - Música"
  const partes = nomeArquivo.split(" - ");
  if (partes.length >= 2) {
    return {
      artista: partes[0].trim(),
      musica: partes.slice(1).join(" - ").trim()
    };
  }

  return {
    artista: "Artista Desconhecido",
    musica: nomeArquivo.trim()
  };
}

// 3. Função para formatar segundos em M:SS (ex: 125s -> 2:05)
function formatarTempo(segundos) {
  if (isNaN(segundos) || segundos === Infinity) return "0:00";
  const min = Math.floor(segundos / 60);
  const seg = Math.floor(segundos % 60);
  return `${min}:${seg < 10 ? '0' : ''}${seg}`;
}

// 4. Função principal de reprodução
function tocar(id) {
  const musicaSelecionada = listaDeMusicasGlobal.find(m => m.id === id);
  if (!musicaSelecionada) return;

  const playerAudio = document.getElementById("meu-audio");
  const playerTitulo = document.querySelector(".player-titulo");
  const playerArtista = document.querySelector(".player-artista");

  // Ajusta o caminho estático
  const nomeDoArquivo = musicaSelecionada.caminho.split('/').pop();
  playerAudio.src = `/static/${nomeDoArquivo}`;

  // Atualiza nome e artista no player
  const metadadosLimpos = extrairDadosDoCaminho(musicaSelecionada.caminho);
  playerTitulo.innerText = metadadosLimpos.musica;
  playerArtista.innerText = metadadosLimpos.artista;

  // Inicia a reprodução
  playerAudio.play()
    .then(() => alterVisualBotaoPlay(true))
    .catch(erro => console.error("Erro ao reproduzir áudio:", erro));
}

// 5. Carregar músicas do backend (Rust)
async function carregarMusicas() {
  try {
    const resposta = await fetch('http://127.0.0.1:8080/api/musicas');
    
    if (!resposta.ok) {
      throw new Error(`Erro no servidor: ${resposta.status}`);
    }
    
    listaDeMusicasGlobal = await resposta.json();
    
    const visor = document.getElementById('listaMusicasVisor');
    if (visor) {
      visor.innerHTML = "";
      
      listaDeMusicasGlobal.forEach(musica => {
        const dadosTratados = extrairDadosDoCaminho(musica.caminho);

        visor.innerHTML += `
        <div onclick="tocar(${musica.id})" class="cardMusica" style="cursor: pointer;">
           <p class="tituloMusica">${dadosTratados.musica}</p>
           <p class="artistaMusica" style="font-size: 0.85em; color: #b3b3b3;">${dadosTratados.artista}</p>
        </div>`;
      });
    }
    
  } catch (erro) {
    console.error("Falha ao buscar músicas:", erro);
    const visor = document.getElementById('listaMusicasVisor');
    if (visor) {
      visor.innerHTML = `<p style="color: red;">Erro ao carregar músicas.</p>`;
    }
  }
}

// 6. Eventos do Player (Play/Pause, Progresso e Volume)
const btnPlayPause = document.getElementById("btn-play-pause");
const meuAudio = document.getElementById("meu-audio");
const barraFill = document.getElementById("barra-progresso-fill");
const barraBg = document.getElementById("barra-progresso-bg");
const tempoAtualSpan = document.getElementById("tempo-atual");
const tempoTotalSpan = document.getElementById("tempo-total");
const sliderVolume = document.getElementById("slider-volume");

// Clique no botão Play/Pause
btnPlayPause.addEventListener("click", () => {
  if (meuAudio.paused) {
    meuAudio.play();
    alterVisualBotaoPlay(true);
  } else {
    meuAudio.pause();
    alterVisualBotaoPlay(false);
  }
});

// Atualiza o ícone visual
function alterVisualBotaoPlay(estaTocando) {
  const iconePlay = document.getElementById("icone-play");
  const iconePause = document.getElementById("icone-pause");

  if (estaTocando) {
    iconePlay.style.display = "none";
    iconePause.style.display = "block";
  } else {
    iconePlay.style.display = "block";
    iconePause.style.display = "none";
  }
}

// Atualiza a duração total assim que o arquivo carrega
meuAudio.addEventListener("loadedmetadata", () => {
  tempoTotalSpan.innerText = formatarTempo(meuAudio.duration);
});

// Atualiza o tempo atual e a barra de preenchimento a cada segundo
meuAudio.addEventListener("timeupdate", () => {
  if (meuAudio.duration) {
    const porcentagem = (meuAudio.currentTime / meuAudio.duration) * 100;
    barraFill.style.width = `${porcentagem}%`;
    tempoAtualSpan.innerText = formatarTempo(meuAudio.currentTime);
  }
});

// Permite clicar na barra para ir a qualquer ponto da música
if (barraBg) {
  barraBg.addEventListener("click", (e) => {
    const rect = barraBg.getBoundingClientRect();
    const posicaoClique = e.clientX - rect.left;
    const larguraTotal = rect.width;
    const porcentagem = posicaoClique / larguraTotal;
    if (meuAudio.duration) {
      meuAudio.currentTime = porcentagem * meuAudio.duration;
    }
  });
}

// Controle de volume
if (sliderVolume) {
  sliderVolume.addEventListener("input", (e) => {
    meuAudio.volume = e.target.value;
  });
}

// Reset do botão quando a música termina
meuAudio.addEventListener("ended", () => {
  alterVisualBotaoPlay(false);
  barraFill.style.width = "0%";
  tempoAtualSpan.innerText = "0:00";
});

// Inicialização
carregarMusicas();
// 1. Variável global onde as músicas do backend serão armazenadas
let listaDeMusicasGlobal = [];

// 2. Função auxiliar para extrair e limpar o Artista e Nome da Música a partir do caminho
function extrairDadosDoCaminho(caminho) {
  if (!caminho) return { artista: "Desconhecido", musica: "Sem título" };

  // Pega apenas o nome do arquivo (sem pastas)
  let nomeArquivo = caminho.split('/').pop();

  // Remove a extensão do arquivo (ex: .m4a, .mp3)
  nomeArquivo = nomeArquivo.replace(/\.[^/.]+$/, "");

  // Remove sufixos comuns de downloads do Snaptube/YouTube, como (M4A_128K), (Legendado), etc.
  nomeArquivo = nomeArquivo.replace(/\(.*?\)/g, "").replace(/\[.*?\]/g, "").trim();

  // Tenta separar pelo padrão "Artista - Música"
  const partes = nomeArquivo.split(" - ");
  if (partes.length >= 2) {
    return {
      artista: partes[0].trim(),
      musica: partes.slice(1).join(" - ").trim()
    };
  }

  return {
    artista: "Artista Desconhecido",
    musica: nomeArquivo.trim()
  };
}

// 3. Função para formatar segundos em M:SS (ex: 125s -> 2:05)
function formatarTempo(segundos) {
  if (isNaN(segundos) || segundos === Infinity) return "0:00";
  const min = Math.floor(segundos / 60);
  const seg = Math.floor(segundos % 60);
  return `${min}:${seg < 10 ? '0' : ''}${seg}`;
}

// 4. Função principal de reprodução
function tocar(id) {
  const musicaSelecionada = listaDeMusicasGlobal.find(m => m.id === id);
  if (!musicaSelecionada) return;

  const playerAudio = document.getElementById("meu-audio");
  const playerTitulo = document.querySelector(".player-titulo");
  const playerArtista = document.querySelector(".player-artista");

  // Ajusta o caminho estático
  const nomeDoArquivo = musicaSelecionada.caminho.split('/').pop();
  playerAudio.src = `/static/${nomeDoArquivo}`;

  // Atualiza nome e artista no player
  const metadadosLimpos = extrairDadosDoCaminho(musicaSelecionada.caminho);
  playerTitulo.innerText = metadadosLimpos.musica;
  playerArtista.innerText = metadadosLimpos.artista;

  // Inicia a reprodução
  playerAudio.play()
    .then(() => alterVisualBotaoPlay(true))
    .catch(erro => console.error("Erro ao reproduzir áudio:", erro));
}

// 5. Carregar músicas do backend (Rust)
async function carregarMusicas() {
  try {
    const resposta = await fetch('http://127.0.0.1:8080/api/musicas');
    
    if (!resposta.ok) {
      throw new Error(`Erro no servidor: ${resposta.status}`);
    }
    
    listaDeMusicasGlobal = await resposta.json();
    
    const visor = document.getElementById('listaMusicasVisor');
    if (visor) {
      visor.innerHTML = "";
      
      listaDeMusicasGlobal.forEach(musica => {
        const dadosTratados = extrairDadosDoCaminho(musica.caminho);

        visor.innerHTML += `
        <div onclick="tocar(${musica.id})" class="cardMusica" style="cursor: pointer;">
           <p class="tituloMusica">${dadosTratados.musica}</p>
           <p class="artistaMusica" style="font-size: 0.85em; color: #b3b3b3;">${dadosTratados.artista}</p>
        </div>`;
      });
    }
    
  } catch (erro) {
    console.error("Falha ao buscar músicas:", erro);
    const visor = document.getElementById('listaMusicasVisor');
    if (visor) {
      visor.innerHTML = `<p style="color: red;">Erro ao carregar músicas.</p>`;
    }
  }
}

// 6. Eventos do Player (Play/Pause, Progresso e Volume)
const btnPlayPause = document.getElementById("btn-play-pause");
const meuAudio = document.getElementById("meu-audio");
const barraFill = document.getElementById("barra-progresso-fill");
const barraBg = document.getElementById("barra-progresso-bg");
const tempoAtualSpan = document.getElementById("tempo-atual");
const tempoTotalSpan = document.getElementById("tempo-total");
const sliderVolume = document.getElementById("slider-volume");

// Clique no botão Play/Pause
btnPlayPause.addEventListener("click", () => {
  if (meuAudio.paused) {
    meuAudio.play();
    alterVisualBotaoPlay(true);
  } else {
    meuAudio.pause();
    alterVisualBotaoPlay(false);
  }
});

// Atualiza o ícone visual
function alterVisualBotaoPlay(estaTocando) {
  const iconePlay = document.getElementById("icone-play");
  const iconePause = document.getElementById("icone-pause");

  if (estaTocando) {
    iconePlay.style.display = "none";
    iconePause.style.display = "block";
  } else {
    iconePlay.style.display = "block";
    iconePause.style.display = "none";
  }
}

// Atualiza a duração total assim que o arquivo carrega
meuAudio.addEventListener("loadedmetadata", () => {
  tempoTotalSpan.innerText = formatarTempo(meuAudio.duration);
});

// Atualiza o tempo atual e a barra de preenchimento a cada segundo
meuAudio.addEventListener("timeupdate", () => {
  if (meuAudio.duration) {
    const porcentagem = (meuAudio.currentTime / meuAudio.duration) * 100;
    barraFill.style.width = `${porcentagem}%`;
    tempoAtualSpan.innerText = formatarTempo(meuAudio.currentTime);
  }
});

// Permite clicar na barra para ir a qualquer ponto da música
if (barraBg) {
  barraBg.addEventListener("click", (e) => {
    const rect = barraBg.getBoundingClientRect();
    const posicaoClique = e.clientX - rect.left;
    const larguraTotal = rect.width;
    const porcentagem = posicaoClique / larguraTotal;
    if (meuAudio.duration) {
      meuAudio.currentTime = porcentagem * meuAudio.duration;
    }
  });
}

// Controle de volume
if (sliderVolume) {
  sliderVolume.addEventListener("input", (e) => {
    meuAudio.volume = e.target.value;
  });
}

// Reset do botão quando a música termina
meuAudio.addEventListener("ended", () => {
  alterVisualBotaoPlay(false);
  barraFill.style.width = "0%";
  tempoAtualSpan.innerText = "0:00";
});

// Inicialização
carregarMusicas();
