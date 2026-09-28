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
                />
              ))}
            </div>

          )}
        </section>
      </main>

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