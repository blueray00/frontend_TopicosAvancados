const imagensPorCategoria = {
  1: 'dolls',
  2: 'cars',
  3: 'games',
  4: 'plush',
  5: 'blocks',
}

function CardProduto({ produto, aoAdicionar, quantidadeNoCarrinho, aoEditar, aoExcluir, administrador }) {
  const esgotado = Number(produto.estoque) <= quantidadeNoCarrinho

  return (
    <article className="card">
      <div className="card-imagem">
        <img
          src={`/images/products/${imagensPorCategoria[produto.categoriaID] ?? 'dolls'}.jpg`}
          alt={`Foto ilustrativa de ${produto.nome}`}
          loading="lazy"
        />
        <span className="selo">IMAGEM ILUSTRATIVA</span>
      </div>

      <div className="card-conteudo">
        <h3>{produto.nome}</h3>

        <p className="descricao">
          {produto.descricao}
        </p>

        <div className="preco">
          R$ {Number(produto.preco).toFixed(2)}
        </div>

        <div className="card-final">
          <span className="estoque">
            {produto.estoque} disponíveis
          </span>

          <button
            className="adicionar-carrinho"
            type="button"
            disabled={esgotado}
            onClick={() => aoAdicionar(produto)}
          >
            {esgotado ? 'Estoque esgotado' : 'Adicionar ao carrinho'}
          </button>
        </div>

        {administrador && (
          <div className="acoes-admin">
            <button
              type="button"
              onClick={() => aoEditar(produto)}
            >
              Editar
            </button>

            <button
              type="button"
              onClick={() => aoExcluir(produto)}
            >
              Excluir
            </button>
          </div>
        )}
      </div>
    </article>
  )
}

export default CardProduto