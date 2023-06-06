import Book from './Book';
import PlayView from './PlayView';
import Question from './Question';

export default class EditView {
  constructor(app) {
    this.app = app;
    this.el = app.parse(`
    <article class="EditView">
      <form class="EditForm">
        <input class="TitleInput" placeholder="Title" required />
        <textarea class="QuestionsInput" placeholder="Question text or text|reading on each line" required></textarea>
        <label class="LangLabel">
          <output>Lang:</output>
          <select class="LangSelect"></select>
        </label>
        <label>
          <output>Voice:</output>
          <select class="VoiceSelect"></select>
        </label>
        <div class="Bar">
          <select class="PitchSelect"></select>
          <select class="RateSelect"></select>
          <select class="VolumeSelect"></select>
        </div>
        <div class="Bar">
          <button class="CancelButton" type="button">❌ Cancel</button>
          <button class="PlayButton" type="button">▶️ Play</button>
          <button class="SaveButton">✅ Save</button>
        </div>
      </form>
    </article>
    `);
    this.titleInput = this.el.querySelector('.TitleInput');
    this.questionsInput = this.el.querySelector('.QuestionsInput');
    this.langSelect = this.el.querySelector('.LangSelect');
    this.voiceSelect = this.el.querySelector('.VoiceSelect');
    this.pitchSelect = this.el.querySelector('.PitchSelect');
    this.pitchSelect.replaceChildren(
      ...[...Array(21)].map((_, i) => {
        const value = (i / 10).toFixed(1);
        return this.app.newOption('Pitch: ' + value, value);
      })
    );
    this.rateSelect = this.el.querySelector('.RateSelect');
    this.rateSelect.replaceChildren(
      ...[...Array(100)].map((_, i) => {
        const value = ((i + 1) / 10).toFixed(1);
        return this.app.newOption('Rate: ' + value, value);
      })
    );
    this.volumeSelect = this.el.querySelector('.VolumeSelect');
    this.volumeSelect.replaceChildren(
      ...[...Array(11)].map((_, i) => {
        const value = (i / 10).toFixed(1);
        return this.app.newOption('Volume: ' + value, value);
      })
    );

    this.langSelect.onchange = () => {
      this.updateVoiceSelect();
    };

    this.el.querySelector('.CancelButton').onclick = () => {
      this.close();
    };

    this.el.querySelector('.PlayButton').onclick = () => {
      new PlayView(this.app).show(this.buildBook());
    };

    this.el.querySelector('.EditForm').onsubmit = (event) => {
      event.preventDefault();
      this.close(app.putBook(this.buildBook()));
    };
  }

  buildBook() {
    const book = new Book({
      id: this.id,
      title: this.titleInput.value.trim(),
      lang: this.langSelect.value,
      voiceURI: this.voiceSelect.value,
      pitch: this.pitchSelect.value,
      rate: this.rateSelect.value,
      volume: this.volumeSelect.value,
    });
    for (const line of this.questionsInput.value.split('\n').map((line) => line.trim())) {
      if (line) {
        book.questions.push(Question.parse(line));
      }
    }
    return book;
  }

  async show(book) {
    this.id = book?.id;
    this.titleInput.value = book?.title || '';
    this.questionsInput.value = book?.questions.map((q) => q.format()).join('\n') || '';
    this.voicesMap = new Map();
    for (const voice of (await this.app.getVoices()).sort((a, b) => a.lang.localeCompare(b.lang))) {
      const lang = normalizeLang(voice.lang);
      let voices = this.voicesMap.get(lang);
      if (!voices) {
        voices = [];
        this.voicesMap.set(lang, voices);
      }
      voices.push(voice);
    }
    const langNames = new Intl.DisplayNames([], { type: 'language' });
    this.langSelect.replaceChildren(
      ...['', ...this.voicesMap.keys()].map((value) => {
        let text;
        if (value) {
          let name;
          try {
            name = langNames.of(value);
          } catch {
            name = value;
          }
          text = '[' + value + '] ' + name;
        } else {
          text = '';
        }
        return this.app.newOption(text, value);
      })
    );
    setSelectValue(this.langSelect, normalizeLang(book?.lang));
    this.updateVoiceSelect();
    setSelectValue(this.voiceSelect, book?.voiceURI);
    setSelectValue(this.pitchSelect, book?.pitch, '1.0');
    setSelectValue(this.rateSelect, book?.rate, '1.0');
    setSelectValue(this.volumeSelect, book?.volume, '1.0');
    this.app.root.appendChild(this.el);

    return new Promise((resolve) => {
      this.resolveFunc = resolve;
    });
  }

  updateVoiceSelect() {
    this.voiceSelect.replaceChildren(
      ...[{ name: '', localService: true, voiceURI: '' }, ...(this.voicesMap.get(this.langSelect.value) || [])].map(
        (voice) => {
          return this.app.newOption(voice.name + (voice.localService ? '' : ' (Remote)'), voice.voiceURI);
        }
      )
    );
  }

  close(value) {
    this.app.root.removeChild(this.el);
    this.resolveFunc(value);
  }
}

function normalizeLang(lang = '') {
  if (lang.includes('_')) {
    const tags = lang.split(/[^0-9a-zA-Z]+/);
    if (tags.length > 2) {
      [tags[1], tags[2]] = [tags[2], tags[1]];
    }
    lang = tags.join('-');
  }
  return lang;
}

function setSelectValue(target, value, defaultValue = '') {
  if (!(target.value = value)) {
    target.value = defaultValue;
  }
}
