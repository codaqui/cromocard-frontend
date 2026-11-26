import { useEffect, useState } from 'react';

import { connectSocket } from '@/lib/socket';

interface PresenceChange {
  userId: string;
  online: boolean;
}

type PresenceAck = { data: { online: string[] } } | { error: string };
type SetOnline = (update: (current: ReadonlySet<string>) => ReadonlySet<string>) => void;

export function withPresence(current: ReadonlySet<string>, { userId, online }: PresenceChange) {
  const next = new Set(current);
  if (online) next.add(userId);
  else next.delete(userId);
  return next;
}

function subscribe(userIds: string[], setOnline: SetOnline) {
  const socket = connectSocket();
  const ask = () => {
    socket.emit('presence:list', { userIds }, (ack: PresenceAck) => {
      if ('data' in ack) setOnline(() => new Set(ack.data.online));
    });
  };
  const change = (presence: PresenceChange) =>
    setOnline((current) => withPresence(current, presence));
  if (userIds.length > 0) ask();
  socket.on('connect', ask);
  socket.on('presence:changed', change);
  return () => {
    socket.off('connect', ask);
    socket.off('presence:changed', change);
  };
}

export function usePresence(userIds: readonly string[]): ReadonlySet<string> {
  const [online, setOnline] = useState<ReadonlySet<string>>(new Set());
  const key = userIds.join(',');

  useEffect(() => subscribe(key ? key.split(',') : [], setOnline), [key]);

  return online;
}
