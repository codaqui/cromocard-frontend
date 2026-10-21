# Feature users — Gestão de Usuários

Sprint 06 (16/10 a 30/10) · User Stories: #334 (CCD059) · Backlog completo em `Azure-Devops/backlog-sprint-06.md` (repositório do workspace).

Os arquivos já existem com as assinaturas prontas. Enquanto uma task não é feita, a rota responde `501 Funcionalidade em construção`
e os testes que faltam aparecem como `todo` no `npm test`. ⚠️ = desbloqueia os colegas: abra o PR primeiro.

| Task | O que fazer | Dono | Estimativa | Arquivos |
|---|---|---|---|---|
| [#390](https://dev.azure.com/CromoCard/CromoCard/_workitems/edit/390) ⚠️ | Componente compartilhado ConfirmDialog | Felipe Consulim | 2h | `src/components/ConfirmDialog/ConfirmDialog.tsx` (novo)<br>`src/components/ConfirmDialog/ConfirmDialog.module.css` (novo)<br>`src/components/ConfirmDialog/ConfirmDialog.spec.tsx` (novo) |
| [#396](https://dev.azure.com/CromoCard/CromoCard/_workitems/edit/396) | Lista de usuários com filtros | Felipe Consulim | 3h | `src/features/users/pages/UsersListPage/UsersListPage.tsx`<br>`src/features/users/components/UsersTable/UsersTable.tsx`<br>`src/features/users/hooks/useUsersListFilters.ts` |
| [#397](https://dev.azure.com/CromoCard/CromoCard/_workitems/edit/397) | Formulário de cadastrar e editar usuário | Felipe Consulim | 4h | `src/features/users/components/UserForm/UserForm.tsx` (novo)<br>`src/features/users/users.schemas.ts`<br>`src/features/users/users.queries.ts` |
| [#398](https://dev.azure.com/CromoCard/CromoCard/_workitems/edit/398) | Ações: suspender, reativar, excluir e restaurar | Felipe Consulim | 3h | `src/features/users/components/UserActions/UserActions.tsx` (novo)<br>`src/features/users/users.queries.ts` |

## Como pegar uma task

1. Abra a task no Azure: a descrição tem o passo a passo, o critério de pronto e como testar.
2. `git switch develop`, `git pull` e crie a branch indicada na task.
3. Implemente nos arquivos da tabela; rode `npm run lint`, `npm run typecheck` e `npm test`.
4. Abra o PR para `develop` com `AB#<número da task>` e aponte as horas no mesmo dia (Jibble e Azure).
