/* ===== [DESTINO_DERROTA] linhas originais 621-1223 ===== */
/* ==================== DESTINO DA DERROTA (TABELA 1D6) ====================
 * Regra fixa: quando um herói cai a 0 PV em combate, o destino NUNCA é
 * narrado livremente pelo mestre/IA. Rola-se 1D6 e o resultado é aplicado
 * EXATAMENTE como definido abaixo — a rolagem é o destino, independente
 * de qual inimigo (humano, monstro, NPC ou criatura mágica) causou a queda.
 * A derrota nunca é definitiva de imediato: sempre há um caminho de volta.
 */
const FINAIS_DERROTA = {
  1: 'Acorda e Continua',
  2: 'Morto, mas não Esquecido',
  3: 'Prisioneiro, Tempo Limitado',
  4: 'Cativeiro de Prazer',
  5: 'Escravidão',
  6: 'Morte e Dívida Perpétua'
};

/** Preço de referência para "comprar a liberdade" de um PJ escravizado (nível + valor do equipamento). */
function calcPrecoEscravidaoPJ(c) {
  const nivel = Math.max(1, Math.floor((c.XP || 0) / 10) + 1);
  const equipVal = (c.inventario || []).reduce((s, i) => s + ((i.valor || 0) * (i.qtd || 1)), 0);
  return Math.max(20, nivel * 15 + Math.floor(equipVal * 0.2));
}

/** Converte um personagem para o status ESCRAVO (usado pelos Finais 5 e 6, e pela fuga malsucedida do Final 3). */
function converterParaEscravidaoPJ(c, dividaExtra) {
  const preco = calcPrecoEscravidaoPJ(c);
  const divida = dividaExtra || 0;
  c.status = 'escravo';
  c.escravidao = { tipo: divida > 0 ? 'divida' : 'venda', preco, divida, ownerId: null };
  delete c.cativeiro;
  return preco;
}

/** Processado a cada novo dia (chamado por advancePeriod): conta os dias de cativeiro e reseta a tentativa de fuga diária. */
function processarCativeirosNoDia() {
  let list = getSaved();
  let changed = false;
  const avisos = [];
  list.forEach((raw, i) => {
    if (raw.status !== 'prisioneiro' || !raw.cativeiro) return;
    const c = normalizeCharacter(raw);
    c.cativeiro.tentativaHoje = false;
    c.cativeiro.diasRestantes = (c.cativeiro.diasRestantes || 1) - 1;
    if (c.cativeiro.diasRestantes <= 0) {
      converterParaEscravidaoPJ(c);
      avisos.push(`⛓️ ${c.nome}: o prazo do cativeiro esgotou sem fuga — vendido(a) como escravo(a) (Final 5).`);
    } else {
      avisos.push(`🔓 ${c.nome}: ainda prisioneiro(a) — restam ${c.cativeiro.diasRestantes} dia(s) para tentar fugir (ND 14).`);
    }
    list[i] = c;
    changed = true;
  });
  if (changed) setSaved(list);
  return avisos;
}

/** Tentativa de fuga do cativeiro do Final 3 (uma vez por dia de jogo). Teste Victory: 2D6 + H ≥ ND 14. */
function tentarFugaPrisioneiro(charId) {
  let list = getSaved();
  const idx = list.findIndex(c => c.id === charId);
  if (idx < 0) return;
  const c = normalizeCharacter(list[idx]);
  if (c.status !== 'prisioneiro' || !c.cativeiro) { alert('Este personagem não está prisioneiro no momento.'); return; }
  if (c.cativeiro.tentativaHoje) { alert('Já tentou fugir hoje. Avance para o próximo dia (Descanso Longo) para tentar de novo.'); return; }
  const roll = typeof rollExplodingD6 === 'function' ? rollExplodingD6() : { total: 2 + Math.floor(Math.random() * 11) };
  const attrVal = c.H || 0;
  const total = roll.total + attrVal;
  const ok = total >= 14 && !roll.fumble;
  c.cativeiro.tentativaHoje = true;
  let msg = `🔓 Tentativa de Fuga — ${c.nome}\n2D6 + H${attrVal} = ${total}${roll.critical ? ' ⭐' : ''}${roll.fumble ? ' 💥' : ''} (ND 14)\n\n`;
  if (ok) {
    msg += `✅ Sucesso! ${c.nome} escapa do cativeiro e está livre novamente.`;
    c.status = 'normal';
    if ((c.pvAtual || 0) <= 0) c.pvAtual = Math.max(1, Math.floor((c.pvMax || 1) / 2));
    delete c.cativeiro;
  } else {
    msg += `❌ Falha. A fuga não deu certo desta vez. Restam ${c.cativeiro.diasRestantes} dia(s) antes de virar escravidão (Final 5). Pode tentar de novo amanhã.`;
  }
  list[idx] = c;
  setSaved(list);
  alert(msg);
  try { openView(charId); } catch (e) {}
}

/** Outro personagem jogador compra a liberdade de um PJ com status ESCRAVO (usa o 1º herói do grupo selecionado como comprador). */
function comprarLiberdadePJ(charId) {
  let list = getSaved();
  const idx = list.findIndex(c => c.id === charId);
  if (idx < 0) return;
  const c = normalizeCharacter(list[idx]);
  if (c.status !== 'escravo' || !c.escravidao) { alert('Este personagem não está escravizado.'); return; }
  const party = typeof getSelectedPartyChars === 'function' ? getSelectedPartyChars() : [];
  const buyer = party.find(p => p.id !== charId);
  if (!buyer) { alert('Selecione, no grupo, outro personagem para pagar pela liberdade.'); return; }
  const custo = c.escravidao.divida > 0 ? c.escravidao.divida : c.escravidao.preco;
  const bIdx = list.findIndex(x => x.id === buyer.id);
  if (bIdx < 0) return;
  const b = normalizeCharacter(list[bIdx]);
  if ((b.ouro || 0) < custo) { alert(`${b.nome} tem apenas ${b.ouro || 0} Tibar. Custo da liberdade: ${custo} Tibar.`); return; }
  if (!confirm(`${b.nome} vai pagar ${custo} Tibar para libertar ${c.nome}?`)) return;
  b.ouro -= custo;
  c.status = 'normal';
  if ((c.pvAtual || 0) <= 0) c.pvAtual = Math.max(1, Math.floor((c.pvMax || 1) / 2));
  delete c.escravidao;
  list[idx] = c;
  list[bIdx] = b;
  setSaved(list);
  try {
    if (typeof appendToCampaignLog === 'function') {
      appendToCampaignLog({ type: 'liberdade', title: `🔓 ${c.nome} foi libertado(a)`, text: `${b.nome} pagou ${custo} Tibar pela liberdade de ${c.nome}.`, time: new Date().toLocaleString('pt-BR') });
    }
  } catch (e) {}
  alert(`🔓 ${c.nome} está livre! ${b.nome} pagou ${custo} Tibar.`);
  try { openView(charId); } catch (e) {}
}

/** Credita ouro a um personagem — se ele estiver com dívida de escravidão (Final 6), o valor abate a dívida primeiro. */
function creditarOuroComDivida(c, valor) {
  if (!valor) return;
  if (c.status === 'escravo' && c.escravidao && c.escravidao.divida > 0) {
    const abate = Math.min(c.escravidao.divida, valor);
    c.escravidao.divida -= abate;
    const sobra = valor - abate;
    if (sobra > 0) c.ouro = (c.ouro || 0) + sobra;
    if (c.escravidao.divida <= 0) {
      c.status = 'normal';
      delete c.escravidao;
      try { alert(`🔓 ${c.nome} quitou a dívida e recuperou a liberdade plena!`); } catch (e) {}
    }
    return;
  }
  c.ouro = (c.ouro || 0) + valor;
}

/** Chamado quando um personagem (herói) cai a 0 PV em combate.
 *  NÃO narra o destino — apenas rola 1D6 e aplica o resultado exato da tabela,
 *  independentemente de qual inimigo causou a derrota. */
function rolarFinalDerrota(charId) {
  let list = getSaved();
  const idx = list.findIndex(c => c.id === charId);
  if (idx < 0) return null;
  const c = normalizeCharacter(list[idx]);
  const d6 = 1 + Math.floor(Math.random() * 6);
  let narrativa = '', reversao = '';

  switch (d6) {
    case 1:
      c.pvAtual = 1;
      narrativa = `${c.nome} acorda horas depois, sozinho(a) no local do combate. Fraco(a), com 1 PV restante, mas vivo(a) e livre. Todos os itens continuam com você.`;
      reversao = 'Nenhuma ação necessária — já está livre. Basta descansar para recuperar PV normalmente.';
      break;
    case 2:
      c.status = 'morto';
      c.pvAtual = 0;
      delete c.cativeiro; delete c.escravidao;
      applyDeathConsequences(c, 'derrota_d6');
      narrativa = `${c.nome} morre. O corpo é encontrado e levado até um templo ou posto de cura.`;
      reversao = 'Bloqueado(a) para jogar até ser ressuscitado(a). Outro personagem pode pagar a ressurreição no templo (botão "⛪ Ressuscitar no Templo") ou cumprir uma missão sagrada. Sem dívida após reviver.';
      break;
    case 3: {
      const dias = 1 + Math.floor(Math.random() * 6) + 1; // 1D6+1
      c.status = 'prisioneiro';
      c.cativeiro = { diasRestantes: dias, diasTotais: dias, tentativaHoje: false, capturadoEm: Date.now() };
      narrativa = `${c.nome} é capturado(a), consciente ou inconsciente, e levado(a) para um cativeiro. Restam ${dias} dia(s) antes de ser vendido(a) como escravo(a) (se inimigo humanoide) ou devorado(a) (se inimigo monstro).`;
      reversao = `Uma vez por dia de jogo, use o botão "🔓 Tentar Fuga" na ficha (teste de Habilidade contra ND 14). Se os ${dias} dia(s) esgotarem sem sucesso, o destino vira automaticamente o Final 5 (Escravidão).`;
      break;
    }
    case 4: {
      const noites = 1 + Math.floor(Math.random() * 6);
      c.pvAtual = Math.max(1, Math.floor((c.pvMax || 1) / 2));
      c.statusEffects = Array.isArray(c.statusEffects) ? c.statusEffects.filter(s => s.id !== 'trauma_cativeiro') : [];
      c.statusEffects.push({ id: 'trauma_cativeiro', nome: 'Trauma (Cativeiro de Prazer)', bonus: '-1 em todos os testes de Habilidade', expires: Date.now() + 7 * 24 * 60 * 60 * 1000 });
      narrativa = `${c.nome} é levado(a) inconsciente para um local de luxo e cativeiro (Casa da Luz Vermelha ou do Véu Prateado) por ${noites} noite(s), usado(a) como entretenimento de nobres e clientes ricos. Depois é libertado(a), abalado(a) mas com os itens devolvidos.`;
      reversao = 'Adquire o status TRAUMA (−1 em todos os testes de Habilidade) por 1 semana de jogo. Some automaticamente ao descansar 1 dia inteiro em um templo (Cura Divina/Santuário). Sem dívida.';
      break;
    }
    case 5: {
      const preco = converterParaEscravidaoPJ(c);
      narrativa = `${c.nome} é vendido(a) como escravo(a). O nome entra na Lista de Escravos. Preço de referência: ${preco} Tibar.`;
      reversao = `Bloqueado(a) para jogar até que OUTRO personagem jogador o(a) compre e liberte (botão "🔓 Comprar e Libertar" na ficha, ${preco} Tibar). Sem dívida além do preço de compra.`;
      break;
    }
    case 6: {
      const precoBase = calcPrecoEscravidaoPJ(c);
      const divida = precoBase * 2;
      converterParaEscravidaoPJ(c, divida);
      c.pvAtual = Math.max(1, Math.floor((c.pvMax || 1) / 2));
      applyDeathConsequences(c, 'derrota_d6');
      narrativa = `${c.nome} morre. Alguém encontra o corpo, o arrasta até a cidade e paga a ressurreição no templo — mas não de graça. Revive imediatamente, mas deve uma fortuna: ${divida} Tibar.`;
      reversao = `Entra na Lista de Escravos com dívida de ${divida} Tibar. Pode jogar normalmente, mas todo ouro ganho em recompensas e vendas é usado automaticamente para abater a dívida até quitá-la. Só recupera a liberdade plena ao zerar o valor (ou outro PJ pode pagar tudo de uma vez em "🔓 Comprar e Libertar").`;
      break;
    }
  }

  list[idx] = c;
  setSaved(list);

  try {
    if (typeof appendToCampaignLog === 'function') {
      appendToCampaignLog({
        type: 'derrota',
        title: `🎲${d6} — ${FINAIS_DERROTA[d6]} (${c.nome})`,
        text: `${narrativa}\n\nComo reverter: ${reversao}`,
        time: new Date().toLocaleString('pt-BR')
      });
    }
  } catch (e) {}

  alert(`Rola 1D6 para determinar seu final de derrota...\n\n🎲 Resultado: ${d6} — ${FINAIS_DERROTA[d6]}\n\n${narrativa}\n\n📌 Como reverter: ${reversao}`);
  try { if (typeof addLog === 'function') addLog(`🎲 <strong>${esc(c.nome)}</strong> caiu em combate — Final ${d6}: <strong>${esc(FINAIS_DERROTA[d6])}</strong>.`); } catch (e) {}
  try { openView(charId); } catch (e) {}

  return { roll: d6, titulo: FINAIS_DERROTA[d6], narrativa, reversao, char: c };
}

function advancePeriod(manual) {
  if (timeState.traveling && !manual) {
    // durante viagem o avanço de dia é controlado por travelDayAction
    return;
  }
  timeState.periodIndex++;
  let newDay = false;
  if (timeState.periodIndex >= PERIODS.length) {
    timeState.periodIndex = 0;
    timeState.day++;
    newDay = true;
  }
  saveTimeState();
  updateTimeUI();
  let humorAvisos = [];
  try { humorAvisos = processarEtapaAparencia(); } catch (e) {}
  if (newDay) {
    try { if (typeof verificarMarcosCampanha === 'function') verificarMarcosCampanha('dia'); } catch (e) {}
    try { processarSedeVampiricaNoDia(); } catch (e) {}
    const logs = processPartyHunger();
    const vampWarn = [];
    try {
      (getSaved() || []).forEach(c => {
        if (isVampireChar(c) && c.vampiro && (c.vampiro.sede || 0) >= 3) {
          vampWarn.push(`${c.nome}: Sede de Sangue ${c.vampiro.sede}/5 — precisa alimentar-se!`);
        }
      });
    } catch (e) {}
    let cativeiroWarn = [];
    try { cativeiroWarn = processarCativeirosNoDia(); } catch (e) {}
    let luzWarn = [];
    try { luzWarn = processarParceriasLuzNoDia() || []; } catch (e) {}
    const all = logs.concat(vampWarn).concat(cativeiroWarn).concat(luzWarn).concat(humorAvisos);
    if (all.length) {
      alert('🌅 Amanhece o Dia ' + timeState.day + '\n\n' + all.join('\n'));
    }
  } else if (humorAvisos.length) {
    alert('🕐 ' + (PERIODS[timeState.periodIndex] || '') + '\n\n' + humorAvisos.join('\n'));
  }
}

function getTravelDays(from, to) {
  if (from === to) return 0;
  const row = TRAVEL_DAYS[from];
  if (row && row[to] != null) return row[to];
  // fallback: 3 dias
  return 3;
}

function syncLocationUI() {
  const sel = document.getElementById('biomeSelect');
  if (sel && timeState.location) sel.value = timeState.location;
  window.lastMapLocation = timeState.location;
}

/** Select de bioma: se mudar e não estiver viajando, inicia viagem */
function onBiomeSelectChange() {
  const sel = document.getElementById('biomeSelect');
  if (!sel) return;
  const dest = sel.value;
  if (dest === timeState.location) return;
  if (timeState.traveling) {
    // reverte select
    sel.value = timeState.location;
    alert('Você já está em viagem. Conclua ou cancele a viagem atual.');
    return;
  }
  // inicia fluxo de viagem
  requestTravel(dest);
  // select volta até chegar
  sel.value = timeState.location;
}

function requestTravel(destKey) {
  if (destKey === timeState.location) {
    setMapMarker(destKey);
    return;
  }
  if (timeState.traveling) {
    alert('Já há uma viagem em andamento.');
    return;
  }
  const days = getTravelDays(timeState.location, destKey);
  const fromL = getLocationLabel(timeState.location);
  const toL = getLocationLabel(destKey);
  const msg = `Viajar de ${fromL} para ${toL}?\n\n⏱ ${days} dia(s) de viagem.\n\nOK = viajar dia a dia (encontros/mantimentos no caminho)\nCancelar = desistir`;
  if (!confirm(msg)) return;
  startTravel(destKey, days);
  closeWorldMap();
  // ir para tela de encontros se não estiver
  goTo('encounters');
}

function startTravel(destKey, days) {
  timeState.traveling = true;
  timeState.travelDest = destKey;
  timeState.travelDaysLeft = days;
  timeState.travelTotal = days;
  saveTimeState();
  updateTimeUI();
}

function cancelTravel() {
  if (!confirm('Cancelar a viagem e permanecer em ' + getLocationLabel(timeState.location) + '?')) return;
  timeState.traveling = false;
  timeState.travelDest = null;
  timeState.travelDaysLeft = 0;
  timeState.travelTotal = 0;
  saveTimeState();
  updateTimeUI();
}

function arriveAtDestination() {
  timeState.location = timeState.travelDest;
  timeState.traveling = false;
  timeState.travelDest = null;
  timeState.travelDaysLeft = 0;
  timeState.travelTotal = 0;
  timeState.periodIndex = 0; // chega de manhã
  syncLocationUI();
  saveTimeState();
  updateTimeUI();
  setMapMarker(timeState.location);
  alert('Chegada em ' + getLocationLabel(timeState.location) + '!\nÉ a Manhã do Dia ' + timeState.day + '.');
}

/** Sorteia tipo de evento de viagem (cadeia). */
function sortearTipoEventoViagem() {
  const table = [
    { id: 'encontro', w: 30 },
    { id: 'teste_caminho', w: 22 },
    { id: 'clima', w: 15 },
    { id: 'achado', w: 12 },
    { id: 'rival', w: 8 },
    { id: 'tranquilo', w: 13 }
  ];
  // Se não há rivais, redistribui peso de rival
  try {
    if (typeof getRivaisAtivos === 'function' && !getRivaisAtivos().length) {
      table[4].w = 0;
      table[0].w += 4;
      table[5].w += 4;
    }
  } catch (e) {}
  const total = table.reduce((s, x) => s + x.w, 0);
  let r = Math.random() * total;
  for (const row of table) {
    r -= row.w;
    if (r <= 0) return row.id;
  }
  return 'tranquilo';
}

/**
 * Resolve um evento de caminho sem necessariamente ir à tela de combate.
 * Retorna texto do que aconteceu.
 */
function resolverEventoCadeiaViagem(tipo) {
  const chars = typeof getSelectedPartyChars === 'function' ? getSelectedPartyChars() : [];
  const hero = chars[0] || null;
  const dest = getLocationLabel(timeState.travelDest || timeState.location);
  let texto = '';

  if (tipo === 'encontro') {
    texto = '⚔️ O caminho se estreita — um encontro se forma à frente.';
    try {
      // Não chama finishTravelDay aqui — o caller decide
      if (typeof generateProceduralEvent === 'function') {
        // generateProceduralEvent consome período e pode gastar dia de missão;
        // em viagem preferimos não consumir período extra: setar flag temporária
        const was = timeState.traveling;
        generateProceduralEvent();
        timeState.traveling = was;
      }
    } catch (e) {
      texto += ' (Não foi possível gerar o encontro detalhado.)';
    }
    return texto;
  }

  if (tipo === 'rival') {
    try {
      const rivais = typeof getRivaisAtivos === 'function' ? getRivaisAtivos() : [];
      if (rivais.length && typeof montarEncontroRival === 'function') {
        const r = rivais[Math.floor(Math.random() * rivais.length)];
        montarEncontroRival(r, true);
        return '🗡️ O rival «' + r.nome + '» aparece na estrada!';
      }
    } catch (e) {}
    return '🗡️ Você sente que está sendo seguido, mas perde o rastro.';
  }

  if (tipo === 'teste_caminho') {
    const testes = [
      { nome: 'Travessia perigosa', attr: 'H', nd: 11, ok: 'Passa com cuidado.', fail: 'Escorrega — 1d3 de dano no guia.' },
      { nome: 'Orientação', attr: 'H', nd: 10, ok: 'Mantém o rumo certo.', fail: 'Desvio: +0 dias, mas gasta 1 mantimento extra no grupo.' },
      { nome: 'Resistência à marcha', attr: 'R', nd: 11, ok: 'O grupo aguenta o ritmo.', fail: 'Exaustão — próximo descanso curto recupera menos.' },
      { nome: 'Negociação com patrulha', attr: 'H', nd: 12, ok: 'Liberados sem incidente.', fail: 'Pedágio: 10 Tibar (se tiver).' }
    ];
    const t = testes[Math.floor(Math.random() * testes.length)];
    const attrVal = hero ? (Number(hero[t.attr]) || 0) : 1;
    const roll = typeof roll2D6 === 'function' ? roll2D6() : { total: 7, diceStr: '3+4', critical: false, fumble: false };
    const mods = (t.attr === 'H' && hero && typeof getModificadoresSociais === 'function' && t.nome.indexOf('Negociação') >= 0)
      ? getModificadoresSociais(hero).total : 0;
    const total = roll.total + attrVal + mods;
    const ok = total >= t.nd && !roll.fumble;
    texto = `🎲 ${t.nome}: 2D6 [${roll.diceStr}] + ${t.attr}${attrVal}${mods ? ' +' + mods : ''} = ${total} vs ND ${t.nd} → ${ok ? '✅' : '❌'}\n`;
    if (ok) {
      texto += t.ok;
    } else {
      texto += t.fail;
      if (t.nome.indexOf('Travessia') >= 0 && hero && typeof getSaved === 'function') {
        try {
          const list = getSaved();
          const idx = list.findIndex(c => c.id === hero.id);
          if (idx >= 0) {
            const c = normalizeCharacter(list[idx]);
            const dmg = 1 + Math.floor(Math.random() * 3);
            c.pvAtual = Math.max(1, (c.pvAtual || c.pvMax || 10) - dmg);
            list[idx] = c;
            setSaved(list);
            texto += ` (−${dmg} PV em ${c.nome}).`;
          }
        } catch (e) {}
      }
      if (t.nome.indexOf('Orientação') >= 0 && chars.length) {
        chars.forEach(ch => { try { if (typeof addMantimentos === 'function') addMantimentos(ch.id, -1); } catch (e) {} });
      }
      if (t.nome.indexOf('Negociação') >= 0 && hero) {
        try {
          const list = getSaved();
          const idx = list.findIndex(c => c.id === hero.id);
          if (idx >= 0 && (list[idx].ouro || 0) >= 10) {
            list[idx].ouro -= 10;
            setSaved(list);
            texto += ` (−10 Tibar).`;
          }
        } catch (e) {}
      }
    }
    return texto;
  }

  if (tipo === 'clima') {
    const climas = [
      { t: 'Tempestade no caminho', e: 'O grupo se abriga; avança mesmo assim, molhado e irritado.' },
      { t: 'Calor / frio extremo', e: 'Marcha lenta. Sem efeito mecânico grave hoje.' },
      { t: 'Neblina densa', e: 'Visibilidade ruim — ND de próximos testes de Percepção sobe (narrativo).' },
      { t: 'Céu limpo', e: 'Boa marcha. O moral sobe um pouco.' }
    ];
    const c = climas[Math.floor(Math.random() * climas.length)];
    return `🌤️ ${c.t}: ${c.e}`;
  }

  if (tipo === 'achado') {
    const achados = [
      { nome: 'Bolsa esquecida', ouro: 8 },
      { nome: 'Ervas de caminho', mant: 2 },
      { nome: 'Mapa rasgado', ouro: 0, txt: 'Um mapa parcial — anote no diário.' },
      { nome: 'Poço limpo', mant: 1, txt: 'Água fresca e descanso breve.' }
    ];
    const a = achados[Math.floor(Math.random() * achados.length)];
    let msg = `💎 Achado: ${a.nome}.`;
    if (a.ouro && hero) {
      try {
        const list = getSaved();
        const idx = list.findIndex(c => c.id === hero.id);
        if (idx >= 0) {
          list[idx].ouro = (list[idx].ouro || 0) + a.ouro;
          setSaved(list);
          msg += ` +${a.ouro} Tibar.`;
        }
      } catch (e) {}
    }
    if (a.mant && chars.length) {
      chars.forEach(ch => { try { if (typeof addMantimentos === 'function') addMantimentos(ch.id, a.mant); } catch (e) {} });
      msg += ` +${a.mant} mantimento(s) no grupo.`;
    }
    if (a.tip) msg += ' ' + a.tip;
    return msg;
  }

  // tranquilo
  return `🌿 Dia tranquilo a caminho de ${dest}. A estrada colabora.`;
}

function travelDayAction(kind) {
  if (!timeState.traveling) {
    alert('Você não está em viagem.');
    return;
  }

  if (kind === 'cadeia' || kind === 'auto') {
    const tipo = sortearTipoEventoViagem();
    const diaNum = (timeState.travelTotal || 0) - (timeState.travelDaysLeft || 0) + 1;
    const texto = resolverEventoCadeiaViagem(tipo);
    const line = `Dia ${diaNum}/${timeState.travelTotal || '?'} · ${texto}`;
    try {
      const logEl = document.getElementById('travelChainLog');
      if (logEl) {
        logEl.innerHTML = `<div style="padding:8px;background:var(--bg-input);border-radius:8px;border:1px solid var(--border);">${esc(line)}</div>` +
          (logEl.innerHTML || '');
      }
    } catch (e) {}
    try {
      if (typeof appendToCampaignLog === 'function') {
        appendToCampaignLog({
          type: 'viagem',
          title: '🚶 Viagem dia ' + diaNum,
          text: texto,
          time: new Date().toLocaleString('pt-BR')
        });
      }
    } catch (e) {}
    // Encontro/rival já abriram UI — ainda assim o dia avança
    if (tipo !== 'encontro' && tipo !== 'rival') {
      alert('🚶 ' + line);
    } else {
      // Aviso curto: o dia de viagem será contado
      try { alert('🚶 Evento de caminho!\n\n' + texto + '\n\n(O dia de viagem será registrado.)'); } catch (e) {}
    }
    finishTravelDay();
    return;
  }

  if (kind === 'encontro') {
    try { generateProceduralEvent(); } catch (e) {}
    finishTravelDay();
    return;
  }

  if (kind === 'mantimentos') {
    const chars = typeof getSelectedPartyChars === 'function' ? getSelectedPartyChars() : [];
    const hero = chars[0];
    const attrVal = hero ? (hero.H || 0) : 1;
    const roll = typeof roll2D6 === 'function' ? roll2D6()
      : (typeof rollExplodingD6 === 'function' ? rollExplodingD6()
        : { total: 7, diceStr: '3+4', critical: false, fumble: false });
    const total = roll.total + attrVal;
    const success = total >= 11 && !roll.fumble;
    let msg = `🧺 Procurar Mantimentos\n2D6 [${roll.diceStr}] + H${attrVal} = ${total}${roll.critical ? ' ⭐' : ''} (ND 11)\n`;
    if (success) {
      const qtd = 1 + Math.floor(Math.random() * 3);
      msg += `✅ Sucesso! Encontrou ${qtd} mantimento(s).`;
      if (hero && typeof addMantimentos === 'function') addMantimentos(hero.id, qtd);
      if (qtd >= 3 && chars.length > 1) {
        chars.slice(1).forEach(ch => { try { addMantimentos(ch.id, 1); } catch (e) {} });
        msg += ' (+1 para cada companheiro)';
      }
    } else {
      msg += '❌ Nada útil. O dia passa mesmo assim.';
    }
    alert(msg);
    finishTravelDay();
  }
}

function finishTravelDay() {
  if (!timeState.traveling) return;
  timeState.travelDaysLeft = Math.max(0, (timeState.travelDaysLeft || 1) - 1);
  // avança 1 dia completo (viagem consome o dia inteiro) + fome + humor
  timeState.day++;
  try { if (typeof verificarMarcosCampanha === 'function') verificarMarcosCampanha('dia'); } catch (e) {}
  timeState.periodIndex = 0;
  let logs = [];
  try { logs = processPartyHunger() || []; } catch (e) {}
  try {
    if (typeof processarEtapaAparencia === 'function') {
      // viagem = dia inteiro ≈ 4 etapas de humor/convívio
      for (let i = 0; i < 4; i++) processarEtapaAparencia();
    }
  } catch (e) {}
  if (timeState.travelDaysLeft <= 0) {
    arriveAtDestination();
    if (logs.length) alert('Fome no caminho:\n' + logs.join('\n'));
  } else {
    saveTimeState();
    updateTimeUI();
    if (logs.length) alert('Dia de viagem — refeição:\n' + logs.join('\n'));
  }
}

/** Ações locais consomem 1 período */
function consumePeriodForAction() {
  if (timeState.traveling) return; // viagem tem fluxo próprio
  advancePeriod(false);
}

/* ===== [CONSEQ_FALHA] linhas originais 10396-10467 ===== */
/* ==================== CONSEQUÊNCIAS DE FALHA PERSISTENTES (solo) ====================
 * Módulo isolado. Chamado só em falhas (missão NPC, encontro, gancho, derrota na arena).
 * Tipos: cicatriz narrativa, rival/inimigo recorrente, rumor na cidade, dívida leve.
 * Storage: KEYS.falhas = { lista: [], rivais: [] }
 */
function getFalhasState() {
  try {
    const st = storeGetJSON(KEYS.falhas, null);
    if (!st || typeof st !== 'object') return { lista: [], rivais: [] };
    return {
      lista: Array.isArray(st.lista) ? st.lista : [],
      rivais: Array.isArray(st.rivais) ? st.rivais : []
    };
  } catch (e) {
    return { lista: [], rivais: [] };
  }
}
function setFalhasState(st) {
  try {
    storeSet(KEYS.falhas, {
      lista: (st && st.lista) || [],
      rivais: (st && st.rivais) || []
    });
  } catch (e) {}
}

const FALHA_CICATRIZES = [
  { nome: 'Orgulho ferido', desc: '−1 em testes sociais até descanso longo.', social: -1, dias: 1 },
  { nome: 'Hesitação', desc: '−1 em testes de Habilidade na próxima cena de risco.', hab: -1, dias: 1 },
  { nome: 'Cicatriz visível', desc: 'Marca permanente na história; −1 Aparência social até curar no templo.', social: -1, dias: 3 },
  { nome: 'Sono leve', desc: 'Descanso curto recupera 1 a menos de PM até descanso longo.', dias: 1 },
  { nome: 'Desconfiança', desc: 'NPCs começam com −5 afeto em interações até o próximo sucesso de missão.', dias: 2 }
];
const FALHA_RUMORES = [
  'Dizem que o grupo falhou quando mais precisavam dele.',
  'Mercadores comentam que esses aventureiros não são de confiança.',
  'A taverna murmura sobre uma derrota constrangedora.',
  'Alguém espalhou que o grupo deve ouro e favores.',
  'A Igreja observa o grupo com mais rigor após o fracasso.'
];
/** Nomes de rivais — todas femininas */
const FALHA_RIVAIS_NOMES = [
  'Irmã Cinder', 'Lira a Mutilada', 'Madame Thorn', 'A Sombra do Mercado',
  'Capitã Vex', 'Inquisidora Hale', 'Dente-de-Ferro', 'A Coletora Cinzenta',
  'Lady Ashen', 'Serafina a Pálida', 'Mora Cruel', 'Ysolde das Correntes',
  'Bruxa de Valefor', 'Caçadora Nyssa', 'Rainha-de-Ossos', 'Vespera Nóctua'
];

/**
 * PLANILHA DE RIVAIS (todas femininas) — dados prontos para update futuro.
 * Uso atual: sorteio enriquecido ao criar rival.
 * Update em espera: UI de planilha, edição manual, import/export CSV, tiers.
 */
const RIVAIS_PLANILHA_F = [
  { nome: 'Capitã Vex', P: 4, H: 3, R: 3, classe: 'Guerreira', aparencia: 6, personalidade: 'Disciplinada e vingativa', motivacao: 'Honra manchada pelo grupo', local: 'fronteira' },
  { nome: 'Irmã Cinder', P: 3, H: 2, R: 4, classe: 'Clériga', aparencia: 5, personalidade: 'Zelosa e inflexível', motivacao: 'Hereges devem se confessar', local: 'templo' },
  { nome: 'Lira a Mutilada', P: 3, H: 4, R: 2, classe: 'Ladina', aparencia: 4, personalidade: 'Sarcástica e paciente', motivacao: 'Dívida de sangue no submundo', local: 'cidade' },
  { nome: 'Madame Thorn', P: 2, H: 4, R: 3, classe: 'Maga', aparencia: 7, personalidade: 'Elegante e cruel', motivacao: 'Segredo roubado / ritual interrompido', local: 'ruinas' },
  { nome: 'A Sombra do Mercado', P: 3, H: 4, R: 2, classe: 'Ladina', aparencia: 6, personalidade: 'Silenciosa', motivacao: 'Contrato de eliminação', local: 'cidade' },
  { nome: 'Inquisidora Hale', P: 3, H: 3, R: 3, classe: 'Clériga', aparencia: 5, personalidade: 'Fria e metódica', motivacao: 'Inquérito oficial', local: 'cidade' },
  { nome: 'Dente-de-Ferro', P: 5, H: 2, R: 4, classe: 'Bárbara', aparencia: 3, personalidade: 'Brutal', motivacao: 'Desafio de força', local: 'montanha' },
  { nome: 'A Coletora Cinzenta', P: 2, H: 3, R: 3, classe: 'Maga', aparencia: 4, personalidade: 'Calma e ameaçadora', motivacao: 'Cobrança de favor antigo', local: 'esgotos' },
  { nome: 'Lady Ashen', P: 3, H: 3, R: 3, classe: 'Nobre guerreira', aparencia: 8, personalidade: 'Orgulho aristocrático', motivacao: 'Insulto público', local: 'cidade' },
  { nome: 'Serafina a Pálida', P: 4, H: 3, R: 3, classe: 'Vampira', aparencia: 9, personalidade: 'Sedutora e letal', motivacao: 'Sangue / desrespeito à Casa', local: 'noite' },
  { nome: 'Mora Cruel', P: 4, H: 2, R: 4, classe: 'Bárbara', aparencia: 4, personalidade: 'Implacável', motivacao: 'Caçada esportiva', local: 'floresta' },
  { nome: 'Ysolde das Correntes', P: 2, H: 4, R: 2, classe: 'Ladina', aparencia: 6, personalidade: 'Manipuladora', motivacao: 'Chantagem e correntes', local: 'submundo' },
  { nome: 'Bruxa de Valefor', P: 3, H: 3, R: 2, classe: 'Maga', aparencia: 5, personalidade: 'Mística e rancorosa', motivacao: 'Maldição interrompida', local: 'ruinas' },
  { nome: 'Caçadora Nyssa', P: 4, H: 4, R: 2, classe: 'Ranger', aparencia: 6, personalidade: 'Fria e precisa', motivacao: 'Contrato de caça', local: 'floresta' },
  { nome: 'Rainha-de-Ossos', P: 5, H: 2, R: 4, classe: 'Necromante', aparencia: 3, personalidade: 'Majestosa e terrível', motivacao: 'Relíquia profanada', local: 'masmorra' },
  { nome: 'Vespera Nóctua', P: 3, H: 3, R: 3, classe: 'Druida sombria', aparencia: 7, personalidade: 'Melancólica', motivacao: 'Equilíbrio quebrado', local: 'floresta' }
];

