import "./cardEvento.css"
import Link from "next/link";

export default function CardEvento({
    id,
    imagem,
    categoria,
    dia,
    mes,
    titulo,
    local
}) {
    return (
        <Link href={`/eventos/${id}`} className="card-evento-link">
            <div className="card-evento">
                <div className="card-imagem-wrapper">
                    <span className="tag-categoria">{categoria}</span>
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
                            <i className="fa-solid fa-location-dot icone-pin"></i> {local}
                        </p>
                    </div>
                </div>
            </div>
        </Link>
    )
}