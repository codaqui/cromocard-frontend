import '@testing-library/jest-dom/vitest';

import { cleanup, configure } from '@testing-library/react';
import { afterEach } from 'vitest';

// A primeira renderização de uma rota com lazy() carrega o módulo da página; com a suíte rodando em paralelo
// (e com cobertura), isso passa de 1 s e o findBy* padrão estourava, deixando testes instáveis (AdminLayout).
configure({ asyncUtilTimeout: 3000 });

afterEach(() => cleanup());
