import { describe, expect, it } from 'vitest';

import {
  PENDING_NOTICE_MESSAGE_MAX_LENGTH,
  sendPendingNoticeSchema,
} from './seller-verifications.schemas';

describe('sendPendingNoticeSchema', () => {
  const parse = (length: number) =>
    sendPendingNoticeSchema.safeParse({ message: 'a'.repeat(length), deadlineHours: 48 });

  it('aceita a mensagem de até 500 caracteres, o tamanho da notificação na API', () => {
    expect(parse(PENDING_NOTICE_MESSAGE_MAX_LENGTH).success).toBe(true);
  });

  it('recusa a mensagem de 501 caracteres com o motivo', () => {
    const result = parse(PENDING_NOTICE_MESSAGE_MAX_LENGTH + 1);

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe('A mensagem pode ter no máximo 500 caracteres');
  });
});
