import { ErrorState } from '@/components/ErrorState/ErrorState';
import { LoadingState } from '@/components/LoadingState/LoadingState';

import { DeleteAccountSection } from '../../components/DeleteAccountSection/DeleteAccountSection';
import { EditNameForm } from '../../components/EditNameForm/EditNameForm';
import { ProfileDetails } from '../../components/ProfileDetails/ProfileDetails';
import { useMe, useUpdateMe } from '../../users.queries';
import styles from './ProfilePage.module.css';

export function ProfilePage() {
  const meQuery = useMe();
  const updateMe = useUpdateMe();

  if (meQuery.isPending) return <LoadingState />;
  if (meQuery.isError) return <ErrorState message={meQuery.error.message} />;

  return (
    <section className={styles.page}>
      <h1 className={styles.title}>{meQuery.data.name}</h1>
      <ProfileDetails user={meQuery.data} />
      <EditNameForm
        defaultName={meQuery.data.name}
        isSubmitting={updateMe.isPending}
        errorMessage={updateMe.error?.message}
        onSubmit={(input) => updateMe.mutate(input)}
      />
      <DeleteAccountSection />
    </section>
  );
}
