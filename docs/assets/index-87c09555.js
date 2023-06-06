(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))s(i);new MutationObserver(i=>{for(const o of i)if(o.type==="childList")for(const l of o.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&s(l)}).observe(document,{childList:!0,subtree:!0});function e(i){const o={};return i.integrity&&(o.integrity=i.integrity),i.referrerPolicy&&(o.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?o.credentials="include":i.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function s(i){if(i.ep)return;i.ep=!0;const o=e(i);fetch(i.href,o)}})();class r{constructor({text:t="",reading:e=""}={}){this.text=t,this.reading=e}format(){return this.text+(this.reading?"|"+this.reading:"")}static parse(t){const e=t.split("|").map(s=>s.trim());return new r({text:e[0],reading:e[1]||""})}}class a{constructor({id:t,updatedAt:e,title:s="",questions:i=[],lang:o="",voiceURI:l="",pitch:d="",rate:m="",volume:f=""}={}){this.id=t,this.updatedAt=e,this.title=s,this.questions=i.map(v=>new r(v)),this.lang=o,this.voiceURI=l,this.pitch=d,this.rate=m,this.volume=f}static parse(t){const e={questions:[]};for(const s of t.split(`
`).map(i=>i.trim()))s&&(s[0]==="{"?Object.assign(e,JSON.parse(s)):e.questions.push(r.parse(s)));return new a(e)}}class g{constructor(t){this.app=t,this.el=this.app.parse(`
    <aside class="ConfirmView Center">
      <div class="ConfirmForm">
        <div class="MessageOutput Center"></div>
        <div class="Bar"></div>
      </div>
    </aside>
    `),this.messageOutput=this.el.querySelector(".MessageOutput"),this.bar=this.el.querySelector(".Bar")}show(t,e=["Cancel","OK"]){this.messageOutput.textContent=t;const s=[];for(let i=0;i<e.length;i++){const o=this.app.newElement("button",{textContent:e[i]});o.onclick=()=>{this.close(i)},s.push(o)}return this.bar.replaceChildren(...s),this.app.root.appendChild(this.el),new Promise(i=>{this.resolve=i})}close(t){this.resolve&&(this.app.root.removeChild(this.el),this.resolve(t),this.resolve=null)}}class p{constructor(t){this.app=t,this.el=t.parse(`
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
    `),this.correctJudgmentOutput=this.app.parse('<div class="JudgmentOutput Center Correct">Correct</div>'),this.incorrectJudgmentOutput=this.app.parse('<div class="JudgmentOutput Center Incorrect">Incorrect</div>'),this.finishedJudgmentOutput=this.app.parse('<div class="JudgmentOutput Center Finished">Finished</div>'),this.titleOutput=this.el.querySelector(".TitleOutput"),this.correctOutput=this.el.querySelector(".CorrectOutput"),this.incorrectOutput=this.el.querySelector(".IncorrectOutput"),this.questionTable=this.el.querySelector(".QuestionTable"),this.el.querySelector(".CloseButton").onclick=()=>{this.stop(),this.app.root.removeChild(this.el)},this.el.querySelector(".ListenButton").onclick=()=>{this.listen()},this.el.querySelector(".StopButton").onclick=()=>{this.stop()}}async show(t){this.book=t,this.titleOutput.textContent=this.book.title,this.questionIndices=S([...Array(this.book.questions.length).keys()]),this.correctCount=0,this.incorrectCount=0,this.updateCountOutput();const e=[];for(const s of this.book.questions){const i=this.app.parse("<button></button>");i.textContent=s.text,i.onclick=async()=>{var o;this.correctCount<this.questionIndices.length?((o=this.book.questions[this.questionIndices[this.correctCount]])==null?void 0:o.text)===s.text?(this.correctCount++,this.updateCountOutput(),this.correctCount<this.questionIndices.length?(await this.app.splash(this.correctJudgmentOutput,1e3),this.listen()):await this.app.splash(this.finishedJudgmentOutput,2e3)):(this.incorrectCount++,this.updateCountOutput(),await this.app.splash(this.incorrectJudgmentOutput,1e3)):this.speak(s)},e.push(i)}if(this.questionTable.replaceChildren(...e),this.app.root.appendChild(this.el),this.voice=null,this.book.voiceURI){const s=await this.app.getVoices();for(const i of s)if(i.voiceURI===this.book.voiceURI&&i.lang===this.book.lang){this.voice=i;break}}this.listen()}updateCountOutput(){this.correctOutput.textContent="Correct: "+this.correctCount+" / "+this.questionIndices.length,this.incorrectOutput.textContent="Incorrect: "+this.incorrectCount}listen(){this.correctCount<this.questionIndices.length&&this.speak(this.book.questions[this.questionIndices[this.correctCount]])}speak(t){this.stop();const e=this.app.newUtterance(t.reading||t.text);this.book.lang&&(e.lang=this.book.lang),this.voice&&(e.voice=this.voice);const s=parseFloat(this.book.pitch);isFinite(s)&&(e.pitch=s);const i=parseFloat(this.book.rate);isFinite(i)&&(e.rate=i);const o=parseFloat(this.book.volume);isFinite(o)&&(e.volume=o),this.app.speak(e)}stop(){this.app.stopSpeaking()}}function S(n,t,e){t<0&&(t+=n.length),t>=0||(t=0),e<0&&(e+=n.length),e<=n.length||(e=n.length);for(let s=e-t,i=e-1;s>=2;s--,i--){let o=t+Math.random()*s|0,l=n[i];n[i]=n[o],n[o]=l}return n}class u{constructor(t){this.app=t,this.el=t.parse(`
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
    `),this.titleInput=this.el.querySelector(".TitleInput"),this.questionsInput=this.el.querySelector(".QuestionsInput"),this.langSelect=this.el.querySelector(".LangSelect"),this.voiceSelect=this.el.querySelector(".VoiceSelect"),this.pitchSelect=this.el.querySelector(".PitchSelect"),this.pitchSelect.replaceChildren(...[...Array(21)].map((e,s)=>{const i=(s/10).toFixed(1);return this.app.newOption("Pitch: "+i,i)})),this.rateSelect=this.el.querySelector(".RateSelect"),this.rateSelect.replaceChildren(...[...Array(100)].map((e,s)=>{const i=((s+1)/10).toFixed(1);return this.app.newOption("Rate: "+i,i)})),this.volumeSelect=this.el.querySelector(".VolumeSelect"),this.volumeSelect.replaceChildren(...[...Array(11)].map((e,s)=>{const i=(s/10).toFixed(1);return this.app.newOption("Volume: "+i,i)})),this.langSelect.onchange=()=>{this.updateVoiceSelect()},this.el.querySelector(".CancelButton").onclick=()=>{this.close()},this.el.querySelector(".PlayButton").onclick=()=>{new p(this.app).show(this.buildBook())},this.el.querySelector(".EditForm").onsubmit=e=>{e.preventDefault(),this.close(t.putBook(this.buildBook()))}}buildBook(){const t=new a({id:this.id,title:this.titleInput.value.trim(),lang:this.langSelect.value,voiceURI:this.voiceSelect.value,pitch:this.pitchSelect.value,rate:this.rateSelect.value,volume:this.volumeSelect.value});for(const e of this.questionsInput.value.split(`
`).map(s=>s.trim()))e&&t.questions.push(r.parse(e));return t}async show(t){this.id=t==null?void 0:t.id,this.titleInput.value=(t==null?void 0:t.title)||"",this.questionsInput.value=(t==null?void 0:t.questions.map(s=>s.format()).join(`
`))||"",this.voicesMap=new Map;for(const s of(await this.app.getVoices()).sort((i,o)=>i.lang.localeCompare(o.lang))){const i=h(s.lang);let o=this.voicesMap.get(i);o||(o=[],this.voicesMap.set(i,o)),o.push(s)}const e=new Intl.DisplayNames([],{type:"language"});return this.langSelect.replaceChildren(...["",...this.voicesMap.keys()].map(s=>{let i;if(s){let o;try{o=e.of(s)}catch{o=s}i="["+s+"] "+o}else i="";return this.app.newOption(i,s)})),c(this.langSelect,h(t==null?void 0:t.lang)),this.updateVoiceSelect(),c(this.voiceSelect,t==null?void 0:t.voiceURI),c(this.pitchSelect,t==null?void 0:t.pitch,"1.0"),c(this.rateSelect,t==null?void 0:t.rate,"1.0"),c(this.volumeSelect,t==null?void 0:t.volume,"1.0"),this.app.root.appendChild(this.el),new Promise(s=>{this.resolveFunc=s})}updateVoiceSelect(){this.voiceSelect.replaceChildren(...[{name:"",localService:!0,voiceURI:""},...this.voicesMap.get(this.langSelect.value)||[]].map(t=>this.app.newOption(t.name+(t.localService?"":" (Remote)"),t.voiceURI)))}close(t){this.app.root.removeChild(this.el),this.resolveFunc(t)}}function h(n=""){if(n.includes("_")){const t=n.split(/[^0-9a-zA-Z]+/);t.length>2&&([t[1],t[2]]=[t[2],t[1]]),n=t.join("-")}return n}function c(n,t,e=""){(n.value=t)||(n.value=e)}class y{constructor(t){this.app=t,this.el=this.app.parse(`
    <article class="HomeView">
      <div class="TitleOutput Center"></div>
      <div class="BookTable"></div>
      <button class="NewButton">✍️ New</button>
    </article>
    `),this.el.querySelector(".TitleOutput").textContent=this.app.title+" "+this.app.version,this.bookTable=this.el.querySelector(".BookTable"),this.el.querySelector(".NewButton").onclick=async()=>{await new u(this.app).show()&&this.updateBookTable()}}show(){this.updateBookTable(),this.app.root.appendChild(this.el)}updateBookTable(){const t=[];for(const e of this.app.findBooks()){const s=this.app.parse(`
      <div class="BookRow">
        <output class="BookOutput" title="Play"></output>
        <button class="EditButton" title="Edit">✍️</button>
        <button class="DeleteButton" title="Delete">🗑</button>
      </div>
      `),i=s.querySelector(".BookOutput");i.textContent="▶️ "+e.title,i.onclick=()=>{new p(this.app).show(e)},s.querySelector(".EditButton").onclick=async()=>{await new u(this.app).show(e)&&this.updateBookTable()},s.querySelector(".DeleteButton").onclick=async()=>{await this.app.confirm(`Delete "${e.title}" ?`)&&(this.app.deleteBook(e.id),this.updateBookTable())},t.push(s)}this.bookTable.replaceChildren(...t)}}class w{constructor(t){this.app=t,this.el=this.app.parse('<aside class="SplashView Center"></aside>')}show(t,e){return this.el.replaceChildren(t),this.app.root.appendChild(this.el),new Promise(s=>{setTimeout(()=>{this.app.root.removeChild(this.el),s()},e)})}}class C{constructor(t){this.name="ttslistening",this.id=t||this.name,this.bookIdKey=this.id+"/bookId",this.booksPrefix=this.id+"/books/",this.title=document.title,this.version="0.0.1"}start(){if(this.root=document.getElementById(this.id)||document.body,this.root.classList.add(this.name),!localStorage.getItem(this.bookIdKey))for(const t of[`{"title":"Fruits"}
🍏
🍎
🍐
🍊
🍋
🍌
🍉
🍇
🍓
🫐
🍈
🍒
🍑
🥭
🍍
🥥
🥝`,`{"title":"Numbers"}
0
1
2
3
4
5
6
7
8
9`])this.putBook(a.parse(t));new y(this).show()}stop(){this.stopSpeaking()}parse(t){const e=document.createElement("template");return e.innerHTML=t.split(`
`).map(s=>s.trim()).join(""),e.content.firstChild}newElement(t,e){const s=document.createElement(t);return e&&Object.assign(s,e),s}newOption(t,e){return new Option(t,e)}confirm(t,e){return new g(this).show(t,e)}splash(t,e){return new w(this).show(t,e)}incrementBookId(){const t=+localStorage.getItem(this.bookIdKey)+1;return localStorage.setItem(this.bookIdKey,t),t}findBooks(){const t=[];for(let e=0;e<localStorage.length;e++){const s=localStorage.key(e);s.startsWith(this.booksPrefix)&&t.push(this.getBook(s))}return t.sort((e,s)=>s.updatedAt-e.updatedAt||s.id-e.id)}findBook(t){return this.getBook(this.booksPrefix+t)}getBook(t){const e=localStorage.getItem(t);return e?new a(JSON.parse(e)):null}putBook(t){return t.id||(t.id=this.incrementBookId()),t.updatedAt=Date.now(),localStorage.setItem(this.booksPrefix+t.id,JSON.stringify(t)),t.id}deleteBook(t){localStorage.removeItem(this.booksPrefix+t)}getVoices(){return new Promise((t,e)=>{const s=speechSynthesis.getVoices();s.length?t(s):speechSynthesis.addEventListener("voiceschanged",()=>{this.getVoices().then(i=>t(i),i=>e(i))},{once:!0})})}newUtterance(t){return new SpeechSynthesisUtterance(t)}speak(t){speechSynthesis.speak(t)}stopSpeaking(){speechSynthesis.cancel()}}addEventListener("DOMContentLoaded",()=>{onunhandledrejection=t=>alert(t.reason);const n=new C;n.start(),onpagehide=()=>{n.stop()}});
