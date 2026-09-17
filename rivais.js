/* ===== [PLANILHA_RIVAIS] linhas originais 10468-11496 ===== */
/* ==================== PLANILHA DE RIVAIS (UI + persistência) ====================
 * KEYS.planilhaRivais = { entries: [ { id, nome, P, H, R, classe, aparencia, personalidade, motivacao, local, tier, favorita } ] }
 * Tiers: fraca | media | chefe — afetam peso no sorteio e bônus de stats ao ativar.
 */
function _seedPlanilhaFromDefault() {
  return (RIVAIS_PLANILHA_F || []).map((r, i) => ({
    id: 'pr_' + i + '_' + String(r.nome || '').toLowerCase().replace(/\s+/g, '_').slice(0, 24),
    nome: r.nome,
    P: r.P || 3,
    H: r.H || 2,
    R: r.R || 2,
    classe: r.classe || '',
    aparencia: r.aparencia != null ? r.aparencia : 5,
    personalidade: r.personalidade || '',
    motivacao: r.motivacao || '',
    local: r.local || '',
    tier: _inferTierRival(r),
    favorita: false
  }));
}

function _inferTierRival(r) {
  const sum = (Number(r.P) || 0) + (Number(r.H) || 0) + (Number(r.R) || 0);
  if (sum >= 12) return 'chefe';
  if (sum <= 7) return 'fraca';
  return 'media';
}

function getPlanilhaRivais() {
  try {
    let st = storeGetJSON(KEYS.planilhaRivais, null);
    // Só faz seed na primeira vez (initialized). Lista vazia intencional não é re-preenchida.
    if (!st || !Array.isArray(st.entries) || !st.initialized) {
      st = { entries: _seedPlanilhaFromDefault(), initialized: true };
      storeSet(KEYS.planilhaRivais, st);
    }
    return st;
  } catch (e) {
    return { entries: _seedPlanilhaFromDefault(), initialized: true };
  }
}

function setPlanilhaRivais(st) {
  try {
    storeSet(KEYS.planilhaRivais, {
      entries: Array.isArray(st && st.entries) ? st.entries : [],
      initialized: true
    });
  } catch (e) {}
}

function resetPlanilhaRivaisPadrao() {
  setPlanilhaRivais({ entries: _seedPlanilhaFromDefault(), initialized: true });
  renderPlanilhaRivaisUI();
  alert('Planilha restaurada ao padrão (' + RIVAIS_PLANILHA_F.length + ' rivais).');
}

/** Sorteia ficha: favoritas pesam 3×, chefe 1.5×, fraca 0.7× */
function sortearRivalPlanilha() {
  try {
    const st = getPlanilhaRivais();
    const list = st.entries || [];
    if (list.length) {
      const weights = list.map(r => {
        let w = 1;
        if (r.favorita) w *= 3;
        if (r.tier === 'chefe') w *= 1.5;
        else if (r.tier === 'fraca') w *= 0.7;
        return w;
      });
      let total = weights.reduce((a, b) => a + b, 0);
      let roll = Math.random() * total;
      for (let i = 0; i < list.length; i++) {
        roll -= weights[i];
        if (roll <= 0) return Object.assign({}, list[i]);
      }
      return Object.assign({}, list[list.length - 1]);
    }
  } catch (e) {}
  try {
    if (RIVAIS_PLANILHA_F && RIVAIS_PLANILHA_F.length) {
      return Object.assign({}, RIVAIS_PLANILHA_F[Math.floor(Math.random() * RIVAIS_PLANILHA_F.length)]);
    }
  } catch (e) {}
  const nome = FALHA_RIVAIS_NOMES[Math.floor(Math.random() * FALHA_RIVAIS_NOMES.length)];
  return { nome, P: 3 + Math.floor(Math.random() * 3), H: 2 + Math.floor(Math.random() * 3), R: 2 + Math.floor(Math.random() * 2), aparencia: 4 + Math.floor(Math.random() * 4), tier: 'media' };
}

function tierBonusStats(tier) {
  if (tier === 'chefe') return { P: 1, H: 1, R: 1 };
  if (tier === 'fraca') return { P: 0, H: 0, R: 0 };
  return { P: 0, H: 0, R: 0 };
}

function renderPlanilhaRivaisUI() {
  const el = document.getElementById('planilhaRivaisList');
  if (!el) return;
  const st = getPlanilhaRivais();
  let list = st.entries || [];
  const filtro = (document.getElementById('planilhaRivalFiltro') || {}).value || 'todas';
  if (filtro === 'favoritas') list = list.filter(r => r.favorita);
  else if (filtro === 'fraca' || filtro === 'media' || filtro === 'chefe') list = list.filter(r => r.tier === filtro);

  if (!list.length) {
    el.innerHTML = '<p style="color:var(--muted);font-size:0.85rem;text-align:center;">Nenhuma rival neste filtro.</p>';
    return;
  }

  const tierLabel = { fraca: 'Fraca', media: 'Média', chefe: 'Chefe' };
  el.innerHTML = list.map((r) => {
    const idx = (st.entries || []).findIndex(x => x.id === r.id);
    return `
      <div class="card" style="background:var(--bg-input);margin-bottom:8px;padding:10px;border-color:${r.favorita ? '#fbbf24' : 'var(--border)'};">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;flex-wrap:wrap;">
          <div style="flex:1;min-width:140px;">
            <strong style="color:#fb7185;">${r.favorita ? '⭐ ' : ''}${esc(r.nome)}</strong>
            <span style="font-size:0.75rem;color:var(--muted);"> · ${esc(tierLabel[r.tier] || r.tier || 'média')}</span>
            <div style="font-size:0.8rem;color:var(--muted);margin-top:2px;">
              P${r.P} H${r.H} R${r.R}${r.classe ? ' · ' + esc(r.classe) : ''}${r.local ? ' · 📍 ' + esc(r.local) : ''}
            </div>
            ${r.motivacao ? `<div style="font-size:0.75rem;color:var(--muted);">🎯 ${esc(r.motivacao)}</div>` : ''}
            ${r.personalidade ? `<div style="font-size:0.75rem;color:var(--muted);">💭 ${esc(r.personalidade)}</div>` : ''}
          </div>
          <div style="display:flex;gap:4px;flex-wrap:wrap;">
            <button class="btn btn-sm btn-outline" style="width:auto;padding:2px 8px;" onclick="toggleFavoritaPlanilha(${idx})" title="Favorita">${r.favorita ? '⭐' : '☆'}</button>
            <button class="btn btn-sm btn-outline" style="width:auto;padding:2px 8px;" onclick="cicloTierPlanilha(${idx})">Tier</button>
            <button class="btn btn-sm btn-outline" style="width:auto;padding:2px 8px;" onclick="editarRivalPlanilha(${idx})">✏️</button>
            <button class="btn btn-sm" style="width:auto;padding:2px 8px;background:#f87171;color:#000;" onclick="ativarRivalDaPlanilha(${idx})">Ativar</button>
            <button class="btn btn-sm btn-danger" style="width:auto;padding:2px 8px;" onclick="removerRivalPlanilha(${idx})">🗑️</button>
          </div>
        </div>
      </div>`;
  }).join('');
}

function toggleFavoritaPlanilha(idx) {
  const st = getPlanilhaRivais();
  if (!st.entries[idx]) return;
  st.entries[idx].favorita = !st.entries[idx].favorita;
  setPlanilhaRivais(st);
  renderPlanilhaRivaisUI();
}

function cicloTierPlanilha(idx) {
  const st = getPlanilhaRivais();
  if (!st.entries[idx]) return;
  const order = ['fraca', 'media', 'chefe'];
  const cur = st.entries[idx].tier || 'media';
  const next = order[(order.indexOf(cur) + 1) % order.length];
  st.entries[idx].tier = next;
  setPlanilhaRivais(st);
  renderPlanilhaRivaisUI();
}

function editarRivalPlanilha(idx) {
  const st = getPlanilhaRivais();
  const r = st.entries[idx];
  if (!r) return;
  const nome = prompt('Nome:', r.nome);
  if (nome === null) return;
  const p = prompt('Poder (P):', String(r.P));
  if (p === null) return;
  const h = prompt('Habilidade (H):', String(r.H));
  if (h === null) return;
  const res = prompt('Resistência (R):', String(r.R));
  if (res === null) return;
  const classe = prompt('Classe:', r.classe || '');
  if (classe === null) return;
  const motivacao = prompt('Motivação:', r.motivacao || '');
  if (motivacao === null) return;
  const personalidade = prompt('Personalidade:', r.personalidade || '');
  if (personalidade === null) return;
  const local = prompt('Local típico:', r.local || '');
  if (local === null) return;
  const ap = prompt('Aparência (1–10):', String(r.aparencia != null ? r.aparencia : 5));
  if (ap === null) return;

  r.nome = String(nome).trim() || r.nome;
  r.P = Math.max(1, Math.min(10, parseInt(p, 10) || r.P));
  r.H = Math.max(1, Math.min(10, parseInt(h, 10) || r.H));
  r.R = Math.max(1, Math.min(10, parseInt(res, 10) || r.R));
  r.classe = String(classe).trim();
  r.motivacao = String(motivacao).trim();
  r.personalidade = String(personalidade).trim();
  r.local = String(local).trim();
  r.aparencia = Math.max(1, Math.min(10, parseInt(ap, 10) || 5));
  // re-infere tier se stats mudaram muito? mantém o escolhido pelo user
  st.entries[idx] = r;
  setPlanilhaRivais(st);
  renderPlanilhaRivaisUI();
}

function adicionarRivalPlanilhaManual() {
  const nome = prompt('Nome da nova rival:', '');
  if (!nome || !String(nome).trim()) return;
  const st = getPlanilhaRivais();
  st.entries.push({
    id: 'pr_custom_' + Date.now().toString(36),
    nome: String(nome).trim(),
    P: 3, H: 3, R: 2,
    classe: '',
    aparencia: 6,
    personalidade: '',
    motivacao: '',
    local: '',
    tier: 'media',
    favorita: false
  });
  setPlanilhaRivais(st);
  renderPlanilhaRivaisUI();
  // abre edição
  editarRivalPlanilha(st.entries.length - 1);
}

function removerRivalPlanilha(idx) {
  const st = getPlanilhaRivais();
  if (!st.entries[idx]) return;
  if (!confirm('Remover «' + st.entries[idx].nome + '» da planilha?')) return;
  st.entries.splice(idx, 1);
  setPlanilhaRivais(st);
  renderPlanilhaRivaisUI();
}

/** Coloca a rival da planilha na lista de rivais ativos (falhas.rivais). */
function ativarRivalDaPlanilha(idx) {
  try {
    const st = getPlanilhaRivais();
    const r = st.entries[idx];
    if (!r) return;
    const falhas = getFalhasState();
    const existente = (falhas.rivais || []).find(x => x.nome === r.nome && !x.derrotado);
    if (existente) {
      if (!confirm('«' + r.nome + '» já é rival ativa. Confrontar agora?')) return;
      if (typeof montarEncontroRival === 'function') montarEncontroRival(existente, false);
      return;
    }
    const bonus = tierBonusStats(r.tier);
    falhas.rivais = falhas.rivais || [];
    falhas.rivais.push({
      nome: r.nome,
      vezes: 1,
      criadoEm: new Date().toLocaleString('pt-BR'),
      ultimaFonte: 'planilha',
      P: (r.P || 3) + (bonus.P || 0),
      H: (r.H || 2) + (bonus.H || 0),
      R: (r.R || 2) + (bonus.R || 0),
      classe: r.classe || '',
      personalidade: r.personalidade || '',
      motivacao: r.motivacao || '',
      aparencia: r.aparencia != null ? r.aparencia : 5,
      tier: r.tier || 'media',
      planilhaId: r.id
    });
    setFalhasState(falhas);
    try { renderFalhasPanel(); } catch (e) {}
    if (confirm('«' + r.nome + '» ativada como rival.\nConfrontar agora?')) {
      const ativa = getRivaisAtivos().find(x => x.nome === r.nome);
      if (ativa && typeof montarEncontroRival === 'function') montarEncontroRival(ativa, false);
    }
  } catch (e) {
    console.warn(e);
    alert('Não foi possível ativar a rival.');
  }
}

function exportarPlanilhaRivais() {
  try {
    const st = getPlanilhaRivais();
    const payload = {
      tipo: '3det_planilha_rivais',
      exportadoEm: new Date().toLocaleString('pt-BR'),
      total: (st.entries || []).length,
      entries: st.entries || []
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = '3det_planilha_rivais_' + new Date().toISOString().slice(0, 10) + '.json';
    a.click();
    URL.revokeObjectURL(a.href);
  } catch (e) {
    alert('Falha ao exportar.');
  }
}

function importarPlanilhaRivais(ev) {
  const f = ev.target && ev.target.files && ev.target.files[0];
  if (!f) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      const entries = data.entries || data.planilha || (Array.isArray(data) ? data : null);
      if (!entries || !entries.length) throw new Error('vazio');
      if (!confirm('Importar ' + entries.length + ' rivais?\nIsso SUBSTITUI a planilha atual.')) {
        ev.target.value = '';
        return;
      }
      const normalized = entries.map((r, i) => ({
        id: r.id || ('pr_imp_' + i + '_' + Date.now().toString(36)),
        nome: r.nome || 'Rival',
        P: Number(r.P) || 3,
        H: Number(r.H) || 2,
        R: Number(r.R) || 2,
        classe: r.classe || '',
        aparencia: r.aparencia != null ? Number(r.aparencia) : 5,
        personalidade: r.personalidade || '',
        motivacao: r.motivacao || '',
        local: r.local || '',
        tier: r.tier || _inferTierRival(r),
        favorita: !!r.favorita
      }));
      setPlanilhaRivais({ entries: normalized });
      renderPlanilhaRivaisUI();
      alert('Planilha importada: ' + normalized.length + ' rivais.');
    } catch (e) {
      alert('Arquivo inválido.');
    }
    ev.target.value = '';
  };
  reader.readAsText(f);
}

/**
 * Aplica uma consequência de falha.
 * @param {{ fonte: string, label?: string, heroIds?: string[] }} opts
 * @returns {{ tipo: string, texto: string }|null}
 */
function aplicarConsequenciaFalhaSolo(opts) {
  try {
    opts = opts || {};
    const fonte = opts.fonte || 'geral';
    const label = opts.label || 'Fracasso';
    // Escolhe tipo com pesos leves
    const roll = Math.random();
    let tipo = 'rumor';
    if (roll < 0.28) tipo = 'cicatriz';
    else if (roll < 0.50) tipo = 'rival';
    else if (roll < 0.72) tipo = 'divida';
    else tipo = 'rumor';

    const st = getFalhasState();
    let texto = '';
    const entry = {
      id: 'falha_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
      tipo,
      fonte,
      label,
      time: new Date().toLocaleString('pt-BR'),
      day: (typeof timeState !== 'undefined' && timeState) ? (timeState.day || 1) : 1
    };

    if (tipo === 'cicatriz') {
      const cic = FALHA_CICATRIZES[Math.floor(Math.random() * FALHA_CICATRIZES.length)];
      entry.nome = cic.nome;
      entry.desc = cic.desc;
      entry.social = cic.social || 0;
      texto = `🩹 Cicatriz narrativa: «${cic.nome}» — ${cic.desc}`;
      // Aplica statusEffect no(s) herói(s)
      const ids = (opts.heroIds && opts.heroIds.length)
        ? opts.heroIds
        : (typeof getSelectedPartyIds === 'function' ? getSelectedPartyIds() : []);
      if (ids && ids.length && typeof getSaved === 'function') {
        const list = getSaved();
        let changed = false;
        ids.forEach(id => {
          const idx = list.findIndex(c => c.id === id);
          if (idx < 0) return;
          const c = normalizeCharacter(list[idx]);
          c.statusEffects = c.statusEffects || [];
          c.statusEffects = c.statusEffects.filter(s => s.id !== 'cicatriz_falha');
          c.statusEffects.push({
            id: 'cicatriz_falha',
            nome: cic.nome,
            bonus: cic.desc,
            mod: cic.social || 0,
            periodosRestantes: Math.max(2, (cic.dias || 1) * 4) // ~dias em etapas
          });
          list[idx] = c;
          changed = true;
        });
        if (changed) setSaved(list);
      }
    } else if (tipo === 'rival') {
      const ficha = typeof sortearRivalPlanilha === 'function' ? sortearRivalPlanilha() : { nome: 'Rival', P: 3, H: 3, R: 2 };
      const nome = ficha.nome;
      const existente = st.rivais.find(r => r.nome === nome);
      if (existente) {
        existente.vezes = (existente.vezes || 1) + 1;
        existente.ultimaFonte = fonte;
        texto = `🗡️ A rival «${nome}» volta a notar o grupo (encontro #${existente.vezes}).`;
      } else {
        st.rivais.push({
          nome,
          vezes: 1,
          criadoEm: entry.time,
          ultimaFonte: fonte,
          P: ficha.P || 3,
          H: ficha.H || 2,
          R: ficha.R || 2,
          classe: ficha.classe || '',
          personalidade: ficha.personalidade || '',
          motivacao: ficha.motivacao || '',
          aparencia: ficha.aparencia != null ? ficha.aparencia : 5
        });
        texto = `🗡️ Nova rival: «${nome}»${ficha.classe ? ' (' + ficha.classe + ')' : ''} passa a caçar a reputação do grupo.`;
      }
      entry.nome = nome;
    } else if (tipo === 'divida') {
      const valor = 10 + Math.floor(Math.random() * 21); // 10–30
      entry.valor = valor;
      entry.nome = 'Dívida de fracasso';
      texto = `💰 Dívida leve de ${valor} Tibar (favor, multa ou prejuízo).`;
      const ids = (opts.heroIds && opts.heroIds.length)
        ? opts.heroIds
        : (typeof getSelectedPartyIds === 'function' ? getSelectedPartyIds() : []);
      if (ids && ids.length && typeof getSaved === 'function') {
        const list = getSaved();
        const idx = list.findIndex(c => c.id === ids[0]);
        if (idx >= 0) {
          const c = normalizeCharacter(list[idx]);
          // Prefere registrar dívida; se já tem escravidão/dívida, só soma ouro negativo lógico
          if (c.escravidao && typeof c.escravidao.divida === 'number') {
            c.escravidao.divida += valor;
            texto += ` Somada à dívida existente de ${c.nome}.`;
          } else {
            c.ouro = Math.max(0, (c.ouro || 0) - Math.min(valor, c.ouro || 0));
            const resto = valor - Math.min(valor, (list[idx].ouro || 0) === c.ouro ? 0 : valor);
            // Simplificado: debita o que puder do ouro do primeiro herói
            texto += ` Debitado de ${c.nome} (ouro restante: ${c.ouro}).`;
          }
          list[idx] = c;
          setSaved(list);
        }
      }
    } else {
      // rumor
      const rumor = FALHA_RUMORES[Math.floor(Math.random() * FALHA_RUMORES.length)];
      entry.nome = 'Rumor na cidade';
      entry.desc = rumor;
      texto = `📢 Rumor: «${rumor}»`;
      try {
        if (typeof changeReputation === 'function' && Math.random() < 0.55) {
          const fac = Math.random() < 0.5 ? 'mercadores' : 'igreja';
          changeReputation(fac, -2, 'Rumor após fracasso: ' + label, true);
          texto += ` (−2 reputação ${fac}).`;
        }
      } catch (e) {}
    }

    st.lista.unshift(entry);
    if (st.lista.length > 40) st.lista = st.lista.slice(0, 40);
    setFalhasState(st);

    try {
      if (typeof appendToCampaignLog === 'function') {
        appendToCampaignLog({
          type: 'falha',
          title: '💥 Consequência: ' + (entry.nome || tipo),
          text: texto + ' (fonte: ' + fonte + ' — ' + label + ')',
          time: entry.time
        });
      }
    } catch (e) {}

    try { if (typeof renderFalhasPanel === 'function') renderFalhasPanel(); } catch (e) {}
    return { tipo, texto, entry };
  } catch (e) {
    console.warn('aplicarConsequenciaFalhaSolo', e);
    return null;
  }
}

/** Lista rivais para uso futuro em encontros (módulo 3). */
function getRivaisAtivos() {
  return (getFalhasState().rivais || []).filter(r => !r.derrotado);
}

function getAllRivais() {
  return getFalhasState().rivais || [];
}

/** Converte rival persistente em ficha de inimigo para a Arena. */
function rivalParaInimigo(r) {
  const vezes = r.vezes || 1;
  const bonus = Math.min(3, Math.floor((vezes - 1) / 2)); // fica mais forte a cada 2 encontros
  return {
    nome: r.nome + (vezes > 1 ? ' (rival ×' + vezes + ')' : ' (rival)'),
    P: (r.P || 3) + bonus,
    H: (r.H || 2) + Math.floor(bonus / 2),
    R: (r.R || 2) + Math.floor(bonus / 2),
    isTemp: true,
    isRival: true,
    rivalNome: r.nome,
    capturavel: true,
    comportamento: 'implacavel',
    vantagens: ['Rival Recorrente'],
    aparencia: typeof r.aparencia === 'number' ? r.aparencia : 5,
    sexo: 'F',
    sexoLabel: 'Fêmea',
    isFemaleMonster: true
  };
}

/** Registra que o grupo enfrentou o rival (incrementa vezes). */
function registrarEncontroRival(nomeRival) {
  try {
    const st = getFalhasState();
    const r = (st.rivais || []).find(x => x.nome === nomeRival);
    if (!r) return;
    r.vezes = (r.vezes || 1) + 1;
    r.ultimoEncontro = new Date().toLocaleString('pt-BR');
    setFalhasState(st);
  } catch (e) {}
}

/** Marca rival como derrotado (ou remove se preferir). */
function marcarRivalDerrotado(nomeRival) {
  try {
    const st = getFalhasState();
    const r = (st.rivais || []).find(x => x.nome === nomeRival);
    if (!r) return;
    r.derrotado = true;
    r.derrotadoEm = new Date().toLocaleString('pt-BR');
    setFalhasState(st);
    try {
      if (typeof appendToCampaignLog === 'function') {
        appendToCampaignLog({
          type: 'rival',
          title: '🗡️ Rival derrotado: ' + nomeRival,
          text: 'O rival recorrente foi vencido em combate.',
          time: new Date().toLocaleString('pt-BR')
        });
      }
    } catch (e) {}
  } catch (e) {}
}

/**
 * Chance de um rival aparecer no lugar de um encontro aleatório.
 * Retorna true se substituiu o evento.
 */
function tentarEncontroRivalAutomatico() {
  try {
    const rivais = getRivaisAtivos();
    if (!rivais.length) return false;
    // 28% se houver rival ativo
    if (Math.random() > 0.28) return false;
    const r = rivais[Math.floor(Math.random() * rivais.length)];
    montarEncontroRival(r, true);
    return true;
  } catch (e) {
    return false;
  }
}

function montarEncontroRival(r, auto) {
  if (!r) return;
  // Congela contagem de encontros para esta cena (registrar depois não altera o texto)
  const vezesAntes = r.vezes || 1;
  const inim = rivalParaInimigo(r);
  registrarEncontroRival(r.nome);
  // Atualiza stats no storage com o bônus atual para próximos
  try {
    const st = getFalhasState();
    const rr = st.rivais.find(x => x.nome === r.nome);
    if (rr) {
      rr.P = inim.P;
      rr.H = inim.H;
      rr.R = inim.R;
      setFalhasState(st);
    }
  } catch (e) {}

  currentEnemiesForBattle = [inim];
  currentEventType = 'Combate';
  eventResolved = false;
  window.currentReward = {
    tipo: 'ouro',
    nome: 'Espólio do rival',
    qtd: 15 + vezesAntes * 5,
    valor: 15 + vezesAntes * 5
  };

  const display = document.getElementById('eventContent');
  const displayButtons = document.getElementById('eventActionButtons');
  if (display) {
    display.innerHTML = `
      <div style="background:rgba(248,113,113,0.12); border:1px solid #f87171; border-radius:10px; padding:14px; margin-bottom:12px;">
        <div style="font-weight:800; color:#f87171; font-size:1.1rem;">🗡️ Rival recorrente!</div>
        <div style="margin-top:8px;"><strong>${esc(inim.nome)}</strong></div>
        <div style="font-size:0.9rem; color:var(--muted);">P${inim.P} H${inim.H} R${inim.R} · Encontros: ×${vezesAntes}</div>
        <div style="margin-top:10px; font-size:0.88rem;">
          ${auto ? 'O destino coloca a rival no seu caminho.' : 'Você decide confrontar a rival de frente.'}
          Ela se lembra de você — e está mais preparada.
        </div>
      </div>
    `;
  }
  if (displayButtons) {
    displayButtons.innerHTML = `
      <button class="btn" style="background:linear-gradient(135deg,#ef4444,#f97316);color:#fff;" onclick="startEncounterBattle()">⚔️ Combater na Arena</button>
      <button class="btn btn-success" onclick="resolveEncounter(true)">✅ Vitória (narrativa)</button>
      <button class="btn btn-danger" onclick="resolveEncounter(false)">❌ Fugir / Fracasso</button>
    `;
  }
  const resultCardEl = document.getElementById('resultCard');
  if (resultCardEl) resultCardEl.classList.remove('hidden');
  try {
    if (typeof appendToCampaignLog === 'function') {
      appendToCampaignLog({
        type: 'rival',
        title: '🗡️ Encontro com rival: ' + r.nome,
        text: `P${inim.P} H${inim.H} R${inim.R} · vez #${r.vezes || 1}`,
        time: new Date().toLocaleString('pt-BR')
      });
    }
  } catch (e) {}
  try { renderFalhasPanel(); } catch (e) {}
}

/** Botão manual: escolhe rival aleatório (ou o único) e monta encontro. */
function gerarEncontroRival() {
  const rivais = getRivaisAtivos();
  if (!rivais.length) {
    alert('Nenhum rival ativo. Fracassos podem criar rivais (consequência “rival”).');
    return;
  }
  const r = rivais.length === 1 ? rivais[0] : rivais[Math.floor(Math.random() * rivais.length)];
  if (!confirm(`Confrontar «${r.nome}»?\nP${r.P || 3} H${r.H || 2} R${r.R || 2} · Encontros: ×${r.vezes || 1}`)) return;
  // Consome período se a função existir
  try { if (typeof consumePeriodForAction === 'function') consumePeriodForAction(); } catch (e) {}
  montarEncontroRival(r, false);
  try {
    const ev = document.getElementById('resultCard');
    if (ev) ev.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  } catch (e) {}
}

function confrontarRivalPorIndice(idx) {
  const rivais = getAllRivais();
  if (!rivais[idx] || rivais[idx].derrotado) {
    alert('Rival indisponível.');
    return;
  }
  if (!confirm(`Confrontar «${rivais[idx].nome}»?`)) return;
  try { if (typeof consumePeriodForAction === 'function') consumePeriodForAction(); } catch (e) {}
  montarEncontroRival(rivais[idx], false);
}

function renderFalhasPanel() {
  const el = document.getElementById('falhasPersistentesList');
  if (!el) return;
  const st = getFalhasState();
  const recent = (st.lista || []).slice(0, 8);
  const rivais = st.rivais || [];
  let html = '';
  if (rivais.length) {
    html += '<div style="margin-bottom:10px;"><strong style="color:#f87171;">🗡️ Rivais recorrentes</strong>';
    html += rivais.map((r, i) => {
      const dead = !!r.derrotado;
      return `<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;background:var(--bg-input);border:1px solid var(--border);border-radius:8px;padding:8px 10px;margin-top:6px;${dead ? 'opacity:0.55;' : ''}">
        <div style="flex:1;min-width:120px;">
          <strong>${esc(r.nome)}</strong>${dead ? ' <span style="color:var(--muted);">(derrotado)</span>' : ''}
          <div style="font-size:0.78rem;color:var(--muted);">P${r.P || 3} H${r.H || 2} R${r.R || 2} · ×${r.vezes || 1} encontro(s)${r.classe ? ' · ' + esc(r.classe) : ''}</div>
          ${r.motivacao ? `<div style="font-size:0.75rem;color:var(--muted);">🎯 ${esc(r.motivacao)}</div>` : ''}
        </div>
        ${!dead ? `<button class="btn btn-sm" style="width:auto;background:#f87171;color:#000;" onclick="confrontarRivalPorIndice(${i})">Confrontar</button>` : ''}
      </div>`;
    }).join('');
    html += '</div>';
  }
  if (!recent.length && !rivais.length) {
    html += '<p style="color:var(--muted);font-size:0.85rem;text-align:center;">Nenhuma consequência de falha registrada ainda.</p>';
  } else if (recent.length) {
    html += '<div style="font-size:0.8rem;color:var(--muted);margin-bottom:4px;">Histórico recente</div>';
    html += recent.map(e =>
      `<div style="font-size:0.82rem;padding:6px 0;border-bottom:1px solid var(--border);">
        <strong>${esc(e.nome || e.tipo)}</strong>
        <span style="color:var(--muted);"> · ${esc(e.fonte || '')} · ${esc(e.time || '')}</span>
        ${e.desc ? `<div style="color:var(--muted);">${esc(e.desc)}</div>` : ''}
      </div>`
    ).join('');
  }
  el.innerHTML = html;
}

function clearFalhasAntigas() {
  if (!confirm('Limpar histórico de consequências (mantém rivais)?')) return;
  const st = getFalhasState();
  st.lista = [];
  setFalhasState(st);
  renderFalhasPanel();
}

/* ---- Agenda do Dia ---- */
function getAgenda() {
  try {
    const a = storeGetJSON(KEYS.agenda, []);
    return Array.isArray(a) ? a : [];
  } catch (e) { return []; }
}
function setAgenda(list) {
  try { storeSet(KEYS.agenda, Array.isArray(list) ? list : []); } catch (e) {}
}

function renderAgendaList() {
  const el = document.getElementById('agendaList');
  if (!el) return;
  const items = getAgenda();
  if (!items.length) {
    el.innerHTML = '<p style="color:var(--muted);font-size:0.85rem;text-align:center;">Nenhum objetivo. Adicione ou use “Sugerir”.</p>';
    return;
  }
  el.innerHTML = items.map((it, i) => `
    <div style="display:flex;align-items:center;gap:8px;background:var(--bg-input);border:1px solid var(--border);border-radius:8px;padding:8px 10px;margin-bottom:6px;">
      <input type="checkbox" ${it.done ? 'checked' : ''} onchange="toggleAgendaItem(${i})" style="width:auto;margin:0;">
      <span style="flex:1;${it.done ? 'text-decoration:line-through;color:var(--muted);' : ''}">${esc(it.text)}</span>
      <button class="btn btn-sm btn-outline" style="width:auto;padding:2px 8px;" onclick="removeAgendaItem(${i})">×</button>
    </div>
  `).join('');
}

function addAgendaItem(text) {
  const input = document.getElementById('agendaInput');
  const t = (text || (input && input.value) || '').trim();
  if (!t) { alert('Escreva um objetivo.'); return; }
  const list = getAgenda();
  if (list.length >= 6) { alert('Máximo de 6 itens na agenda.'); return; }
  list.push({ text: t, done: false, rewarded: false, id: 'ag_' + Date.now().toString(36) });
  setAgenda(list);
  if (input) input.value = '';
  renderAgendaList();
}

function toggleAgendaItem(i) {
  const list = getAgenda();
  if (!list[i]) return;
  list[i].done = !list[i].done;
  if (list[i].done && !list[i].rewarded) {
    list[i].rewarded = true;
    try {
      if (typeof accumulatedXp === 'number') {
        accumulatedXp += 1;
        if (typeof updateSessionDisplays === 'function') updateSessionDisplays();
      }
    } catch (e) {}
  }
  setAgenda(list);
  renderAgendaList();
}

function removeAgendaItem(i) {
  const list = getAgenda();
  list.splice(i, 1);
  setAgenda(list);
  renderAgendaList();
}

function clearAgendaDia() {
  if (!confirm('Limpar toda a agenda do dia?')) return;
  setAgenda([]);
  renderAgendaList();
}

function sugerirAgendaDoDia() {
  const sugestoes = [
    'Resolver 1 missão de NPC',
    'Descanso curto ou longo',
    'Visitar o mercado / templo',
    'Explorar 1 bioma ou masmorra curta',
    'Consultar o oráculo sobre um mistério',
    'Avançar ou criar 1 relógio de ameaça',
    'Conversar com um NPC de afeto ≥40',
    'Registrar o dia no diário de campanha'
  ];
  const list = getAgenda();
  const pool = sugestoes.filter(s => !list.some(x => x.text === s));
  const pickN = Math.min(3, pool.length);
  for (let i = 0; i < pickN; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    list.push({ text: pool.splice(idx, 1)[0], done: false, rewarded: false, id: 'ag_' + Date.now().toString(36) + i });
  }
  setAgenda(list);
  renderAgendaList();
}

/**
 * Modo “Uma Cena Só” (~5 min no celular).
 * Lugar + NPC + desejo + obstáculo + reviravolta — e para.
 * Não mexe em agenda, combate, inventário ou relógios.
 */
const UMA_CENA_LUGARES = [
  'uma taverna barulhenta na hora do almoço',
  'um beco úmido atrás do mercado',
  'as escadarias de um templo ao entardecer',
  'uma ponte estreita sob chuva fina',
  'o pátio de uma estalagem à noite',
  'ruínas à beira da estrada',
  'um acampamento de caravana',
  'a sala de audiências de um nobre menor',
  'um cais com cheiro de peixe e alcatrão',
  'uma clareira na floresta com luz filtrada',
  'os esgotos sob a cidade, com tochas',
  'uma tenda de curandeira na feira'
];
const UMA_CENA_PAPEIS = [
  'comerciante aflita', 'guarda cansada', 'noviça do templo', 'ladra de bolsa',
  'mensageira ferida', 'viúva insistente', 'caçadora de recompensas', 'aprendiz de maga',
  'taberneira desconfiada', 'criança de rua esperta', 'espiã disfarçada', 'peregrina doente',
  'artesã endividada', 'capitã de caravana', 'rival antiga', 'informante nervosa'
];
const UMA_CENA_DESEJOS = [
  'quer que você entregue um pacote sem abrir',
  'precisa de escolta até o próximo vilarejo',
  'busca informações sobre alguém desaparecido',
  'oferece ouro por um favor ilegal',
  'pede proteção contra uma ameaça que não nomeia',
  'quer que você testemunhe um juramento',
  'precisa recuperar um objeto roubado esta noite',
  'implora que você minta por ela perante a guarda',
  'deseja uma introdução a uma facção poderosa',
  'quer vingança discreta, não sangue em público',
  'busca um lugar seguro para dormir só esta noite',
  'precisa que alguém leia um mapa antigo em voz alta'
];
const UMA_CENA_OBSTACULOS = [
  'alguém está ouvindo a conversa',
  'ela mente sobre um detalhe importante',
  'há um prazo curto (antes do amanhecer)',
  'um rival ou guarda aparece no meio do diálogo',
  'o preço moral é alto (trair alguém inocente)',
  'faltar recurso (ouro, item ou tempo)',
  'o local se torna hostil (briga, incêndio, magia)',
  'uma terceira pessoa reivindica o mesmo favor',
  'ela muda de ideia no último instante',
  'o objeto/pessoa-alvo não está onde ela disse'
];
const UMA_CENA_REVIRAVOLTAS = [
  'A NPC é alguém que você já ajudou — e deve um favor.',
  'O pedido é isca: o verdadeiro alvo é o grupo.',
  'Um aliado secreto intervém a favor dela.',
  'O “vilão” da história dela está certo em parte.',
  'Surge um rumor que liga o pedido a uma facção.',
  'Ela revela ser parente ou conhecida de um rival.',
  'O obstáculo era um teste de lealdade.',
  'Completar o desejo avança um relógio de ameaça (se houver).',
  'Falhar aqui gera um rumor na cidade.',
  'Uma testemunha anota tudo e some na multidão.'
];

function gerarUmaCenaSo() {
  try {
    // Lugar: bioma atual se houver, senão tabela
    let lugar = '';
    let biomeLabel = '';
    try {
      const sel = document.getElementById('biomeSelect');
      if (sel && sel.options[sel.selectedIndex]) {
        biomeLabel = sel.options[sel.selectedIndex].text || '';
      }
    } catch (e) {}
    lugar = biomeLabel
      ? (biomeLabel + ' — ' + pick(UMA_CENA_LUGARES))
      : pick(UMA_CENA_LUGARES);

    // NPC: tenta planilha/rivais ou nome feminino genérico
    let npcNome = '';
    let npcPapel = pick(UMA_CENA_PAPEIS);
    try {
      if (typeof sortearRivalPlanilha === 'function' && Math.random() < 0.35) {
        const f = sortearRivalPlanilha();
        npcNome = f.nome;
        if (f.classe) npcPapel = f.classe.toLowerCase() + (f.motivacao ? ' — ' + f.motivacao : '');
      } else if (typeof NOMES_F !== 'undefined' && NOMES_F.length) {
        npcNome = NOMES_F[Math.floor(Math.random() * NOMES_F.length)];
      } else {
        npcNome = pick(['Mira', 'Selene', 'Branna', 'Ilya', 'Vesper', 'Kaela', 'Ryn', 'Talia']);
      }
    } catch (e) {
      npcNome = pick(['Mira', 'Selene', 'Branna', 'Ilya']);
    }

    const desejo = pick(UMA_CENA_DESEJOS);
    const obstaculo = pick(UMA_CENA_OBSTACULOS);
    const twist = pick(UMA_CENA_REVIRAVOLTAS);

    const bloco =
      '📍 LUGAR: ' + lugar + '\n' +
      '👤 NPC: ' + npcNome + ' (' + npcPapel + ')\n' +
      '💭 DESEJO: ' + npcNome + ' ' + desejo + '\n' +
      '🚧 OBSTÁCULO: ' + obstaculo + '\n' +
      '⚡ REVIRAVOLTA: ' + twist;

    const htmlBloco = `
      <div style="font-size:0.95rem;line-height:1.55;">
        <div style="font-weight:800;color:#f59e0b;margin-bottom:10px;">⚡ Uma Cena Só — jogue e pare</div>
        <div><strong style="color:#38bdf8;">📍 Lugar</strong><br>${esc(lugar)}</div>
        <div style="margin-top:10px;"><strong style="color:#ec4899;">👤 NPC</strong><br>${esc(npcNome)} <span style="color:var(--muted);">(${esc(npcPapel)})</span></div>
        <div style="margin-top:10px;"><strong style="color:#a855f7;">💭 Desejo</strong><br>${esc(npcNome)} ${esc(desejo)}</div>
        <div style="margin-top:10px;"><strong style="color:#f97316;">🚧 Obstáculo</strong><br>${esc(obstaculo)}</div>
        <div style="margin-top:10px;padding:10px;border-radius:8px;background:rgba(244,63,94,0.12);border:1px solid rgba(244,63,94,0.35);">
          <strong style="color:#f43f5e;">⚡ Reviravolta</strong><br>${esc(twist)}
        </div>
        <div style="margin-top:12px;font-size:0.8rem;color:var(--muted);">
          Sugestão: resolva com 1 teste social, 1 combate curto ou decisão narrativa — e encerre a cena.
        </div>
      </div>`;

    const body = document.getElementById('sceneResultBody');
    if (body) {
      body.innerHTML = htmlBloco;
      const wrap = document.getElementById('sceneResult');
      if (wrap) wrap.style.display = 'block';
    }
    const enc = document.getElementById('umaCenaSoEncounters');
    if (enc) enc.innerHTML = htmlBloco;

    _lastOraclePayload = {
      kind: 'uma_cena',
      title: '⚡ Uma Cena Só',
      text: bloco,
      detail: npcNome + ' · ' + lugar
    };
    try { if (typeof pushOracleHistory === 'function') pushOracleHistory(_lastOraclePayload); } catch (e) {}
    try {
      if (typeof appendToCampaignLog === 'function') {
        appendToCampaignLog({
          type: 'uma_cena',
          title: '⚡ Uma Cena Só: ' + npcNome,
          text: bloco,
          time: new Date().toLocaleString('pt-BR')
        });
      }
    } catch (e) {}
  } catch (e) {
    console.warn('gerarUmaCenaSo', e);
    alert('Não foi possível gerar a cena. Tente de novo.');
  }
}

/**
 * Pacote solo: cena + complicação + item de agenda + dica de relógio.
 * Não altera combate nem inventário — só narrativa e UI.
 */
function gerarPacoteSoloCompleto() {
  try {
    // Cena
    const action = pick(ORACLE_ACTIONS);
    const theme = pick(ORACLE_THEMES);
    const subject = pick(ORACLE_SUBJECTS);
    const focus = pick(ORACLE_FOCUS);
    let biomeKey = '';
    let biomeLabel = '';
    try {
      const sel = document.getElementById('biomeSelect');
      biomeKey = sel && sel.value || '';
      biomeLabel = sel && sel.options[sel.selectedIndex] ? sel.options[sel.selectedIndex].text : biomeKey;
    } catch (e) {}
    const prompt = `${action} ${subject}${biomeLabel ? ' (' + biomeLabel + ')' : ''}, tema “${theme}”. Foco: ${focus}.`;

    // Complicação
    let complic = '';
    try {
      if (biomeKey && ORACLE_COMPLICATIONS_BY_BIOME[biomeKey]) {
        complic = pick(ORACLE_COMPLICATIONS_BY_BIOME[biomeKey]);
      }
    } catch (e) {}
    if (!complic) complic = pick(ORACLE_COMPLICATIONS_GENERAL);

    // Agenda
    const agendaText = `Cena: ${action} — ${subject}`.slice(0, 80);
    try {
      const list = getAgenda();
      if (list.length < 6) {
        list.push({ text: agendaText, done: false, rewarded: false, id: 'ag_' + Date.now().toString(36) });
        setAgenda(list);
        renderAgendaList();
      }
    } catch (e) {}

    // Dica de relógio
    const clockHint = pick([
      'Se falhar nesta cena, avance +1 em um relógio de ameaça.',
      'Sucesso pode atrasar um relógio (−1) se fizer sentido narrativo.',
      'A complicação pode estar ligada a um preset de relógio (Igreja, Submundo…).'
    ]);

    const body = document.getElementById('sceneResultBody');
    if (body) {
      body.innerHTML = `
        <div style="font-size:0.95rem; line-height:1.5;">
          <div><strong style="color:var(--magic);">🎬 Cena:</strong> ${esc(prompt)}</div>
          <div style="margin-top:10px;"><strong style="color:var(--accent2);">⚡ Complicação:</strong> ${esc(complic)}</div>
          <div style="margin-top:10px;"><strong style="color:#22d3ee;">📋 Agenda:</strong> item adicionado — “${esc(agendaText)}”</div>
          <div style="margin-top:10px;font-size:0.85rem;color:var(--muted);">⏳ ${esc(clockHint)}</div>
        </div>
      `;
      const wrap = document.getElementById('sceneResult');
      if (wrap) wrap.style.display = 'block';
    }

    _lastOraclePayload = {
      kind: 'pacote_solo',
      title: 'Pacote Solo Completo',
      text: prompt + '\nComplicação: ' + complic,
      detail: clockHint
    };
    try { pushOracleHistory(_lastOraclePayload); } catch (e) {}
    try {
      if (typeof appendToCampaignLog === 'function') {
        appendToCampaignLog({
          type: 'pacote_solo',
          title: '🎬 Pacote Solo',
          text: prompt + '\n⚡ ' + complic,
          time: new Date().toLocaleString('pt-BR')
        });
      }
    } catch (e) {}
  } catch (e) {
    console.warn('gerarPacoteSoloCompleto', e);
    alert('Não foi possível gerar o pacote. Tente de novo.');
  }
}





