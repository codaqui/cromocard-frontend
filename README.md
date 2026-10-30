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

## Entrar no app

O login usa a API: `/login` envia e-mail e senha para `POST /api/v1/auth/login`. O access token fica só
em memória e o refresh token vem em cookie `httpOnly`, renovado ao abrir o app e a cada `401` (ADR-043).
No banco local, o `npm run db:seed` do backend cria as contas de teste, com a senha que está no README
dele (por exemplo `admin@cromocard.dev`, que cai em `/backoffice/dashboard`).

O botão "Entrar com Google" só aparece com `VITE_GOOGLE_CLIENT_ID` preenchido: o client ID de um projeto
do Google Cloud com `http://localhost:5173` nas origens JavaScript autorizadas, o mesmo `GOOGLE_CLIENT_ID`
do backend.

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
| `VITE_GOOGLE_CLIENT_ID` | `.env` (dev) | Client ID do Google Identity Services; vazio esconde o botão do Google |
| `API_URL` | Container | Gravada em `/env.js` na subida do container; tem prioridade sobre `VITE_API_URL` |
| `GOOGLE_CLIENT_ID` | Container | Gravada em `/env.js`; tem prioridade sobre `VITE_GOOGLE_CLIENT_ID`. Não é segredo (ADR-048) |

A mesma imagem roda em homologação e produção: a URL da API e o client ID do Google não entram no build, vêm do container.

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
docker run --rm -p 8080:8080 -e API_URL=http://localhost:3000 -e GOOGLE_CLIENT_ID=<client-id> cromocard-web
```

nginx sem root na porta 8080; qualquer URL desconhecida devolve o `index.html` (SPA). Sem `API_URL`
o container não sobe.
