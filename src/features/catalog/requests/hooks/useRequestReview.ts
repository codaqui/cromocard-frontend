import { useState } from 'react';

import {
  alreadyReviewedMessage,
  approvalFailureMessage,
  isAlreadyReviewed,
  itemNameOf,
} from '../catalog-requests.format';
import { useApproveRequest, useRejectRequest } from '../catalog-requests.queries';
import type { CatalogRequest } from '../catalog-requests.types';

/** Em que passo do fluxo de análise a tela está; cada passo abre um diálogo do Figma. */
export type ReviewStep =
  | { kind: 'idle' }
  | { kind: 'approving'; request: CatalogRequest }
  | { kind: 'rejecting'; request: CatalogRequest }
  | { kind: 'approved'; message: string }
  | { kind: 'reviewed'; message: string }
  | { kind: 'failed'; message: string };

const IDLE: ReviewStep = { kind: 'idle' };

function failureStep(request: CatalogRequest, error: Error): ReviewStep {
  if (isAlreadyReviewed(error)) {
    return { kind: 'reviewed', message: alreadyReviewedMessage(request, error) };
  }
  return { kind: 'failed', message: approvalFailureMessage(request, error) };
}

const approvedStep = (request: CatalogRequest): ReviewStep => ({
  kind: 'approved',
  message: `${itemNameOf(request)} entrou no catálogo. O solicitante foi avisado.`,
});

function useReviewMutations(setStep: (step: ReviewStep) => void) {
  const approval = useApproveRequest();
  const rejection = useRejectRequest();
  const failWith = (request: CatalogRequest) => (error: Error) =>
    setStep(failureStep(request, error));

  return {
    isApproving: approval.isPending,
    isRejecting: rejection.isPending,
    approve: (request: CatalogRequest) =>
      approval.mutate(request.id, {
        onSuccess: () => setStep(approvedStep(request)),
        onError: failWith(request),
      }),
    reject: (request: CatalogRequest, reason: string) =>
      rejection.mutate(
        { id: request.id, reason },
        { onSuccess: () => setStep(IDLE), onError: failWith(request) },
      ),
  };
}

export function useRequestReview() {
  const [step, setStep] = useState<ReviewStep>(IDLE);

  return {
    step,
    ...useReviewMutations(setStep),
    askApproval: (request: CatalogRequest) => setStep({ kind: 'approving', request }),
    askRejection: (request: CatalogRequest) => setStep({ kind: 'rejecting', request }),
    close: () => setStep(IDLE),
  };
}

export type RequestReview = ReturnType<typeof useRequestReview>;
