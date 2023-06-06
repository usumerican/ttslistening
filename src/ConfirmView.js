export default class ConfirmView {
  constructor(app) {
    this.app = app;
    this.el = this.app.parse(`
    <aside class="ConfirmView Center">
      <div class="ConfirmForm">
        <div class="MessageOutput Center"></div>
        <div class="Bar"></div>
      </div>
    </aside>
    `);
    this.messageOutput = this.el.querySelector('.MessageOutput');
    this.bar = this.el.querySelector('.Bar');
  }

  show(message, buttonTexts = ['Cancel', 'OK']) {
    this.messageOutput.textContent = message;
    const buttons = [];
    for (let i = 0; i < buttonTexts.length; i++) {
      const button = this.app.newElement('button', { textContent: buttonTexts[i] });
      button.onclick = () => {
        this.close(i);
      };
      buttons.push(button);
    }
    this.bar.replaceChildren(...buttons);
    this.app.root.appendChild(this.el);
    return new Promise((resolve) => {
      this.resolve = resolve;
    });
  }

  close(value) {
    if (this.resolve) {
      this.app.root.removeChild(this.el);
      this.resolve(value);
      this.resolve = null;
    }
  }
}
