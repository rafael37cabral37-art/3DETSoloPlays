/* ===== [CASA_APOSTAS] linhas originais 11497-11683 ===== */
/* ==================== CASA DE APOSTAS ==================== */
const APOSTAS_MAX_DIA = 5;

function getApostasState() {
  const day = (typeof timeState !== 'undefined' && timeState) ? (timeState.day || 1) : 1;
  let st = storeGetJSON(KEYS.apostas, null);
  if (!st || typeof st !== 'object') st = { day: day, count: 0, history: [], netGain: 0, netLoss: 0 };
  if (st.day !== day) {
    st = { day: day, count: 0, history: st.history || [], netGain: st.netGain || 0, netLoss: st.netLoss || 0 };
  }
  return st;
}
function setApostasState(st) { storeSet(KEYS.apostas, st); }

function initApostasTab() {
  updateApostasStatusLine();
  renderApostaHistorico();
  const box = document.getElementById('apostaCorridaSelectBox');
  if (box) box.classList.add('hidden');
  const res = document.getElementById('apostaResultBox');
  if (res) res.style.display = 'none';
}

function updateApostasStatusLine() {
  const el = document.getElementById('apostasStatusLine');
  if (!el) return;
  const st = getApostasState();
  const heroId = document.getElementById('marketHeroSelect')?.value;
  const hero = (typeof getSaved === 'function' ? getSaved() : []).find(c => c.id === heroId);
  const ouro = hero ? (hero.ouro || 0) : 0;
  const rest = Math.max(0, APOSTAS_MAX_DIA - (st.count || 0));
  el.innerHTML = `💰 Saldo: <strong>${ouro} Tibar</strong> · Apostas restantes hoje: <strong>${rest}/${APOSTAS_MAX_DIA}</strong> · Dia ${st.day}`;
}

function getApostaValorValidado() {
  const heroId = document.getElementById('marketHeroSelect')?.value;
  const hero = (typeof getSaved === 'function' ? getSaved() : []).find(c => c.id === heroId);
  if (!hero) { alert('Selecione um herói no mercado.'); return null; }
  const st = getApostasState();
  if ((st.count || 0) >= APOSTAS_MAX_DIA) {
    alert('Limite de 5 apostas por dia atingido. Volte amanhã (avance o dia / descanso longo).');
    return null;
  }
  let val = parseInt(document.getElementById('apostaValor')?.value, 10) || 0;
  const maxBet = Math.min(500, Math.max(10, Math.floor((hero.ouro || 0) * 0.1)));
  if (val < 10) { alert('Aposta mínima: 10 Tibar.'); return null; }
  if (val > maxBet) { alert(`Aposta máxima agora: ${maxBet} Tibar (10% do saldo ou 500).`); return null; }
  if ((hero.ouro || 0) < val) { alert('Ouro insuficiente.'); return null; }
  return { hero, heroId, val, st };
}

function aplicarResultadoAposta(hero, heroId, val, mult, modalidade, ganhou) {
  const list = getSaved();
  const idx = list.findIndex(c => c.id === heroId);
  if (idx < 0) return;
  const saldoIni = list[idx].ouro || 0;
  list[idx].ouro = saldoIni - val;
  let ganho = 0;
  if (ganhou) {
    ganho = Math.floor(val * mult);
    list[idx].ouro += ganho;
  }
  const saldoFim = list[idx].ouro;
  setSaved(list);

  const st = getApostasState();
  st.count = (st.count || 0) + 1;
  const entry = {
    time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    modalidade,
    apostado: val,
    resultado: ganhou ? `Ganhou ${ganho}` : 'Perdeu',
    saldoIni,
    saldoFim,
    ganhou
  };
  st.history = st.history || [];
  st.history.unshift(entry);
  if (st.history.length > 40) st.history = st.history.slice(0, 40);
  if (ganhou) st.netGain = (st.netGain || 0) + (ganho - val);
  else st.netLoss = (st.netLoss || 0) + val;
  setApostasState(st);

  // Reputação
  try {
    if (typeof changeReputation === 'function') {
      if (ganhou && ganho >= 100) changeReputation('povo', 2, 'Fama de sortudo nas apostas', true);
      if (!ganhou && val >= 50) changeReputation('povo', -1, 'Fama de azarão nas apostas', true);
      if (ganhou && ganho >= 200) changeReputation('submundo', 1, 'Grande ganho na casa de apostas', true);
    }
  } catch (e) {}

  const box = document.getElementById('apostaResultBox');
  if (box) {
    box.style.display = 'block';
    box.style.borderColor = ganhou ? 'var(--success)' : 'var(--accent2)';
    box.innerHTML = ganhou
      ? `<strong style="color:var(--success)">✅ GANHOU!</strong> ${modalidade}<br>Apostou ${val} → recebeu <strong>${ganho}</strong> Tibar<br>Saldo: ${saldoIni} → ${saldoFim}`
      : `<strong style="color:var(--accent2)">❌ PERDEU</strong> ${modalidade}<br>Perdeu ${val} Tibar<br>Saldo: ${saldoIni} → ${saldoFim}`;
  }
  updateApostasStatusLine();
  renderApostaHistorico();
  try {
    const sel = document.getElementById('marketHeroSelect');
    if (sel) {
      const opts = [...sel.options];
      opts.forEach(o => {
        if (o.value === heroId) o.textContent = o.textContent.replace(/\(\d+ Tibar\)/, `(${saldoFim} Tibar)`);
      });
    }
  } catch (e) {}
  return { ganhou, ganho, saldoFim };
}

function apostarDado2() {
  const ctx = getApostaValorValidado();
  if (!ctx) return;
  const ganhou = Math.random() < 0.5;
  aplicarResultadoAposta(ctx.hero, ctx.heroId, ctx.val, 2, 'Dado de 2 (×2)', ganhou);
}
function apostarTripla() {
  const ctx = getApostaValorValidado();
  if (!ctx) return;
  const ganhou = Math.random() < 0.3;
  aplicarResultadoAposta(ctx.hero, ctx.heroId, ctx.val, 3, 'Tripla Sorte (×3)', ganhou);
}
function apostarCorridaEscravo() {
  const ctx = getApostaValorValidado();
  if (!ctx) return;
  const box = document.getElementById('apostaCorridaSelectBox');
  const sel = document.getElementById('apostaServoSelect');
  if (!box || !sel) return;
  // Servos do herói + servos no mercado
  const owned = typeof getServosOfOwner === 'function' ? getServosOfOwner(ctx.heroId) : [];
  const market = typeof getServosMercado === 'function' ? getServosMercado() : [];
  const opts = [
    ...owned.map(s => ({ id: s.id, label: `${s.nome} (seu · P${s.P} H${s.H})` })),
    ...market.map(s => ({ id: s.id, label: `${s.nome} (mercado · P${s.P} H${s.H})` }))
  ];
  if (!opts.length) {
    alert('Nenhum servo disponível para corrida. Compre/gere servos primeiro.');
    return;
  }
  sel.innerHTML = opts.map(o => `<option value="${o.id}">${esc(o.label)}</option>`).join('');
  box.classList.remove('hidden');
  window._pendingApostaCorrida = ctx;
}
function confirmarCorridaEscravo() {
  const ctx = window._pendingApostaCorrida || getApostaValorValidado();
  if (!ctx) return;
  const sel = document.getElementById('apostaServoSelect');
  const servo = typeof getServoById === 'function' ? getServoById(sel?.value) : null;
  if (!servo) { alert('Selecione um escravo.'); return; }
  // Chance baseada em P+H do servo (melhor atributo = mais chance, base 40% + até 30%)
  const score = Math.min(10, (Number(servo.P) || 0) + (Number(servo.H) || 0));
  const chance = 0.35 + (score / 10) * 0.35; // 35%–70%
  const ganhou = Math.random() < chance;
  // XP ao escravo se for do jogador e participou
  if (servo.ownerId === ctx.heroId) {
    try { addServoXP(servo.id, ganhou ? 3 : 1, 'Corrida de escravos'); } catch (e) {}
  }
  aplicarResultadoAposta(ctx.hero, ctx.heroId, ctx.val, 2.5, `Corrida (${servo.nome})`, ganhou);
  document.getElementById('apostaCorridaSelectBox')?.classList.add('hidden');
  window._pendingApostaCorrida = null;
}
function renderApostaHistorico() {
  const el = document.getElementById('apostaHistorico');
  if (!el) return;
  const st = getApostasState();
  const hist = st.history || [];
  if (!hist.length) {
    el.innerHTML = '<p style="color:var(--muted); text-align:center;">Nenhuma aposta ainda.</p>';
    return;
  }
  el.innerHTML = hist.slice(0, 20).map(h =>
    `<div style="border-bottom:1px solid rgba(255,255,255,0.06); padding:6px 0;">
      <span style="color:var(--muted);">${h.time}</span>
      <strong style="color:${h.ganhou ? 'var(--success)' : 'var(--accent2)'}">${h.resultado}</strong>
      · ${esc(h.modalidade)} · apostou ${h.apostado}
      <div style="font-size:0.75rem; color:var(--muted);">Saldo ${h.saldoIni} → ${h.saldoFim}</div>
    </div>`
  ).join('');
}




