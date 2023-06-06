/* eslint-env browser */

import App from './App';

addEventListener('DOMContentLoaded', () => {
  onunhandledrejection = (ev) => alert(ev.reason);

  const app = new App();
  app.start();

  onpagehide = () => {
    app.stop();
  };
});
