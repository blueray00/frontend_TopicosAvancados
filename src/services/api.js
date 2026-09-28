export async function buscarProdutos() {
  const resposta = await fetch('/api/Produtos')

  const dados = await resposta.json()

  return dados
}

export async function buscarCategorias() {
  const resposta = await fetch('/api/Categorias')

  const dados = await resposta.json()

  return dados
}