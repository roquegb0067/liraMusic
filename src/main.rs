use rusqlite::{params, Connection, Result};
use std::env;
use walkdir::WalkDir;
mod server_music;


#[derive(Debug)]
struct Musica {
    caminho: String,
}
#[tokio::main]
async fn main() -> Result<()> {
    let mut conn = Connection::open("musicas.db")?;

    // 1. MANTENHA AQUI: Garante que a tabela exista antes de qualquer leitura ou escrita
    conn.execute(
        "CREATE TABLE IF NOT EXISTS musicas (
            id INTEGER PRIMARY KEY,
            caminho TEXT NOT NULL UNIQUE
         )",
        [],
    )?;

    // 2. Checa se o usuário digitou `--sync` ao executar
    let sincronizar = env::args().any(|arg| arg == "--sync");

    if sincronizar {
        println!("Sincronizando novas músicas da pasta...");
        //Atualizar os repositórios de músicas
        let pasta_musicas = "/data/data/com.termux/files/home/storage/shared/snaptube/download/SnapTube Audio";
        let musicas_encontradas = buscar_musicas(pasta_musicas);
        println!("Encontradas {} músicas no disco.", musicas_encontradas.len());

        let tx = conn.transaction()?;
        {
            let mut stmt = tx.prepare("INSERT OR IGNORE INTO musicas (caminho) VALUES (?1)")?;
            for musica in musicas_encontradas {
                stmt.execute(params![musica.caminho])?;
            }
        }
        tx.commit()?;
        println!("Sincronização concluída com sucesso!");
    } else {
        println!("Modo leitura ativado. Para atualizar o banco, use a: cargo run -- --sync
");
    }

    // 3. Inicia a aplicação/servidor
    println!("Iniciando a aplicação...");

    // Chama a função assíncrona do servidor
    server_music::iniciar().await;

    Ok(())
}

fn buscar_musicas(diretorio: &str) -> Vec<Musica> {
    let mut lista = Vec::new();

    for entrada in WalkDir::new(diretorio).into_iter().filter_map(|e| e.ok()) {
        let caminho = entrada.path();
        if caminho.is_file() {
            if let Some(ext) = caminho.extension() {
                if ext == "mp3" || ext == "flac" || ext == "m4a" {
                    lista.push(Musica {
                        caminho: caminho.display().to_string(),
                    });
                }
            }
        }
    }
    lista
}
