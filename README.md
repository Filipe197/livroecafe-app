# ☕ Livro & Café — PWA

App web progressivo (PWA) para a plataforma Livro & Café.

## Como rodar localmente

```bash
npm install
npm run dev
```

## Como fazer build para produção

```bash
npm run build
```
Os arquivos prontos ficam na pasta `dist/`.

## Como hospedar gratuitamente

### Opção 1 — Netlify (recomendado, mais fácil)
1. Crie conta em https://netlify.com
2. Arraste a pasta `dist/` para o painel do Netlify
3. Pronto! Seu app estará online em segundos

### Opção 2 — Vercel
1. Crie conta em https://vercel.com
2. Conecte seu repositório GitHub
3. Defina: Build Command = `npm run build`, Output = `dist`
4. Deploy automático a cada push

## Como instalar como app no celular

### Android (Chrome)
1. Acesse o site no Chrome
2. Toque nos 3 pontinhos (menu)
3. "Adicionar à tela inicial"

### iPhone (Safari)
1. Acesse o site no Safari
2. Toque no ícone de compartilhar (quadrado com seta)
3. "Adicionar à Tela de Início"

## Estrutura do projeto

```
src/
  pages/
    Home.jsx        — Tela inicial
    Catalog.jsx     — Catálogo de livros
    BookDetail.jsx  — Detalhes do livro
    Read.jsx        — Leitor de livros
    Profile.jsx     — Perfil do usuário
  data/
    books.js        — Dados dos livros (substituir pela API)
  App.jsx           — Roteamento e nav bar
  index.css         — Estilos globais
```

## Próximos passos sugeridos
- Conectar a uma API real de livros (livroecafe.com.br)
- Adicionar autenticação de usuário
- Implementar sistema de favoritos com localStorage
- Integrar leitor de e-books (epub.js)
