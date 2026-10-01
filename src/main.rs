use rusqlite::{params, Connection, Result};
use std::path::PathBuf;
use walkdir::WalkDir;

// 1. Estrutura para representar sua música
#[derive(Debug)]
struct Musica {
    caminho: String,
}

fn main() -> Result<()> {
    // 2. Inicializa o banco SQLite (salva em arquivo ou :memory: para testes)
    let mut conn = Connection::open("musicas.db")?;
    
    // Cria a tabela se ela não existir
    conn.execute(
        "CREATE TABLE IF NOT EXISTS musicas (
            id INTEGER PRIMARY KEY,
            caminho TEXT NOT NULL UNIQUE
         )",
        [],
    )?;

    // 3. Varre as pastas e coleta os arquivos de música
    let pasta_musicas = "C:\\Users\\SeuUsuario\\Music"; // Altere para a sua pasta
    println!("Varrendo pastas...");
    let musicas_encontradas = buscar_musicas(pasta_musicas);
    println!("Encontradas {} músicas.", musicas_encontradas.len());

    // 4. Abordagem Performática: Salva tudo dentro de uma única TRANSAÇÃO
    let tx = conn.transaction()?;
    {
        let mut stmt = tx.prepare("INSERT OR IGNORE INTO musicas (caminho) VALUES (?1)")?;
        
        for musica in musicas_encontradas {
            stmt.execute(params![musica.caminho])?;
        }
    }
    tx.commit()?; // Confirma todas as inserções de uma só vez

    println!("Todas as músicas foram salvas no SQLite com sucesso!");
    Ok(())
}

// Função auxiliar para buscar os arquivos
fn buscar_musicas(diretorio: &str) -> Vec<Musica> {
    let mut lista = Vec::new();

    // WalkDir varre a pasta atual e TODAS as subpastas automaticamente
    for entrada in WalkDir::new(diretorio).into_iter().filter_map(|e| e.ok()) {
        let caminho = entrada.path();
        
        // Verifica se é um arquivo e se tem extensão de áudio (ex: mp3, flac)
        if caminho.is_file() {
            if let Some(ext) = caminho.extension() {
                if ext == "mp3" || ext == "flac" || ext == "m4a" {
                    lista.push(Musica {
                        // Converte o caminho com display() para evitar erros de UTF-8
                        caminho: caminho.display().to_string(),
                    });
                }
            }
        }
    }
    lista
}
