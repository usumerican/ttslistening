import EditView from './EditView';
import PlayView from './PlayView';

export default class HomeView {
  constructor(app) {
    this.app = app;
    this.el = this.app.parse(`
    <article class="HomeView">
      <div class="TitleOutput Center"></div>
      <div class="BookTable"></div>
      <button class="NewButton">✍️ New</button>
    </article>
    `);
    this.el.querySelector('.TitleOutput').textContent = this.app.title + ' ' + this.app.version;
    this.bookTable = this.el.querySelector('.BookTable');

    this.el.querySelector('.NewButton').onclick = async () => {
      if (await new EditView(this.app).show()) {
        this.updateBookTable();
      }
    };
  }

  show() {
    this.updateBookTable();
    this.app.root.appendChild(this.el);
  }

  updateBookTable() {
    const bookRows = [];
    for (const book of this.app.findBooks()) {
      const bookRow = this.app.parse(`
      <div class="BookRow">
        <output class="BookOutput" title="Play"></output>
        <button class="EditButton" title="Edit">✍️</button>
        <button class="DeleteButton" title="Delete">🗑</button>
      </div>
      `);
      const bookOutput = bookRow.querySelector('.BookOutput');
      bookOutput.textContent = '▶️ ' + book.title;
      bookOutput.onclick = () => {
        new PlayView(this.app).show(book);
      };
      bookRow.querySelector('.EditButton').onclick = async () => {
        if (await new EditView(this.app).show(book)) {
          this.updateBookTable();
        }
      };
      bookRow.querySelector('.DeleteButton').onclick = async () => {
        if (await this.app.confirm(`Delete "${book.title}" ?`)) {
          this.app.deleteBook(book.id);
          this.updateBookTable();
        }
      };
      bookRows.push(bookRow);
    }
    this.bookTable.replaceChildren(...bookRows);
  }
}
