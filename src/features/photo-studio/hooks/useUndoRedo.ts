import { useState, useCallback } from 'react';

export function useUndoRedo<T>(initial: T, limit = 30) {
  const [past, setPast] = useState<T[]>([]);
  const [present, setPresent] = useState<T>(initial);
  const [future, setFuture] = useState<T[]>([]);

  const canUndo = past.length > 0;
  const canRedo = future.length > 0;

  const push = useCallback((newPresent: T) => {
    setPast(p => {
      const next = [...p, present];
      if (next.length > limit) next.shift();
      return next;
    });
    setPresent(newPresent);
    setFuture([]);
  }, [present, limit]);

  const undo = useCallback(() => {
    if (!canUndo) return present;
    const previous = past[past.length - 1];
    const newPast = past.slice(0, -1);
    setPast(newPast);
    setFuture(f => [present, ...f]);
    setPresent(previous);
    return previous;
  }, [past, present, canUndo]);

  const redo = useCallback(() => {
    if (!canRedo) return present;
    const next = future[0];
    const newFuture = future.slice(1);
    setPast(p => [...p, present]);
    setPresent(next);
    setFuture(newFuture);
    return next;
  }, [future, present, canRedo]);

  const reset = useCallback((value: T) => {
    setPast([]);
    setPresent(value);
    setFuture([]);
  }, []);

  return { present, push, undo, redo, canUndo, canRedo, reset, setPresent };
}
