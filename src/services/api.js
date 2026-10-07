export async function fazerLogin(email, senha) {
  const resposta = await fetch('http://localhost:5236/api/Auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: email,
      senha: senha
    })
  })

  const dados = await resposta.json()

  if (!resposta.ok) {
    throw new Error(dados.mensagem || 'Erro ao fazer login')
  }

  return dados
}

export async function buscarProdutos(token) {
  const resposta = await fetch('http://localhost:5236/api/Produtos', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  const dados = await resposta.json()

  return dados
}

export async function buscarCategorias(token) {
  const resposta = await fetch('http://localhost:5236/api/Categorias', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  const dados = await resposta.json()

  return dados
}

export async function cadastrarProduto(token, produto) {
  const resposta = await fetch('http://localhost:5236/api/Produtos', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(produto),
  })

  const dados = await resposta.json()

  if (!resposta.ok) {
    throw new Error('Não foi possível cadastrar o produto')
  }

  return dados
}

export async function atualizarProduto(token, id, produto) {
  const resposta = await fetch(
    `http://localhost:5236/api/Produtos/${id}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(produto)
    }
  )

  if (!resposta.ok) {
    const mensagem = await resposta.text()
    console.log('ERRO DO PUT:', resposta.status, mensagem)
    throw new Error(`Erro ${resposta.status}: ${mensagem}`)
  }
}

export async function excluirProduto(token, id) {
  const resposta = await fetch(
    `http://localhost:5236/api/Produtos/${id}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  )

  if (!resposta.ok) {
    throw new Error('Não foi possível excluir o produto')
  }
}