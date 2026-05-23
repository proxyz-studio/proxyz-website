// Vanta.js ships no type definitions. Local ambient declaration for the
// effect modules we use. The default export is the effect constructor.
//
// Each effect (vanta.net.min, vanta.waves.min, etc.) takes an options
// object including `el` (the mount target), `THREE` (the three module
// reference), and effect-specific tuning fields. Returns an instance
// with at minimum a `destroy()` method.

declare module 'vanta/dist/vanta.net.min' {
  interface VantaInstance {
    destroy(): void;
    resize?(): void;
    setOptions?(opts: Record<string, unknown>): void;
  }
  const NET: (options: Record<string, unknown>) => VantaInstance;
  export default NET;
}
