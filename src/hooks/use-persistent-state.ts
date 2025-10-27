import { Dispatch, SetStateAction, useEffect, useMemo, useRef, useState } from 'react';

type Initializer<T> = T | (() => T);

const resolveInitializer = <T,>(value: Initializer<T>): T =>
  typeof value === 'function' ? (value as () => T)() : value;

export interface PersistentStateMeta {
  isHydrated: boolean;
  hasStoredValue: boolean;
}

export function usePersistentState<T>(
  key: string | null,
  defaultValue: Initializer<T>,
): [T, Dispatch<SetStateAction<T>>, PersistentStateMeta] {
  const defaultRef = useRef<T>();

  if (defaultRef.current === undefined) {
    defaultRef.current = resolveInitializer(defaultValue);
  }

  const [value, setValue] = useState<T>(() => defaultRef.current as T);
  const [isHydrated, setIsHydrated] = useState<boolean>(false);
  const hasStoredValueRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      setIsHydrated(true);
      return;
    }

    if (!key) {
      hasStoredValueRef.current = false;
      setIsHydrated(true);
      return;
    }

    let cancelled = false;
    setIsHydrated(false);

    try {
      const stored = window.localStorage.getItem(key);
      if (stored !== null) {
        hasStoredValueRef.current = true;
        const parsed = JSON.parse(stored) as T;
        if (!cancelled) {
          setValue(parsed);
        }
      } else {
        hasStoredValueRef.current = false;
      }
    } catch (error) {
      console.error('Failed to read persisted state', error);
    } finally {
      if (!cancelled) {
        setIsHydrated(true);
      }
    }

    return () => {
      cancelled = true;
    };
  }, [key]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!key) return;
    if (!isHydrated) return;

    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      hasStoredValueRef.current = true;
    } catch (error) {
      console.error('Failed to persist state', error);
    }
  }, [key, value, isHydrated]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!key) return;

    const handler = (event: StorageEvent) => {
      if (event.storageArea !== window.localStorage) return;
      if (event.key !== key) return;
      if (event.newValue === event.oldValue) return;

      if (event.newValue === null) {
        hasStoredValueRef.current = false;
        setValue(defaultRef.current as T);
        return;
      }

      try {
        const parsed = JSON.parse(event.newValue) as T;
        hasStoredValueRef.current = true;
        setValue(parsed);
      } catch (error) {
        console.error('Failed to parse persisted state from storage event', error);
      }
    };

    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, [key]);

  const meta = useMemo<PersistentStateMeta>(
    () => ({
      isHydrated,
      hasStoredValue: hasStoredValueRef.current,
    }),
    [isHydrated],
  );

  return [value, setValue, meta];
}
