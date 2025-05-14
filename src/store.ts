// src/store.ts
import { NoteType } from './models';

interface State {
  book: string;
  chapter: string;
  tab: NoteType;
}

/**
 * Tiny pub-sub store to replace window globals.
 */
class Store {
  private state: State = { book: '', chapter: '', tab: 'outline' };
  private listeners = new Set<(s: State) => void>();

  get snapshot(): State {
    return { ...this.state };
  }

  set<K extends keyof State>(key: K, value: State[K]) {
    if (this.state[key] === value) return;
    this.state[key] = value;
    this.listeners.forEach((l) => l(this.snapshot));
  }

  subscribe(cb: (s: State) => void) {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }
}

export const store = new Store();
