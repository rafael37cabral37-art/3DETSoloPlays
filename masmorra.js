/* ===== [GERADOR_MASMORRA] linhas originais 5928-6148 ===== */
/* ---------- Gerador de Masmorra (4–8 salas) ---------- */
const DUNGEON_ROOM_TYPES = [
  { tipo: 'entrada', icon: '🚪', titulo: 'Entrada / Vestíbulo', desc: 'Portal de acesso. Pode haver guarda ou armadilha simples.' },
  { tipo: 'corredor', icon: '↔️', titulo: 'Corredor', desc: 'Passagem estreita. Eco, umidade e possibilidade de emboscada.' },
  { tipo: 'sala_guarda', icon: '🛡️', titulo: 'Sala da Guarda', desc: 'Posto de vigilância. Inimigos em alerta.' },
  { tipo: 'armadilha', icon: '⚠️', titulo: 'Armadilha', desc: 'Mecanismo mortal ou ilusão. Exige teste de Percepção/Habilidade.' },
  { tipo: 'enigma', icon: '🧩', titulo: 'Enigma / Puzzle', desc: 'Inscrição antiga, alavancas ou espelhos. Teste de Saber ou Habilidade.' },
  { tipo: 'tesouro', icon: '💎', titulo: 'Câmara do Tesouro', desc: 'Baú, altar ou depósito. Pode estar protegido.' },
  { tipo: 'altar', icon: '🕯️', titulo: 'Altar / Santuário', desc: 'Local de culto. Bênção ou maldição possível.' },
  { tipo: 'prisao', icon: '🔒', titulo: 'Prisão / Celas', desc: 'Alguém (ou algo) está preso aqui.' },
  { tipo: 'laboratorio', icon: '⚗️', titulo: 'Laboratório / Oficina', desc: 'Poções, runas ou experimentos abandonados.' },
  { tipo: 'ninho', icon: '🦴', titulo: 'Ninho de Criaturas', desc: 'Cheiro forte. Ninho de bestas ou mortos-vivos.' },
  { tipo: 'biblioteca', icon: '📚', titulo: 'Biblioteca Ruinosa', desc: 'Tomos e mapas. Conhecimento e perigo de colapso.' },
  { tipo: 'chefe', icon: '👑', titulo: 'Câmara do Chefe', desc: 'Ameaça principal da masmorra. Combate decisivo.' }
];
const DUNGEON_COMPLICATIONS = [
  'Porta trancada (precisa de chave ou arrombamento)',
  'Piso instável / desmoronamento parcial',
  'Névoa densa (−1 em ataques à distância)',
  'Runas de alarme (inimigos alertados na próxima sala)',
  'Veneno no ar (teste de R ou status Envenenado)',
  'Escuridão total (precisa de luz)',
  'Eco mágico (magias podem falhar ou ecoar)',
  'Símbolos sagrados / profanos no chão',
  'Água até os joelhos',
  'Teias espessas / vegetação hostil'
];
const DUNGEON_LOOT = [
  { nome: 'Moedas antigas', valor: 25, desc: 'Tibar de eras passadas' },
  { nome: 'Poção de Cura Menor (1 uso)', valor: 25, desc: 'Frasco vermelho-claro', usavel: true, efeito: 'cura1d1' },
  { nome: 'Gema polida', valor: 40, desc: 'Pode ser vendida' },
  { nome: 'Chave de bronze', valor: 5, desc: 'Abre alguma porta nesta masmorra' },
  { nome: 'Pergaminho rasgado', valor: 15, desc: 'Pista ou magia menor' },
  { nome: 'Adaga cerimonial', valor: 30, desc: 'Arma leve de qualidade mediana' },
  { nome: 'Amuleto rachado', valor: 20, desc: 'Talismã quase sem poder' },
  { nome: 'Bolsa de Tibar', valor: 50, desc: 'Moedas encontradas no chão' }
];

function gerarMasmorra() {
  const nRooms = 4 + Math.floor(Math.random() * 5);
  const biomeKey = (document.getElementById('biomeSelect') || {}).value || 'masmorra';
  const threat = parseInt((document.getElementById('threatSelect') || {}).value || '2', 10);
  const rooms = [];
  const middleTypes = DUNGEON_ROOM_TYPES.filter(t => t.tipo !== 'entrada' && t.tipo !== 'chefe');
  rooms.push({ ...DUNGEON_ROOM_TYPES.find(t => t.tipo === 'entrada'), idx: 1 });
  for (let i = 0; i < nRooms - 2; i++) {
    const t = middleTypes[Math.floor(Math.random() * middleTypes.length)];
    rooms.push({ ...t, idx: i + 2 });
  }
  rooms.push({ ...DUNGEON_ROOM_TYPES.find(t => t.tipo === 'chefe'), idx: nRooms });

  const detailed = rooms.map((r) => {
    const hasCombat = r.tipo === 'sala_guarda' || r.tipo === 'ninho' || r.tipo === 'chefe' || (r.tipo === 'corredor' && Math.random() < 0.35);
    const hasTrap = r.tipo === 'armadilha' || (Math.random() < 0.25 && r.tipo !== 'entrada');
    const hasLoot = r.tipo === 'tesouro' || r.tipo === 'chefe' || (Math.random() < 0.3);
    const complication = Math.random() < 0.45 ? DUNGEON_COMPLICATIONS[Math.floor(Math.random() * DUNGEON_COMPLICATIONS.length)] : null;
    let teste = null;
    if (hasTrap || r.tipo === 'enigma' || r.tipo === 'armadilha') {
      const meta = 6 + threat + Math.floor(Math.random() * 2);
      teste = { attr: Math.random() < 0.5 ? 'H' : 'R', meta, desc: hasTrap ? 'Evitar ou desarmar armadilha' : 'Resolver o enigma' };
    }
    let inimigos = null;
    if (hasCombat) {
      const qtd = r.tipo === 'chefe' ? 1 : (1 + Math.floor(Math.random() * Math.min(3, threat)));
      const pBase = 2 + threat + (r.tipo === 'chefe' ? 3 : 0);
      inimigos = {
        nome: r.tipo === 'chefe' ? 'Guardião da Masmorra' : (r.tipo === 'ninho' ? 'Criatura do Ninho' : 'Sentinela'),
        P: pBase + Math.floor(Math.random() * 3),
        H: 2 + threat + Math.floor(Math.random() * 2),
        R: 2 + threat + Math.floor(Math.random() * 2),
        qtd
      };
    }
    let loot = null;
    if (hasLoot) {
      const L = DUNGEON_LOOT[Math.floor(Math.random() * DUNGEON_LOOT.length)];
      loot = { ...L, valor: Math.round(L.valor * (0.8 + threat * 0.2)) };
    }
    return { ...r, hasCombat, hasTrap, hasLoot, complication, teste, inimigos, loot };
  });

  const temas = [
    'Templo Afogado', 'Cripta do Rei Esquecido', 'Minas do Éter Negro',
    'Torre do Magus Louco', 'Catacumbas da Ordem Caída', 'Covil da Serpente de Pedra',
    'Labirinto de Espelhos', 'Fortaleza Subterrânea'
  ];
  const tema = temas[Math.floor(Math.random() * temas.length)];
  window.currentDungeon = { tema, rooms: detailed, biomeKey, threat, createdAt: Date.now() };
  renderDungeonPanel();
  try {
    if (typeof appendToCampaignLog === 'function') {
      appendToCampaignLog({ type: 'masmorra', title: '🏰 Masmorra: ' + tema, text: detailed.length + ' salas (ameaça ' + threat + ').', time: new Date().toLocaleString('pt-BR') });
    }
  } catch (e) {}
}

function renderDungeonPanel() {
  const d = window.currentDungeon;
  const body = document.getElementById('dungeonBody');
  const panel = document.getElementById('dungeonPanel');
  if (!d || !body || !panel) return;
  const detailed = d.rooms;
  body.innerHTML = '<div style="margin-bottom:12px;"><div style="font-size:1.2rem;font-weight:800;color:#c084fc;">' + esc(d.tema) + '</div><div style="font-size:0.85rem;color:var(--muted);">' + detailed.length + ' salas · Ameaça ' + d.threat + ' · Bioma: ' + esc(d.biomeKey) + '</div></div>' +
    detailed.map(function(r) {
      let html = '<div style="background:var(--bg-input);border:1px solid var(--border);border-radius:12px;padding:14px;margin-bottom:10px;">';
      html += '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;"><strong style="font-size:1.05rem;">' + r.icon + ' Sala ' + r.idx + ' — ' + esc(r.titulo) + '</strong><span style="font-size:0.75rem;color:var(--muted);">' + r.tipo + '</span></div>';
      html += '<div style="font-size:0.88rem;margin:6px 0;">' + esc(r.desc) + '</div>';
      if (r.complication) html += '<div style="font-size:0.8rem;color:var(--accent2);margin-bottom:4px;">⚠️ ' + esc(r.complication) + '</div>';
      if (r.teste) html += '<div style="font-size:0.82rem;margin:4px 0;">🎲 Teste: <strong>' + r.teste.attr + '</strong> ≥ ' + r.teste.meta + ' — ' + esc(r.teste.desc) + ' <button class="btn btn-sm" style="width:auto;padding:2px 8px;margin-left:6px;" onclick="rolarTesteMasmorra(' + r.teste.meta + ', \'' + r.teste.attr + '\', \'Sala ' + r.idx + '\')">Rolar</button></div>';
      if (r.inimigos) html += '<div style="font-size:0.82rem;margin:4px 0;">⚔️ Encontro: <strong>' + esc(r.inimigos.nome) + '</strong> ×' + r.inimigos.qtd + ' (P' + r.inimigos.P + ' H' + r.inimigos.H + ' R' + r.inimigos.R + ') <button class="btn btn-sm" style="width:auto;padding:2px 8px;margin-left:6px;background:#ef4444;" onclick="iniciarCombateSalaMasmorra(' + (r.idx - 1) + ')">Combate</button></div>';
      if (r.loot) html += '<div style="font-size:0.82rem;margin:4px 0;color:var(--success);">💎 Saque: <strong>' + esc(r.loot.nome) + '</strong> (' + r.loot.valor + ' Tibar) <button class="btn btn-sm btn-success" style="width:auto;padding:2px 8px;margin-left:6px;" onclick="coletarLootMasmorra(' + (r.idx - 1) + ')">Coletar</button></div>';
      html += '</div>';
      return html;
    }).join('') +
    '<div class="rule-badge" style="font-size:0.78rem;">Explore sala a sala. Use o Oráculo para detalhes. Combates usam o sistema de batalha.</div>';
  panel.classList.remove('hidden');
  panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function rolarTesteMasmorra(meta, attr, label) {
  const chars = typeof getSelectedPartyChars === 'function' ? getSelectedPartyChars() : [];
  const hero = chars[0];
  if (!hero) { alert('Selecione um herói no grupo.'); return; }
  const roll = rollExplodingD6();
  const attrVal = hero[attr] || 0;
  const total = roll.total + attrVal;
  const ok = total >= meta;
  alert(label + '\n' + hero.nome + ': 1d6 ' + roll.diceStr + ' + ' + attr + attrVal + ' = ' + total + (roll.exploded ? ' 💥' : '') + '\nPrecisava ≥ ' + meta + '\n' + (ok ? '✅ Sucesso!' : '❌ Falha!'));
}

function iniciarCombateSalaMasmorra(roomIndex) {
  const d = window.currentDungeon;
  if (!d || !d.rooms[roomIndex] || !d.rooms[roomIndex].inimigos) {
    alert('Sem inimigos nesta sala.');
    return;
  }
  const inim = d.rooms[roomIndex].inimigos;
  // IMPORTANTE: usar a variável lexical currentEnemiesForBattle (não só window.*)
  currentEnemiesForBattle = [];
  for (let i = 0; i < (inim.qtd || 1); i++) {
    currentEnemiesForBattle.push({
      nome: inim.nome + ((inim.qtd || 1) > 1 ? ' #' + (i + 1) : ''),
      P: inim.P || 3,
      H: inim.H || 2,
      R: inim.R || 2,
      isTemp: true
    });
  }
  if (typeof startEncounterBattle === 'function') {
    startEncounterBattle();
  } else {
    alert('Combate: ' + inim.nome + ' ×' + (inim.qtd || 1) + '\nP' + inim.P + ' H' + inim.H + ' R' + inim.R + '\nUse a tela de Combate em Grupo.');
  }
}

function coletarLootMasmorra(roomIndex) {
  const d = window.currentDungeon;
  if (!d || !d.rooms[roomIndex] || !d.rooms[roomIndex].loot) { alert('Nada para coletar.'); return; }
  const loot = d.rooms[roomIndex].loot;
  const chars = typeof getSelectedPartyChars === 'function' ? getSelectedPartyChars() : [];
  if (!chars.length) { alert('Selecione um herói no grupo.'); return; }
  const hero = chars[0];
  const rew = { id: 'loot_' + Date.now().toString(36), nome: loot.nome, tipo: loot.usavel ? 'consumivel' : 'misc', valor: loot.valor || 10, qtd: 1, usavel: !!loot.usavel, efeito: loot.efeito || null, desc: loot.desc || loot.nome };
  if (typeof concederRecompensaAoPersonagem === 'function') {
    concederRecompensaAoPersonagem(hero.id, rew);
  } else {
    let list = getSaved();
    const idx = list.findIndex(c => c.id === hero.id);
    if (idx >= 0) {
      const c = normalizeCharacter(list[idx]);
      c.inventario = c.inventario || [];
      c.inventario.push(rew);
      list[idx] = c;
      setSaved(list);
    }
  }
  d.rooms[roomIndex].loot = null;
  alert('💎 ' + hero.nome + ' coletou «' + loot.nome + '»!');
  renderDungeonPanel();
}


function generateProceduralEvent() {
  // Ação local consome 1 período (exceto durante viagem — o dia de viagem é contado à parte)
  if (typeof consumePeriodForAction === 'function') consumePeriodForAction();

  // Missão ativa: cada encontro gasta 1 dia do prazo
  if (currentAdventureHook && currentAdventureHook.status === 'ativo') {
    const failed = spendHookDay('Encontro gerado');
    if (failed) return; // prazo esgotou — não gera encontro
  }

  currentSucessos = 0;
  currentFalhas = 0;
  eventResolved = false;
  currentEnemiesForBattle = [];

  // Rivais recorrentes: chance de substituir o encontro aleatório
  try {
    if (typeof tentarEncontroRivalAutomatico === 'function' && tentarEncontroRivalAutomatico()) {
      return;
    }
  } catch (e) {}

  const biomeKey = document.getElementById('biomeSelect').value;
  const threatLevel = parseInt(document.getElementById('threatSelect').value);
  const biomeData = BIOMAS[biomeKey];
  const party = getSelectedPartyNames();

  // ===== FORMATO NOVO (lista unificada de encontros) =====
  if (biomeData && Array.isArray(biomeData.encontros) && biomeData.encontros.length > 0) {
    generateNewFormatEvent(biomeKey, biomeData, party, threatLevel);
    return;
  }

  // Bioma sem lista unificada de encontros
  alert('Este bioma não tem encontros no formato atual. Escolha outro local no mapa/seleção.');
  return;
}


