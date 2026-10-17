# Frontend CromoCard

SPA do CromoCard em React 19 + TypeScript + Vite. Um único app atende a área pública, a área do
cliente e o BackOffice (`/backoffice`), separados por rota e pelo papel do usuário.

## Rodando localmente

Pré-requisito: a API do [cromocard-backend](https://github.com/codaqui/cromocard-backend) rodando em
`http://localhost:3000` (o `CORS_ORIGIN` padrão dela já libera `http://localhost:5173`).

```bash
nvm use                 # Node 24 (.nvmrc)
npm install
cp .env.example .env    # VITE_API_URL aponta para a API local
npm ci
npm run dev             # http://localhost:5173
```

## Sessão de desenvolvimento

O backend ainda não tem `/auth` (login). Até ele existir, o `npm run dev` usa um access token gerado
à mão, informado em `VITE_DEV_ACCESS_TOKEN` no `.env`. Esse valor é ignorado no build de produção.

1. Crie um usuário no banco local do backend:

   ```bash
   docker exec cromocard-postgres psql -U cromocard -d cromocard -c \
     "INSERT INTO users (name, email, role) VALUES ('Admin Dev', 'admin@cromocard.local', 'ADMIN') RETURNING id;"
   ```

2. Gere um token para ele, na pasta do backend (troque `<id>` pelo id retornado; o papel pode ser
   `ADMIN`, `CUSTOMER` ou `SELLER`):

   ```bash
   node --env-file=.env -e "const jwt = require('jsonwebtoken'); console.log(jwt.sign({ role: process.argv[2] }, process.env.JWT_SECRET, { subject: process.argv[1], expiresIn: '7d' }))" <id> ADMIN
   ```

3. Cole o token em `VITE_DEV_ACCESS_TOKEN` e reinicie o `npm run dev`. O ADMIN cai em
   `/backoffice/users`; CUSTOMER e SELLER caem em `/profile`.

Quando a feature `auth` existir, este passo some: o login grava o token em memória e o refresh
token vem em cookie `httpOnly` (ADR-005).

## Estrutura

| Pasta | Conteúdo |
| --- | --- |
| `src/app` | Casca do app: `main.tsx`, `App.tsx` (providers), `router.tsx` (todas as URLs) e `layouts/` |
| `src/features` | Um módulo por domínio, espelhando `src/domains` do backend (`users` é o modelo) |
| `src/components` | Componentes reutilizáveis sem regra de negócio, um por pasta (`Button/`, `Header/`...) |
| `src/config` | `env.ts`: lê e valida as variáveis de ambiente |
| `src/lib` | Bibliotecas configuradas: cliente HTTP, React Query, Zod, leitura do JWT |
| `src/routes` | `paths.ts` (URLs) e `guards/` (quem pode entrar em cada rota) |
| `src/contexts` | Estado global do app: sessão do usuário |
| `src/hooks` | Hooks reutilizáveis entre features (`useAuth`, `useDebounce`) |
| `src/types` | Tipos compartilhados: envelope da API, papéis do usuário |
| `src/utils` | Funções puras: formatação de data, junção de classes CSS |
| `src/styles` | CSS global e tokens (cores, espaçamentos, tipografia) |
| `src/test` | Setup do Vitest e helper de renderização com providers |

Dentro de uma feature:

| Arquivo / pasta | Conteúdo |
| --- | --- |
| `pages/` | Telas ligadas a uma URL |
| `components/` | Componentes usados só nesta feature |
| `hooks/` | Hooks usados só nesta feature |
| `<feature>.api.ts` | Chamadas HTTP |
| `<feature>.queries.ts` | Hooks do React Query (cache, loading, erro) |
| `<feature>.schemas.ts` | Validação Zod dos formulários (espelha o `.validator.ts` do backend) |
| `<feature>.types.ts` | Tipos do domínio |
| `<feature>.routes.ts` | Rotas da feature, carregadas sob demanda |
| `index.ts` | API pública: o que o resto do app pode importar |

Regras (checadas pelo ESLint): uma feature importa outra só pelo `index.ts`; para sair da pasta da
feature, use o alias `@/`; `import.meta.env` só em `src/config/env.ts`.

## Variáveis de ambiente

| Nome | Onde | Observação |
| --- | --- | --- |
| `VITE_API_URL` | `.env` (dev) | URL da API sem `/api/v1` |
| `VITE_DEV_ACCESS_TOKEN` | `.env` (dev) | Token temporário; ver "Sessão de desenvolvimento" |
| `API_URL` | Container | Gravada em `/env.js` na subida do container; tem prioridade sobre `VITE_API_URL` |

A mesma imagem roda em homologação e produção: a URL da API não entra no build, vem do container.

## Scripts

| Comando | O que faz |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` / `npm run preview` | Build de produção em `dist/` / serve o build localmente |
| `npm run lint` / `npm run typecheck` | ESLint e checagem de tipos |
| `npm run format` / `npm run format:check` | Prettier |
| `npm test` / `npm run test:cov` | Testes (Vitest + Testing Library) / com cobertura |

## Docker

```bash
docker build -f docker/Dockerfile -t cromocard-web .
docker run --rm -p 8080:8080 -e API_URL=http://localhost:3000 cromocard-web
```

nginx sem root na porta 8080; qualquer URL desconhecida devolve o `index.html` (SPA). Sem `API_URL`
o container não sobe.
