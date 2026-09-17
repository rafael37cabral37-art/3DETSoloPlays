/* ===== [CASA_LUZ_VERMELHA] linhas originais 11872-12774 ===== */
/* ==================== CASA DA LUZ VERMELHA — CLIENTE & PARCERIA ====================
 * O PJ NÃO é dono. A Dona da Casa (NPC) tem autoridade total.
 * Cliente: paga serviços. Parceiro: propõe escravas para trabalho temporário.
 * Lucro das damas da Casa → Dona. PJ só recebe % combinada das SUAS escravas em parceria.
 */
const LUZ_RACAS = ['Humana','Elfa','Meia-Elfa','Orca','Anã','Tiefling','Halfling'];
const LUZ_CLASSES = ['Cortesã','Artista','Companheira','Guarda-Cortesã','Dançarina','Musicista','Bardo'];

const LUZ_DONA = {
  nome: 'Madame Seraphine',
  titulo: 'Proprietária da Casa da Luz Vermelha',
  personalidade: 'Experiente, astuta, elegante, firme mas justa. Não cede a pressão.',
  raca: 'vampiro',
  idadeAparente: 'meia-idade elegante',
  idadeReal: 200,
  aparencia: 9,
  revelada: false,
  irma: 'Selene Drae',
  maldicao: 'Morcego — bruxa ainda viva (A Ordem)'
};

/** Ficha de combate 3DeT — Madame Seraphine (boss secreto) */
const SERAPHINE_BOSS = {
  id: 'boss_seraphine',
  nome: 'Madame Seraphine',
  conceito: 'Dona da Casa da Luz Vermelha · Vampira ancestral',
  arquetipoId: 'vampiro',
  arquetipoNome: '🔒 Vampiro',
  arquetipoBonus: 'Victory: Talento + Imortal + poderes ancestrais',
  arquetipoDesv: 'Fraqueza (luz do dia) + sede lendária',
  escala: 'Sugoi',
  P: 6, H: 7, R: 6,
  aparencia: 9,
  XP: 0, maxPoints: 20, levelLabel: 'Lenda',
  vantagens: [
    'Mordida de Sangue','Força Sobrenatural','Fascínio','Sentidos Aguçados',
    'Resistência a Dano Comum','Regeneração Vampírica','Velocidade Sobrenatural',
    'Forma das Sombras','Imortal','Paralisia','Carismático','Regeneração','Ágil'
  ],
  desvantagens: [
    'Sede de Sangue','Maldição Vampírica','Sem Vida','Fraqueza','Aversão ao Sagrado','Noctívago','Infame'
  ],
  pericias: ['Influência','Luta','Manha','Percepção','Mística','Saber'],
  fraquezaDetail: { tipo: 'Sol pleno e poder Sagrado', comum: true },
  pontoFracoDetail: 'Estaca no coração + fogo / decapitação ritual',
  tipoDanoPadrao: 'Sombrio',
  status: 'normal',
  ouro: 5000,
  isBoss: true,
  isTemp: true,
  biografia: 'Irmã de Selene Drae (Casa do Véu Prateado). Uma bruxa ainda viva — ligada à facção oculta A Ordem — amaldiçoou as duas: morcego para Seraphine, lobo para Selene. Aparência 9/10. Governa a Luz Vermelha há gerações humanas; por trás da elegância, vampira de ~200 anos. Quem a trata como cortesã indefesa descobre tarde demais o erro.'
};

function seraphineParaInimigoBatalha() {
  const c = typeof normalizeCharacter === 'function'
    ? normalizeCharacter(JSON.parse(JSON.stringify(SERAPHINE_BOSS)))
    : JSON.parse(JSON.stringify(SERAPHINE_BOSS));
  const res = typeof getCharResources === 'function' ? getCharResources(c) : { pv: 50, pm: 40, pa: 8 };
  c.pvMax = Math.max(c.pvMax || 0, res.pv || 50, 45);
  c.pmMax = Math.max(c.pmMax || 0, res.pm || 40, 35);
  c.paMax = Math.max(c.paMax || 0, res.pa || 8, 6);
  c.pvAtual = c.pvMax;
  c.pmAtual = c.pmMax;
  c.paAtual = c.paMax;
  c.isHero = false;
  c.isBoss = true;
  c.isTemp = true;
  c._seraphine = true;
  return c;
}

/**
 * Desafiar a Dona — boss secreto.
 * Gatilhos: botão consciente, ou confiança muito baixa + hostilidade.
 */
function desafiarMadameSeraphine() {
  const st = getLuzCasaState();
  const conf = st.confianca || 30;
  if (st.banido) {
    if (!confirm(`${LUZ_DONA.nome} já o expulsou.\nForçar a entrada é declarar guerra à Casa — e a ela.\n\nInvadir mesmo assim?`)) return;
  }
  const aviso = conf >= 40
    ? `${LUZ_DONA.nome} ergue o olhar, serena.\n\n“Você realmente quer testar a dona desta casa? Pense bem. Eu não sou uma dama para ser empurrada.”\n\nInsistir inicia combate contra um boss secreto.`
    : `${LUZ_DONA.nome} sorri sem calor.\n\n“Achei que era só mais um cliente… Que decepção.”\n\nA fachada cai. Combate contra boss secreto.`;
  if (!confirm(aviso + '\n\nEnfrentar Madame Seraphine na Arena?')) return;

  // Marca revelação
  st.revelada = true;
  st.confianca = Math.min(st.confianca, 5);
  st.banido = true;
  setLuzCasaState(st);

  try { changeReputation('submundo', -15, 'Desafiou Madame Seraphine', true); } catch (e) {}
  try { changeReputation('igreja', 5, 'Confronto com a Dona da Luz Vermelha', true); } catch (e) {}

  // Prepara batalha 1x1 (ou grupo do mercado vs ela)
  const boss = seraphineParaInimigoBatalha();
  // Salva boss temporário na lista de personagens para a arena carregar
  let list = typeof getSaved === 'function' ? getSaved() : [];
  list = list.filter(c => c.id !== boss.id);
  list.push(boss);
  setSaved(list);

  // Seleciona herói do mercado se houver
  const heroId = document.getElementById('marketHeroSelect')?.value;
  goTo('battle');
  setTimeout(() => {
    try {
      loadFighters();
      alert(`🩸 A verdade:\n\nMadame Seraphine não é uma madame qualquer.\nÉ uma VAMPIRA de cerca de 200 anos (Aparência 9/10).\n\nEscala ${boss.escala} · P${boss.P} H${boss.H} R${boss.R}\nKit: Mordida, Fascínio, Regeneração, Força Sobrenatural…\n\nNa Arena, coloque-a como INIMIGA (🩸BOSS) e seus heróis como grupo.`);
    } catch (e) { console.warn(e); }
  }, 200);
}

function seraphineAvisoHostil() {
  const st = getLuzCasaState();
  if ((st.confianca || 30) > 15 && !st.banido) return;
  const el = document.getElementById('luzDonaFala');
  if (el) {
    el.innerHTML = `<em style="color:#f87171;">“Continue assim… e descobrirá que a dona desta casa não é presa fácil.”</em> — ${LUZ_DONA.nome}`;
  }
}

const LUZ_DAMAS_PADRAO = [
  { id:'dama-casa-001', nome:'Lirael', raca:'Elfa', classe:'Cortesã', P:3, H:7, R:4, aparencia:9, afeto:25, emServico:true },
  { id:'dama-casa-002', nome:'Valeska', raca:'Humana', classe:'Artista', P:2, H:8, R:5, aparencia:7, afeto:40, emServico:true },
  { id:'dama-casa-003', nome:'Morrigan', raca:'Meia-Elfa', classe:'Companheira', P:4, H:6, R:6, aparencia:8, afeto:15, emServico:true },
  { id:'dama-casa-004', nome:'Zara', raca:'Orca', classe:'Guarda-Cortesã', P:7, H:5, R:8, aparencia:6, afeto:30, emServico:true }
];

let _luzDamaSelId = null;

function defaultLuzCasaState() {
  return {
    donaNome: LUZ_DONA.nome,
    confianca: 30, // 0–100: confiança da Dona no PJ
    banido: false,
    damas: JSON.parse(JSON.stringify(LUZ_DAMAS_PADRAO)),
    // parcerias ativas (ex-alocados), aprovadas pela Dona
    // { servoId, ownerId, nome, aparencia, afeto, data, dias, pctPj, diaInicio, diaFim, funcoes }
    alocados: [],
    historico: [],
    ultimoDiaColetado: 0,
    logDona: []
  };
}

function getLuzCasaState() {
  try {
    const raw = storeGetJSON(KEYS.luzCasa, null);
    if (!raw || typeof raw !== 'object') return defaultLuzCasaState();
    const base = defaultLuzCasaState();
    base.confianca = typeof raw.confianca === 'number' ? Math.max(0, Math.min(100, raw.confianca)) : 30;
    base.banido = !!raw.banido;
    base.donaNome = raw.donaNome || LUZ_DONA.nome;
    base.damas = Array.isArray(raw.damas) && raw.damas.length ? raw.damas : base.damas;
    base.alocados = Array.isArray(raw.alocados) ? raw.alocados : [];
    base.historico = Array.isArray(raw.historico) ? raw.historico.slice(0, 40) : [];
    base.ultimoDiaColetado = raw.ultimoDiaColetado || 0;
    base.logDona = Array.isArray(raw.logDona) ? raw.logDona.slice(0, 30) : [];
    // migrar caixa antiga (ignorada — não é do PJ)
    return base;
  } catch (e) {
    return defaultLuzCasaState();
  }
}
function setLuzCasaState(st) { storeSet(KEYS.luzCasa, st); }

function luzAjustarConfianca(delta, motivo) {
  const st = getLuzCasaState();
  const before = st.confianca || 30;
  st.confianca = Math.max(0, Math.min(100, before + (delta || 0)));
  st.logDona = st.logDona || [];
  st.logDona.unshift({
    data: new Date().toLocaleString('pt-BR'),
    delta: delta || 0,
    before,
    after: st.confianca,
    motivo: motivo || ''
  });
  if (st.logDona.length > 30) st.logDona = st.logDona.slice(0, 30);
  if (st.confianca <= 5) st.banido = true;
  if (st.confianca >= 15) st.banido = false;
  setLuzCasaState(st);
  return st.confianca;
}

function luzConfiancaLabel(n) {
  n = Number(n) || 0;
  if (n >= 85) return { text: 'Confiança plena', color: '#10b981' };
  if (n >= 65) return { text: 'Bem-visto', color: '#34d399' };
  if (n >= 45) return { text: 'Respeitável', color: '#fbbf24' };
  if (n >= 25) return { text: 'Observando', color: '#fb923c' };
  if (n >= 10) return { text: 'Desconfiança', color: '#f87171' };
  return { text: 'Persona non grata', color: '#ef4444' };
}

function luzCalcPrecos(dama) {
  const base = 30 + (Number(dama.aparencia) || 5) * 15 + (Number(dama.H) || 0) * 5;
  const bonus = 1 + ((Number(dama.afeto) || 0) / 200);
  return {
    conversa: Math.round(base * bonus),
    encontro: Math.round(base * 2.5 * bonus),
    festa: Math.round(base * 4 * bonus),
    exclusivo: Math.round(base * 8 * bonus)
  };
}

function luzNivelApar(v) {
  v = Number(v) || 0;
  if (v <= 3) return 'Comum';
  if (v <= 5) return 'Agradável';
  if (v <= 7) return 'Bela';
  if (v <= 9) return 'Deslumbrante';
  return 'Lendária';
}

function switchLuzSubTab(nome) {
  const panels = {
    servicos: 'luzPanelServicos',
    damas: 'luzPanelDamas',
    contrato: 'luzPanelContrato',
    escravos: 'luzPanelEscravos',
    renda: 'luzPanelRenda',
    trabalho: 'luzPanelTrabalho'
  };
  const btns = {
    servicos: 'luzSubTabServicos',
    damas: 'luzSubTabDamas',
    contrato: 'luzSubTabContrato',
    escravos: 'luzSubTabEscravos',
    renda: 'luzSubTabRenda',
    trabalho: 'luzSubTabTrabalho'
  };
  Object.keys(panels).forEach(k => {
    const el = document.getElementById(panels[k]);
    const btn = document.getElementById(btns[k]);
    if (el) el.classList.toggle('hidden', k !== nome);
    if (btn) {
      if (k === nome) btn.classList.remove('btn-outline');
      else btn.classList.add('btn-outline');
    }
  });
  if (nome === 'damas') luzRenderListaDamasCasa();
  if (nome === 'contrato') renderDamasLuxoMercado();
  if (nome === 'escravos') { luzCarregarSelectEscravos(); luzRenderAlocados(); }
  if (nome === 'renda') luzCalcularRendimentoUI();
  if (nome === 'trabalho') renderLuzServoWorkPanel();
}

function initLuzCasaUI(keepTab) {
  const st = getLuzCasaState();
  const nome = document.getElementById('luzDonaNome');
  if (nome) nome.textContent = st.donaNome || LUZ_DONA.nome;
  const confEl = document.getElementById('luzConfiancaDisplay');
  const confBar = document.getElementById('luzConfiancaBar');
  const lab = luzConfiancaLabel(st.confianca);
  if (confEl) confEl.innerHTML = `${st.confianca}/100 <span style="font-size:0.75rem;color:${lab.color}">${lab.text}</span>`;
  if (confBar) confBar.style.width = Math.min(100, st.confianca) + '%';
  const cd = document.getElementById('luzContadorDamas');
  if (cd) cd.textContent = String((st.damas || []).length);
  const ca = document.getElementById('luzContadorAlocados');
  if (ca) ca.textContent = String((st.alocados || []).length);
  const hint = document.getElementById('marketLuzRepHint');
  if (hint) {
    if (st.banido) hint.innerHTML = '<span style="color:#ef4444;">⛔ A Dona proibiu sua entrada. Recupere confiança ou espere um mediador.</span>';
    else hint.textContent = 'Cliente / parceiro · Reputação Submundo favorece preços e aceitação de propostas.';
  }
  if (!keepTab) switchLuzSubTab('servicos');
  luzRenderListaDamasCasa();
  luzCarregarSelectEscravos();
  luzRenderAlocados();
  luzCalcularRendimentoUI();
  try { seraphineAvisoHostil(); } catch (e) {}
}

function luzRenderListaDamasCasa() {
  const el = document.getElementById('luzListaDamasCasa');
  if (!el) return;
  const st = getLuzCasaState();
  const cd = document.getElementById('luzContadorDamas');
  if (cd) cd.textContent = String(st.damas.length);
  if (!st.damas.length) {
    el.innerHTML = '<p style="color:var(--muted); text-align:center; padding:12px;">Nenhuma dama na casa no momento.</p>';
    return;
  }
  el.innerHTML = st.damas.map(d => {
    const p = luzCalcPrecos(d);
    const sel = _luzDamaSelId === d.id;
    return `
      <div class="char-card" style="cursor:pointer; ${sel ? 'border-color:#fbbf24;' : 'border-color:rgba(236,72,153,0.35);'}" onclick="luzSelecionarDama('${d.id}')">
        <div>
          <div style="font-weight:800; color:#f472b6;">${esc(d.nome)}</div>
          <div style="font-size:0.82rem; color:var(--muted); margin:4px 0;">
            <span class="tag" style="border-color:#a855f7;color:#d8b4fe;">${esc(d.raca || '—')}</span>
            <span class="tag" style="border-color:#f59e0b;color:#fcd34d;">${esc(d.classe || '—')}</span>
            <span class="tag" style="border-color:#f43f5e;color:#fca5a5;">❤️ ${d.afeto}/100</span>
            ${d.emServico !== false ? '<span class="tag" style="border-color:var(--success);color:var(--success)">Disponível</span>' : '<span class="tag">Ocupada</span>'}
          </div>
          <div style="font-size:0.8rem; color:var(--muted);">
            P${d.P} H${d.H} R${d.R} · Apar ${d.aparencia}/10 (${luzNivelApar(d.aparencia)})
            · Companhia <strong style="color:#fbbf24">${p.conversa}T</strong>
            · Encontro <strong style="color:#fbbf24">${p.encontro}T</strong>
          </div>
        </div>
        <button class="btn btn-sm btn-outline" onclick="event.stopPropagation(); luzSelecionarDama('${d.id}')">Ficha</button>
      </div>`;
  }).join('');
}

function luzSelecionarDama(id) {
  _luzDamaSelId = id;
  const st = getLuzCasaState();
  const d = st.damas.find(x => x.id === id);
  if (!d) return;
  luzRenderListaDamasCasa();
  const panel = document.getElementById('luzFichaDamaPanel');
  if (!panel) return;
  const p = luzCalcPrecos(d);
  document.getElementById('luzFichaNome').textContent = d.nome;
  document.getElementById('luzFichaBadges').innerHTML = `
    <span class="tag" style="border-color:#a855f7;color:#d8b4fe;">${esc(d.raca || '')}</span>
    <span class="tag" style="border-color:#f59e0b;color:#fcd34d;">${esc(d.classe || '')}</span>
    <span class="tag" style="border-color:#f43f5e;color:#fca5a5;">Afeto ${d.afeto}/100</span>`;
  document.getElementById('luzFichaAttrs').innerHTML = `
    <div class="attr-box"><div class="letter">P</div><div class="num">${d.P}</div></div>
    <div class="attr-box"><div class="letter">H</div><div class="num">${d.H}</div></div>
    <div class="attr-box"><div class="letter">R</div><div class="num">${d.R}</div></div>
    <div class="attr-box"><div class="letter">APAR</div><div class="num">${d.aparencia}</div></div>`;
  document.getElementById('luzFichaPrecos').innerHTML = `
    💬 Conversa: <strong>${p.conversa} Tibar</strong><br>
    💌 Encontro: <strong>${p.encontro} Tibar</strong><br>
    🎉 Festa: <strong>${p.festa} Tibar</strong><br>
    💎 Exclusivo: <strong>${p.exclusivo} Tibar</strong>
    <div style="font-size:0.75rem;color:var(--muted);margin-top:6px;">Valores cobrados pela Casa · vão para a Dona</div>`;
  document.getElementById('luzFichaAfetoBar').style.width = Math.min(100, d.afeto) + '%';
  document.getElementById('luzFichaAfetoLabel').textContent = `Afeto ${d.afeto}/100 · Nível: ${luzNivelApar(d.aparencia)}`;
  document.getElementById('luzInteracaoResult').innerHTML = '';
  panel.classList.remove('hidden');
  panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function luzInteragirDama(tipo) {
  if (!_luzDamaSelId) return;
  const st = getLuzCasaState();
  if (st.banido) { alert('A Dona não permite que você se aproxime das damas.'); return; }
  const idx = st.damas.findIndex(x => x.id === _luzDamaSelId);
  if (idx < 0) return;
  const d = st.damas[idx];
  const heroId = document.getElementById('marketHeroSelect')?.value;
  const chars = typeof getSaved === 'function' ? getSaved() : [];
  const cidx = chars.findIndex(c => c.id === heroId);

  let ganhoMin = 1, ganhoMax = 3, custo = 0, mensagem = '';
  if (tipo === 'conversa') { ganhoMin = 2; ganhoMax = 5; mensagem = `💬 Conversa respeitosa com ${d.nome}.`; }
  else if (tipo === 'presente') {
    custo = 30;
    if (cidx < 0) { alert('Selecione o herói no mercado.'); return; }
    if ((chars[cidx].ouro || 0) < 30) { alert('Presente custa 30 Tibar.'); return; }
    chars[cidx].ouro -= 30;
    setSaved(chars);
    ganhoMin = 5; ganhoMax = 15;
    mensagem = `🎁 Presente para ${d.nome} (−30 Tibar). A Dona observa com aprovação.`;
    luzAjustarConfianca(1, 'Generosidade com as damas');
  } else if (tipo === 'elogiar') { ganhoMin = 1; ganhoMax = 3; mensagem = `✨ Elogio a ${d.nome}.`; }
  else if (tipo === 'negociar') { ganhoMin = 3; ganhoMax = 8; mensagem = `🤝 Conversa sobre sonhos com ${d.nome}.`; }

  const chance = 0.7 + (d.afeto / 300);
  const ok = Math.random() < chance;
  const ganho = ok
    ? (ganhoMin + Math.floor(Math.random() * (ganhoMax - ganhoMin + 1)))
    : (1 + Math.floor(Math.random() * 2));
  d.afeto = Math.min(100, (d.afeto || 0) + ganho);
  st.damas[idx] = d;
  setLuzCasaState(st);

  const res = document.getElementById('luzInteracaoResult');
  if (res) {
    res.innerHTML = `<strong>${mensagem}</strong><br>
      <span style="color:${ok ? 'var(--success)' : 'var(--accent)'}">${ok ? '✅ Bem recebido' : '⚠️ Reservado'} · Afeto +${ganho} → ${d.afeto}/100</span>`;
  }
  luzSelecionarDama(d.id);
  luzRenderListaDamasCasa();
  initLuzCasaUI();
  try { changeReputation('submundo', 1, `Interação na Luz Vermelha: ${d.nome}`, true); } catch (e) {}
}

/** Gera nova dama — só a Dona “contrata”; aqui simula oferta interna da Casa */
function luzGerarDamaCasa() {
  const st = getLuzCasaState();
  const nome = (typeof DAMAS_NOMES !== 'undefined' ? DAMAS_NOMES[Math.floor(Math.random()*DAMAS_NOMES.length)] : 'Nova') + ' ' +
    (typeof DAMAS_SOBRE !== 'undefined' ? DAMAS_SOBRE[Math.floor(Math.random()*DAMAS_SOBRE.length)] : 'Lux');
  const raca = LUZ_RACAS[Math.floor(Math.random() * LUZ_RACAS.length)];
  const classe = LUZ_CLASSES[Math.floor(Math.random() * LUZ_CLASSES.length)];
  const dama = {
    id: 'dama-casa-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 4),
    nome, raca, classe,
    P: 1 + Math.floor(Math.random() * 4),
    H: 3 + Math.floor(Math.random() * 5),
    R: 2 + Math.floor(Math.random() * 4),
    aparencia: 5 + Math.floor(Math.random() * 6),
    afeto: 10 + Math.floor(Math.random() * 25),
    emServico: true
  };
  st.damas.push(dama);
  setLuzCasaState(st);
  luzRenderListaDamasCasa();
  initLuzCasaUI();
  alert(`${LUZ_DONA.nome} apresentou uma nova dama: ${dama.nome} (${dama.raca} · ${dama.classe}).`);
}

/**
 * Contrata serviço pago (cliente). Dinheiro vai para a Casa/Dona — não para o PJ.
 */
function luzContratarServicoDama(tipo) {
  if (!_luzDamaSelId) return;
  const st = getLuzCasaState();
  if (st.banido) { alert('Você está banido da Casa.'); return; }
  const idx = st.damas.findIndex(x => x.id === _luzDamaSelId);
  if (idx < 0) return;
  const d = st.damas[idx];
  if (d.emServico === false) {
    alert(`${d.nome} está ocupada. A Dona sugere outra hora.`);
    return;
  }
  const precos = luzCalcPrecos(d);
  const mapa = {
    conversa: { preco: precos.conversa, label: 'Companhia / Conversa', afeto: [1, 3], mana: true, heal: false },
    encontro: { preco: precos.encontro, label: 'Encontro Particular', afeto: [2, 5], mana: true, heal: true },
    festa: { preco: precos.festa, label: 'Festa & Evento', afeto: [3, 6], mana: true, heal: true },
    exclusivo: { preco: precos.exclusivo, label: 'Serviço Exclusivo', afeto: [5, 10], mana: true, heal: true }
  };
  const cfg = mapa[tipo];
  if (!cfg) return;

  const heroId = document.getElementById('marketHeroSelect')?.value;
  const chars = typeof getSaved === 'function' ? getSaved() : [];
  const cidx = chars.findIndex(c => c.id === heroId);
  if (cidx < 0) { alert('Selecione o herói no mercado.'); return; }
  if ((chars[cidx].ouro || 0) < cfg.preco) {
    alert(`A Casa cobra ${cfg.preco} Tibar (você tem ${chars[cidx].ouro || 0}).`);
    return;
  }
  if (!confirm(`${cfg.label} com ${d.nome}\nCusto: ${cfg.preco} Tibar (pago à Casa)\nConfirmar?`)) return;

  chars[cidx].ouro -= cfg.preco;
  const c = typeof normalizeCharacter === 'function' ? normalizeCharacter(chars[cidx]) : chars[cidx];
  let notes = [];
  if (cfg.mana) {
    if (typeof c.pmAtual !== 'number') c.pmAtual = c.pmMax || 5;
    const m = 1 + Math.floor(Math.random() * 6) + Math.floor((d.aparencia || 5) / 3);
    const before = c.pmAtual;
    c.pmAtual = Math.min(c.pmMax || 5, c.pmAtual + m);
    notes.push(`+${c.pmAtual - before} PM`);
  }
  if (cfg.heal) {
    if (typeof c.pvAtual !== 'number') c.pvAtual = c.pvMax || 10;
    const h = 1 + Math.floor(Math.random() * 6) + Math.floor((d.H || 0) / 2);
    const before = c.pvAtual;
    c.pvAtual = Math.min(c.pvMax || 10, c.pvAtual + h);
    notes.push(`+${c.pvAtual - before} PV`);
  }
  if (c.status === 'faminto' || c.status === 'dormindo') c.status = 'normal';
  if (tipo === 'exclusivo') c.status = 'abençoado';
  chars[cidx] = c;
  setSaved(chars);

  const afGain = cfg.afeto[0] + Math.floor(Math.random() * (cfg.afeto[1] - cfg.afeto[0] + 1));
  d.afeto = Math.min(100, (d.afeto || 0) + afGain);
  st.damas[idx] = d;
  setLuzCasaState(st);
  luzAjustarConfianca(tipo === 'exclusivo' ? 2 : 1, `Cliente pagante: ${cfg.label}`);

  try {
    changeReputation('submundo', tipo === 'exclusivo' ? 3 : 1, `Serviço ${cfg.label}: ${d.nome}`, true);
    changeReputation('igreja', -1, 'Visitou a Casa da Luz Vermelha', true);
  } catch (e) {}

  const res = document.getElementById('luzInteracaoResult');
  if (res) {
    res.innerHTML = `<strong>🛎️ ${cfg.label} com ${esc(d.nome)}</strong><br>
      −${cfg.preco} Tibar (pago à Casa / Dona)<br>
      ${notes.join(' · ')} · Afeto +${afGain} → ${d.afeto}/100`;
  }
  luzSelecionarDama(d.id);
  initLuzCasaUI();
  alert(`🛎️ ${cfg.label} com ${d.nome}\n−${cfg.preco} Tibar à Casa\n${notes.join(', ')}\nAfeto +${afGain}`);
}

/**
 * Comprar contrato de dama da Casa = a Dona vende o contrato (ela decide).
 * Mantido como negócio legítimo de mercado com a proprietária.
 */
function luzContratarDamaSelecionada() {
  if (!_luzDamaSelId) return;
  const st = getLuzCasaState();
  if (st.banido) { alert('Banido. A Dona não negocia com você.'); return; }
  if ((st.confianca || 0) < 20) {
    alert(`${LUZ_DONA.nome}: “Ainda não confio o bastante para vender um contrato a você.”`);
    return;
  }
  const d = st.damas.find(x => x.id === _luzDamaSelId);
  if (!d) return;
  const heroId = document.getElementById('marketHeroSelect')?.value;
  const chars = typeof getSaved === 'function' ? getSaved() : [];
  const cidx = chars.findIndex(c => c.id === heroId);
  if (cidx < 0) { alert('Selecione o herói comprador no mercado.'); return; }
  const p = luzCalcPrecos(d);
  const preco = Math.round(p.exclusivo * 1.2);
  if ((chars[cidx].ouro || 0) < preco) {
    alert(`Contrato pedido pela Dona: ${preco} Tibar (tem ${chars[cidx].ouro || 0}).`);
    return;
  }
  if (!confirm(`${LUZ_DONA.nome} oferece o contrato de ${d.nome} por ${preco} Tibar.\nEla deixa de ser da Casa e passa a ser escrava de luxo de ${chars[cidx].nome}.\nAceitar?`)) return;
  chars[cidx].ouro -= preco;
  setSaved(chars);
  st.damas = st.damas.filter(x => x.id !== d.id);
  setLuzCasaState(st);
  luzAjustarConfianca(3, `Comprou contrato de ${d.nome}`);

  const servo = {
    id: 'servo_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
    nome: d.nome, sexo: 'F', sexoLabel: 'Mulher',
    tipo: 'formoso', luxo: true, motivo: 'outro',
    P: d.P || 0, H: d.H || 1, R: d.R || 1,
    aparencia: d.aparencia || 7,
    afeto: Math.max(15, d.afeto || 15),
    pericias: [],
    clausulas: { prazo: false, resgate: true, heranca: false, semManumissao: false },
    notas: `Contrato vendido por ${LUZ_DONA.nome} (${d.raca || ''} · ${d.classe || ''}).`,
    contratoAtivo: true, ownerId: heroId,
    criadoEm: new Date().toISOString(),
    historicoAfeto: [{ time: new Date().toLocaleString('pt-BR'), delta: 0, before: d.afeto, after: d.afeto, reason: 'Contrato com a Dona' }],
    XP: 0, maxPoints: 0, pontosLivres: 0,
    raca: d.raca, classe: d.classe
  };
  const servos = getServos();
  servos.unshift(servo);
  setServos(servos);
  try {
    changeReputation('submundo', 3, `Contrato de luxo: ${d.nome}`, true);
    changeReputation('igreja', -2, 'Negócio na Casa da Luz Vermelha', true);
  } catch (e) {}
  if (typeof pushServoLog === 'function') pushServoLog(`💎 Contrato com a Dona: <strong>${esc(d.nome)}</strong> → escrava de luxo (−${preco}T).`);
  _luzDamaSelId = null;
  document.getElementById('luzFichaDamaPanel')?.classList.add('hidden');
  initLuzCasaUI();
  luzRenderListaDamasCasa();
  alert(`${LUZ_DONA.nome}: “Trato fechado. ${d.nome} é sua responsabilidade agora.”`);
}

/** Expira parcerias da Luz Vermelha cujo prazo terminou (chamado a cada novo dia). */
function processarParceriasLuzNoDia() {
  const avisos = [];
  try {
    const st = getLuzCasaState();
    if (!st || !Array.isArray(st.alocados) || !st.alocados.length) return avisos;
    const day = (typeof timeState !== 'undefined' && timeState) ? (timeState.day || 1) : 1;
    const keep = [];
    st.alocados.forEach(a => {
      if (a.diaFim && day >= a.diaFim) {
        avisos.push(`Casa da Luz: prazo de ${a.nome || 'escrava'} encerrou — ela voltou para você.`);
        st.historico = st.historico || [];
        st.historico.unshift({ data: new Date().toLocaleString('pt-BR'), valor: 0, tipo: 'fim_prazo', nome: a.nome, dia: day });
        try { luzAjustarConfianca(1, 'Prazo de parceria cumprido'); } catch (e) {}
      } else {
        keep.push(a);
      }
    });
    if (keep.length !== st.alocados.length) {
      st.alocados = keep;
      setLuzCasaState(st);
    }
  } catch (e) {}
  return avisos;
}

function luzCarregarSelectEscravos() {
  const sel = document.getElementById('luzEscravoSelect');
  if (!sel) return;
  const heroId = document.getElementById('marketHeroSelect')?.value;
  const owned = heroId && typeof getServosOfOwner === 'function' ? getServosOfOwner(heroId) : [];
  const st = getLuzCasaState();
  const alocIds = new Set((st.alocados || []).map(a => a.servoId));
  sel.innerHTML = '<option value="">— Selecione quem propor —</option>' +
    owned.map(s => `<option value="${s.id}" ${alocIds.has(s.id) ? 'disabled' : ''}>${esc(s.nome)} · Apar ${s.aparencia||5} · Afeto ${s.afeto||0}${alocIds.has(s.id) ? ' (em parceria)' : ''}</option>`).join('');
  document.getElementById('luzRendaPreview')?.classList.add('hidden');
}

function luzCalcRendaEscravo(apar, afeto) {
  return Math.round((Number(apar) || 5) * 20 + (Number(afeto) || 0) / 5 + 10);
}

function luzAtualizarRendaPreview() {
  const id = document.getElementById('luzEscravoSelect')?.value;
  const box = document.getElementById('luzRendaPreview');
  if (!box) return;
  if (!id) { box.classList.add('hidden'); return; }
  const s = getServoById(id);
  if (!s) { box.classList.add('hidden'); return; }
  const renda = luzCalcRendaEscravo(s.aparencia, s.afeto);
  const pct = parseInt(document.getElementById('luzPropPct')?.value || '60', 10);
  const parte = Math.round(renda * pct / 100);
  box.classList.remove('hidden');
  box.innerHTML = `<strong>${esc(s.nome)}</strong> · Apar ${s.aparencia}/10 · Afeto ${s.afeto}/100<br>
    Lucro bruto estimado: <strong>${renda} Tibar/dia</strong><br>
    Sua parte se aceito a ${pct}%: <strong style="color:var(--success)">${parte} Tibar/dia</strong>
    <div style="font-size:0.75rem; color:var(--muted);">A Dona fica com o restante · sujeita a avaliação</div>`;
}

/**
 * Negociação com a Dona: aceita / recusa / contrapropõe conforme confiança + atributos.
 */
function luzProporParceria() {
  const st = getLuzCasaState();
  if (st.banido) {
    alert(`${LUZ_DONA.nome}: “Não. Saia.”`);
    return;
  }
  const id = document.getElementById('luzEscravoSelect')?.value;
  if (!id) { alert('Escolha uma escrava para propor.'); return; }
  const s = getServoById(id);
  if (!s || !s.ownerId) return;
  if ((st.alocados || []).some(a => a.servoId === id)) {
    alert('Essa já está em parceria ativa.');
    return;
  }

  const diasPedidos = parseInt(document.getElementById('luzPropDias')?.value || '7', 10);
  const pctPedido = parseInt(document.getElementById('luzPropPct')?.value || '60', 10);
  const conf = st.confianca || 30;
  const apar = s.aparencia || 5;
  const afeto = s.afeto || 0;

  // Avaliação da Dona
  let score = conf * 0.5 + apar * 6 + Math.min(20, afeto / 5);
  try {
    const rSub = typeof getRep === 'function' ? getRep('submundo') : 0;
    score += Math.max(-10, Math.min(15, rSub / 5));
  } catch (e) {}
  if (pctPedido >= 80) score -= 15;
  if (pctPedido >= 70) score -= 8;
  if (diasPedidos >= 30) score -= 5;
  if ((st.alocados || []).length >= 3) score -= 20; // lotação

  const roll = Math.random() * 100;
  let resultado = 'recusa';
  let pctFinal = pctPedido;
  let diasFinal = diasPedidos;
  let fala = '';

  if (score < 25 || roll > score + 40) {
    resultado = 'recusa';
    fala = `${LUZ_DONA.nome}: “Não, querido. ${esc(s.nome)} não encaixa agora — ou eu ainda não confio o bastante em você. Volte quando tiver mais prestígio… ou uma proposta mais humilde.”`;
    luzAjustarConfianca(-1, 'Proposta recusada');
  } else if (score < 45 || pctPedido > conf / 1.5 + 40) {
    // Contraproposta
    resultado = 'contra';
    pctFinal = Math.max(40, Math.min(pctPedido - 10, 55 + Math.floor(conf / 10)));
    diasFinal = Math.min(diasPedidos, conf >= 50 ? 14 : 7);
    fala = `${LUZ_DONA.nome}: “Interessante… mas ${pctPedido}% é generoso demais para o que ofereço. Aceito ${esc(s.nome)} por ${diasFinal} dias, com ${pctFinal}% para você. O resto fica com a Casa. Fecho nesses termos?”`;
  } else {
    resultado = 'aceita';
    // Pequeno ajuste se confiança alta
    if (conf >= 70 && pctPedido <= 70) pctFinal = Math.min(80, pctPedido + 5);
    fala = `${LUZ_DONA.nome}: “Muito bem. Aceito ${esc(s.nome)} por ${diasFinal} dias. Você recebe ${pctFinal}% do que ela gerar; a Casa fica com o restante. Trate de honrar o acordo.”`;
  }

  const box = document.getElementById('luzNegociacaoResult');
  if (box) {
    box.innerHTML = `<div style="background:rgba(245,158,11,0.1); border:1px solid rgba(245,158,11,0.35); border-radius:10px; padding:12px;">
      <strong style="color:#fbbf24;">Negociação</strong>
      <p style="margin:8px 0; font-style:italic;">${fala}</p>
      ${resultado === 'aceita' ? `<button class="btn btn-sm btn-success" onclick="luzAceitarParceria('${id}',${diasFinal},${pctFinal})">✅ Firmar acordo (${diasFinal}d · ${pctFinal}%)</button>` : ''}
      ${resultado === 'contra' ? `<button class="btn btn-sm btn-success" onclick="luzAceitarParceria('${id}',${diasFinal},${pctFinal})">✅ Aceitar contraproposta (${diasFinal}d · ${pctFinal}%)</button>
        <button class="btn btn-sm btn-outline" onclick="document.getElementById('luzNegociacaoResult').innerHTML=''">Recusar e sair</button>` : ''}
      ${resultado === 'recusa' ? `<span style="color:var(--muted); font-size:0.85rem;">Melhore a confiança da Dona (pagar serviços, cumprir acordos, reputação no Submundo).</span>` : ''}
    </div>`;
  }
  // Não troca de aba — mantém a tela de negociação visível para o jogador aceitar
  try {
    const st2 = getLuzCasaState();
    const confEl = document.getElementById('luzConfiancaDisplay');
    const confBar = document.getElementById('luzConfiancaBar');
    const lab = luzConfiancaLabel(st2.confianca);
    if (confEl) confEl.innerHTML = `${st2.confianca}/100 <span style="font-size:0.75rem;color:${lab.color}">${lab.text}</span>`;
    if (confBar) confBar.style.width = Math.min(100, st2.confianca) + '%';
  } catch (e) {}
}

function luzAceitarParceria(servoId, dias, pct) {
  const s = getServoById(servoId);
  if (!s) return;
  const st = getLuzCasaState();
  if ((st.alocados || []).some(a => a.servoId === servoId)) return;
  const day = (typeof timeState !== 'undefined' && timeState) ? (timeState.day || 1) : 1;
  st.alocados.push({
    servoId: s.id,
    ownerId: s.ownerId,
    nome: s.nome,
    aparencia: s.aparencia || 5,
    afeto: s.afeto || 0,
    data: new Date().toLocaleDateString('pt-BR'),
    dias: dias,
    pctPj: pct,
    diaInicio: day,
    diaFim: day + dias,
    funcoes: 'Serviços da casa sob supervisão da Dona'
  });
  setLuzCasaState(st);
  luzAjustarConfianca(2, `Parceria firmada: ${s.nome}`);
  try { changeReputation('submundo', 1, `Parceria na Luz Vermelha: ${s.nome}`, true); } catch (e) {}
  alert(`Acordo firmado com ${LUZ_DONA.nome}.\n\n${s.nome} · ${dias} dias · você recebe ${pct}% do lucro gerado.\nAo fim do prazo, ela retorna a você.`);
  const box = document.getElementById('luzNegociacaoResult');
  if (box) box.innerHTML = '';
  luzCarregarSelectEscravos();
  luzRenderAlocados();
  initLuzCasaUI(true);
  switchLuzSubTab('escravos');
  luzCalcularRendimentoUI();
}

function luzEncerrarParceria(servoId, motivo) {
  const st = getLuzCasaState();
  const a = (st.alocados || []).find(x => x.servoId === servoId);
  st.alocados = (st.alocados || []).filter(x => x.servoId !== servoId);
  setLuzCasaState(st);
  if (motivo === 'dona') {
    luzAjustarConfianca(-3, 'Dona encerrou parceria');
    alert(`${LUZ_DONA.nome} encerrou o contrato de ${a ? a.nome : 'escrava'}. Ela volta para você.`);
  } else if (motivo === 'prazo') {
    luzAjustarConfianca(1, 'Prazo cumprido');
    alert(`Prazo encerrado. ${a ? a.nome : 'Escrava'} retorna a você. A Dona agradece o cumprimento do acordo.`);
  } else {
    luzAjustarConfianca(0, 'PJ retirou escrava');
    alert(`${a ? a.nome : 'Escrava'} retirada da parceria.`);
  }
  luzCarregarSelectEscravos();
  luzRenderAlocados();
  initLuzCasaUI();
  luzCalcularRendimentoUI();
}

function luzRenderAlocados() {
  const el = document.getElementById('luzListaAlocados');
  if (!el) return;
  const st = getLuzCasaState();
  const day = (typeof timeState !== 'undefined' && timeState) ? (timeState.day || 1) : 1;
  // sync + expirar prazos
  const still = [];
  (st.alocados || []).forEach(a => {
    const s = getServoById(a.servoId);
    if (!s) return; // sumiu
    if (a.diaFim && day >= a.diaFim) {
      // expira no render — avisa uma vez via histórico
      return;
    }
    still.push({
      ...a,
      aparencia: s.aparencia || a.aparencia,
      afeto: s.afeto || a.afeto,
      nome: s.nome
    });
  });
  // Processar expirados
  (st.alocados || []).forEach(a => {
    if (a.diaFim && day >= a.diaFim && getServoById(a.servoId)) {
      st.historico = st.historico || [];
      st.historico.unshift({ data: new Date().toLocaleString('pt-BR'), valor: 0, tipo: 'fim_prazo', nome: a.nome, dia: day });
    }
  });
  st.alocados = still;
  setLuzCasaState(st);

  if (!st.alocados.length) {
    el.innerHTML = '<p style="color:var(--muted); text-align:center; padding:12px;">Nenhuma parceria ativa. Proponha à Dona.</p>';
    return;
  }
  el.innerHTML = st.alocados.map(a => {
    const renda = luzCalcRendaEscravo(a.aparencia, a.afeto);
    const parte = Math.round(renda * (a.pctPj || 50) / 100);
    const diasRest = a.diaFim ? Math.max(0, a.diaFim - day) : '?';
    return `
      <div class="char-card" style="border-color:rgba(245,158,11,0.4);">
        <div>
          <strong>${esc(a.nome)}</strong>
          <div style="font-size:0.82rem; color:var(--muted);">
            ${a.pctPj || 50}% para você · ${diasRest} dia(s) restantes · desde ${esc(a.data || '—')}
          </div>
          <div style="font-size:0.8rem; color:var(--muted);">Apar ${a.aparencia}/10 · Afeto ${a.afeto}/100</div>
          <div style="font-weight:800; color:#fbbf24; margin-top:4px;">💰 ~${parte} Tibar/dia (sua parte de ${renda})</div>
        </div>
        <div style="display:flex; flex-direction:column; gap:4px;">
          <button class="btn btn-sm btn-outline" onclick="luzEncerrarParceria('${a.servoId}','pj')">Retirar</button>
        </div>
      </div>`;
  }).join('');
}

function luzCalcularRendimento() {
  const st = getLuzCasaState();
  let bruto = 0, partePj = 0, parteCasa = 0;
  (st.alocados || []).forEach(a => {
    const s = getServoById(a.servoId);
    const apar = s ? s.aparencia : a.aparencia;
    const af = s ? s.afeto : a.afeto;
    const renda = luzCalcRendaEscravo(apar, af);
    const pct = a.pctPj || 50;
    const pj = Math.round(renda * pct / 100);
    bruto += renda;
    partePj += pj;
    parteCasa += (renda - pj);
  });
  return { rendDamas: parteCasa, rendEscravos: bruto, total: partePj };
}

function luzCalcularRendimentoUI() {
  const r = luzCalcularRendimento();
  const a = document.getElementById('luzRendDamas');
  const b = document.getElementById('luzRendEscravos');
  const c = document.getElementById('luzRendTotal');
  if (a) a.textContent = r.rendDamas + ' T';
  if (b) b.textContent = r.rendEscravos + ' T';
  if (c) c.textContent = r.total + ' T';
  const hist = document.getElementById('luzHistoricoRenda');
  const st = getLuzCasaState();
  if (hist) {
    if (!(st.historico || []).length) {
      hist.innerHTML = '<p style="color:var(--muted); text-align:center;">Nenhum pagamento registrado.</p>';
    } else {
      hist.innerHTML = st.historico.slice(0, 15).map(h => {
        if (h.tipo === 'fim_prazo') {
          return `<div style="border-bottom:1px solid var(--border); padding:6px 0;">
            <span style="color:var(--muted);">Prazo encerrado: ${esc(h.nome || '')} · dia ${h.dia || '?'}</span>
          </div>`;
        }
        return `<div style="border-bottom:1px solid var(--border); padding:6px 0;">
          <strong style="color:var(--success);">+${h.valor} Tibar</strong>
          <span style="color:var(--muted); font-size:0.78rem;"> · ${esc(h.data)}</span>
          <div style="font-size:0.75rem; color:var(--muted);">Sua parte · bruto ${h.escravos || 0} · Casa ${h.damas || 0}${h.paraHeroi ? ' → ' + esc(h.paraHeroi) : ''}</div>
        </div>`;
      }).join('');
    }
  }
}

function luzReceberRendimento() {
  const st = getLuzCasaState();
  if (st.banido) { alert('Banido — a Dona não paga parcerias a você.'); return; }
  const day = (typeof timeState !== 'undefined' && timeState) ? (timeState.day || 1) : 1;
  if (st.ultimoDiaColetado === day) {
    alert('Sua parte de hoje já foi paga. Avance o dia da campanha.');
    return;
  }
  // expirar parcerias vencidas antes
  luzRenderAlocados();
  const r = luzCalcularRendimento();
  if (r.total <= 0) { alert('Nenhuma parceria ativa gerando lucro para você.'); return; }

  const chars = typeof getSaved === 'function' ? getSaved() : [];
  const byOwner = {};
  (getLuzCasaState().alocados || []).forEach(a => {
    const s = getServoById(a.servoId);
    const apar = s ? s.aparencia : a.aparencia;
    const af = s ? s.afeto : a.afeto;
    const renda = luzCalcRendaEscravo(apar, af);
    const pj = Math.round(renda * (a.pctPj || 50) / 100);
    const oid = a.ownerId;
    byOwner[oid] = (byOwner[oid] || 0) + pj;
    try { addServoXP(a.servoId, 1, 'Dia de parceria na Luz Vermelha'); } catch (e) {}
  });
  let heroNome = '—';
  Object.keys(byOwner).forEach(oid => {
    const i = chars.findIndex(c => c.id === oid);
    if (i >= 0) {
      chars[i].ouro = (chars[i].ouro || 0) + byOwner[oid];
      heroNome = chars[i].nome;
    }
  });
  if (Object.keys(byOwner).length) setSaved(chars);

  const st2 = getLuzCasaState();
  st2.ultimoDiaColetado = day;
  st2.historico = st2.historico || [];
  st2.historico.unshift({
    data: new Date().toLocaleString('pt-BR'),
    valor: r.total,
    damas: r.rendDamas,
    escravos: r.rendEscravos,
    paraHeroi: heroNome,
    dia: day
  });
  if (st2.historico.length > 40) st2.historico = st2.historico.slice(0, 40);
  setLuzCasaState(st2);
  luzAjustarConfianca(1, 'Recebeu e honrou a parceria do dia');

  try { changeReputation('submundo', 1, 'Parceria honrada na Luz Vermelha', true); } catch (e) {}

  alert(`${LUZ_DONA.nome} liquida o dia ${day}.\n\nLucro bruto (suas escravas): ${r.rendEscravos} Tibar\nParte da Casa: ${r.rendDamas} Tibar\nSua parte: +${r.total} Tibar`);
  initLuzCasaUI();
  luzCalcularRendimentoUI();
}

/* ===== [DAMAS_LUXO] linhas originais 12775-13041 ===== */
/* ==================== DAMAS DE LUXO (Casa da Luz Vermelha) ==================== */
const DAMAS_NOMES = ['Velvet','Rose','Scarlet','Luna','Ivy','Celeste','Mira','Saffron','Ophelia','Jade','Serena','Nyx','Fleur','Isabelle','Cora'];
const DAMAS_SOBRE = ['Darling','Vale','Noir','Bloom','Ash','Hart','Quinn','Frost','Lane','Cross'];

function getDamasMercado() {
  try {
    const arr = storeGetJSON(KEYS.damasMercado, []);
    return Array.isArray(arr) ? arr : [];
  } catch (e) { return []; }
}
function setDamasMercado(list) { storeSet(KEYS.damasMercado, Array.isArray(list) ? list : []); }

function gerarDamaLuxoMercado() {
  const nome = DAMAS_NOMES[Math.floor(Math.random() * DAMAS_NOMES.length)] + ' ' +
    DAMAS_SOBRE[Math.floor(Math.random() * DAMAS_SOBRE.length)];
  const apar = 7 + Math.floor(Math.random() * 4); // 7–10
  const P = 0 + Math.floor(Math.random() * 2);
  const H = 1 + Math.floor(Math.random() * 3);
  const R = 1 + Math.floor(Math.random() * 2);
  const preco = Math.round((120 + apar * 25 + (P + H + R) * 12) * 1.4); // luxo
  const dama = {
    id: 'dama_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
    nome,
    sexo: 'F',
    sexoLabel: 'Mulher',
    aparencia: apar,
    P, H, R,
    pericias: ['Persuasão', 'Música'].slice(0, 1 + Math.floor(Math.random() * 2)),
    preco,
    afetoBase: 15,
    desc: 'Dama de companhia da Casa da Luz Vermelha. Contrato de luxo incluso.'
  };
  const list = getDamasMercado();
  list.unshift(dama);
  if (list.length > 12) list.length = 12;
  setDamasMercado(list);
  renderDamasLuxoMercado();
}

function renderDamasLuxoMercado() {
  const el = document.getElementById('damasLuxoList');
  if (!el) return;
  const list = getDamasMercado();
  if (!list.length) {
    el.innerHTML = '<p style="color:var(--muted); font-size:0.85rem;">Nenhuma dama listada. Clique em “Gerar dama disponível”.</p>';
    return;
  }
  let mod = 1.0;
  try {
    const rSub = (typeof getRep === 'function') ? getRep('submundo') : 0;
    if (rSub >= 40) mod = 0.85;
    else if (rSub >= 15) mod = 0.92;
    else if (rSub <= -30) mod = 1.2;
  } catch (e) {}
  el.innerHTML = list.map(d => {
    const price = Math.max(1, Math.round(d.preco * mod));
    const ap = typeof aparenciaBonus === 'function' ? aparenciaBonus(d.aparencia) : { label: d.aparencia };
    return `
      <div style="display:flex; justify-content:space-between; gap:10px; background:var(--bg-input); border:1px solid rgba(236,72,153,0.35); border-radius:10px; padding:12px; margin-bottom:8px; flex-wrap:wrap;">
        <div>
          <strong style="color:#f472b6;">💎 ${esc(d.nome)}</strong>
          <div style="font-size:0.82rem; color:var(--muted);">Aparência ${d.aparencia}/10 (${ap.label || ''}) · P${d.P} H${d.H} R${d.R}</div>
          <div style="font-size:0.78rem; color:var(--muted);">${(d.pericias || []).join(', ') || '—'} · ${esc(d.desc || '')}</div>
        </div>
        <div style="text-align:right;">
          <div style="font-weight:800; color:#fbbf24; margin-bottom:6px;">${price} Tibar</div>
          <button class="btn btn-sm" style="background:linear-gradient(135deg,#be185d,#9d174d);color:#fff;" onclick="comprarDamaLuxo('${d.id}')">Comprar contrato</button>
        </div>
      </div>`;
  }).join('');
}

function comprarDamaLuxo(damaId) {
  const list = getDamasMercado();
  const d = list.find(x => x.id === damaId);
  if (!d) return;
  const heroId = document.getElementById('marketHeroSelect')?.value;
  const chars = typeof getSaved === 'function' ? getSaved() : [];
  const cidx = chars.findIndex(c => c.id === heroId);
  if (cidx < 0) { alert('Selecione o herói comprador.'); return; }
  let mod = 1.0;
  try {
    const rSub = (typeof getRep === 'function') ? getRep('submundo') : 0;
    if (rSub >= 40) mod = 0.85;
    else if (rSub >= 15) mod = 0.92;
    else if (rSub <= -30) mod = 1.2;
  } catch (e) {}
  const price = Math.max(1, Math.round(d.preco * mod));
  if ((chars[cidx].ouro || 0) < price) {
    alert(`Ouro insuficiente (${chars[cidx].ouro || 0} / ${price}).`);
    return;
  }
  if (!confirm(`Comprar contrato de ${d.nome} por ${price} Tibar?\nEla se tornará escrava de luxo de ${chars[cidx].nome} (servo Formoso, Afeto ${d.afetoBase || 15}).`)) return;

  chars[cidx].ouro -= price;
  setSaved(chars);

  const servo = {
    id: 'servo_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
    nome: d.nome,
    sexo: 'F',
    sexoLabel: 'Mulher',
    tipo: 'formoso',
    luxo: true,
    motivo: 'outro',
    P: d.P || 0,
    H: d.H || 1,
    R: d.R || 1,
    aparencia: d.aparencia || 7,
    afeto: d.afetoBase || 15,
    pericias: Array.isArray(d.pericias) ? [...d.pericias] : [],
    clausulas: { prazo: false, resgate: true, heranca: false, semManumissao: false },
    notas: 'Escrava de luxo — contrato da Casa da Luz Vermelha.',
    contratoAtivo: true,
    ownerId: heroId,
    criadoEm: new Date().toISOString(),
    historicoAfeto: [{
      time: new Date().toLocaleString('pt-BR'),
      delta: 0, before: d.afetoBase || 15, after: d.afetoBase || 15,
      reason: 'Contrato de luxo (Casa da Luz Vermelha)'
    }],
    XP: 0,
    maxPoints: 0,
    pontosLivres: 0
  };
  const servos = typeof getServos === 'function' ? getServos() : [];
  servos.unshift(servo);
  setServos(servos);
  setDamasMercado(list.filter(x => x.id !== damaId));

  try {
    if (typeof changeReputation === 'function') {
      changeReputation('submundo', 3, `Comprou contrato de luxo: ${d.nome}`, true);
      changeReputation('igreja', -2, 'Negócio na Casa da Luz Vermelha', true);
    }
  } catch (e) {}
  if (typeof pushServoLog === 'function') {
    pushServoLog(`💎 <strong>${esc(d.nome)}</strong> contratada como escrava de luxo de ${esc(chars[cidx].nome)} (−${price} Tibar).`);
  }
  renderDamasLuxoMercado();
  renderLuzServoWorkPanel();
  updateApostasStatusLine();
  alert(`💎 ${d.nome} agora é escrava de luxo de ${chars[cidx].nome}.\nVeja em Servos Contratuais.`);
}

/** Painel: trabalho / encontro / afeto / venda 90% com servos do herói */
function renderLuzServoWorkPanel() {
  const el = document.getElementById('luzServoWorkPanel');
  if (!el) return;
  const heroId = document.getElementById('marketHeroSelect')?.value;
  if (!heroId) {
    el.innerHTML = '<p style="color:var(--muted); font-size:0.85rem;">Selecione um herói no topo do mercado.</p>';
    return;
  }
  const owned = typeof getServosOfOwner === 'function' ? getServosOfOwner(heroId) : [];
  if (!owned.length) {
    el.innerHTML = '<p style="color:var(--muted); font-size:0.85rem;">Este herói não possui servos. Compre uma dama ou capture/registre escravos.</p>';
    return;
  }
  el.innerHTML = owned.map(s => {
    const ap = Number(s.aparencia) || 5;
    const af = Number(s.afeto) || 0;
    const diaria = Math.max(5, Math.round(8 + ap * 2 + af * 0.15));
    const encontro = Math.max(15, Math.round(20 + ap * 5 + af * 0.25));
    const preco = typeof calcServoPreco === 'function' ? calcServoPreco(s) : 100;
    const venda90 = Math.round(preco * 0.9);
    const luxoTag = s.luxo ? ' <span class="tag" style="border-color:#f472b6;color:#f472b6">Luxo</span>' : '';
    return `
      <div style="background:var(--bg-input); border:1px solid var(--border); border-radius:10px; padding:10px; margin-bottom:8px;">
        <div style="font-weight:700;">${esc(s.nome)}${luxoTag} · Afeto ${af}/100 · Apar ${ap} · XP ${s.XP || 0}</div>
        <div style="display:flex; flex-wrap:wrap; gap:6px; margin-top:8px;">
          <button class="btn btn-sm btn-success" style="width:auto;" onclick="luzDiariaServo('${s.id}')">💎 Diária (+${diaria} Tibar)</button>
          <button class="btn btn-sm" style="width:auto; background:#db2777;color:#fff;" onclick="luzEncontroParticular('${s.id}')">💌 Encontro (${encontro} ao herói?)</button>
          <button class="btn btn-sm btn-outline" style="width:auto;" onclick="luzNegociarAfeto('${s.id}')">🤝 Negociar Afeto (+15–30)</button>
          <button class="btn btn-sm btn-outline" style="width:auto;" onclick="luzVendaPremium('${s.id}')">📜 Venda 90% (${venda90})</button>
          <button class="btn btn-sm btn-outline" style="width:auto;" onclick="addServoXP('${s.id}', 2, 'Treino na casa'); alert(' +2 XP de treino'); renderLuzServoWorkPanel();">⭐ +2 XP treino</button>
        </div>
      </div>`;
  }).join('');
}

function luzDiariaServo(servoId) {
  const s = getServoById(servoId);
  if (!s || !s.ownerId) return;
  const chars = getSaved();
  const idx = chars.findIndex(c => c.id === s.ownerId);
  if (idx < 0) return;
  const ap = Number(s.aparencia) || 5;
  const af = Number(s.afeto) || 0;
  const diaria = Math.max(5, Math.round(8 + ap * 2 + af * 0.15));
  chars[idx].ouro = (chars[idx].ouro || 0) + diaria;
  setSaved(chars);
  // Afeto: se tratado bem (afeto alto) sobe um pouco; se baixo pode cair
  let dAf = 0;
  if (af >= 60) dAf = 1 + Math.floor(Math.random() * 2);
  else if (af < 25) dAf = -1 - Math.floor(Math.random() * 2);
  else dAf = Math.random() < 0.5 ? 1 : 0;
  if (dAf !== 0 && typeof ajustarAfetoServo === 'function') ajustarAfetoServo(servoId, dAf, 'Diária na Casa da Luz Vermelha');
  addServoXP(servoId, 1, 'Diária de trabalho');
  try { changeReputation('submundo', 1, 'Servo trabalhou na Luz Vermelha', true); } catch (e) {}
  alert(`💎 Diária de ${s.nome}: +${diaria} Tibar para ${chars[idx].nome}.${dAf ? ' Afeto ' + (dAf > 0 ? '+' : '') + dAf + '.' : ''}`);
  renderLuzServoWorkPanel();
  updateApostasStatusLine();
}

function luzEncontroParticular(servoId) {
  // Herói "paga" o encontro à casa mas o valor é simbólico — recupera ânimo; servo ganha afeto/XP
  const s = getServoById(servoId);
  if (!s || !s.ownerId) return;
  const chars = getSaved();
  const idx = chars.findIndex(c => c.id === s.ownerId);
  if (idx < 0) return;
  const ap = Number(s.aparencia) || 5;
  const af = Number(s.afeto) || 0;
  const custo = Math.max(10, Math.round(12 + ap * 3)); // taxa da casa
  if ((chars[idx].ouro || 0) < custo) {
    alert(`Taxa da casa: ${custo} Tibar (saldo insuficiente).`);
    return;
  }
  chars[idx].ouro -= custo;
  // Cura leve PM
  const c = normalizeCharacter(chars[idx]);
  if (typeof c.pmAtual !== 'number') c.pmAtual = c.pmMax || 5;
  const mana = 1 + Math.floor(Math.random() * 6) + Math.floor(ap / 3);
  c.pmAtual = Math.min(c.pmMax || 5, c.pmAtual + mana);
  if (c.status === 'faminto' || c.status === 'dormindo') c.status = 'normal';
  chars[idx] = c;
  setSaved(chars);
  const dAf = 2 + Math.floor(Math.random() * 4);
  if (typeof ajustarAfetoServo === 'function') ajustarAfetoServo(servoId, dAf, 'Encontro particular (bem tratado)');
  addServoXP(servoId, 2, 'Encontro particular');
  try {
    changeReputation('submundo', 2, 'Encontro na Luz Vermelha', true);
    changeReputation('igreja', -1, 'Visitou a Casa da Luz Vermelha', true);
  } catch (e) {}
  alert(`💌 Encontro com ${s.nome}.\n−${custo} Tibar · +${mana} PM · Afeto do servo +${dAf}`);
  renderLuzServoWorkPanel();
}

function luzNegociarAfeto(servoId) {
  const gain = 15 + Math.floor(Math.random() * 16); // 15–30
  if (typeof ajustarAfetoServo === 'function') ajustarAfetoServo(servoId, gain, 'Negociação / carinho na Casa da Luz');
  addServoXP(servoId, 1, 'Negociação de afeto');
  alert(`🤝 Afeto +${gain}.`);
  renderLuzServoWorkPanel();
}

function luzVendaPremium(servoId) {
  const s = getServoById(servoId);
  if (!s || !s.ownerId) return;
  const preco = typeof calcServoPreco === 'function' ? calcServoPreco(s) : 100;
  const venda = Math.round(preco * 0.9);
  if (!confirm(`Vender ${s.nome} por ${venda} Tibar (90% do valor de mercado)?\nMelhor que o mercado comum (−20%).`)) return;
  const chars = getSaved();
  const idx = chars.findIndex(c => c.id === s.ownerId);
  if (idx < 0) return;
  chars[idx].ouro = (chars[idx].ouro || 0) + venda;
  setSaved(chars);
  setServos(getServos().filter(x => x.id !== servoId));
  if (typeof pushServoLog === 'function') pushServoLog(`📜 <strong>${esc(s.nome)}</strong> vendida na Luz Vermelha por ${venda} Tibar (90%).`);
  alert(`Vendido! +${venda} Tibar.`);
  renderLuzServoWorkPanel();
  if (typeof renderServoOwnedList === 'function') renderServoOwnedList();
  if (typeof renderServoMercado === 'function') renderServoMercado();
}


