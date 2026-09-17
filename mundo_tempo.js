/* ===== [TEMPO] linhas originais 352-427 ===== */
/* ==================== TEMPO, DIAS E VIAGEM ==================== */
const PERIODS = ['Manhã', 'Tarde', 'Noite', 'Madrugada'];
const TIME_STORAGE_KEY = KEYS.time;

/** Rotas: dias de viagem entre locais (1 grid ≈ 1 dia). Simétrico. */
const TRAVEL_DAYS = {
  taverna:  { cidade:2, esgotos:2, ruinas:5, masmorra:3, minas:4, floresta:3, ilhas:6, deserto:4, montanha:4 },
  cidade:   { taverna:2, esgotos:1, ruinas:3, masmorra:3, minas:3, floresta:2, ilhas:5, deserto:5, montanha:3 },
  esgotos:  { taverna:2, cidade:1, ruinas:3, masmorra:2, minas:3, floresta:2, ilhas:5, deserto:5, montanha:4 },
  ruinas:   { taverna:5, cidade:3, esgotos:3, masmorra:5, minas:4, floresta:3, ilhas:4, deserto:6, montanha:5 },
  masmorra: { taverna:3, cidade:3, esgotos:2, ruinas:5, minas:2, floresta:4, ilhas:6, deserto:3, montanha:3 },
  minas:    { taverna:4, cidade:3, esgotos:3, ruinas:4, masmorra:2, floresta:4, ilhas:6, deserto:5, montanha:2 },
  floresta: { taverna:3, cidade:2, esgotos:2, ruinas:3, masmorra:4, minas:4, ilhas:3, deserto:5, montanha:5 },
  ilhas:    { taverna:6, cidade:5, esgotos:5, ruinas:4, masmorra:6, minas:6, floresta:3, deserto:7, montanha:7 },
  deserto:  { taverna:4, cidade:5, esgotos:5, ruinas:6, masmorra:3, minas:5, floresta:5, ilhas:7, montanha:6 },
  montanha: { taverna:4, cidade:3, esgotos:4, ruinas:5, masmorra:3, minas:2, floresta:5, ilhas:7, deserto:6 }
};

let timeState = {
  day: 1,
  periodIndex: 0, // 0=Manhã
  location: 'taverna',
  traveling: false,
  travelDest: null,
  travelDaysLeft: 0,
  travelTotal: 0
};

function loadTimeState() {
  try {
    const raw = storeGet(TIME_STORAGE_KEY, null);
    if (raw) {
      const s = JSON.parse(raw);
      timeState = { ...timeState, ...s };
    }
  } catch (e) {}
  syncLocationUI();
  updateTimeUI();
}

function saveTimeState() {
  try { storeSet(TIME_STORAGE_KEY, timeState); } catch (e) {}
}

function getLocationLabel(key) {
  const sel = document.getElementById('biomeSelect');
  if (sel) {
    const opt = [...sel.options].find(o => o.value === key);
    if (opt) return opt.textContent;
  }
  return (MAP_LOCATIONS[key] && MAP_LOCATIONS[key].label) || key;
}

function updateTimeUI() {
  const dayEl = document.getElementById('dayDisplay');
  const perEl = document.getElementById('periodDisplay');
  const locEl = document.getElementById('locationDisplay');
  if (dayEl) dayEl.textContent = 'Dia ' + timeState.day;
  if (perEl) perEl.textContent = PERIODS[timeState.periodIndex] || 'Manhã';
  if (locEl) locEl.textContent = getLocationLabel(timeState.location);
  const panel = document.getElementById('travelPanel');
  if (panel) {
    if (timeState.traveling) {
      panel.classList.remove('hidden');
      const st = document.getElementById('travelStatusText');
      if (st) {
        st.innerHTML = `Destino: <strong>${getLocationLabel(timeState.travelDest)}</strong> · Dias restantes: <strong style="color:var(--accent)">${timeState.travelDaysLeft}</strong> / ${timeState.travelTotal}<br>
          <span style="font-size:0.85rem;color:var(--muted)">Escolha uma ação para este dia de viagem (obrigatório).</span>`;
      }
    } else {
      panel.classList.add('hidden');
    }
  }
}


/* ===== [FOME] linhas originais 428-620 ===== */
/* ==================== FOME & MANTIMENTOS ==================== */
const STATUS_LIST = ['normal','abençoado','faminto','paralisado','envenenado','dormindo','morto','prisioneiro','escravo'];
const STATUS_LABELS = {
  normal: 'Normal', abençoado: 'Abençoado', faminto: 'Faminto',
  paralisado: 'Paralisado', envenenado: 'Envenenado', dormindo: 'Dormindo', morto: 'Morto',
  prisioneiro: 'Prisioneiro', escravo: 'Escravo(a)'
};

/** Processa 1 dia de fome para um personagem. Retorna mensagem resumida. */
function processHungerForChar(c) {
  if (!c || c.status === 'morto') return null;
  c = normalizeCharacter(c);
  let msg = null;
  if (c.mantimentos > 0) {
    c.mantimentos -= 1;
    // se estava faminto e agora tem comida consumida, volta a normal (exceto outros status graves)
    if (c.status === 'faminto') c.status = 'normal';
    msg = `${c.nome}: consumiu 1 mantimento (restam ${c.mantimentos}).`;
  } else {
    // sem comida → faminto + perde 1 PV
    if (c.status !== 'paralisado' && c.status !== 'envenenado' && c.status !== 'dormindo' && c.status !== 'morto') {
      c.status = 'faminto';
    }
    c.pvAtual = Math.max(0, (c.pvAtual != null ? c.pvAtual : c.pvMax) - 1);
    msg = `${c.nome}: ⚠ SEM MANTIMENTOS — Status: Faminto, -1 PV (PV ${c.pvAtual}/${c.pvMax}).`;
    if (c.pvAtual <= 0) {
      c.status = 'morto';
      c.pvAtual = 0;
      msg = `${c.nome}: 💀 MORREU de fome! (aguardando ressurreição)`;
    }
  }
  return { char: c, msg };
}

/** Processa fome do grupo selecionado (ou todos se nenhum). */
function processPartyHunger() {
  const party = typeof getSelectedPartyChars === 'function' ? getSelectedPartyChars() : [];
  let list = getSaved();
  const targets = party.length ? party : list.filter(c => c.status !== 'morto');
  if (!targets.length) return [];
  const logs = [];
  targets.forEach(t => {
    const idx = list.findIndex(x => x.id === t.id);
    if (idx < 0) return;
    const result = processHungerForChar(list[idx]);
    if (result) {
      list[idx] = result.char;
      logs.push(result.msg);
    }
  });
  setSaved(list);
  return logs;
}

/** Adiciona mantimentos a um personagem */
function addMantimentos(charId, qtd) {
  let list = getSaved();
  const idx = list.findIndex(c => c.id === charId);
  if (idx < 0) return false;
  const c = normalizeCharacter(list[idx]);
  c.mantimentos = Math.max(0, (c.mantimentos || 0) + qtd);
  if (c.status === 'faminto' && c.mantimentos > 0) c.status = 'normal';
  list[idx] = c;
  setSaved(list);
  return true;
}

/** Define status manualmente (ex.: cura, veneno, ressurreição) */
function setCharacterStatus(charId, newStatus) {
  if (!STATUS_LIST.includes(newStatus)) return false;
  let list = getSaved();
  const idx = list.findIndex(c => c.id === charId);
  if (idx < 0) return false;
  const c = normalizeCharacter(list[idx]);
  const wasDead = c.status === 'morto';
  c.status = newStatus;
  if (newStatus === 'morto') {
    c.pvAtual = 0;
    applyDeathConsequences(c, 'manual');
  }
  if (newStatus === 'normal' && c.pvAtual <= 0) {
    c.pvAtual = Math.max(1, Math.floor((c.pvMax || 1) / 2));
  }
  // Ressurreição simples (sem ritual do templo)
  if (wasDead && newStatus === 'normal') {
    applyResurrectionAftermath(c, false);
  }
  list[idx] = c;
  setSaved(list);
  return true;
}

function resurrectCharacter(charId) {
  return setCharacterStatus(charId, 'normal');
}

const DEATH_INJURIES = [
  { id: 'cicatriz', nome: 'Cicatriz permanente', desc: 'Marca visível da morte. −1 em testes sociais com desconhecidos (opcional narrativo).' },
  { id: 'fraqueza', nome: 'Corpo enfraquecido', desc: '−1 PV máximo permanente (mínimo 1).' },
  { id: 'tremor', nome: 'Mão trêmula', desc: 'No 1º ataque de cada combate, −1 FA (medo residual).' },
  { id: 'visoes', nome: 'Visões da morte', desc: 'Às vezes sonha com o além. +1 em testes contra medo/intimidação (narrativo).' },
  { id: 'divida_igreja', nome: 'Dívida com a Igreja', desc: 'A ressurreição gerou débito espiritual. Reputação Igreja −10 (se ritual sagrado).' }
];

function applyDeathConsequences(c, reason) {
  c.deathCount = (c.deathCount || 0) + 1;
  c.injuries = Array.isArray(c.injuries) ? c.injuries : [];
  // Última vontade (só na primeira morte ou se ainda não tiver)
  if (!c.lastWill) {
    const wills = [
      'Entreguem meu equipamento ao herdeiro.',
      'Queimem o diário — ninguém deve ler.',
      'Digam à minha família que morri com honra.',
      'Doem o ouro ao templo.',
      'Vinguem-me contra quem me matou.',
      'Enterrem-me sob a árvore antiga.'
    ];
    c.lastWill = wills[Math.floor(Math.random() * wills.length)];
  }
  // 60% chance de cicatriz/ferimento permanente
  if (Math.random() < 0.6) {
    const pool = DEATH_INJURIES.filter(i => i.id !== 'divida_igreja' && !c.injuries.some(x => x.id === i.id));
    if (pool.length) {
      const inj = pool[Math.floor(Math.random() * pool.length)];
      c.injuries.push({ ...inj, at: Date.now(), reason: reason || 'morte' });
      if (inj.id === 'fraqueza') {
        const res = typeof getCharResources === 'function' ? getCharResources(c) : null;
        const basePv = (res && res.pv) || c.pvMax || 10;
        c.pvMaxPenalty = (c.pvMaxPenalty || 0) + 1;
        c.pvMax = Math.max(1, basePv - c.pvMaxPenalty);
        if (c.pvAtual > c.pvMax) c.pvAtual = c.pvMax;
      }
    }
  }
  try {
    if (typeof appendToCampaignLog === 'function') {
      appendToCampaignLog({
        type: 'morte',
        title: `💀 ${c.nome} caiu`,
        text: `Morte #${c.deathCount}. Última vontade: «${c.lastWill}». Ferimentos: ${(c.injuries || []).map(i => i.nome).join(', ') || 'nenhum ainda'}.`,
        time: new Date().toLocaleString('pt-BR')
      });
    }
  } catch (e) {}
}

function applyResurrectionAftermath(c, fromTemple) {
  c.injuries = Array.isArray(c.injuries) ? c.injuries : [];
  if (fromTemple) {
    // Dívida com a Igreja
    if (!c.injuries.some(i => i.id === 'divida_igreja')) {
      const inj = DEATH_INJURIES.find(i => i.id === 'divida_igreja');
      c.injuries.push({ ...inj, at: Date.now(), reason: 'ressurreição' });
    }
    try {
      if (typeof changeReputation === 'function') changeReputation('igreja', -10, `Ressurreição de ${c.nome}`, true);
    } catch (e) {}
    // Sempre deixa cicatriz se ainda não tiver
    if (!c.injuries.some(i => i.id === 'cicatriz')) {
      const cic = DEATH_INJURIES.find(i => i.id === 'cicatriz');
      c.injuries.push({ ...cic, at: Date.now(), reason: 'ressurreição' });
    }
  }
  c.status = 'normal';
  if ((c.pvAtual || 0) <= 0) {
    c.pvAtual = Math.max(1, Math.floor((c.pvMax || 1) / 2));
  }
}

/** Ressurreição pelo templo (serviço completo) */
function templeResurrect(charId) {
  let list = getSaved();
  const idx = list.findIndex(c => c.id === charId);
  if (idx < 0) return;
  const c = normalizeCharacter(list[idx]);
  if (c.status !== 'morto' && (c.pvAtual || 0) > 0) {
    alert('Este personagem não está morto.');
    return;
  }
  const cost = 150;
  if ((c.ouro || 0) < cost) {
    alert(`Ressurreição custa ${cost} Tibar (tem ${c.ouro || 0}).`);
    return;
  }
  if (!confirm(`⛪ Ressurreição de ${c.nome}\nCusto: ${cost} Tibar\nConsequências: cicatriz + dívida com a Igreja (−10 reputação).\n\nConfirmar?`)) return;
  c.ouro -= cost;
  applyResurrectionAftermath(c, true);
  list[idx] = c;
  setSaved(list);
  alert(`✨ ${c.nome} voltou dos mortos.\nPV: ${c.pvAtual}/${c.pvMax}\nFerimentos: ${(c.injuries || []).map(i => i.nome).join(', ')}`);
  try { openView(charId); } catch (e) {}
}

/* ===== [DESCANSO] linhas originais 1224-1428 ===== */
/* ---------- Descanso Curto / Longo ---------- */
function doShortRest() {
  const chars = (typeof getSelectedPartyChars === 'function') ? getSelectedPartyChars() : [];
  if (!chars.length) {
    alert('Selecione pelo menos um herói no grupo para descansar.');
    return;
  }
  if (!confirm('😴 Descanso Curto\n\n· Consome 1 período\n· Cada herói gasta 1 mantimento (se tiver)\n· Recupera 1d6 + R PV (máx. metade dos PV perdidos) e 1d6 PM\n\nConfirmar?')) return;

  let list = getSaved();
  const lines = [];
  chars.forEach(ch => {
    const idx = list.findIndex(c => c.id === ch.id);
    if (idx < 0) return;
    const c = normalizeCharacter(list[idx]);
    if (c.status === 'morto') {
      lines.push(`${c.nome}: morto — não descansa.`);
      return;
    }
    // Mantimento
    let foodNote = '';
    if ((c.mantimentos || 0) > 0) {
      c.mantimentos -= 1;
      foodNote = ' (−1 mantimento)';
      if (c.status === 'faminto') c.status = 'normal';
    } else {
      foodNote = ' (sem mantimentos — descanso ruim)';
    }

    const res = typeof getCharResources === 'function' ? getCharResources(c) : { pv: c.pvMax || 10, pm: c.pmMax || 5 };
    c.pvMax = c.pvMax || res.pv;
    c.pmMax = c.pmMax || res.pm;
    if (typeof c.pvAtual !== 'number') c.pvAtual = c.pvMax;
    if (typeof c.pmAtual !== 'number') c.pmAtual = c.pmMax;

    const lost = Math.max(0, c.pvMax - c.pvAtual);
    const maxHeal = Math.max(1, Math.ceil(lost / 2) || 1);
    const healRoll = 1 + Math.floor(Math.random() * 6);
    const heal = Math.min(maxHeal, healRoll + (c.R || 0));
    const manaRoll = 1 + Math.floor(Math.random() * 6);
    const poor = (c.mantimentos || 0) <= 0 && foodNote.includes('sem');
    const actualHeal = poor ? Math.max(1, Math.floor(heal / 2)) : heal;
    const actualMana = poor ? Math.max(1, Math.floor(manaRoll / 2)) : manaRoll;

    const pvBefore = c.pvAtual;
    const pmBefore = c.pmAtual;
    c.pvAtual = Math.min(c.pvMax, c.pvAtual + actualHeal);
    c.pmAtual = Math.min(c.pmMax, c.pmAtual + actualMana);
    list[idx] = c;
    lines.push(`${c.nome}: +${c.pvAtual - pvBefore} PV (${pvBefore}→${c.pvAtual}/${c.pvMax}), +${c.pmAtual - pmBefore} PM (${pmBefore}→${c.pmAtual}/${c.pmMax})${foodNote}`);
  });
  setSaved(list);

  if (!timeState.traveling) {
    advancePeriod(false);
  }
  alert('😴 Descanso Curto concluído\n\n' + lines.join('\n'));
}

function doLongRest() {
  const chars = (typeof getSelectedPartyChars === 'function') ? getSelectedPartyChars() : [];
  if (!chars.length) {
    alert('Selecione pelo menos um herói no grupo para o descanso longo.');
    return;
  }
  if (!confirm('🌙 Descanso Longo\n\n· Avança até a próxima Manhã (consome o resto do dia)\n· Cada herói gasta 1 mantimento\n· Recupera PV e PM quase por completo\n· 25% de chance de encontro noturno\n\nConfirmar?')) return;

  let list = getSaved();
  const lines = [];
  chars.forEach(ch => {
    const idx = list.findIndex(c => c.id === ch.id);
    if (idx < 0) return;
    const c = normalizeCharacter(list[idx]);
    if (c.status === 'morto') {
      lines.push(`${c.nome}: morto — não descansa (precisa de ressurreição).`);
      return;
    }
    let foodNote = '';
    if ((c.mantimentos || 0) > 0) {
      c.mantimentos -= 1;
      foodNote = ' (−1 mantimento)';
      if (c.status === 'faminto') c.status = 'normal';
    } else {
      // Sem comida: recupera só metade e pode ficar faminto
      foodNote = ' (sem mantimentos — recuperação reduzida)';
      if (c.status === 'normal') c.status = 'faminto';
    }

    const res = typeof getCharResources === 'function' ? getCharResources(c) : { pv: c.pvMax || 10, pm: c.pmMax || 5 };
    c.pvMax = c.pvMax || res.pv;
    c.pmMax = c.pmMax || res.pm;
    const full = !foodNote.includes('sem');
    if (full) {
      c.pvAtual = c.pvMax;
      c.pmAtual = c.pmMax;
      if (c.status === 'dormindo') c.status = 'normal';
      lines.push(`${c.nome}: recuperou PV/PM completos (${c.pvMax}/${c.pmMax})${foodNote}`);
    } else {
      c.pvAtual = Math.min(c.pvMax, Math.max(c.pvAtual || 0, Math.ceil(c.pvMax * 0.5)));
      c.pmAtual = Math.min(c.pmMax, Math.max(c.pmAtual || 0, Math.ceil(c.pmMax * 0.5)));
      lines.push(`${c.nome}: recuperou ~50% PV/PM (${c.pvAtual}/${c.pvMax} · ${c.pmAtual}/${c.pmMax})${foodNote}`);
    }
    // Vampiro: regeneração extra se Sede baixa; sol da manhã após descanso dói se não alimentado
    if (typeof isVampireChar === 'function' && isVampireChar(c)) {
      c.vampiro = c.vampiro || { sede: 0 };
      const sede = c.vampiro.sede || 0;
      if (sede === 0 && (c.vantagens || []).includes('Regeneração Vampírica')) {
        c.pvAtual = c.pvMax;
        c.pmAtual = Math.min(c.pmMax, (c.pmAtual || 0) + 2);
        lines.push(`${c.nome}: 🩸 Regeneração Vampírica (bem alimentado)`);
      } else if (sede >= 3) {
        c.pvAtual = Math.max(1, Math.floor((c.pvAtual || 1) * 0.75));
        lines.push(`${c.nome}: 🩸 Sede ${sede}/5 — descanso ruim (PV reduzido)`);
      }
    }
    list[idx] = c;
  });
  setSaved(list);

  // Avança para a próxima manhã — processa cada etapa pulada (Humor / convívio)
  // Ex.: se está na Tarde (1), faltam Noite+Madrugada+Manhã = 3 etapas até o próximo amanhecer
  const etapasPuladas = Math.max(1, (PERIODS.length - (timeState.periodIndex || 0)));
  let humorLines = [];
  for (let e = 0; e < etapasPuladas; e++) {
    try {
      const avisos = processarEtapaAparencia();
      if (avisos && avisos.length) humorLines = humorLines.concat(avisos);
    } catch (err) {}
  }

  const wasTraveling = timeState.traveling;
  timeState.periodIndex = 0;
  timeState.day++;
  try { if (typeof verificarMarcosCampanha === 'function') verificarMarcosCampanha('dia'); } catch (e) {}
  try { processarSedeVampiricaNoDia(); } catch (e) {}
  const hungerLogs = processPartyHunger();
  saveTimeState();
  updateTimeUI();

  let nightMsg = '';
  const nightEncounter = Math.random() < 0.25;
  if (nightEncounter) {
    nightMsg = '\n\n⚠️ Durante a noite algo se aproxima... (encontro noturno!)';
  }

  // Tentativas de fuga dos capturados a cada noite / descanso longo
  let fugaLines = [];
  try {
    if (typeof processarFugasNoturnas === 'function') {
      const caps = typeof getCapturados === 'function' ? getCapturados().filter(c => c.status === 'capturado') : [];
      if (caps.length) {
        const listCap = getCapturados();
        const remaining = [];
        listCap.forEach(cap => {
          if (cap.status !== 'capturado') { remaining.push(cap); return; }
          const result = resolverTentativaFuga(cap, true);
          if (result.fugiu) {
            fugaLines.push('⚠️ ' + cap.nome + ' fugiu durante a noite!');
            if (typeof pushServoLog === 'function') pushServoLog(result.msg);
          } else {
            remaining.push(result.cap);
            fugaLines.push('🫱 ' + cap.nome + ': fuga contida.');
            if (typeof pushServoLog === 'function') pushServoLog(result.msg);
          }
        });
        setCapturados(remaining);
        try { renderCapturadosList(); } catch (e) {}
      }
    }
  } catch (e) { console.warn(e); }

  let cativeiroLines = [];
  try { cativeiroLines = processarCativeirosNoDia(); } catch (e) {}

  alert('🌙 Descanso Longo — Dia ' + timeState.day + ' amanhece\n\n' + lines.join('\n') +
    (hungerLogs.length ? '\n\nFome:\n' + hungerLogs.join('\n') : '') +
    (fugaLines.length ? '\n\nCapturados:\n' + fugaLines.join('\n') : '') +
    (cativeiroLines.length ? '\n\nCativeiro (PJs):\n' + cativeiroLines.join('\n') : '') +
    (humorLines.length ? '\n\nHumor:\n' + humorLines.join('\n') : '') +
    nightMsg);

  if (nightEncounter) {
    // Gera encontro no bioma atual
    try {
      if (typeof generateProceduralEvent === 'function') {
        setTimeout(() => {
          alert('🎲 Encontro noturno gerado na mesa!');
          generateProceduralEvent();
        }, 400);
      }
    } catch (e) {}
  }

  // Se estava viajando, o descanso longo também conta como um dia de viagem
  if (wasTraveling && timeState.travelDaysLeft > 0) {
    timeState.travelDaysLeft--;
    if (timeState.travelDaysLeft <= 0) {
      arriveAtDestination();
    } else {
      saveTimeState();
      updateTimeUI();
    }
  }
}

/* ===== [MAPA_MUNDO] linhas originais 1429-1521 ===== */
/* ==================== MAPA DO MUNDO ==================== */
/** Posições aproximadas no mapa (porcentagem left/top do marcador) */
const MAP_LOCATIONS = {
  taverna:  { label: '1. Taverna & Estalagem',     left: 32, top: 48 },
  cidade:   { label: 'Cidade / Feira Urbana',      left: 52, top: 42 },
  esgotos:  { label: 'Esgotos & Subterrâneos',     left: 50, top: 58 },
  ruinas:   { label: '4. Ruínas Antigas',          left: 72, top: 28 },
  masmorra: { label: '5. Masmorra & Calabouço',    left: 28, top: 22 },
  minas:    { label: '6. Minas Abandonadas',       left: 38, top: 12 },
  floresta: { label: 'Floresta Mística',           left: 52, top: 78 },
  ilhas:    { label: 'Ilhas & Zona Costeira',      left: 82, top: 82 },
  deserto:  { label: 'Deserto de Éter',            left: 12, top: 78 },
  montanha: { label: '10. Montanhas & Picos',      left: 10, top: 35 }
};

function openWorldMap() {
  const overlay = document.getElementById('mapOverlay');
  if (!overlay) return;
  const key = timeState.location || 'taverna';
  renderMapLegend(key);
  setMapMarker(key, true); // true = só visual, sem viajar
  overlay.classList.remove('hidden');
}

function closeWorldMap() {
  document.getElementById('mapOverlay')?.classList.add('hidden');
}

function setMapMarker(biomeKey, visualOnly) {
  const loc = MAP_LOCATIONS[biomeKey] || MAP_LOCATIONS.taverna;
  const marker = document.getElementById('mapMarker');
  const label = document.getElementById('mapMarkerLabel');
  const current = document.getElementById('mapCurrentLabel');
  if (!marker) return;
  marker.style.left = loc.left + '%';
  marker.style.top = loc.top + '%';
  marker.classList.remove('hidden');
  if (label) label.textContent = loc.label;
  if (current) current.textContent = getLocationLabel(timeState.location);
  document.querySelectorAll('#mapLegend button').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.key === biomeKey);
  });
  if (!visualOnly && biomeKey !== timeState.location && !timeState.traveling) {
    // clique na legenda = pedido de viagem
    requestTravel(biomeKey);
  }
}

function renderMapLegend(activeKey) {
  const el = document.getElementById('mapLegend');
  if (!el) return;
  el.innerHTML = Object.keys(MAP_LOCATIONS).map(key => {
    const loc = MAP_LOCATIONS[key];
    const days = getTravelDays(timeState.location, key);
    const active = key === timeState.location ? ' active' : '';
    const dayHint = key === timeState.location ? ' (aqui)' : ` (${days}d)`;
    return `<button type="button" class="${active}" data-key="${key}" onclick="onMapLegendClick('${key}')">${loc.label}${dayHint}</button>`;
  }).join('');
}

function onMapLegendClick(key) {
  if (key === timeState.location) {
    setMapMarker(key, true);
    return;
  }
  requestTravel(key);
}

document.addEventListener('DOMContentLoaded', () => {
  loadTimeState();
});

function showCreatorScreen(which) {
  ['creatorHome','screenSaved','screenView','screenEditor'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove('active');
  });
  if (which === 'home') document.getElementById('creatorHome').classList.add('active');
  if (which === 'saved') document.getElementById('screenSaved').classList.add('active');
  if (which === 'view') document.getElementById('screenView').classList.add('active');
  if (which === 'editor') document.getElementById('screenEditor').classList.add('active');

  // Atualiza estado visual dos botões da navegação do criador
  document.querySelectorAll('#screenCreator .nav-btn').forEach(btn => btn.classList.remove('active'));
  if (which === 'home') {
    const btn = document.querySelector('#screenCreator .nav-btn[onclick*="home"]');
    if (btn) btn.classList.add('active');
  } else if (which === 'saved') {
    const btn = document.querySelector('#screenCreator .nav-btn[onclick*="goSaved"]');
    if (btn) btn.classList.add('active');
  }
}

