# Petshop Frontend

Frontend administrativo completo para o sistema de petshop, desenvolvido com React + Vite, integrado ao backend REST com autenticacao JWT, dashboard e CRUDs responsivos.

## O que este projeto entrega

- login com protecao de rotas privadas
- sessao persistida com token JWT
- dashboard com indicadores e servicos recentes
- CRUD de donos
- CRUD de pets com associacao ao dono
- CRUD de tipos de servico
- CRUD de servicos realizados
- layout administrativo moderno e responsivo
- componentes reutilizaveis e integracao centralizada com Axios

## Tecnologias utilizadas

- React
- Vite
- JavaScript
- React Router
- Axios
- Lucide React
- Context API para autenticacao e notificacoes

## Requisitos

- Node.js 18+
- npm
- Backend do petshop rodando localmente

## Como instalar

```bash
npm install
```

## Como configurar a URL da API

1. Copie o arquivo de exemplo:

```bash
Copy-Item .env.example .env
```

2. Ajuste a variavel abaixo, se necessario:

```env
VITE_API_URL=http://localhost:3000/api
```

## Como executar

Modo desenvolvimento:

```bash
npm run dev
```

Build de producao:

```bash
npm run build
```

Preview local do build:

```bash
npm run preview
```

## Credenciais de teste

Se voce estiver usando o backend seedado:

- email: `admin@petshop.local`
- senha: `admin123`

## Estrutura do projeto

```text
src/
|-- components/
|   |-- common/
|   `-- layout/
|-- context/
|-- hooks/
|-- layouts/
|-- pages/
|-- routes/
|-- services/
|-- styles/
`-- utils/
```

## Principais funcionalidades

### Autenticacao

- tela de login com feedback visual
- redirecionamento para rotas privadas
- logout com limpeza de sessao
- envio automatico do token via interceptor Axios

### Dashboard

- cards com totais do sistema
- indicadores resumidos
- ultimos servicos realizados

### Donos

- listagem com busca
- cadastro e edicao em modal
- exclusao com confirmacao
- visualizacao de detalhes e pets vinculados

### Pets

- listagem com busca
- cadastro com associacao ao dono
- edicao e exclusao
- visualizacao de detalhes e historico recente

### Tipos de servico

- cadastro de servicos base do petshop
- busca, edicao e exclusao

### Servicos realizados

- cadastro com pet, tipo de servico, data, valor e status
- filtros simples por busca e status
- edicao e exclusao

## Observacoes

- O frontend espera que a API backend esteja disponivel em `VITE_API_URL`.
- Todas as rotas administrativas exigem autenticacao.
- O visual foi pensado para desktop e mobile, com sidebar adaptada, cards responsivos e formularios fluidos.
