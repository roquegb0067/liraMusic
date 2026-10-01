use walkdir::WalkDir;

fn main() {
    let caminho_inicial = ".";

    for entrada in WalkDir::new(caminho_inicial) {
        match entrada {
            Ok(e) => {
                // 1. Garante que é um arquivo
                if e.file_type().is_file() {
                    // 2. Extrai a extensão do arquivo
                    if let Some(extensao) = e.path().extension() {
                        // 3. Compara se a extensão é mp3 ou m4a
                        if extensao == "mp3" || extensao == "m4a" {
                            println!("{}", e.path().display());
                        }
                    }
                }
            }
            Err(erro) => eprintln!("Erro ao acessar entrada: {}", erro),
        }
    }
}
