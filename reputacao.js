/* ===== [REPUTACAO] linhas originais 9460-9699 ===== */
/* ==================== REPUTAÇÃO & FACÇÕES ==================== */
const REPUTATION_FACTIONS = [
  { id: 'povo',       label: 'Povo / Comum',           icon: '👥', desc: 'Camponeses, artesãos e cidadãos ordinários.' },
  { id: 'guarda',     label: 'Guarda / Autoridade',    icon: '🛡️', desc: 'Milícias, patrulhas e agentes da lei.' },
  { id: 'igreja',     label: 'Igreja / Clero',         icon: '⛪', desc: 'Templos, ordens religiosas e fiéis.' },
  { id: 'mercadores', label: 'Guilda de Mercadores',   icon: '💰', desc: 'Comerciantes, caravanas e banqueiros.' },
  { id: 'submundo',   label: 'Submundo / Ladinos',     icon: '🗡️', desc: 'Ladrões, contrabandistas e informantes.' },
  { id: 'natureza',   label: 'Natureza / Druidas',     icon: '🌿', desc: 'Druidas, rangers e espíritos da floresta.' },
  { id: 'nobreza',    label: 'Nobreza',                icon: '👑', desc: 'Casas nobres, cortes e aristocracia.' },
  { id: 'aventureiros', label: 'Guilda de Aventureiros', icon: '⚔️', desc: 'Companhias de heróis e caçadores de recompensa.' },
  { id: 'luz_vermelha', label: 'Casa da Luz Vermelha', icon: '🔴', desc: 'Rede de Seraphine — contratos, submundo elegante, sangue.' },
  { id: 'veu_prateado', label: 'Casa do Véu Prateado', icon: '🌕', desc: 'Rede de Selene Drae — aristocracia, matilha, lua.' },
  { id: 'a_ordem', label: 'A Ordem (oculta)', icon: '🕯️', desc: 'Facção escondida ligada à bruxa da maldição das irmãs. Ainda pouco conhecida.' }
];

// Missões de NPC → facção relacionada (para ganho/perda automática)
const MISSAO_FACCAO = {
  'Entrega urgente': 'mercadores',
  'Caça pequena': 'povo',
  'Coletar erva rara': 'natureza',
  'Proteger caravana': 'mercadores',
  'Investigar rumores': 'povo',
  'Resgatar animal': 'natureza',
  'Duelo de honra': 'nobreza',
  'Recuperar relíquia': 'nobreza',
  'Mediação': 'povo',
  'Testemunha': 'guarda',
  'Missão secreta': 'submundo',
  'Presente especial': 'nobreza'
};

function defaultReputationState() {
  const scores = {};
  REPUTATION_FACTIONS.forEach(f => { scores[f.id] = 0; });
  return { scores, history: [] };
}

function getReputationState() {
  try {
    const raw = storeGetJSON(KEYS.reputation, null);
    if (!raw || typeof raw !== 'object') return defaultReputationState();
    const base = defaultReputationState();
    REPUTATION_FACTIONS.forEach(f => {
      const v = raw.scores && typeof raw.scores[f.id] === 'number' ? raw.scores[f.id] : 0;
      base.scores[f.id] = Math.max(-100, Math.min(100, v));
    });
    base.history = Array.isArray(raw.history) ? raw.history.slice(0, 40) : [];
    return base;
  } catch (e) {
    return defaultReputationState();
  }
}

function setReputationState(state) {
  storeSet(KEYS.reputation, state);
}

function getRep(factionId) {
  const st = getReputationState();
  return typeof st.scores[factionId] === 'number' ? st.scores[factionId] : 0;
}

function repLabel(n) {
  if (n >= 80) return { text: 'Lendário', color: '#fbbf24', cls: 'status-abencoado' };
  if (n >= 50) return { text: 'Honrado', color: '#a855f7', cls: 'status-abencoado' };
  if (n >= 20) return { text: 'Respeitado', color: '#10b981', cls: 'status-normal' };
  if (n >= 5) return { text: 'Conhecido', color: '#38bdf8', cls: 'status-paralisado' };
  if (n > -5) return { text: 'Neutro', color: '#94a3b8', cls: 'status-dormindo' };
  if (n > -20) return { text: 'Suspeito', color: '#fb923c', cls: 'status-faminto' };
  if (n > -50) return { text: 'Malvisto', color: '#f97316', cls: 'status-faminto' };
  return { text: 'Odiado', color: '#f87171', cls: 'status-morto' };
}

/**
 * Altera reputação de uma facção.
 * @param {string} factionId
 * @param {number} delta  (positivo ou negativo)
 * @param {string} reason
 * @param {boolean} silent
 */
function changeReputation(factionId, delta, reason, silent) {
  if (!factionId || !delta) return;
  const st = getReputationState();
  if (typeof st.scores[factionId] !== 'number') st.scores[factionId] = 0;
  const before = st.scores[factionId];
  st.scores[factionId] = Math.max(-100, Math.min(100, before + delta));
  const after = st.scores[factionId];
  const fac = REPUTATION_FACTIONS.find(f => f.id === factionId);
  const entry = {
    time: new Date().toLocaleString('pt-BR'),
    factionId,
    factionLabel: fac ? fac.label : factionId,
    delta,
    before,
    after,
    reason: reason || ''
  };
  st.history.unshift(entry);
  if (st.history.length > 40) st.history = st.history.slice(0, 40);
  setReputationState(st);

  try {
    if (typeof appendToCampaignLog === 'function') {
      appendToCampaignLog({
        type: 'reputacao',
        title: `Reputação: ${entry.factionLabel}`,
        text: `${delta >= 0 ? '+' : ''}${delta} → ${after}/100${reason ? ' — ' + reason : ''}`,
        time: entry.time
      });
    }
  } catch (e) {}

  if (!silent) {
    const a = repLabel(after);
    alert(`👑 ${entry.factionLabel}\n${delta >= 0 ? '+' : ''}${delta} → ${after}/100 (${a.text})${reason ? '\n' + reason : ''}`);
  }
  return after;
}

function resetAllReputation() {
  setReputationState(defaultReputationState());
  renderReputationScreen();
  alert('Toda a reputação foi zerada.');
}

function renderReputationScreen() {
  const list = document.getElementById('reputationList');
  const hist = document.getElementById('reputationHistory');
  const sel = document.getElementById('repManualFaction');
  if (!list) return;
  const st = getReputationState();

  list.innerHTML = REPUTATION_FACTIONS.map(f => {
    const v = st.scores[f.id] || 0;
    const a = repLabel(v);
    // barra centrada: 0 = meio; negativo à esquerda, positivo à direita
    const pct = ((v + 100) / 200) * 100;
    const barColor = v >= 0
      ? 'linear-gradient(90deg,#10b981,#fbbf24)'
      : 'linear-gradient(90deg,#f87171,#fb923c)';
    return `
      <div style="background:var(--bg-input); border:1px solid var(--border); border-radius:12px; padding:12px; margin-bottom:10px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
          <div>
            <strong style="font-size:1.05rem;">${f.icon} ${esc(f.label)}</strong>
            <div style="font-size:0.78rem; color:var(--muted);">${esc(f.desc)}</div>
          </div>
          <div style="text-align:right;">
            <span class="status-badge ${a.cls}" style="font-size:0.75rem;">${a.text}</span>
            <div style="font-weight:800; color:${a.color}; font-size:1.1rem;">${v >= 0 ? '+' : ''}${v}</div>
          </div>
        </div>
        <div class="bar-bg" style="height:10px; position:relative;">
          <div style="position:absolute; left:50%; top:0; bottom:0; width:2px; background:rgba(255,255,255,0.25);"></div>
          <div class="bar-fill" style="width:${pct}%; background:${barColor};"></div>
        </div>
        <div style="display:flex; gap:6px; margin-top:8px; flex-wrap:wrap;">
          <button class="btn btn-sm btn-outline" onclick="changeReputation('${f.id}',5,'Ajuste rápido +5'); renderReputationScreen();">+5</button>
          <button class="btn btn-sm btn-outline" onclick="changeReputation('${f.id}',10,'Ajuste rápido +10'); renderReputationScreen();">+10</button>
          <button class="btn btn-sm btn-outline" onclick="changeReputation('${f.id}',-5,'Ajuste rápido −5'); renderReputationScreen();">−5</button>
          <button class="btn btn-sm btn-outline" onclick="changeReputation('${f.id}',-10,'Ajuste rápido −10'); renderReputationScreen();">−10</button>
        </div>
      </div>`;
  }).join('');

  if (hist) {
    if (!st.history.length) {
      hist.innerHTML = '<p style="text-align:center; padding:12px;">Nenhuma mudança registrada ainda.</p>';
    } else {
      hist.innerHTML = st.history.map(h =>
        `<div style="padding:6px 0; border-bottom:1px solid var(--border);">
          <strong style="color:${h.delta >= 0 ? 'var(--success)' : 'var(--accent2)'}">${h.delta >= 0 ? '+' : ''}${h.delta}</strong>
          ${esc(h.factionLabel)} → ${h.after}
          <span style="color:var(--muted); font-size:0.78rem;"> · ${esc(h.time)}</span>
          ${h.reason ? `<div style="font-size:0.78rem; color:var(--muted);">${esc(h.reason)}</div>` : ''}
        </div>`
      ).join('');
    }
  }

  if (sel) {
    sel.innerHTML = REPUTATION_FACTIONS.map(f =>
      `<option value="${f.id}">${f.icon} ${f.label}</option>`
    ).join('');
  }
}

function applyManualReputation() {
  const fac = document.getElementById('repManualFaction');
  const deltaEl = document.getElementById('repManualDelta');
  const reasonEl = document.getElementById('repManualReason');
  if (!fac || !deltaEl) return;
  const delta = parseInt(deltaEl.value, 10);
  if (!delta || isNaN(delta)) {
    alert('Informe um valor numérico (positivo ou negativo).');
    return;
  }
  changeReputation(fac.value, delta, (reasonEl && reasonEl.value.trim()) || 'Ajuste manual', false);
  renderReputationScreen();
  if (reasonEl) reasonEl.value = '';
}

/** Modificador de preço de mercado baseado em reputação com mercadores (opcional) */
function marketPriceMod() {
  const r = getRep('mercadores');
  if (r >= 50) return 0.85;
  if (r >= 20) return 0.92;
  if (r <= -50) return 1.25;
  if (r <= -20) return 1.12;
  return 1.0;
}

/** Bônus de afeto inicial de NPC gerado, conforme facção da classe */
function afetoBonusFromReputation(classe) {
  const map = {
    'Ladino': 'submundo',
    'Guerreiro': 'guarda',
    'Clérigo': 'igreja',
    'Mago': 'aventureiros',
    'Druida': 'natureza',
    'Bárbaro': 'povo'
  };
  const fac = map[classe] || 'povo';
  const r = getRep(fac);
  if (r >= 50) return 12;
  if (r >= 20) return 6;
  if (r <= -50) return -15;
  if (r <= -20) return -8;
  return 0;
}

/** Chamado após resolver missão de NPC — ajusta reputação da facção ligada */
function applyMissionReputation(missao, sucesso) {
  if (!missao || !missao.titulo) return;
  const facId = MISSAO_FACCAO[missao.titulo] || 'povo';
  const base = sucesso ? Math.max(3, (missao.dif || 1) * 3) : -Math.max(2, (missao.dif || 1) * 2);
  changeReputation(facId, base, (sucesso ? 'Missão cumprida: ' : 'Missão falhou: ') + missao.titulo, true);
}


