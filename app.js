(function(){
  const VIDEOS = window.VIDEOS || [];
  const KEY = "estudo:" + window.STORAGE_KEY;
  const estado = JSON.parse(localStorage.getItem(KEY) || '{"vistos":{},"notas":{}}');
  const salvar = () => localStorage.setItem(KEY, JSON.stringify(estado));
  const ic = id => `<svg aria-hidden="true"><use href="#${id}"/></svg>`;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const dur = s => s ? `${Math.floor(s/60)}:${String(s%60).padStart(2,"0")} min` : "";
  const toastEl = document.getElementById("toast"); let tt;
  const toast = m => { toastEl.textContent = m; toastEl.classList.add("on"); clearTimeout(tt); tt = setTimeout(() => toastEl.classList.remove("on"), 1500); };

  function progresso(){
    const f = VIDEOS.filter(v => estado.vistos[v.id]).length, p = VIDEOS.length ? Math.round(f / VIDEOS.length * 100) : 0;
    document.getElementById("feitos").textContent = f;
    document.getElementById("total").textContent = VIDEOS.length;
    document.getElementById("pct").textContent = p + "%";
    document.getElementById("barra").style.width = p + "%";
  }

  const lista = document.getElementById("lista");
  lista.innerHTML = VIDEOS.map(v => {
    const visto = !!estado.vistos[v.id], nota = estado.notas[v.id] || "";
    return `<article class="card${visto ? " visto" : ""}" data-id="${v.id}">
      <div class="linha1">
        <span class="num">${String(v.numero).padStart(2, "0")}</span>
        <div class="info"><a class="titulo" href="${v.url}" target="_blank" rel="noopener">${esc(v.titulo)}</a><span class="dur">${dur(v.duracao)}</span></div>
        <button class="check" aria-pressed="${visto}" aria-label="Marcar como assistido">${ic("i-check")}</button>
      </div>
      <div class="acoes">
        <a class="ic play" href="${v.url}" target="_blank" rel="noopener" aria-label="Assistir no YouTube">${ic("i-play")}</a>
        <button class="ic copiar" aria-label="Copiar link">${ic("i-link")}</button>
        ${v.transcricao
          ? `<a class="ic" href="${v.transcricao}" download aria-label="Baixar transcrição">${ic("i-download")}</a>`
          : `<span class="ic" aria-disabled="true" aria-label="Sem transcrição">${ic("i-download")}</span>`}
        <button class="ic nota-btn${nota ? " tem" : ""}" aria-label="Anotação" aria-expanded="false">${ic("i-note")}</button>
      </div>
      <div class="nota"><textarea aria-label="Anotação do vídeo" placeholder="Sua anotação...">${esc(nota)}</textarea></div>
    </article>`;
  }).join("");

  lista.querySelectorAll(".card").forEach(card => {
    const id = card.dataset.id, v = VIDEOS.find(x => x.id === id);
    card.querySelector(".copiar").onclick = async () => {
      try { await navigator.clipboard.writeText(v.url); }
      catch(e){ const t = document.createElement("textarea"); t.value = v.url; document.body.appendChild(t); t.select(); document.execCommand("copy"); t.remove(); }
      toast("Link copiado");
    };
    const chk = card.querySelector(".check");
    chk.onclick = () => {
      const on = !estado.vistos[id];
      on ? (estado.vistos[id] = Date.now()) : delete estado.vistos[id];
      salvar(); chk.setAttribute("aria-pressed", on); card.classList.toggle("visto", on); progresso();
    };
    const nb = card.querySelector(".nota-btn"), box = card.querySelector(".nota"), ta = box.querySelector("textarea");
    nb.onclick = () => { const ab = box.classList.toggle("aberta"); nb.setAttribute("aria-expanded", ab); nb.classList.toggle("on", ab); if (ab) ta.focus(); };
    let t; ta.oninput = () => { clearTimeout(t); t = setTimeout(() => {
      const val = ta.value.trim(); val ? (estado.notas[id] = ta.value) : delete estado.notas[id];
      salvar(); nb.classList.toggle("tem", !!val); }, 300); };
  });
  progresso();
})();
