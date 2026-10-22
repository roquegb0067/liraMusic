const visorPlaylists = document.getElementById('visorPlaylists');
let nomePlaylist = '';
let botoesPlaylists = `
<button onclick="playlists('${nomePlaylist}')" class="playlistBtn" type="button">${nomePlaylist}</button>`
async function playlists(playlistBuscada) {
  try {
    //const resposta = await fetch('http://127.0.0.1:8080/api/playlist/musicas');
    const resposta = await fetch('http://127.0.0.1:8080/api/musicas');
    if (!resposta.ok) {
      throw new Error(`Erro no servidor: ${resposta.status}`);
    }

    const respostaPlaylist = await resposta.json();

    visorPlaylists.innerHTML = "";

    [...respostaPlaylists].reverse().forEach(respostaPlaylist => {
      const nomerespostaPlaylist = respostaPlaylist.caminho.split('/').pop();

      const card = document.createElement('div');
      card.className = 'cardrespostaPlaylist';
      card.innerHTML = `<p class="titulorespostaPlaylist">${nomerespostaPlaylist}</p>`;
      
      // Usar addEventListener em vez de onclick inline
      card.addEventListener('click', () => {
        let respostaPlaylistTocando = respostaPlaylist.id;
        respostaPlaylistAtual(respostaPlaylistTocando);
      });
      
      visorPlaylists.appendChild(card);
    });

  } catch (erro) {
    console.error("Falha ao buscar músicas:", erro);
visorPlaylists.innerHTML = `<p style="color: red;">Erro ao carregar músicas.</p>`;
  }
}
