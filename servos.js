/* ===== [XP_SERVOS] linhas originais 13042-13091 ===== */
/* ==================== XP E EVOLUÇÃO DE SERVOS ====================
 * A cada 10 XP o servo ganha +1 ponto livre.
 * Pontos livres podem subir P, H, R ou Aparência (máx 10).
 */
function addServoXP(servoId, amount, reason) {
  const list = typeof getServos === 'function' ? getServos() : [];
  const idx = list.findIndex(x => x.id === servoId);
  if (idx < 0) return { pontos: 0 };
  const s = list[idx];
  s.XP = (s.XP || 0) + (amount || 0);
  let pontos = 0;
  while ((s.XP || 0) >= 10) {
    s.XP -= 10;
    s.pontosLivres = (s.pontosLivres || 0) + 1;
    s.maxPoints = (s.maxPoints || 0) + 1;
    pontos++;
  }
  list[idx] = s;
  setServos(list);
  if (pontos > 0 && typeof pushServoLog === 'function') {
    pushServoLog(`⭐ <strong>${esc(s.nome)}</strong> ganhou ${pontos} ponto(s) de evolução${reason ? ' (' + reason + ')' : ''}. Livres: ${s.pontosLivres}.`);
  }
  return { pontos, xp: s.XP, livres: s.pontosLivres };
}

function gastarPontoServo(servoId, attr) {
  const list = getServos();
  const idx = list.findIndex(x => x.id === servoId);
  if (idx < 0) return;
  const s = list[idx];
  if ((s.pontosLivres || 0) < 1) {
    alert('Sem pontos livres. Acumule 10 XP no servo.');
    return;
  }
  const key = attr === 'aparencia' ? 'aparencia' : attr;
  const cur = Number(s[key]) || 0;
  if (cur >= 10) { alert('Atributo já no máximo (10).'); return; }
  s[key] = cur + 1;
  s.pontosLivres -= 1;
  list[idx] = s;
  setServos(list);
  if (typeof pushServoLog === 'function') {
    pushServoLog(`📈 <strong>${esc(s.nome)}</strong> subiu ${key.toUpperCase()} para ${s[key]} (−1 ponto livre).`);
  }
  if (typeof openServoDetail === 'function') openServoDetail(servoId);
  try { renderLuzServoWorkPanel(); } catch (e) {}
  try { renderServoOwnedList(); } catch (e) {}
}


/* ===== [CAPTURA_ESCRAVIZACAO] linhas originais 13092-13626 ===== */
/* ==================== CAPTURA E ESCRAVIZAÇÃO DE INIMIGOS ====================
 * Expansão do sistema de Servos Contratuais.
 * Fluxo: derrota (0 PV) → CAPTURADO (1 PV, tentativas de fuga) →
 *   registrar como escravo (taxa) | vender no mercado (−20%) | libertar.
 * Armazenamento: KEYS.capturados
 */
function getCapturados() {
  try {
    const arr = storeGetJSON(KEYS.capturados, []);
    return Array.isArray(arr) ? arr : [];
  } catch (e) { return []; }
}
function setCapturados(list) {
  storeSet(KEYS.capturados, Array.isArray(list) ? list : []);
}

/** Taxa de registro baseada no Poder (e flag de boss) */
function calcTaxaRegistro(cap) {
  if (!cap) return 20;
  if (cap.isBoss) return Math.max(500, 250 + (Number(cap.P) || 0) * 50);
  const p = Number(cap.P) || 0;
  if (p <= 3) return 20;
  if (p <= 6) return 50;
  if (p <= 8) return 100;
  if (p <= 10) return 250;
  return 500;
}

/** Infere tipo de servo a partir dos atributos do capturado */
function inferirTipoServoDeCapturado(cap) {
  const p = Number(cap.P) || 0;
  const h = Number(cap.H) || 0;
  const r = Number(cap.R) || 0;
  const apar = Number(cap.aparencia) || 5;
  if (apar >= 7) return 'formoso';
  if (p >= 3 || r >= 3 || (p + r) >= (h + 2)) return 'combate';
  return 'empregado';
}

/**
 * Chamado ao terminar a batalha em grupo.
 * Vitória: +1 XP de sessão e +1 XP em cada herói vivo (não capturado).
 */
function onBattleEnd(victory) {
  try {
    if (victory) {
      if (typeof sessionVictories === 'number') sessionVictories++;
      if (typeof accumulatedXp === 'number') accumulatedXp += 1;
      if (typeof updateSessionDisplays === 'function') updateSessionDisplays();
      try { if (typeof verificarMarcosCampanha === 'function') verificarMarcosCampanha('vitoria'); } catch (e) {}
      const list = typeof getSaved === 'function' ? getSaved() : [];
      const alive = (typeof heroes !== 'undefined' ? heroes : []).filter(h => h && h.isHero && (h.pvAtual || 0) > 0 && !h._captured);
      alive.forEach(h => {
        if (!h.id) return;
        const idx = list.findIndex(c => c.id === h.id);
        if (idx < 0) return;
        const c = normalizeCharacter(list[idx]);
        c.XP = (c.XP || 0) + 1;
        if (typeof convertXpToPoints === 'function') convertXpToPoints(c);
        // sincroniza PV/PM do fim da luta
        if (typeof h.pvAtual === 'number') c.pvAtual = h.pvAtual;
        if (typeof h.pmAtual === 'number') c.pmAtual = h.pmAtual;
        list[idx] = c;
      });
      if (list.length) setSaved(list);
      // Rivais derrotados na arena
      try {
        const foes = (typeof enemies !== 'undefined' ? enemies : []);
        foes.forEach(e => {
          if (e && (e.isRival || e.rivalNome) && (e.pvAtual <= 0 || e._downedForCapture)) {
            const nome = e.rivalNome || String(e.nome || '').replace(/\s*\(rival.*$/, '');
            if (nome && typeof marcarRivalDerrotado === 'function') marcarRivalDerrotado(nome);
          }
        });
      } catch (e) {}
      try {
        if (typeof appendToCampaignLog === 'function') {
          appendToCampaignLog({
            type: 'batalha',
            title: '⚔️ Vitória na Arena',
            text: 'Grupo venceu o combate. +1 XP (sessão e heróis vivos).',
            time: new Date().toLocaleString('pt-BR')
          });
        }
      } catch (e) {}
    } else {
      try {
        if (typeof appendToCampaignLog === 'function') {
          appendToCampaignLog({
            type: 'batalha',
            title: '☠️ Derrota na Arena',
            text: 'O grupo caiu. Finais de derrota foram aplicados aos heróis abatidos.',
            time: new Date().toLocaleString('pt-BR')
          });
        }
      } catch (e) {}
      try {
        if (typeof aplicarConsequenciaFalhaSolo === 'function') {
          const ids = (typeof heroes !== 'undefined' ? heroes : []).filter(h => h && h.isHero && h.id).map(h => h.id);
          aplicarConsequenciaFalhaSolo({ fonte: 'batalha', label: 'Derrota na Arena', heroIds: ids });
        }
      } catch (e) {}
    }
  } catch (e) {
    console.warn('onBattleEnd', e);
  }
}

/**
 * Painel pós-batalha: lista inimigos a 0 PV para capturar ou matar.
 */
function showBattleCapturePanel() {
  const panel = document.getElementById('battleCapturePanel');
  const listEl = document.getElementById('battleCaptureList');
  const ownerSel = document.getElementById('captureOwnerSelect');
  if (!panel || !listEl) return;

  const downed = (typeof enemies !== 'undefined' ? enemies : []).filter(e =>
    (e.pvAtual <= 0 || e._downedForCapture) && !e._captured && !e._executed
  );
  if (!downed.length) {
    panel.classList.add('hidden');
    return;
  }

  // Preenche donos = heróis vivos da batalha + salvos
  if (ownerSel) {
    const saved = typeof getSaved === 'function' ? getSaved() : [];
    const heroOpts = (typeof heroes !== 'undefined' ? heroes : []).filter(h => h.pvAtual > 0);
    const ids = new Set();
    let html = '';
    heroOpts.forEach(h => {
      if (h.id) { ids.add(h.id); html += `<option value="${h.id}">${esc(h.nome)} (herói da batalha)</option>`; }
    });
    saved.filter(c => !c.isTemp && !ids.has(c.id)).forEach(c => {
      html += `<option value="${c.id}">${esc(c.nome)} (${c.ouro || 0} Tibar)</option>`;
    });
    if (!html) html = '<option value="">— nenhum herói —</option>';
    ownerSel.innerHTML = html;
  }

  listEl.innerHTML = downed.map(e => {
    const taxa = calcTaxaRegistro({ P: e.P, isBoss: !!(e.isBoss || (e.conceito || '').toLowerCase().includes('chefe') || (e.conceito || '').toLowerCase().includes('boss')) });
    const precoEst = typeof calcServoPreco === 'function'
      ? calcServoPreco({ P: e.P, H: e.H, R: e.R, aparencia: e.aparencia || 5, afeto: 5, pericias: e.pericias || [], tipo: inferirTipoServoDeCapturado(e) })
      : 100;
    return `
      <div class="char-card" style="cursor:default; margin-bottom:8px;" id="capRow_${e.uid}">
        <div>
          <div style="font-weight:800;">${esc(e.nome)} ${e.sexo === 'F' || e.isFemaleMonster ? '<span style="color:#f9a8d4;font-size:0.8rem;">♀ Fêmea</span>' : ''}</div>
          <div style="font-size:0.85rem; color:var(--muted);">P${e.P} H${e.H} R${e.R} · PV máx ${e.pvMax}
            · ✨ Aparência <strong>${typeof e.aparencia === 'number' ? e.aparencia : 5}/10</strong>
            · 💗 Afeto <strong>${typeof e.afeto === 'number' ? e.afeto : 10}</strong>
            ${e.isBoss || (e.tags||[]).includes('chefe') ? ' · <strong style="color:var(--accent2)">CHEFE</strong>' : ''}
          </div>
          <div style="font-size:0.8rem; color:var(--muted);">Taxa registro: ~${taxa} Tibar · Valor mercado est.: ~${precoEst} Tibar</div>
        </div>
        <div style="display:flex; flex-direction:column; gap:6px;">
          <button class="btn btn-sm" style="background:linear-gradient(135deg,#fbbf24,#b45309);color:#000;" onclick="capturarInimigoBatalha('${e.uid}')">🫱 Capturar</button>
          <button class="btn btn-sm btn-danger" onclick="executarInimigoBatalha('${e.uid}')">❌ Matar</button>
        </div>
      </div>`;
  }).join('');

  panel.classList.remove('hidden');
  panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  addLog(`🫱 ${downed.length} inimigo(s) derrotado(s) podem ser capturados ou eliminados.`);
}

function executarInimigoBatalha(uid) {
  const e = (typeof enemies !== 'undefined' ? enemies : []).find(x => x.uid === uid);
  if (!e) return;
  e._executed = true;
  e._captured = false;
  e.pvAtual = 0;
  const row = document.getElementById('capRow_' + uid);
  if (row) row.innerHTML = `<div style="color:var(--accent2); font-weight:700;">❌ ${esc(e.nome)} eliminado.</div>`;
  const ov = document.getElementById('overlay_' + uid);
  if (ov) { ov.textContent = 'FOI DE BASE'; ov.className = 'overlay-status overlay-defeat'; }
  addLog(`💀 <strong>${esc(e.nome)}</strong> foi eliminado (sem captura).`);
  try { if (typeof pushServoLog === 'function') pushServoLog(`Combate: <strong>${esc(e.nome)}</strong> eliminado (não capturado).`); } catch (err) {}
}

function capturarInimigoBatalha(uid) {
  const e = (typeof enemies !== 'undefined' ? enemies : []).find(x => x.uid === uid);
  if (!e) return;
  const ownerSel = document.getElementById('captureOwnerSelect');
  const ownerId = ownerSel ? ownerSel.value : '';
  if (!ownerId) {
    alert('Selecione o herói responsável pela captura.');
    return;
  }
  const owner = (typeof getSaved === 'function' ? getSaved() : []).find(c => c.id === ownerId)
    || (typeof heroes !== 'undefined' ? heroes.find(h => h.id === ownerId) : null);
  if (!owner) {
    alert('Herói dono não encontrado nos salvos. Salve o personagem antes de capturar.');
    return;
  }

  const isBoss = !!(e.isBoss || (e.conceito || '').toLowerCase().includes('chefe') || (e.conceito || '').toLowerCase().includes('boss') || (e.levelLabel || '').toLowerCase().includes('veterano') && (e.P || 0) >= 5);
  let apar = typeof e.aparencia === 'number' ? e.aparencia : (3 + Math.floor(Math.random() * 5));
  // leve chance de formoso se H alto
  if ((e.H || 0) >= 4 && Math.random() < 0.25) apar = Math.max(apar, 7);

  const cap = {
    id: 'cap_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
    nome: (e.nome || 'Inimigo').replace(/\s*#\d+$/, ''),
    sexo: e.sexo || 'F',
    sexoLabel: e.sexoLabel || (e.sexo === 'M' ? 'Macho' : 'Fêmea'),
    P: e.P || 0,
    H: e.H || 0,
    R: e.R || 0,
    aparencia: (typeof e.aparencia === 'number') ? e.aparencia : apar,
    afeto: (typeof e.afeto === 'number') ? e.afeto : 10,
    aparenciaDesc: e.conceito || e.aparenciaDesc || e.desc || '',
    pericias: Array.isArray(e.pericias) ? [...e.pericias] : [],
    vantagens: Array.isArray(e.vantagens) ? [...e.vantagens] : [],
    pvMax: e.pvMax || Math.max(1, (e.R || 1) * 5),
    pvAtual: 1, // regra: capturado fica com 1 PV
    ownerId: ownerId,
    ownerNome: owner.nome,
    isBoss,
    sourceCharId: e.id || null,
    tentativasFuga: 0,
    fugasFalhas: 0,
    capturadoEm: new Date().toISOString(),
    status: 'capturado',
    notas: (e.bestiarioId ? 'Bestiário Victory (fêmea) · ' : '') + 'Capturada em combate na Arena. Aparência ' + ((typeof e.aparencia === 'number' ? e.aparencia : apar)) + '/10.',
    origem: e.bestiarioId ? 'bestiario' : 'combate',
    bestiarioId: e.bestiarioId || null,
    comportamento: e.comportamento || null
  };

  const list = getCapturados();
  list.unshift(cap);
  setCapturados(list);

  e._captured = true;
  e._downedForCapture = false;
  e.pvAtual = 1;

  const row = document.getElementById('capRow_' + uid);
  if (row) row.innerHTML = `<div style="color:#fbbf24; font-weight:700;">🫱 ${esc(cap.nome)} capturado por ${esc(owner.nome)}.</div>`;
  const ov = document.getElementById('overlay_' + uid);
  if (ov) { ov.textContent = '🫱 CAPTURADO'; ov.className = 'overlay-status overlay-victory'; }

  addLog(`🫱 <strong>${esc(cap.nome)}</strong> foi capturado por <strong>${esc(owner.nome)}</strong> (1 PV, status CAPTURADO).`);
  if (typeof pushServoLog === 'function') {
    pushServoLog(`🫱 Capturado em combate: <strong>${esc(cap.nome)}</strong> → dono ${esc(owner.nome)}.`);
  }
  try { renderCapturadosList(); } catch (err) {}
}

function renderCapturadosList() {
  const container = document.getElementById('capturadosList');
  const badge = document.getElementById('capturadosCount');
  if (!container) return;
  const list = getCapturados().filter(c => c.status === 'capturado');
  if (badge) badge.textContent = String(list.length);
  if (!list.length) {
    container.innerHTML = '<p style="color:var(--muted); text-align:center; padding:12px;">Nenhum capturado no momento.</p>';
    return;
  }
  container.innerHTML = list.map(c => {
    const taxa = calcTaxaRegistro(c);
    const tipo = inferirTipoServoDeCapturado(c);
    const preco = typeof calcServoPreco === 'function'
      ? calcServoPreco({ P: c.P, H: c.H, R: c.R, aparencia: c.aparencia, afeto: 5, pericias: c.pericias || [], tipo })
      : 100;
    const venda = Math.round(preco * 0.8);
    return `
      <div class="char-card" style="cursor:default;">
        <div>
          <div style="font-weight:800;">🫱 ${esc(c.nome)}</div>
          <div style="font-size:0.85rem; color:var(--muted);">
            ${c.sexoLabel || ''} · P${c.P} H${c.H} R${c.R} · Apar ${c.aparencia}/10
            ${c.isBoss ? ' · <strong style="color:var(--accent2)">BOSS</strong>' : ''}
          </div>
          <div style="font-size:0.8rem; color:var(--muted);">
            Dono: <strong>${esc(c.ownerNome || c.ownerId || '—')}</strong>
            · Fugas resistidas: ${c.fugasFalhas || 0}
            · Tentativas: ${c.tentativasFuga || 0}
          </div>
          <div style="font-size:0.8rem; margin-top:4px;">
            <span class="status-badge status-faminto" style="font-size:0.72rem;">CAPTURADO · 1 PV</span>
            · Registro: <strong style="color:#fbbf24">${taxa} Tibar</strong>
            · Venda direta: <strong>${venda} Tibar</strong>
          </div>
        </div>
        <div style="display:flex; flex-direction:column; gap:6px;">
          <button class="btn btn-sm" style="background:linear-gradient(135deg,#fbbf24,#b45309);color:#000;" onclick="registrarCapturadoComoEscravo('${c.id}')">⚖️ Registrar (${taxa})</button>
          <button class="btn btn-sm btn-success" onclick="venderCapturadoMercado('${c.id}')">🏪 Vender (${venda})</button>
          <button class="btn btn-sm btn-outline" onclick="libertarCapturado('${c.id}')">🕊️ Libertar</button>
          <button class="btn btn-sm btn-outline" onclick="forcarTentativaFuga('${c.id}')">🏃 Testar fuga agora</button>
        </div>
      </div>`;
  }).join('');
}

/**
 * Formaliza contrato: CAPTURADO → SERVO.
 * Cobra taxa de registro do dono, restaura PV, Afeto = 5.
 */
function registrarCapturadoComoEscravo(capId) {
  const list = getCapturados();
  const idx = list.findIndex(x => x.id === capId);
  if (idx < 0) return;
  const cap = list[idx];
  const taxa = calcTaxaRegistro(cap);
  const chars = typeof getSaved === 'function' ? getSaved() : [];
  const cidx = chars.findIndex(c => c.id === cap.ownerId);
  if (cidx < 0) {
    alert('Dono não encontrado nos personagens salvos.');
    return;
  }
  const hero = chars[cidx];
  if ((hero.ouro || 0) < taxa) {
    alert(`${hero.nome} tem apenas ${hero.ouro || 0} Tibar. Taxa de registro: ${taxa}.`);
    return;
  }
  if (!confirm(`Registrar ${cap.nome} como escravo contratual?\nTaxa de registro: ${taxa} Tibar\nAfeto inicial: 5/100 (captura forçada)\nPV restaurados ao máximo.`)) return;

  hero.ouro = (hero.ouro || 0) - taxa;
  chars[cidx] = hero;
  setSaved(chars);

  const tipo = inferirTipoServoDeCapturado(cap);
  let P = cap.P || 0, H = cap.H || 0, R = cap.R || 0;
  // bônus de tipo combate se ainda não refletido
  if (tipo === 'combate') {
    if (P >= H) P = Math.min(10, P); // já tem P/R altos
    else H = Math.min(10, H);
  }
  let apar = cap.aparencia || 5;
  if (tipo === 'formoso' && apar < 7) apar = 7;

  const servo = {
    id: 'servo_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
    nome: cap.nome,
    sexo: cap.sexo || 'F',
    sexoLabel: cap.sexoLabel || (cap.sexo === 'M' ? 'Homem' : 'Mulher'),
    tipo,
    motivo: 'guerra',
    P, H, R,
    aparencia: apar,
    afeto: 5, // mais baixo — captura forçada
    pericias: Array.isArray(cap.pericias) ? [...cap.pericias] : [],
    clausulas: { prazo: false, resgate: true, heranca: false, semManumissao: false },
    notas: 'Capturado em combate — registrado como escravo.',
    contratoAtivo: true,
    ownerId: cap.ownerId,
    criadoEm: new Date().toISOString(),
    historicoAfeto: [{
      time: new Date().toLocaleString('pt-BR'),
      delta: 0,
      before: 5,
      after: 5,
      reason: 'Registro após captura em combate (Afeto inicial 5)'
    }],
    fromCapturaId: cap.id,
    isBoss: !!cap.isBoss,
    XP: 0,
    maxPoints: 0,
    pontosLivres: 0,
    luxo: false
  };

  const servos = typeof getServos === 'function' ? getServos() : [];
  servos.unshift(servo);
  setServos(servos);

  list.splice(idx, 1);
  setCapturados(list);

  if (typeof pushServoLog === 'function') {
    pushServoLog(`⚖️ <strong>${esc(cap.nome)}</strong> registrado como escravo de ${esc(hero.nome)} (−${taxa} Tibar). Afeto 5.`);
  }
  renderCapturadosList();
  if (typeof renderServoOwnedList === 'function') {
    // garante dono selecionado
    const sel = document.getElementById('servoOwnerSelect');
    if (sel) { sel.value = cap.ownerId; onServoOwnerChange(); }
    else renderServoOwnedList();
  }
  if (typeof renderServoMercado === 'function') renderServoMercado();
  alert(`⚖️ ${cap.nome} agora é servo contratual de ${hero.nome}.\nTaxa paga: ${taxa} Tibar.\nAfeto: 5/100.`);
}

/**
 * Venda direta no mercado sem registro formal.
 * Preço = valor de mercado × 0.8 (taxa do mercador 20%).
 * O “comprador” do mercado assume o registro; o herói só recebe o valor.
 * Remove o capturado (não vira servo do jogador).
 */
function venderCapturadoMercado(capId) {
  const list = getCapturados();
  const idx = list.findIndex(x => x.id === capId);
  if (idx < 0) return;
  const cap = list[idx];
  const tipo = inferirTipoServoDeCapturado(cap);
  const preco = typeof calcServoPreco === 'function'
    ? calcServoPreco({ P: cap.P, H: cap.H, R: cap.R, aparencia: cap.aparencia || 5, afeto: 5, pericias: cap.pericias || [], tipo })
    : 100;
  const venda = Math.round(preco * 0.8);
  const chars = typeof getSaved === 'function' ? getSaved() : [];
  const cidx = chars.findIndex(c => c.id === cap.ownerId);
  if (cidx < 0) {
    alert('Dono não encontrado.');
    return;
  }
  if (!confirm(`Vender ${cap.nome} no mercado de escravos por ${venda} Tibar?\n(Valor de referência ${preco} − 20% taxa do mercador)\nO comprador cuida do registro. Você não fica com o servo.`)) return;

  chars[cidx].ouro = (chars[cidx].ouro || 0) + venda;
  setSaved(chars);
  list.splice(idx, 1);
  setCapturados(list);

  // Opcional: coloca um servo “anônimo” no mercado já com contrato (comprador NPC)
  // Não adicionamos ao jogador — apenas remove o capturado e paga o ouro.

  if (typeof pushServoLog === 'function') {
    pushServoLog(`🏪 <strong>${esc(cap.nome)}</strong> vendido no mercado por ${venda} Tibar (sem registro pelo grupo).`);
  }
  renderCapturadosList();
  if (typeof onServoOwnerChange === 'function') onServoOwnerChange();
  alert(`Vendido! ${chars[cidx].nome} recebeu ${venda} Tibar.`);
}

function libertarCapturado(capId) {
  const list = getCapturados();
  const idx = list.findIndex(x => x.id === capId);
  if (idx < 0) return;
  const cap = list[idx];
  if (!confirm(`Libertar ${cap.nome}? Ele(a) parte livre — sem ouro, sem contrato.`)) return;
  list.splice(idx, 1);
  setCapturados(list);
  if (typeof pushServoLog === 'function') {
    pushServoLog(`🕊️ <strong>${esc(cap.nome)}</strong> libertado (captura cancelada).`);
  }
  renderCapturadosList();
  alert(`${cap.nome} foi libertado.`);
}

/**
 * Tentativa de fuga: capturado (1 PV) vs dono.
 * 3DeT Victory: 2D6 + atributo (P do capturado vs R/H do dono).
 * Se capturado vencer → FUGE e é removido para sempre.
 * Se dono vencer → permanece capturado, contadores sobem.
 */
function resolverTentativaFuga(cap, silent) {
  if (!cap || cap.status !== 'capturado') return { fugiu: false, msg: '' };
  const chars = typeof getSaved === 'function' ? getSaved() : [];
  const hero = chars.find(c => c.id === cap.ownerId);
  const heroNome = hero ? hero.nome : (cap.ownerNome || 'Guarda');
  const heroAttr = hero ? Math.max(Number(hero.R) || 0, Number(hero.H) || 0, Number(hero.P) || 0) : 2;

  const rollCap = typeof roll2D6 === 'function' ? roll2D6() : { total: 7, diceStr: '3+4=7' };
  const rollHero = typeof roll2D6 === 'function' ? roll2D6() : { total: 7, diceStr: '3+4=7' };

  // Capturado só tem 1 PV — luta de contenção, usa o melhor atributo dele com penalidade
  const capAttr = Math.max(Number(cap.P) || 0, Number(cap.H) || 0);
  const capTotal = rollCap.total + capAttr;
  const heroTotal = rollHero.total + heroAttr;

  cap.tentativasFuga = (cap.tentativasFuga || 0) + 1;

  let fugiu = false;
  let msg = `🏃 Fuga de ${cap.nome}: 1d6[${rollCap.diceStr}]+${capAttr}=${capTotal} vs ${heroNome} 1d6[${rollHero.diceStr}]+${heroAttr}=${heroTotal}. `;

  if (capTotal > heroTotal) {
    fugiu = true;
    msg += '⚠️ FUGIU e desapareceu!';
  } else {
    cap.fugasFalhas = (cap.fugasFalhas || 0) + 1;
    msg += 'Contenção OK — permanece capturado.';
  }

  if (!silent && typeof pushServoLog === 'function') {
    pushServoLog(msg);
  }
  return { fugiu, msg, cap };
}

function forcarTentativaFuga(capId) {
  const list = getCapturados();
  const idx = list.findIndex(x => x.id === capId);
  if (idx < 0) return;
  const result = resolverTentativaFuga(list[idx], false);
  if (result.fugiu) {
    list.splice(idx, 1);
    setCapturados(list);
    alert(result.msg);
  } else {
    list[idx] = result.cap;
    setCapturados(list);
    alert(result.msg);
  }
  renderCapturadosList();
}

/**
 * Chamado no Descanso Longo / virada de noite: todos os capturados tentam fugir.
 */
function processarFugasNoturnas() {
  const list = getCapturados();
  const remaining = [];
  const msgs = [];
  list.forEach(cap => {
    if (cap.status !== 'capturado') {
      remaining.push(cap);
      return;
    }
    const result = resolverTentativaFuga(cap, true);
    if (result.fugiu) {
      msgs.push(`⚠️ ${cap.nome} fugiu durante a noite!`);
      if (typeof pushServoLog === 'function') pushServoLog(result.msg);
    } else {
      remaining.push(result.cap);
      msgs.push(`🫱 ${cap.nome}: tentativa de fuga contida.`);
      if (typeof pushServoLog === 'function') pushServoLog(result.msg);
    }
  });
  setCapturados(remaining);
  try { renderCapturadosList(); } catch (e) {}
  if (msgs.length) {
    const summary = '🌙 Tentativas de fuga dos capturados:\n\n' + msgs.join('\n');
    // não spam se zero capturados
    if (list.some(c => c.status === 'capturado')) {
      setTimeout(() => alert(summary), 100);
    }
  }
  return msgs;
}


/* ===== [SERVOS_CONTRATUAIS] linhas originais 13627-13765 ===== */
/* ==================== SERVOS CONTRATUAIS MÁGICOS ====================
 * Sistema modular de servidão por contrato mágico vinculante.
 * Armazenamento: KEYS.servos (lista global). Cada servo tem ownerId
 * (id do personagem dono) ou null se estiver no mercado.
 * Mecânicas: Aparência 1–10, Afeto 0–100, tipos, preço, log de eventos.
 */
const SERVO_TIPOS = {
  combate: {
    id: 'combate', label: '🗡️ Combate', mult: 1.5,
    desc: 'Treinado para lutar. Bônus: +2 Poder OU +2 Habilidade (escolhido na criação).'
  },
  empregado: {
    id: 'empregado', label: '🛠️ Empregado', mult: 1.0,
    desc: 'Serviços domésticos e ofícios. Bônus: +2 em até 2 perícias escolhidas.'
  },
  formoso: {
    id: 'formoso', label: '💎 Formoso', mult: 2.0,
    desc: 'Beleza excepcional. Aparência mínima 7. Bônus de Satisfação em interações sociais/íntimas.'
  }
};

const SERVO_MOTIVOS = {
  divida: 'Dívida / penhora',
  guerra: 'Refugiado de guerra / perda',
  aposta: 'Aposta perdida',
  familia: 'Vendido por familiares',
  outro: 'Outro'
};

const SERVO_NOMES_F = ['Lira','Selene','Mira','Talia','Nyssa','Elara','Vesper','Iris','Kaia','Rena','Sora','Yuna','Faye','Luna','Aria'];
const SERVO_NOMES_M = ['Kai','Dorian','Riven','Cass','Orin','Tomas','Lex','Finn','Jace','Rook','Ash','Vance','Cole','Nico','Garen'];
const SERVO_SOBRENOMES = ['Vale','Ash','Thorn','Grey','Stone','Reed','Frost','Black','Wren','Hollow','Cross','Marsh'];

const SERVO_PERICIAS_POOL = [
  'Cozinha','Costura','Limpeza','Observar','Furtividade','Atletismo','Luta','Persuasão',
  'Intimidação','Cura','Animais','Música','Negociação','Armadilhas','Natação','Escrita'
];

/**
 * Aparência (1–10) → 6 níveis / adjetivos.
 * Usado em testes sociais e no efeito de Humor por convívio (≥2 etapas do dia).
 *
 *   Monstruosa (1–2) = −2
 *   Feia       (3–4) = −1
 *   Normal     (5–6) =  0
 *   Bonita     (7–8) = +1
 *   Linda      (9)   = +2
 *   Maravilhosa(10)  = +3
 */
function aparenciaBonus(n) {
  n = Math.max(1, Math.min(10, Number(n) || 5));
  if (n <= 2) return { mod: -2, label: 'Monstruosa (−2)', nivel: 'monstruosa', faixa: '1–2' };
  if (n <= 4) return { mod: -1, label: 'Feia (−1)', nivel: 'feia', faixa: '3–4' };
  if (n <= 6) return { mod: 0, label: 'Normal (+0)', nivel: 'normal', faixa: '5–6' };
  if (n <= 8) return { mod: 1, label: 'Bonita (+1)', nivel: 'bonita', faixa: '7–8' };
  if (n === 9) return { mod: 2, label: 'Linda (+2)', nivel: 'linda', faixa: '9' };
  return { mod: 3, label: 'Maravilhosa (+3)', nivel: 'maravilhosa', faixa: '10' };
}

/** Soma Aparência + Humor + cicatriz de falha para testes sociais. */
function getModificadoresSociais(char) {
  if (!char) return { ap: 0, humor: 0, cicatriz: 0, total: 0, apLabel: 'Normal (+0)', humorLabel: '' };
  const ap = aparenciaBonus(char.aparencia);
  const humorFx = (char.statusEffects || []).find(s => s.id === 'humor_aparencia');
  const cicFx = (char.statusEffects || []).find(s => s.id === 'cicatriz_falha');
  const humor = humorFx ? (Number(humorFx.mod) || 0) : 0;
  const cicatriz = cicFx ? (Number(cicFx.mod) || 0) : 0;
  return {
    ap: ap.mod,
    humor,
    cicatriz,
    total: ap.mod + humor + cicatriz,
    apLabel: ap.label,
    nivel: ap.nivel,
    humorLabel: humorFx
      ? `${humor >= 0 ? '+' : ''}${humor} (${humorFx.nome || 'Humor'}, ${humorFx.periodosRestantes != null ? humorFx.periodosRestantes : '?'} etapa(s))`
      : '',
    cicatrizLabel: cicFx ? `${cicatriz >= 0 ? '+' : ''}${cicatriz} (${cicFx.nome || 'Cicatriz'})` : ''
  };
}

/** Perícias consideradas sociais (recebem bônus/redutor de Aparência + Humor). */
const PERICIAS_SOCIAIS = ['Influência', 'Persuasão', 'Intimidação', 'Negociação', 'Manha', 'Sedução', 'Etiqueta'];

function isTesteSocial(pericia, label) {
  const p = String(pericia || '').toLowerCase();
  const l = String(label || '').toLowerCase();
  if (PERICIAS_SOCIAIS.some(x => p.includes(x.toLowerCase()) || l.includes(x.toLowerCase()))) return true;
  if (/social|persuad|sedu[cz]|intimid|negoci|diplom|convenc|carisma|primeira impress/.test(p + ' ' + l)) return true;
  return false;
}

/** Descrições populares/informais de cada nível de Aparência, exibidas ao clicar no adjetivo na ficha. */
const APARENCIA_DESC = {
  monstruosa: 'Meu Deus do céu, Berg... corre que é o capeta!',
  feia: 'Se for Raimunda, coloca um saco de papel na cabeça e pronto.',
  normal: 'Só mais uma na multidão.',
  bonita: 'Tem um chamego diferenciado.',
  linda: 'Eita, essa aí é areia demais pro caminhão de muitos... gostosa.',
  maravilhosa: 'Simplesmente a definição de gostosa — não precisa nem de emprego pra viver uma vida de luxo.'
};
const APARENCIA_LABELS_POR_NIVEL = {
  monstruosa: 'Monstruosa (−2)', feia: 'Feia (−1)', normal: 'Normal (+0)',
  bonita: 'Bonita (+1)', linda: 'Linda (+2)', maravilhosa: 'Maravilhosa (+3)'
};

/** Exibe a descrição informal do nível de Aparência (chamado ao clicar no adjetivo abaixo do nome). */
function mostrarDescricaoAparencia(nivel) {
  const ap = APARENCIA_LABELS_POR_NIVEL[nivel] || nivel;
  const desc = APARENCIA_DESC[nivel] || 'Sem descrição.';
  alert(`✨ ${ap}\n\n${desc}`);
}

/** Ajuste manual da Aparência (1–10) na ficha — útil para NPCs convertidos ou correções. */
function ajustarAparenciaManual(charId) {
  const list = getSaved();
  const idx = list.findIndex(c => c.id === charId);
  if (idx < 0) return;
  const c = normalizeCharacter(list[idx]);
  const atual = c.aparencia != null ? c.aparencia : 5;
  const str = prompt(
    'Aparência (1–10):\n\n' +
    '1–2 Monstruosa (−2)\n3–4 Feia (−1)\n5–6 Normal (+0)\n7–8 Bonita (+1)\n9 Linda (+2)\n10 Maravilhosa (+3)',
    String(atual)
  );
  if (str === null) return;
  const n = parseInt(str, 10);
  if (isNaN(n) || n < 1 || n > 10) {
    alert('Valor inválido. Use um número de 1 a 10.');
    return;
  }
  c.aparencia = n;
  list[idx] = c;
  setSaved(list);
  const ap = aparenciaBonus(n);
  alert(`${c.nome}: Aparência ${n}/10 — ${ap.label}`);
  try { openView(charId); } catch (e) {}
}

