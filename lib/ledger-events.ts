type LedgerScope = "dealer" | "customer" | "worker" | "cashbank" | "all";

type LedgerCallback = (scope: LedgerScope) => void;

const subscribers = new Map<number, LedgerCallback>();
let nextId = 0;

export function emitLedgerUpdated(scope: LedgerScope) {
  subscribers.forEach((cb) => cb(scope));
}

export function subscribeLedgerUpdated(cb: LedgerCallback): () => void {
  const id = nextId++;
  subscribers.set(id, cb);
  return () => subscribers.delete(id);
}