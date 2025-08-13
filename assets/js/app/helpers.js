(function(){
  window.APP = window.APP || {};

  function clearTicketDetail(els){
    if (!els.ticketDetail) return;
    if (els.tdDesc) els.tdDesc.innerHTML = '';
    if (els.tdRDOList) els.tdRDOList.innerHTML = '';
    if (els.tdMeta) els.tdMeta.innerHTML = '';
    if (els.tdEditForm) els.tdEditForm.innerHTML = '';
  }

  // Converte datas "YYYY-MM-DD" para o fim do dia local
  function parseDateLocal(str){
    if (!str) return new Date(NaN);
    if (typeof str === 'string' && str.length <= 10){
      const [y,m,d] = str.split('-').map(Number);
      return new Date(y, m-1, d, 23, 59, 59);
    }
    return new Date(str);
  }

  // === Datas robustas ===
  function parseDateSmart(v){
    if (!v) return null;
    if (v instanceof Date) return v;
    if (typeof v === 'number') return new Date(v);

    const s = String(v).trim();

    const iso = s.match(/^(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})(?:[ T].*)?$/);
    if (iso){
      const y = +iso[1], m = +iso[2]-1, d = +iso[3];
      return new Date(y, m, d);
    }

    const br = s.match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/);
    if (br){
      const d = +br[1], m = +br[2]-1, y = +br[3];
      return new Date(y, m, d);
    }

    const dt = new Date(s);
    return isNaN(dt.getTime()) ? null : dt;
  }

  // progresso de prazo (0..∞)
  function computeDeadlinePct(startDate, endDate, now = new Date()){
    const a = parseDateSmart(startDate);
    const b = parseDateSmart(endDate);
    if (!a || !b) return 0;

    const total = b.getTime() - a.getTime();
    if (total <= 0){
      return now > b ? 200 : 0;
    }

    const elapsed = now.getTime() - a.getTime();
    const pct = (elapsed / total) * 100;
    return Math.max(0, pct);
  }

  function cssVar(name){
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  function isAdminUser(){
    return window.CURRENT_ROLE === 'admin';
  }

  function esc(s){
    return String(s ?? '')
      .replace(/&/g,'&amp;').replace(/</g,'&lt;')
      .replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  }

  function ensureObsArray(item){
    if (!item.observacoes || item.observacoes.length === 0) {
      if (item.obs) item.observacoes = item.obs;
    }
    delete item.obs;
    if (typeof item.observacoes === 'string'){
      item.observacoes = [{ id: Date.now(), texto: item.observacoes, autor: 'sistema', criadoEm: new Date() }];
    }
    if (!Array.isArray(item.observacoes)){
      item.observacoes = [item.observacoes];
    }
    item.observacoes = item.observacoes.map((o,i) => ({
      id: o?.id ?? (Date.now()+i),
      texto: String(o?.texto ?? o?.text ?? o ?? ''),
      autor: o?.autor ?? o?.author ?? '—',
      criadoEm: o?.criadoEm ?? o?.createdAt ?? new Date(),
    }));
  }

  function findTicketById(id){
    return window.DATA?.tickets?.find(t => String(t.id) === String(id)) || null;
  }

  function setPageState(state){
    document.body.classList.remove('create-page','create-ticket-page','create-project-page');
    switch(state){
      case 'create-ticket':
        document.body.classList.add('create-page','create-ticket-page');
        break;
      case 'create-project':
        document.body.classList.add('create-page','create-project-page');
        break;
      default:
        break;
    }
  }

  function hideAllSections(){
    [
      'sectionTickets','sectionCharts','sectionProjects',
      'sectionCreateTicket','sectionCreateProject',
      'sectionArchivedTickets','sectionFinishedTickets',
      'sectionArchivedProjects','sectionFinishedProjects'
    ].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });
  }

  function renderObsList(owner, panelId, saveFn){
    ensureObsArray(owner);
    const admin = isAdminUser();
    const panel = document.getElementById(panelId);
    if (!panel) return;

    const wasActive = panel.classList.contains('active');

    const items = owner.observacoes;
    const listHtml = items.length ? `
      <ul id="${panelId}List" style="display:grid; gap:8px; margin-left:18px">
        ${items.map(o => `
          <li data-id="${o.id}" style="display:flex; gap:8px; align-items:flex-start">
            <div style="flex:1">
              <div style="font-size:13px; color:#cbd5e1">${esc(o.texto)}</div>
              <small style="color:#9aa0a6">${esc(o.autor)} • ${new Date(o.criadoEm).toLocaleDateString()}</small>
            </div>
            ${admin ? `
              <div class="actions-cell">
                <button class="btn btn-outline btn-sm" data-act="edit">Editar</button>
                <button class="btn btn-danger btn-sm" data-act="del">Excluir</button>
              </div>
            ` : ``}
          </li>
        `).join('')}
      </ul>
    ` : `
      <div id="${panelId}List"></div>
    `;

    const formHtml = admin ? `
      <div id="${panelId}Form" style="margin-top:10px">
        <textarea id="${panelId}Input" style="width:100%; min-height:100px; background:#0f131a; border:1px solid var(--card-border); border-radius:10px; color:var(--text); padding:10px" placeholder="Adicionar observação..."></textarea>
        <div class="actions" style="margin-top:6px">
          <button type="button" class="btn btn-primary btn-sm" id="${panelId}Add">Adicionar</button>
        </div>
      </div>
    ` : ``;

    panel.innerHTML = listHtml + formHtml;
    if (wasActive) { panel.classList.add('active'); panel.style.display = ''; }

    if (admin){
      const addBtn = document.getElementById(`${panelId}Add`);
      addBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        const ta = document.getElementById(`${panelId}Input`);
        const txt = (ta?.value || '').trim();
        if (!txt) return;
        owner.observacoes.push({
          id: Date.now(),
          texto: txt,
          autor: window.CURRENT_USER || 'admin',
          criadoEm: new Date()
        });
        saveFn(owner);
        renderObsList(owner, panelId, saveFn);
      });

      panel.addEventListener('click', (e) => {
        e.stopPropagation();
        const btn = e.target.closest('button[data-act]');
        if (!btn) return;
        const li = btn.closest('li[data-id]');
        if (!li) return;
        const id = li.getAttribute('data-id');
        const idx = owner.observacoes.findIndex(o => String(o.id) === String(id));
        if (idx < 0) return;

        if (btn.dataset.act === 'del'){
          owner.observacoes.splice(idx, 1);
          saveFn(owner);
          renderObsList(owner, panelId, saveFn);
        } else if (btn.dataset.act === 'edit'){
          const o = owner.observacoes[idx];
          li.innerHTML = `
            <div style="flex:1; display:grid; gap:6px">
              <textarea class="obs-edit" style="width:100%; min-height:100px; background:#0f131a; border:1px solid var(--card-border); border-radius:10px; color:var(--text); padding:10px">${esc(o.texto)}</textarea>
              <small style="color:#9aa0a6">${esc(o.autor)} • ${new Date(o.criadoEm).toLocaleDateString()}</small>
            </div>
            <div class="actions-cell">
              <button class="btn btn-outline btn-sm" data-act="cancel">Cancelar</button>
              <button class="btn btn-primary btn-sm" data-act="save">Salvar</button>
            </div>
          `;
          li.querySelector('[data-act="cancel"]').addEventListener('click', (ev) => { ev.stopPropagation(); renderObsList(owner, panelId, saveFn); });
          li.querySelector('[data-act="save"]').addEventListener('click', (ev) => {
            ev.stopPropagation();
            const nv = li.querySelector('.obs-edit').value.trim();
            owner.observacoes[idx].texto = nv;
            saveFn(owner);
            renderObsList(owner, panelId, saveFn);
          });
        }
      }, { once: true });
    }
  }

  function renderObservacoes(ticket){
    renderObsList(ticket, 'tdObs', t => DB.updateTicket(t.id, {observacoes: t.observacoes, obs: null}));
  }

  function renderProjectObservacoes(proj){
    renderObsList(proj, 'pdObs', p => DB.updateProject(p.id, {observacoes: p.observacoes, obs: null}));
  }

  function renderNotesList(owner, panelId, addFn, delFn){
    const panel = document.getElementById(panelId);
    if (!panel) return;
    const notes = owner.notes || (owner.notes = []);
    const admin = isAdminUser();
    const wasActive = panel.classList.contains('active');

    panel.innerHTML = `
      <ul id="${panelId}List" style="display:grid; gap:6px; margin-left:18px">
        ${notes.map((n,i)=>`
          <li data-idx="${i}" style="display:flex; gap:8px; align-items:flex-start">
            <div style="flex:1"><b>${esc(n.user)}:</b> ${esc(n.text)}</div>
            ${(admin || n.user === window.CURRENT_USER) ? `<button class="btn btn-danger btn-sm" data-act="del">Excluir</button>` : ''}
          </li>
        `).join('') || '<li>Nenhuma anotação.</li>'}
      </ul>
      <div id="${panelId}Form" style="margin-top:8px">
        <textarea id="${panelId}Input" style="width:100%; min-height:120px; background:#0f131a; border:1px solid var(--card-border); border-radius:10px; color:var(--text); padding:10px" placeholder="Anotações..."></textarea>
        <div class="actions" style="margin-top:6px">
          <button type="button" class="btn btn-primary btn-sm" id="${panelId}Add">Adicionar</button>
        </div>
      </div>`;

    if (wasActive) { panel.classList.add('active'); panel.style.display=''; }

    panel.querySelector(`#${panelId}Add`)?.addEventListener('click', e=>{
      e.stopPropagation();
      const ta = panel.querySelector(`#${panelId}Input`);
      const text = ta.value.trim();
      if (!text) return;
      addFn(owner, text);
      ta.value='';
      renderNotesList(owner, panelId, addFn, delFn);
    });

    panel.addEventListener('click', e=>{
      e.stopPropagation();
      const btn = e.target.closest('button[data-act="del"]');
      if (!btn) return;
      const li = btn.closest('li[data-idx]');
      if (!li) return;
      const idx = Number(li.dataset.idx);
      delFn(owner, idx);
      renderNotesList(owner, panelId, addFn, delFn);
    }, { once: true });
  }

  function renderTicketNotes(t){
    renderNotesList(
      t,
      'tdNotes',
      (owner, text) => DB.addTicketNote(owner.id, text, window.CURRENT_USER),
      (owner, idx) => DB.deleteTicketNote(owner.id, idx)
    );
  }

  function renderProjectNotes(p){
    renderNotesList(
      p,
      'pdNotes',
      (owner, text) => DB.addProjectNote(owner.id, text, window.CURRENT_USER),
      (owner, idx) => DB.deleteProjectNote(owner.id, idx)
    );
  }

  function show(sel){ const el=qs(sel); if(el) el.style.display=''; }
  function hide(sel){ const el=qs(sel); if(el) el.style.display='none'; }

  APP.helpers = {
    clearTicketDetail,
    parseDateLocal,
    parseDateSmart,
    computeDeadlinePct,
    cssVar,
    isAdminUser,
    esc,
    ensureObsArray,
    findTicketById,
    setPageState,
    hideAllSections,
    renderObsList,
    renderObservacoes,
    renderProjectObservacoes,
    renderNotesList,
    renderTicketNotes,
    renderProjectNotes,
    show,
    hide
  };
})();
