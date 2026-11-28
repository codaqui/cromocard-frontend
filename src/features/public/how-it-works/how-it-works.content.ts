export type HowItWorksAudience = 'buy' | 'sell';

export interface HowItWorksItem {
  title: string;
  text: string;
}

export interface HowItWorksGuide {
  id: HowItWorksAudience;
  tab: string;
  intro: string;
  steps: HowItWorksItem[];
  reasonsTitle: string;
  reasons: HowItWorksItem[];
}

export const howItWorksGuides: [HowItWorksGuide, HowItWorksGuide] = [
  {
    id: 'buy',
    tab: 'Quero comprar',
    intro: 'Compre e venda cartas colecionáveis com o pagamento protegido do começo ao fim.',
    steps: [
      {
        title: 'Encontre a carta',
        text: 'Busque por nome, coleção ou jogador e compare condição e preço entre vendedores.',
      },
      {
        title: 'Pague com proteção',
        text: 'O valor fica retido pela CromoCard e só vai para o vendedor depois da entrega.',
      },
      {
        title: 'Receba e confira',
        text: 'O vendedor envia pelos Correios ou Jadlog, com rastreio. Ao receber, confirme o recebimento; se não confirmar, o valor é liberado 7 dias depois da entrega. Algum problema? Fale com o suporte.',
      },
      {
        title: 'Colecione',
        text: 'Adicione a carta ao seu álbum digital e acompanhe a valorização.',
      },
    ],
    reasonsTitle: 'Suas garantias',
    reasons: [
      {
        title: 'Pagamento retido',
        text: 'O dinheiro só é liberado ao vendedor depois da entrega confirmada.',
      },
      {
        title: 'Vendedores verificados',
        text: 'Todo vendedor tem a conta de recebimento verificada pela Stripe.',
      },
      {
        title: 'Suporte se der problema',
        text: 'Se a carta chegar diferente do anunciado, fale com o suporte: nossa equipe analisa e pode devolver seu dinheiro.',
      },
      {
        title: 'Preços transparentes',
        text: 'Histórico de vendas reais para você saber se o preço é justo.',
      },
    ],
  },
  {
    id: 'sell',
    tab: 'Quero vender',
    intro: 'Venda suas cartas para colecionadores de todo o Brasil e receba com segurança.',
    steps: [
      {
        title: 'Crie a conta de vendedor',
        text: 'Escolha "Vendedor" no cadastro e cadastre seu endereço principal, de onde as cartas saem.',
      },
      {
        title: 'Conecte a conta de recebimento',
        text: 'Cadastre-se na Stripe pelo Painel do vendedor. Com a conta pronta, você já pode anunciar.',
      },
      {
        title: 'Anuncie e envie',
        text: 'Escolha a carta no catálogo, defina condição e preço. Vendeu? Gere a etiqueta e poste em até 2 dias úteis.',
      },
      {
        title: 'Receba',
        text: 'Depois da entrega, o valor menos a taxa de 5% vai para sua conta Stripe.',
      },
    ],
    reasonsTitle: 'Por que vender aqui',
    reasons: [
      {
        title: 'Pagamento garantido',
        text: 'Você só envia pedidos já pagos: o valor fica reservado para você.',
      },
      {
        title: 'Frete sem complicação',
        text: 'O comprador paga o frete e a etiqueta sai pronta pelo Melhor Envio, com rastreio.',
      },
      {
        title: 'Repasse automático',
        text: 'O valor cai na sua conta Stripe sozinho: quando o comprador confirma ou 7 dias depois da entrega.',
      },
      {
        title: 'Preço de referência',
        text: 'Veja o histórico de vendas da carta para definir um preço justo.',
      },
    ],
  },
];
