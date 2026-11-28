import { useState } from 'react';

import type {
  ChannelChoice,
  NotificationEvent,
  NotificationPreferences,
} from '../notifications.types';

export type Channel = keyof ChannelChoice;

export function usePreferencesDraft(initial: NotificationPreferences) {
  const [draft, setDraft] = useState(initial);

  const setChannel = (channel: Channel, on: boolean) =>
    setDraft((current) => ({ ...current, channels: { ...current.channels, [channel]: on } }));

  const setEvent = (event: NotificationEvent, channel: Channel, on: boolean) =>
    setDraft((current) => ({
      ...current,
      events: current.events.map((item) =>
        item.event === event ? { ...item, [channel]: on } : item,
      ),
    }));

  const activeChannels = Object.values(draft.channels).filter(Boolean).length;

  return { draft, setChannel, setEvent, activeChannels, reset: () => setDraft(initial) };
}
