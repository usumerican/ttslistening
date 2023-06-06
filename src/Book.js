import Question from './Question';

export default class Book {
  constructor({
    id,
    updatedAt,
    title = '',
    questions = [],
    lang = '',
    voiceURI = '',
    pitch = '',
    rate = '',
    volume = '',
  } = {}) {
    this.id = id;
    this.updatedAt = updatedAt;
    this.title = title;
    this.questions = questions.map((q) => new Question(q));
    this.lang = lang;
    this.voiceURI = voiceURI;
    this.pitch = pitch;
    this.rate = rate;
    this.volume = volume;
  }

  static parse(text) {
    const data = { questions: [] };
    for (const line of text.split('\n').map((line) => line.trim())) {
      if (line) {
        if (line[0] === '{') {
          Object.assign(data, JSON.parse(line));
        } else {
          data.questions.push(Question.parse(line));
        }
      }
    }
    return new Book(data);
  }
}
