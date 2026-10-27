import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';

import { Button } from '@/components/Button/Button';
import { Drawer } from '@/components/Drawer/Drawer';
import { Modal } from '@/components/Modal/Modal';

function StackedOverlays() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsDrawerOpen(true)}>Ver detalhe</Button>
      <Drawer open={isDrawerOpen} title="Detalhe" onClose={() => setIsDrawerOpen(false)}>
        <Button onClick={() => setIsModalOpen(true)}>Suspender</Button>
      </Drawer>
      <Modal open={isModalOpen} title="Confirmar" onClose={() => setIsModalOpen(false)}>
        <Button>Sim</Button>
      </Modal>
    </>
  );
}

async function openBoth() {
  await userEvent.click(screen.getByRole('button', { name: 'Ver detalhe' }));
  await userEvent.click(screen.getByRole('button', { name: 'Suspender' }));
}

describe('useOverlay', () => {
  it('fecha só o diálogo do topo a cada Esc', async () => {
    render(<StackedOverlays />);
    await openBoth();

    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('dialog', { name: 'Confirmar' })).not.toBeInTheDocument();
    expect(screen.getByRole('dialog', { name: 'Detalhe' })).toBeInTheDocument();

    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('devolve o foco a quem abriu cada diálogo', async () => {
    render(<StackedOverlays />);
    await openBoth();

    await userEvent.keyboard('{Escape}');
    expect(screen.getByRole('button', { name: 'Suspender' })).toHaveFocus();

    await userEvent.keyboard('{Escape}');
    expect(screen.getByRole('button', { name: 'Ver detalhe' })).toHaveFocus();
  });

  it('prende o Tab no diálogo do topo', async () => {
    render(<StackedOverlays />);
    await openBoth();
    const topDialog = screen.getByRole('dialog', { name: 'Confirmar' });

    await userEvent.tab();
    await userEvent.tab();
    await userEvent.tab();

    expect(topDialog).toContainElement(document.activeElement as HTMLElement);
  });

  it('trava a rolagem da página enquanto há diálogo aberto', async () => {
    render(<StackedOverlays />);

    await openBoth();
    expect(document.body.style.overflow).toBe('hidden');

    await userEvent.keyboard('{Escape}');
    expect(document.body.style.overflow).toBe('hidden');

    await userEvent.keyboard('{Escape}');
    expect(document.body.style.overflow).toBe('');
  });
});
