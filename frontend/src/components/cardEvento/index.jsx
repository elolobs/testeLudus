import "./cardEvento.css"

export default function CardEvento({
    // titulo, 
    // descricao,
    // imagem,
    // preco
}) {
    return (
        <>
            <div className="card-wrapper">
                <h2>{titulo}</h2>
                <img src={"/img-produtos/" + imagem} alt="" />
                <p>{descricao}</p>
                <p>Preço: R$ <b>{preco}</b> </p>
            </div>
        </>
    )
}