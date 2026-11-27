import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { ApiError } from '@/lib/api-error';

import { eligibilityQuery } from '../listings.queries';
import type { CardOption, ListingEligibility } from '../listings.types';

export type CreateListingStep = 'closed' | 'checking' | 'blocked' | 'address' | 'form';

const stepByErrorCode: Record<string, CreateListingStep> = {
  STRIPE_ACCOUNT_NOT_READY: 'blocked',
  PRIMARY_ADDRESS_REQUIRED: 'address',
};

export function stepFor({ stripeAccountReady, hasPrimaryAddress }: ListingEligibility) {
  if (!stripeAccountReady) return 'blocked';
  return hasPrimaryAddress ? 'form' : 'address';
}

export function stepForError(error: unknown): CreateListingStep | null {
  if (!(error instanceof ApiError)) return null;
  return stepByErrorCode[error.code] ?? null;
}

export function useCreateListingFlow() {
  const queryClient = useQueryClient();
  const [step, setStep] = useState<CreateListingStep>('closed');
  const [card, setCard] = useState<CardOption | null>(null);

  const start = async (chosenCard: CardOption | null = null) => {
    setCard(chosenCard);
    setStep('checking');
    const eligibility = await queryClient.fetchQuery(eligibilityQuery()).catch(() => null);
    setStep(eligibility ? stepFor(eligibility) : 'form');
  };

  return {
    step,
    card,
    start: (chosenCard?: CardOption | null) => void start(chosenCard),
    showStep: setStep,
    close: () => setStep('closed'),
  };
}

export type CreateListingFlowState = ReturnType<typeof useCreateListingFlow>;
