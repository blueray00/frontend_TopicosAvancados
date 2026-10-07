import { useEffect, useState } from 'react'
import { fazerLogin, buscarProdutos, buscarCategorias, cadastrarProduto, atualizarProduto, excluirProduto } from './services/api'
import CardProduto from './components/CardProduto'
import './App.css'

function App() {
  const [produtos, setProdutos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [token, setToken] = useState(null)
  const [perfil, setPerfil] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erroLogin, setErroLogin] = useState('')
  const [categoriaSelecionada, setCategoriaSelecionada] = useState(null)
  const [textoBusca, setTextoBusca] = useState('')
  const [busca, setBusca] = useState('')
  const [carrinho, setCarrinho] = useState([])
  const [carrinhoAberto, setCarrinhoAberto] = useState(false)
  const [cadastroAberto, setCadastroAberto] = useState(false)
  const [produtoEditando, setProdutoEditando] = useState(null)
  const [novoProduto, setNovoProduto] = useState({
    categoriaID: '',
    nome: '',
    descricao: '',
    preco: '',
    estoque: '',
    ativo: 'S',
  })

  useEffect(() => {
    if (!token) {
      return
    }

    buscarProdutos(token)
      .then((dados) => {
        setProdutos(dados)
      })

    buscarCategorias(token)
      .then((dados) => {
        setCategorias(dados)
      })
  }, [token])

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

  async function entrar() {
    try {
      setErroLogin('')

      const dados = await fazerLogin(email, senha)

      setToken(dados.token)
      setPerfil(dados.perfil)
    } catch (erro) {
      setErroLogin(erro.message)
    }
  }

  async function cadastrarNovoProduto(evento) {
    evento.preventDefault()

    try {
      const dadosProduto = {
        categoriaID: Number(novoProduto.categoriaID),
        nome: novoProduto.nome,
        descricao: novoProduto.descricao,
        preco: Number(novoProduto.preco),
        estoque: Number(novoProduto.estoque),
        ativo: novoProduto.ativo
      }

      if (produtoEditando) {
        await atualizarProduto(
          token,
          produtoEditando.produtoID,
          {
            produtoID: produtoEditando.produtoID,
            categoriaID: Number(novoProduto.categoriaID),
            nome: novoProduto.nome,
            descricao: novoProduto.descricao,
            preco: Number(novoProduto.preco),
            estoque: Number(novoProduto.estoque),
            ativo: novoProduto.ativo
          }
        )

        setProdutos((lista) =>
          lista.map((produto) =>
            produto.produtoID === produtoEditando.produtoID
              ? {
                  ...produto,
                  ...dadosProduto
                }
              : produto
          )
        )
      } else {
        const produto = await cadastrarProduto(
          token,
          dadosProduto
        )

        setProdutos((lista) => [...lista, produto])
      }

      setNovoProduto({
        categoriaID: '',
        nome: '',
        descricao: '',
        preco: '',
        estoque: '',
        ativo: 'S'
      })

      setProdutoEditando(null)
      setCadastroAberto(false)

    } catch (erro) {
      alert(erro.message)
    }
  }
  function editarProduto(produto) {
    setProdutoEditando(produto)

    setNovoProduto({
      categoriaID: produto.categoriaID,
      nome: produto.nome,
      descricao: produto.descricao,
      preco: produto.preco,
      estoque: produto.estoque,
      ativo: produto.ativo
    })

    setCadastroAberto(true)
  }

  async function removerProduto(produto) {
    const confirmar = window.confirm(
      `Deseja excluir o produto "${produto.nome}"?`
    )

    if (!confirmar) {
      return
    }

    try {
      await excluirProduto(token, produto.produtoID)

      setProdutos((lista) =>
        lista.filter(
          (item) => item.produtoID !== produto.produtoID
        )
      )

    } catch (erro) {
      alert(erro.message)
    }
  }

  return (
    <div className="app">

      {!token ? (
        <main className="login">
          <h1>🧸 MinhaLoja</h1>

          <h2>Entrar</h2>

          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(evento) => setEmail(evento.target.value)}
          />

          <input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(evento) => setSenha(evento.target.value)}
          />

          <button type="button" onClick={entrar}>
            Entrar
          </button>

          {erroLogin && (
            <p>{erroLogin}</p>
          )}

          <small>
            Admin: admin@brincafacil.com / 123456
            <br />
            Cliente: cliente@brincafacil.com / 123456
          </small>
        </main>
      ) : (
        <>
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
              <span className="contador-carrinho">
                {quantidadeNoCarrinho}
              </span>
            </button>

            {perfil === 'Administrador' && (
              <button
                className="botao-cadastrar"
                type="button"
                onClick={() => setCadastroAberto(true)}
              >
                Cadastrar produto
              </button>
            )}
          </header>

          {cadastroAberto && perfil === 'Administrador' && (
            <section className="cadastro-produto">
              <h2>{produtoEditando ? 'Editar produto' : 'Cadastrar produto'}</h2>

              <form onSubmit={cadastrarNovoProduto}>

                <select
                  value={novoProduto.categoriaID}
                  onChange={(evento) =>
                    setNovoProduto({
                      ...novoProduto,
                      categoriaID: evento.target.value
                    })
                  }
                  required
                >
                  <option value="">Selecione uma categoria</option>

                  {categorias.map((categoria) => (
                    <option
                      key={categoria.categoriaID}
                      value={categoria.categoriaID}
                    >
                      {categoria.nome}
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  placeholder="Nome do produto"
                  value={novoProduto.nome}
                  onChange={(evento) =>
                    setNovoProduto({
                      ...novoProduto,
                      nome: evento.target.value
                    })
                  }
                  required
                />

                <input
                  type="text"
                  placeholder="Descrição"
                  value={novoProduto.descricao}
                  onChange={(evento) =>
                    setNovoProduto({
                      ...novoProduto,
                      descricao: evento.target.value
                    })
                  }
                  required
                />

                <input
                  type="number"
                  placeholder="Preço"
                  value={novoProduto.preco}
                  onChange={(evento) =>
                    setNovoProduto({
                      ...novoProduto,
                      preco: evento.target.value
                    })
                  }
                  required
                />

                <input
                  type="number"
                  placeholder="Estoque"
                  value={novoProduto.estoque}
                  onChange={(evento) =>
                    setNovoProduto({
                      ...novoProduto,
                      estoque: evento.target.value
                    })
                  }
                  required
                />

                <div>
                  <button type="submit">
                    {produtoEditando ? 'Salvar alterações' : 'Cadastrar'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setCadastroAberto(false)}
                  >
                    Cancelar
                  </button>
                </div>

              </form>
            </section>
          )}

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
                        carrinho.filter(
                          (item) => item.produtoID === produto.produtoID
                        ).length
                      }
                      aoEditar={editarProduto}
                      aoExcluir={removerProduto}
                      administrador={perfil === 'Administrador'}
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
                  <p className="carrinho-vazio">
                    Seu carrinho está vazio.
                  </p>
                ) : (
                  <>
                    <ul className="itens-carrinho">
                      {carrinho.map((item) => {
                        const produto = produtos.find(
                          (produto) =>
                            produto.produtoID === item.produtoID
                        )

                        if (!produto) return null

                        return (
                          <li
                            className="item-carrinho"
                            key={item.produtoID}
                          >
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
                                  onClick={() =>
                                    removerDoCarrinho(
                                      produto.produtoID
                                    )
                                  }
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
                                  onClick={() =>
                                    alterarQuantidade(
                                      produto.produtoID,
                                      -1
                                    )
                                  }
                                >
                                  −
                                </button>

                                <span>{item.quantidade}</span>

                                <button
                                  type="button"
                                  aria-label={`Aumentar quantidade de ${produto.nome}`}
                                  disabled={
                                    item.quantidade >=
                                    Number(produto.estoque)
                                  }
                                  onClick={() =>
                                    alterarQuantidade(
                                      produto.produtoID,
                                      1
                                    )
                                  }
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
                      Carrinho demonstrativo. A finalização do pedido
                      ainda não está disponível.
                    </p>
                  </>
                )}
              </aside>
            </>
          )}

          <footer className="rodape">
            <div>
              <strong>🧸 MinhaLoja</strong>
              <p>
                Diversão, criatividade e brincadeiras para todos.
              </p>
            </div>

            <span>© 2026 MinhaLoja</span>
          </footer>
        </>
      )}

    </div>
  )
}

export default App