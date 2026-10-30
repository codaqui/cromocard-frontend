import { describe, expect, it } from 'vitest';

import { registerSchema } from './auth.schemas';

const valid = {
  name: 'Ana',
  email: ' Ana@CromoCard.dev ',
  role: 'CUSTOMER',
  password: 'Senha@Forte1',
  confirmPassword: 'Senha@Forte1',
  termsAccepted: true,
};

function messagesOf(input: object): string[] {
  const result = registerSchema.safeParse(input);
  return result.success ? [] : result.error.issues.map((issue) => issue.message);
}

describe('registerSchema', () => {
  it('aceita os dados válidos com o e-mail normalizado', () => {
    expect(registerSchema.parse(valid).email).toBe('ana@cromocard.dev');
  });

  it('recusa senha fraca com a mesma regra do backend', () => {
    expect(messagesOf({ ...valid, password: 'senhafraca', confirmPassword: 'senhafraca' })).toEqual(
      ['A senha precisa ter pelo menos um número', 'A senha precisa ter pelo menos um símbolo'],
    );
  });

  it('recusa confirmação diferente da senha', () => {
    expect(messagesOf({ ...valid, confirmPassword: 'Outra@Senha1' })).toEqual([
      'As senhas não são iguais',
    ]);
  });

  it('recusa ADMIN e termos não aceitos', () => {
    expect(messagesOf({ ...valid, role: 'ADMIN', termsAccepted: false })).toEqual([
      'Escolha Cliente ou Vendedor',
      'Aceite os termos de uso para criar a conta',
    ]);
  });
});
