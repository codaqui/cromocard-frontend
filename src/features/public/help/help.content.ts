import { paths } from '@/routes/paths';

import type { HelpLink, HelpTopic } from './help.types';

const howItWorksLink: HelpLink = { label: 'Ver como funciona', to: paths.howItWorks };

export const helpTopics: HelpTopic[] = [
  {
    id: 'first-steps',
    label: 'Primeiros passos',
    questions: [
      {
        id: 'free-to-join',
        question: 'Preciso pagar para criar conta ou anunciar?',
        answer:
          'Não. Criar conta e anunciar é grátis. A CromoCard cobra 5% do valor da carta em cada venda concluída, descontados do vendedor. Quem compra não paga taxa.',
        link: howItWorksLink,
      },
      {
        id: 'purchase-protection',
        question: 'Como a CromoCard protege minha compra?',
        answer:
          'Ao comprar, o valor fica retido pela CromoCard. O vendedor envia a carta com rastreio e só recebe depois que você confirma o recebimento ou 7 dias depois da entrega. Se a carta chegar diferente do anúncio, fale com o suporte: nossa equipe analisa e pode devolver seu dinheiro.',
      },
      {
        id: 'shipping-cost',
        question: 'Como o frete é calculado?',
        answer:
          'O frete é calculado pela Melhor Envio a partir do CEP do vendedor e do seu, e aparece antes de você pagar. Você escolhe a opção de entrega na hora da compra.',
      },
      {
        id: 'album-without-buying',
        question: 'Posso montar meu álbum sem comprar nada?',
        answer:
          'Pode. Em Minha Coleção você adiciona os álbuns e marca cada carta como "possuo", "falta" ou "repetida", sem precisar comprar nada na plataforma.',
      },
      {
        id: 'trusted-seller',
        question: 'Como sei se um vendedor é confiável?',
        answer:
          'Todo vendedor passa por uma verificação de cadastro feita pela nossa equipe antes de vender. No perfil público você vê a cidade dele, as vendas concluídas e os anúncios ativos.',
      },
    ],
  },
  {
    id: 'payments',
    label: 'Pagamentos',
    questions: [
      {
        id: 'payment-methods',
        question: 'Quais formas de pagamento posso usar?',
        answer:
          'Cartão de crédito, Pix e boleto. O pagamento é processado pela Stripe, e a CromoCard não guarda os dados do seu cartão.',
      },
      {
        id: 'seller-payout',
        question: 'Quando o vendedor recebe o dinheiro?',
        answer:
          'Depois que você confirma o recebimento da carta ou 7 dias depois da entrega, o que acontecer primeiro. O repasse vai para a conta de recebimento que o vendedor conectou na Stripe.',
      },
      {
        id: 'refund',
        question: 'Posso pedir o dinheiro de volta?',
        answer:
          'Se a carta não chegar ou chegar diferente do anúncio, fale com o suporte antes de confirmar o recebimento. A equipe analisa o caso e pode devolver o valor.',
      },
      {
        id: 'boleto',
        question: 'O boleto demora para ser confirmado?',
        answer:
          'Sim: o boleto pode levar até 3 dias úteis para compensar. O pedido fica aguardando pagamento até a confirmação, e o vendedor só envia depois dela.',
      },
    ],
  },
  {
    id: 'shipping',
    label: 'Envio e entrega',
    questions: [
      {
        id: 'tracking',
        question: 'Como acompanho a entrega da minha carta?',
        answer:
          'Quando o vendedor envia, o pedido mostra o código de rastreio. Você acompanha a entrega pelo pedido.',
      },
      {
        id: 'address',
        question: 'Preciso ter um endereço cadastrado?',
        answer:
          'Sim. Para comprar, você informa o endereço de entrega. Para vender, é preciso ter um endereço principal no perfil, que é de onde a carta sai.',
      },
      {
        id: 'damaged',
        question: 'O que faço se a carta chegar danificada?',
        answer:
          'Não confirme o recebimento e fale com o suporte, com fotos da carta e da embalagem. A equipe analisa e pode devolver seu dinheiro.',
      },
    ],
  },
  {
    id: 'albums',
    label: 'Álbuns digitais',
    questions: [
      {
        id: 'digital-album',
        question: 'O que é um álbum digital?',
        answer:
          'É a versão do álbum dentro da CromoCard: você vê todas as cartas da coleção e marca quais tem, quais faltam e quais estão repetidas.',
      },
      {
        id: 'album-progress',
        question: 'Como vejo quanto falta para completar um álbum?',
        answer:
          'No detalhe do álbum aparece o progresso, com as cartas que você já tem e as que faltam.',
      },
      {
        id: 'missing-from-catalog',
        question: 'O álbum ou a carta que procuro não existe. E agora?',
        answer:
          'Você pode pedir a inclusão ao catálogo. Outros colecionadores votam nos pedidos, e a nossa equipe analisa e publica.',
      },
      {
        id: 'share-progress',
        question: 'Posso compartilhar meu progresso?',
        answer: 'Pode. No álbum, use "Compartilhar" para gerar um link que mostra o seu progresso.',
      },
    ],
  },
  {
    id: 'selling',
    label: 'Vender na CromoCard',
    questions: [
      {
        id: 'start-selling',
        question: 'Como começo a vender?',
        answer:
          'Crie a conta de vendedor, envie os dados para a verificação do cadastro e conecte a sua conta de recebimento na Stripe. Com a conta pronta e um endereço principal no perfil, você já pode anunciar.',
        link: howItWorksLink,
      },
      {
        id: 'selling-fee',
        question: 'Quanto custa vender?',
        answer:
          'Anunciar é grátis. A CromoCard cobra 5% do valor da carta em cada venda concluída. Ao criar o anúncio, você já vê a taxa e quanto vai receber.',
      },
      {
        id: 'cannot-list',
        question: 'Por que não consigo criar um anúncio?',
        answer:
          'O anúncio só fica disponível com a conta de recebimento pronta na Stripe e um endereço principal no perfil. O Painel do vendedor mostra o que falta.',
      },
      {
        id: 'listing-photos',
        question: 'Quantas fotos posso colocar no anúncio?',
        answer: 'Até 4 fotos, de até 4 MB cada. Mostre a frente, o verso e os detalhes da carta.',
      },
    ],
  },
  {
    id: 'safety',
    label: 'Segurança e denúncias',
    questions: [
      {
        id: 'report',
        question: 'Como denuncio um usuário ou um anúncio?',
        answer:
          'Use "Denunciar" no perfil, no anúncio ou na conversa. A nossa equipe analisa cada denúncia.',
      },
      {
        id: 'block',
        question: 'Posso bloquear alguém no chat?',
        answer:
          'Pode. Na conversa, use "Bloquear". A pessoa bloqueada não consegue mais te mandar mensagens.',
      },
      {
        id: 'never-share',
        question: 'A CromoCard pede minha senha ou dados do cartão?',
        answer:
          'Nunca. Não passe senha, código ou dados do cartão por mensagem. Todo pagamento é feito dentro da plataforma.',
      },
      {
        id: 'off-platform',
        question: 'Posso pagar o vendedor por fora da plataforma?',
        answer:
          'Não recomendamos. Fora da CromoCard, o seu dinheiro não fica protegido e a nossa equipe não consegue ajudar se der problema.',
      },
    ],
  },
];
