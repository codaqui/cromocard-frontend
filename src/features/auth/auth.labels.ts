export type AuthTab = 'login' | 'register';

import type { SIGN_UP_ROLES } from './auth.schemas';

export type SignUpRole = (typeof SIGN_UP_ROLES)[number];

export const signUpRoleLabels: Record<SignUpRole, { title: string; description: string }> = {
  CUSTOMER: { title: 'Cliente', description: 'Organizo e troco minha coleção' },
  SELLER: { title: 'Vendedor', description: 'Também vendo cartas na plataforma' },
};

export const authTabLabels: Record<AuthTab, string> = {
  login: 'Fazer Login',
  register: 'Criar Conta',
};
