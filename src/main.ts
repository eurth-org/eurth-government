import './app.css';
import { mount } from 'svelte';
import App from './App.svelte';
import { animateFavicon } from './ui/favicon';
import { clickDelights } from './ui/fun';
import { externalLinks } from './ui/ref';

mount(App, { target: document.getElementById('app')! });
animateFavicon();
clickDelights();
externalLinks();
