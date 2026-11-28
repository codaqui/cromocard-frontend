import { describe, expect, it } from 'vitest';

import { helpTopics } from './help.content';
import { questionsOf, searchQuestions } from './help.search';

const questionsFor = (term: string) =>
  searchQuestions(helpTopics, term).map((item) => item.question);

describe('help.search', () => {
  it('CA3: "frete" traz só as perguntas que falam de frete', () => {
    expect(questionsFor('frete')).toEqual(['Como o frete é calculado?']);
  });

  it('CA14: ignora acentos e maiúsculas e procura em todos os tópicos', () => {
    const found = questionsFor('  ALBUM ');

    expect(found).toContain('Posso montar meu álbum sem comprar nada?');
    expect(found).toContain('O álbum ou a carta que procuro não existe. E agora?');
    expect(found).toContain('Posso compartilhar meu progresso?');
  });

  it('CA14: procura também no texto da resposta', () => {
    expect(questionsFor('melhor envio')).toEqual(['Como o frete é calculado?']);
  });

  it('CA14: sem nenhuma pergunta com o termo, devolve a lista vazia', () => {
    expect(questionsFor('xyz')).toEqual([]);
  });

  it('CA2: devolve só as perguntas do tópico escolhido', () => {
    expect(questionsOf(helpTopics, 'payments').map((item) => item.question)).toEqual([
      'Quais formas de pagamento posso usar?',
      'Quando o vendedor recebe o dinheiro?',
      'Posso pedir o dinheiro de volta?',
      'O boleto demora para ser confirmado?',
    ]);
  });

  it('CA16: os 6 tópicos do caso de uso, na ordem, com 24 perguntas', () => {
    expect(helpTopics.map((topic) => [topic.label, topic.questions.length])).toEqual([
      ['Primeiros passos', 5],
      ['Pagamentos', 4],
      ['Envio e entrega', 3],
      ['Álbuns digitais', 4],
      ['Vender na CromoCard', 4],
      ['Segurança e denúncias', 4],
    ]);
  });
});
