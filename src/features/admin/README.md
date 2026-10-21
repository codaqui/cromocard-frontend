# Feature admin — Dashboard, Logs e Configurações

Sprint 06 (16/10 a 30/10) · User Stories: #333 (CCD058), #340 (CCD065), #341 (CCD066) · Backlog completo em `Azure-Devops/backlog-sprint-06.md` (repositório do workspace).

Os arquivos já existem com as assinaturas prontas. Enquanto uma task não é feita, a rota responde `501 Funcionalidade em construção`
e os testes que faltam aparecem como `todo` no `npm test`. ⚠️ = desbloqueia os colegas: abra o PR primeiro.

| Task | O que fazer | Dono | Estimativa | Arquivos |
|---|---|---|---|---|
| [#413](https://dev.azure.com/CromoCard/CromoCard/_workitems/edit/413) | Ajustar o visual do backoffice ao Figma | Gabriel | 3h | `src/styles/tokens.css`<br>`src/app/layouts/AdminLayout/AdminLayout.module.css`<br>`src/components/NavItem/NavItem.module.css` |
| [#414](https://dev.azure.com/CromoCard/CromoCard/_workitems/edit/414) | Configurações, Módulo 1: banner da Home | Gabriel | 4h | `src/features/admin/settings/pages/SettingsPage/SettingsPage.tsx`<br>`src/features/admin/settings/components/BannerForm/BannerForm.tsx` (novo)<br>`src/features/admin/settings/settings.queries.ts` (novo) |
| [#415](https://dev.azure.com/CromoCard/CromoCard/_workitems/edit/415) | Configurações, Módulo 2: categorias com reordenação | Gabriel | 4h | `src/features/admin/settings/components/CategoriesManager/CategoriesManager.tsx` (novo)<br>`src/features/admin/settings/settings.queries.ts` |
| [#418](https://dev.azure.com/CromoCard/CromoCard/_workitems/edit/418) | Tela de logs com filtros e detalhe | Lucca | 4h | `src/features/admin/audit-logs/pages/AuditLogsPage/AuditLogsPage.tsx`<br>`src/features/admin/audit-logs/audit-logs.queries.ts` (novo)<br>`src/features/admin/audit-logs/components/AuditLogsTable/AuditLogsTable.tsx` (novo) |
| [#421](https://dev.azure.com/CromoCard/CromoCard/_workitems/edit/421) | Tela do dashboard com filtro de período | Lucca | 4h | `src/features/admin/dashboard/pages/DashboardPage/DashboardPage.tsx`<br>`src/features/admin/dashboard/dashboard.queries.ts` (novo)<br>`src/features/admin/dashboard/components/StatCard/StatCard.tsx` (novo) |

## Como pegar uma task

1. Abra a task no Azure: a descrição tem o passo a passo, o critério de pronto e como testar.
2. `git switch develop`, `git pull` e crie a branch indicada na task.
3. Implemente nos arquivos da tabela; rode `npm run lint`, `npm run typecheck` e `npm test`.
4. Abra o PR para `develop` com `AB#<número da task>` e aponte as horas no mesmo dia (Jibble e Azure).
