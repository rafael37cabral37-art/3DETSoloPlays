/* ===== [TRABALHO_HEROI] linhas originais 6173-7018 ===== */
/* ==================== TRABALHO DO HERÓI ====================
 * 1 trabalho = 1 período do dia.
 * Pagamento: base do ofício + Aparência×multAp + Habilidade×multH (+ P/R em alguns).
 */
const TRABALHOS_HEROI = [
  {
    id: 'bracal',
    nome: '⚒️ Trabalho braçal',
    desc: 'Carregar carga, cavar, estiva no porto. Paga pouco, exige Resistência.',
    base: 8,
    multAp: 0,
    multH: 1,
    multR: 3,
    multP: 1,
    rep: null,
    flavor: 'Suor e calos. Ninguém pergunta o nome.'
  },
  {
    id: 'guarda',
    nome: '🛡️ Guarda / escolta',
    desc: 'Vigiar porta de taverna, escoltar carroça, rondar muro.',
    base: 12,
    multAp: 0.5,
    multH: 2,
    multR: 1,
    multP: 3,
    rep: null,
    flavor: 'Olho vivo e mão firme.'
  },
  {
    id: 'artesao',
    nome: '🛠️ Ofício / artesanato',
    desc: 'Ajudar ferreiro, costureira, carpinteiro ou escriba.',
    base: 10,
    multAp: 0,
    multH: 5,
    multR: 1,
    multP: 0,
    rep: null,
    flavor: 'Mãos que sabem o ofício valem ouro.'
  },
  {
    id: 'performance',
    nome: '🎭 Performance / entretenimento',
    desc: 'Cantar, dançar, contar histórias na praça ou taverna.',
    base: 6,
    multAp: 6,
    multH: 3,
    multR: 0,
    multP: 0,
    rep: null,
    flavor: 'A plateia paga com o olhar — e com Tibar.'
  },
  {
    id: 'social',
    nome: '💬 Serviços sociais / companhia',
    desc: 'Guiar nobres, traduzir, intermediar negócios, presença em salão.',
    base: 8,
    multAp: 8,
    multH: 4,
    multR: 0,
    multP: 0,
    rep: 'aristocracia',
    flavor: 'Sorriso certo na hora certa.'
  },
  {
    id: 'caca',
    nome: '🏹 Caça / coleta',
    desc: 'Caçar nas cercanias, coletar ervas, peles e troféus menores.',
    base: 9,
    multAp: 0,
    multH: 4,
    multR: 2,
    multP: 2,
    rep: null,
    flavor: 'O mato não perdoa descuido.'
  },
  {
    id: 'luz_rapido',
    nome: '🔴 Turno na Casa da Luz (só herói)',
    desc: 'O próprio herói presta serviço rápido na Casa (se a Dona permitir). Alto risco social.',
    base: 15,
    multAp: 10,
    multH: 2,
    multR: 0,
    multP: 0,
    rep: 'submundo',
    flavor: 'A Dona sorri. A cidade fofoca.',
    requerLuz: true
  }
];

function calcPagamentoTrabalho(job, hero) {
  if (!job || !hero) return 0;
  const ap = Number(hero.aparencia) || 5;
  const H = Number(hero.H) || 0;
  const P = Number(hero.P) || 0;
  const R = Number(hero.R) || 0;
  let pay = job.base
    + ap * (job.multAp || 0)
    + H * (job.multH || 0)
    + P * (job.multP || 0)
    + R * (job.multR || 0);
  // Bônus leve de reputação relacionada
  try {
    if (job.rep && typeof getRep === 'function') {
      const r = getRep(job.rep) || 0;
      if (r >= 40) pay = Math.round(pay * 1.15);
      else if (r <= -30) pay = Math.round(pay * 0.85);
    }
  } catch (e) {}
  // Status negativo reduz
  if (hero.status === 'faminto') pay = Math.round(pay * 0.7);
  if (hero.status === 'envenenado' || hero.status === 'paralisado') pay = Math.round(pay * 0.5);
  if (hero.status === 'morto' || hero.status === 'dormindo') pay = 0;
  return Math.max(0, Math.round(pay));
}

/** Limite: 1 trabalho por período E no máx. 2 trabalhos por dia de campanha. */
const MAX_TRABALHOS_POR_DIA = 2;

function getHeroWorkKey(heroId) {
  return '3det_last_work_' + (heroId || 'x');
}

function getHeroWorkState(heroId) {
  try {
    const raw = localStorage.getItem(getHeroWorkKey(heroId));
    if (!raw) return { day: 0, period: -1, countDay: 0 };
    const data = JSON.parse(raw);
    const day = (typeof timeState !== 'undefined' && timeState) ? (timeState.day || 1) : 1;
    if ((data.day || 0) !== day) return { day, period: -1, countDay: 0 };
    return {
      day: data.day || day,
      period: typeof data.period === 'number' ? data.period : -1,
      countDay: Number(data.countDay) || 0
    };
  } catch (e) {
    return { day: 0, period: -1, countDay: 0 };
  }
}

function jaTrabalhouNestePeriodo(heroId) {
  const st = getHeroWorkState(heroId);
  const day = (typeof timeState !== 'undefined' && timeState) ? (timeState.day || 1) : 1;
  const per = (typeof timeState !== 'undefined' && timeState) ? (timeState.periodIndex || 0) : 0;
  return st.day === day && st.period === per;
}

function trabalhosRestantesHoje(heroId) {
  const st = getHeroWorkState(heroId);
  return Math.max(0, MAX_TRABALHOS_POR_DIA - (st.countDay || 0));
}

function podeTrabalharAgora(heroId) {
  if (typeof timeState !== 'undefined' && timeState && timeState.traveling) {
    return { ok: false, reason: 'Em viagem — trabalho de cidade indisponível.' };
  }
  if (jaTrabalhouNestePeriodo(heroId)) {
    const perName = (typeof PERIODS !== 'undefined' && timeState) ? (PERIODS[timeState.periodIndex] || 'Período') : 'Período';
    return { ok: false, reason: 'Já trabalhou neste período (' + perName + '). Avance o tempo.' };
  }
  const rest = trabalhosRestantesHoje(heroId);
  if (rest <= 0) {
    return { ok: false, reason: 'Limite diário atingido (' + MAX_TRABALHOS_POR_DIA + ' trabalhos/dia). Espere o próximo dia.' };
  }
  return { ok: true, rest };
}

function marcarTrabalhoPeriodo(heroId) {
  try {
    const day = (typeof timeState !== 'undefined' && timeState) ? (timeState.day || 1) : 1;
    const per = (typeof timeState !== 'undefined' && timeState) ? (timeState.periodIndex || 0) : 0;
    const st = getHeroWorkState(heroId);
    const countDay = (st.day === day ? (st.countDay || 0) : 0) + 1;
    localStorage.setItem(getHeroWorkKey(heroId), JSON.stringify({ day, period: per, countDay }));
  } catch (e) {}
}

function renderTrabalhoHeroiPanel() {
  const lista = document.getElementById('trabalhoHeroiLista');
  const status = document.getElementById('trabalhoHeroiStatus');
  if (!lista) return;
  const heroId = document.getElementById('marketHeroSelect')?.value;
  if (!heroId) {
    lista.innerHTML = '<p style="color:var(--muted); text-align:center;">Selecione o herói no topo do Mercado.</p>';
    if (status) status.textContent = '';
    return;
  }
  const hero = (typeof getSaved === 'function' ? getSaved() : []).find(c => c.id === heroId);
  if (!hero) {
    lista.innerHTML = '<p style="color:var(--muted);">Herói não encontrado.</p>';
    return;
  }
  const check = podeTrabalharAgora(heroId);
  const blocked = !check.ok;
  const perName = (typeof PERIODS !== 'undefined' && timeState) ? (PERIODS[timeState.periodIndex] || 'Período') : 'Período';
  const rest = trabalhosRestantesHoje(heroId);
  if (status) {
    if (!check.ok) {
      status.innerHTML = `⛔ ${esc(check.reason)} · Restam <strong>0</strong> hoje · ${perName}`;
    } else {
      status.innerHTML = `✅ Disponível · ${esc(hero.nome)} · Ouro <strong style="color:#fbbf24">${hero.ouro||0} Tibar</strong> · Apar ${hero.aparencia||5}/10 · H ${hero.H||0} · Restam <strong>${rest}</strong>/${MAX_TRABALHOS_POR_DIA} trabalhos hoje · ${perName}`;
    }
  }
  lista.innerHTML = TRABALHOS_HEROI.map(job => {
    const pay = calcPagamentoTrabalho(job, hero);
    let disabled = blocked || hero.status === 'morto' || hero.status === 'dormindo' || hero.status === 'paralisado';
    let extraNote = '';
    if (job.requerLuz) {
      try {
        const st = typeof getLuzCasaState === 'function' ? getLuzCasaState() : {};
        if (st.banido) { disabled = true; extraNote = ' (banido da Casa)'; }
        else if ((st.confianca || 0) < 25) { extraNote = ' (confiança baixa — Dona pode recusar)'; }
      } catch (e) {}
    }
    return `
      <div style="background:var(--bg-input); border:1px solid var(--border); border-radius:12px; padding:12px;">
        <div style="display:flex; justify-content:space-between; gap:10px; flex-wrap:wrap; align-items:flex-start;">
          <div style="flex:1; min-width:200px;">
            <strong>${job.nome}</strong>
            <div style="font-size:0.82rem; color:var(--muted); margin-top:4px; line-height:1.4;">${esc(job.desc)}</div>
            <div style="font-size:0.75rem; color:var(--muted); margin-top:4px; font-style:italic;">${esc(job.flavor)}</div>
            ${extraNote ? `<div style="font-size:0.75rem; color:#fbbf24; margin-top:4px;">${extraNote}</div>` : ''}
          </div>
          <div style="text-align:right;">
            <div style="font-weight:800; color:#fbbf24; font-size:1.15rem;">+${pay} Tibar</div>
            <div style="font-size:0.72rem; color:var(--muted);">1 período</div>
            <button class="btn btn-sm btn-success" style="margin-top:6px; width:auto;"
              ${disabled ? 'disabled style="opacity:0.5;cursor:not-allowed;margin-top:6px;width:auto;"' : ''}
              onclick="executarTrabalhoHeroi('${job.id}')">Trabalhar</button>
          </div>
        </div>
      </div>`;
  }).join('');
}

function executarTrabalhoHeroi(jobId) {
  const heroId = document.getElementById('marketHeroSelect')?.value;
  if (!heroId) { alert('Selecione o herói no topo do Mercado.'); return; }
  const pode = podeTrabalharAgora(heroId);
  if (!pode.ok) { alert(pode.reason); return; }
  const chars = typeof getSaved === 'function' ? getSaved() : [];
  const idx = chars.findIndex(c => c.id === heroId);
  if (idx < 0) { alert('Herói não encontrado nos saves.'); return; }
  const hero = chars[idx];
  if (hero.status === 'morto') { alert('Mortos não trabalham.'); return; }
  if (hero.status === 'dormindo' || hero.status === 'paralisado' || hero.status === 'prisioneiro') {
    alert('Status atual impede o trabalho (' + (hero.status || '?') + ').');
    return;
  }
  const job = TRABALHOS_HEROI.find(j => j.id === jobId);
  if (!job) return;

  // Casa da Luz: checagem especial
  if (job.requerLuz) {
    try {
      const st = getLuzCasaState();
      if (st.banido) { alert(`${LUZ_DONA.nome}: “Não. Saia.”`); return; }
      if ((st.confianca || 0) < 20 && Math.random() < 0.5) {
        alert(`${LUZ_DONA.nome}: “Ainda não, querido. Ganhe minha confiança primeiro.”`);
        return;
      }
    } catch (e) {}
  }

  const pay = Math.max(0, calcPagamentoTrabalho(job, hero));
  if (pay <= 0) {
    alert('Pagamento calculado como 0 Tibar (status ou atributos impedem). Tente outro ofício ou recupere o herói.');
    return;
  }
  const restAntes = trabalhosRestantesHoje(heroId);
  if (!confirm(`${job.nome}\n\n${hero.nome} trabalha 1 período e recebe ${pay} Tibar.\nTrabalhos restantes hoje após isto: ${restAntes - 1}/${MAX_TRABALHOS_POR_DIA}.\nContinuar?`)) return;

  // Credita ouro de forma persistente (respeita dívida de escravidão se houver)
  const antes = Number(chars[idx].ouro) || 0;
  if (typeof creditarOuroComDivida === 'function') {
    creditarOuroComDivida(chars[idx], pay);
  } else {
    chars[idx].ouro = antes + pay;
  }
  const depois = Number(chars[idx].ouro) || 0;
  let xpGain = 0;
  if (Math.random() < 0.35) {
    chars[idx].XP = (chars[idx].XP || 0) + 1;
    xpGain = 1;
  }
  setSaved(chars);
  marcarTrabalhoPeriodo(heroId);

  // Atualiza rótulo do select do mercado
  try {
    const sel = document.getElementById('marketHeroSelect');
    if (sel) {
      const opt = Array.from(sel.options || []).find(o => o.value === heroId);
      if (opt) opt.textContent = `${chars[idx].nome} (${chars[idx].ouro || 0} Tibar)`;
    }
  } catch (e) {}

  try {
    if (job.id === 'luz_rapido') {
      changeReputation('submundo', 1, 'Trabalhou na Casa da Luz Vermelha', true);
      changeReputation('igreja', -1, 'Visto na Casa da Luz Vermelha', true);
      if (typeof luzAjustarConfianca === 'function') luzAjustarConfianca(1, 'Herói prestou serviço na Casa');
    } else if (job.id === 'social') {
      changeReputation('aristocracia', 1, 'Serviço social bem feito', true);
    } else if (job.id === 'guarda') {
      changeReputation('guarda', 1, 'Serviço de guarda', true);
    }
  } catch (e) {}

  try {
    if (typeof advancePeriod === 'function') advancePeriod(true);
  } catch (e) {}

  // Re-lê após advancePeriod (pode ter processado fome etc.)
  let saldoFinal = depois;
  try {
    const again = getSaved().find(c => c.id === heroId);
    if (again) saldoFinal = again.ouro || 0;
  } catch (e) {}

  const box = document.getElementById('trabalhoHeroiResult');
  if (box) {
    box.innerHTML = `<div style="background:rgba(16,185,129,0.12); border:1px solid rgba(16,185,129,0.4); border-radius:10px; padding:12px;">
      <strong style="color:var(--success)">Trabalho concluído — pagamento creditado</strong>
      <p style="margin:6px 0;">${esc(hero.nome)} · ${job.nome}<br>
      <strong style="color:#fbbf24;">+${pay} Tibar</strong> · Antes ${antes} → Agora <strong>${saldoFinal}</strong> Tibar
      ${xpGain ? ' · +1 XP' : ''}</p>
      <p style="font-size:0.8rem; color:var(--muted);">Restam ${trabalhosRestantesHoje(heroId)}/${MAX_TRABALHOS_POR_DIA} trabalhos hoje · 1 período consumido</p>
      <p style="font-size:0.8rem; color:var(--muted); font-style:italic;">${esc(job.flavor)}</p>
    </div>`;
  }
  renderTrabalhoHeroiPanel();
  try { renderMarketInventory(); } catch (e) {}
  try { if (typeof openMarket === 'function') { /* keep panel */ } } catch (e) {}
  alert(`💼 ${job.nome}\n+${pay} Tibar creditados.\nSaldo de ${hero.nome}: ${saldoFinal} Tibar\n(1 período · restam ${trabalhosRestantesHoje(heroId)} trabalhos hoje)`);
}

function switchShopTab(tab) {
  const tabs = ['mercado', 'templo', 'luz', 'veu', 'apostas', 'venda'];
  tabs.forEach(t => {
    const el = document.getElementById('shopTab' + t.charAt(0).toUpperCase() + t.slice(1));
    const btn = document.getElementById('tabShop' + t.charAt(0).toUpperCase() + t.slice(1));
    if (el) el.classList.toggle('hidden', t !== tab);
    if (btn) {
      if (t === tab) { btn.classList.remove('btn-outline'); }
      else { btn.classList.add('btn-outline'); }
    }
  });
  // Aba especial: trabalho do herói
  const trabalhoEl = document.getElementById('shopTabTrabalhoHeroi');
  const trabalhoBtn = document.getElementById('tabShopTrabalho');
  if (trabalhoEl) trabalhoEl.classList.toggle('hidden', tab !== 'trabalhoHeroi');
  if (trabalhoBtn) {
    if (tab === 'trabalhoHeroi') trabalhoBtn.classList.remove('btn-outline');
    else trabalhoBtn.classList.add('btn-outline');
  }
  // Esconder abas normais se estiver em trabalhoHeroi
  if (tab === 'trabalhoHeroi') {
    tabs.forEach(t => {
      const el = document.getElementById('shopTab' + t.charAt(0).toUpperCase() + t.slice(1));
      if (el) el.classList.add('hidden');
      const btn = document.getElementById('tabShop' + t.charAt(0).toUpperCase() + t.slice(1));
      if (btn) btn.classList.add('btn-outline');
    });
  }
  renderMarketInventory();
  if (tab === 'apostas') { try { initApostasTab(); } catch (e) {} }
  if (tab === 'luz') {
    try { initLuzCasaUI(); } catch (e) {}
    try { renderDamasLuxoMercado(); } catch (e) {}
    try { renderLuzServoWorkPanel(); } catch (e) {}
  }
  if (tab === 'veu') { try { initVeuCasaUI(); } catch (e) {} }
  if (tab === 'trabalhoHeroi') { try { renderTrabalhoHeroiPanel(); } catch (e) {} }
}

function templePriceMod() {
  const r = (typeof getRep === 'function') ? getRep('igreja') : 0;
  if (r >= 50) return 0.80;
  if (r >= 20) return 0.90;
  if (r <= -50) return 1.30;
  if (r <= -20) return 1.15;
  return 1.0;
}

function renderShopItems(categoria, containerId, priceMod) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const items = SHOP_CATALOG.filter(i => i.categoria === categoria);
  if (!items.length) {
    container.innerHTML = '<p style="color:var(--muted)">Nenhum item disponível.</p>';
    return;
  }
  container.innerHTML = items.map(item => {
    const price = Math.max(1, Math.round(item.valor * priceMod));
    const isService = item.tipo === 'servico' && !item.invNome;
    const badge = isService
      ? '<span style="font-size:0.72rem; color:var(--accent);">[serviço]</span>'
      : (item.usavel ? '<span style="font-size:0.72rem; color:var(--success);">[usável]</span>' : '');
    return `
      <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:10px; background:var(--bg-input); border:1px solid var(--border); border-radius:10px; padding:12px; margin-bottom:8px; flex-wrap:wrap;">
        <div style="flex:1; min-width:180px;">
          <strong>${esc(item.nome)}</strong> ${badge}
          <div style="font-size:0.78rem; color:var(--muted); margin-top:4px; line-height:1.35;">${esc(item.desc)}</div>
        </div>
        <div style="text-align:right;">
          <div style="font-weight:700; color:var(--accent); margin-bottom:6px;">${price} Tibar</div>
          <button class="btn btn-sm btn-success" style="width:auto;" onclick="buyShopItem('${item.id}')">Comprar</button>
        </div>
      </div>`;
  }).join('');
}

function renderMarketInventory() {
  const heroSel = document.getElementById('marketHeroSelect');
  if (!heroSel) return;
  const heroId = heroSel.value;
  const list = getSaved();
  const c = list.find(x => x.id === heroId);
  const container = document.getElementById('marketInventoryList');
  const mantInfo = document.getElementById('marketMantInfo');
  const repHint = document.getElementById('marketRepHint');
  const mantLabel = document.getElementById('marketMantPriceLabel');
  const mantBtns = document.getElementById('marketMantButtons');
  const templeRepHint = document.getElementById('marketTempleRepHint');

  let mod = 1.0;
  try {
    if (typeof marketPriceMod === 'function') mod = marketPriceMod();
  } catch (e) {}
  const unitMant = Math.max(1, Math.round(5 * mod));
  const repMerc = (typeof getRep === 'function') ? getRep('mercadores') : 0;
  const templeMod = templePriceMod();
  const repIgreja = (typeof getRep === 'function') ? getRep('igreja') : 0;

  if (repHint) {
    const pct = Math.round((mod - 1) * 100);
    let txt = `👑 Reputação Mercadores: <strong>${repMerc}</strong>`;
    if (mod < 1) txt += ` · Preços <strong style="color:var(--success)">${pct}% mais baratos</strong>`;
    else if (mod > 1) txt += ` · Preços <strong style="color:var(--accent2)">+${pct}%</strong>`;
    else txt += ' · Preços normais';
    repHint.innerHTML = txt;
  }
  if (templeRepHint) {
    const pctT = Math.round((templeMod - 1) * 100);
    let txt = `⛪ Reputação Igreja: <strong>${repIgreja}</strong>`;
    if (templeMod < 1) txt += ` · Serviços <strong style="color:var(--success)">${pctT}% mais baratos</strong>`;
    else if (templeMod > 1) txt += ` · Serviços <strong style="color:var(--accent2)">+${pctT}%</strong>`;
    else txt += ' · Preços normais';
    templeRepHint.innerHTML = txt;
  }
  if (mantLabel) {
    mantLabel.textContent = `1 mantimento = ${unitMant} Tibar · Alimenta por 1 dia`;
  }
  if (mantBtns) {
    mantBtns.innerHTML = `
      <button class="btn btn-sm" style="width:auto;" onclick="buyMantimentos(1)">Comprar 1 (${unitMant} Tibar)</button>
      <button class="btn btn-sm" style="width:auto;" onclick="buyMantimentos(3)">Comprar 3 (${unitMant * 3} Tibar)</button>
      <button class="btn btn-sm" style="width:auto;" onclick="buyMantimentos(7)">Comprar 7 (${unitMant * 7} Tibar)</button>`;
  }

  // Render shop catalogs
  renderShopItems('mercado', 'shopItemsMercado', mod);
  renderShopItems('templo', 'shopItemsTemplo', templeMod);
  // Casa da Luz Vermelha — preço leve por reputação no Submundo
  let luzMod = 1.0;
  try {
    const rSub = (typeof getRep === 'function') ? getRep('submundo') : 0;
    if (rSub >= 40) luzMod = 0.85;
    else if (rSub >= 15) luzMod = 0.92;
    else if (rSub <= -30) luzMod = 1.2;
  } catch (e) {}
  renderShopItems('luz', 'shopItemsLuz', luzMod);
  const luzHint = document.getElementById('marketLuzRepHint');
  if (luzHint) {
    const rSub = (typeof getRep === 'function') ? getRep('submundo') : 0;
    const pct = Math.round((luzMod - 1) * 100);
    let t = `🃏 Reputação Submundo: <strong>${rSub}</strong>`;
    if (luzMod < 1) t += ` · Preços <strong style="color:var(--success)">${pct}% mais baratos</strong>`;
    else if (luzMod > 1) t += ` · Preços <strong style="color:var(--accent2)">+${pct}%</strong>`;
    else t += ' · Preços normais';
    luzHint.innerHTML = t;
  }

  if (!c) {
    if (container) container.innerHTML = '<p style="color:var(--muted)">Herói não encontrado.</p>';
    if (mantInfo) mantInfo.textContent = '';
    return;
  }
  const nc = normalizeCharacter(c);
  if (mantInfo) {
    mantInfo.innerHTML = `🧺 Mantimentos de <strong>${esc(nc.nome)}</strong>: <strong style="color:var(--accent)">${nc.mantimentos}</strong> · Status: <strong>${STATUS_LABELS[nc.status] || nc.status}</strong> · 💰 ${nc.ouro || 0} Tibar`;
  }
  const inv = nc.inventario || [];
  const sellMult = Math.max(0.35, Math.min(0.7, 0.5 / mod));
  if (!container) return;
  if (inv.length === 0) {
    container.innerHTML = `<p style="color:var(--muted)">Inventário vazio. Ouro: <strong>${nc.ouro || 0} Tibar</strong></p>`;
    return;
  }
  container.innerHTML = `
    <div style="margin-bottom:8px; font-size:0.9rem;">💰 Ouro atual: <strong style="color:var(--accent)">${nc.ouro || 0} Tibar</strong>
      <span style="font-size:0.78rem; color:var(--muted);"> · Venda ≈ ${Math.round(sellMult * 100)}% do valor</span>
    </div>
    ${inv.map((item, i) => {
      const sellPrice = Math.max(1, Math.floor((item.valor || 10) * sellMult));
      const qtd = item.qtd || 1;
      const useBtn = item.usavel
        ? `<button class="btn btn-sm" style="width:auto; background:var(--accent);" onclick="useInventoryItem('${heroId}', ${i})">Usar</button>`
        : '';
      return `
        <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; background:var(--bg-input); border:1px solid var(--border); border-radius:8px; padding:10px 12px; margin-bottom:6px; flex-wrap:wrap;">
          <div>
            <strong>${esc(item.nome)}</strong>${qtd > 1 ? ` ×${qtd}` : ''}
            <div style="font-size:0.78rem; color:var(--muted)">${esc(item.desc || item.tipo || '')} · Valor: ${item.valor || 0} Tibar</div>
          </div>
          <div style="display:flex; gap:6px; flex-wrap:wrap;">
            ${useBtn}
            <button class="btn btn-sm btn-success" onclick="sellItem('${heroId}', ${i})">Vender ${sellPrice}</button>
          </div>
        </div>`;
    }).join('')}`;
}

/** Compra item do catálogo SHOP_CATALOG e adiciona ao inventário (ou aplica serviço) */
function buyShopItem(itemId) {
  const catalog = SHOP_CATALOG.find(i => i.id === itemId);
  if (!catalog) { alert('Item não encontrado no catálogo.'); return; }
  const heroId = document.getElementById('marketHeroSelect').value;
  let list = getSaved();
  const idx = list.findIndex(c => c.id === heroId);
  if (idx < 0) return;
  const c = normalizeCharacter(list[idx]);

  const isTemple = catalog.categoria === 'templo';
  const isLuz = catalog.categoria === 'luz';
  let mod = 1.0;
  try {
    if (isTemple) mod = templePriceMod();
    else if (isLuz) {
      const rSub = (typeof getRep === 'function') ? getRep('submundo') : 0;
      if (rSub >= 40) mod = 0.85;
      else if (rSub >= 15) mod = 0.92;
      else if (rSub <= -30) mod = 1.2;
      else mod = 1.0;
    } else if (typeof marketPriceMod === 'function') mod = marketPriceMod();
  } catch (e) {}
  const price = Math.max(1, Math.round(catalog.valor * mod));

  if ((c.ouro || 0) < price) {
    alert(`Ouro insuficiente! Precisa de ${price} Tibar (tem ${c.ouro || 0}).`);
    return;
  }
  c.ouro -= price;

  // Serviços (templo / luz vermelha) que NÃO geram item físico
  if (catalog.tipo === 'servico' && !catalog.invNome) {
    let msg = applyTempleService(c, catalog.efeito);
    list[idx] = c;
    setSaved(list);
    try {
      if (isTemple && typeof changeReputation === 'function') {
        changeReputation('igreja', 1, `Serviço: ${catalog.nome}`, true);
      } else if (isLuz && typeof changeReputation === 'function') {
        changeReputation('submundo', 2, `Casa da Luz Vermelha: ${catalog.nome}`, true);
        changeReputation('igreja', -1, `Visitou a Casa da Luz Vermelha`, true);
      }
    } catch (e) {}
    const icon = isLuz ? '🔴' : '⛪';
    alert(`${icon} ${c.nome} — ${catalog.nome}\nCusto: ${price} Tibar\n${msg}\nOuro restante: ${c.ouro}`);
    updateMarketHeroSelect(heroId, c);
    renderMarketInventory();
    return;
  }

  // Item físico → inventário
  const invItem = {
    id: 'item_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
    nome: catalog.invNome || catalog.nome,
    tipo: catalog.tipo,
    valor: catalog.valor,
    qtd: 1,
    usavel: !!catalog.usavel,
    efeito: catalog.efeito || null,
    desc: catalog.desc,
    danoTipo: catalog.danoTipo || null,
    slot: catalog.slot || null,
    faAlways: catalog.faAlways || 0
  };

  // Bênção do Protetor também aplica status
  if (catalog.efeito === 'bencao_protetor') {
    c.statusEffects = c.statusEffects || [];
    c.statusEffects = c.statusEffects.filter(s => s.id !== 'bencao_protetor');
    c.statusEffects.push({ id: 'bencao_protetor', nome: 'Bênção do Protetor', bonus: '+1 R vs. magias/mentais', expires: Date.now() + 24 * 60 * 60 * 1000 });
  }

  c.inventario = c.inventario || [];
  const existing = c.inventario.find(i => i.nome === invItem.nome && i.tipo === invItem.tipo && i.efeito === invItem.efeito);
  if (existing) {
    existing.qtd = (existing.qtd || 1) + 1;
  } else {
    c.inventario.push(invItem);
  }

  list[idx] = c;
  setSaved(list);
  try {
    if (isTemple && typeof changeReputation === 'function') changeReputation('igreja', 1, `Compra no templo: ${catalog.nome}`, true);
    else if (!isTemple && typeof changeReputation === 'function') changeReputation('mercadores', 1, `Compra no mercado: ${catalog.nome}`, true);
  } catch (e) {}

  alert(`✅ ${c.nome} comprou:\n«${invItem.nome}»\nCusto: ${price} Tibar\nOuro restante: ${c.ouro}\n\n${invItem.desc}`);
  updateMarketHeroSelect(heroId, c);
  renderMarketInventory();
}

function applyTempleService(c, efeito) {
  switch (efeito) {
    case 'cura_divina': {
      c.pvAtual = c.pvMax || c.pvAtual;
      if (c.status === 'morto') c.status = 'normal';
      const tinhaTrauma2 = (c.statusEffects || []).some(s => s.id === 'trauma_cativeiro');
      c.statusEffects = (c.statusEffects || []).filter(s => s.id !== 'trauma_cativeiro');
      return `PV restaurados completamente (${c.pvAtual}/${c.pvMax}).` + (tinhaTrauma2 ? ' Trauma do cativeiro superado.' : '');
    }
    case 'tratamento_doencas':
      if (c.status === 'envenenado') c.status = 'normal';
      c.statusEffects = (c.statusEffects || []).filter(s => s.id !== 'doenca' && s.id !== 'toxina');
      return 'Doenças e toxinas comuns removidas.';
    case 'remocao_maldicao':
      c.statusEffects = (c.statusEffects || []).filter(s => s.id !== 'maldicao');
      return 'Maldições menores removidas.';
    case 'exorcismo':
      c.statusEffects = (c.statusEffects || []).filter(s => s.id !== 'possessao' && s.id !== 'influencia');
      return 'Possessões e influências demoníacas menores expulsas.';
    case 'santuario': {
      c.pvAtual = c.pvMax || c.pvAtual;
      c.pmAtual = c.pmMax || c.pmAtual;
      if (c.status === 'faminto' || c.status === 'dormindo') c.status = 'normal';
      const tinhaTrauma = (c.statusEffects || []).some(s => s.id === 'trauma_cativeiro');
      c.statusEffects = (c.statusEffects || []).filter(s => s.id !== 'trauma_cativeiro');
      return `Descansou no santuário. PV e PM restaurados (${c.pvAtual}/${c.pvMax} · ${c.pmAtual}/${c.pmMax}).` + (tinhaTrauma ? ' Trauma do cativeiro superado.' : '');
    }
    case 'ressurreicao':
      if (c.status !== 'morto' && (c.pvAtual || 0) > 0) {
        return 'O personagem não está morto — o ritual não foi necessário (ouro mesmo assim oferecido ao templo).';
      }
      applyResurrectionAftermath(c, true);
      return `Ressurreição concluída. PV ${c.pvAtual}/${c.pvMax}. Ferimentos: ${(c.injuries || []).map(i => i.nome).join(', ') || 'nenhum'}.`;
    // 🔴 Casa da Luz Vermelha
    case 'luz_carinho': {
      const res = typeof getCharResources === 'function' ? getCharResources(c) : null;
      c.pmMax = c.pmMax || (res && res.pm) || 5;
      if (typeof c.pmAtual !== 'number') c.pmAtual = c.pmMax;
      const mana = 1 + Math.floor(Math.random() * 6);
      const before = c.pmAtual;
      c.pmAtual = Math.min(c.pmMax, c.pmAtual + mana);
      if (c.status === 'faminto' || c.status === 'dormindo') c.status = 'normal';
      return `Companhia carinhosa. +${c.pmAtual - before} PM (${before}→${c.pmAtual}/${c.pmMax}). Ânimo restaurado.`;
    }
    case 'luz_prazer': {
      const res = typeof getCharResources === 'function' ? getCharResources(c) : null;
      c.pvMax = c.pvMax || (res && res.pv) || 10;
      c.pmMax = c.pmMax || (res && res.pm) || 5;
      if (typeof c.pvAtual !== 'number') c.pvAtual = c.pvMax;
      if (typeof c.pmAtual !== 'number') c.pmAtual = c.pmMax;
      const heal = (1 + Math.floor(Math.random() * 6)) + (c.R || 0);
      const mana = (1 + Math.floor(Math.random() * 6)) + (c.H || 0);
      const pvB = c.pvAtual, pmB = c.pmAtual;
      c.pvAtual = Math.min(c.pvMax, c.pvAtual + heal);
      c.pmAtual = Math.min(c.pmMax, c.pmAtual + mana);
      if (c.status === 'faminto' || c.status === 'dormindo') c.status = 'normal';
      try { if (typeof consumePeriodForAction === 'function') consumePeriodForAction(); } catch (e) {}
      return `Noite de prazer. +${c.pvAtual - pvB} PV, +${c.pmAtual - pmB} PM. Descanso prazeroso concluído.`;
    }
    case 'luz_luxo': {
      const res = typeof getCharResources === 'function' ? getCharResources(c) : null;
      c.pvMax = c.pvMax || (res && res.pv) || 10;
      c.pmMax = c.pmMax || (res && res.pm) || 5;
      c.pvAtual = c.pvMax;
      c.pmAtual = c.pmMax;
      if (c.status !== 'morto') c.status = 'abençoado';
      c.statusEffects = c.statusEffects || [];
      c.statusEffects = c.statusEffects.filter(s => s.id !== 'luz_luxo');
      c.statusEffects.push({ id: 'luz_luxo', nome: 'Suíte de Luxo', bonus: 'Ânimo elevado · tratado como abençoado', expires: Date.now() + 24 * 60 * 60 * 1000 });
      // Bônus de afeto em NPC com romance, se existir
      try {
        const npcs = typeof getNpcs === 'function' ? getNpcs() : [];
        const romance = npcs.find(n => n.romance && !n.recrutado);
        if (romance) {
          romance.afeto = Math.min(100, (romance.afeto || 0) + 5);
          const listN = getNpcs();
          const ni = listN.findIndex(x => x.id === romance.id);
          if (ni >= 0) { listN[ni] = romance; setNpcs(listN); }
          return `Suíte de luxo. PV/PM cheios. Status abençoado. Afeto de ${romance.nome} +5 → ${romance.afeto}/100.`;
        }
      } catch (e) {}
      return `Suíte de luxo. PV/PM restaurados por completo (${c.pvMax}/${c.pmMax}). Status: abençoado.`;
    }
    case 'luz_segredo': {
      const res = typeof getCharResources === 'function' ? getCharResources(c) : null;
      c.pmMax = c.pmMax || (res && res.pm) || 5;
      if (typeof c.pmAtual !== 'number') c.pmAtual = c.pmMax;
      const mana = 1 + Math.floor(Math.random() * 6);
      const before = c.pmAtual;
      c.pmAtual = Math.min(c.pmMax, c.pmAtual + mana);
      const rumores = [
        'Há um túnel sob a taverna que leva aos esgotos.',
        'Um mercador da feira esconde pedras de mana falsas.',
        'A Igreja procura um artefato roubado — recompensa generosa.',
        'Bandoleiros preparan emboscada na estrada leste.',
        'Uma druida solitária viu luzes estranhas na floresta.',
        'O guarda-chefe aceita suborno para “ignorar” contrabando.',
        'Alguém vende mapas de uma cripta selada nas ruínas.'
      ];
      const rumor = rumores[Math.floor(Math.random() * rumores.length)];
      try {
        if (typeof appendToCampaignLog === 'function') {
          appendToCampaignLog({
            type: 'rumor',
            title: '💋 Segredo de travesseiro',
            text: rumor,
            time: new Date().toLocaleString('pt-BR')
          });
        }
      } catch (e) {}
      return `+${c.pmAtual - before} PM. Rumor ouvido: «${rumor}» (salvo no diário).`;
    }
    default:
      return 'Serviço realizado.';
  }
}

function updateMarketHeroSelect(heroId, c) {
  const sel = document.getElementById('marketHeroSelect');
  if (!sel) return;
  [...sel.options].forEach(o => {
    if (o.value === heroId) o.textContent = `${c.nome} (${c.ouro} Tibar)`;
  });
}

/** Usa um item consumível do inventário */
function useInventoryItem(heroId, itemIndex) {
  let list = getSaved();
  const idx = list.findIndex(c => c.id === heroId);
  if (idx < 0) return;
  const c = normalizeCharacter(list[idx]);
  const inv = c.inventario || [];
  if (itemIndex < 0 || itemIndex >= inv.length) return;
  const item = inv[itemIndex];
  if (!item.usavel) {
    alert('Este item não é usável.');
    return;
  }

  let msg = '';
  const efeito = item.efeito || '';

  function rollD6() { return 1 + Math.floor(Math.random() * 6); }
  function rollNd(n) {
    let t = 0;
    for (let i = 0; i < n; i++) t += rollD6();
    return t;
  }

  switch (efeito) {
    case 'cura1d1':
    case 'cura5': {
      const heal = efeito === 'cura5' ? 5 : (rollD6() + 1);
      const before = c.pvAtual || 0;
      c.pvAtual = Math.min(c.pvMax || before, before + heal);
      msg = `Recuperou ${c.pvAtual - before} PV (${before} → ${c.pvAtual}/${c.pvMax}).`;
      break;
    }
    case 'cura3d3': {
      const heal = rollNd(3) + 3;
      const before = c.pvAtual || 0;
      c.pvAtual = Math.min(c.pvMax || before, before + heal);
      msg = `Recuperou ${c.pvAtual - before} PV (${before} → ${c.pvAtual}/${c.pvMax}).`;
      break;
    }
    case 'mana1d1':
    case 'mana5': {
      const mana = efeito === 'mana5' ? 5 : (rollD6() + 1);
      const before = c.pmAtual || 0;
      c.pmAtual = Math.min(c.pmMax || before, before + mana);
      msg = `Recuperou ${c.pmAtual - before} PM (${before} → ${c.pmAtual}/${c.pmMax}).`;
      break;
    }
    case 'antidoto':
      if (c.status === 'envenenado') c.status = 'normal';
      c.statusEffects = (c.statusEffects || []).filter(s => s.id !== 'toxina' && s.id !== 'veneno');
      msg = 'Veneno/toxina removido. Status limpo.';
      break;
    case 'racoes7':
      c.mantimentos = (c.mantimentos || 0) + 7;
      if (c.status === 'faminto') c.status = 'normal';
      msg = `+7 mantimentos (total: ${c.mantimentos}). Fome evitada por ~7 dias.`;
      break;
    case 'tocha':
      c.statusEffects = c.statusEffects || [];
      c.statusEffects.push({ id: 'luz', nome: 'Tocha acesa', bonus: 'Ilumina 6m · sem penalidade de escuridão', expires: Date.now() + 60 * 60 * 1000 });
      msg = 'Tocha acesa (1 hora de iluminação).';
      // reduz quantidade de tochas se o nome indicar pacote
      break;
    case 'agua_benta':
      msg = 'Água Benta preparada para uso contra mortos-vivos/demônios (1d + Pdf, ignora armadura). Use narrativamente em combate.';
      break;
    case 'pergaminho':
      msg = 'Pergaminho consumido. Você pode conjurar a magia escrita uma vez (ainda gasta os PMs).';
      break;
    case 'pedra_amolar':
      c.statusEffects = c.statusEffects || [];
      c.statusEffects = c.statusEffects.filter(s => s.id !== 'pedra_amolar');
      c.statusEffects.push({ id: 'pedra_amolar', nome: 'Ataque Especial', bonus: '+1 F/Pdf no próximo ataque', expires: null });
      msg = 'Próximo ataque recebe +1 em F ou Pdf (Ataque Especial).';
      break;
    default:
      msg = `Usou «${item.nome}». Efeito aplicado narrativamente.`;
  }

  // Consome 1 unidade
  if ((item.qtd || 1) > 1) {
    item.qtd -= 1;
  } else {
    inv.splice(itemIndex, 1);
  }
  c.inventario = inv;
  list[idx] = c;
  setSaved(list);

  alert(`🧪 ${c.nome} usou «${item.nome}»\n${msg}`);
  updateMarketHeroSelect(heroId, c);
  renderMarketInventory();
  // Atualiza ficha se estiver na tela de visualização
  try {
    const viewScreen = document.getElementById('screenView');
    if (viewScreen && !viewScreen.classList.contains('hidden')) {
      openView(heroId);
    }
  } catch (e) {}
}

