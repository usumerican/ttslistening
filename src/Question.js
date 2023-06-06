export default class Question {
  constructor({ text = '', reading = '' } = {}) {
    this.text = text;
    this.reading = reading;
  }

  format() {
    return this.text + (this.reading ? '|' + this.reading : '');
  }

  static parse(line) {
    const values = line.split('|').map((value) => value.trim());
    return new Question({ text: values[0], reading: values[1] || '' });
  }
}
