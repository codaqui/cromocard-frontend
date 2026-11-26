import { useState } from 'react';

import { ErrorState } from '@/components/ErrorState/ErrorState';
import { Icon } from '@/components/Icon/Icon';
import { LoadingState } from '@/components/LoadingState/LoadingState';
import { cn } from '@/utils/cn';

import { chatTexts } from '../../chat.labels';
import {
  ConversationList,
  type ConversationListProps,
} from '../../components/ConversationList/ConversationList';
import { ConversationView } from '../../components/ConversationView/ConversationView';
import { NewConversationModal } from '../../components/NewConversationModal/NewConversationModal';
import styles from './MessagesPage.module.css';
import { type MessagesPageState, useMessagesPage } from './useMessagesPage';

function PageTitle() {
  return (
    <header className={styles.title}>
      <span className={styles.eyebrow}>{chatTexts.eyebrow}</span>
      <span className={styles.separator} aria-hidden="true">
        •
      </span>
      <h1 className={styles.subtitle}>{chatTexts.subtitle}</h1>
    </header>
  );
}

function Placeholder({ empty }: { empty: boolean }) {
  return (
    <div className={styles.placeholder}>
      <Icon name="chatBubbleOutline" size={28} />
      {empty ? (
        <>
          <h2 className={styles.placeholderTitle}>{chatTexts.emptyTitle}</h2>
          <p className={styles.placeholderText}>{chatTexts.emptyMessage}</p>
        </>
      ) : (
        <p className={styles.placeholderText}>{chatTexts.selectConversation}</p>
      )}
    </div>
  );
}

function OpenPanel({ page }: { page: MessagesPageState }) {
  const { opened, user } = page;
  const empty = page.conversations.data?.meta.totals.all === 0;
  if (!opened || !user) return <Placeholder empty={empty} />;
  return (
    <ConversationView
      key={opened.id}
      conversation={opened}
      currentUserId={user.id}
      online={page.online.has(opened.contact.id)}
      onBack={() => page.open(null)}
    />
  );
}

function listPropsOf(
  page: MessagesPageState,
  onNewConversation: () => void,
): ConversationListProps {
  return {
    conversations: page.items,
    totals: page.conversations.data?.meta.totals ?? { all: 0, unread: 0 },
    filter: page.filter,
    search: page.search,
    activeId: page.openId,
    online: page.online,
    onFilterChange: page.setFilter,
    onSearchChange: page.setSearch,
    onSelect: page.open,
    onNewConversation,
  };
}

function Columns({
  page,
  onNewConversation,
}: {
  page: MessagesPageState;
  onNewConversation: () => void;
}) {
  return (
    <div className={cn(styles.columns, page.opened && styles.conversationOpen)}>
      <ConversationList {...listPropsOf(page, onNewConversation)} />
      <OpenPanel page={page} />
    </div>
  );
}

function Content({
  page,
  onNewConversation,
}: {
  page: MessagesPageState;
  onNewConversation: () => void;
}) {
  if (page.conversations.isError) return <ErrorState message={chatTexts.loadError} />;
  if (!page.conversations.data) return <LoadingState />;
  return <Columns page={page} onNewConversation={onNewConversation} />;
}

export function MessagesPage() {
  const page = useMessagesPage();
  const [creating, setCreating] = useState(false);
  const started = (conversationId: string) => {
    setCreating(false);
    page.open(conversationId);
  };
  return (
    <div className={styles.page}>
      <PageTitle />
      <Content page={page} onNewConversation={() => setCreating(true)} />
      {creating && (
        <NewConversationModal
          recent={page.items.map(({ contact }) => contact)}
          onStarted={started}
          onClose={() => setCreating(false)}
        />
      )}
    </div>
  );
}
