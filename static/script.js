async function carregarMusicas() {
  try {
    const resposta = await fetch('http://127.0.0.1:8080/api/musicas');
    
    if (!resposta.ok) {
      throw new Error(`Erro no servidor: ${resposta.status}`);
    }

    // O JSON vira um array nativo de objetos JS
    const musicas = await resposta.json(); 
   console.log(`Músicas recebidas do Rust: ${musicas}`)

    // Exemplo de renderização no console ou DOM
    musicas.forEach(musica => {
      document.getElementById('visor').innerHTML=`<p>[ID ${musica.id}] Caminho: ${musica.caminho}</p>`;
    });
  } catch (erro) {
    console.error("Falha ao buscar músicas:", erro);
  }
}

