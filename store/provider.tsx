'use client';

import { useRef, useEffect } from 'react';
import { Provider } from 'react-redux';
import { makeStore, type AppStore } from './index';
import { setCredentials } from './slices/authSlice';

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const storeRef = useRef<AppStore>(null!);
  if (!storeRef.current) {
    storeRef.current = makeStore();
  }

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const username = localStorage.getItem('auth_username');
    const userId = localStorage.getItem('auth_user_id');
    if (token && username) {
      storeRef.current.dispatch(
        setCredentials({
          token,
          username,
          userId: userId ? parseInt(userId, 10) : 0,
        })
      );
    }
  }, []);

  return <Provider store={storeRef.current}>{children}</Provider>;
}
