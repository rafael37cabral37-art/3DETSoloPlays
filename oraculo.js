/* ===== [ORACULO] linhas originais 9700-10395 ===== */
/* ==================== ORÁCULO SOLO (detalhado) ==================== */
const ORACLE_LIKELIHOOD = [
  { label: 'Impossível', mod: -40 },
  { label: 'Muito Improvável', mod: -20 },
  { label: 'Improvável', mod: -10 },
  { label: '50/50', mod: 0 },
  { label: 'Provável', mod: 10 },
  { label: 'Muito Provável', mod: 20 },
  { label: 'Quase Certo', mod: 40 }
];

const ORACLE_YESNO_RESULTS = [
  { min: 1,  max: 10,  text: 'NÃO — e algo piora', type: 'no', intensity: 'extreme' },
  { min: 11, max: 25,  text: 'NÃO', type: 'no', intensity: 'hard' },
  { min: 26, max: 40,  text: 'NÃO, mas…', type: 'no', intensity: 'soft' },
  { min: 41, max: 55,  text: 'SIM, mas…', type: 'yes', intensity: 'soft' },
  { min: 56, max: 80,  text: 'SIM', type: 'yes', intensity: 'hard' },
  { min: 81, max: 95,  text: 'SIM — e algo melhora', type: 'yes', intensity: 'extreme' },
  { min: 96, max: 100, text: 'SIM absoluto / Reviravolta positiva', type: 'yes', intensity: 'critical' }
];

const ORACLE_ACTIONS = [
  'Ameaçar', 'Proteger', 'Investigar', 'Negociar', 'Atacar', 'Fugir', 'Espionar',
  'Curar', 'Invocar', 'Sabotar', 'Ajudar', 'Trair', 'Persuadir', 'Intimidar',
  'Explorar', 'Construir', 'Destruir', 'Roubar', 'Revelar', 'Ocultar',
  'Celebrar', 'Lamentar', 'Caçar', 'Capturar', 'Libertar', 'Convencer',
  'Desafiar', 'Unir', 'Dividir', 'Observar', 'Preparar', 'Atacar de surpresa'
];

const ORACLE_THEMES = [
  'Honra', 'Traição', 'Ambição', 'Medo', 'Amor', 'Vingança', 'Segredo',
  'Corrupção', 'Esperança', 'Desespero', 'Magia antiga', 'Deuses', 'Destino',
  'Guerra', 'Paz', 'Fome', 'Peste', 'Riqueza', 'Pobreza', 'Justiça',
  'Injustiça', 'Família', 'Lealdade', 'Ódio', 'Mistério', 'Profecia',
  'Sacrifício', 'Redenção', 'Orgulho', 'Humildade', 'Caos', 'Ordem'
];

const ORACLE_SUBJECTS = [
  'um nobre local', 'um mercador ambulante', 'um clérigo errante', 'um mago recluso',
  'um bando de bandidos', 'uma criatura mágica', 'um fantasma antigo', 'um artefato perdido',
  'uma carta selada', 'um mapa rasgado', 'um templo em ruínas', 'uma taverna barulhenta',
  'um convite misterioso', 'um corpo encontrado', 'um portal instável', 'uma profecia escrita',
  'um espião disfarçado', 'um grupo de peregrinos', 'um animal falante', 'uma tempestade mágica',
  'um contrato quebrado', 'um duelo público', 'um ritual noturno', 'uma relíquia sagrada',
  'um aliado ferido', 'um inimigo jurado', 'uma criança perdida', 'um rei em fuga',
  'um dragão dormindo', 'um culto secreto', 'uma facção rival', 'um segredo de família'
];

const ORACLE_FOCUS = [
  'NPC importante', 'Objeto chave', 'Local perigoso', 'Evento iminente',
  'Ameaça crescente', 'Oportunidade única', 'Revelação chocante', 'Conflito interno',
  'Pressão de tempo', 'Escolha moral', 'Recurso escasso', 'Aliado inesperado',
  'Inimigo oculto', 'Magia selvagem', 'Política local', 'Lenda antiga'
];

const ORACLE_COMPLICATIONS_GENERAL = [
  'Uma tempestade súbita impede o avanço.',
  'Alguém do grupo é reconhecido por inimigos.',
  'Um recurso essencial acaba (comida, munição, magia).',
  'Um aliado exige um favor perigoso imediatamente.',
  'Aparece uma testemunha inconveniente.',
  'A magia local se comporta de forma imprevisível.',
  'Um rival chega ao mesmo objetivo ao mesmo tempo.',
  'O caminho está bloqueado por uma força inesperada.',
  'Uma maldição antiga se manifesta.',
  'Informações confiáveis se revelam falsas.',
  'Um personagem importante desaparece sem deixar rastros.',
  'Uma facção poderosa toma interesse no grupo.',
  'O tempo acelera: o prazo de uma ameaça se encurta.',
  'Uma criatura lendária desperta nas proximidades.',
  'Um segredo do passado de um herói vem à tona.'
];

const ORACLE_COMPLICATIONS_BY_BIOME = {
  taverna: [
    'Uma briga generalizada explode na sala principal.',
    'O estalajadeiro revela que a comida estava envenenada (leve).',
    'Um espião escuta a conversa do grupo.',
    'Soldados locais chegam procurando “forasteiros suspeitos”.',
    'Uma aposta de dados termina em acusação de trapaça.'
  ],
  cidade: [
    'A guarda da cidade inicia uma batida na área.',
    'Um nobre acusa o grupo publicamente de algo falso.',
    'Uma greve ou tumulto bloqueia as ruas principais.',
    'Um ladrão rouba um item importante no meio da multidão.',
    'Um edital oficial muda as leis locais de um dia para o outro.'
  ],
  esgotos: [
    'O nível da água sobe perigosamente.',
    'Gases tóxicos forçam uma retirada rápida.',
    'Uma criatura subterrânea marca o grupo como presa.',
    'O caminho desaba atrás de vocês.',
    'Vozes ecoam de túneis que não deveriam existir.'
  ],
  ruinas: [
    'Armadilhas antigas se reativam.',
    'Espíritos dos antigos habitantes se manifestam.',
    'Uma parte da estrutura desaba.',
    'Um artefato amaldiçoado atrai atenção indesejada.',
    'Runas se iluminam e alteram a realidade local.'
  ],
  masmorra: [
    'Portas se trancam magicamente atrás do grupo.',
    'Um alarme ecoa por todos os corredores.',
    'Prisioneiros gritando revelam a presença do grupo.',
    'O chão se torna instável sobre um abismo.',
    'Um guardião ancestral desperta.'
  ],
  minas: [
    'Um desmoronamento bloqueia a saída principal.',
    'Gases inflamáveis se acumulam.',
    'Criaturas que evitam a luz atacam nas sombras.',
    'Ferramentas ou trilhos se movem sozinhos.',
    'Uma veia de minério mágico causa alucinações.'
  ],
  floresta: [
    'A trilha se fecha e a floresta parece se mover.',
    'Feras lideradas por algo inteligente cercam o grupo.',
    'Uma névoa densa reduz a visão a quase zero.',
    'Espíritos da natureza exigem uma oferenda.',
    'Alguém do grupo é marcado por uma fada caprichosa.'
  ],
  ilhas: [
    'A maré sobe mais rápido que o esperado.',
    'Piratas avistam o grupo e mudam de rota.',
    'Uma tempestade tropical se forma no horizonte.',
    'Criaturas marinhas bloqueiam a costa.',
    'Uma ilha “flutuante” aparece e desaparece.'
  ],
  deserto: [
    'Uma tempestade de areia se aproxima rapidamente.',
    'Oásis revela-se miragem ou armadilha.',
    'Escassez de água se torna crítica.',
    'Nômades hostis reivindicam o território.',
    'Ruínas enterradas emergem com a areia.'
  ],
  montanha: [
    'Uma avalanche bloqueia o caminho.',
    'O clima muda para nevasca em minutos.',
    'Pontes de corda ou caminhos estreitos se rompem.',
    'Gigantes ou dragões das alturas notam o grupo.',
    'O ar rarefeito causa fadiga extrema.'
  ]
};

let _oracleHistory = [];
let _lastOraclePayload = null;

function getOracleState() {
  return storeGetJSON(KEYS.oracle, { clocks: [] }) || { clocks: [] };
}

function setOracleState(state) {
  storeSet(KEYS.oracle, state);
}

function initOracleScreen() {
  updateOracleContextLine();
  renderOracleClocks();
  renderOracleHistory();
}

function updateOracleContextLine() {
  const el = document.getElementById('oracleContextLine');
  if (!el) return;
  let biome = '—';
  let day = '—';
  let period = '—';
  try {
    const sel = document.getElementById('biomeSelect');
    if (sel) {
      const opt = sel.options[sel.selectedIndex];
      biome = opt ? opt.text : sel.value;
    }
  } catch (e) {}
  try {
    if (typeof timeState !== 'undefined' && timeState) {
      day = 'Dia ' + (timeState.day || 1);
      period = (typeof PERIODS !== 'undefined' ? PERIODS[timeState.periodIndex || 0] : '') || '';
    }
  } catch (e) {}
  el.textContent = `Contexto atual: ${biome} · ${day}${period ? ' · ' + period : ''}`;
}

function d100() {
  return Math.floor(Math.random() * 100) + 1;
}

function rollYesNoOracle() {
  const idx = parseInt(document.getElementById('oracleLikelihood').value, 10) || 3;
  const like = ORACLE_LIKELIHOOD[idx] || ORACLE_LIKELIHOOD[3];
  let roll = d100() + like.mod;
  roll = Math.max(1, Math.min(100, roll));

  let result = ORACLE_YESNO_RESULTS.find(r => roll >= r.min && roll <= r.max);
  if (!result) result = ORACLE_YESNO_RESULTS[3];

  // Pequena chance de twist extra
  let twist = '';
  if (Math.random() < 0.18) {
    twist = ' ⚡ Reviravolta: ' + pick([
      'alguém inesperado intervém',
      'o custo é maior do que parecia',
      'uma informação nova muda o contexto',
      'o ambiente reage de forma mágica',
      'um aliado ou inimigo revela intenção oculta'
    ]);
  }

  const color = result.type === 'yes' ? 'var(--success)' : 'var(--danger)';
  const body = document.getElementById('yesNoResultBody');
  body.innerHTML = `
    <div style="font-size:0.8rem; color:var(--muted); margin-bottom:4px;">
      Probabilidade: <strong>${like.label}</strong> · Rolagem efetiva: <strong>${roll}</strong>
    </div>
    <div style="font-size:1.25rem; font-weight:800; color:${color}; margin:6px 0;">
      ${result.text}
    </div>
    ${twist ? `<div style="font-size:0.9rem; color:var(--accent);">${twist}</div>` : ''}
  `;
  document.getElementById('yesNoResult').style.display = 'block';

  _lastOraclePayload = {
    kind: 'yesno',
    title: 'Oráculo Sim/Não',
    text: `${result.text}${twist}`,
    detail: `Prob: ${like.label} · Roll: ${roll}`
  };
  pushOracleHistory(_lastOraclePayload);
}

function rollSceneOracle() {
  const action = pick(ORACLE_ACTIONS);
  const theme = pick(ORACLE_THEMES);
  const subject = pick(ORACLE_SUBJECTS);
  const focus = pick(ORACLE_FOCUS);

  let biomeFlavor = '';
  try {
    const key = document.getElementById('biomeSelect')?.value;
    if (key && ORACLE_COMPLICATIONS_BY_BIOME[key]) {
      // leve flavor de bioma
      const flavors = {
        taverna: 'no calor da taverna',
        cidade: 'nas ruas movimentadas',
        esgotos: 'nas profundezas fétidas',
        ruinas: 'entre pedras antigas',
        masmorra: 'nos corredores úmidos',
        minas: 'sob a terra escura',
        floresta: 'sob as copas sussurrantes',
        ilhas: 'à beira do mar agitado',
        deserto: 'sob o sol implacável',
        montanha: 'nas alturas geladas'
      };
      biomeFlavor = flavors[key] || '';
    }
  } catch (e) {}

  const prompt = biomeFlavor
    ? `${action} ${subject} ${biomeFlavor}, sob o tema de “${theme}”. Foco: ${focus}.`
    : `${action} ${subject}, sob o tema de “${theme}”. Foco: ${focus}.`;

  const body = document.getElementById('sceneResultBody');
  body.innerHTML = `
    <div style="display:grid; gap:6px; font-size:0.95rem;">
      <div><strong style="color:var(--magic);">Ação:</strong> ${action}</div>
      <div><strong style="color:var(--accent);">Tema:</strong> ${theme}</div>
      <div><strong style="color:#0ea5e9;">Sujeito:</strong> ${subject}</div>
      <div><strong style="color:#fbbf24;">Foco:</strong> ${focus}</div>
    </div>
    <div style="margin-top:12px; padding:10px; background:rgba(168,85,247,0.12); border-radius:8px; border:1px solid rgba(168,85,247,0.3);">
      <strong>Prompt de cena:</strong><br>${prompt}
    </div>
  `;
  document.getElementById('sceneResult').style.display = 'block';

  _lastOraclePayload = {
    kind: 'scene',
    title: 'Cena do Oráculo',
    text: prompt,
    detail: `Ação: ${action} · Tema: ${theme} · Sujeito: ${subject} · Foco: ${focus}`
  };
  pushOracleHistory(_lastOraclePayload);
}

function rollActionOnly() {
  const v = pick(ORACLE_ACTIONS);
  alert('Ação: ' + v);
  pushOracleHistory({ kind: 'action', title: 'Ação', text: v });
}
function rollThemeOnly() {
  const v = pick(ORACLE_THEMES);
  alert('Tema: ' + v);
  pushOracleHistory({ kind: 'theme', title: 'Tema', text: v });
}
function rollSubjectOnly() {
  const v = pick(ORACLE_SUBJECTS);
  alert('Sujeito: ' + v);
  pushOracleHistory({ kind: 'subject', title: 'Sujeito', text: v });
}
function rollFocusOnly() {
  const v = pick(ORACLE_FOCUS);
  alert('Foco: ' + v);
  pushOracleHistory({ kind: 'focus', title: 'Foco', text: v });
}

function rollComplication(useBiome) {
  let text;
  let source = 'Geral';
  if (useBiome) {
    try {
      const key = document.getElementById('biomeSelect')?.value;
      const list = ORACLE_COMPLICATIONS_BY_BIOME[key];
      if (list && list.length) {
        text = pick(list);
        source = key;
      }
    } catch (e) {}
  }
  if (!text) {
    text = pick(ORACLE_COMPLICATIONS_GENERAL);
  }

  const body = document.getElementById('complicResultBody');
  body.innerHTML = `
    <div style="font-size:0.8rem; color:var(--muted); margin-bottom:4px;">Fonte: ${source}</div>
    <div style="font-size:1.1rem; font-weight:700; color:var(--accent2);">${text}</div>
  `;
  document.getElementById('complicResult').style.display = 'block';

  _lastOraclePayload = {
    kind: 'complic',
    title: 'Complicação',
    text: text,
    detail: 'Fonte: ' + source
  };
  pushOracleHistory(_lastOraclePayload);
}

function pushOracleHistory(entry) {
  const ts = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  _oracleHistory.unshift({ ...entry, ts });
  if (_oracleHistory.length > 30) _oracleHistory.pop();
  renderOracleHistory();
}

function renderOracleHistory() {
  const el = document.getElementById('oracleHistory');
  if (!el) return;
  if (!_oracleHistory.length) {
    el.innerHTML = '<p style="text-align:center; padding:12px;">Nenhuma rolagem ainda nesta sessão.</p>';
    return;
  }
  el.innerHTML = _oracleHistory.map(h => `
    <div style="border-bottom:1px solid rgba(255,255,255,0.06); padding:8px 0;">
      <span style="color:var(--muted); font-size:0.75rem;">${h.ts}</span>
      <strong style="margin-left:6px;">${h.title || h.kind}</strong>
      <div style="margin-top:2px;">${h.text}</div>
    </div>
  `).join('');
}

function clearOracleHistory() {
  if (!confirm('Limpar histórico do oráculo desta sessão?')) return;
  _oracleHistory = [];
  renderOracleHistory();
}

function addOracleToLog(kind) {
  if (!_lastOraclePayload || _lastOraclePayload.kind !== kind) {
    const last = _oracleHistory.find(h => h.kind === kind);
    if (!last) {
      alert('Role o oráculo primeiro.');
      return;
    }
    _lastOraclePayload = last;
  }
  try {
    if (typeof appendToCampaignLog === 'function') {
      const now = new Date();
      let biomeLabel = '';
      try {
        const sel = document.getElementById('biomeSelect');
        if (sel && sel.selectedIndex >= 0) biomeLabel = sel.options[sel.selectedIndex].text;
      } catch (e) {}
      appendToCampaignLog({
        id: 'orc_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
        ts: now.toISOString(),
        dateStr: now.toLocaleDateString('pt-BR'),
        timeStr: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        campaign: (typeof getCurrentCampaignName === 'function' ? getCurrentCampaignName() : 'Crônicas de Victory'),
        biome: biomeLabel,
        hook: null,
        tipo: 'oráculo',
        titulo: _lastOraclePayload.title || 'Oráculo',
        desc: _lastOraclePayload.text + (_lastOraclePayload.detail ? ' — ' + _lastOraclePayload.detail : ''),
        party: '',
        result: null
      });
      if (typeof renderCampaignLog === 'function') renderCampaignLog();
      alert('📥 Resultado do Oráculo salvo no diário da campanha!');
      return;
    }
  } catch (e) {
    console.warn(e);
  }
  alert((_lastOraclePayload.title || 'Oráculo') + '\n' + _lastOraclePayload.text);
}

/* ---- Relógios (aprimorados: presets, 4–8 segmentos, consequência) ---- */
const CLOCK_PRESETS = {
  invasao: {
    name: 'Invasão nas fronteiras', segments: 6,
    consequence: 'Uma força hostil ataca vilarejos ou as muralhas. Encontro de combate obrigatório ou evacuação.',
    // rep: alterações ao completar o relógio
    repOnComplete: [
      { faction: 'povo', delta: -8, reason: 'Invasão: o povo culpa aventureiros ausentes' },
      { faction: 'guarda', delta: -5, reason: 'Invasão: a guarda perdeu controle da fronteira' },
      { faction: 'aventureiros', delta: 3, reason: 'Invasão: a guilda valoriza quem ainda luta' }
    ]
  },
  igreja: {
    name: 'Inquérito da Igreja', segments: 6,
    consequence: 'Clérigos exigem depoimento. −reputação Igreja se o inquérito concluir sem cooperação.',
    repOnComplete: [
      { faction: 'igreja', delta: -12, reason: 'Inquérito da Igreja concluído contra o grupo' },
      { faction: 'povo', delta: -4, reason: 'Fiéis murmuram sobre o grupo' },
      { faction: 'nobreza', delta: -2, reason: 'Escândalo religioso chega à corte' }
    ]
  },
  submundo: {
    name: 'Caçada do Submundo', segments: 6,
    consequence: 'Assassinos ou cobradores aparecem. Emboscada noturna ou dívida dobrada.',
    repOnComplete: [
      { faction: 'submundo', delta: -10, reason: 'Caçada do Submundo: a guilda cobra o preço' },
      { faction: 'guarda', delta: 3, reason: 'A guarda nota o conflito no crime organizado' },
      { faction: 'mercadores', delta: -3, reason: 'Comerciantes evitam quem atrai assassinos' }
    ]
  },
  ritual: {
    name: 'Ritual da Lua Negra', segments: 8,
    consequence: 'O ritual se completa: portal, praga ou invocação. Novo relógio de catástrofe ou chefe.',
    repOnComplete: [
      { faction: 'igreja', delta: -6, reason: 'Ritual negro: a Igreja culpa os omissos' },
      { faction: 'natureza', delta: -8, reason: 'A terra grita com o ritual' },
      { faction: 'a_ordem', delta: 5, reason: 'A Ordem oculta celebra o avanço do plano' }
    ]
  },
  praga: {
    name: 'Praga / Maldição', segments: 6,
    consequence: 'Doença se espalha: status ruim até cura no templo.',
    repOnComplete: [
      { faction: 'povo', delta: -10, reason: 'Praga: o povo busca culpados' },
      { faction: 'igreja', delta: -4, reason: 'A Igreja falhou em conter a maldição a tempo' },
      { faction: 'mercadores', delta: -5, reason: 'Comércio trava com medo da doença' }
    ]
  },
  rival: {
    name: 'Rivalidade pessoal', segments: 4,
    consequence: 'O rival confronta o grupo em público. Duelo, chantagem ou roubo de item.',
    repOnComplete: [
      { faction: 'aventureiros', delta: -4, reason: 'Rivalidade pública mancha a fama' },
      { faction: 'povo', delta: -2, reason: 'Boatos de briga na cidade' }
    ]
  },
  seraphine: {
    name: 'Olho de Seraphine', segments: 6,
    consequence: 'A Casa da Luz Vermelha exige favor ou pagamento. Convite que não se recusa facilmente.',
    repOnComplete: [
      { faction: 'luz_vermelha', delta: -8, reason: 'Seraphine cobra a dívida de atenção' },
      { faction: 'submundo', delta: -3, reason: 'O submundo elegante marca o grupo' },
      { faction: 'igreja', delta: 2, reason: 'A Igreja aprova quem atrai o ódio da Casa' }
    ]
  }
};

function renderOracleClocks() {
  const el = document.getElementById('oracleClocksList');
  if (!el) return;
  const state = getOracleState();
  const clocks = state.clocks || [];
  if (!clocks.length) {
    el.innerHTML = '<p style="color:var(--muted); font-size:0.85rem; text-align:center; padding:8px;">Nenhum relógio ativo. Use um preset ou crie um nome livre.</p>';
    return;
  }
  el.innerHTML = clocks.map((c, i) => {
    const max = Math.max(4, Math.min(8, c.segments || 6));
    const prog = Math.max(0, Math.min(max, c.progress || 0));
    const segs = [];
    for (let s = 0; s < max; s++) {
      const filled = s < prog;
      segs.push(`<span style="display:inline-block; width:16px; height:16px; border-radius:50%; margin:0 2px; border:2px solid #fbbf24; background:${filled ? '#fbbf24' : 'transparent'};"></span>`);
    }
    const done = prog >= max;
    return `
      <div class="card" style="background:var(--bg-input); margin-bottom:10px; padding:12px; ${done ? 'border-color:#f43f5e;' : ''}">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
          <strong style="color:#fbbf24;">${esc(c.name)}</strong>
          <span style="font-size:0.8rem; color:var(--muted);">${prog}/${max}${done ? ' · COMPLETO' : ''}</span>
        </div>
        ${c.consequence ? `<div style="font-size:0.78rem; color:var(--muted); margin-top:4px;">📌 ${esc(c.consequence)}</div>` : ''}
        ${(c.preset || (c.repOnComplete && c.repOnComplete.length)) ? `<div style="font-size:0.72rem; color:#fbbf24; margin-top:4px;">👑 Ao completar: altera reputação de facções</div>` : ''}
        <div style="margin:10px 0;">${segs.join('')}</div>
        <div style="display:flex; gap:6px; flex-wrap:wrap;">
          <button class="btn btn-sm" onclick="advanceOracleClock(${i}, 1)">+1</button>
          <button class="btn btn-sm btn-outline" onclick="advanceOracleClock(${i}, -1)">−1</button>
          <button class="btn btn-sm btn-outline" onclick="advanceOracleClock(${i}, ${max} - ${prog})" ${done ? 'disabled' : ''}>Completar</button>
          <button class="btn btn-sm btn-outline" onclick="resetOracleClock(${i})">↺</button>
          <button class="btn btn-sm btn-danger" style="margin-left:auto;" onclick="removeOracleClock(${i})">🗑️</button>
        </div>
      </div>
    `;
  }).join('');
}

function addOracleClock() {
  const input = document.getElementById('clockNameInput');
  const name = (input && input.value || '').trim();
  if (!name) {
    alert('Digite um nome para o relógio.');
    return;
  }
  const segsEl = document.getElementById('clockSegmentsSelect');
  const segments = parseInt(segsEl && segsEl.value || '6', 10) || 6;
  const state = getOracleState();
  state.clocks = state.clocks || [];
  state.clocks.push({
    name,
    progress: 0,
    segments: Math.max(4, Math.min(8, segments)),
    consequence: 'A ameaça se concretiza — resolva na narrativa (encontro, preço político ou perda).',
    id: 'clk_' + Date.now().toString(36)
  });
  setOracleState(state);
  if (input) input.value = '';
  renderOracleClocks();
}

function addOracleClockFromPreset() {
  try {
    const sel = document.getElementById('clockPresetSelect');
    const key = sel && sel.value;
    if (!key || !CLOCK_PRESETS[key]) {
      alert('Escolha um preset na lista.');
      return;
    }
    const p = CLOCK_PRESETS[key];
    const state = getOracleState();
    state.clocks = state.clocks || [];
    state.clocks.push({
      name: p.name,
      progress: 0,
      segments: p.segments || 6,
      consequence: p.consequence || '',
      preset: key,
      repOnComplete: Array.isArray(p.repOnComplete) ? p.repOnComplete.slice() : [],
      id: 'clk_' + Date.now().toString(36)
    });
    setOracleState(state);
    if (sel) sel.value = '';
    renderOracleClocks();
  } catch (e) {
    console.warn(e);
  }
}

/**
 * Aplica mudanças de reputação ao completar um relógio.
 * Isolado: só chama changeReputation se existir; nunca quebra o fluxo.
 */
function applyClockReputationOnComplete(clock) {
  const lines = [];
  try {
    if (!clock || typeof changeReputation !== 'function') return lines;
    let effects = Array.isArray(clock.repOnComplete) ? clock.repOnComplete : null;
    // Fallback: se for preset conhecido sem effects gravados (relógios antigos)
    if ((!effects || !effects.length) && clock.preset && CLOCK_PRESETS[clock.preset]) {
      effects = CLOCK_PRESETS[clock.preset].repOnComplete || [];
    }
    if (!effects || !effects.length) return lines;
    effects.forEach(ef => {
      if (!ef || !ef.faction || !ef.delta) return;
      try {
        changeReputation(ef.faction, ef.delta, ef.reason || ('Relógio: ' + (clock.name || '')), true);
        const fac = (typeof REPUTATION_FACTIONS !== 'undefined')
          ? REPUTATION_FACTIONS.find(f => f.id === ef.faction)
          : null;
        const label = fac ? fac.label : ef.faction;
        lines.push(`${ef.delta >= 0 ? '+' : ''}${ef.delta} ${label}`);
      } catch (e) {}
    });
  } catch (e) {
    console.warn('applyClockReputationOnComplete', e);
  }
  return lines;
}

function advanceOracleClock(index, delta) {
  const state = getOracleState();
  const clocks = state.clocks || [];
  if (!clocks[index]) return;
  const max = Math.max(4, Math.min(8, clocks[index].segments || 6));
  const before = clocks[index].progress || 0;
  clocks[index].progress = Math.max(0, Math.min(max, before + delta));
  const justCompleted = before < max && clocks[index].progress >= max;
  setOracleState(state);
  renderOracleClocks();
  if (justCompleted) {
    const c = clocks[index];
    let repLines = [];
    try { repLines = applyClockReputationOnComplete(c) || []; } catch (e) {}
    const repTxt = repLines.length
      ? '\n\n👑 Reputação:\n' + repLines.map(l => '· ' + l).join('\n')
      : '';
    const msg = `⏳ Relógio completo: “${c.name}”!\n\n${c.consequence || 'A ameaça se concretiza.'}${repTxt}\n\nResolva na narrativa; depois reinicie (↺) ou remova.`;
    setTimeout(() => alert(msg), 40);
    try {
      if (typeof appendToCampaignLog === 'function') {
        appendToCampaignLog({
          type: 'relogio',
          title: '⏳ Relógio completo: ' + c.name,
          text: (c.consequence || 'Ameaça concretizada.') +
            (repLines.length ? '\nReputação: ' + repLines.join(', ') : ''),
          time: new Date().toLocaleString('pt-BR')
        });
      }
    } catch (e) {}
    try {
      if (typeof renderReputationScreen === 'function') renderReputationScreen();
    } catch (e) {}
    // Preset "rival": garante um rival e sugere confronto
    try {
      if (c.preset === 'rival' && typeof getRivaisAtivos === 'function') {
        let rivais = getRivaisAtivos();
        if (!rivais.length) {
          const st = getFalhasState();
          const ficha = typeof sortearRivalPlanilha === 'function' ? sortearRivalPlanilha() : { nome: 'Rival', P: 4, H: 3, R: 3 };
          st.rivais.push({
            nome: ficha.nome,
            vezes: 1,
            criadoEm: new Date().toLocaleString('pt-BR'),
            ultimaFonte: 'relogio_rival',
            P: ficha.P || 4, H: ficha.H || 3, R: ficha.R || 3,
            classe: ficha.classe || '',
            personalidade: ficha.personalidade || '',
            motivacao: ficha.motivacao || '',
            aparencia: ficha.aparencia != null ? ficha.aparencia : 5
          });
          setFalhasState(st);
          rivais = getRivaisAtivos();
        }
        if (rivais.length) {
          setTimeout(() => {
            if (confirm('O relógio de Rivalidade se completou.\nConfrontar «' + rivais[0].nome + '» agora?')) {
              montarEncontroRival(rivais[0], true);
            }
          }, 200);
        }
      }
    } catch (e) {}
  }
}

function resetOracleClock(index) {
  const state = getOracleState();
  if (!state.clocks || !state.clocks[index]) return;
  state.clocks[index].progress = 0;
  setOracleState(state);
  renderOracleClocks();
}

function removeOracleClock(index) {
  if (!confirm('Remover este relógio?')) return;
  const state = getOracleState();
  state.clocks.splice(index, 1);
  setOracleState(state);
  renderOracleClocks();
}

/** +1 em um relógio ativo aleatório (ex.: falha de missão). Isolado e seguro. */
function tickRandomOracleClock(reason) {
  try {
    const state = getOracleState();
    const clocks = (state.clocks || []).filter(c => (c.progress || 0) < (c.segments || 6));
    if (!clocks.length) return null;
    const c = clocks[Math.floor(Math.random() * clocks.length)];
    const idx = state.clocks.indexOf(c);
    if (idx < 0) return null;
    advanceOracleClock(idx, 1);
    return c.name;
  } catch (e) {
    return null;
  }
}

