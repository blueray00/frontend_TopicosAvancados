function CardProduto({ produto }) {
  return (
    <article className="card">

      <div className="card-imagem">

        <span className="selo">
          DESTAQUE
        </span>

        <div className="brinquedo">
          🧸
        </div>

      </div>

      <div className="card-conteudo">

        <div className="estrelas">
          ★★★★★
        </div>

        <h3>{produto.nome}</h3>

        <p className="descricao">
          {produto.descricao}
        </p>

        <div className="preco-antigo">
          R$ {(Number(produto.preco) * 1.2).toFixed(2)}
        </div>

        <div className="preco">
          R$ {Number(produto.preco).toFixed(2)}
        </div>

        <div className="pix">
          até 5% OFF no Pix
        </div>

        <div className="card-final">
          <span className="estoque">
            {produto.estoque} disponíveis
          </span>
        </div>

      </div>

    </article>
  )
}

export default CardProduto