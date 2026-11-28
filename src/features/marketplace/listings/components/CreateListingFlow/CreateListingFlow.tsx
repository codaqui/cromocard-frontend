import { useNavigate } from 'react-router';

import { paths } from '@/routes/paths';

import { type CreateListingFlowState, stepForError } from '../../hooks/useCreateListingFlow';
import { useCardConditions, useCreateListing } from '../../listings.queries';
import type { CreateListingInput } from '../../listings.schemas';
import type { CreatedListing } from '../../listings.types';
import { CreateListingModal } from '../CreateListingModal/CreateListingModal';
import { ListingBlockedDialog } from '../ListingBlockedDialog/ListingBlockedDialog';
import { PrimaryAddressRequiredDialog } from '../PrimaryAddressRequiredDialog/PrimaryAddressRequiredDialog';

export interface CreateListingFlowProps {
  flow: CreateListingFlowState;
  onConnectAccount: () => void;
  onCreated?: (listing: CreatedListing) => void;
}

function ListingFormStep({ flow, onCreated }: Omit<CreateListingFlowProps, 'onConnectAccount'>) {
  const conditions = useCardConditions();
  const createListing = useCreateListing();

  const submit = (input: CreateListingInput) =>
    createListing.mutate(input, {
      onSuccess: (listing) => {
        flow.close();
        onCreated?.(listing);
      },
      onError: (error) => {
        const step = stepForError(error);
        if (step) flow.showStep(step);
      },
    });

  return (
    <CreateListingModal
      initialCard={flow.card}
      conditions={conditions.data ?? []}
      isSubmitting={createListing.isPending}
      apiError={createListing.error}
      onClose={flow.close}
      onSubmit={submit}
    />
  );
}

export function CreateListingFlow({ flow, onConnectAccount, onCreated }: CreateListingFlowProps) {
  const navigate = useNavigate();

  if (flow.step === 'blocked') {
    return <ListingBlockedDialog onClose={flow.close} onConnectAccount={onConnectAccount} />;
  }
  if (flow.step === 'address') {
    return (
      <PrimaryAddressRequiredDialog
        onClose={flow.close}
        onRegisterAddress={() => void navigate(paths.profile)}
      />
    );
  }
  if (flow.step !== 'form') return null;
  return <ListingFormStep flow={flow} onCreated={onCreated} />;
}
