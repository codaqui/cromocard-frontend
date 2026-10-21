# Feature auth — Login e definir senha

Sprint 06 (16/10 a 30/10) · User Stories: #109 (CCD004), #334 (CCD059) · Backlog completo em `Azure-Devops/backlog-sprint-06.md` (repositório do workspace).

Os arquivos já existem com as assinaturas prontas. Enquanto uma task não é feita, a rota responde `501 Funcionalidade em construção`
e os testes que faltam aparecem como `todo` no `npm test`. ⚠️ = desbloqueia os colegas: abra o PR primeiro.

| Task | O que fazer | Dono | Estimativa | Arquivos |
|---|---|---|---|---|
| [#388](https://dev.azure.com/CromoCard/CromoCard/_workitems/edit/388) | Tela de Login | Daniel | 4h | `src/features/auth/pages/LoginPage/LoginPage.tsx`<br>`src/features/auth/hooks/useLogin.ts` (novo)<br>`src/contexts/AuthProvider.tsx`<br>`src/contexts/AuthContext.ts` |
| [#389](https://dev.azure.com/CromoCard/CromoCard/_workitems/edit/389) | Renovar a sessão e sair | Daniel | 3h | `src/contexts/AuthProvider.tsx`<br>`src/lib/http.ts` |
| [#399](https://dev.azure.com/CromoCard/CromoCard/_workitems/edit/399) | Tela Definir senha | Felipe Consulim | 2h | `src/features/auth/pages/SetupPasswordPage/SetupPasswordPage.tsx` |

## Como pegar uma task

1. Abra a task no Azure: a descrição tem o passo a passo, o critério de pronto e como testar.
2. `git switch develop`, `git pull` e crie a branch indicada na task.
3. Implemente nos arquivos da tabela; rode `npm run lint`, `npm run typecheck` e `npm test`.
4. Abra o PR para `develop` com `AB#<número da task>` e aponte as horas no mesmo dia (Jibble e Azure).
