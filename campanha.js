/* ===== [MARCOS] linhas originais 5448-5650 ===== */
/* ==================== MARCOS DE CAMPANHA ====================
 * A cada 5 vitórias de sessão (acumuladas na campanha) ou a cada 10 dias:
 * concede título narrativo, vantagem menor e pode sugerir relógio.
 */
const MARCOS_TITULOS = [
  { id: 'iniciante', titulo: 'Aspirante das Crônicas', vantagem: '+1 XP de sessão na próxima vitória', xpBonus: 1 },
  { id: 'conhecido', titulo: 'Nome nos Bares', vantagem: '+5 Tibar por herói do grupo', ouro: 5 },
  { id: 'respeitado', titulo: 'Respeitado nas Estradas', vantagem: '+1 mantimento por herói', mant: 1 },
  { id: 'temido', titulo: 'Sombra nas Guildas', vantagem: '+3 reputação Aventureiros', rep: { faction: 'aventureiros', delta: 3 } },
  { id: 'heroi_local', titulo: 'Herói Local', vantagem: '+1 reputação Povo e Guarda', repMulti: [{ faction: 'povo', delta: 1 }, { faction: 'guarda', delta: 1 }] },
  { id: 'lenda', titulo: 'Eco de Lenda', vantagem: '+2 XP bancados no próximo bank', xpBank: 2 },
  { id: 'veterano', titulo: 'Veterano de Guerra', vantagem: 'Próximo rival enfrenta −1 P (narrativo/manual)', tip: 'rival_fraco' },
  { id: 'cronista', titulo: 'Cronista Vivo', vantagem: 'Sugestão de relógio de ameaça criada', clock: true }
];

function getMarcosState() {
  try {
    const st = storeGetJSON(KEYS.marcos, null);
    if (!st || typeof st !== 'object') {
      return { totalVictories: 0, lastVictoryMarco: 0, lastDayMarco: 0, titulos: [], history: [] };
    }
    return {
      totalVictories: st.totalVictories || 0,
      lastVictoryMarco: st.lastVictoryMarco || 0,
      lastDayMarco: st.lastDayMarco || 0,
      titulos: Array.isArray(st.titulos) ? st.titulos : [],
      history: Array.isArray(st.history) ? st.history : []
    };
  } catch (e) {
    return { totalVictories: 0, lastVictoryMarco: 0, lastDayMarco: 0, titulos: [], history: [] };
  }
}
function setMarcosState(st) {
  try { storeSet(KEYS.marcos, st); } catch (e) {}
}

function aplicarVantagemMarco(marco) {
  const lines = [];
  try {
    const chars = typeof getSelectedPartyChars === 'function' ? getSelectedPartyChars() : [];
    if (marco.xpBonus && typeof accumulatedXp === 'number') {
      accumulatedXp += marco.xpBonus;
      lines.push('+' + marco.xpBonus + ' XP de sessão');
      try { if (typeof updateSessionDisplays === 'function') updateSessionDisplays(); } catch (e) {}
    }
    if (marco.xpBank && typeof accumulatedXp === 'number') {
      accumulatedXp += marco.xpBank;
      lines.push('+' + marco.xpBank + ' XP banco');
      try { if (typeof updateSessionDisplays === 'function') updateSessionDisplays(); } catch (e) {}
    }
    if (marco.ouro && chars.length && typeof getSaved === 'function') {
      let list = getSaved();
      chars.forEach(ch => {
        const idx = list.findIndex(c => c.id === ch.id);
        if (idx >= 0) list[idx].ouro = (list[idx].ouro || 0) + marco.ouro;
      });
      setSaved(list);
      lines.push('+' + marco.ouro + ' Tibar por herói');
    }
    if (marco.mant && chars.length && typeof addMantimentos === 'function') {
      chars.forEach(ch => addMantimentos(ch.id, marco.mant));
      lines.push('+' + marco.mant + ' mantimento(s) por herói');
    }
    if (marco.rep && typeof changeReputation === 'function') {
      changeReputation(marco.rep.faction, marco.rep.delta, 'Marco: ' + marco.titulo, true);
      lines.push('Reputação ' + marco.rep.faction + ' ' + (marco.rep.delta >= 0 ? '+' : '') + marco.rep.delta);
    }
    if (marco.repMulti && typeof changeReputation === 'function') {
      marco.repMulti.forEach(r => {
        changeReputation(r.faction, r.delta, 'Marco: ' + marco.titulo, true);
        lines.push('Reputação ' + r.faction + ' ' + (r.delta >= 0 ? '+' : '') + r.delta);
      });
    }
    if (marco.clock && typeof getOracleState === 'function') {
      try {
        const state = getOracleState();
        state.clocks = state.clocks || [];
        const presets = ['invasao', 'igreja', 'submundo', 'praga'];
        const key = presets[Math.floor(Math.random() * presets.length)];
        const p = (typeof CLOCK_PRESETS !== 'undefined' && CLOCK_PRESETS[key]) ? CLOCK_PRESETS[key] : null;
        state.clocks.push({
          name: (p && p.name) || 'Ameaça do Marco',
          progress: 0,
          segments: (p && p.segments) || 6,
          consequence: (p && p.consequence) || 'Ameaça ligada ao marco de campanha.',
          preset: key,
          repOnComplete: (p && p.repOnComplete) ? p.repOnComplete.slice() : [],
          id: 'clk_marco_' + Date.now().toString(36)
        });
        setOracleState(state);
        lines.push('Relógio criado: ' + ((p && p.name) || key));
        try { if (typeof renderOracleClocks === 'function') renderOracleClocks(); } catch (e) {}
      } catch (e) {}
    }
  } catch (e) {
    console.warn('aplicarVantagemMarco', e);
  }
  return lines;
}

/**
 * Dispara marco se thresholds forem atingidos.
 * fonte: 'vitoria' | 'dia'
 */
function verificarMarcosCampanha(fonte) {
  try {
    const st = getMarcosState();
    let ganhou = null;

    if (fonte === 'vitoria') {
      st.totalVictories = (st.totalVictories || 0) + 1;
      // a cada 5 vitórias acumuladas de campanha
      if (st.totalVictories > 0 && st.totalVictories % 5 === 0 && st.lastVictoryMarco !== st.totalVictories) {
        st.lastVictoryMarco = st.totalVictories;
        ganhou = 'vitoria';
      }
    }

    if (fonte === 'dia') {
      const day = (typeof timeState !== 'undefined' && timeState) ? (timeState.day || 1) : 1;
      if (day > 0 && day % 10 === 0 && st.lastDayMarco !== day) {
        st.lastDayMarco = day;
        ganhou = 'dia';
      }
    }

    if (!ganhou) {
      setMarcosState(st);
      return null;
    }

    // Escolhe título ainda não obtido, senão aleatório
    const usados = new Set(st.titulos.map(t => t.id));
    let pool = MARCOS_TITULOS.filter(t => !usados.has(t.id));
    if (!pool.length) pool = MARCOS_TITULOS.slice();
    const marco = pool[Math.floor(Math.random() * pool.length)];
    const bonusLines = aplicarVantagemMarco(marco);

    const entry = {
      id: marco.id,
      titulo: marco.titulo,
      vantagem: marco.vantagem,
      fonte: ganhou,
      day: (typeof timeState !== 'undefined' && timeState) ? timeState.day : 1,
      time: new Date().toLocaleString('pt-BR'),
      totalVictories: st.totalVictories
    };
    st.titulos.push(entry);
    st.history.unshift(entry);
    if (st.history.length > 30) st.history = st.history.slice(0, 30);
    setMarcosState(st);

    const msg = '🏆 MARCO DE CAMPANHA!\n\n«' + marco.titulo + '»\n' + marco.vantagem +
      (bonusLines.length ? '\n\nAplicado:\n· ' + bonusLines.join('\n· ') : '') +
      '\n\nMotivo: ' + (ganhou === 'vitoria' ? st.totalVictories + ' vitórias acumuladas' : 'Dia ' + entry.day);

    setTimeout(() => alert(msg), 80);

    try {
      if (typeof appendToCampaignLog === 'function') {
        appendToCampaignLog({
          type: 'marco',
          title: '🏆 ' + marco.titulo,
          text: marco.vantagem + (bonusLines.length ? ' | ' + bonusLines.join(', ') : ''),
          time: entry.time
        });
      }
    } catch (e) {}

    try { renderMarcosCampanha(); } catch (e) {}
    return entry;
  } catch (e) {
    console.warn('verificarMarcosCampanha', e);
    return null;
  }
}

function renderMarcosCampanha() {
  const el = document.getElementById('marcosCampanhaList');
  if (!el) return;
  const st = getMarcosState();
  const day = (typeof timeState !== 'undefined' && timeState) ? (timeState.day || 1) : 1;
  const nextVit = 5 - ((st.totalVictories || 0) % 5);
  const nextDay = 10 - (day % 10);
  let html = `<div style="font-size:0.85rem;margin-bottom:8px;color:var(--muted);">
    Vitórias de campanha: <strong style="color:var(--text)">${st.totalVictories || 0}</strong>
    · próximo marco em ${nextVit === 5 && st.totalVictories > 0 && st.totalVictories % 5 === 0 ? 5 : nextVit} vitória(s)
    · Dia ${day} · próximo marco de tempo em ${day % 10 === 0 ? 10 : nextDay} dia(s)
  </div>`;
  if (!st.titulos.length) {
    html += '<p style="color:var(--muted);font-size:0.85rem;text-align:center;">Nenhum marco conquistado ainda. Vença encontros ou avance o calendário.</p>';
  } else {
    html += st.titulos.slice().reverse().map(t =>
      `<div style="padding:8px;margin-bottom:6px;background:var(--bg-input);border:1px solid rgba(167,139,250,0.35);border-radius:8px;">
        <strong style="color:#a78bfa;">🏆 ${esc(t.titulo)}</strong>
        <div style="font-size:0.8rem;color:var(--muted);">${esc(t.vantagem)}</div>
        <div style="font-size:0.72rem;color:var(--muted);">${esc(t.time || '')} · ${t.fonte === 'vitoria' ? 'vitórias' : 'calendário'}</div>
      </div>`
    ).join('');
  }
  el.innerHTML = html;
}

/* ===== [DIARIO] linhas originais 7525-7831 ===== */
/* ---------- Diário de Campanha Persistente ---------- */
const LOG_STORAGE_KEY = KEYS.logs;

function getCampaignLogs() {
  try {
    const o = storeGetJSON(LOG_STORAGE_KEY, {});
    return o && typeof o === 'object' && !Array.isArray(o) ? o : {};
  } catch (e) { return {}; }
}

function setCampaignLogs(obj) {
  storeSet(LOG_STORAGE_KEY, obj && typeof obj === 'object' ? obj : {});
}

function getCurrentCampaignName() {
  return (document.getElementById('campaignName')?.value || 'Crônicas de Victory').trim() || 'Crônicas de Victory';
}

function appendToCampaignLog(entry) {
  const logs = getCampaignLogs();
  const name = getCurrentCampaignName();
  if (!logs[name]) logs[name] = [];
  // Normaliza campos para o diário inteligente
  const now = new Date();
  if (!entry.ts) entry.ts = now.toISOString();
  if (!entry.dateStr) entry.dateStr = now.toLocaleDateString('pt-BR');
  if (!entry.timeStr && entry.time) {
    // time legado "dd/mm/yyyy, hh:mm:ss"
    const parts = String(entry.time).split(',');
    if (parts[1]) entry.timeStr = parts[1].trim();
  }
  if (!entry.timeStr) entry.timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  if (!entry.titulo && entry.title) entry.titulo = entry.title;
  if (!entry.desc && entry.text) entry.desc = entry.text;
  if (!entry.tipo && entry.type) entry.tipo = entry.type;
  logs[name].unshift(entry); // mais recente primeiro
  // Limita a 200 entradas por campanha para não explodir o storage
  if (logs[name].length > 200) logs[name] = logs[name].slice(0, 200);
  setCampaignLogs(logs);
  try { if (typeof renderCampaignLog === 'function') renderCampaignLog(); } catch (e) {}
}

function saveCurrentEventToLog(resultLabel, silent) {
  if (!currentEventDataForLog) return;
  const campaign = getCurrentCampaignName();
  const biome = document.getElementById('biomeSelect').options[document.getElementById('biomeSelect').selectedIndex].text;
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toLocaleDateString('pt-BR');
  const hookTitle = currentAdventureHook ? currentAdventureHook.titulo : null;

  const entry = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
    ts: now.toISOString(),
    dateStr,
    timeStr,
    campaign,
    biome,
    hook: hookTitle,
    tipo: currentEventDataForLog.tipo,
    titulo: currentEventDataForLog.titulo,
    desc: currentEventDataForLog.desc,
    party: currentEventDataForLog.party,
    result: resultLabel || null
  };

  appendToCampaignLog(entry);
  renderCampaignLog();
  if (!silent) {
    alert('📥 Evento salvo no diário da campanha "' + campaign + '"!');
  }
}

/** Timestamp de uma entrada do diário (ms). Aceita ts ISO, time legado ou dateStr pt-BR. */
function entryLogTimestamp(e) {
  if (!e) return 0;
  if (e.ts) {
    const t = Date.parse(e.ts);
    if (!isNaN(t)) return t;
  }
  if (e.time) {
    const t = Date.parse(e.time);
    if (!isNaN(t)) return t;
  }
  if (e.dateStr) {
    const m = String(e.dateStr).match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (m) return new Date(+m[3], +m[2] - 1, +m[1]).getTime();
  }
  return 0;
}

function normalizeLogEntryView(e) {
  return {
    ...e,
    titulo: e.titulo || e.title || e.type || 'Evento',
    desc: e.desc || e.text || '',
    tipo: e.tipo || e.type || '',
    dateStr: e.dateStr || (e.time ? String(e.time).split(',')[0] : '') || '',
    timeStr: e.timeStr || '',
    biome: e.biome || '',
    party: e.party || '',
    result: e.result || null,
    hook: e.hook || null
  };
}

let _diarioFiltroTipo = null; // null = todos
let _diarioFiltroDias = null; // null = todos; number = últimos N dias

function getFilteredCampaignEntries() {
  const name = getCurrentCampaignName();
  const logs = getCampaignLogs();
  let entries = (logs[name] || []).map(normalizeLogEntryView);

  if (_diarioFiltroDias && _diarioFiltroDias > 0) {
    const corte = Date.now() - (_diarioFiltroDias * 24 * 60 * 60 * 1000);
    entries = entries.filter(e => {
      const ts = entryLogTimestamp(e);
      // Sem data legível: mantém se for das primeiras 30 (sessão atual)
      if (!ts) return true;
      return ts >= corte;
    });
  }
  if (_diarioFiltroTipo) {
    const t = String(_diarioFiltroTipo).toLowerCase();
    entries = entries.filter(e => String(e.tipo || '').toLowerCase().includes(t) ||
      String(e.titulo || '').toLowerCase().includes(t));
  }
  return entries;
}

function renderCampaignLog() {
  const container = document.getElementById('sessionLogContainer');
  if (!container) return;
  const entries = getFilteredCampaignEntries();

  if (entries.length === 0) {
    container.innerHTML = '<p style="color:var(--muted); font-size:0.9rem; text-align:center; padding:10px;">Nenhum evento neste filtro. Tente “Tudo” ou registre novos encontros.</p>';
    return;
  }

  container.innerHTML = entries.map(e => {
    const resultBadge = e.result
      ? `<span style="font-size:0.75rem; font-weight:700; padding:2px 8px; border-radius:6px; margin-left:6px; ${String(e.result).includes('Vitória') || String(e.result).includes('✅') ? 'background:rgba(16,185,129,0.2); color:var(--success);' : 'background:rgba(244,63,94,0.2); color:var(--accent2);'}">${esc(e.result)}</span>`
      : '';
    const hookLine = e.hook ? `<div style="font-size:0.78rem; color:var(--magic); margin-bottom:2px;">🎯 Gancho: ${esc(e.hook)}</div>` : '';
    const partyLine = e.party ? `<div style="font-size:0.8rem; color:var(--blue-glow); margin-bottom:2px;">🛡️ Heróis: ${esc(e.party)}</div>` : '';
    return `
      <div class="session-log-item">
        <div class="session-meta">
          <span>🕒 ${esc(e.dateStr || '')} ${esc(e.timeStr || '')}${e.biome ? ' | ' + esc(e.biome) : ''}</span>
          <span style="color:var(--accent); font-weight:700;">[${esc((e.tipo || '').toUpperCase())}]${resultBadge}</span>
        </div>
        ${hookLine}
        ${partyLine}
        <div style="font-weight:700; color:var(--text); margin-bottom:2px;">${esc(e.titulo || '')}</div>
        <div style="color:var(--muted);">${esc(e.desc || '')}</div>
      </div>`;
  }).join('');
}

function loadCampaignLog() {
  renderCampaignLog();
}

function clearLog() {
  const name = getCurrentCampaignName();
  if (!confirm(`Limpar todo o diário da campanha "${name}"?\nEsta ação não pode ser desfeita.`)) return;
  const logs = getCampaignLogs();
  logs[name] = [];
  setCampaignLogs(logs);
  _diarioFiltroDias = null;
  _diarioFiltroTipo = null;
  const box = document.getElementById('diarioResumoBox');
  if (box) { box.classList.add('hidden'); box.innerHTML = ''; }
  renderCampaignLog();
}

/**
 * Diário inteligente: resume os últimos N dias (vitórias, falhas, missões, relógios, afeto).
 */
function resumirDiarioUltimosDias(dias) {
  try {
    dias = Math.max(1, Math.min(30, Number(dias) || 3));
    _diarioFiltroDias = dias;
    _diarioFiltroTipo = null;
    const entries = getFilteredCampaignEntries();
    const box = document.getElementById('diarioResumoBox');

    const counts = { total: entries.length, vitoria: 0, falha: 0, missao: 0, batalha: 0, relogio: 0, social: 0, falhaCons: 0, outro: 0 };
    const destaques = [];
    entries.forEach(e => {
      const t = String(e.tipo || '').toLowerCase();
      const title = String(e.titulo || '');
      const res = String(e.result || '');
      if (res.includes('Vitória') || res.includes('✅') || title.includes('Vitória')) counts.vitoria++;
      if (res.includes('Fracasso') || res.includes('❌') || title.includes('Derrota') || title.includes('Fracasso')) counts.falha++;
      if (t.includes('missao') || t.includes('missão') || title.includes('Missão')) counts.missao++;
      else if (t.includes('batalha') || t.includes('combate')) counts.batalha++;
      else if (t.includes('relogio') || t.includes('relógio') || title.includes('Relógio')) counts.relogio++;
      else if (t.includes('cena_social') || t.includes('social')) counts.social++;
      else if (t.includes('falha')) counts.falhaCons++;
      else counts.outro++;
      if (destaques.length < 6 && (e.titulo || e.desc)) {
        destaques.push(`• ${e.dateStr || ''} — ${e.titulo || e.tipo || 'Evento'}`);
      }
    });

    // Contadores de jogo (sessão atual)
    let sessao = '';
    try {
      if (typeof sessionVictories === 'number') {
        sessao = `<div style="margin-top:8px;color:var(--muted);">Sessão atual: ${sessionVictories} vitórias · XP banco ${typeof accumulatedXp === 'number' ? accumulatedXp : '—'}</div>`;
      }
    } catch (e) {}

    // Rivais / consequências
    let rivaisTxt = '';
    try {
      const rivais = typeof getRivaisAtivos === 'function' ? getRivaisAtivos() : [];
      if (rivais.length) {
        rivaisTxt = `<div style="margin-top:6px;">🗡️ Rivais ativos: ${rivais.map(r => r.nome + ' (×' + (r.vezes || 1) + ')').join(', ')}</div>`;
      }
    } catch (e) {}

    if (box) {
      box.classList.remove('hidden');
      box.innerHTML = `
        <div style="font-weight:800; color:#0ea5e9; margin-bottom:8px;">📋 Resumo dos últimos ${dias} dia(s)</div>
        <div><strong>${counts.total}</strong> entradas no período</div>
        <div style="margin-top:6px; display:flex; flex-wrap:wrap; gap:8px; font-size:0.82rem;">
          <span style="color:var(--success);">✅ Vitórias ~${counts.vitoria}</span>
          <span style="color:var(--accent2);">❌ Fracassos ~${counts.falha}</span>
          <span>📜 Missões ~${counts.missao}</span>
          <span>⚔️ Batalhas ~${counts.batalha}</span>
          <span>⏳ Relógios ~${counts.relogio}</span>
          <span>🗣️ Sociais ~${counts.social}</span>
        </div>
        ${rivaisTxt}
        ${sessao}
        ${destaques.length ? `<div style="margin-top:10px; font-size:0.82rem; color:var(--muted);"><strong>Destaques:</strong><br>${destaques.map(d => esc(d)).join('<br>')}</div>` : ''}
        <div style="margin-top:10px; display:flex; gap:6px; flex-wrap:wrap;">
          <button class="btn btn-sm btn-outline" onclick="filtrarDiarioPorTipo('batalha')">Só batalhas</button>
          <button class="btn btn-sm btn-outline" onclick="filtrarDiarioPorTipo('miss')">Só missões</button>
          <button class="btn btn-sm btn-outline" onclick="filtrarDiarioPorTipo('relogio')">Só relógios</button>
          <button class="btn btn-sm btn-outline" onclick="filtrarDiarioPorTipo('falha')">Só falhas</button>
          <button class="btn btn-sm" style="background:#0ea5e9;color:#fff;" onclick="copiarResumoDiario()">📋 Copiar resumo</button>
        </div>
      `;
    }
    renderCampaignLog();
    if (box) box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  } catch (e) {
    console.warn('resumirDiarioUltimosDias', e);
    alert('Não foi possível gerar o resumo.');
  }
}

function filtrarDiarioPorTipo(tipo) {
  _diarioFiltroTipo = tipo;
  if (tipo === null) {
    _diarioFiltroDias = null;
    const box = document.getElementById('diarioResumoBox');
    if (box) { box.classList.add('hidden'); box.innerHTML = ''; }
  }
  renderCampaignLog();
}

function copiarResumoDiario() {
  try {
    const box = document.getElementById('diarioResumoBox');
    if (!box) return;
    const text = box.innerText || box.textContent || '';
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => alert('Resumo copiado!')).catch(() => {
        prompt('Copie o resumo:', text);
      });
    } else {
      prompt('Copie o resumo:', text);
    }
  } catch (e) {
    alert('Não foi possível copiar.');
  }
}

function exportCampaignLog() {
  const name = getCurrentCampaignName();
  const logs = getCampaignLogs();
  const entries = logs[name] || [];
  if (entries.length === 0) {
    alert('Nenhum evento para exportar nesta campanha.');
    return;
  }
  const payload = {
    campanha: name,
    exportadoEm: new Date().toLocaleString('pt-BR'),
    totalEventos: entries.length,
    eventos: entries
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `diario_${name.toLowerCase().replace(/\s+/g, '_')}_3det.json`;
  a.click();
  URL.revokeObjectURL(a.href);
}

