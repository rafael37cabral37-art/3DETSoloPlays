/* ===== [ARENA_HDR] linhas originais 3118-3122 ===== */
/* ==================== ARENA DE BATALHA ==================== */
let fightersList = [];
let heroes = [], enemies = [], turnOrder = [], currentTurnIndex = 0, pendingAttack = null, isRolling = false;

/** Dado explosivo: 1d6. Sempre que sair 6, soma e joga de novo. */
/* ===== [DADOS] linhas originais 3123-4035 ===== */
/* ==================== 3DeT VICTORY — DADOS (2D6 puro) ====================
 * Iniciativa: 1D6 + H
 * Ataque FA: 2D6 + P
 * Defesa FD: 2D6 + R
 * Dano: min(P, max(0, FA-FD)); crítico (dois 6s) = dano máximo P + efeito
 * Teste: 2D6 + H + bônus ≥ ND
 */
function roll1D6() {
  return Math.floor(Math.random() * 6) + 1;
}

function roll2D6() {
  const a = roll1D6();
  const b = roll1D6();
  const total = a + b;
  const critical = (a === 6 && b === 6);
  const fumble = (a === 1 && b === 1);
  return {
    total,
    dice: [a, b],
    rolls: [a, b],
    critical,
    fumble,
    exploded: critical, // compat legado
    diceStr: a + '+' + b + '=' + total
  };
}

/** Alias interno: 2D6 Victory (nome histórico no código de encontros) */
function rollExplodingD6() {
  return roll2D6();
}

function loadFighters() {
  try {
    fightersList = getSaved();
  } catch (e) {
    fightersList = [];
  }
  buildTeamSelects();
}

function buildBestiarioEnemyOptions() {
  if (typeof BESTIARIO_VICTORY === 'undefined' || !BESTIARIO_VICTORY.length) return '';
  const byNivel = {};
  BESTIARIO_VICTORY.forEach(m => {
    const n = m.nivel || 1;
    if (!byNivel[n]) byNivel[n] = [];
    byNivel[n].push(m);
  });
  let html = '<option value="" disabled>—— 📖 Bestiário Victory (fêmeas) ——</option>';
  Object.keys(byNivel).sort((a, b) => Number(a) - Number(b)).forEach(n => {
    html += '<option value="" disabled>—— Nível ' + n + ' ——</option>';
    byNivel[n].forEach(m => {
      const ap = m.aparencia != null ? m.aparencia : '?';
      const af = m.afeto != null ? m.afeto : 10;
      const tag = (m.tags || []).includes('sobrenatural') ? ' ✨' : (((m.tags || []).includes('chefe') || (m.tags || []).includes('lendario')) ? ' 👑' : '');
      html += '<option value="best:' + m.id + '">' + m.nome + tag + ' · P' + m.P + ' H' + m.H + ' R' + m.R + ' · ✨' + ap + '/10 · 💗' + af + '</option>';
    });
  });
  return html;
}

function buildTeamSelects() {
  const nH = parseInt(document.getElementById('numHeroes').value) || 1;
  const nE = parseInt(document.getElementById('numEnemies').value) || 1;
  const hContainer = document.getElementById('heroesContainer');
  const eContainer = document.getElementById('enemiesContainer');
  if (!hContainer || !eContainer) return;
  hContainer.innerHTML = '';
  eContainer.innerHTML = '';
  const bestOpts = buildBestiarioEnemyOptions();
  for (let i = 0; i < nH; i++) {
    hContainer.innerHTML +=
      '<select id="selectHero_' + i + '">' +
      '<option value="">— Escolha o Herói ' + (i + 1) + ' —</option>' +
      (fightersList || []).map(function(c, idx) {
        if (!c || c.isTemp || c.id === 'boss_seraphine' || c._seraphine || c.id === 'boss_selene') return '';
        return '<option value="' + idx + '">' + c.nome + ' (P' + c.P + ' H' + c.H + ' R' + c.R + ')</option>';
      }).join('') +
      '</select>';
  }
  for (let i = 0; i < nE; i++) {
    eContainer.innerHTML +=
      '<select id="selectEnemy_' + i + '">' +
      '<option value="">— Escolha o Inimigo ' + (i + 1) + ' —</option>' +
      '<option value="" disabled>—— Personagens / Temporários ——</option>' +
      (fightersList || []).map(function(c, idx) {
        if (!c) return '';
        var tag = (c.id === 'boss_seraphine' || c._seraphine) ? ' 🩸BOSS' : (c.id === 'boss_selene' ? ' 🐺BOSS' : (c.isTemp ? ' [temp]' : ''));
        var ap = c.aparencia != null ? (' · ✨' + c.aparencia) : '';
        return '<option value="' + idx + '">' + c.nome + tag + ' (P' + c.P + ' H' + c.H + ' R' + c.R + ap + ')</option>';
      }).join('') +
      bestOpts +
      '</select>';
  }
}

function hasTrait(character, traitName) {
  if (!character) return false;
  const traits = [...(character.vantagens || []), ...(character.desvantagens || []), ...(character.pericias || [])];
  return traits.some(item => (typeof item === 'string' ? item : item.nome || '').toLowerCase().includes(traitName.toLowerCase()));
}

function importJSON(e) {
  const f = e.target.files[0];
  if (!f) return;
  const r = new FileReader();
  r.onload = ev => {
    try {
      const char = JSON.parse(ev.target.result);
      if (char.nome && char.P !== undefined) {
        if (!char.id) char.id = 'imp_' + Date.now().toString(36);
        const list = getSaved();
        list.push(normalizeCharacter(char));
        setSaved(list);
        loadFighters();
        alert(`Personagem ${char.nome} importado!`);
      }
    } catch (err) { alert("Arquivo JSON inválido."); }
  };
  r.readAsText(f);
}

function startGroupBattle() {
  window._battleEndHandled = false;
  const nH = parseInt(document.getElementById('numHeroes').value);
  const nE = parseInt(document.getElementById('numEnemies').value);
  heroes = []; enemies = [];
  for (let i = 0; i < nH; i++) {
    const idx = document.getElementById(`selectHero_${i}`).value;
    if (idx === "") { alert("Selecione todos os Heróis!"); return; }
    let c = JSON.parse(JSON.stringify(fightersList[idx]));
    c.uid = 'hero_' + i; c.isHero = true;
    c = normalizeCharacter(c);
    const res = getCharResources(c);
    c.paMax = res.pa; c.paAtual = res.pa;
    c.pvMax = res.pv; c.pvAtual = (typeof c.pvAtual === 'number' ? Math.min(c.pvAtual, res.pv) : res.pv);
    c.pmMax = res.pm; c.pmAtual = (typeof c.pmAtual === 'number' ? Math.min(c.pmAtual, res.pm) : res.pm);
    c._firstAttackDone = false;
    heroes.push(c);
  }
  for (let i = 0; i < nE; i++) {
    const val = document.getElementById('selectEnemy_' + i).value;
    if (val === '' || val == null) { alert('Selecione todos os Inimigos!'); return; }
    let c;
    if (String(val).startsWith('best:')) {
      const bid = String(val).slice(5);
      const proto = typeof getBestiarioById === 'function' ? getBestiarioById(bid) : null;
      if (!proto) { alert('Entrada do bestiário não encontrada: ' + bid); return; }
      c = typeof bestiarioParaInimigo === 'function' ? bestiarioParaInimigo(proto, i) : JSON.parse(JSON.stringify(proto));
      c.isTemp = true;
      c.bestiarioId = bid;
    } else {
      const idx = parseInt(val, 10);
      if (isNaN(idx) || !fightersList[idx]) { alert('Inimigo inválido no slot ' + (i + 1)); return; }
      c = JSON.parse(JSON.stringify(fightersList[idx]));
    }
    c.uid = 'enemy_' + i;
    c.isHero = false;
    if (nE > 1 && c.nome && !/#\d+$/.test(c.nome)) c.nome = c.nome + ' #' + (i + 1);
    if (typeof normalizeCharacter === 'function') c = normalizeCharacter(c);
    const res = typeof getCharResources === 'function' ? getCharResources(c) : { pa: 1, pv: (c.R || 1) * 5, pm: 0 };
    // Bestiário: PV = R×5 (já em bestiarioParaInimigo); não sobrescrever se já definido
    if (c.bestiarioId || c.isFemaleMonster) {
      c.pvMax = c.pvMax || res.pv || ((c.R || 1) * 5);
      c.pvAtual = c.pvMax;
      c.pmMax = c.pmMax != null ? c.pmMax : res.pm;
      c.pmAtual = c.pmMax;
      c.paMax = res.pa; c.paAtual = res.pa;
    } else {
      c.paMax = res.pa; c.paAtual = res.pa;
      c.pvMax = res.pv; c.pvAtual = res.pv;
      c.pmMax = res.pm; c.pmAtual = res.pm;
    }
    c._firstAttackDone = false;
    c._downedForCapture = false;
    c._captured = false;
    enemies.push(c);
  }
  document.getElementById('setupPanel').classList.add('hidden');
  document.getElementById('battlePanel').classList.remove('hidden');
  const logBox = document.getElementById('combatLog');
  if (logBox) logBox.innerHTML = '';
  renderGroupCards();
  const all = [...heroes, ...enemies];
  turnOrder = all.map(f => {
    const d = roll1D6();
    const initMod = f.initMod || 0;
    const initRoll = d + (f.H || 0) + initMod;
    return { uid: f.uid, init: initRoll, H: f.H || 0, d };
  }).sort((a, b) => (b.init - a.init) || (b.H - a.H)).map(item => item.uid);
  const initLog = all.map(f => {
    const d = roll1D6(); // only for display if not stored — recompute from turn
    return null;
  });
  addLog(`🎲 <strong>Combate Iniciado!</strong> 3DeT Victory — Iniciativa = <strong>1D6 + H</strong> (empate: maior H).`);
  enemies.forEach(f => {
    if (f.aparencia != null || f.conceito || f.aparenciaDesc) {
      addLog(`✨ <strong>${f.nome}</strong> — Aparência <strong>${f.aparencia != null ? f.aparencia : '?'}/10</strong>${f.sexoLabel ? ' · ' + f.sexoLabel : ''} · 💗 Afeto ${f.afeto != null ? f.afeto : 10}<br><span style="color:var(--muted);font-size:0.9em">${esc((f.conceito || f.aparenciaDesc || '').slice(0, 180))}</span>`);
    }
  });
  addLog(`📋 Ordem: ` + turnOrder.map((uid, i) => {
    const f = all.find(x => x.uid === uid);
    return f ? `${i + 1}. ${f.nome}` : '';
  }).filter(Boolean).join(' → '));
  currentTurnIndex = 0;
  pendingAttack = null;
  isRolling = false;
  startGroupTurn();
}

function renderGroupCards() {
  document.getElementById('heroesTeamCol').innerHTML = heroes.map(h => createCardHTML(h)).join('');
  document.getElementById('enemiesTeamCol').innerHTML = enemies.map(e => createCardHTML(e)).join('');
}

function createCardHTML(f) {
  const isDown = f.pvAtual <= 0;
  const isCaptured = !!f._captured;
  let ovClass = 'hidden';
  let ovText = '';
  if (isCaptured) { ovClass = 'overlay-status overlay-victory'; ovText = f._derrotaLabel ? ('🎲 ' + f._derrotaLabel) : '🫱 CAPTURADO'; }
  else if (isDown) { ovClass = 'overlay-status overlay-defeat'; ovText = 'FOI DE BASE'; }
  return `
    <div class="fighter-card ${isDown || isCaptured ? 'dead' : ''}" id="card_${f.uid}">
      <div id="overlay_${f.uid}" class="${ovClass}">${ovText}</div>
      <div class="avatar">${f.image ? `<img src="${f.image}" style="width:100%;height:100%;border-radius:50%;object-fit:cover">` : 'Sem Foto'}</div>
      <h4 style="font-size:0.95rem">${f.nome}${f.sexo === 'F' || f.isFemaleMonster ? ' ♀' : ''}</h4>
      ${f.aparencia != null ? `<div style="font-size:0.7rem;color:#f9a8d4;">✨ ${f.aparencia}/10${f.afeto != null ? ' · 💗' + f.afeto : ''}</div>` : ''}
      <div class="attr-mini"><span>P:${f.P}</span><span>H:${f.H}</span><span>R:${f.R}</span></div>
      <div class="stat-bar">
        <div class="stat-label"><span>PV</span><span>${f.pvAtual}/${f.pvMax}</span></div>
        <div class="bar-bg"><div class="bar-fill pv-fill" style="width:${Math.max(0, Math.min(100, (f.pvMax > 0 ? (f.pvAtual/f.pvMax)*100 : 0)))}%"></div></div>
      </div>
      <div class="stat-bar">
        <div class="stat-label"><span>PM</span><span>${f.pmAtual}/${f.pmMax}</span></div>
        <div class="bar-bg"><div class="bar-fill pm-fill" style="width:${Math.max(0, Math.min(100, (f.pmMax > 0 ? (f.pmAtual/f.pmMax)*100 : 0)))}%"></div></div>
      </div>
    </div>`;
}

function getFighterByUID(uid) {
  return heroes.find(h => h.uid === uid) || enemies.find(e => e.uid === uid);
}

function startGroupTurn() {
  pendingAttack = null; isRolling = false;
  const aliveHeroes = heroes.filter(h => h.pvAtual > 0);
  const aliveEnemies = enemies.filter(e => e.pvAtual > 0);
  if (aliveHeroes.length === 0 || aliveEnemies.length === 0) {
    const heroesWon = aliveHeroes.length > 0;
    addLog(`🏆 <strong>FIM DA BATALHA! Os ${heroesWon ? 'Heróis' : 'Inimigos'} VENCERAM!</strong>`);
    heroes.forEach(h => {
      const ov = document.getElementById(`overlay_${h.uid}`);
      if (ov) {
        ov.textContent = heroesWon ? "VICTORY" : "FOI DE BASE";
        ov.className = `overlay-status ${heroesWon ? 'overlay-victory' : 'overlay-defeat'}`;
      }
    });
    enemies.forEach(e => {
      const ov = document.getElementById(`overlay_${e.uid}`);
      if (ov) {
        if (heroesWon && (e.pvAtual <= 0 || e._downedForCapture) && !e._captured) {
          ov.textContent = "🫱 CAPTURÁVEL";
          ov.className = 'overlay-status overlay-victory';
        } else {
          ov.textContent = !heroesWon ? "VICTORY" : "FOI DE BASE";
          ov.className = `overlay-status ${!heroesWon ? 'overlay-victory' : 'overlay-defeat'}`;
        }
      }
    });
    document.getElementById('actionControls').classList.add('hidden');
    document.getElementById('defenseControls').classList.add('hidden');
    try {
      if (typeof onBattleEnd === 'function' && !window._battleEndHandled) {
        window._battleEndHandled = true;
        onBattleEnd(heroesWon);
      }
    } catch (e) {}
    if (heroesWon) {
      try { showBattleCapturePanel(); } catch (err) { console.warn(err); }
    }
    return;
  }
  let activeUID = turnOrder[currentTurnIndex];
  let activeFighter = getFighterByUID(activeUID);
  let skipGuard = 0;
  while ((!activeFighter || activeFighter.pvAtual <= 0) && skipGuard < turnOrder.length + 1) {
    currentTurnIndex = (currentTurnIndex + 1) % turnOrder.length;
    activeUID = turnOrder[currentTurnIndex];
    activeFighter = getFighterByUID(activeUID);
    skipGuard++;
  }
  if (!activeFighter || activeFighter.pvAtual <= 0) {
    // fallback: pega o primeiro vivo restante
    const anyAlive = [...aliveHeroes, ...aliveEnemies][0];
    if (!anyAlive) return;
    activeFighter = anyAlive;
    currentTurnIndex = Math.max(0, turnOrder.indexOf(anyAlive.uid));
  }
  // Regeneração (vantagem ou bestiário)
  const regenAmt = activeFighter.regen || (hasTrait(activeFighter, 'Regeneração') || hasTrait(activeFighter, 'Regeneração Total') || hasTrait(activeFighter, 'Regeneração Vampírica') ? (activeFighter.comportamento === 'troll' ? 3 : 2) : 0);
  if (regenAmt > 0 && activeFighter.pvAtual > 0 && activeFighter.pvAtual < activeFighter.pvMax) {
    // Fogo/ácido recente bloqueia regen de troll/hidra
    if (activeFighter._blockRegen) {
      addLog(`🔥 <span class="log-dmg">${activeFighter.nome} não regenera — ferimento de fogo/ácido!</span>`);
      activeFighter._blockRegen = false;
    } else {
      activeFighter.pvAtual = Math.min(activeFighter.pvMax, activeFighter.pvAtual + regenAmt);
      addLog(`🌿 <span class="log-heal">${activeFighter.nome} regenerou ${regenAmt} PV!</span>`);
      renderGroupCards();
    }
  }
  // Covarde: foge com ≤ metade dos PV
  if (!activeFighter.isHero && (activeFighter.comportamento === 'covarde' || (activeFighter.desvantagens || []).includes('Covarde'))) {
    const half = Math.ceil((activeFighter.pvMax || 5) / 2);
    if (activeFighter.pvAtual > 0 && activeFighter.pvAtual <= half) {
      addLog(`🏃 <span class="log-heal">${activeFighter.falaFuga || (activeFighter.nome + ' foge covardemente!')}</span>`);
      activeFighter.pvAtual = 0;
      activeFighter._fled = true;
      renderGroupCards();
      currentTurnIndex = (currentTurnIndex + 1) % turnOrder.length;
      startGroupTurn();
      return;
    }
  }
  if (activeFighter._soproCooldown > 0) activeFighter._soproCooldown--;
  document.querySelectorAll('.fighter-card').forEach(c => c.classList.remove('active-turn'));
  const activeCard = document.getElementById(`card_${activeFighter.uid}`);
  if (activeCard) activeCard.classList.add('active-turn');
  document.getElementById('activeFighterName').textContent = activeFighter.nome;
  if (activeFighter.isHero) {
    const targetSelect = document.getElementById('targetSelect');
    targetSelect.innerHTML = aliveEnemies.map(e => `<option value="${e.uid}">Alvo: ${e.nome}</option>`).join('');
    document.getElementById('btnGroupMagic').classList.toggle('hidden', !hasTrait(activeFighter, 'Magia'));
    document.getElementById('btnGroupHeal').classList.toggle('hidden', !hasTrait(activeFighter, 'Cura'));
    const biteBtn = document.getElementById('btnMordidaSangue');
    if (biteBtn) {
      const canBite = hasTrait(activeFighter, 'Mordida de Sangue') || activeFighter.arquetipoId === 'vampiro' || !!activeFighter.vampiro;
      biteBtn.classList.toggle('hidden', !canBite);
    }
    document.getElementById('actionControls').classList.remove('hidden');
    document.getElementById('defenseControls').classList.add('hidden');
    document.getElementById('diceSubtext').textContent = "Sua vez! Escolha o alvo e a ação.";
  } else {
    document.getElementById('actionControls').classList.add('hidden');
    document.getElementById('defenseControls').classList.add('hidden');
    document.getElementById('diceSubtext').textContent = "IA decidindo ação...";
    setTimeout(processGroupAITurn, 900);
  }
}

/** Tipos de dano considerados "físicos comuns" (imunes / incorpóreos) */

/** Inventário durante o combate: usar consumíveis e trocar/equipar arma (tipo de dano). */
function openBattleInventory() {
  const panel = document.getElementById('battleInvPanel');
  if (!panel) return;
  if (!panel.classList.contains('hidden') && panel.innerHTML) {
    panel.classList.add('hidden');
    return;
  }
  const active = typeof getFighterByUID === 'function' ? getFighterByUID(turnOrder[currentTurnIndex]) : null;
  if (!active || !active.isHero) {
    alert('Só o herói da vez pode abrir o inventário de combate.');
    return;
  }
  let hero = active;
  try {
    if (active.id && typeof getSaved === 'function') {
      const saved = getSaved().find(function(x){ return x.id === active.id; });
      if (saved) {
        hero.inventario = saved.inventario || hero.inventario || [];
        hero.equipado = saved.equipado || hero.equipado || {};
      }
    }
  } catch (e) {}
  const inv = hero.inventario || [];
  const armaEq = typeof findEquippedItem === 'function' ? findEquippedItem(hero, 'arma') : null;
  let html = '<div style="margin-bottom:6px;"><strong>' + esc(hero.nome) + '</strong> · Arma: <span style="color:var(--accent)">' + (armaEq ? esc(armaEq.nome) + (armaEq.danoTipo ? ' [' + armaEq.danoTipo + ']' : '') : 'nenhuma (dano físico comum)') + '</span></div>';
  html += '<div style="font-size:0.72rem;color:var(--muted);margin-bottom:8px;">Contra Lich/imunes a físico: equipe Prata, Sagrado, Fogo ou use Feitiço (Mágico).</div>';
  if (!inv.length) {
    html += '<p style="color:var(--muted);">Inventário vazio. Compre armas no Mercado ou Templo.</p>';
  } else {
    inv.forEach(function(item, idx) {
      const slot = typeof getItemEquipSlot === 'function' ? getItemEquipSlot(item) : null;
      const equipped = slot && hero.equipado && hero.equipado[slot] === item.id;
      const dt = item.danoTipo ? ' <em style="color:#fbbf24">[' + item.danoTipo + ']</em>' : '';
      html += '<div style="margin:6px 0;padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.06);">';
      html += '<strong>' + esc(item.nome || 'Item') + '</strong>' + dt;
      if (item.desc) html += '<div style="color:var(--muted);font-size:0.72rem;">' + esc(item.desc) + '</div>';
      html += '<div style="margin-top:4px;display:flex;flex-wrap:wrap;gap:4px;">';
      if (item.usavel) {
        html += '<button class="btn btn-sm" style="width:auto;padding:2px 8px;font-size:0.72rem;" onclick="battleUseItem(\'' + (hero.id || '') + '\',' + idx + ')">Usar</button>';
      }
      if (slot === 'arma' || slot === 'escudo' || slot === 'armadura' || slot === 'acessorio') {
        if (equipped) {
          html += '<button class="btn btn-sm btn-outline" style="width:auto;padding:2px 8px;font-size:0.72rem;" onclick="battleUnequip(\'' + (hero.id || '') + '\',\'' + slot + '\')">Desequipar</button>';
        } else {
          html += '<button class="btn btn-sm" style="width:auto;padding:2px 8px;font-size:0.72rem;background:var(--accent);color:#000;" onclick="battleEquipItem(\'' + (hero.id || '') + '\',' + idx + ')">Equipar</button>';
        }
      }
      html += '</div></div>';
    });
  }
  panel.innerHTML = html;
  panel.classList.remove('hidden');
}
function battleSyncHeroFromSave(heroId) {
  const list = typeof getSaved === 'function' ? getSaved() : [];
  const saved = list.find(function(x){ return x.id === heroId; });
  if (!saved) return null;
  const active = getFighterByUID(turnOrder[currentTurnIndex]);
  if (active && active.id === heroId) {
    active.inventario = saved.inventario || [];
    active.equipado = saved.equipado || {};
    if (saved.pvAtual != null) active.pvAtual = saved.pvAtual;
    if (saved.pmAtual != null) active.pmAtual = saved.pmAtual;
  }
  return saved;
}
function battleEquipItem(heroId, invIndex) {
  if (typeof equipItem === 'function') equipItem(heroId, invIndex);
  battleSyncHeroFromSave(heroId);
  var p = document.getElementById('battleInvPanel');
  if (p) { p.classList.add('hidden'); p.innerHTML = ''; }
  openBattleInventory();
  try { renderGroupCards(); } catch (e) {}
  try { addLog('⚔️ Equipamento alterado no combate.'); } catch (e) {}
}
function battleUnequip(heroId, slot) {
  if (typeof unequipSlot === 'function') unequipSlot(heroId, slot);
  battleSyncHeroFromSave(heroId);
  var p = document.getElementById('battleInvPanel');
  if (p) { p.classList.add('hidden'); p.innerHTML = ''; }
  openBattleInventory();
  try { renderGroupCards(); } catch (e) {}
}
function battleUseItem(heroId, invIndex) {
  if (typeof useInventoryItem === 'function') useInventoryItem(heroId, invIndex);
  battleSyncHeroFromSave(heroId);
  var p = document.getElementById('battleInvPanel');
  if (p) { p.classList.add('hidden'); p.innerHTML = ''; }
  openBattleInventory();
  try { renderGroupCards(); } catch (e) {}
}

function isDanoFisicoComum(t) {
  const x = String(t || '').toLowerCase();
  return ['físico','fisico','pancada','corte','impacto','perfurante','projétil','projetil'].some(k => x === k || x.indexOf(k) >= 0);
}

/** Tipo de dano efetivo do herói: arma equipada > tipo pedido > tipoDanoPadrao */
function resolveHeroDamageType(fighter, requestedType) {
  if (!fighter) return requestedType || 'Físico';
  if (requestedType === 'Mordida') return 'Mordida';
  // Feitiço explícito (gasta PM) sempre Mágico
  if (requestedType === 'Mágico') return 'Mágico';
  try {
    const arma = typeof findEquippedItem === 'function' ? findEquippedItem(fighter, 'arma') : null;
    if (arma && arma.danoTipo) return arma.danoTipo;
  } catch (e) {}
  if (fighter.tipoDanoPadrao && fighter.tipoDanoPadrao !== 'Pancada') {
    // Se o jogador pediu Físico genérico, ainda aplica o tipo pessoal (ex.: Sombrio vampiro)
    if (!requestedType || requestedType === 'Físico' || requestedType === 'Pancada') {
      return fighter.tipoDanoPadrao;
    }
  }
  return requestedType || fighter.tipoDanoPadrao || 'Físico';
}

function executeGroupAttack(attrType, damageType) {
  if (isRolling) return;
  const activeFighter = getFighterByUID(turnOrder[currentTurnIndex]);
  if (!activeFighter || activeFighter.pvAtual <= 0) return;
  const targetUID = document.getElementById('targetSelect').value;
  const targetFighter = getFighterByUID(targetUID);
  if (!targetFighter || targetFighter.pvAtual <= 0) {
    alert('Selecione um alvo válido (vivo).');
    return;
  }
  // Victory: FA sempre 2D6 + P (Poder). Habilidade não entra no ataque.
  attrType = 'P';
  const requestedType = damageType;
  if (requestedType === 'Mágico') {
    if ((activeFighter.pmAtual || 0) < 2) {
      alert('PM insuficiente! Feitiço custa 2 PM.');
      return;
    }
    activeFighter.pmAtual -= 2;
    damageType = 'Mágico';
  } else if (requestedType === 'Mordida') {
    damageType = 'Mordida';
  } else {
    damageType = (typeof resolveHeroDamageType === 'function')
      ? resolveHeroDamageType(activeFighter, requestedType)
      : requestedType;
  }
  if (damageType === 'Mordida') {
    const hasBite = (activeFighter.vantagens || []).includes('Mordida de Sangue') || activeFighter.arquetipoId === 'vampiro' || activeFighter.vampiro;
    if (!hasBite) {
      alert('Mordida de Sangue requer a vantagem / raça Vampiro.');
      return;
    }
  }
  isRolling = true;
  renderGroupCards();
  const roll = roll2D6();
  const Pval = activeFighter.P || 0;
  let equipBonus = 0;
  let equipNote = '';
  try {
    const vmod = typeof modificadorVampiroCombate === 'function' ? modificadorVampiroCombate(activeFighter) : 0;
    if (vmod) { equipBonus += vmod; equipNote += ` (${vmod} vampiro: sede/sol)`; }
    if (damageType === 'Mordida') { equipBonus += 1; equipNote += ' (+1 Mordida)'; }
  } catch (e) {}
  try {
    const bonuses = typeof getEquipBonuses === 'function' ? getEquipBonuses(activeFighter) : {};
    equipBonus += bonuses.faAlways || 0;
    if (!activeFighter._firstAttackDone && (bonuses.faFirstTurn || 0) > 0) {
      equipBonus += bonuses.faFirstTurn;
      equipNote += ` (+${bonuses.faFirstTurn} FA 1º turno)`;
    }
    if ((bonuses.faAlways || 0) > 0) equipNote += ` (+${bonuses.faAlways} FA equip)`;
    if ((activeFighter.statusEffects || []).some(s => s.id === 'pedra_amolar')) {
      activeFighter.statusEffects = activeFighter.statusEffects.filter(s => s.id !== 'pedra_amolar');
    }
  } catch (e) {}
  activeFighter._firstAttackDone = true;
  // Crítico oficial Victory: dois 6s → P dobra na FA; limite de dano = 2×P
  const pForFa = roll.critical ? (Pval * 2) : Pval;
  const damageCap = roll.critical ? (Pval * 2) : Pval;
  const fa = pForFa + roll.total + equipBonus;
  let critTag = '';
  if (roll.critical) critTag = ' <span class="log-crit">⭐ ACERTO CRÍTICO (6+6)! P dobra · limite de dano 2×P</span>';
  if (roll.fumble) critTag = ' <span class="log-dmg">💥 FALHA CRÍTICA (1+1)!</span>';
  document.getElementById('diceDisplay').textContent = roll.diceStr;
  const tagType = damageType === 'Mágico' ? '<span class="log-magic">[Mágico]</span>'
    : (damageType === 'Mordida' ? '<span style="color:#c084fc">[🩸 Mordida]</span>'
    : (damageType === 'Prata' ? '<span style="color:#e2e8f0">[Prata]</span>'
    : (damageType === 'Sagrado' ? '<span style="color:#fde68a">[Sagrado]</span>'
    : (damageType === 'Fogo' ? '<span class="log-dmg">[Fogo]</span>'
    : (damageType === 'Sombrio' ? '<span style="color:#a78bfa">[Sombrio]</span>'
    : '[' + (damageType || 'Físico') + ']')))));
  if (roll.fumble) {
    addLog(`💥 <strong>${activeFighter.nome}</strong> atacou <strong>${targetFighter.nome}</strong> ${tagType}! 🎲 2D6: <strong>${roll.diceStr}</strong> + P${Pval}${equipNote} = FA <strong>${fa}</strong>${critTag}`);
    addLog(`❌ Falha crítica — o ataque falha sem efeito (arma emperra, escorrega, etc.).`);
    pendingAttack = null;
    isRolling = false;
    document.getElementById('actionControls').classList.add('hidden');
    currentTurnIndex = (currentTurnIndex + 1) % turnOrder.length;
    startGroupTurn();
    return;
  }
  const pNote = roll.critical ? ` + P${Pval}×2` : ` + P${Pval}`;
  addLog(`💥 <strong>${activeFighter.nome}</strong> atacou <strong>${targetFighter.nome}</strong> ${tagType}! 🎲 2D6: <strong>${roll.diceStr}</strong>${pNote}${equipNote} = <strong>FA ${fa}</strong>${critTag}`);
  pendingAttack = {
    attacker: activeFighter,
    defender: targetFighter,
    damageType,
    attrType: 'P',
    pa: fa,
    fa,
    attackRoll: roll,
    attackerP: damageCap,
    isCritical: !!roll.critical
  };
  document.getElementById('actionControls').classList.add('hidden');
  document.getElementById('diceSubtext').textContent = `${targetFighter.nome} defendendo (2D6 + R)...`;
  if (targetFighter.isHero) {
    document.getElementById('defenseControls').classList.remove('hidden');
    isRolling = false;
  } else {
    setTimeout(processGroupAIDefense, 700);
  }
}

function processGroupAITurn() {
  const activeFighter = getFighterByUID(turnOrder[currentTurnIndex]);
  const aliveHeroes = heroes.filter(h => h.pvAtual > 0);
  if (!activeFighter || aliveHeroes.length === 0) {
    startGroupTurn();
    return;
  }
  const targetFighter = aliveHeroes[Math.floor(Math.random() * aliveHeroes.length)];
  const comp = activeFighter.comportamento || 'implacavel';

  // Dragão / sopro
  if ((comp === 'dragao' || activeFighter.soproCd) && activeFighter.soproCd && (activeFighter._soproCooldown || 0) <= 0 && Math.random() < 0.45) {
    const roll = roll2D6();
    const dmgBase = (activeFighter.soproDano || 4) + roll.total;
    // Sopro: defesa coletiva simplificada — cada herói vivo rola FD
    addLog(`🔥 <strong>${activeFighter.nome}</strong>: ${activeFighter.falaSopro || 'Sopro devastador!'}`);
    aliveHeroes.forEach(h => {
      const def = roll2D6();
      const fd = def.total + (h.R || 0);
      let dmg = Math.max(0, dmgBase - fd);
      // limite narrativo do sopro: não usa P do dragão como cap de arma; usa soproDano+2d6 vs FD
      if (dmg > 0) {
        h.pvAtual = Math.max(0, h.pvAtual - dmg);
        addLog(`  🔥 ${h.nome}: FD ${fd} → <span class="log-dmg">${dmg} de fogo</span>`);
        if (h.pvAtual <= 0) h._downedForCapture = true;
      } else {
        addLog(`  🛡️ ${h.nome}: FD ${fd} — resistiu ao sopro`);
      }
    });
    activeFighter._soproCooldown = activeFighter.soproCd || 3;
    document.getElementById('diceDisplay').textContent = roll.diceStr;
    renderGroupCards();
    currentTurnIndex = (currentTurnIndex + 1) % turnOrder.length;
    startGroupTurn();
    return;
  }

  // Feroz: +1 P efetivo sob metade dos PV
  let Pbonus = 0;
  if ((comp === 'feroz' || (activeFighter.vantagens || []).includes('Feroz')) && activeFighter.pvAtual <= Math.ceil((activeFighter.pvMax || 1) / 2)) {
    Pbonus = 1;
  }
  // Investida minotauro: +2 se "investiu" (50%)
  if ((activeFighter.vantagens || []).includes('Investida') && Math.random() < 0.5) {
    Pbonus += 2;
    addLog(`🐂 ${activeFighter.nome} investe com força total!`);
  }

  let damageType = 'Físico';
  if ((activeFighter.tags || []).includes('fogo') || (activeFighter.vantagens || []).includes('Fogo')) damageType = 'Fogo';
  if (hasTrait(activeFighter, 'Magia') && (activeFighter.pmAtual || 0) >= 2 && Math.random() < 0.35) {
    damageType = 'Mágico';
    activeFighter.pmAtual -= 2;
  }

  if (activeFighter.falaAtq) addLog(`💬 <em>${activeFighter.falaAtq}</em>`);

  if (activeFighter.comportamento === 'sucubo' && Math.random() < 0.4) {
    const t = targetFighter;
    const apMod = typeof aparenciaBonus === 'function' ? aparenciaBonus(activeFighter.aparencia).mod : 0;
    const ndSeducao = 14 - apMod; // quanto mais bela a atacante, mais difícil resistir
    const resist = roll2D6().total + (t.R || 0);
    addLog(`💋 <strong>${activeFighter.nome}</strong> tenta <em>Sedução</em> em ${t.nome} (ND ${ndSeducao} vs 2D6+R)${apMod ? ` — Aparência ${apMod > 0 ? '+' : ''}${apMod}` : ''}...`);
    if (resist < ndSeducao) {
      addLog(`💗 ${t.nome} fica encantado e hesita.`);
      t._skipNextAttack = true;
    } else {
      addLog(`🛡️ ${t.nome} resiste à sedução (${resist}).`);
    }
  }

  renderGroupCards();
  const roll = roll2D6();
  const Pval = (activeFighter.P || 0) + Pbonus;
  let equipBonus = 0;
  try {
    const bonuses = typeof getEquipBonuses === 'function' ? getEquipBonuses(activeFighter) : {};
    equipBonus += bonuses.faAlways || 0;
  } catch (e) {}
  activeFighter._firstAttackDone = true;
  const pForFa = roll.critical ? (Pval * 2) : Pval;
  const damageCap = roll.critical ? (Pval * 2) : Pval;
  const fa = pForFa + roll.total + equipBonus;
  let critTag = '';
  if (roll.critical) critTag = ' <span class="log-crit">⭐ CRÍTICO (6+6)! P dobra · limite 2×P</span>';
  if (roll.fumble) critTag = ' <span class="log-dmg">💥 FALHA CRÍTICA!</span>';
  document.getElementById('diceDisplay').textContent = roll.diceStr;
  const tagType = damageType === 'Mágico' ? ' <span class="log-magic">[Mágico]</span>' : (damageType === 'Fogo' ? ' <span class="log-dmg">[Fogo]</span>' : '');
  const pNote = roll.critical ? ` + P${Pval}×2` : ` + P${Pval}`;
  addLog(`💥 <strong>${activeFighter.nome} (IA)</strong> atacou <strong>${targetFighter.nome}</strong>${tagType}! 🎲 2D6: <strong>${roll.diceStr}</strong>${pNote}${Pbonus ? ' (bônus incluso)' : ''} = <strong>FA ${fa}</strong>${critTag}`);
  if (roll.fumble) {
    addLog(`❌ Falha crítica — ataque sem efeito.`);
    currentTurnIndex = (currentTurnIndex + 1) % turnOrder.length;
    startGroupTurn();
    return;
  }
  pendingAttack = {
    attacker: activeFighter,
    defender: targetFighter,
    damageType,
    attrType: 'P',
    pa: fa,
    fa,
    attackRoll: roll,
    attackerP: damageCap,
    isCritical: !!roll.critical
  };
  document.getElementById('diceSubtext').textContent = `Defenda ${targetFighter.nome} (FD = 2D6 + R)!`;
  document.getElementById('defenseControls').classList.remove('hidden');
}

function confirmGroupDefense(defType) {
  if (!pendingAttack) { isRolling = false; return; }
  const { defender, pa, damageType, attrType, attackRoll, attackerP, attacker } = pendingAttack;
  if (!defender) { pendingAttack = null; isRolling = false; return; }
  document.getElementById('defenseControls').classList.add('hidden');
  // Victory: FD = 2D6 + R (sempre Resistência)
  const roll = roll2D6();
  const Rval = defender.R || 0;
  let fdBonus = 0;
  let fdNote = '';
  try {
    const bonuses = typeof getEquipBonuses === 'function' ? getEquipBonuses(defender) : {};
    fdBonus += bonuses.fdBlock || 0;
    const isRanged = (damageType === 'Físico' && attrType === 'H');
    if (isRanged && (bonuses.fdBlockVsRanged || 0) > 0) {
      fdBonus += bonuses.fdBlockVsRanged;
      fdNote += ` (+${bonuses.fdBlockVsRanged} escudo vs projéteis)`;
    }
    const isCrush = (damageType === 'Físico' || damageType === 'Pancada');
    if (isCrush && (bonuses.fdBlockVsCrush || 0) > 0) {
      fdBonus += bonuses.fdBlockVsCrush;
      fdNote += ` (+${bonuses.fdBlockVsCrush} armadura)`;
    }
    if ((bonuses.fdBlock || 0) > 0) fdNote += ` (+${bonuses.fdBlock} FD equip)`;
  } catch (e) {}
  const fd = Rval + roll.total + fdBonus;
  let critTag = '';
  if (roll.critical) critTag = ' <span class="log-heal">⭐ DEFESA CRÍTICA!</span>';
  if (roll.fumble) critTag = ' <span class="log-dmg">💥 FALHA CRÍTICA NA DEFESA!</span>';
  document.getElementById('diceDisplay').textContent = roll.diceStr;

  let msg = `🛡️ <strong>${defender.nome}</strong> defendeu: 🎲 2D6: <strong>${roll.diceStr}</strong> + R${Rval}${fdNote} = <strong>FD ${fd}</strong>${critTag}. `;

  const fa = (typeof pa === 'number') ? pa : (pendingAttack.fa || 0);
  const Pcap = (typeof attackerP === 'number') ? attackerP : ((attacker && attacker.P) || 1);

  if (roll.fumble) {
    // Falha crítica na defesa: sofre dano como se FD fosse 0 (ainda limitado a P)
    let baseDmg = Math.max(0, fa - 0);
    baseDmg = Math.min(baseDmg, Math.max(1, Pcap));
    if (attackRoll && attackRoll.critical) baseDmg = Math.max(1, Pcap); // crítico de ataque + fumble defesa
    msg += `<br>💥 Falha crítica na defesa — impacto total (limitado a P${Pcap}): <span class="log-dmg">${baseDmg} de dano</span>`;
    defender.pvAtual = Math.max(0, (defender.pvAtual || 0) - baseDmg);
    applyPostDamageEffects(attacker, defender, baseDmg, damageType, true);
  } else if (fa > fd) {
    let baseDmg = fa - fd;
    // LIMITE VICTORY: dano nunca maior que P do atacante
    const uncapped = baseDmg;
    baseDmg = Math.min(baseDmg, Math.max(0, Pcap));
    if (attackRoll && attackRoll.critical) {
      // Crítico oficial: limite já é 2×P (em attackerP); efeito narrativo
      msg += `<br>⭐ Crítico: limite de dano = 2×P (${Pcap}) · golpe devastador!`;
    }
    try {
      if (damageType === 'Físico' && (defender.vantagens || []).includes('Resistência a Dano Comum')) {
        const red = Math.max(1, Math.floor(baseDmg * 0.35));
        baseDmg = Math.max(0, baseDmg - red);
        msg += `<br>🛡️ Resistência a Dano Comum (−${red})`;
      }
      // Redução física (gárgula/golem)
      if ((damageType === 'Físico' || damageType === 'Pancada' || damageType === 'Corte') && defender.reducaoFisico) {
        const before = baseDmg;
        baseDmg = Math.max(0, Math.floor(baseDmg * defender.reducaoFisico));
        msg += `<br>🪨 Pele dura (${before} → ${baseDmg})`;
      }
      // Imunidade a dano físico comum (Lich, alguns construtos)
      if (defender.imuneFisico && typeof isDanoFisicoComum === 'function' && isDanoFisicoComum(damageType)) {
        baseDmg = 0;
        msg += `<br>☠️ Imune a dano físico comum — use Prata, Sagrado, Fogo ou Mágico!`;
      }
      // Incorporal: 50% ignorar físico
      if (baseDmg > 0 && defender.incorporal && typeof isDanoFisicoComum === 'function' && isDanoFisicoComum(damageType) && Math.random() < 0.5) {
        baseDmg = 0;
        msg += `<br>👻 Incorporal — o golpe atravessa sem efeito!`;
      }
      // Vulnerabilidades do bestiário
      const vulns = defender.vulneravel || [];
      if (vulns.length && vulns.some(v => String(damageType).toLowerCase().indexOf(String(v).toLowerCase()) >= 0 || String(v).toLowerCase().indexOf(String(damageType).toLowerCase()) >= 0)) {
        baseDmg = baseDmg * 2;
        msg += `<br>💥 Vulnerável a ${damageType} — dano dobrado!`;
        if (vulns.includes('Fogo') || vulns.includes('Ácido') || damageType === 'Fogo' || damageType === 'Ácido') {
          defender._blockRegen = true;
        }
      }
      // Impacto vs esqueleto
      if ((defender.desvantagens || []).includes('Vulnerável Impacto') && (damageType === 'Pancada' || damageType === 'Físico')) {
        baseDmg += 1;
        msg += `<br>💀 Vulnerável a impacto (+1)`;
      }
    } catch (e) {}
    if (uncapped > Pcap) msg += `<br>📏 Dano limitado por P (${uncapped} → ${baseDmg})`;
    msg += `<br>💥 <span class="log-dmg">Ataque supera defesa! ${baseDmg} de dano</span> (FA ${fa} − FD ${fd})`;
    defender.pvAtual = Math.max(0, (defender.pvAtual || 0) - baseDmg);
    applyPostDamageEffects(attacker, defender, baseDmg, damageType, attackRoll && attackRoll.critical);
  } else {
    msg += `<br><span class="log-heal">✅ Defesa bem-sucedida! Nenhum dano.</span>`;
  }

  if (defender.pvAtual <= 0) {
    if (defender.isHero) {
      if (!defender._derrotaProcessada) {
        defender._derrotaProcessada = true;
        const resultado = rolarFinalDerrota(defender.id);
        if (resultado) {
          if (resultado.roll === 1) {
            // Final 1: continua na luta, com 1 PV
            defender.pvAtual = resultado.char.pvAtual;
            msg += `<br>🎲 <strong>${defender.nome}</strong> caiu a 0 PV — rolou 1D6 para o final de derrota: <strong>${resultado.roll} (${resultado.titulo})</strong>. Segue na luta com ${defender.pvAtual} PV!`;
          } else {
            // Demais finais: sai deste combate (destino já aplicado à ficha)
            defender.pvAtual = 0;
            defender._captured = true;
            defender._derrotaLabel = resultado.titulo;
            msg += `<br>🎲 <strong>${defender.nome}</strong> caiu a 0 PV — rolou 1D6 para o final de derrota: <strong>${resultado.roll} (${resultado.titulo})</strong>. Fora deste combate — veja a ficha para os detalhes e como reverter.`;
          }
        }
      }
    } else {
      msg += `<br>💀 <strong>${defender.nome}</strong> caiu a 0 PV — pode ser <span class="log-crit">CAPTURADO</span> ou eliminado no fim da batalha.`;
      defender._downedForCapture = true;
    }
  }
  addLog(msg);
  pendingAttack = null;
  isRolling = false;
  renderGroupCards();
  currentTurnIndex = (currentTurnIndex + 1) % turnOrder.length;
  // vitória/derrota
  try {
    const aliveH = heroes.filter(h => h.pvAtual > 0 && !h._captured);
    const aliveE = enemies.filter(e => e.pvAtual > 0 && !e._captured);
    if (aliveE.length === 0) {
      addLog('🏆 <strong>Vitória!</strong> Todos os inimigos caíram.');
      // onBattleEnd + painel de captura são tratados em startGroupTurn()
    } else if (aliveH.length === 0) {
      addLog('☠️ <strong>Derrota...</strong> O grupo caiu.');
    }
  } catch (e) {}
  startGroupTurn();
}

function applyPostDamageEffects(attacker, defender, dmg, damageType, wasCrit) {
  if (!attacker || !defender || dmg <= 0) return;
  try {
    if (damageType === 'Mordida' && ((attacker.vantagens || []).includes('Mordida de Sangue') || attacker.vampiro)) {
      const heal = Math.max(1, Math.floor(dmg / 2));
      attacker.pvAtual = Math.min(attacker.pvMax || 99, (attacker.pvAtual || 0) + heal);
      if (attacker.vampiro) attacker.vampiro.sede = Math.max(0, (attacker.vampiro.sede || 0) - 1);
      addLog(`🩸 Mordida: ${attacker.nome} recupera ${heal} PV` + (attacker.vampiro ? ' e sacia sede' : '') + '.');
    }
  } catch (e) {}
}

function processGroupAIDefense() {
  if (!pendingAttack || !pendingAttack.defender) {
    isRolling = false;
    return;
  }
  // Victory: única defesa = 2D6 + R
  confirmGroupDefense('block');
}

function executeGroupHeal() {
  if (isRolling) return;
  const activeFighter = getFighterByUID(turnOrder[currentTurnIndex]);
  if (!activeFighter || activeFighter.pvAtual <= 0) return;
  if ((activeFighter.pmAtual || 0) < 1) {
    alert('PM insuficiente! Cura custa 1 PM.');
    return;
  }
  isRolling = true;
  activeFighter.pmAtual -= 1;
  // Victory: teste de perícia/cura = 2D6 + H ≥ ND 10 (Fácil)
  const roll = roll2D6();
  const total = roll.total + (activeFighter.H || 0);
  const nd = 10;
  let tag = '';
  if (roll.critical) tag = ' ⭐';
  if (roll.fumble) tag = ' 💥';
  if (total >= nd && !roll.fumble) {
    const heal = Math.max(1, (activeFighter.R || 1) + (roll.critical ? 2 : 0));
    activeFighter.pvAtual = Math.min(activeFighter.pvMax, activeFighter.pvAtual + heal);
    addLog(`💊 <strong>${activeFighter.nome}</strong> 🎲 2D6: <strong>${roll.diceStr}</strong> + H${activeFighter.H || 0} = ${total}${tag} ≥ ND ${nd} → <span class="log-heal">curou ${heal} PV!</span>`);
  } else {
    addLog(`💊 <strong>${activeFighter.nome}</strong> 🎲 2D6: <strong>${roll.diceStr}</strong> + H${activeFighter.H || 0} = ${total}${tag} → falhou na Cura (ND ${nd}).`);
  }
  document.getElementById('diceDisplay').textContent = roll.diceStr;
  document.getElementById('actionControls').classList.add('hidden');
  isRolling = false;
  renderGroupCards();
  currentTurnIndex = (currentTurnIndex + 1) % turnOrder.length;
  startGroupTurn();
}

function addLog(text) {
  const log = document.getElementById('combatLog');
  const div = document.createElement('div');
  div.className = 'log-entry';
  div.innerHTML = text;
  log.appendChild(div);
  log.scrollTop = log.scrollHeight;
}

function resetBattle() {
  document.getElementById('battlePanel').classList.add('hidden');
  document.getElementById('setupPanel').classList.remove('hidden');
  const capPanel = document.getElementById('battleCapturePanel');
  if (capPanel) { capPanel.classList.add('hidden'); }
  cleanupTempEnemies();
  loadFighters();
}

/** Remove todos os personagens marcados como temporários (inimigos de encontro) */
function cleanupTempEnemies() {
  let list = getSaved();
  const before = list.length;
  list = list.filter(c => !c.isTemp && !(c.id && String(c.id).startsWith('temp_enemy_')));
  if (list.length !== before) {
    setSaved(list);
    fightersList = list;
  }
}


/* ===== [BESTIARIO] linhas originais 4036-4313 ===== */
/* ==================== BESTIÁRIO 3DeT VICTORY ====================
 * PV = R×5 | FA 2D6+P | FD 2D6+R | Dano ≤ P | Init 1D6+H
 * Comportamento IA: covarde foge, troll regenera, dragão arrogante, etc.
 * Todas as entradas são FÊMEAS (sexo F) com atributo aparência 1–10.
 * Derrotadas → capturáveis (1 PV) pelas regras de captura existentes.
 */
const BESTIARIO_VICTORY = [
  // Nível 1 — todas fêmeas; capturáveis ao cair a 0 PV
  { id:'goblin', nome:'Goblin', nivel:1, P:1, H:2, R:1, sexo:'F', sexoLabel:'Fêmea', aparencia:3,
    desc:'Pequena, verde, sorrateira e gananciosa. Vive em bandos.',
    vantagens:['Ágil','Furtivo'], desvantagens:['Covarde'],
    tags:['humanoide','covarde','femea'], comportamento:'covarde', capturavel:true,
    falaFuga:'A goblin grita e foge, largando moedas sujas!',
    falaAtq:'A goblin sibila e tenta apunhalar de lado!' },
  { id:'kobold', nome:'Kobold', nivel:1, P:1, H:3, R:1, sexo:'F', sexoLabel:'Fêmea', aparencia:4,
    desc:'Pequena, reptiliana, serva de dragões. Trapaceira e medrosa.',
    vantagens:['Furtivo','Armadilheiro'], desvantagens:['Covarde'],
    tags:['humanoide','reptil','covarde','femea'], comportamento:'covarde', capturavel:true,
    falaFuga:'A kobold chia e desaparece entre as pedras!',
    falaAtq:'A kobold dispara um dardo improvisado!' },
  { id:'esqueleto', nome:'Esqueleto', nivel:1, P:2, H:1, R:2, sexo:'F', sexoLabel:'Fêmea', aparencia:1,
    desc:'Ossos femininos animados, sem mente nem medo. Rígida e lenta.',
    vantagens:['Imune Doença','Imune Sono','Imune Veneno'], desvantagens:['Vulnerável Impacto'],
    tags:['morto-vivo','femea'], comportamento:'implacavel', vulneravel:['Pancada','Impacto'], capturavel:true,
    falaAtq:'A esqueleto avança com ossos rangendo, sem emoção.' },
  { id:'rato_gigante', nome:'Rata Gigante', nivel:1, P:1, H:2, R:1, sexo:'F', sexoLabel:'Fêmea', aparencia:2,
    desc:'Rata do tamanho de um cachorro. Ataca em bando.',
    vantagens:['Faro Aguçado'], desvantagens:['Medo de Fogo'],
    tags:['besta','medo_fogo','femea'], comportamento:'besta', vulneravel:['Fogo'], capturavel:true,
    falaAtq:'A rata gigante salta, dentes amarelos estalando!' },
  // Nível 2
  { id:'orc', nome:'Orc', nivel:2, P:3, H:2, R:2, sexo:'F', sexoLabel:'Fêmea', aparencia:4,
    desc:'Humanoide musculosa, pele verde, agressiva e bruta.',
    vantagens:['Feroz'], desvantagens:['Impulsivo'],
    tags:['humanoide','feroz','femea'], comportamento:'feroz', capturavel:true,
    falaAtq:'A orc uiva e desfere um golpe brutal!' },
  { id:'zumbi', nome:'Zumbi', nivel:2, P:2, H:0, R:3, sexo:'F', sexoLabel:'Fêmea', aparencia:1,
    desc:'Morta-viva lenta e resistente. Não sente dor.',
    vantagens:['Imune Doença','Imune Sono','Imune Veneno'], desvantagens:['Lento'],
    tags:['morto-vivo','lento','femea'], comportamento:'implacavel', initMod:-2, capturavel:true,
    falaAtq:'A zumbi arrasta os pés e tenta agarrar a carne viva.' },
  { id:'cao_infernal', nome:'Cadela Infernal', nivel:2, P:2, H:3, R:2, sexo:'F', sexoLabel:'Fêmea', aparencia:3,
    desc:'Cadela negra, olhos vermelhos, respira fumaça.',
    vantagens:['Fogo'], desvantagens:[],
    tags:['besta','fogo','femea'], comportamento:'predador', danoExtraTipo:'Fogo', capturavel:true,
    falaAtq:'A cadela infernal late fumaça e morde com calor abrasador!' },
  { id:'aranha_gigante', nome:'Aranha Gigante', nivel:2, P:2, H:3, R:2, sexo:'F', sexoLabel:'Fêmea', aparencia:2,
    desc:'Do tamanho de um homem. Teias e mordida venenosa.',
    vantagens:['Teia'], desvantagens:['Vulnerável Fogo'],
    tags:['besta','teia','femea'], comportamento:'predador', vulneravel:['Fogo'], capturavel:true,
    falaAtq:'A aranha cospe teia e avança com as quelíceras!' },
  // Nível 3
  { id:'lobisomem', nome:'Lobisomem', nivel:3, P:4, H:3, R:3, sexo:'F', sexoLabel:'Fêmea', aparencia:6,
    desc:'Humanoide-loba feroz. Regenera feridas.',
    vantagens:['Regeneração','Faro Aguçado'], desvantagens:['Vulnerável Prata'],
    tags:['metamorfo','regen','femea'], comportamento:'feroz', regen:1, vulneravel:['Prata'], capturavel:true,
    falaAtq:'A lobisomem uiva e ataca com garras e presas!' },
  { id:'gargoula', nome:'Gárgula', nivel:3, P:3, H:2, R:4, sexo:'F', sexoLabel:'Fêmea', aparencia:5,
    desc:'Corpo de pedra, asas de morcego. Pode parecer estátua.',
    vantagens:['Pele de Pedra','Voo'], desvantagens:['Imóvel de Dia'],
    tags:['construto','voo','femea'], comportamento:'guardião', reducaoFisico:0.5, capturavel:true,
    falaAtq:'A gárgula bate as asas de pedra e investe!' },
  { id:'goblin_chefe', nome:'Goblin Chefe', nivel:3, P:3, H:3, R:2, sexo:'F', sexoLabel:'Fêmea', aparencia:4,
    desc:'Maior e mais inteligente. Comanda bandos.',
    vantagens:['Liderança'], desvantagens:[],
    tags:['humanoide','lider','femea'], comportamento:'lider', capturavel:true,
    falaAtq:'A chefe grita ordens e avança com a lâmina enferrujada!' },
  { id:'horror_profundezas', nome:'Horror das Profundezas', nivel:3, P:3, H:2, R:3, sexo:'F', sexoLabel:'Fêmea', aparencia:2,
    desc:'Massa tentacular, olhos brilhantes, vem de baixo d\'água.',
    vantagens:['Aquático','Tentáculos'], desvantagens:['Vulnerável Fogo'],
    tags:['aberração','aquatico','femea'], comportamento:'aberração', vulneravel:['Fogo'], capturavel:true,
    falaAtq:'Tentáculos úmidos tentam envolver o alvo!' },
  // Nível 4
  { id:'minotauro', nome:'Minotauro', nivel:4, P:5, H:2, R:4, sexo:'F', sexoLabel:'Fêmea', aparencia:5,
    desc:'Corpo de mulher, cabeça de touro. Forte e furiosa.',
    vantagens:['Investida'], desvantagens:['Desorientado'],
    tags:['humanoide','investida','femea'], comportamento:'feroz', capturavel:true,
    falaAtq:'A minotauro baixa a cabeça e investe como uma touro!' },
  { id:'hidra', nome:'Hidra de Duas Cabeças', nivel:4, P:4, H:3, R:4, sexo:'F', sexoLabel:'Fêmea', aparencia:3,
    desc:'Réptil aquático. Cada cabeça ataca; fogo impede regeneração.',
    vantagens:['Multiplos Ataques','Regeneração'], desvantagens:['Vulnerável Fogo'],
    tags:['dragao','regen','multi','femea'], comportamento:'hidra', regen:2, multiAtaque:2, vulneravel:['Fogo'], capturavel:true,
    falaAtq:'Duas cabeças silvam e atacam ao mesmo tempo!' },
  { id:'medusa', nome:'Medusa', nivel:4, P:2, H:4, R:3, sexo:'F', sexoLabel:'Fêmea', aparencia:8,
    desc:'Mulher com cabelo de cobras. Olhar petrifica.',
    vantagens:['Petrificação'], desvantagens:['Espelho'],
    tags:['monstro','petrifica','femea'], comportamento:'medusa', capturavel:true,
    falaAtq:'A medusa ergue o olhar — não a encare!' },
  { id:'ogro', nome:'Ogra', nivel:4, P:5, H:1, R:4, sexo:'F', sexoLabel:'Fêmea', aparencia:3,
    desc:'Gigante bruta, estúpida e faminta. Grande clava.',
    vantagens:['Ataque de Área'], desvantagens:['Lento'],
    tags:['gigante','lento','femea'], comportamento:'bruto', initMod:-2, capturavel:true,
    falaAtq:'A ogra balança a clava com um grunhido faminto!' },
  // Nível 5
  { id:'troll', nome:'Troll', nivel:5, P:5, H:2, R:5, sexo:'F', sexoLabel:'Fêmea', aparencia:2,
    desc:'Pele verde, nariz comprido. Regenera membros — fogo e ácido param.',
    vantagens:['Regeneração Total'], desvantagens:['Vulnerável Ácido','Vulnerável Fogo'],
    tags:['gigante','regen','femea'], comportamento:'troll', regen:3, regenFromZero:true, vulneravel:['Fogo','Ácido'], capturavel:true,
    falaAtq:'A troll ri enquanto a carne se fecha sobre o ferimento!' },
  { id:'golem_pedra', nome:'Golem de Pedra', nivel:5, P:4, H:0, R:6, sexo:'F', sexoLabel:'Fêmea', aparencia:4,
    desc:'Construto mágico de pedra com forma feminina. Sem mente, sem medo.',
    vantagens:['Imune Mental','Dano Reduzido'], desvantagens:['Sem Mente'],
    tags:['construto','femea'], comportamento:'implacavel', reducaoFisico:0.5, capturavel:true,
    falaAtq:'A golem avança como um deslizamento de rocha.' },
  { id:'wyvern', nome:'Wyvern', nivel:5, P:4, H:4, R:4, sexo:'F', sexoLabel:'Fêmea', aparencia:6,
    desc:'Como dragão, 2 patas, ferrão venenoso na cauda.',
    vantagens:['Voo','Veneno'], desvantagens:['Vulnerável Fogo'],
    tags:['dragao','voo','veneno','femea'], comportamento:'predador', vulneravel:['Fogo'], capturavel:true,
    falaAtq:'A wyvern mergulha e tenta cravar o ferrão da cauda!' },
  { id:'espectro', nome:'Espectro', nivel:5, P:3, H:4, R:2, sexo:'F', sexoLabel:'Fêmea', aparencia:7,
    desc:'Morta-viva incorpórea. Toque drena vitalidade.',
    vantagens:['Incorporal','Drenar Vitalidade'], desvantagens:['Vulnerável Sagrado','Vulnerável Prata'],
    tags:['morto-vivo','incorporal','femea'], comportamento:'espectro', vulneravel:['Sagrado','Prata'], incorporal:true, capturavel:true,
    falaAtq:'A espectro passa através da armadura, gelando a alma!' },
  // Nível 6
  { id:'dragao_jovem', nome:'Dragão Jovem (Vermelha)', nivel:6, P:6, H:4, R:5, sexo:'F', sexoLabel:'Fêmea', aparencia:9,
    desc:'Escamas vermelhas, chifres, asas imensas. Sopro de fogo. Arrogante.',
    vantagens:['Voo','Sopro de Fogo','Escamas'], desvantagens:['Ponto Fraco Olhos'],
    tags:['dragao','chefe','fogo','femea'], comportamento:'dragao', soproCd:3, soproDano:4, capturavel:true,
    falaAtq:'A dragão jovem ri com desdém antes de atacar!',
    falaSopro:'A dragão jovem sopra um cone de chamas!' },
  { id:'gigante_nuvens', nome:'Gigante de Nuvens', nivel:6, P:7, H:2, R:6, sexo:'F', sexoLabel:'Fêmea', aparencia:7,
    desc:'Altura de 6m+, pele clara, roupas de nuvens, clava de carvalho.',
    vantagens:['Ataque de Área','Derrubar'], desvantagens:['Alvo Grande'],
    tags:['gigante','chefe','femea'], comportamento:'bruto', capturavel:true,
    falaAtq:'A gigante ergue a clava como quem esmaga formigas!' },
  { id:'beholder', nome:'Beholder', nivel:6, P:3, H:5, R:4, sexo:'F', sexoLabel:'Fêmea', aparencia:3,
    desc:'Esfera flutuante, olho central, raios mágicos. Forma reconhecida como fêmea pela matilha ocular.',
    vantagens:['Flutuação','Múltiplos Raios'], desvantagens:['Olho Central'],
    tags:['aberração','chefe','magico','femea'], comportamento:'beholder', multiAtaque:2, capturavel:true,
    falaAtq:'Olhos laterais brilham — raios mágicos disparam!' },
  { id:'lich', nome:'Lich', nivel:6, P:3, H:5, R:3, sexo:'F', sexoLabel:'Fêmea', aparencia:5,
    desc:'Maga imortal, esqueleto com restos de túnica. Imune a armas comuns (físico). Só magia, prata ou sagrado ferem de verdade.',
    vantagens:['Imune Mental','Comandar Mortos','Imune a Dano Comum'], desvantagens:['Filactério'],
    tags:['morto-vivo','chefe','mago','femea'], comportamento:'lich',
    imuneFisico:true, vulneravel:['Sagrado','Mágico','Prata','Fogo'], capturavel:true,
    falaAtq:'A lich sussurra um raio negro entre dedos ósseos.' },
  // Nível 7
  { id:'dragao_adulto', nome:'Dragão Adulto (Ouro)', nivel:7, P:8, H:5, R:7, sexo:'F', sexoLabel:'Fêmea', aparencia:10,
    desc:'Escamas douradas, imensa, inteligente e nobre. Cobiçosa.',
    vantagens:['Voo','Sopro Duplo','Escamas Douradas'], desvantagens:['Cobiça'],
    tags:['dragao','lendario','chefe','femea'], comportamento:'dragao', soproCd:3, soproDano:6, capturavel:true,
    falaAtq:'A dragão adulta fala com voz de trovão: “Insetos.”',
    falaSopro:'Chamas douradas varrem o campo de batalha!' },

  { id:'balor', nome:'Demônia (Balor)', nivel:7, P:9, H:4, R:7, sexo:'F', sexoLabel:'Fêmea', aparencia:8, afeto:5,
    desc:'Corpo gigante, asas de morcego, chifres, espada flamejante e chicote de fogo.',
    vantagens:['Voo','Aura de Fogo','Imune Fogo'], desvantagens:['Vulnerável Sagrado'],
    tags:['demonio','lendario','chefe','femea'], comportamento:'demonio', vulneravel:['Sagrado'], capturavel:true,
    falaAtq:'A Balor ri enquanto o chicote flamejante corta o ar!' },

  { id:'sucubo', nome:'Súcubo', nivel:5, P:4, H:5, R:3, sexo:'F', sexoLabel:'Fêmea', aparencia:10, afeto:15,
    desc:'Forma humana escultural e perfeita, pele impecável, cabelos negros ou dourados, olhos que hipnotizam. Asas, chifres e cauda quase sempre escondidos. Beleza avassaladora — parte da ameaça.',
    vantagens:['Sedução','Drenar Vida','Forma Alternativa','Carismático'], desvantagens:[],
    tags:['demonio','seducao','femea','sobrenatural'], comportamento:'sucubo', capturavel:true,
    falaAtq:'A súcubo sorri, a voz doce como mel envenenado.',
    falaFuga:'Ela some em uma nuvem de perfume e promessas quebradas.' },
  { id:'driade', nome:'Dríade', nivel:3, P:2, H:4, R:3, sexo:'F', sexoLabel:'Fêmea', aparencia:9, afeto:20,
    desc:'Corpo esguio e gracioso, pele com tom de casca ou folha, cabelos como ramos e folhas, olhos cor de musgo. Beleza etérea, cheiro de floresta úmida. Ligada a uma árvore sagrada.',
    vantagens:['Vinhas Prendedoras','Encantamento','Fusão com Árvore'], desvantagens:['Árvore Sagrada'],
    tags:['fey','natureza','femea','sobrenatural'], comportamento:'driade', capturavel:true,
    falaAtq:'A dríade ergue a mão e as vinhas respondem.' },
  { id:'ninfa_aguas', nome:'Ninfa das Águas', nivel:4, P:3, H:5, R:3, sexo:'F', sexoLabel:'Fêmea', aparencia:9, afeto:18,
    desc:'Pele translúcida como pérola, cabelos longos que se movem como água, olhos claros como lagoas profundas. Brilho suave ao redor do corpo.',
    vantagens:['Hipnose','Caminhar na Água','Visão Subaquática'], desvantagens:['Longe da Água'],
    tags:['fey','aquatico','femea','sobrenatural'], comportamento:'ninfa', capturavel:true,
    falaAtq:'A ninfa ri e a água ao redor treme com o riso dela.' },
  { id:'lamia', nome:'Lamia', nivel:4, P:4, H:4, R:3, sexo:'F', sexoLabel:'Fêmea', aparencia:9, afeto:10,
    desc:'Parte mulher de beleza sombria e cativante, parte serpente de escamas brilhantes. Olhos amendoados, voz doce. Sempre carrega punhal oculto.',
    vantagens:['Ilusão','Veneno','Escorregar sem som'], desvantagens:[],
    tags:['monstro','serpente','femea','sobrenatural'], comportamento:'lamia', capturavel:true,
    falaAtq:'A lamia sussurra uma história triste… até o punhal brilhar.' },
  { id:'aurora', nome:'Aurora', nivel:5, P:3, H:5, R:4, sexo:'F', sexoLabel:'Fêmea', aparencia:9, afeto:12,
    desc:'Corpo luminoso e translúcido, como luz e névoa. Cabelos como raios de sol, olhos de estrelas. Aparência muda conforme a luz do ambiente.',
    vantagens:['Brilho Cegante','Passo Etéreo','Incorporal Parcial'], desvantagens:['Escuridão Mágica'],
    tags:['elemental','luz','femea','sobrenatural'], comportamento:'aurora', incorporal:true, capturavel:true,
    falaAtq:'A Aurora brilha — olhar direto dói.' },
  { id:'aranea', nome:'Aranea', nivel:4, P:3, H:4, R:3, sexo:'F', sexoLabel:'Fêmea', aparencia:8, afeto:8,
    desc:'Traços exóticos, pele de ébano ou vermelho, íris dupla, dentes pontiagudos. Marcas de teia nas costas. Alterna forma humana e meio-aranha.',
    vantagens:['Teia','Escalar paredes','Veneno'], desvantagens:[],
    tags:['besta','teia','femea','sobrenatural'], comportamento:'aranea', capturavel:true,
    falaAtq:'A aranea sorri com demais dentes e a teia estala.' },
  { id:'bruxa_gelo', nome:'Bruxa do Gelo', nivel:5, P:3, H:4, R:4, sexo:'F', sexoLabel:'Fêmea', aparencia:8, afeto:6,
    desc:'Pele pálida como neve, cabelos brancos prateados, olhos azuis gelados, lábios vermelhos. Roupas de gelo e névoa. Beleza fria e distante.',
    vantagens:['Rajada de Gelo','Congelar','Caminhar no gelo'], desvantagens:['Vulnerável Fogo'],
    tags:['humanoide','gelo','femea','sobrenatural'], comportamento:'bruxa_gelo', vulneravel:['Fogo'], capturavel:true,
    falaAtq:'A bruxa do gelo fala e o ar queima de frio.' },
  { id:'ninfa_flores', nome:'Ninfa das Flores', nivel:2, P:2, H:5, R:2, sexo:'F', sexoLabel:'Fêmea', aparencia:8, afeto:25,
    desc:'Corpo delicado e pequeno, pele rosada, cabelos com flores sempre abertas. Perfume inebriante. Borboletas a seguem.',
    vantagens:['Poeira Alucinógena','Cura','Invisível na vegetação'], desvantagens:['Covarde'],
    tags:['fey','natureza','femea','sobrenatural','covarde'], comportamento:'ninfa_flores', capturavel:true,
    falaAtq:'A ninfa das flores ri e solta poeira dourada.',
    falaFuga:'Ela some entre as flores como se nunca tivesse estado ali.' },
  { id:'ifreeta', nome:'Ifreeta', nivel:5, P:5, H:3, R:4, sexo:'F', sexoLabel:'Fêmea', aparencia:7, afeto:8,
    desc:'Mulher forte e escultural, pele dourada e bronzeada, olhos como brasas, cabelos que parecem chamas. Beleza exótica e orgulhosa.',
    vantagens:['Aura de Fogo','Bola de Fogo','Imune Fogo'], desvantagens:['Vulnerável Água Mágica'],
    tags:['elemental','fogo','femea','sobrenatural'], comportamento:'ifreeta', vulneravel:['Água'], capturavel:true,
    falaAtq:'A ifreeta exige respeito — e o fogo obedece.' },
  { id:'harpia', nome:'Harpia', nivel:4, P:4, H:5, R:3, sexo:'F', sexoLabel:'Fêmea', aparencia:7, afeto:10,
    desc:'Rosto de mulher jovem e bela, corpo de ave de rapina. Asas de penas douradas ou escarlates, garras afiadas. Voz doce que vira grito agudo.',
    vantagens:['Voo','Canto Hipnótico','Investida'], desvantagens:['Frágil no Chão'],
    tags:['besta','voo','femea','sobrenatural','covarde'], comportamento:'harpia', capturavel:true,
    falaAtq:'A harpia canta do alto — a voz puxa o corpo para cima.',
    falaFuga:'Com um grito estridente, ela bate as asas e some no céu.' }
];

function getBestiarioById(id) {
  return BESTIARIO_VICTORY.find(m => m.id === id) || null;
}

function pickBestiario(nivelMin, nivelMax) {
  const pool = BESTIARIO_VICTORY.filter(m => m.nivel >= (nivelMin || 1) && m.nivel <= (nivelMax || 7));
  if (!pool.length) return BESTIARIO_VICTORY[0];
  return pool[Math.floor(Math.random() * pool.length)];
}

/** Converte entrada do bestiário (ou objeto parcial) em ficha de combate Victory */
function bestiarioParaInimigo(entry, index) {
  const base = typeof entry === 'string' ? getBestiarioById(entry) : entry;
  if (!base) {
    return {
      nome: 'Inimigo', P: 2, H: 2, R: 2,
      pvMax: 10, pvAtual: 10, vantagens: [], desvantagens: [],
      bestiarioId: null, comportamento: 'implacavel'
    };
  }
  const R = base.R || 1;
  const pv = (base.PV != null) ? base.PV : (R * 5);
  const stamp = Date.now().toString(36);
  return {
    id: 'temp_enemy_' + stamp + '_' + (index || 0) + '_' + (base.id || 'x'),
    nome: base.nome + (index > 0 ? ' #' + (index + 1) : ''),
    conceito: base.desc || '',
    P: base.P || 1,
    H: base.H || 0,
    R: R,
    PV: pv,
    pvMax: pv,
    pvAtual: pv,
    pmMax: Math.max(0, (base.H || 0) * 5),
    pmAtual: Math.max(0, (base.H || 0) * 5),
    vantagens: (base.vantagens || []).slice(),
    desvantagens: (base.desvantagens || []).slice(),
    pericias: [],
    maxPoints: 10,
    levelLabel: 'Nível ' + (base.nivel || 1),
    escala: (base.nivel || 1) >= 6 ? 'Sugoi' : 'Ningen',
    XP: 0,
    isTemp: true,
    bestiarioId: base.id || null,
    comportamento: base.comportamento || 'implacavel',
    tags: (base.tags || []).slice(),
    vulneravel: (base.vulneravel || []).slice(),
    regen: base.regen || 0,
    regenFromZero: !!base.regenFromZero,
    multiAtaque: base.multiAtaque || 1,
    initMod: base.initMod || 0,
    reducaoFisico: base.reducaoFisico || 0,
    incorporal: !!base.incorporal,
    imuneFisico: !!base.imuneFisico,
    soproCd: base.soproCd || 0,
    soproDano: base.soproDano || 0,
    _soproCooldown: 0,
    falaAtq: base.falaAtq || null,
    falaFuga: base.falaFuga || null,
    falaSopro: base.falaSopro || null,
    tipoDanoPadrao: (base.tags || []).includes('fogo') ? 'Fogo' : 'Pancada',
    sexo: base.sexo || 'F',
    sexoLabel: base.sexoLabel || 'Fêmea',
    aparencia: (typeof base.aparencia === 'number') ? base.aparencia : 5,
    afeto: (typeof base.afeto === 'number') ? base.afeto : 10,
    capturavel: base.capturavel !== false,
    _downedForCapture: false,
    isFemaleMonster: true,
    aparenciaDesc: base.desc || ''
  };
}

/* ===== [RESOLUCAO_XP] linhas originais 7231-7524 ===== */
/* ---------- Resolução e XP ---------- */
function resolveEncounter(isVictory) {
  if (eventResolved) {
    alert('Este encontro já foi resolvido. Gere um novo encontro.');
    return;
  }
  eventResolved = true;
  totalEncounters++;

  const resultLabel = isVictory ? '✅ Vitória' : '❌ Fracasso';

  let rewardMsg = '';
  if (isVictory) {
    sessionVictories++;
    accumulatedXp += 1;
    try { if (typeof verificarMarcosCampanha === 'function') verificarMarcosCampanha('vitoria'); } catch (e) {}
    // Concede recompensa ao inventário do grupo
    if (window.currentReward) {
      const nomes = concederRecompensaAoGrupo(window.currentReward);
      if (nomes.length > 0) {
        const r = window.currentReward;
        const rTxt = r.tipo === 'ouro' ? `${r.qtd} Tibar` : r.nome;
        rewardMsg = `\n🎁 Recompensa "${rTxt}" adicionada ao inventário de: ${nomes.join(', ')}`;
      } else {
        rewardMsg = '\n⚠️ Nenhum herói selecionado — recompensa não foi entregue. Selecione o grupo!';
      }
      window.currentReward = null;
    }
  } else {
    accumulatedXp = Math.max(0, accumulatedXp - 1);
    window.currentReward = null;
  }

  // Auto-salva no diário da campanha com o resultado (sem alerta duplicado)
  if (currentEventDataForLog) {
    saveCurrentEventToLog(resultLabel, true);
  }

  updateSessionDisplays();

  let falhaExtra = '';
  if (!isVictory) {
    try {
      if (typeof aplicarConsequenciaFalhaSolo === 'function') {
        const r = aplicarConsequenciaFalhaSolo({
          fonte: 'encontro',
          label: (currentEventDataForLog && currentEventDataForLog.title) || 'Encontro',
          heroIds: typeof getSelectedPartyIds === 'function' ? getSelectedPartyIds() : []
        });
        if (r && r.texto) falhaExtra = '\n\n' + r.texto;
      }
    } catch (e) {}
  }

  // Rival: vitória narrativa marca derrota; fuga só registra
  try {
    if (typeof currentEnemiesForBattle !== 'undefined' && currentEnemiesForBattle && currentEnemiesForBattle.length) {
      currentEnemiesForBattle.forEach(e => {
        if (e && e.isRival && e.rivalNome) {
          if (isVictory && typeof marcarRivalDerrotado === 'function') marcarRivalDerrotado(e.rivalNome);
        }
      });
    }
  } catch (e) {}

  if (isVictory) {
    alert(`✅ Vitória registrada! +1 XP acumulado.\nVitórias: ${sessionVictories}/${victoryThreshold}\nXP Acumulado: ${accumulatedXp}${rewardMsg}\n\nEvento salvo no diário da campanha.`);
  } else {
    alert(`❌ Fracasso registrado. -1 XP acumulado (mínimo 0).\nXP Acumulado agora: ${accumulatedXp}\n\nEvento salvo no diário da campanha.${falhaExtra}`);
  }

  // Verifica se atingiu a meta de vitórias
  if (sessionVictories >= victoryThreshold && accumulatedXp > 0) {
    bankXpToCharacters();
  }
}

function bankXpToCharacters() {
  const chars = getSelectedPartyChars();
  if (chars.length === 0) {
    alert(`🎉 Meta de ${victoryThreshold} vitórias atingida!\nXP acumulado (${accumulatedXp}) pronto para distribuição, mas nenhum herói selecionado. Selecione o grupo e clique em "Forçar Distribuição" se quiser.`);
    return;
  }

  const xpToGive = accumulatedXp;
  let list = getSaved();
  let updatedNames = [];

  chars.forEach(c => {
    const idx = list.findIndex(x => x.id === c.id);
    if (idx >= 0) {
      list[idx].XP = (list[idx].XP || 0) + xpToGive;
      const conv = convertXpToPoints(list[idx]);
      updatedNames.push(`${list[idx].nome} (+${xpToGive} XP → XP ${list[idx].XP})${conv.msg}`);
    }
  });

  setSaved(list);
  totalSessionXp += xpToGive;
  accumulatedXp = 0;
  sessionVictories = 0;
  victoryThreshold = 3 + Math.floor(Math.random() * 5); // nova meta 3-7

  updateSessionDisplays();

  alert(`🏆 META ATINGIDA!\n\n${xpToGive} XP distribuídos automaticamente para:\n${updatedNames.join('\n')}\n\nNova meta de vitórias: ${victoryThreshold}\n\nLembrete: a cada 10 XP o personagem ganha +1 ponto de personagem (aumenta o orçamento para gastar em atributos, vantagens e perícias).`);
}

/** Teste com meta: 2D6 + atributo ≥ meta (Victory; metas legadas 6/9/12/15 mapeáveis) */
function performSkillTestMeta(attr, meta) {
  // Converte metas legadas (1d6) para escala Victory 2D6 (~ +3)
  if (typeof meta === 'number' && meta <= 9) meta = meta + 3;
  else if (typeof meta === 'number' && meta <= 12) meta = meta + 2;

  const chars = getSelectedPartyChars();
  if (chars.length === 0) {
    alert('Selecione pelo menos um herói no grupo para realizar o teste.');
    return;
  }
  const hero = chars[0];
  const attrVal = hero[attr] || 0;
  const roll = rollExplodingD6();
  const total = roll.total + attrVal;
  const success = total >= meta;
  const explodeNote = roll.exploded ? ' 💥 EXPLODIU!' : '';
  const critNote = roll.critical ? ' ⭐' : (roll.fumble ? ' 💥' : '');
  const resultText = success
    ? `✅ SUCESSO! ${hero.nome} 2D6: ${roll.diceStr} + ${attr}${attrVal} = ${total}${critNote}\n(Meta ${meta} alcançada)`
    : `❌ FALHA! ${hero.nome} 2D6: ${roll.diceStr} + ${attr}${attrVal} = ${total}${critNote}\n(precisava ≥ ${meta})`;

  alert(`🎲 Teste Victory 2D6 + ${attr} (Meta ${meta}):\n${resultText}\n\nMarque Vitória ou Fracasso conforme o resultado e a narrativa.`);
}


/** Gera onda do bestiário e inicia combate (nível 1–7) */
function spawnSobrenaturaisWave() {
  const ids = ['sucubo','driade','ninfa_aguas','lamia','aurora','aranea','bruxa_gelo','ninfa_flores','ifreeta','harpia'];
  const m = getBestiarioById(ids[Math.floor(Math.random() * ids.length)]);
  if (!m) { alert('Criatura não encontrada.'); return; }
  currentEnemiesForBattle = [{ ...m, qtd: 1 }];
  if (confirm('✨ ' + m.nome + ' — Aparência ' + m.aparencia + '/10\n💗 Afeto base: ' + (m.afeto || 10) + '\n\n' + (m.desc || '').slice(0, 220) + '\n\nA beleza é parte da ameaça. Ir para a Arena?')) {
    startEncounterBattle();
  }
}

function spawnBestiarioWave(nivelMin, nivelMax, qtd) {
  nivelMin = nivelMin || 1;
  nivelMax = nivelMax || 2;
  qtd = qtd || 1 + Math.floor(Math.random() * 3);
  currentEnemiesForBattle = [];
  for (let i = 0; i < qtd; i++) {
    const m = pickBestiario(nivelMin, nivelMax);
    currentEnemiesForBattle.push({ ...m, qtd: 1 });
  }
  const nomes = currentEnemiesForBattle.map(e => e.nome).join(', ');
  if (confirm('Bestiário Victory:\\n' + nomes + '\\n\\nIr para a Arena?')) {
    startEncounterBattle();
  }
}

function startEncounterBattle() {
  if (!currentEnemiesForBattle || currentEnemiesForBattle.length === 0) {
    alert('Nenhum inimigo de combate disponível neste encontro.');
    return;
  }
  // Remove qualquer inimigo temporário antigo antes de criar novos
  cleanupTempEnemies();

  // Adiciona inimigos temporários à lista de fighters
  let list = getSaved();
  const stamp = Date.now();
  currentEnemiesForBattle.forEach((e, i) => {
    // Prefere ficha completa do bestiário Victory quando possível
    let card = null;
    try {
      if (typeof bestiarioParaInimigo === 'function') {
        const nomeLimpo = String(e.nome || '').replace(/\s*\(rival[^)]*\)\s*/gi, '').trim();
        const proto = (e.bestiarioId || e.id)
          ? (getBestiarioById(e.bestiarioId || e.id) || e)
          : (BESTIARIO_VICTORY.find(x => x.nome && nomeLimpo && x.nome.toLowerCase() === nomeLimpo.toLowerCase()) || e);
        card = bestiarioParaInimigo({ ...proto, ...e, nome: e.nome || proto.nome }, i);
      }
    } catch (err) {}
    if (!card) {
      const R = e.R || 2;
      card = {
        id: 'temp_enemy_' + stamp + '_' + i,
        nome: e.nome,
        P: e.P || 3, H: e.H || 2, R: R,
        pvMax: (e.PV != null ? e.PV : R * 5),
        pvAtual: (e.PV != null ? e.PV : R * 5),
        vantagens: e.vantagens || [],
        desvantagens: e.desvantagens || [],
        pericias: [],
        maxPoints: 10,
        levelLabel: 'Inimigo',
        escala: 'Ningen',
        XP: 0,
        isTemp: true,
        comportamento: e.comportamento || 'implacavel',
        sexo: e.sexo || 'F',
        sexoLabel: e.sexoLabel || 'Fêmea',
        aparencia: typeof e.aparencia === 'number' ? e.aparencia : 5,
        capturavel: e.capturavel !== false,
        isFemaleMonster: true
      };
    }
    card.id = 'temp_enemy_' + stamp + '_' + i;
    // Preserva flags de rival para onBattleEnd / captura
    if (e.isRival) {
      card.isRival = true;
      card.rivalNome = e.rivalNome || String(e.nome || '').replace(/\s*\(rival.*$/i, '').trim();
    }
    if (e.vantagens) card.vantagens = e.vantagens;
    list.push(card);
  });
  setSaved(list);

  // Vai para a tela de batalha
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const battleScreen = document.getElementById('screenBattle');
  if (battleScreen) battleScreen.classList.add('active');
  // Atualiza nav se existir
  try {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  } catch (e) {}
  loadFighters();
  window.scrollTo(0, 0);

  setTimeout(() => {
    const numE = Math.min(6, currentEnemiesForBattle.length);
    const numEnemiesEl = document.getElementById('numEnemies');
    if (numEnemiesEl) numEnemiesEl.value = numE;

    // Pré-seleciona heróis do grupo ativo
    let partyIds = [];
    try {
      partyIds = (typeof getSelectedPartyIds === 'function') ? getSelectedPartyIds() : [];
    } catch (e) {}
    if (partyIds.length > 0) {
      const numHeroesEl = document.getElementById('numHeroes');
      if (numHeroesEl) numHeroesEl.value = Math.min(6, partyIds.length);
    }

    if (typeof buildTeamSelects === 'function') buildTeamSelects();

    // Pré-seleciona heróis
    if (partyIds.length > 0) {
      for (let i = 0; i < Math.min(6, partyIds.length); i++) {
        const sel = document.getElementById('selectHero_' + i);
        if (!sel) continue;
        const idx = fightersList.findIndex(c => c.id === partyIds[i]);
        if (idx >= 0) sel.value = String(idx);
      }
    }

    // Pré-seleciona inimigos temporários
    for (let i = 0; i < numE; i++) {
      const sel = document.getElementById('selectEnemy_' + i);
      if (!sel) continue;
      const targetId = 'temp_enemy_' + stamp + '_' + i;
      const idx = fightersList.findIndex(c => c.id === targetId);
      if (idx >= 0) {
        sel.value = String(idx);
      } else if (currentEnemiesForBattle[i]) {
        const nomeBase = String(currentEnemiesForBattle[i].nome || '').split(' #')[0];
        for (let opt of sel.options) {
          if (opt.text.includes(nomeBase)) {
            sel.value = opt.value;
            break;
          }
        }
      }
    }
    alert('Arena carregada!\n\nHeróis do grupo e inimigos da masmorra/encontro foram pré-selecionados.\nConfira e clique em Iniciar Batalha.\n\nAo sair ou resetar, inimigos temporários são removidos.');
  }, 300);
}

function addChallengePoint(type, maxLimit) {
  if (type === 'succ') {
    currentSucessos++;
    document.getElementById('succCount').innerText = currentSucessos;
    if (currentSucessos >= maxLimit) {
      alert('🎉 Parabéns! O grupo superou o desafio com sucesso! Marque como Vitória.');
    }
  } else {
    currentFalhas++;
    document.getElementById('failCount').innerText = currentFalhas;
    if (currentFalhas >= maxLimit) {
      alert('⚠️ Cuidado! O grupo falhou no desafio. Marque como Fracasso.');
    }
  }
}

