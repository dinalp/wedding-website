// One navigation handoff only. Never persist in localStorage/sessionStorage or a URL.
let pendingVisit: string | null = null;
export function setPendingVisit(value: string | null) { pendingVisit = value; }
export function getPendingVisit() { return pendingVisit; }
