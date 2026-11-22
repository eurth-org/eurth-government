/**
 * Governmint's row of actions stands on the same line as its coin and name, which is the
 * suite's header: outside the tool's own part of the page. So the buttons are a component of
 * their own (Actions.svelte, placed in the header by pages/index.astro), and this is what they
 * share with the tool (App.svelte): what can be done just now, and how to do it.
 */
export const toolbar = $state({
  canUndo: false,
  canRedo: false,
  /** "Ctrl+" or "⌘", for the tooltips. */
  mod: 'Ctrl+',
  examples: () => {},
  undo: () => {},
  redo: () => {},
  save: () => {},
  about: () => {},
});
