import { shuffle } from 'jshuffle';

export default class PlayView {
  constructor(app) {
    this.app = app;
    this.el = app.parse(`
    <article class="PlayView">
      <div class="TitleOutput Center"></div>
      <div class="Bar">
        <div class="CorrectOutput Center Correct"></div>
        <div class="IncorrectOutput Center Incorrect"></div>
      </div>
      <div class="QuestionTable"></div>
      <div class="Bar">
        <button class="CloseButton">❌ Close</button>
        <button class="ListenButton">▶️ Listen</button>
        <button class="StopButton">⏹ Stop</button>
      </div>
      </article>
    `);
    this.correctJudgmentOutput = this.app.parse('<div class="JudgmentOutput Center Correct">Correct</div>');
    this.incorrectJudgmentOutput = this.app.parse('<div class="JudgmentOutput Center Incorrect">Incorrect</div>');
    this.finishedJudgmentOutput = this.app.parse('<div class="JudgmentOutput Center Finished">Finished</div>');
    this.titleOutput = this.el.querySelector('.TitleOutput');
    this.correctOutput = this.el.querySelector('.CorrectOutput');
    this.incorrectOutput = this.el.querySelector('.IncorrectOutput');
    this.questionTable = this.el.querySelector('.QuestionTable');

    this.el.querySelector('.CloseButton').onclick = () => {
      this.stop();
      this.app.root.removeChild(this.el);
    };

    this.el.querySelector('.ListenButton').onclick = () => {
      this.listen();
    };

    this.el.querySelector('.StopButton').onclick = () => {
      this.stop();
    };
  }

  async show(book) {
    this.book = book;
    this.titleOutput.textContent = this.book.title;
    this.questionIndices = shuffle([...Array(this.book.questions.length).keys()]);
    this.correctCount = 0;
    this.incorrectCount = 0;
    this.updateCountOutput();
    const questionRows = [];
    for (const question of this.book.questions) {
      const questionRow = this.app.parse('<button></button>');
      questionRow.textContent = question.text;
      questionRow.onclick = async () => {
        if (this.correctCount < this.questionIndices.length) {
          if (this.book.questions[this.questionIndices[this.correctCount]]?.text === question.text) {
            this.correctCount++;
            this.updateCountOutput();
            if (this.correctCount < this.questionIndices.length) {
              await this.app.splash(this.correctJudgmentOutput, 1000);
              this.listen();
            } else {
              await this.app.splash(this.finishedJudgmentOutput, 2000);
            }
          } else {
            this.incorrectCount++;
            this.updateCountOutput();
            await this.app.splash(this.incorrectJudgmentOutput, 1000);
          }
        } else {
          this.speak(question);
        }
      };
      questionRows.push(questionRow);
    }
    this.questionTable.replaceChildren(...questionRows);
    this.app.root.appendChild(this.el);
    this.voice = null;
    if (this.book.voiceURI) {
      const voices = await this.app.getVoices();
      for (const voice of voices) {
        if (voice.voiceURI === this.book.voiceURI && voice.lang === this.book.lang) {
          this.voice = voice;
          break;
        }
      }
    }
    this.listen();
  }

  updateCountOutput() {
    this.correctOutput.textContent = 'Correct: ' + this.correctCount + ' / ' + this.questionIndices.length;
    this.incorrectOutput.textContent = 'Incorrect: ' + this.incorrectCount;
  }

  listen() {
    if (this.correctCount < this.questionIndices.length) {
      this.speak(this.book.questions[this.questionIndices[this.correctCount]]);
    }
  }

  speak(question) {
    this.stop();
    const uttr = this.app.newUtterance(question.reading || question.text);
    if (this.book.lang) {
      uttr.lang = this.book.lang;
    }
    if (this.voice) {
      uttr.voice = this.voice;
    }
    const pitch = parseFloat(this.book.pitch);
    if (isFinite(pitch)) {
      uttr.pitch = pitch;
    }
    const rate = parseFloat(this.book.rate);
    if (isFinite(rate)) {
      uttr.rate = rate;
    }
    const volume = parseFloat(this.book.volume);
    if (isFinite(volume)) {
      uttr.volume = volume;
    }
    this.app.speak(uttr);
  }

  stop() {
    this.app.stopSpeaking();
  }
}
