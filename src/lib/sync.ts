'use client';

export interface DataChangeEvent {
  type: string;
  payload?: any;
  timestamp: number;
}

/**
 * Broadcasts a data change event to all components, tabs, windows, and WebViews
 */
export function broadcastDataChange(type: string, payload?: any) {
  if (typeof window === 'undefined') return;

  const eventData: DataChangeEvent = {
    type,
    payload,
    timestamp: Date.now()
  };

  try {
    // 1. Dispatch in-window CustomEvent
    window.dispatchEvent(new CustomEvent('rentify:data-updated', { detail: eventData }));

    // 2. Broadcast across tabs/windows via localStorage
    localStorage.setItem('rentify_last_data_sync', JSON.stringify(eventData));

    // 3. Broadcast across tabs via BroadcastChannel if supported
    if (typeof BroadcastChannel !== 'undefined') {
      const channel = new BroadcastChannel('rentify_sync_channel');
      channel.postMessage(eventData);
      setTimeout(() => {
        try {
          channel.close();
        } catch (_) {}
      }, 500);
    }
  } catch (err) {
    console.warn('Error broadcasting data change:', err);
  }
}

/**
 * Subscribes to all data change notifications across windows, tabs, and visibility changes
 */
export function subscribeToDataChanges(callback: (event: DataChangeEvent) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  // Handler for custom in-window event
  const handleCustomEvent = (e: Event) => {
    const customEvent = e as CustomEvent<DataChangeEvent>;
    if (customEvent.detail) {
      callback(customEvent.detail);
    } else {
      callback({ type: 'generic_update', timestamp: Date.now() });
    }
  };

  // Handler for cross-tab storage event
  const handleStorageEvent = (e: StorageEvent) => {
    if (e.key === 'rentify_last_data_sync' && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue);
        callback(parsed);
      } catch (_) {
        callback({ type: 'storage_update', timestamp: Date.now() });
      }
    }
  };

  // Handler for BroadcastChannel
  let broadcastChannel: BroadcastChannel | null = null;
  if (typeof BroadcastChannel !== 'undefined') {
    try {
      broadcastChannel = new BroadcastChannel('rentify_sync_channel');
      broadcastChannel.onmessage = (msgEvent) => {
        if (msgEvent.data) {
          callback(msgEvent.data);
        }
      };
    } catch (_) {}
  }

  // Window focus & visibility handlers (refetch whenever user switches back to this tab)
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      callback({ type: 'tab_visible_refetch', timestamp: Date.now() });
    }
  };

  const handleFocus = () => {
    callback({ type: 'window_focused_refetch', timestamp: Date.now() });
  };

  window.addEventListener('rentify:data-updated', handleCustomEvent);
  window.addEventListener('storage', handleStorageEvent);
  document.addEventListener('visibilitychange', handleVisibilityChange);
  window.addEventListener('focus', handleFocus);

  return () => {
    window.removeEventListener('rentify:data-updated', handleCustomEvent);
    window.removeEventListener('storage', handleStorageEvent);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    window.removeEventListener('focus', handleFocus);
    if (broadcastChannel) {
      try {
        broadcastChannel.close();
      } catch (_) {}
    }
  };
}
