🎵 LiraMusic

Um aplicativo de música sem anúncios, focado em reproduzir músicas armazenadas diretamente no telefone.

O LiraMusic foi criado com a ideia de ter um player simples, rápido e sem depender de serviços de streaming ou conexão com a internet para ouvir suas músicas.

«🎧 Suas músicas. Seu player. Sem anúncios.»

---

✨ Funcionalidades

- 🎵 Reprodução de músicas armazenadas no telefone
- 📱 Funcionamento offline
- 🚫 Sem anúncios
- ▶️ Play / Pause
- ⏭️ Próxima música
- ⏮️ Música anterior
- 📃 Lista de músicas
- 🎚️ Player personalizado
- 🖼️ Interface própria
- 📱 Feito pensando em dispositivos Android

🚀 Futuramente

Algumas ideias planejadas para versões futuras:

- 🤖 Playlists personalizadas com IA
- 🧠 Recomendação de músicas baseada no histórico
- 🎶 Playlist automática com as músicas que mais combinam
- ⭐ Sistema de músicas favoritas
- 🔀 Modo aleatório inteligente
- 📊 Estatísticas de reprodução

---

🛠️ Tecnologias

O projeto utiliza diferentes tecnologias para construir o aplicativo e suas ferramentas de desenvolvimento.

🌐 Front-end

- HTML
- CSS
- JavaScript

🦀 Rust

Rust é utilizado em partes do projeto relacionadas ao backend e ferramentas auxiliares.

📱 Termux

O desenvolvimento e testes podem ser realizados diretamente no Android utilizando o Termux.

🔧 Termux:API

Utilizado para permitir que scripts e aplicações tenham acesso a recursos do Android.

---

📥 Downloads

Termux

Instale o Termux:

https://github.com/termux/termux-app/releases/tag/v0.118.3

Termux:API

Instale o Termux:API:

https://github.com/termux/termux-api/releases/tag/v0.53.0

«⚠️ O aplicativo Termux:API e o pacote "termux-api" precisam estar instalados/configurados quando utilizados recursos que dependem da integração com o Android.»

Rust

Instale o Rust:

LINK

Cargo

O Cargo é instalado junto com o Rust e é utilizado para gerenciar projetos e dependências Rust.

cargo --version

---

🚀 Instalação

Clone o repositório:

git clone https://github.com/roquegb0067/liraMusic.git

Entre na pasta:

cd liraMusic

Caso existam dependências Rust:

cargo build

Para executar:

cargo run

---

📱 Executando no Android

O LiraMusic pode ser desenvolvido e testado diretamente em um dispositivo Android utilizando o Termux.

Exemplo:

git clone https://github.com/roquegb0067/liraMusic.git
cd liraMusic
cargo run

Dependendo da versão do projeto, outras etapas de configuração podem ser necessárias.

---

📂 Estrutura do projeto

A estrutura pode variar conforme a versão, mas a ideia geral é:

LiraMusic/
├── src/
│   └── ...
├── static/
│   ├── css/
│   ├── js/
│   └── ...
├── Cargo.toml
├── Cargo.lock
└── README.md

---

🎯 Objetivo

O objetivo do LiraMusic é criar uma experiência de reprodução de música simples, livre de anúncios e independente de streaming.

A ideia é aproveitar as músicas que já estão armazenadas no dispositivo, sem precisar enviar a biblioteca pessoal para um serviço externo.

---

🤖 IA no LiraMusic

Uma das ideias para futuras versões é utilizar inteligência artificial para criar playlists personalizadas.

Por exemplo, o aplicativo poderá analisar as músicas reproduzidas recentemente e selecionar automaticamente um conjunto de músicas que tenham maior compatibilidade entre si.

Músicas recentes
       ↓
     IA 🤖
       ↓
Análise das músicas
       ↓
Playlist personalizada 🎵

A ideia é transformar o LiraMusic em mais do que um simples player: um player que aprende com a forma como o usuário escuta música.

---

📜 Licença

Este projeto é desenvolvido para fins de aprendizado e experimentação.

Consulte o arquivo "LICENSE" para obter informações sobre a licença do projeto.

---

👨‍💻 Desenvolvido por

Roque Gabriel

Projeto: LiraMusic 🎵

«Feito para ouvir música do meu jeito. Sem anúncios. Offline. 🚀»