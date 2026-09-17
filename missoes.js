/* ===== [MISSOES] linhas originais 5113-5324 ===== */
/* ---------- Missões / Ganchos estruturados ---------- */
function updateHookButtons(active) {
  const ok = document.getElementById('btnConcludeHookSuccess');
  const fail = document.getElementById('btnConcludeHookFail');
  const day = document.getElementById('btnAdvanceDay');
  const hint = document.getElementById('hookHint');
  if (ok) ok.style.display = active ? '' : 'none';
  if (fail) fail.style.display = active ? '' : 'none';
  if (day) day.style.display = active ? '' : 'none';
  if (hint) hint.style.display = active ? '' : 'none';
}

function allObjectivesDone(hook) {
  return hook && hook.objetivos && hook.objetivos.every(o => o.feito);
}

function countDone(hook) {
  if (!hook || !hook.objetivos) return { done: 0, total: 0 };
  const done = hook.objetivos.filter(o => o.feito).length;
  return { done, total: hook.objetivos.length };
}

function tipoIcon(tipo) {
  return ({ conversar:'💬', matar:'⚔️', coletar:'📦', escoltar:'🛡️', explorar:'🧭', entregar:'📨' })[tipo] || '•';
}

function renderHookDisplay(hook, statusText) {
  const el = document.getElementById('hookDisplay');
  if (!el) return;
  if (!hook) {
    el.innerHTML = '<div style="color:var(--muted); font-style:italic; text-align:center;">Nenhuma missão ativa. Clique em gerar!</div>';
    return;
  }
  const { done, total } = countDone(hook);
  const dias = hook.diasRestantes ?? hook.dias ?? 0;
  const diasColor = dias <= 1 ? 'var(--danger)' : (dias <= 2 ? 'var(--accent)' : '#4ade80');
  const names = { taverna:'Taverna', cidade:'Cidade', esgotos:'Esgotos', ruinas:'Ruínas', masmorra:'Masmorra', minas:'Minas', floresta:'Floresta', ilhas:'Ilhas', deserto:'Deserto', montanha:'Montanhas' };
  const locais = (hook.locais || []).map(l => names[l] || l).join(', ');

  const objsHtml = (hook.objetivos || []).map((o, i) => `
    <label style="display:flex; align-items:flex-start; gap:8px; margin:6px 0; cursor:pointer; font-size:0.9rem;">
      <input type="checkbox" ${o.feito ? 'checked' : ''} onchange="toggleHookObjective(${i})" style="margin-top:3px; width:16px; height:16px;">
      <span style="${o.feito ? 'text-decoration:line-through; opacity:0.65;' : ''}">
        ${tipoIcon(o.tipo)} <strong>[${o.tipo}]</strong> ${o.desc}
      </span>
    </label>
  `).join('');

  const status = statusText
    ? `<div style="margin-top:10px; padding:8px 12px; border-radius:8px; background:rgba(168,85,247,0.12); border:1px solid var(--magic); font-size:0.85rem;">${statusText}</div>`
    : '';

  el.innerHTML = `
    <div style="display:flex; flex-wrap:wrap; justify-content:space-between; gap:8px; margin-bottom:8px;">
      <div style="font-size:1.15rem; font-weight:800; color:var(--magic);">${hook.titulo}</div>
      <div style="font-size:0.85rem;">
        <span style="background:var(--bg-card); border:1px solid var(--border); border-radius:8px; padding:4px 10px; margin-right:6px;">${hook.complexidade || 'Média'}</span>
        <span style="background:rgba(0,0,0,0.25); border:1px solid ${diasColor}; color:${diasColor}; border-radius:8px; padding:4px 10px; font-weight:800;">⏳ ${dias} dia(s)</span>
      </div>
    </div>
    <div style="font-size:0.95rem; line-height:1.5; margin-bottom:8px;">${hook.enredo}</div>
    <div style="font-size:0.8rem; color:var(--muted); margin-bottom:4px;"><strong>Tom:</strong> ${hook.tom}</div>
    <div style="font-size:0.8rem; color:var(--muted); margin-bottom:10px;"><strong>Locais sugeridos:</strong> ${locais || 'Qualquer'}</div>
    <div style="font-size:0.85rem; font-weight:700; margin-bottom:4px;">Objetivos (${done}/${total})</div>
    <div style="background:rgba(0,0,0,0.2); border-radius:10px; padding:10px 12px;">${objsHtml}</div>
    <div style="font-size:0.8rem; color:var(--muted); margin-top:10px;">
      Recompensa base: <strong>+${(hook.recompensa && hook.recompensa.xp) || 3} XP</strong> e <strong>${(hook.recompensa && hook.recompensa.ouro) || 50} Tibar</strong> por herói
      ${dias > 0 ? ` · Bônus se entregar cedo: +${dias} XP e +${dias * 10} Tibar` : ''}
    </div>
    ${status}
  `;
}

function toggleHookObjective(index) {
  if (!currentAdventureHook || !currentAdventureHook.objetivos || !currentAdventureHook.objetivos[index]) return;
  currentAdventureHook.objetivos[index].feito = !currentAdventureHook.objetivos[index].feito;
  renderHookDisplay(currentAdventureHook);
}

function generateAdventureHook() {
  if (currentAdventureHook && currentAdventureHook.status === 'ativo') {
    if (!confirm('Já existe uma missão ativa. Substituir por uma nova?')) return;
  }
  const base = ADVENTURE_HOOKS[Math.floor(Math.random() * ADVENTURE_HOOKS.length)];
  currentAdventureHook = JSON.parse(JSON.stringify(base));
  currentAdventureHook.objetivos = (base.objetivos || []).map(o => Object.assign({}, o, { feito: false }));
  currentAdventureHook.diasRestantes = base.dias;
  currentAdventureHook.startedAt = new Date().toISOString();
  currentAdventureHook.status = 'ativo';
  const sel = document.getElementById('biomeSelect');
  if (sel && currentAdventureHook.locais && currentAdventureHook.locais.length) {
    const prefer = currentAdventureHook.locais[0];
    if ([].slice.call(sel.options).some(o => o.value === prefer)) sel.value = prefer;
  }
  renderHookDisplay(currentAdventureHook);
  updateHookButtons(true);
}

function clearAdventureHook() {
  currentAdventureHook = null;
  renderHookDisplay(null);
  updateHookButtons(false);
}

function advanceHookDay() {
  if (!currentAdventureHook || currentAdventureHook.status !== 'ativo') return;
  if (!confirm('Gastar 1 dia de prazo da missão (sem gerar encontro)?')) return;
  spendHookDay('Ação fora de encontro');
}

function spendHookDay(reason) {
  if (!currentAdventureHook || currentAdventureHook.status !== 'ativo') return false;
  currentAdventureHook.diasRestantes = Math.max(0, (currentAdventureHook.diasRestantes != null ? currentAdventureHook.diasRestantes : currentAdventureHook.dias) - 1);
  renderHookDisplay(currentAdventureHook, reason ? ('Dia consumido: ' + reason) : null);

  if (currentAdventureHook.diasRestantes <= 0 && !allObjectivesDone(currentAdventureHook)) {
    const titulo = currentAdventureHook.titulo;
    currentEventDataForLog = {
      tipo: 'Missão ❌',
      titulo: 'Prazo esgotado: ' + titulo,
      desc: 'O tempo acabou. Objetivos incompletos. ' + currentAdventureHook.enredo,
      party: getSelectedPartyNames().join(', ')
    };
    try { saveCurrentEventToLog(); } catch (e) {}
    renderHookDisplay(currentAdventureHook, '❌ PRAZO ESGOTADO — missão falhou automaticamente.');
    updateHookButtons(false);
    currentAdventureHook = null;
    alert('⏳ O prazo da missão "' + titulo + '" chegou a zero.\\nObjetivos não cumpridos → MISSÃO FALHOU.\\nRegistrado no diário.');
    return true;
  }
  return false;
}

function concludeAdventureHook(success) {
  if (!currentAdventureHook) {
    alert('Não há missão ativa.');
    return;
  }
  const hook = currentAdventureHook;
  const titulo = hook.titulo;
  const dias = hook.diasRestantes != null ? hook.diasRestantes : 0;

  if (success) {
    if (!allObjectivesDone(hook)) {
      alert('Ainda há objetivos pendentes. Marque todos os checkboxes antes de entregar a missão com sucesso.');
      return;
    }
  }

  const baseXp = (hook.recompensa && hook.recompensa.xp) || 3;
  const baseOuro = (hook.recompensa && hook.recompensa.ouro) || 50;
  const bonusXp = success ? Math.max(0, dias) : 0;
  const bonusOuro = success ? Math.max(0, dias * 10) : 0;
  const totalXp = baseXp + bonusXp;
  const totalOuro = baseOuro + bonusOuro;

  const confirmMsg = success
    ? 'Entregar missão "' + titulo + '" com SUCESSO?\\n\\nRecompensa por herói: +' + totalXp + ' XP e ' + totalOuro + ' Tibar' +
      (bonusXp || bonusOuro ? '\\n(inclui bônus de ' + dias + ' dia(s) restante(s))' : '')
    : 'Abandonar/falhar a missão "' + titulo + '"?\\nSem recompensa. Registrado no diário.';
  if (!confirm(confirmMsg)) return;

  const party = getSelectedPartyChars();
  let rewardMsg = '';

  if (success) {
    if (party.length === 0) {
      rewardMsg = '\\n(Nenhum herói no grupo — selecione o grupo para receber a recompensa.)';
    } else {
      party.forEach(ch => {
        concederRecompensaAoPersonagem(ch.id, { tipo: 'xp', qtd: totalXp, nome: 'Missão: ' + titulo });
        concederRecompensaAoPersonagem(ch.id, { tipo: 'ouro', qtd: totalOuro, nome: 'Pagamento da missão' });
      });
      accumulatedXp += totalXp;
      totalSessionXp += totalXp;
      rewardMsg = '\\n+' + totalXp + ' XP e ' + totalOuro + ' Tibar para: ' + party.map(p => p.nome).join(', ');
      try { populateEncounterHeroes(); } catch (e) {}
    }
  }

  const cd = countDone(hook);
  currentEventDataForLog = {
    tipo: success ? 'Missão ✅' : 'Missão ❌',
    titulo: (success ? 'Sucesso' : 'Fracasso') + ': ' + titulo,
    desc: success
      ? ('Missão cumprida. Objetivos: ' + cd.done + '/' + cd.total + '. Dias restantes: ' + dias + '. ' + hook.enredo)
      : ('Missão falhou/abandonada. ' + hook.enredo),
    party: party.length ? party.map(p => p.nome).join(', ') : '—'
  };
  try { saveCurrentEventToLog(); } catch (e) {}

  let falhaMsg = '';
  if (!success) {
    try {
      if (typeof aplicarConsequenciaFalhaSolo === 'function') {
        const r = aplicarConsequenciaFalhaSolo({
          fonte: 'gancho',
          label: titulo,
          heroIds: party.map(p => p.id).filter(Boolean)
        });
        if (r && r.texto) falhaMsg = '\n' + r.texto;
      }
    } catch (e) {}
  }

  renderHookDisplay(hook, success ? ('✅ MISSÃO CUMPRIDA.' + rewardMsg) : '❌ Missão falhou ou foi abandonada.');
  updateHookButtons(false);
  currentAdventureHook = null;
  updateSessionDisplays();
  alert((success ? 'SUCESSO' : 'FRACASSO') + ': "' + titulo + '"' + rewardMsg + falhaMsg);
}

