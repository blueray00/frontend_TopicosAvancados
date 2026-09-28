import { useEffect, useState } from 'react'
import { buscarProdutos, buscarCategorias } from './services/api'
import CardProduto from './components/CardProduto'
import './App.css'

function App() {
  const [produtos, setProdutos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [categoriaSelecionada, setCategoriaSelecionada] = useState(null)
  const [textoBusca, setTextoBusca] = useState('')
  const [busca, setBusca] = useState('')
  const [carrinho, setCarrinho] = useState([])
  const [carrinhoAberto, setCarrinhoAberto] = useState(false)

  useEffect(() => {
    buscarProdutos()
      .then((dados) => {
        setProdutos(dados)
      })

    buscarCategorias()
      .then((dados) => {
        setCategorias(dados)
      })
  }, [])

  function realizarBusca(evento) {
    evento.preventDefault()
    setBusca(textoBusca)
  }

  function voltarInicio() {
    setCategoriaSelecionada(null)
    setTextoBusca('')
    setBusca('')
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  function limparFiltros() {
    setCategoriaSelecionada(null)
    setTextoBusca('')
    setBusca('')
  }

  function selecionarCategoria(id) {
    setCategoriaSelecionada(id)
    setBusca('')
    setTextoBusca('')
  }

  function adicionarAoCarrinho(produto) {
    setCarrinho((itens) => {
      const itemExistente = itens.find(
        (item) => item.produtoID === produto.produtoID,
      )

      if (itemExistente?.quantidade >= Number(produto.estoque)) {
        return itens
      }

      if (itemExistente) {
        return itens.map((item) =>
          item.produtoID === produto.produtoID
            ? { ...item, quantidade: item.quantidade + 1 }
            : item,
        )
      }

      return [...itens, { produtoID: produto.produtoID, quantidade: 1 }]
    })
  }

  function alterarQuantidade(produtoID, variacao) {
    setCarrinho((itens) =>
      itens
        .map((item) =>
          item.produtoID === produtoID
            ? { ...item, quantidade: item.quantidade + variacao }
            : item,
        )
        .filter((item) => item.quantidade > 0),
    )
  }

  function removerDoCarrinho(produtoID) {
    setCarrinho((itens) =>
      itens.filter((item) => item.produtoID !== produtoID),
    )
  }

  const quantidadeNoCarrinho = carrinho.reduce(
    (total, item) => total + item.quantidade,
    0,
  )

  const totalCarrinho = carrinho.reduce((total, item) => {
    const produto = produtos.find((produto) => produto.produtoID === item.produtoID)
    return total + (produto ? Number(produto.preco) * item.quantidade : 0)
  }, 0)

  const produtosFiltrados = produtos.filter((produto) => {
    const pertenceCategoria =
      categoriaSelecionada === null ||
      produto.categoriaID === categoriaSelecionada

    const correspondeBusca =
      produto.nome.toLowerCase().includes(busca.toLowerCase())

    return pertenceCategoria && correspondeBusca
  })

  return (
    <div className="app">
      <header className="cabecalho">
        <button
          className="logo"
          type="button"
          onClick={voltarInicio}
          aria-label="Voltar para o início"
        >
          <span className="logo-icone">🧸</span>

          <strong className="logo-nome">MinhaLoja</strong>
        </button>
        <form className="barra-busca" onSubmit={realizarBusca}>
          <input
            type="text"
            placeholder="Busque por brinquedos..."
            value={textoBusca}
            onChange={(evento) => setTextoBusca(evento.target.value)}
          />

          <button
            type="submit"
            aria-label="Pesquisar"
          >
            🔍
          </button>
        </form>
        <button
          className="botao-carrinho"
          type="button"
          onClick={() => setCarrinhoAberto(true)}
          aria-label={`Abrir carrinho, ${quantidadeNoCarrinho} itens`}
        >
          <span aria-hidden="true">🛒</span>
          Carrinho
          <span className="contador-carrinho">{quantidadeNoCarrinho}</span>
        </button>
      </header>

      <nav className="menu" aria-label="Categorias de produtos">
        <button
          type="button"
          className={
            categoriaSelecionada === null && busca === ''
              ? 'menu-ativo'
              : ''
          }
          onClick={voltarInicio}
        >
          Início
        </button>

        {categorias.map((categoria) => (
          <button
            type="button"
            key={categoria.categoriaID}
            className={
              categoriaSelecionada === categoria.categoriaID
                ? 'menu-ativo'
                : ''
            }
            onClick={() => selecionarCategoria(categoria.categoriaID)}
          >
            {categoria.nome}
          </button>
        ))}
      </nav>

      <main>
        <section className="produtos-section">
          <div className="titulo-produtos">
            <div>
              <h2>
                {busca
                  ? `Resultados para "${busca}"`
                  : categoriaSelecionada === null
                    ? 'Mais procurados'
                    : 'Produtos da categoria'}
              </h2>

            </div>
            <span className="quantidade">
              {produtosFiltrados.length} produtos
            </span>
          </div>

          {produtosFiltrados.length === 0 ? (

            <div className="sem-produtos">
              <span>🔎</span>
              <h3>Nenhum brinquedo encontrado</h3>
              <p>Tente buscar por outro nome ou categoria.</p>
              <button
                type="button"
                onClick={limparFiltros}
              >
                Ver todos os brinquedos
              </button>
            </div>

          ) : (

            <div className="produtos">
              {produtosFiltrados.map((produto) => (
                <CardProduto
                  key={produto.produtoID}
                  produto={produto}
                  aoAdicionar={adicionarAoCarrinho}
                  quantidadeNoCarrinho={
                    carrinho.find((item) => item.produtoID === produto.produtoID)
                      ?.quantidade ?? 0
                  }
                />
              ))}
            </div>

          )}
        </section>
      </main>

      {carrinhoAberto && (
        <>
          <button
            className="carrinho-overlay"
            type="button"
            aria-label="Fechar carrinho"
            onClick={() => setCarrinhoAberto(false)}
          />
          <aside
            className="painel-carrinho"
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-carrinho"
          >
            <div className="cabecalho-carrinho">
              <div>
                <h2 id="titulo-carrinho">Meu carrinho</h2>
                <span>{quantidadeNoCarrinho} itens</span>
              </div>
              <button
                className="fechar-carrinho"
                type="button"
                aria-label="Fechar carrinho"
                onClick={() => setCarrinhoAberto(false)}
              >
                ×
              </button>
            </div>

            {carrinho.length === 0 ? (
              <p className="carrinho-vazio">Seu carrinho está vazio.</p>
            ) : (
              <>
                <ul className="itens-carrinho">
                  {carrinho.map((item) => {
                    const produto = produtos.find(
                      (produto) => produto.produtoID === item.produtoID,
                    )

                    if (!produto) return null

                    return (
                      <li className="item-carrinho" key={item.produtoID}>
                        <img
                          src={`/images/products/${
                            {
                              1: 'dolls',
                              2: 'cars',
                              3: 'games',
                              4: 'plush',
                              5: 'blocks',
                            }[produto.categoriaID] ?? 'dolls'
                          }.jpg`}
                          alt=""
                        />
                        <div className="detalhes-item-carrinho">
                          <div className="nome-item-carrinho">
                            <h3>{produto.nome}</h3>
                            <button
                              type="button"
                              aria-label={`Remover ${produto.nome} do carrinho`}
                              onClick={() => removerDoCarrinho(produto.produtoID)}
                            >
                              Remover
                            </button>
                          </div>
                          <strong>
                            R$ {Number(produto.preco).toFixed(2)}
                          </strong>
                          <div className="controles-quantidade">
                            <button
                              type="button"
                              aria-label={`Diminuir quantidade de ${produto.nome}`}
                              onClick={() => alterarQuantidade(produto.produtoID, -1)}
                            >
                              −
                            </button>
                            <span>{item.quantidade}</span>
                            <button
                              type="button"
                              aria-label={`Aumentar quantidade de ${produto.nome}`}
                              disabled={item.quantidade >= Number(produto.estoque)}
                              onClick={() => alterarQuantidade(produto.produtoID, 1)}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </li>
                    )
                  })}
                </ul>
                <div className="total-carrinho">
                  <span>Total</span>
                  <strong>
                    R$ {totalCarrinho.toFixed(2)}
                  </strong>
                </div>
                <p className="aviso-carrinho">
                  Carrinho demonstrativo. A finalização do pedido ainda não está disponível.
                </p>
              </>
            )}
          </aside>
        </>
      )}

      <footer className="rodape">
        <div>
          <strong>🧸 MinhaLoja</strong>
          <p>Diversão, criatividade e brincadeiras para todos.</p>
        </div>
        <span>© 2026 MinhaLoja</span>
      </footer>
    </div>
  )
}

export default App