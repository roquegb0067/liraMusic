if ('mediaSession' in navigator) {
  // 1. Mudar a cor: O Android extrai a cor da imagem definida em 'artwork'
  navigator.mediaSession.metadata = new MediaMetadata({
    title: 'LiraMusic',
    artist: 'Nome do Artista',
    album: 'Nome do Álbum',
    artwork: [
      { src: 'https://seu-servidor.com/capa-com-a-sua-cor.png', sizes: '512x512', type: 'image/png' }
    ]
  });

  // 2. Adicionar botões adicionais (Anterior, Próximo, etc.)
  navigator.mediaSession.setActionHandler('play', () => {
    // Lógica para reproduzir
  });

  navigator.mediaSession.setActionHandler('pause', () => {
    // Lógica para pausar
  });

  navigator.mediaSession.setActionHandler('previoustrack', () => {
    // Lógica para faixa anterior
  });

  navigator.mediaSession.setActionHandler('nexttrack', () => {
    // Lógica para próxima faixa
  });

  navigator.mediaSession.setActionHandler('seekbackward', (details) => {
    // Lógica para recuar (ex: 10 segundos)
  });

  navigator.mediaSession.setActionHandler('seekforward', (details) => {
    // Lógica para avançar (ex: 10 segundos)
  });
}
