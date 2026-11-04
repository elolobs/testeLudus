import "./cardEvento.css"

export default function CardEvento({
    imagem,
    categoria,
    dia,
    mes,
    titulo,
    local
}) {
    return (
        <div className="card-evento">
          
            <div className="card-imagem-wrapper">
                <span className="tag-categoria">{categoria}</span>
                <button className="btn-favoritar" aria-label="Favoritar">♡</button>
                <img src={imagem} alt={`Imagem do evento ${titulo}`} className="imagem-evento" />
            </div>

            
            <div className="card-info-wrapper">
                <div className="card-data">
                    <span className="data-dia">{dia}</span>
                    <span className="data-mes">{mes}</span>
                </div>
                
                <div className="card-detalhes">
                    <h3 className="evento-titulo">{titulo}</h3>
                    <p className="evento-local">
                        <span className="icone-pin">📍</span> {local}
                    </p>
                </div>
            </div>

           
            <button className="btn-ver-mais">Ver Mais</button>
        </div>
    )
}