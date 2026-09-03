# HOD Creative — React

Migração do projeto HTML/CSS/JS para uma aplicação React + Vite com foco em **compatibilidade visual**.

## O que foi preservado
- Todas as imagens e SVGs originais em `public/IMG`
- Todos os CSS originais em `public/CSS`
- Parallax, reveal, tilt, spotlight, botões magnéticos e masonry
- Tema claro/escuro e preferência salva
- Banner de cookies e carregamento de Vimeo sob consentimento
- Galerias, filtros e lightbox das páginas de projetos
- Páginas: Home, Casamentos, Formaturas, Lingerie e Privacidade

## Executar
```bash
npm install
npm run dev
```

Para produção:
```bash
npm run build
npm run preview
```

A aplicação usa rotas SPA (`/`, `/casamentos`, `/formaturas`, `/lingerie`, `/privacidade`) e mantém os assets originais para minimizar regressões.
