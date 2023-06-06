/* eslint-env browser */
/* global __APP_VERSION__ */

import Book from './Book';
import ConfirmView from './ConfirmView';
import HomeView from './HomeView';
import SplashView from './SplashView';

export default class App {
  constructor(id) {
    this.name = 'ttslistening';
    this.id = id || this.name;
    this.bookIdKey = this.id + '/bookId';
    this.booksPrefix = this.id + '/books/';
    this.title = document.title;
    this.version = __APP_VERSION__;
  }

  start() {
    this.root = document.getElementById(this.id) || document.body;
    this.root.classList.add(this.name);
    if (!localStorage.getItem(this.bookIdKey)) {
      for (const text of [
        '{"title":"Fruits"}\n🍏\n🍎\n🍐\n🍊\n🍋\n🍌\n🍉\n🍇\n🍓\n🫐\n🍈\n🍒\n🍑\n🥭\n🍍\n🥥\n🥝',
        '{"title":"Numbers"}\n0\n1\n2\n3\n4\n5\n6\n7\n8\n9',
      ]) {
        this.putBook(Book.parse(text));
      }
    }
    new HomeView(this).show();
  }

  stop() {
    this.stopSpeaking();
  }

  parse(html) {
    const template = document.createElement('template');
    template.innerHTML = html
      .split('\n')
      .map((line) => line.trim())
      .join('');
    return template.content.firstChild;
  }

  newElement(tag, props) {
    const el = document.createElement(tag);
    if (props) {
      Object.assign(el, props);
    }
    return el;
  }

  newOption(text, value) {
    return new Option(text, value);
  }

  confirm(message, buttonTexts) {
    return new ConfirmView(this).show(message, buttonTexts);
  }

  splash(slot, time) {
    return new SplashView(this).show(slot, time);
  }

  incrementBookId() {
    const id = +localStorage.getItem(this.bookIdKey) + 1;
    localStorage.setItem(this.bookIdKey, id);
    return id;
  }

  findBooks() {
    const books = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith(this.booksPrefix)) {
        books.push(this.getBook(key));
      }
    }
    return books.sort((a, b) => b.updatedAt - a.updatedAt || b.id - a.id);
  }

  findBook(id) {
    return this.getBook(this.booksPrefix + id);
  }

  getBook(key) {
    const item = localStorage.getItem(key);
    if (item) {
      return new Book(JSON.parse(item));
    }
    return null;
  }

  putBook(book) {
    if (!book.id) {
      book.id = this.incrementBookId();
    }
    book.updatedAt = Date.now();
    localStorage.setItem(this.booksPrefix + book.id, JSON.stringify(book));
    return book.id;
  }

  deleteBook(id) {
    localStorage.removeItem(this.booksPrefix + id);
  }

  getVoices() {
    return new Promise((resolve, reject) => {
      const voices = speechSynthesis.getVoices();
      if (voices.length) {
        resolve(voices);
      } else {
        speechSynthesis.addEventListener(
          'voiceschanged',
          () => {
            this.getVoices().then(
              (voices) => resolve(voices),
              (reason) => reject(reason)
            );
          },
          { once: true }
        );
      }
    });
  }

  newUtterance(text) {
    return new SpeechSynthesisUtterance(text);
  }

  speak(uttr) {
    speechSynthesis.speak(uttr);
  }

  stopSpeaking() {
    speechSynthesis.cancel();
  }
}
