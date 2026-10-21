# Feature catalog — Cartas e álbuns

Sprint 06 (16/10 a 30/10) · User Stories: #336 (CCD061) · Backlog completo em `Azure-Devops/backlog-sprint-06.md` (repositório do workspace).

Os arquivos já existem com as assinaturas prontas. Enquanto uma task não é feita, a rota responde `501 Funcionalidade em construção`
e os testes que faltam aparecem como `todo` no `npm test`. ⚠️ = desbloqueia os colegas: abra o PR primeiro.

| Task | O que fazer | Dono | Estimativa | Arquivos |
|---|---|---|---|---|
| [#405](https://dev.azure.com/CromoCard/CromoCard/_workitems/edit/405) | Página de cartas: lista e filtros | Lucas | 3h | `src/features/catalog/pages/CardsAdminPage/CardsAdminPage.tsx`<br>`src/features/catalog/catalog.queries.ts` (novo)<br>`src/features/catalog/components/CardsTable/CardsTable.tsx` (novo) |
| [#406](https://dev.azure.com/CromoCard/CromoCard/_workitems/edit/406) | Formulário de carta com upload de frente e verso | Lucas | 4h | `src/features/catalog/components/CardForm/CardForm.tsx` (novo)<br>`src/features/catalog/catalog.schemas.ts` (novo)<br>`src/features/catalog/components/ImageUpload/ImageUpload.tsx` (novo) |
| [#407](https://dev.azure.com/CromoCard/CromoCard/_workitems/edit/407) | Página de álbuns: lista e formulário | Lucas | 4h | `src/features/catalog/pages/AlbumsAdminPage/AlbumsAdminPage.tsx`<br>`src/features/catalog/components/AlbumForm/AlbumForm.tsx` (novo) |

## Como pegar uma task

1. Abra a task no Azure: a descrição tem o passo a passo, o critério de pronto e como testar.
2. `git switch develop`, `git pull` e crie a branch indicada na task.
3. Implemente nos arquivos da tabela; rode `npm run lint`, `npm run typecheck` e `npm test`.
4. Abra o PR para `develop` com `AB#<número da task>` e aponte as horas no mesmo dia (Jibble e Azure).
