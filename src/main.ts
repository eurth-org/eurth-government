import './app.css';
import { mount } from 'svelte';
import App from './App.svelte';
import { animateFavicon } from './ui/favicon';
import { clickDelights } from './ui/fun';

mount(App, { target: document.getElementById('app')! });
animateFavicon();
clickDelights();
