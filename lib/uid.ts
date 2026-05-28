// crypto.randomUUID() n'est dispo qu'en secure context (HTTPS / localhost).
// Sur LAN en HTTP (192.168.x.x) il est undefined → fallback.

export function uid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // ID local-unique suffisant pour des clés React éphémères
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
