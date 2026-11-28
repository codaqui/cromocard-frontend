import { useState } from 'react';

export function useOpenQuestions() {
  const [openIds, setOpenIds] = useState<ReadonlySet<string>>(new Set());

  const toggle = (id: string) =>
    setOpenIds((current) => {
      const next = new Set(current);
      if (!next.delete(id)) next.add(id);
      return next;
    });

  return { isOpen: (id: string) => openIds.has(id), toggle };
}
