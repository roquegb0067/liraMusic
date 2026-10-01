use std::fs;

fn main() -> std::io::Result<()> {
    let caminho = ""; // Diretório atual

    for entrada in fs::read_dir(caminho)? {
        let entrada = entrada?;
        let caminho_arquivo = entrada.path();
        
        if let Some(nome) = caminho_arquivo.file_name() {
            println!("{:?}", nome);
        }
    }

    Ok(())
}
