use axum::{
    body::Body,
    extract::{Query, State},
    http::{Request, StatusCode},
    response::IntoResponse,
    routing::get,
    Json, Router,
};
use r2d2::Pool;
use r2d2_sqlite::SqliteConnectionManager;
use serde::{Deserialize, Serialize};
use std::path::Path;
use tower::ServiceExt;
use tower_http::{
    cors::{Any, CorsLayer},
    services::{ServeDir, ServeFile},
};

// Estrutura de dados para retorno das músicas em JSON
#[derive(Serialize)]
struct Musica {
    id: i32,
    caminho: String,
}

// Estrutura para capturar a Query String (?path=...)
#[derive(Deserialize)]
struct StreamQuery {
    path: String,
}

// Tipo customizado para o Pool do SQLite
type DbPool = Pool<SqliteConnectionManager>;

pub async fn iniciar() {
    let manager = SqliteConnectionManager::file("musicas.db");
    let pool = Pool::new(manager).expect("Falha ao criar o pool de banco de dados");

    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any);

    let app = Router::new()
        // Rotas da API
        .route("/api/musicas", get(listar_musicas))
        .route("/api/musicas/stream", get(stream_audio))
        // Arquivos estáticos
        .nest_service("/static", ServeDir::new("static"))
        // Middlewares / Camadas
        .layer(cors)
        .with_state(pool);

    let listener = tokio::net::TcpListener::bind("127.0.0.1:8080")
        .await
        .unwrap();

    println!("Servidor rodando em http://localhost:8080");
    axum::serve(listener, app).await.unwrap();
}

// Handler para listar todas as músicas
async fn listar_musicas(
    State(pool): State<DbPool>,
) -> Result<Json<Vec<Musica>>, (StatusCode, String)> {
    let conn = pool
        .get()
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    let mut stmt = conn
        .prepare("SELECT id, caminho FROM musicas")
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    let musica_iter = stmt
        .query_map([], |row| {
            Ok(Musica {
                id: row.get(0)?,
                caminho: row.get(1)?,
            })
        })
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    let mut musicas = Vec::new();
    for musica in musica_iter {
        if let Ok(m) = musica {
            musicas.push(m);
        }
    }

    Ok(Json(musicas))
}

// Handler para fazer o streaming do arquivo de áudio
async fn stream_audio(
    Query(query): Query<StreamQuery>,
    req: Request<Body>,
) -> impl IntoResponse {
    let file_path = Path::new(&query.path);

    // Verifica se o arquivo físico existe no disco
    if !file_path.exists() {
        return (StatusCode::NOT_FOUND, "Arquivo de áudio não encontrado").into_response();
    }

    // ServeFile gerencia requisições parciais (Range), Content-Type e chunking
    let service = ServeFile::new(file_path);

    match service.oneshot(req).await {
        Ok(response) => response.into_response(),
        Err(err) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            format!("Erro ao ler o arquivo: {}", err),
        )
            .into_response(),
    }
}
