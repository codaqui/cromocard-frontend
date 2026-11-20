import { Button } from '@/components/Button/Button';
import { ErrorState } from '@/components/ErrorState/ErrorState';
import { LoadingState } from '@/components/LoadingState/LoadingState';
import { Toast } from '@/components/Toast/Toast';

import { BannerModule } from '../../components/BannerModule/BannerModule';
import { DefaultCategoriesModule } from '../../components/DefaultCategoriesModule/DefaultCategoriesModule';
import { GoalsModule } from '../../components/GoalsModule/GoalsModule';
import { NotificationTemplatesModule } from '../../components/NotificationTemplatesModule/NotificationTemplatesModule';
import { SettingsHeader } from '../../components/SettingsHeader/SettingsHeader';
import { type Notify, useSettingsNotice } from '../../hooks/useSettingsNotice';
import { useGlobalSettings } from '../../settings.queries';
import type { HomeBanner } from '../../settings.types';
import styles from './SettingsPage.module.css';

const EMPTY_BANNER: HomeBanner = {
  enabled: false,
  title: '',
  subtitle: '',
  ctaText: '',
  ctaUrl: '',
  imageUrl: null,
};

function SettingsModules({ notify }: { notify: Notify }) {
  const query = useGlobalSettings();
  if (query.isPending) return <LoadingState message="Carregando as configurações…" />;
  if (query.isError) {
    return (
      <div className={styles.error}>
        <ErrorState
          title="Não foi possível carregar as configurações"
          message={query.error.message}
        />
        <Button variant="secondary" onClick={() => void query.refetch()}>
          Tentar de novo
        </Button>
      </div>
    );
  }

  return (
    <>
      <BannerModule banner={query.data.banner ?? EMPTY_BANNER} notify={notify} />
      <DefaultCategoriesModule notify={notify} />
      <NotificationTemplatesModule templates={query.data.templates} notify={notify} />
      <GoalsModule goals={query.data.goals} notify={notify} />
    </>
  );
}

export function SettingsPage() {
  const { notice, notify, dismiss } = useSettingsNotice();

  return (
    <section className={styles.page}>
      <SettingsHeader />
      <SettingsModules notify={notify} />
      <Toast
        message={notice?.message ?? null}
        detail={notice?.detail}
        tone={notice?.tone}
        placement="top"
        onDismiss={dismiss}
      />
    </section>
  );
}
