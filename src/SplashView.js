export default class SplashView {
  constructor(app) {
    this.app = app;
    this.el = this.app.parse('<aside class="SplashView Center"></aside>');
  }

  show(slot, time) {
    this.el.replaceChildren(slot);
    this.app.root.appendChild(this.el);
    return new Promise((resolve) => {
      setTimeout(() => {
        this.app.root.removeChild(this.el);
        resolve();
      }, time);
    });
  }
}
