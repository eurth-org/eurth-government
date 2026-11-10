import './app.css';
import { mount } from 'svelte';
import App from './App.svelte';
import { clickDelights } from './ui/fun';
import { externalLinks } from './ui/ref';

mount(App, { target: document.getElementById('app')! });
clickDelights();
externalLinks();

// Offline: a copy of the site kept on the device (src/offline/sw.js), in the built site only.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}));
}
