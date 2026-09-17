/* ===== [TESTES_SOCIAIS] linhas originais 13766-13801 ===== */
/* ==================== TESTES SOCIAIS (Aparência) ====================
 * O modificador de Aparência de QUEM está testando entra em qualquer teste
 * social (persuasão, sedução, intimidação, negociação, primeira impressão...).
 * Fórmula Victory: 2D6 + H + Aparência (+ Humor ativo, se houver) ≥ ND.
 */
function rolarTesteSocial(charId, ndBase, label) {
  const list = getSaved();
  const raw = list.find(x => x.id === charId);
  if (!raw) { alert('Personagem não encontrado.'); return null; }
  const c = normalizeCharacter(raw);
  const nd = Number(ndBase) || 10;
  // Prefer 2D6 Victory; fallback explosivo
  const roll = typeof roll2D6 === 'function' ? roll2D6() : (typeof rollExplodingD6 === 'function' ? rollExplodingD6() : { total: 7, diceStr: '3+4=7', critical: false, fumble: false });
  const mods = getModificadoresSociais(c);
  const attrVal = c.H || 0;
  const total = roll.total + attrVal + mods.total;
  const ok = total >= nd && !roll.fumble;
  let linha = `2D6 [${roll.diceStr}] + H${attrVal} + Aparência ${mods.ap >= 0 ? '+' : ''}${mods.ap} (${mods.apLabel})`;
  if (mods.humor) linha += ` + Humor ${mods.humor >= 0 ? '+' : ''}${mods.humor}`;
  linha += ` = ${total} (ND ${nd})`;
  const msg = `🗣️ ${label || 'Teste Social'} — ${c.nome}\n${linha}${roll.critical ? ' ⭐' : ''}${roll.fumble ? ' 💥' : ''}\n\n${ok ? '✅ Sucesso!' : '❌ Falha.'}`;
  alert(msg);
  try { if (typeof addLog === 'function') addLog(`🗣️ <strong>${esc(c.nome)}</strong> — ${esc(label || 'Teste Social')}: ${total} vs ND ${nd} — ${ok ? '✅' : '❌'}`); } catch (e) {}
  return { ok, total, roll, ap: aparenciaBonus(c.aparencia), humorMod: mods.humor, mods };
}

/** Botão de atalho na ficha: pergunta a ND e o nome do teste, depois rola. */
function abrirTesteSocialUI(charId) {
  const ndStr = prompt('ND do teste social (Persuasão, Sedução, Intimidação, Negociação...)?', '10');
  if (ndStr === null) return;
  const nd = parseInt(ndStr, 10);
  if (isNaN(nd)) { alert('ND inválida.'); return; }
  const label = prompt('Nome do teste (opcional):', 'Teste Social') || 'Teste Social';
  rolarTesteSocial(charId, nd, label);
}

/* ===== [CENAS_SOCIAIS] linhas originais 13802-14049 ===== */
/* ==================== CENAS SOCIAIS GUIADAS (solo sem mestre) ====================
 * Árvore curta: 4 abordagens → teste 2D6+H+Aparência/Humor → 3 desfechos.
 * Uso: ficha do herói ou detalhe do NPC.
 */
const CENAS_SOCIAIS = {
  persuadir: {
    label: 'Persuadir', icon: '💬',
    desc: 'Argumentos, diplomacia, pedido educado.',
    ndMod: 0, custoOuro: 0,
    afetoOk: 10, afetoParcial: 4, afetoFail: -5,
    textoOk: 'A pessoa aceita o pedido e demonstra abertura.',
    textoParcial: 'Concorda em parte — exige um favor ou condição.',
    textoFail: 'Não se convence. A conversa esfria.'
  },
  intimidar: {
    label: 'Intimidar', icon: '⚔️',
    desc: 'Pressão, ameaça velada ou exibição de força.',
    ndMod: 1, custoOuro: 0,
    afetoOk: 6, afetoParcial: 2, afetoFail: -10,
    textoOk: 'Cede sob pressão — obedece, mas pode guardar rancor.',
    textoParcial: 'Hesita e oferece um meio-termo humilhante para si.',
    textoFail: 'Resiste ou reage com hostilidade.'
  },
  seduzir: {
    label: 'Seduzir', icon: '💋',
    desc: 'Charme, elogio e atração (Aparência pesa mais).',
    ndMod: 0, custoOuro: 0, bonusAparenciaExtra: true,
    afetoOk: 12, afetoParcial: 5, afetoFail: -6,
    textoOk: 'O charme funciona — interesse e simpatia aumentam.',
    textoParcial: 'Fica lisonjeada, mas mantém distância por agora.',
    textoFail: 'O gesto cai mal ou é interpretado como ofensa.'
  },
  subornar: {
    label: 'Subornar', icon: '💰',
    desc: 'Oferece ouro ou um presente valioso.',
    ndMod: -1, custoOuro: 25,
    afetoOk: 8, afetoParcial: 3, afetoFail: -8,
    textoOk: 'Aceita o suborno e cooperará nesta questão.',
    textoParcial: 'Aceita metade do valor e marca um favor futuro.',
    textoFail: 'Recusa ofendido — ou exige o dobro na próxima.'
  }
};

let _cenaSocialCtx = null; // { charId, npcId }

function ndCenaSocialParaNpc(npc, abordagemKey) {
  const base = 10;
  const af = npc && typeof npc.afeto === 'number' ? npc.afeto : 40;
  // Quanto maior o afeto, mais fácil
  let nd = base;
  if (af >= 80) nd -= 3;
  else if (af >= 60) nd -= 2;
  else if (af >= 40) nd -= 1;
  else if (af < 20) nd += 2;
  else if (af < 30) nd += 1;
  const ab = CENAS_SOCIAIS[abordagemKey];
  if (ab) nd += (ab.ndMod || 0);
  return Math.max(6, Math.min(16, nd));
}

/** Abre painel de cena social (herói obrigatório; NPC opcional). */
function abrirCenaSocialUI(charId, npcId) {
  try {
    if (!charId) {
      const h = typeof getNpcHeroSelecionado === 'function' ? getNpcHeroSelecionado() : null;
      charId = h && h.id;
    }
    if (!charId) {
      alert('Selecione um herói (ficha ou topo da tela de NPCs).');
      return;
    }
    const list = getSaved();
    const hero = list.find(c => c.id === charId);
    if (!hero) { alert('Herói não encontrado.'); return; }

    let npc = null;
    if (npcId && typeof getNpcs === 'function') {
      npc = getNpcs().find(n => n.id === npcId) || null;
    }
    _cenaSocialCtx = { charId, npcId: npc ? npc.id : null };

    const mods = typeof getModificadoresSociais === 'function' ? getModificadoresSociais(hero) : { total: 0, apLabel: '?' };
    const alvo = npc ? npc.nome : 'alguém na cena (genérico)';
    const ndPrev = npc ? ndCenaSocialParaNpc(npc, 'persuadir') : 10;

    let html = `
      <div id="cenaSocialOverlay" style="position:fixed;inset:0;background:rgba(0,0,0,0.65);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px;" onclick="if(event.target===this)fecharCenaSocialUI()">
        <div class="card" style="max-width:420px;width:100%;max-height:90vh;overflow-y:auto;border-color:#a855f7;" onclick="event.stopPropagation()">
          <h2 style="color:#a855f7;margin-bottom:8px;">🗣️ Cena Social Guiada</h2>
          <p style="font-size:0.85rem;color:var(--muted);margin-bottom:12px;">
            <strong>${esc(hero.nome)}</strong> → <strong>${esc(alvo)}</strong><br>
            Mods sociais: Aparência/Humor ${mods.total >= 0 ? '+' : ''}${mods.total}
            ${npc ? ` · ND base ~${ndPrev} (varia por abordagem)` : ' · ND padrão 10'}
          </p>
          <div style="display:grid;gap:8px;">
            ${Object.keys(CENAS_SOCIAIS).map(k => {
              const a = CENAS_SOCIAIS[k];
              return `<button class="btn" style="width:100%;text-align:left;padding:12px;" onclick="resolverCenaSocial('${k}')">
                <strong>${a.icon} ${a.label}</strong>${a.custoOuro ? ` <span style="color:#fbbf24;">(${a.custoOuro}T)</span>` : ''}
                <div style="font-size:0.78rem;font-weight:500;color:var(--muted);margin-top:4px;">${esc(a.desc)}</div>
              </button>`;
            }).join('')}
          </div>
          <button class="btn btn-outline" style="width:100%;margin-top:12px;" onclick="fecharCenaSocialUI()">Fechar</button>
        </div>
      </div>`;
    const old = document.getElementById('cenaSocialOverlay');
    if (old) old.remove();
    document.body.insertAdjacentHTML('beforeend', html);
  } catch (e) {
    console.warn('abrirCenaSocialUI', e);
    alert('Não foi possível abrir a cena social.');
  }
}

function fecharCenaSocialUI() {
  const el = document.getElementById('cenaSocialOverlay');
  if (el) el.remove();
  _cenaSocialCtx = null;
}

/**
 * Resolve a abordagem escolhida: teste → sucesso / parcial / falha.
 */
function resolverCenaSocial(abordagemKey) {
  try {
    const ab = CENAS_SOCIAIS[abordagemKey];
    if (!ab || !_cenaSocialCtx) return;
    const charId = _cenaSocialCtx.charId;
    const npcId = _cenaSocialCtx.npcId;

    let list = getSaved();
    let hIdx = list.findIndex(c => c.id === charId);
    if (hIdx < 0) { alert('Herói não encontrado.'); return; }
    let hero = normalizeCharacter(list[hIdx]);

    let npc = null;
    let npcList = null;
    let nIdx = -1;
    if (npcId && typeof getNpcs === 'function') {
      npcList = getNpcs();
      nIdx = npcList.findIndex(n => n.id === npcId);
      if (nIdx >= 0) npc = npcList[nIdx];
    }

    // Custo de suborno
    if (ab.custoOuro > 0) {
      if ((hero.ouro || 0) < ab.custoOuro) {
        alert(`${hero.nome} tem apenas ${hero.ouro || 0} Tibar. Precisa de ${ab.custoOuro}.`);
        return;
      }
      hero.ouro -= ab.custoOuro;
      list[hIdx] = hero;
      setSaved(list);
    }

    const nd = npc ? ndCenaSocialParaNpc(npc, abordagemKey) : (10 + (ab.ndMod || 0));
    const roll = typeof roll2D6 === 'function' ? roll2D6() : { total: 7, diceStr: '3+4=7', critical: false, fumble: false };
    const mods = typeof getModificadoresSociais === 'function' ? getModificadoresSociais(hero) : { total: 0, ap: 0, humor: 0, cicatriz: 0 };
    let extraAp = 0;
    if (ab.bonusAparenciaExtra && mods.ap) {
      extraAp = mods.ap; // seduzir: conta aparência de novo (peso dobrado)
    }
    const attrVal = hero.H || 0;
    const total = roll.total + attrVal + mods.total + extraAp;
    let nivel = 'falha';
    if (roll.fumble) nivel = 'falha';
    else if (roll.critical || total >= nd + 3) nivel = 'sucesso';
    else if (total >= nd) nivel = 'sucesso';
    else if (total >= nd - 2) nivel = 'parcial';
    else nivel = 'falha';

    let afetoDelta = 0;
    let narr = '';
    if (nivel === 'sucesso') {
      afetoDelta = ab.afetoOk;
      narr = ab.textoOk;
    } else if (nivel === 'parcial') {
      afetoDelta = ab.afetoParcial;
      narr = ab.textoParcial;
      if (abordagemKey === 'subornar' && ab.custoOuro) {
        // devolve metade em parcial
        const half = Math.floor(ab.custoOuro / 2);
        hero = normalizeCharacter(getSaved().find(c => c.id === charId) || hero);
        hero.ouro = (hero.ouro || 0) + half;
        list = getSaved();
        hIdx = list.findIndex(c => c.id === charId);
        if (hIdx >= 0) { list[hIdx] = hero; setSaved(list); }
        narr += ` (reembolso parcial: ${half} Tibar).`;
      }
    } else {
      afetoDelta = ab.afetoFail;
      narr = ab.textoFail;
    }

    if (npc && npcList && nIdx >= 0) {
      npc.afeto = Math.max(0, Math.min(100, (npc.afeto || 0) + afetoDelta));
      npcList[nIdx] = npc;
      setNpcs(npcList);
    }

    // Falha social grave pode gerar consequência leve (não sempre)
    if (nivel === 'falha' && Math.random() < 0.35 && typeof aplicarConsequenciaFalhaSolo === 'function') {
      try {
        aplicarConsequenciaFalhaSolo({
          fonte: 'cena_social',
          label: ab.label + (npc ? ' vs ' + npc.nome : ''),
          heroIds: [charId]
        });
      } catch (e) {}
    }

    const nivelTxt = nivel === 'sucesso' ? '✅ SUCESSO' : (nivel === 'parcial' ? '🟨 PARCIAL' : '❌ FALHA');
    let linha = `2D6 [${roll.diceStr}] + H${attrVal} + social ${mods.total >= 0 ? '+' : ''}${mods.total}`;
    if (extraAp) linha += ` + Aparência extra ${extraAp >= 0 ? '+' : ''}${extraAp} (sedução)`;
    linha += ` = ${total} vs ND ${nd}`;

    const msg =
      `${ab.icon} ${ab.label} — ${hero.nome}${npc ? ' → ' + npc.nome : ''}\n\n` +
      `${linha}${roll.critical ? ' ⭐' : ''}${roll.fumble ? ' 💥' : ''}\n\n` +
      `${nivelTxt}\n${narr}` +
      (npc ? `\n\nAfeto de ${npc.nome}: ${afetoDelta >= 0 ? '+' : ''}${afetoDelta} → ${npc.afeto}/100` : '') +
      (ab.custoOuro && nivel !== 'parcial' ? `\nOuro gasto: ${ab.custoOuro} Tibar` : '');

    fecharCenaSocialUI();
    alert(msg);

    try {
      if (typeof appendToCampaignLog === 'function') {
        appendToCampaignLog({
          type: 'cena_social',
          title: `${ab.icon} ${ab.label}: ${nivelTxt}`,
          text: `${hero.nome}${npc ? ' → ' + npc.nome : ''}. ${linha}. ${narr}`,
          time: new Date().toLocaleString('pt-BR')
        });
      }
    } catch (e) {}

    try {
      if (npcId && typeof openNpcDetail === 'function') openNpcDetail(npcId);
      if (typeof renderNpcList === 'function') renderNpcList();
    } catch (e) {}
  } catch (e) {
    console.warn('resolverCenaSocial', e);
    alert('Erro ao resolver a cena social.');
  }
}

