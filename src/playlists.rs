use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
    routing::{get, post, delete},
    Json, Router,
};
use r2d2::Pool;
use r2d2_sqlite::SqliteConnectionManager;
use rusqlite::params;
use serde::{Deserialize, Serialize};
use tower_http::cors::CorsLayer;

#[derive(Clone)]
struct AppState {
    db_pool: Pool<SqliteConnectionManager>,
}

// Modelos de Dados
#[derive(Serialize, Deserialize, Debug)]
struct Playlist {
    id: i64,
    nome: String,
}

#[derive(Deserialize)]
struct CriarPlaylistPayload {
    nome: String,
}

#[derive(Serialize, Deserialize, Debug)]
struct Musica {
    id: i64,
    caminho: String,
}

#[derive(Deserialize)]
struct PlaylistMusicaPayload {
    playlist_id: i64,
    musica_id: i64,
}

#[derive(Deserialize)]
struct QueryPlaylist {
    id: Option<i64>,
    playlist: Option<String>,
}

#[tokio::main]
async fn main() {
    // 1. Configurar Conexão e Pool SQLite
    let manager = SqliteConnectionManager::file("liramusic.db");
    let pool = Pool::new(manager).expect("Falha ao criar o pool de conexões do SQLite");

    // Inicializar tabelas do Banco de Dados se não existirem
    let conn = pool.get().expect("Falha ao obter conexão do pool");
    conn.execute(
        "CREATE TABLE IF NOT EXISTS playlists (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL UNIQUE
        )",
        [],
    ).unwrap();

    conn.execute(
        "CREATE TABLE IF NOT EXISTS musicas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            caminho TEXT NOT NULL UNIQUE
        )",
        [],
    ).unwrap();

    conn.execute(
        "CREATE TABLE IF NOT EXISTS playlist_musicas (
            playlist_id INTEGER,
            musica_id INTEGER,
            PRIMARY KEY (playlist_id, musica_id),
            FOREIGN KEY(playlist_id) REFERENCES playlists(id) ON DELETE CASCADE,
            FOREIGN KEY(musica_id) REFERENCES musicas(id) ON DELETE CASCADE
        )",
        [],
    ).unwrap();

    drop(conn); // Libera a conexão inicial

    let state = AppState { db_pool: pool };

    // 2. Configurar Rotas do Axum e CORS
    let app = Router::new()
        .route("/api/playlists", get(listar_playlists).post(criar_playlist))
        .route("/api/musicas", get(listar_musicas))
        .route("/api/playlist/musicas", get(listar_musicas_da_playlist))
        .route("/api/playlist/adicionar", post(adicionar_musica_playlist))
        .route("/api/playlist/remover", delete(remover_musica_playlist))
        .layer(CorsLayer::permissive()) // Libera CORS para o frontend testar localmente
        .with_state(state);

    let listener = tokio::net::TcpListener::bind("127.0.0.1:8080").await.unwrap();
    println!("Servidor rodando em http://127.0.0.1:8080");
    
    axum::serve(listener, app).await.unwrap();
}

// --- HANDLERS DA API ---

// GET /api/playlists - Retorna todas as playlists
async fn listar_playlists(State(state): State<AppState>) -> Result<Json<Vec<Playlist>>, StatusCode> {
    let conn = state.db_pool.get().map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    let mut stmt = conn.prepare("SELECT id, nome FROM playlists").map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    let playlists = stmt.query_map([], |row| {
        Ok(Playlist {
            id: row.get(0)?,
            nome: row.get(1)?,
        })
    }).map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
      .filter_map(|r| r.ok())
      .collect();

    Ok(Json(playlists))
}

// POST /api/playlists - Cria uma nova playlist
async fn criar_playlist(
    State(state): State<AppState>,
    Json(payload): Json<CriarPlaylistPayload>,
) -> Result<StatusCode, StatusCode> {
    let conn = state.db_pool.get().map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    let res = conn.execute(
        "INSERT INTO playlists (nome) VALUES (?1)",
        params![payload.nome],
    );

    match res {
        Ok(_) => Ok(StatusCode::CREATED),
        Err(_) => Ok(StatusCode::BAD_REQUEST), // Provavelmente nome duplicado
    }
}

// GET /api/musicas - Retorna todas as músicas disponíveis no sistema
async fn listar_musicas(State(state): State<AppState>) -> Result<Json<Vec<Musica>>, StatusCode> {
    let conn = state.db_pool.get().map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    let mut stmt = conn.prepare("SELECT id, caminho FROM musicas").map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    let musicas = stmt.query_map([], |row| {
        Ok(Musica {
            id: row.get(0)?,
            caminho: row.get(1)?,
        })
    }).map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
      .filter_map(|r| r.ok())
      .collect();

    Ok(Json(musicas))
}

// GET /api/playlist/musicas?id=X (ou ?playlist=Nome) - Retorna as músicas de uma playlist
async fn listar_musicas_da_playlist(
    State(state): State<AppState>,
    Query(query): Query<QueryPlaylist>,
) -> Result<Json<Vec<Musica>>, StatusCode> {
    let conn = state.db_pool.get().map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let mut stmt;
    let musicas = if let Some(id) = query.id {
        stmt = conn.prepare(
            "SELECT m.id, m.caminho FROM musicas m
             JOIN playlist_musicas pm ON m.id = pm.musica_id
             WHERE pm.playlist_id = ?1"
        ).map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
        
        stmt.query_map(params![id], |row| {
            Ok(Musica { id: row.get(0)?, caminho: row.get(1)? })
        }).map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
          .filter_map(|r| r.ok())
          .collect()
    } else if let Some(nome_playlist) = query.playlist {
        stmt = conn.prepare(
            "SELECT m.id, m.caminho FROM musicas m
             JOIN playlist_musicas pm ON m.id = pm.musica_id
             JOIN playlists p ON p.id = pm.playlist_id
             WHERE p.nome = ?1"
        ).map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
        
        stmt.query_map(params![nome_playlist], |row| {
            Ok(Musica { id: row.get(0)?, caminho: row.get(1)? })
        }).map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
          .filter_map(|r| r.ok())
          .collect()
    } else {
        return Err(StatusCode::BAD_REQUEST);
    };

    Ok(Json(musicas))
}

// POST /api/playlist/adicionar - Adiciona uma música a uma playlist
async fn adicionar_musica_playlist(
    State(state): State<AppState>,
    Json(payload): Json<PlaylistMusicaPayload>,
) -> Result<StatusCode, StatusCode> {
    let conn = state.db_pool.get().map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let res = conn.execute(
        "INSERT OR IGNORE INTO playlist_musicas (playlist_id, musica_id) VALUES (?1, ?2)",
        params![payload.playlist_id, payload.musica_id],
    );

    match res {
        Ok(_) => Ok(StatusCode::OK),
        Err(_) => Err(StatusCode::INTERNAL_SERVER_ERROR),
    }
}

// DELETE /api/playlist/remover - Remove uma música de uma playlist
async fn remover_musica_playlist(
    State(state): State<AppState>,
    Json(payload): Json<PlaylistMusicaPayload>,
) -> Result<StatusCode, StatusCode> {
    let conn = state.db_pool.get().map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let res = conn.execute(
        "DELETE FROM playlist_musicas WHERE playlist_id = ?1 AND musica_id = ?2",
        params![payload.playlist_id, payload.musica_id],
    );

    match res {
        Ok(_) => Ok(StatusCode::OK),
        Err(_) => Err(StatusCode::INTERNAL_SERVER_ERROR),
    }
}
