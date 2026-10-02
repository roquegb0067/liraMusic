use axum::{extract::State, http::StatusCode, routing::get, Json, Router};
use r2d2::Pool;
use r2d2_sqlite::SqliteConnectionManager;
use serde::Serialize;
use tower_http::{
    cors::{Any, CorsLayer},
    services::ServeDir,
};

// Estrutura de dados que o Axum transformará automaticamente em JSON
#[derive(Serialize)]
struct Musica {
    id: i32,
    caminho: String,
}

// Tipo customizado para facilitar o compartilhamento do banco com as rotas
type DbPool = Pool<SqliteConnectionManager>;


pub async fn iniciar() {
    
    let manager = SqliteConnectionManager::file("musicas.db");
    let pool = Pool::new(manager).expect("Falha ao criar o pool de banco de dados");

    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any);

    let app = Router::new()
    .route("/api/musicas", get(listar_musicas))
    // 1. Adicione o serviço de arquivos estáticos primeiro
    .nest_service("/static", ServeDir::new("static"))
    // 2. Aplique as camadas (layers) que afetam todas as rotas acima
    .layer(cors)
    // 3. Feche com o estado por último
    .with_state(pool); // O ponto e vírgula vai APENAS aqui no final


    let listener = tokio::net::TcpListener::bind("127.0.0.1:8080").await.unwrap();
    println!("Servidor rodando em http://localhost:8080");
    axum::serve(listener, app).await.unwrap();
}

// Handler da rota do Axum
async fn listar_musicas(
    State(pool): State<DbPool>,
) -> Result<Json<Vec<Musica>>, (StatusCode, String)> {
    // Adquire uma conexão disponível do Pool
    let conn = pool.get().map_err(|e| {
        (StatusCode::INTERNAL_SERVER_ERROR, e.to_string())
    })?;

    // Busca os registros no banco de dados SQLite
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

    // Retorna o vetor dentro do tipo Json do Axum (Gera status 200 OK e Content-Type: application/json)
    Ok(Json(musicas))
}
