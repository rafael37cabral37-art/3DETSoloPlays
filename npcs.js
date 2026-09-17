/* ===== [NPC_MANAGER] linhas originais 7885-8087 ===== */
/* ==================== GERENCIADOR DE NPCs ==================== */
const NPC_STORAGE_KEY = KEYS.npcs;

const NPC_CLASSES = {
  ladino:   { nome: 'Ladino',   P: 1, H: 3, R: 1, vantagens: ['Acrobacia'], desc: 'Ágil, furtivo e oportunista.' },
  guerreiro:{ nome: 'Guerreiro',P: 3, H: 1, R: 2, vantagens: ['Armas'], desc: 'Combatente de linha de frente.' },
  clerigo:  { nome: 'Clérigo',  P: 1, H: 2, R: 2, vantagens: ['Cura', 'Magia'], desc: 'Fé e suporte no campo de batalha.' },
  mago:     { nome: 'Mago',     P: 0, H: 3, R: 1, vantagens: ['Magia'], desc: 'Poder arcano e conhecimento.' },
  druida:   { nome: 'Druida',   P: 1, H: 2, R: 2, vantagens: ['Magia', 'Sobrevivência'], desc: 'Guardião da natureza.' },
  barbaro:  { nome: 'Bárbaro',  P: 4, H: 1, R: 2, vantagens: ['Fúria'], desc: 'Força bruta e instinto selvagem.' }
};

const NPC_IDADES = [
  { id: 'crianca',     label: 'Criança',       mult: 0.4, afetoBase: 40 },
  { id: 'adolescente', label: 'Adolescente',   mult: 0.7, afetoBase: 30 },
  { id: 'jovem',       label: 'Jovem adulto/a', mult: 1.0, afetoBase: 25 },
  { id: 'adulto',      label: 'Adulto/a',      mult: 1.1, afetoBase: 20 },
  { id: 'idoso',       label: 'Idoso/a',       mult: 0.85, afetoBase: 35 }
];

const NOMES_M = [
  'Kael','Roran','Theron','Darian','Lucan','Bram','Gareth','Orin','Soren','Vex',
  'Finn','Aldric','Cassian','Drake','Elias','Felix','Gideon','Henrik','Ivan','Jace',
  'Thorne','Cedric','Rowan','Alaric','Dorian','Marcus','Silas','Corwin','Edric','Leoric',
  'Bastian','Caspian','Dante','Evander','Florian','Garrick','Hadrian','Isidor','Jasper','Kendrick',
  'Lorian','Magnus','Nolan','Osric','Peregrin','Quentin','Roderic','Sebastian','Tristan','Ulric'
];
const NOMES_F = [
  // Clássicos de fantasia
  'Lyra','Elara','Seraphine','Mira','Nova','Kira','Aria','Selene','Vespera','Yuna',
  'Freya','Iris','Liora','Nyssa','Ophelia','Raven','Thea','Zara','Astrid','Brielle',
  'Celeste','Dahlia','Elysia','Faye','Gwendolyn','Helena','Isolde','Juno','Kaia','Luna',
  'Morgana','Nyx','Odette','Phoebe','Quinn','Rowena','Sylvia','Thalia','Una','Violet',
  'Willow','Xena','Yvonne','Zelda','Aurora','Belladonna','Cora','Delphine','Evelyn','Fiona',
  // Portugueses / brasileiros de tom medieval-fantasia
  'Sofia','Lara','Isabela','Clara','Beatriz','Helena','Mariana','Camila','Valentina','Alice',
  'Lívia','Helena','Cecília','Vitória','Olívia','Marina','Bianca','Rafaela','Gabriela','Amanda',
  'Letícia','Fernanda','Patricia','Renata','Tatiana','Daniela','Juliana','Carolina','Eduarda','Lorena',
  'Isadora','Eloá','Maitê','Ayla','Liz','Nina','Maya','Lia','Bia','Ana',
  'Catarina','Teresa','Inês','Joana','Leonor','Francisca','Madalena','Constança','Beatriz','Margarida',
  // Élficos / místicos
  'Aelindra','Silvanna','Elowen','Lirael','Maerwen','Nimue','Ariella','Caelia','Elaria','Faelina',
  'Galadriel','Ithilwen','Luthien','Melian','Nessa','Oropher','Celebrían','Amrothiel','Tinuviel','Yavanna',
  'Aelwyn','Branwen','Ceridwen','Eira','Ffion','Gwenhwyfar','Hyacinth','Ianthe','Jessamine','Kestrel',
  'Larkspur','Mirabel','Nerissa','Orchid','Primrose','Rosalind','Saffron','Tamsin','Ursula','Verity',
  // Sombrios / misteriosos
  'Morwen','Ravenna','Lilith','Sable','Nocturne','Vespera','Shade','Umbra','Nyxara','Corvina',
  'Bellatrix','Circe','Desdemona','Esme','Hecate','Ishtar','Jezebel','Kali','Lamia','Medea',
  'Nerida','Pandora','Rhea','Salome','Tanith','Venus','Wren','Xanthe','Ysabel','Zephyrine',
  // Nobres / cortesãos
  'Adelaide','Beatrice','Cordelia','Daphne','Eleanor','Florence','Genevieve','Henrietta','Imogen','Josephine',
  'Katherine','Lillian','Madeleine','Natalie','Octavia','Penelope','Rosalie','Stephanie','Theodora','Victoria',
  'Wilhelmina','Alexandra','Charlotte','Elizabeth','Margaret','Philippa','Arabella','Cecily','Dorothy','Esther',
  // Natureza / druídicos
  'Ash','Birch','Clover','Daisy','Elm','Fern','Grove','Hazel','Ivy','Jasmine',
  'Laurel','Maple','Olive','Poppy','Reed','Sage','Thorn','Violet','Wisteria','Yarrow',
  'Bryony','Celandine','Dahlia','Edelweiss','Foxglove','Gorse','Heather','Iris','Juniper','Lavender',
  // Orientais / exóticos (fantasia)
  'Sakura','Aiko','Mei','Hana','Rina','Yumi','Akari','Hikari','Koharu','Miyuki',
  'Sora','Tsuki','Nami','Kaze','Hoshi','Aoi','Chiyo','Emiko','Fuyuko','Gin',
  // Curtos e marcantes
  'Ava','Eve','Ivy','Lux','Nyx','Ora','Pia','Rue','Sky','Tess',
  'Uma','Vee','Wyn','Zoe','Bex','Cyn','Dot','Fay','Gem','Joy'
];

const NPC_MISSOES = [
  { titulo: 'Entrega urgente', desc: 'Leve este pacote até o outro lado da região sem abrir.', dif: 1, afetoOk: 8, afetoFail: 5, tipo: 'teste', attr: 'H', pericia: 'Sobrevivência', xp: 3, ouro: 8, itemChance: 0.15, item: 'Poção de Cura Menor' },
  { titulo: 'Caça pequena', desc: 'Elimine uma ameaça menor que perturba a vizinhança.', dif: 2, afetoOk: 12, afetoFail: 6, tipo: 'combate', attr: 'P', pericia: 'Luta', xp: 6, ouro: 15, itemChance: 0.25, item: 'Presa de Predador' },
  { titulo: 'Coletar erva rara', desc: 'Traga uma erva que só cresce em terreno perigoso.', dif: 2, afetoOk: 10, afetoFail: 5, tipo: 'teste', attr: 'H', pericia: 'Sobrevivência', xp: 5, ouro: 12, itemChance: 0.35, item: 'Erva Rara' },
  { titulo: 'Proteger caravana', desc: 'Escolte mercadores por um trecho de estrada inseguro.', dif: 2, afetoOk: 14, afetoFail: 7, tipo: 'combate', attr: 'P', pericia: 'Luta', xp: 7, ouro: 18, itemChance: 0.2, item: 'Escudo de Madeira' },
  { titulo: 'Investigar rumores', desc: 'Descubra a verdade por trás de um boato local.', dif: 1, afetoOk: 9, afetoFail: 4, tipo: 'teste', attr: 'H', pericia: 'Percepção', xp: 4, ouro: 6, itemChance: 0.1, item: 'Nota Cifrada' },
  { titulo: 'Resgatar animal', desc: 'Um animal de estimação fugiu para a floresta. Traga-o de volta.', dif: 1, afetoOk: 11, afetoFail: 5, tipo: 'teste', attr: 'H', pericia: 'Animais', xp: 4, ouro: 7, itemChance: 0.15, item: 'Coleira Encantada' },
  { titulo: 'Duelo de honra', desc: 'Represente o NPC em um desafio formal contra um rival.', dif: 3, afetoOk: 18, afetoFail: 10, tipo: 'combate', attr: 'P', pericia: 'Luta', xp: 10, ouro: 25, itemChance: 0.3, item: 'Lâmina do Desafio' },
  { titulo: 'Recuperar relíquia', desc: 'Uma herança familiar foi roubada. Recupere-a.', dif: 3, afetoOk: 16, afetoFail: 8, tipo: 'combate', attr: 'H', pericia: 'Manha', xp: 9, ouro: 22, itemChance: 0.4, item: 'Relíquia Familiar' },
  { titulo: 'Mediação', desc: 'Ajude a resolver uma disputa entre duas partes sem violência.', dif: 1, afetoOk: 10, afetoFail: 6, tipo: 'teste', attr: 'H', pericia: 'Influência', xp: 4, ouro: 5, itemChance: 0.1, item: 'Carta de Recomendação' },
  { titulo: 'Testemunha', desc: 'Compareça e apoie o NPC em um julgamento ou assembleia.', dif: 1, afetoOk: 8, afetoFail: 4, tipo: 'teste', attr: 'H', pericia: 'Influência', xp: 3, ouro: 4, itemChance: 0.05, item: null },
  { titulo: 'Missão secreta', desc: 'Faça algo discreto que o NPC não pode fazer sozinho.', dif: 2, afetoOk: 15, afetoFail: 8, tipo: 'teste', attr: 'H', pericia: 'Manha', xp: 7, ouro: 16, itemChance: 0.2, item: 'Chave Misteriosa' },
  { titulo: 'Presente especial', desc: 'Consiga um item raro que o NPC deseja há muito tempo.', dif: 2, afetoOk: 13, afetoFail: 5, tipo: 'teste', attr: 'H', pericia: 'Saber', xp: 6, ouro: 10, itemChance: 0.5, item: 'Presente Especial' }
];

let npcMissionContext = null; // { npcId, missao, resolved: false, missionUid }

function getActiveNpcMissions() {
  try {
    const arr = storeGetJSON(KEYS.activeMissions, []);
    return Array.isArray(arr) ? arr : [];
  } catch (e) { return []; }
}
function setActiveNpcMissions(arr) {
  storeSet(KEYS.activeMissions, Array.isArray(arr) ? arr : []);
}
function addActiveNpcMission(entry) {
  const list = getActiveNpcMissions();
  list.push(entry);
  setActiveNpcMissions(list);
  renderActiveNpcMissions();
}
function removeActiveNpcMission(missionUid) {
  setActiveNpcMissions(getActiveNpcMissions().filter(m => m.uid !== missionUid));
  renderActiveNpcMissions();
}
function renderActiveNpcMissions() {
  const panel = document.getElementById('activeNpcMissionsPanel');
  if (!panel) return;
  const list = getActiveNpcMissions().filter(m => !m.resolved);
  if (!list.length) {
    panel.innerHTML = '<p style="color:var(--muted); font-size:0.9rem;">Nenhuma missão ativa. Peça uma missão a um NPC.</p>';
    return;
  }
  panel.innerHTML = list.map(m => {
    const npc = (typeof getNpcs === 'function' ? getNpcs() : []).find(n => n.id === m.npcId);
    const npcNome = npc ? npc.nome : (m.npcNome || 'NPC');
    const tipo = m.missao && m.missao.tipo === 'combate' ? '⚔️ Combate' : '🎲 Teste';
    return `
      <div style="background:var(--bg-input); border:1px solid var(--border); border-radius:10px; padding:12px; margin-bottom:8px;">
        <div style="font-weight:800; color:var(--accent);">${esc(m.missao.titulo)}</div>
        <div style="font-size:0.82rem; color:var(--muted); margin:4px 0 8px;">${esc(m.missao.desc)}</div>
        <div style="font-size:0.8rem; margin-bottom:8px;">
          NPC: <strong>${esc(npcNome)}</strong> · ${tipo} · Dif ${'⭐'.repeat(m.missao.dif || 1)}
          · Afeto +${m.missao.afetoOk}/−${m.missao.afetoFail}
          · Rew: ${m.missao.xp || 0} XP, ${m.missao.ouro || 0} ouro
        </div>
        <div style="display:flex; gap:6px; flex-wrap:wrap;">
          <button class="btn btn-sm" style="width:auto;" onclick="reopenActiveMission('${m.uid}')">▶️ Continuar / Resolver</button>
          <button class="btn btn-sm btn-outline" style="width:auto;" onclick="if(confirm('Abandonar esta missão?')){removeActiveNpcMission('${m.uid}');}">🗑️ Abandonar</button>
        </div>
      </div>`;
  }).join('');
}
function reopenActiveMission(uid) {
  const m = getActiveNpcMissions().find(x => x.uid === uid);
  if (!m) return;
  npcMissionContext = { npcId: m.npcId, missao: m.missao, resolved: false, missionUid: m.uid };
  // Reusa o painel de missão
  const n = getNpcs().find(x => x.id === m.npcId);
  if (!n) { alert('NPC da missão não encontrado.'); return; }
  // Simula pedirMissaoNpc com missão já definida
  const panel = document.getElementById('npcMissionPanel');
  const body = document.getElementById('npcMissionBody');
  const resultEl = document.getElementById('npcMissionResult');
  if (resultEl) { resultEl.classList.add('hidden'); resultEl.innerHTML = ''; }
  const missao = m.missao;
  const hero = getNpcHeroSelecionado();
  const heroNome = hero ? hero.nome : '— nenhum herói selecionado —';
  const attrLabel = missao.attr === 'P' ? 'Poder' : (missao.attr === 'R' ? 'Resistência' : 'Habilidade');
  const nd = typeof ndMissao === 'function' ? ndMissao(missao.dif) : 7;
  const tipoLabel = missao.tipo === 'combate' ? '⚔️ Combate' : '🎲 Teste de perícia/característica';
  let actionButtons = '';
  if (missao.tipo === 'combate') {
    actionButtons = `
      <button class="btn" style="background:linear-gradient(135deg,#ef4444,#f97316);color:#fff; flex:1;" onclick="combateRapidoMissaoNpc()">⚔️ Combate Rápido (nesta página)</button>
      <button class="btn btn-outline" style="flex:1;" onclick="rolarTesteMissaoNpc()">🎲 Teste alternativo (${attrLabel})</button>
    `;
  } else {
    actionButtons = `
      <button class="btn" style="background:linear-gradient(135deg,#3b82f6,#8b5cf6);color:#fff; flex:1;" onclick="rolarTesteMissaoNpc()">🎲 Rolar Teste (${attrLabel}${missao.pericia ? ' + ' + missao.pericia : ''})</button>
    `;
  }
  body.innerHTML = `
    <div style="font-size:1.15rem; font-weight:800; color:var(--accent); margin-bottom:8px;">${esc(missao.titulo)}</div>
    <div style="margin-bottom:10px; line-height:1.45;">${esc(missao.desc)}</div>
    <div style="font-size:0.85rem; color:var(--muted); margin-bottom:10px;">
      Pedida por: <strong style="color:var(--text)">${esc(n.nome)}</strong><br>
      Tipo: <strong>${tipoLabel}</strong> · Dificuldade: ${'⭐'.repeat(missao.dif)} (ND ${nd})<br>
      Afeto: <span style="color:var(--success)">+${missao.afetoOk}</span> /
      <span style="color:var(--accent2)">−${missao.afetoFail}</span><br>
      Recompensas: <strong>+${missao.xp || 0} XP</strong>, <strong>${missao.ouro || 0} ouro</strong>
    </div>
    <div style="background:var(--bg-input); border:1px solid var(--border); border-radius:10px; padding:10px; margin-bottom:12px;">
      <div style="font-size:0.8rem; color:var(--muted);">Herói</div>
      <div style="font-weight:700;">${esc(heroNome)}</div>
    </div>
    <div class="flex-row" style="flex-wrap:wrap; gap:8px; margin-bottom:8px;">${actionButtons}</div>
  `;
  panel.classList.remove('hidden');
  panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function getNpcs() {
  try {
    const arr = storeGetJSON(NPC_STORAGE_KEY, []);
    return Array.isArray(arr) ? arr : [];
  } catch (e) { return []; }
}

function setNpcs(list) {
  storeSet(NPC_STORAGE_KEY, Array.isArray(list) ? list : []);
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function afetoLabel(n) {
  if (n >= 100) return { text: 'Devoto / Comprometido', color: '#ec4899', cls: 'status-abencoado' };
  if (n >= 80) return { text: 'Muito leal', color: '#a855f7', cls: 'status-abencoado' };
  if (n >= 60) return { text: 'Amistoso', color: '#10b981', cls: 'status-normal' };
  if (n >= 40) return { text: 'Cordial', color: '#38bdf8', cls: 'status-paralisado' };
  if (n >= 20) return { text: 'Neutro', color: '#94a3b8', cls: 'status-dormindo' };
  if (n >= 5) return { text: 'Desconfiado', color: '#fb923c', cls: 'status-faminto' };
  return { text: 'Hostil', color: '#f87171', cls: 'status-morto' };
}

/* ===== [PROGENIE_SERAPHINE] linhas originais 8088-8185 ===== */
/* ==================== PROGÊNIE DE SERAPHINE + LIMITE DIÁRIO DE AFETO ====================
 * 3 NPCs femininas transformadas pela Madame ao longo dos anos.
 * Interações cujo objetivo é subir Afeto:
 *  - contam como etapa do dia (advancePeriod)
 *  - limite diário por NPC conforme o nível atual de Afeto
 *  - além do limite: grandes redutores (pioram o Afeto)
 */
const SERAPHINE_PROGENY = [
  {
    id: 'npc_progenie_viviane',
    nome: 'Viviane Nocturne',
    sexo: 'F', sexoLabel: 'Mulher',
    classeKey: 'progenie',
    classe: 'Progênie de Seraphine',
    classeDesc: 'Transformada há ~80 anos. Elegância fria, leal à Madame. Frequentadora da Casa.',
    idadeId: 'adulto', idade: 'Aparente 28 (real ~100)',
    P: 4, H: 6, R: 5,
    vantagens: ['Fascínio','Sentidos Aguçados','Velocidade Sobrenatural','Carismático'],
    desvantagens: ['Sede de Sangue','Noctívago','Maldição Vampírica'],
    arquetipoId: 'vampiro', arquetipoNome: '🔒 Vampiro',
    aparencia: 8, afeto: 15,
    progenieSeraphine: true, racaOculta: 'vampiro',
    recrutado: false, romance: false,
    missoesFeitas: 0, missoesOk: 0, missoesFail: 0,
    notas: 'Filha de sangue de Madame Seraphine. Observa clientes da Casa com interesse seletivo.',
    interacoesAfetoDia: 0, interacoesAfetoDiaRef: 0
  },
  {
    id: 'npc_progenie_isolde',
    nome: 'Isolde Thorn',
    sexo: 'F', sexoLabel: 'Mulher',
    classeKey: 'progenie',
    classe: 'Progênie de Seraphine',
    classeDesc: 'Transformada há ~40 anos. Mais impulsiva; gosta de jogos e apostas. Guarda a Madame com unhas e dentes.',
    idadeId: 'adulto', idade: 'Aparente 24 (real ~60)',
    P: 5, H: 5, R: 5,
    vantagens: ['Mordida de Sangue','Força Sobrenatural','Ágil','Brutal'],
    desvantagens: ['Sede de Sangue','Fúria','Maldição Vampírica'],
    arquetipoId: 'vampiro', arquetipoNome: '🔒 Vampiro',
    aparencia: 7, afeto: 10,
    progenieSeraphine: true, racaOculta: 'vampiro',
    recrutado: false, romance: false,
    missoesFeitas: 0, missoesOk: 0, missoesFail: 0,
    notas: 'A mais jovem das três. Testa a coragem de quem se aproxima demais da Casa.',
    interacoesAfetoDia: 0, interacoesAfetoDiaRef: 0
  },
  {
    id: 'npc_progenie_morgana',
    nome: 'Morgana Vale',
    sexo: 'F', sexoLabel: 'Mulher',
    classeKey: 'progenie',
    classe: 'Progênie de Seraphine',
    classeDesc: 'A mais antiga sob a Madame (~150 anos desde a transformação). Sábia, perigosa, quase tão política quanto Seraphine.',
    idadeId: 'maduro', idade: 'Aparente 35 (real ~170)',
    P: 5, H: 7, R: 6,
    vantagens: ['Fascínio','Regeneração Vampírica','Forma das Sombras','Mística','Telepata'],
    desvantagens: ['Sede de Sangue','Aversão ao Sagrado','Maldição Vampírica','Noctívago'],
    arquetipoId: 'vampiro', arquetipoNome: '🔒 Vampiro',
    aparencia: 9, afeto: 5,
    progenieSeraphine: true, racaOculta: 'vampiro',
    recrutado: false, romance: false,
    missoesFeitas: 0, missoesOk: 0, missoesFail: 0,
    notas: 'Conselheira discreta da Madame. Poucos sabem o que ela realmente é.',
    interacoesAfetoDia: 0, interacoesAfetoDiaRef: 0
  }
];

/** Limite diário de interações de Afeto conforme o nível atual com aquele NPC */
function limiteInteracoesAfetoDiarias(afeto) {
  const a = Number(afeto) || 0;
  if (a >= 100) return 4;
  if (a >= 80) return 3;
  if (a >= 60) return 3;
  if (a >= 40) return 2;
  if (a >= 20) return 2;
  if (a >= 5) return 1;
  return 1; // hostil: no máximo 1 tentativa cautelosa
}

function getDiaCampanhaAtual() {
  try {
    if (typeof timeState !== 'undefined' && timeState && timeState.day)
      return timeState.day;
  } catch (e) {}
  return 1;
}

/** Garante contador do dia atual no NPC; reseta se mudou o dia */
function syncNpcInteracoesDia(npc) {
  const dia = getDiaCampanhaAtual();
  if ((npc.interacoesAfetoDiaRef || 0) !== dia) {
    npc.interacoesAfetoDiaRef = dia;
    npc.interacoesAfetoDia = 0;
  }
  return npc;
}


/* ===== [NPCS_CIDADE] linhas originais 8186-9459 ===== */
/* ==================== 10 NPCs DA CIDADE & TAVERNA (seed fixo) ====================
 * Aparência 5–8/10, vidas próprias, rotina por período do dia, missão pessoal.
 */
const CITY_NPCS_FIXED = [
  {
    id: 'npc_cidade_mara',
    nome: 'Mara Tollen',
    sexo: 'F', sexoLabel: 'Mulher',
    classeKey: 'cozinheira',
    classe: 'Cozinheira',
    classeDesc: 'Cozinheira da Taverna do Cervo. Prática, mãos no fogão.',
    raca: 'Humana',
    idadeId: 'adulto', idade: '34 anos',
    P: 2, H: 3, R: 3,
    vantagens: ['Vigoroso'],
    desvantagens: [],
    aparencia: 6,
    afeto: 25,
    cidadeNpc: true,
    recrutado: false, romance: false,
    missoesFeitas: 0, missoesOk: 0, missoesFail: 0,
    notas: 'Mãos calejadas e queimaduras nos dedos. Viúva; veio após a seca matar a lavoura.',
    objetivos: { curto: 'Consertar o forno rachado', medio: 'Abrir fogão próprio no mercado', longo: 'Comprar lote fora dos muros' },
    personalidade: 'Prática e generosa; impaciente com preguiça; valoriza honestidade.',
    rotina: {
      0: 'Mercado e preparo — Taverna (cozinha)',
      1: 'Fogão a todo vapor — Taverna (cozinha/balcão)',
      2: 'Limpeza e restolho de conversa — Taverna (balcão)',
      3: 'Descanso em quarto atrás da taverna'
    },
    missaoPessoal: {
      titulo: 'O fornecedor trapaceiro',
      desc: 'Um fornecedor de carne adultera o peso e ameaça quem reclama. Mara sabe, mas teme perder o emprego. Investigue sem espalhar o nome dela.',
      dif: 2, afetoOk: 14, afetoFail: 7, tipo: 'teste', attr: 'H', pericia: 'Percepção',
      xp: 6, ouro: 12, itemChance: 0.2, item: 'Lista de pesagens falsas'
    },
    interacoesAfetoDia: 0, interacoesAfetoDiaRef: 0
  },
  {
    id: 'npc_cidade_elira',
    nome: 'Elira Voss',
    sexo: 'F', sexoLabel: 'Mulher',
    classeKey: 'escrevente',
    classe: 'Escrevente',
    classeDesc: 'Cartorária e arquivista. Elfa exilada que vive de registros.',
    raca: 'Elfa',
    idadeId: 'adulto', idade: '112 (aparenta ~28)',
    P: 1, H: 5, R: 2,
    vantagens: ['Gênio', 'Sentidos Aguçados'],
    desvantagens: [],
    aparencia: 7,
    afeto: 15,
    cidadeNpc: true,
    recrutado: false, romance: false,
    missoesFeitas: 0, missoesOk: 0, missoesFail: 0,
    notas: 'Tinta sob as unhas; cicatriz no lábio. Guarda cópias de documentos que “não deveriam existir”.',
    objetivos: { curto: 'Indexar registros da última década', medio: 'Provar falsidade de um título nobre', longo: 'Voltar ao enclave com provas — ou nunca mais' },
    personalidade: 'Precisa e observadora; fria com interrupções; valoriza verdade documental.',
    rotina: {
      0: 'Arquivos — Biblioteca / registros da Praça Central',
      1: 'Atendimentos — Balcão de registros',
      2: 'Leitura sozinha — Biblioteca',
      3: 'Célula/quarto nos fundos da biblioteca'
    },
    missaoPessoal: {
      titulo: 'O documento perdido',
      desc: 'Uma cópia liga um comerciante rico a tráfico de dívidas. Elira tem o papel e medo. Entregue, proteja ou exponha — com discrição.',
      dif: 2, afetoOk: 15, afetoFail: 8, tipo: 'teste', attr: 'H', pericia: 'Manha',
      xp: 7, ouro: 15, itemChance: 0.25, item: 'Cópia autenticada'
    },
    interacoesAfetoDia: 0, interacoesAfetoDiaRef: 0
  },
  {
    id: 'npc_cidade_bruma',
    nome: 'Bruma Kell',
    sexo: 'F', sexoLabel: 'Mulher',
    classeKey: 'ladra',
    classe: 'Ladra / Informante',
    classeDesc: 'Apelido “Dedos Rápidos”. Boatos e bolsos cheios.',
    raca: 'Halfling',
    idadeId: 'adulto', idade: '29 anos',
    P: 2, H: 5, R: 2,
    vantagens: ['Ágil'],
    desvantagens: ['Infame'],
    aparencia: 6,
    afeto: 20,
    cidadeNpc: true,
    recrutado: false, romance: false,
    missoesFeitas: 0, missoesOk: 0, missoesFail: 0,
    notas: 'Dente torto; cicatriz no queixo. Deve dinheiro a alguém do submundo.',
    objetivos: { curto: 'Pagar a dívida da semana', medio: 'Sair da lista de um cobrador', longo: 'Identidade limpa e loja “legal”' },
    personalidade: 'Esperta e brincalhona; desconfiada; valoriza liberdade e dívida paga.',
    rotina: {
      0: 'Dormindo — becos / quarto alugado',
      1: 'Mercado e becos — atrás do mercado',
      2: 'Mesa de jogos — Taverna do Cervo',
      3: 'Telhados ou esconderijo'
    },
    missaoPessoal: {
      titulo: 'A dívida do cobrador',
      desc: 'O cobrador quer que Bruma roube um medalhão da guilda. Ela não quer. Pague a dívida, ajude no roubo ou encontre outra saída.',
      dif: 2, afetoOk: 16, afetoFail: 9, tipo: 'teste', attr: 'H', pericia: 'Manha',
      xp: 8, ouro: 20, itemChance: 0.3, item: 'Medalhão da Guilda'
    },
    interacoesAfetoDia: 0, interacoesAfetoDiaRef: 0
  },
  {
    id: 'npc_cidade_sigrid',
    nome: 'Sigrid Marten',
    sexo: 'F', sexoLabel: 'Mulher',
    classeKey: 'ferreiro',
    classe: 'Ferreiroa',
    classeDesc: 'Dona da forja no Bairro dos Artesãos. Orgulho de clã expulso.',
    raca: 'Anã',
    idadeId: 'maduro', idade: '67 (aparenta ~40)',
    P: 5, H: 3, R: 4,
    vantagens: ['Forte', 'A Ferro e Fogo'],
    desvantagens: [],
    aparencia: 5,
    afeto: 18,
    cidadeNpc: true,
    recrutado: false, romance: false,
    missoesFeitas: 0, missoesOk: 0, missoesFail: 0,
    notas: 'Sobrancelha partida; cicatriz de faísca na bochecha. Forja conquistada a marteladas.',
    objetivos: { curto: 'Entregar armaduras à guarda', medio: 'Treinar aprendiz digna', longo: 'Forjar lâmina que o clã se arrependa' },
    personalidade: 'Direta e orgulhosa; teimosa; valoriza trabalho bem feito.',
    rotina: {
      0: 'Forja — Bairro dos Artesãos',
      1: 'Forja — Bairro dos Artesãos',
      2: 'Cerveja curta — Taverna do Cervo',
      3: 'Casa atrás da oficina'
    },
    missaoPessoal: {
      titulo: 'Sabotagem no carvão',
      desc: 'Alguém sabota o carvão e espalha que a forja falha. Pode ser rival ou o clã. Descubra quem e por quê.',
      dif: 2, afetoOk: 14, afetoFail: 6, tipo: 'teste', attr: 'H', pericia: 'Percepção',
      xp: 6, ouro: 14, itemChance: 0.25, item: 'Amostra de carvão adulterado'
    },
    interacoesAfetoDia: 0, interacoesAfetoDiaRef: 0
  },
  {
    id: 'npc_cidade_imani',
    nome: 'Imani Solé',
    sexo: 'F', sexoLabel: 'Mulher',
    classeKey: 'sacerdotisa',
    classe: 'Sacerdotisa',
    classeDesc: 'Sacerdotisa do templo menor. Aasimar discreta.',
    raca: 'Aasimar',
    idadeId: 'adulto', idade: '31 anos',
    P: 2, H: 3, R: 3,
    vantagens: ['Carismático', 'Cura'],
    desvantagens: ['Código de Honra'],
    aparencia: 7,
    afeto: 22,
    cidadeNpc: true,
    recrutado: false, romance: false,
    missoesFeitas: 0, missoesOk: 0, missoesFail: 0,
    notas: 'Voz rouca; dente levemente irregular. Já escondeu refugiados que a Igreja condenaria.',
    objetivos: { curto: 'Manter refeitório dos pobres', medio: 'Impedir venda de lote do templo a nobre', longo: 'Reformformar a ordem local — ou sair com a consciência limpa' },
    personalidade: 'Compassiva; rígida com hipocrisia; valoriza cuidado com os fracos.',
    rotina: {
      0: 'Ritos e doações — Templo da Praça',
      1: 'Visitas aos doentes — Fonte Central / Bairro Pobre',
      2: 'Oração e leitura — Templo',
      3: 'Celas do templo'
    },
    missaoPessoal: {
      titulo: 'O doente “amaldiçoado”',
      desc: 'Um doente será expulso do templo. Imani quer tratá-lo às escondidas. Traga remédios, proteja a noite ou denuncie — cada escolha pesa.',
      dif: 1, afetoOk: 12, afetoFail: 5, tipo: 'teste', attr: 'H', pericia: 'Cura',
      xp: 5, ouro: 8, itemChance: 0.2, item: 'Amuleto abençoado'
    },
    interacoesAfetoDia: 0, interacoesAfetoDiaRef: 0
  },
  {
    id: 'npc_cidade_rokka',
    nome: 'Rokka Brine',
    sexo: 'F', sexoLabel: 'Mulher',
    classeKey: 'guarda',
    classe: 'Guarda da cidade',
    classeDesc: 'Recruta veterana. Orca na guarda — prova diária de que não é “só força”.',
    raca: 'Orca',
    idadeId: 'adulto', idade: '27 anos',
    P: 4, H: 3, R: 4,
    vantagens: ['Forte', 'Resoluto'],
    desvantagens: ['Infame'],
    aparencia: 6,
    afeto: 16,
    cidadeNpc: true,
    recrutado: false, romance: false,
    missoesFeitas: 0, missoesOk: 0, missoesFail: 0,
    notas: 'Orelha dentada; cicatriz no antebraço. Uniforme remendado.',
    objetivos: { curto: 'Promoção a cabo', medio: 'Limpar propina no portão', longo: 'Comandar a guarda sem se “amansar”' },
    personalidade: 'Leal e reta; desajeitada em política; valoriza ordem justa.',
    rotina: {
      0: 'Portão Sul',
      1: 'Ronda — Rua das Lojas',
      2: 'Quartel ou taverna (pouco, de armadura)',
      3: 'Quartel da guarda'
    },
    missaoPessoal: {
      titulo: 'Pedágio ilegal no portão',
      desc: 'Colegas cobram pedágio ilegal. Rokka tem provas parciais e medo de isolamento. Seja testemunha ou ajude a emboscar os corruptos.',
      dif: 2, afetoOk: 15, afetoFail: 8, tipo: 'combate', attr: 'P', pericia: 'Luta',
      xp: 8, ouro: 18, itemChance: 0.2, item: 'Insígnia da Guarda'
    },
    interacoesAfetoDia: 0, interacoesAfetoDiaRef: 0
  },
  {
    id: 'npc_cidade_lila',
    nome: 'Lila Fenn',
    sexo: 'F', sexoLabel: 'Mulher',
    classeKey: 'mercadora',
    classe: 'Mercadora',
    classeDesc: 'Tecidos e especiarias. Meia-elfa de banca no mercado.',
    raca: 'Meia-elfa',
    idadeId: 'adulto', idade: '38 anos',
    P: 2, H: 4, R: 2,
    vantagens: ['Carismático'],
    desvantagens: [],
    aparencia: 7,
    afeto: 24,
    cidadeNpc: true,
    recrutado: false, romance: false,
    missoesFeitas: 0, missoesOk: 0, missoesFail: 0,
    notas: 'Sardas densas; mãos ásperas de corda e moeda. Já foi roubada por sócio.',
    objetivos: { curto: 'Fechar carga de seda antes do inverno', medio: 'Abrir loja fixa', longo: 'Rota comercial até o porto vizinho' },
    personalidade: 'Carismática e calculista; ciumenta de território; valoriza contrato.',
    rotina: {
      0: 'Monta banca — Mercado',
      1: 'Vende e negocia — Rua das Lojas / Mercado',
      2: 'Contas — Taverna ou casa',
      3: 'Casa acima da Rua das Lojas'
    },
    missaoPessoal: {
      titulo: 'Caravaneiro desaparecido',
      desc: 'Um caravaneiro sumiu com o pagamento de Lila. Pode ser acidente, roubo ou golpe. Rastreie e decida o destino da dívida.',
      dif: 2, afetoOk: 13, afetoFail: 7, tipo: 'teste', attr: 'H', pericia: 'Sobrevivência',
      xp: 6, ouro: 16, itemChance: 0.3, item: 'Livro-razão da caravana'
    },
    interacoesAfetoDia: 0, interacoesAfetoDiaRef: 0
  },
  {
    id: 'npc_cidade_nyx',
    nome: 'Nyx Cinza',
    sexo: 'F', sexoLabel: 'Mulher',
    classeKey: 'alquimista',
    classe: 'Alquimista',
    classeDesc: 'Vende remedinhos nos becos. Tiefling de casaco cheio de frascos.',
    raca: 'Tiefling',
    idadeId: 'adulto', idade: '24 anos',
    P: 2, H: 4, R: 3,
    vantagens: ['Gênio', 'Magia'],
    desvantagens: ['Infame'],
    aparencia: 7,
    afeto: 14,
    cidadeNpc: true,
    recrutado: false, romance: false,
    missoesFeitas: 0, missoesOk: 0, missoesFail: 0,
    notas: 'Queimadura no pulso; unhas roídas. Expulsa de oficina “respeitável”.',
    objetivos: { curto: 'Comprar ingredientes sem ser assaltada', medio: 'Fórmula antiveneno', longo: 'Laboratório próprio' },
    personalidade: 'Curiosa e irônica; paranoica com autoridades; valoriza sobreviver mais um dia.',
    rotina: {
      0: 'Dorme — Bairro Pobre',
      1: 'Coleta e mistura — becos do Bairro Pobre',
      2: 'Vende — canto da Taverna do Cervo',
      3: 'Laboratório improvisado / telhado'
    },
    missaoPessoal: {
      titulo: 'O frasco errado',
      desc: 'Um frasco “errado” matou alguém. Nyx jura inocência — ou jura demais. Investigue, limpe o nome dela ou esconda a evidência.',
      dif: 2, afetoOk: 14, afetoFail: 10, tipo: 'teste', attr: 'H', pericia: 'Saber',
      xp: 7, ouro: 12, itemChance: 0.35, item: 'Frasco residual'
    },
    interacoesAfetoDia: 0, interacoesAfetoDiaRef: 0
  },
  {
    id: 'npc_cidade_tessa',
    nome: 'Tessa Rowan',
    sexo: 'F', sexoLabel: 'Mulher',
    classeKey: 'cartografa',
    classe: 'Cartógrafa',
    classeDesc: 'Desenhista de mapas. Gnoma da guilda e da taverna.',
    raca: 'Gnoma',
    idadeId: 'adulto', idade: '52 (aparenta ~30)',
    P: 1, H: 5, R: 2,
    vantagens: ['Gênio', 'Ágil'],
    desvantagens: [],
    aparencia: 6,
    afeto: 28,
    cidadeNpc: true,
    recrutado: false, romance: false,
    missoesFeitas: 0, missoesOk: 0, missoesFail: 0,
    notas: 'Tinta no nariz; ombro mais baixo de tanto desenhar. Culpa de mapa falho que não era dela.',
    objetivos: { curto: 'Vender três mapas da cidade', medio: 'Mapear esgotos sob o mercado', longo: 'Atlas regional com o nome na capa' },
    personalidade: 'Entusiasmada e distraída; teimosa com precisão; valoriza descoberta.',
    rotina: {
      0: 'Guilda de Aventureiros',
      1: 'Ruás medindo passos — Praça / Mercado',
      2: 'Desenhando — Taverna (mesa perto da janela)',
      3: 'Quarto alugado perto da guilda'
    },
    missaoPessoal: {
      titulo: 'Mapa sabotado',
      desc: 'Um mapa que Tessa vendeu levou aventureiros a uma armadilha. Alguém alterou a cópia. Ache o sabotador ou a próxima rota segura.',
      dif: 2, afetoOk: 13, afetoFail: 6, tipo: 'teste', attr: 'H', pericia: 'Saber',
      xp: 6, ouro: 10, itemChance: 0.4, item: 'Mapa verdadeiro dos túneis'
    },
    interacoesAfetoDia: 0, interacoesAfetoDiaRef: 0
  },
  {
    id: 'npc_cidade_vera',
    nome: 'Vera Cald',
    sexo: 'F', sexoLabel: 'Mulher',
    classeKey: 'cacadora',
    classe: 'Caçadora',
    classeDesc: 'Fornece peles e carne. Dracônida discreta; irmã estuda no templo.',
    raca: 'Dracônida',
    idadeId: 'adulto', idade: '33 anos',
    P: 4, H: 4, R: 3,
    vantagens: ['Ágil', 'Forte', 'Sentidos Aguçados'],
    desvantagens: [],
    aparencia: 8,
    afeto: 12,
    cidadeNpc: true,
    recrutado: false, romance: false,
    missoesFeitas: 0, missoesOk: 0, missoesFail: 0,
    notas: 'Cicatriz na bochecha (javali); mãos de couro e fumaça. Aparência 8/10 — teto da cidade comum.',
    objetivos: { curto: 'Entregar pele de lobo na semana', medio: 'Taxa do ano da irmã no templo', longo: 'Cabana na orla da floresta' },
    personalidade: 'Independente e seca; pouco paciente com vaidade; valoriza competência.',
    rotina: {
      0: 'Fora dos muros — Portão Sul / floresta',
      1: 'Banca de peles — Mercado',
      2: 'Mesa isolada — Taverna do Cervo',
      3: 'Acampamento ou quarto barato no Portão Sul'
    },
    missaoPessoal: {
      titulo: 'Não é lobo comum',
      desc: 'Algo mata o rebanho perto dos muros. A guarda quer “qualquer cabeça”. Vera quer a verdade. Cace, investigue ou fabrique um culpado.',
      dif: 3, afetoOk: 18, afetoFail: 9, tipo: 'combate', attr: 'P', pericia: 'Luta',
      xp: 10, ouro: 22, itemChance: 0.35, item: 'Pele da besta'
    },
    interacoesAfetoDia: 0, interacoesAfetoDiaRef: 0
  }
];

function getPeriodoAtualIndex() {
  try {
    if (typeof timeState !== 'undefined' && timeState && typeof timeState.periodIndex === 'number')
      return timeState.periodIndex;
  } catch (e) {}
  return 0;
}

function npcLocalAgora(n) {
  if (!n || !n.rotina) return '—';
  const p = getPeriodoAtualIndex();
  return n.rotina[p] || n.rotina[String(p)] || '—';
}

function ensureCityNpcs() {
  const list = getNpcs();
  let changed = false;
  CITY_NPCS_FIXED.forEach(proto => {
    if (!list.find(n => n.id === proto.id)) {
      list.push(JSON.parse(JSON.stringify(proto)));
      changed = true;
    }
  });
  if (changed) setNpcs(list);
  return getNpcs();
}

function pedirMissaoPessoalNpc(id) {
  const n = getNpcs().find(x => x.id === id);
  if (!n || !n.missaoPessoal) {
    alert('Este NPC não tem missão pessoal registrada.');
    return;
  }
  const missao = { ...n.missaoPessoal };
  const missionUid = 'mp_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  if (typeof npcMissionContext !== 'undefined') {
    npcMissionContext = { npcId: id, missao, resolved: false, missionUid, pessoal: true };
  }
  if (typeof addActiveNpcMission === 'function') {
    addActiveNpcMission({
      uid: missionUid,
      npcId: id,
      npcNome: n.nome,
      missao: { ...missao },
      pessoal: true
    });
  }
  // Reusa painel de missão se existir
  const panel = document.getElementById('npcMissionPanel');
  const body = document.getElementById('npcMissionBody');
  const resultEl = document.getElementById('npcMissionResult');
  if (resultEl) { resultEl.classList.add('hidden'); resultEl.innerHTML = ''; }
  if (!panel || !body) {
    alert('Missão pessoal: ' + missao.titulo + '\\n\\n' + missao.desc);
    return;
  }
  const hero = typeof getNpcHeroSelecionado === 'function' ? getNpcHeroSelecionado() : null;
  const heroNome = hero ? hero.nome : '— nenhum herói —';
  const attrLabel = missao.attr === 'P' ? 'Poder' : (missao.attr === 'R' ? 'Resistência' : 'Habilidade');
  const nd = typeof ndMissao === 'function' ? ndMissao(missao.dif) : 7;
  body.innerHTML = `
    <div style="font-size:0.8rem;color:#fbbf24;margin-bottom:4px;">📖 Missão pessoal de ${esc(n.nome)}</div>
    <div style="font-size:1.15rem; font-weight:800; color:var(--accent); margin-bottom:8px;">${esc(missao.titulo)}</div>
    <div style="margin-bottom:10px; line-height:1.45;">${esc(missao.desc)}</div>
    <div style="font-size:0.85rem; color:var(--muted); margin-bottom:10px;">
      Tipo: <strong>${missao.tipo === 'combate' ? '⚔️ Combate' : '🎲 Teste'}</strong> · ND ${nd}<br>
      Afeto: <span style="color:var(--success)">+${missao.afetoOk}</span> /
      <span style="color:var(--accent2)">−${missao.afetoFail}</span><br>
      Recompensas: <strong>+${missao.xp || 0} XP</strong>, <strong>${missao.ouro || 0} ouro</strong>
    </div>
    <div style="background:var(--bg-input); border:1px solid var(--border); border-radius:10px; padding:10px; margin-bottom:12px;">
      <div style="font-size:0.8rem; color:var(--muted);">Herói</div>
      <div style="font-weight:700;">${esc(heroNome)}</div>
    </div>
  `;
  panel.classList.remove('hidden');
  panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function ensureSeraphineProgeny() {
  const list = getNpcs();
  let changed = false;
  SERAPHINE_PROGENY.forEach(proto => {
    if (!list.find(n => n.id === proto.id)) {
      list.push(JSON.parse(JSON.stringify(proto)));
      changed = true;
    }
  });
  if (changed) {
    setNpcs(list);
    try { if (typeof pushServoLog === 'function') pushServoLog('🩸 Progênie de Seraphine encontrada nos círculos da Casa.'); } catch (e) {}
  }
  return getNpcs();
}

/**
 * Interação social para aumentar Afeto.
 * Dentro do limite: ganho pequeno/médio + avança 1 período do dia.
 * Além do limite: redutores pesados (pioram o Afeto).
 */
function interagirAfetoNpc(id, tipo) {
  ensureSeraphineProgeny();
  const list = getNpcs();
  const idx = list.findIndex(x => x.id === id);
  if (idx < 0) return;
  let n = syncNpcInteracoesDia(list[idx]);
  const limite = limiteInteracoesAfetoDiarias(n.afeto);
  const usadas = n.interacoesAfetoDia || 0;
  const alemDoLimite = usadas >= limite;

  const tipos = {
    conversa: { label: 'Conversar', min: 2, max: 5, custo: 0 },
    presente: { label: 'Dar presente', min: 4, max: 10, custo: 25 },
    elogio: { label: 'Elogiar', min: 1, max: 4, custo: 0 },
    favor: { label: 'Fazer um favor', min: 3, max: 8, custo: 0 },
    noite: { label: 'Companhia noturna', min: 5, max: 12, custo: 40 }
  };
  const cfg = tipos[tipo] || tipos.conversa;

  // BLOQUEIO RÍGIDO: não permite mais interações sociais no dia após o limite
  if (alemDoLimite) {
    alert(`⛔ ${n.nome} não quer mais interagir hoje.\n\nLimite: ${usadas}/${limite} interações de afeto neste dia de campanha.\nAvance para o próximo dia (amanhecer) para conversar de novo.\n\n(Ajuste manual +5/−5 continua disponível só para a mesa/mestre.)`);
    return;
  }

  // Custo em ouro (herói selecionado na tela de NPCs)
  if (cfg.custo > 0) {
    const hero = typeof getNpcHeroSelecionado === 'function' ? getNpcHeroSelecionado() : null;
    if (!hero) {
      alert('Selecione um herói no topo da tela de NPCs para pagar esta interação.');
      return;
    }
    if ((hero.ouro || 0) < cfg.custo) {
      alert(`Custa ${cfg.custo} Tibar (herói tem ${hero.ouro || 0}).`);
      return;
    }
    const chars = getSaved();
    const ci = chars.findIndex(c => c.id === hero.id);
    if (ci >= 0) {
      chars[ci].ouro = (chars[ci].ouro || 0) - cfg.custo;
      setSaved(chars);
    }
  }

  let delta = 0;
  let msg = '';
  const nome = n.nome;

  if (alemDoLimite) {
    // Grandes redutores — insistir cansa / irrita o NPC
    const penal = -(6 + Math.floor(Math.random() * 10)); // −6 a −15
    delta = penal;
    // Progênie de Seraphine: ainda mais intolerante se forçada
    if (n.progenieSeraphine) delta -= 2;
    msg = `⚠️ ${nome} já deu o que podia de atenção hoje (limite ${limite}/dia neste nível de Afeto).\n\nInsistir atrapalha mais do que ajuda.\nAfeto ${delta} → `;
  } else {
    const base = cfg.min + Math.floor(Math.random() * (cfg.max - cfg.min + 1));
    // Chance de falha social se afeto muito baixo
    const chance = 0.55 + Math.min(0.35, (n.afeto || 0) / 200);
    const ok = Math.random() < chance;
    delta = ok ? base : Math.max(1, Math.floor(base / 3));
    if (!ok) msg = `😐 Conversa morna com ${nome}. `;
    else msg = `✅ ${cfg.label} com ${nome}. `;
    if (n.progenieSeraphine && ok) {
      msg += '(Ela avalia você com olhar antigo…) ';
    }
    msg += `Afeto +${delta} → `;
  }

  const before = n.afeto || 0;
  n.afeto = Math.max(0, Math.min(100, before + delta));
  n.interacoesAfetoDia = (n.interacoesAfetoDia || 0) + 1;
  n.interacoesAfetoDiaRef = getDiaCampanhaAtual();
  list[idx] = n;
  setNpcs(list);

  // Cada interação de Afeto = 1 etapa do dia (período)
  try {
    if (typeof advancePeriod === 'function') advancePeriod(true);
  } catch (e) {}

  const usadasAgora = n.interacoesAfetoDia;
  alert(msg + `${n.afeto}/100\n\nInterações de afeto hoje com este NPC: ${usadasAgora}/${limite} (limite pelo Afeto antes desta ação).\nO tempo avançou 1 período do dia.`);

  renderNpcList();
  openNpcDetail(id);
}

function npcLimiteAfetoInfo(n) {
  n = syncNpcInteracoesDia({ ...n });
  const lim = limiteInteracoesAfetoDiarias(n.afeto);
  const usadas = n.interacoesAfetoDia || 0;
  return { lim, usadas, restam: Math.max(0, lim - usadas), dia: n.interacoesAfetoDiaRef || getDiaCampanhaAtual() };
}


function scaleStat(base, mult) {
  return Math.max(0, Math.round(base * mult));
}

function gerarNpcAleatorio() {
  const sexo = Math.random() < 0.3 ? 'M' : 'F'; // 30% homem, 70% mulher
  const classKey = pick(Object.keys(NPC_CLASSES));
  const cls = NPC_CLASSES[classKey];
  const idade = pick(NPC_IDADES);
  const nome = sexo === 'M' ? pick(NOMES_M) : pick(NOMES_F);
  const sobrenome = pick(['Storm', 'Vale', 'Rocha', 'Luna', 'Ferro', 'Sombra', 'Brisa', 'Corvo', 'Sol', 'Neve', 'Ash', 'Thorn']);

  const P = scaleStat(cls.P, idade.mult);
  const H = scaleStat(cls.H, idade.mult);
  const R = scaleStat(cls.R, idade.mult);
  let afeto = idade.afetoBase + Math.floor(Math.random() * 15) - 5;
  // Bônus/penalidade de reputação pública conforme a classe do NPC
  try {
    if (typeof afetoBonusFromReputation === 'function') {
      afeto += afetoBonusFromReputation(cls.nome);
    }
  } catch (e) {}
  afeto = Math.min(70, Math.max(0, afeto));

  // Aparência 1–10 (2D6+1, como PJs)
  const aparRoll = (1 + Math.floor(Math.random() * 6)) + (1 + Math.floor(Math.random() * 6)) + 1;
  const aparencia = Math.max(1, Math.min(10, aparRoll));
  const apInfo = typeof aparenciaBonus === 'function' ? aparenciaBonus(aparencia) : null;

  const npc = {
    id: 'npc_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
    nome: nome + ' ' + sobrenome,
    sexo,
    sexoLabel: sexo === 'M' ? 'Homem' : 'Mulher',
    classeKey: classKey,
    classe: cls.nome,
    classeDesc: cls.desc,
    idadeId: idade.id,
    idade: idade.label,
    P, H, R,
    aparencia,
    vantagens: [...cls.vantagens],
    afeto,
    recrutado: false,
    romance: false,
    missoesFeitas: 0,
    missoesOk: 0,
    missoesFail: 0,
    criadoEm: new Date().toISOString(),
    notas: ''
  };

  const list = getNpcs();
  list.unshift(npc);
  setNpcs(list);
  renderNpcList();
  openNpcDetail(npc.id);
  alert(`NPC gerado!\n\n${npc.nome}\n${npc.sexoLabel} · ${npc.classe} · ${npc.idade}\nP${npc.P} H${npc.H} R${npc.R}\n✨ Aparência ${aparencia}/10${apInfo ? ' — ' + apInfo.label : ''}\nAfeto inicial: ${npc.afeto}/100`);
}

function populateNpcHeroSelect() {
  const sel = document.getElementById('npcHeroSelect');
  if (!sel) return;
  const list = typeof getSaved === 'function' ? getSaved() : [];
  const current = sel.value;
  sel.innerHTML = '<option value="">— Nenhum herói —</option>' +
    list.filter(c => !c.isTemp).map(c => `<option value="${c.id}">${esc(c.nome)} (P${c.P} H${c.H} R${c.R})</option>`).join('');
  if (current) sel.value = current;
}

function renderNpcList() {
  try { renderActiveNpcMissions(); } catch (e) {}
  const container = document.getElementById('npcListContainer');
  const badge = document.getElementById('npcCountBadge');
  if (!container) return;
  const list = getNpcs();
  if (badge) badge.textContent = String(list.length);
  if (!list.length) {
    container.innerHTML = '<p style="color:var(--muted); text-align:center; padding:16px;">Nenhum NPC ainda. Gere o primeiro!</p>';
    return;
  }
  container.innerHTML = list.map(n => {
    const a = afetoLabel(n.afeto);
    const tags = [];
    if (n.progenieSeraphine) tags.push('<span class="tag" style="border-color:#a855f7;color:#d8b4fe">🩸 Progênie Seraphine</span>');
    if (n.matilhaSelene) tags.push('<span class="tag" style="border-color:#94a3b8;color:#e2e8f0">🐺 Matilha Selene</span>');
    if (n.cidadeNpc) tags.push('<span class="tag" style="border-color:#22c55e;color:#86efac">🏙️ Cidade/Taverna</span>');
    if (n.arquetipoId === 'vampiro' || n.racaOculta === 'vampiro') tags.push('<span class="tag" style="border-color:#7c3aed;color:#c4b5fd">🔒 Vampiro</span>');
    if (n.arquetipoId === 'licantropo' || n.racaOculta === 'licantropo') tags.push('<span class="tag" style="border-color:#64748b;color:#cbd5e1">🐺 Licantropo</span>');
    if (n.recrutado) tags.push('<span class="tag" style="border-color:var(--success);color:var(--success)">No grupo</span>');
    if (n.romance) tags.push('<span class="tag" style="border-color:#ec4899;color:#ec4899">Romance</span>');
    try {
      const li = typeof npcLimiteAfetoInfo === 'function' ? npcLimiteAfetoInfo(n) : null;
      if (li) tags.push(`<span class="tag" style="border-color:var(--border);color:var(--muted)">Afeto hoje ${li.usadas}/${li.lim}</span>`);
    } catch (e) {}
    return `
      <div class="char-card" onclick="openNpcDetail('${n.id}')" style="cursor:pointer;">
        <div>
          <div style="font-weight:800; font-size:1.05rem;">${esc(n.nome)}</div>
          <div style="font-size:0.85rem; color:var(--muted);">${n.sexoLabel} · ${esc(n.classe)}${n.raca ? ' · ' + esc(n.raca) : ''} · ${esc(n.idade)} · P${n.P} H${n.H} R${n.R}</div>
          ${n.rotina ? `<div style="font-size:0.78rem; color:#86efac; margin-top:2px;">📍 Agora: ${esc(typeof npcLocalAgora === 'function' ? npcLocalAgora(n) : '—')}</div>` : ''}
          <div style="margin-top:6px; display:flex; flex-wrap:wrap; gap:6px; align-items:center;">
            <span class="status-badge ${a.cls}" style="font-size:0.75rem;">Afeto ${n.afeto}/100 — ${a.text}</span>
            ${tags.join('')}
          </div>
        </div>
        <button class="btn btn-sm btn-outline" onclick="event.stopPropagation(); openNpcDetail('${n.id}')">Ver</button>
      </div>`;
  }).join('');
}

function openNpcDetail(id) {
  const n = getNpcs().find(x => x.id === id);
  if (!n) return;
  const panel = document.getElementById('npcDetailPanel');
  const body = document.getElementById('npcDetailBody');
  const actions = document.getElementById('npcDetailActions');
  const title = document.getElementById('npcDetailTitle');
  if (!panel || !body) return;

  const a = afetoLabel(n.afeto);
  const barPct = Math.min(100, Math.max(0, n.afeto));
  title.textContent = n.nome;
  const limInfoPre = typeof npcLimiteAfetoInfo === 'function' ? npcLimiteAfetoInfo(n) : { lim: 1, usadas: 0, restam: 1 };
  const progTagPre = n.progenieSeraphine
    ? `<div style="margin-top:8px;padding:8px;border-radius:8px;background:rgba(124,58,237,0.15);border:1px solid rgba(168,85,247,0.4);font-size:0.82rem;color:#d8b4fe;">🩸 <strong>Progênie de Madame Seraphine</strong> — Vampira. Transformada pela Dona da Casa. Trate com respeito.</div>`
    : '';

  body.innerHTML = `
    <div style="text-align:center; margin-bottom:12px;">
      <div style="font-size:0.9rem; color:var(--muted);">${n.sexoLabel} · <strong style="color:var(--accent)">${esc(n.classe)}</strong> · ${esc(n.idade)}</div>
      <div style="font-size:0.85rem; color:var(--muted); margin-top:4px;">${esc(n.classeDesc || '')}</div>
    </div>
    <div class="attr-display">
      <div class="attr-box"><div class="letter">PODER</div><div class="num">${n.P}</div></div>
      <div class="attr-box"><div class="letter">HABILIDADE</div><div class="num">${n.H}</div></div>
      <div class="attr-box"><div class="letter">RESISTÊNCIA</div><div class="num">${n.R}</div></div>
    </div>
    <div class="section-title">✨ Aparência</div>
    <div class="list-section">${(() => {
      const apN = n.aparencia != null ? n.aparencia : 5;
      const ap = typeof aparenciaBonus === 'function' ? aparenciaBonus(apN) : null;
      return `<strong>${apN}/10</strong>${ap ? ' — ' + esc(ap.label) : ''} <span style="font-size:0.75rem;color:var(--muted)">(social ${ap && ap.mod >= 0 ? '+' : ''}${ap ? ap.mod : 0})</span>`;
    })()}</div>
    <div class="section-title">Afeto (confiança / amizade)</div>
    <div style="background:var(--bg-input); border:1px solid var(--border); border-radius:10px; padding:12px;">
      <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
        <span class="status-badge ${a.cls}">${a.text}</span>
        <strong style="color:${a.color}">${n.afeto} / 100</strong>
      </div>
      <div class="bar-bg" style="height:12px;"><div class="bar-fill" style="width:${barPct}%; background:linear-gradient(90deg,#ec4899,#a855f7);"></div></div>
      <div style="font-size:0.78rem; color:var(--muted); margin-top:8px;">
        0–19 hostil · 20–39 neutro · 40–59 cordial · 60–79 amistoso · 80–99 leal · <strong>100 recrutável / romance</strong>
      </div>
    </div>
    <div class="section-title">Vantagens</div>
    <div class="list-section">${(n.vantagens || []).map(v => esc(v)).join(', ') || '—'}</div>
    <div class="section-title">Histórico de missões</div>
    <div class="list-section">Feitas: ${n.missoesFeitas || 0} · Sucesso: ${n.missoesOk || 0} · Falha: ${n.missoesFail || 0}</div>
    <div class="section-title">Status especial</div>
    <div class="list-section">
      ${n.recrutado ? '✅ Já está no grupo como personagem jogável.' : 'Ainda não recrutado.'}
      ${n.romance ? '<br>💕 Compromisso amoroso ativo com o herói vinculado.' : ''}
      ${n.cidadeNpc ? '<br>🏙️ NPC fixa da Cidade & Taverna (vida própria, rotina por período).' : ''}
    </div>
    ${n.rotina ? `<div class="section-title">📍 Onde está agora (${typeof PERIODS !== 'undefined' ? PERIODS[getPeriodoAtualIndex()] : 'período'})</div>
    <div class="list-section" style="color:#86efac;">${esc(npcLocalAgora(n))}</div>
    <div style="font-size:0.78rem;color:var(--muted);margin-top:4px;">
      Manhã: ${esc(n.rotina[0]||n.rotina['0']||'—')}<br>
      Tarde: ${esc(n.rotina[1]||n.rotina['1']||'—')}<br>
      Noite: ${esc(n.rotina[2]||n.rotina['2']||'—')}<br>
      Madrugada: ${esc(n.rotina[3]||n.rotina['3']||'—')}
    </div>` : ''}
    ${n.personalidade ? `<div class="section-title">💭 Personalidade</div><div class="list-section">${esc(n.personalidade)}</div>` : ''}
    ${n.objetivos ? `<div class="section-title">🎯 Objetivos pessoais</div>
    <div class="list-section" style="font-size:0.85rem;">
      Curto: ${esc(n.objetivos.curto||'—')}<br>
      Médio: ${esc(n.objetivos.medio||'—')}<br>
      Longo: ${esc(n.objetivos.longo||'—')}
    </div>` : ''}
    ${n.missaoPessoal ? `<div class="section-title">📖 Missão pessoal</div>
    <div class="list-section"><strong>${esc(n.missaoPessoal.titulo)}</strong><br>${esc(n.missaoPessoal.desc)}</div>` : ''}
    ${n.aparencia != null ? `<div style="font-size:0.85rem;color:var(--muted);margin-top:8px;">✨ Aparência: <strong>${n.aparencia}/10</strong>${n.raca ? ' · Raça: ' + esc(n.raca) : ''}</div>` : ''}
    <div style="margin-top:10px;padding:10px;border-radius:8px;background:var(--bg-input);border:1px solid var(--border);font-size:0.85rem;">
      <strong>Interações de Afeto hoje</strong>: ${limInfoPre.usadas} / ${limInfoPre.lim}
      ${limInfoPre.restam <= 0 ? ' <span style="color:var(--accent2);">· Limite atingido — insistir prejudica</span>' : ` · restam <strong>${limInfoPre.restam}</strong>`}
      <div style="font-size:0.75rem;color:var(--muted);margin-top:4px;">Cada interação de afeto avança 1 período do dia. O limite sobe com o Afeto.</div>
    </div>
    ${progTagPre}
  `;

  const canRecruit = n.afeto >= 100 && !n.recrutado;
  const canRomance = n.afeto >= 100 && !n.romance && (n.idadeId !== 'crianca');
  const limInfo = limInfoPre;

  actions.innerHTML = `
    <div style="width:100%;font-size:0.8rem;color:var(--muted);margin-bottom:4px;">Cena social guiada (teste + 3 desfechos)</div>
    <button class="btn" style="width:auto;background:linear-gradient(135deg,#a855f7,#6366f1);color:#fff;" onclick="(function(){const h=getNpcHeroSelecionado();if(!h){alert('Selecione o herói no topo da tela de NPCs');return;}abrirCenaSocialUI(h.id,'${n.id}');})()">🗣️ Cena Social</button>
    <div style="width:100%;font-size:0.8rem;color:var(--muted);margin:8px 0 4px;">Interagir (objetivo: Afeto) — conta como etapa do dia</div>
    ${(() => {
      const li = typeof npcLimiteAfetoInfo === 'function' ? npcLimiteAfetoInfo(n) : { lim: 1, usadas: 0, restam: 1 };
      const esgotado = li.restam <= 0;
      const dis = esgotado ? 'disabled style="opacity:0.45;cursor:not-allowed;width:auto;"' : 'style="width:auto;"';
      const hint = esgotado
        ? `<div style="width:100%;font-size:0.78rem;color:#f87171;margin:4px 0 8px;">⛔ Limite diário de afeto esgotado (${li.usadas}/${li.lim}). Volte amanhã.</div>`
        : `<div style="width:100%;font-size:0.78rem;color:var(--muted);margin:4px 0 8px;">Interações de afeto hoje: <strong>${li.usadas}/${li.lim}</strong> (restam ${li.restam})</div>`;
      return hint + `
    <button class="btn btn-sm" ${esgotado ? dis : 'style="width:auto;background:linear-gradient(135deg,#ec4899,#a855f7);color:#fff;"'} onclick="interagirAfetoNpc('${n.id}','conversa')" ${esgotado?'disabled':''}>💬 Conversar</button>
    <button class="btn btn-sm btn-outline" ${dis} onclick="interagirAfetoNpc('${n.id}','elogio')" ${esgotado?'disabled':''}>✨ Elogiar</button>
    <button class="btn btn-sm btn-outline" ${dis} onclick="interagirAfetoNpc('${n.id}','favor')" ${esgotado?'disabled':''}>🤝 Favor</button>
    <button class="btn btn-sm" ${esgotado ? dis : 'style="width:auto;background:linear-gradient(135deg,#f59e0b,#fbbf24);color:#000;"'} onclick="interagirAfetoNpc('${n.id}','presente')" ${esgotado?'disabled':''}>🎁 Presente (25T)</button>
    <button class="btn btn-sm" ${esgotado ? dis : 'style="width:auto;background:linear-gradient(135deg,#be185d,#9d174d);color:#fff;"'} onclick="interagirAfetoNpc('${n.id}','noite')" ${esgotado?'disabled':''}>🌙 Companhia (40T)</button>`;
    })()}
    <button class="btn" onclick="pedirMissaoNpc('${n.id}')">📜 Pedir missão (geral)</button>
    ${n.missaoPessoal ? `<button class="btn" style="background:linear-gradient(135deg,#22c55e,#15803d);color:#fff;" onclick="pedirMissaoPessoalNpc('${n.id}')">📖 Missão pessoal</button>` : ''}
    <button class="btn btn-outline btn-sm" onclick="ajustarAfetoNpc('${n.id}', 5)" title="Ajuste manual (mesa)">+5</button>
    <button class="btn btn-outline btn-sm" onclick="ajustarAfetoNpc('${n.id}', -5)" title="Ajuste manual (mesa)">−5</button>
    ${canRecruit ? `<button class="btn btn-success" onclick="recrutarNpc('${n.id}')">🛡️ Recrutar para o grupo</button>` : ''}
    ${canRomance ? `<button class="btn" style="background:linear-gradient(135deg,#ec4899,#f43f5e);color:#fff;" onclick="proporRomanceNpc('${n.id}')">💕 Propor compromisso</button>` : ''}
    ${n.progenieSeraphine ? `<button class="btn btn-sm" style="width:auto;background:linear-gradient(135deg,#7c3aed,#a855f7);color:#fff;" onclick="(function(){const h=getNpcHeroSelecionado();if(!h){alert('Selecione o herói no topo');return;}tentarTransformacaoVampirica(h.id,'progenie','${n.id}');})()">🩸 Pedir o Beijo (virar Vampiro)</button>` : ''}
    ${n.matilhaSelene ? `<button class="btn btn-sm" style="width:auto;background:linear-gradient(135deg,#64748b,#334155);color:#fff;" onclick="(function(){const h=getNpcHeroSelecionado();if(!h){alert('Selecione o herói no topo');return;}tentarTransformacaoLupinica(h.id,'matilha','${n.id}');})()">🐺 Pedir a Marca (virar Lobisomem)</button>` : ''}
    ${(!n.progenieSeraphine && !n.matilhaSelene && !n.cidadeNpc) ? `<button class="btn btn-danger" onclick="excluirNpc('${n.id}')">🗑️ Excluir NPC</button>` : ''}
  `;
  panel.classList.remove('hidden');
  panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function closeNpcDetail() {
  const panel = document.getElementById('npcDetailPanel');
  if (panel) panel.classList.add('hidden');
}

function ajustarAfetoNpc(id, delta) {
  const list = getNpcs();
  const idx = list.findIndex(x => x.id === id);
  if (idx < 0) return;
  list[idx].afeto = Math.max(0, Math.min(100, (list[idx].afeto || 0) + delta));
  setNpcs(list);
  renderNpcList();
  openNpcDetail(id);
}

function fecharPainelMissaoNpc() {
  const panel = document.getElementById('npcMissionPanel');
  const res = document.getElementById('npcMissionResult');
  if (panel) panel.classList.add('hidden');
  if (res) { res.classList.add('hidden'); res.innerHTML = ''; }
}

function getNpcHeroSelecionado() {
  const sel = document.getElementById('npcHeroSelect');
  if (!sel || !sel.value) return null;
  return (typeof getSaved === 'function' ? getSaved() : []).find(c => c.id === sel.value) || null;
}

function ndMissao(dif) {
  // 3DeT Victory ND: 8, 10, 12, 14, 16, 18
  const map = { 1: 8, 2: 10, 3: 12, 4: 14, 5: 16, 6: 18 };
  return map[dif] || map[Math.min(6, Math.max(1, dif || 1))] || 10;
}

function bonusPericiaHero(hero, nomePericia) {
  if (!hero || !nomePericia) return 0;
  const list = hero.pericias || [];
  if (!list.includes(nomePericia)) return 0;
  // Básico +1; se tiver vantagem relacionada ou nível alto, +2 (simplificado)
  return 2;
}

function pedirMissaoNpc(id) {
  const n = getNpcs().find(x => x.id === id);
  if (!n) return;
  const missao = pick(NPC_MISSOES);
  const missionUid = 'm_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  npcMissionContext = { npcId: id, missao, resolved: false, missionUid };
  addActiveNpcMission({
    uid: missionUid,
    npcId: id,
    npcNome: n.nome,
    missao: { ...missao },
    resolved: false,
    createdAt: Date.now()
  });
  const panel = document.getElementById('npcMissionPanel');
  const body = document.getElementById('npcMissionBody');
  const resultEl = document.getElementById('npcMissionResult');
  if (!panel || !body) return;
  if (resultEl) { resultEl.classList.add('hidden'); resultEl.innerHTML = ''; }

  const hero = getNpcHeroSelecionado();
  const heroNome = hero ? hero.nome : '— nenhum herói selecionado —';
  const attrLabel = missao.attr === 'P' ? 'Poder' : (missao.attr === 'R' ? 'Resistência' : 'Habilidade');
  const nd = ndMissao(missao.dif);
  const tipoLabel = missao.tipo === 'combate' ? '⚔️ Combate' : '🎲 Teste de perícia/característica';

  let actionButtons = '';
  if (missao.tipo === 'combate') {
    actionButtons = `
      <button class="btn" style="background:linear-gradient(135deg,#ef4444,#f97316);color:#fff; flex:1;" onclick="combateRapidoMissaoNpc()">⚔️ Combate Rápido (nesta página)</button>
      <button class="btn btn-outline" style="flex:1;" onclick="rolarTesteMissaoNpc()">🎲 Teste alternativo (${attrLabel})</button>
    `;
  } else {
    actionButtons = `
      <button class="btn" style="background:linear-gradient(135deg,#3b82f6,#8b5cf6);color:#fff; flex:1;" onclick="rolarTesteMissaoNpc()">🎲 Rolar Teste (${attrLabel}${missao.pericia ? ' + ' + missao.pericia : ''})</button>
      ${missao.tipo === 'teste' && missao.dif >= 2 ? `<button class="btn btn-outline" style="flex:1;" onclick="combateRapidoMissaoNpc()">⚔️ Resolver como combate</button>` : ''}
    `;
  }

  body.innerHTML = `
    <div style="font-size:1.15rem; font-weight:800; color:var(--accent); margin-bottom:8px;">${esc(missao.titulo)}</div>
    <div style="margin-bottom:10px; line-height:1.45;">${esc(missao.desc)}</div>
    <div style="font-size:0.85rem; color:var(--muted); margin-bottom:10px;">
      Pedida por: <strong style="color:var(--text)">${esc(n.nome)}</strong><br>
      Tipo: <strong>${tipoLabel}</strong> · Dificuldade: ${'⭐'.repeat(missao.dif)} (ND ${nd})<br>
      Afeto: <span style="color:var(--success)">+${missao.afetoOk}</span> sucesso /
      <span style="color:var(--accent2)">−${missao.afetoFail}</span> falha<br>
      Recompensas (sucesso): <strong style="color:var(--magic)">+${missao.xp || 0} XP</strong>,
      <strong style="color:#fbbf24">${missao.ouro || 0} ouro</strong>${missao.item ? `, chance de <em>${esc(missao.item)}</em>` : ''}
    </div>
    <div style="background:var(--bg-input); border:1px solid var(--border); border-radius:10px; padding:10px; margin-bottom:12px;">
      <div style="font-size:0.8rem; color:var(--muted); margin-bottom:4px;">Herói que tentará a missão</div>
      <div style="font-weight:700;">${esc(heroNome)}</div>
      ${hero ? `<div style="font-size:0.8rem; color:var(--muted);">P${hero.P} H${hero.H} R${hero.R}${hero.pericias && hero.pericias.length ? ' · Perícias: ' + hero.pericias.join(', ') : ''}</div>` : '<div style="font-size:0.8rem; color:var(--accent2);">Selecione um herói no topo da tela de NPCs.</div>'}
    </div>
    <div class="flex-row" style="flex-wrap:wrap; gap:8px; margin-bottom:8px;">
      ${actionButtons}
    </div>
    <div class="rule-badge" style="margin-top:6px; font-size:0.78rem;">
      3DeT Victory: teste = 2D6 + H + bônus de perícia (≥ ND 8–18). Combate rápido = FA 2D6+P vs FD 2D6+R, dano limitado a P.
    </div>
  `;
  panel.classList.remove('hidden');
  panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function mostrarResultadoMissao(html, sucesso) {
  const el = document.getElementById('npcMissionResult');
  if (!el) return;
  el.classList.remove('hidden');
  el.style.borderColor = sucesso ? 'var(--success)' : 'var(--accent2)';
  el.innerHTML = html;
  el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function aplicarRecompensaMissao(hero, missao, sucesso) {
  if (!hero || !sucesso) return { xp: 0, ouro: 0, item: null, msg: '' };
  const chars = typeof getSaved === 'function' ? getSaved() : [];
  const idx = chars.findIndex(c => c.id === hero.id);
  if (idx < 0) return { xp: 0, ouro: 0, item: null, msg: 'Herói não encontrado nos salvos.' };

  const c = normalizeCharacter(chars[idx]);
  const xpGain = missao.xp || Math.max(2, (missao.dif || 1) * 3);
  const ouroGain = missao.ouro || Math.max(3, (missao.dif || 1) * 5);
  let itemObj = null;
  if (missao.item && Math.random() < (missao.itemChance || 0.2)) {
    const nomeItem = typeof missao.item === 'string' ? missao.item : (missao.item.nome || 'Item de Missão');
    itemObj = {
      id: 'reward_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
      nome: nomeItem,
      tipo: 'misc',
      valor: Math.max(5, (missao.ouro || 5) * 2),
      qtd: 1,
      usavel: false,
      desc: 'Recompensa de missão: ' + (missao.titulo || 'NPC')
    };
    // Tenta casar com catálogo do mercado para poções usáveis
    try {
      if (typeof SHOP_CATALOG !== 'undefined') {
        const cat = SHOP_CATALOG.find(s => s.nome === nomeItem || s.invNome === nomeItem || (s.invNome && s.invNome.indexOf(nomeItem) === 0));
        if (cat) {
          itemObj.nome = cat.invNome || cat.nome;
          itemObj.tipo = cat.tipo;
          itemObj.usavel = !!cat.usavel;
          itemObj.efeito = cat.efeito || null;
          itemObj.desc = cat.desc || itemObj.desc;
          itemObj.valor = cat.valor || itemObj.valor;
        }
      }
    } catch (e) {}
  }

  c.XP = (c.XP || 0) + xpGain;
  creditarOuroComDivida(c, ouroGain);
  if (!Array.isArray(c.inventario)) c.inventario = [];
  if (itemObj) c.inventario.push(itemObj);
  if (typeof convertXpToPoints === 'function') convertXpToPoints(c);

  chars[idx] = c;
  if (typeof setSaved === 'function') setSaved(chars);

  if (typeof accumulatedXp === 'number') {
    accumulatedXp += Math.max(1, Math.floor(xpGain / 2));
    if (typeof updateSessionDisplays === 'function') updateSessionDisplays();
    else {
      const badge = document.getElementById('sessionXpBadge');
      if (badge) badge.textContent = `XP Banco: ${accumulatedXp}`;
    }
  }

  let msg = `+${xpGain} XP · +${ouroGain} ouro`;
  if (itemObj) msg += ` · Item: ${itemObj.nome}`;
  return { xp: xpGain, ouro: ouroGain, item: itemObj, msg };
}

function rolarTesteMissaoNpc() {
  if (!npcMissionContext || npcMissionContext.resolved) {
    alert('Nenhuma missão ativa ou já resolvida.');
    return;
  }
  const hero = getNpcHeroSelecionado();
  if (!hero) {
    alert('Selecione um herói no topo da tela de NPCs antes de rolar o teste.');
    return;
  }
  const missao = npcMissionContext.missao;
  // Victory: testes de perícia usam 2D6 + H + bônus (mesmo se a missão citava P)
  const attrKey = 'H';
  const attrVal = Number(hero.H) || 0;
  const bonusPericia = typeof bonusPericiaHero === 'function' ? bonusPericiaHero(hero, missao.pericia) : (missao.pericia && (hero.pericias || []).includes(missao.pericia) ? 2 : 0);
  const roll = typeof roll2D6 === 'function' ? roll2D6() : { total: 7, diceStr: '3+4=7', critical: false, fumble: false };
  // Aparência + Humor entram em testes sociais
  const social = (typeof isTesteSocial === 'function' && isTesteSocial(missao.pericia, missao.titulo))
    ? (typeof getModificadoresSociais === 'function' ? getModificadoresSociais(hero) : { total: 0, ap: 0, humor: 0 })
    : { total: 0, ap: 0, humor: 0 };
  const total = roll.total + attrVal + bonusPericia + (social.total || 0);
  const nd = ndMissao(missao.dif);
  let sucesso = total >= nd && !roll.fumble;
  if (roll.critical) sucesso = true;

  let modLinha = '';
  if (bonusPericia) modLinha += ` +${bonusPericia} (perícia)`;
  if (social.total) modLinha += ` ${social.total >= 0 ? '+' : ''}${social.total} (Aparência/Humor)`;

  let html = `
    <div style="font-weight:800; margin-bottom:6px;">🎲 Teste Victory: 2D6 + H${missao.pericia ? ' + ' + esc(missao.pericia) : ''}${social.total ? ' + Aparência' : ''}</div>
    <div style="font-size:0.9rem; margin-bottom:8px;">
      ${esc(hero.nome)}: 2D6 [${roll.diceStr}] + H${attrVal}${modLinha} = <strong style="font-size:1.15rem;">${total}</strong>
      vs ND <strong>${nd}</strong>
      ${roll.critical ? ' <span style="color:var(--success)">⭐ Sucesso Extraordinário!</span>' : ''}
      ${roll.fumble ? ' <span style="color:var(--accent2)">💥 Falha Crítica!</span>' : ''}
    </div>
    <div style="font-weight:700; color:${sucesso ? 'var(--success)' : 'var(--accent2)'}; margin-bottom:8px;">
      ${sucesso ? '✅ SUCESSO!' : '❌ FALHA'}
    </div>
  `;

  if (sucesso) {
    const rew = aplicarRecompensaMissao(hero, missao, true);
    html += `<div style="font-size:0.85rem; color:var(--muted);">Recompensas aplicadas em ${esc(hero.nome)}: ${rew.msg}</div>`;
  } else {
    html += `<div style="font-size:0.85rem; color:var(--muted);">Nenhuma recompensa. O afeto do NPC será reduzido.</div>`;
  }

  mostrarResultadoMissao(html, sucesso);
  // Aplica resultado na missão (afeto etc.)
  resolverMissaoNpc(sucesso, true); // silent = true (não fecha painel imediatamente, já mostramos resultado)
}

function combateRapidoMissaoNpc() {
  if (!npcMissionContext || npcMissionContext.resolved) {
    alert('Nenhuma missão ativa ou já resolvida.');
    return;
  }
  const hero = getNpcHeroSelecionado();
  if (!hero) {
    alert('Selecione um herói no topo da tela de NPCs antes do combate.');
    return;
  }
  const missao = npcMissionContext.missao;
  const Pval = Number(hero.P) || 0;
  const enemyR = 1 + (missao.dif || 1);
  const heroRoll = roll2D6();
  const enemyRoll = roll2D6();
  const pForFa = heroRoll.critical ? Pval * 2 : Pval;
  const dmgCap = heroRoll.critical ? Pval * 2 : Pval;
  const fa = heroRoll.total + pForFa;
  const fd = enemyRoll.total + enemyR;
  let dmg = 0;
  let sucesso = false;
  let detail = '';
  if (heroRoll.fumble) {
    detail = 'Falha crítica (1+1) — derrota no combate rápido.';
    sucesso = false;
  } else if (enemyRoll.fumble || fa > fd) {
    dmg = Math.min(dmgCap, Math.max(0, fa - (enemyRoll.fumble ? 0 : fd)));
    sucesso = true;
    detail = 'FA ' + fa + ' vs FD ' + fd + ' → dano ' + dmg + ' (limite ' + dmgCap + (heroRoll.critical ? ' = 2×P crítico' : ' = P') + ')';
  } else {
    detail = 'FA ' + fa + ' ≤ FD ' + fd + ' — inimigo resiste.';
    sucesso = false;
  }
  let html = `
    <div style="font-weight:800; margin-bottom:6px;">⚔️ Combate Rápido (3DeT Victory)</div>
    <div style="font-size:0.9rem; margin-bottom:8px;">
      ${esc(hero.nome)}: 2D6 [${heroRoll.diceStr}] + P${Pval} = <strong>FA ${fa}</strong>
      ${heroRoll.critical ? ' ⭐' : ''}${heroRoll.fumble ? ' 💥' : ''}<br>
      Oposição: 2D6 [${enemyRoll.diceStr}] + R${enemyR} = <strong>FD ${fd}</strong><br>
      ${esc(detail)}
    </div>
    <div style="font-weight:700; color:${sucesso ? 'var(--success)' : 'var(--accent2)'}; margin-bottom:8px;">
      ${sucesso ? '✅ VITÓRIA!' : '❌ DERROTA'}
    </div>
  `;
  if (sucesso) {
    const rew = aplicarRecompensaMissao(hero, missao, true);
    html += `<div style="font-size:0.85rem; color:var(--muted);">Recompensas: ${rew.msg}</div>`;
  }
  mostrarResultadoMissao(html, sucesso);
  resolverMissaoNpc(sucesso, true);
}


function resolverMissaoNpc(sucesso, silent) {
  if (!npcMissionContext) {
    alert('Nenhuma missão ativa.');
    return;
  }
  if (npcMissionContext.resolved) {
    if (!silent) alert('Esta missão já foi resolvida.');
    return;
  }
  const { npcId, missao } = npcMissionContext;
  const list = getNpcs();
  const idx = list.findIndex(x => x.id === npcId);
  if (idx < 0) return;
  const n = list[idx];
  n.missoesFeitas = (n.missoesFeitas || 0) + 1;
  let delta = 0;
  if (sucesso) {
    n.missoesOk = (n.missoesOk || 0) + 1;
    delta = missao.afetoOk;
    n.afeto = Math.min(100, (n.afeto || 0) + delta);
  } else {
    n.missoesFail = (n.missoesFail || 0) + 1;
    delta = -missao.afetoFail;
    n.afeto = Math.max(0, (n.afeto || 0) + delta);
  }
  list[idx] = n;
  setNpcs(list);
  npcMissionContext.resolved = true;
  // Remove da lista de missões ativas
  if (npcMissionContext.missionUid) {
    removeActiveNpcMission(npcMissionContext.missionUid);
  } else {
    // fallback: remove por npcId + título
    setActiveNpcMissions(getActiveNpcMissions().filter(m =>
      !(m.npcId === npcId && m.missao && m.missao.titulo === missao.titulo && !m.resolved)
    ));
    renderActiveNpcMissions();
  }

  // Reputação pública da facção ligada à missão
  try {
    if (typeof applyMissionReputation === 'function') {
      applyMissionReputation(missao, sucesso);
    }
  } catch (e) {}

  // Solo: falha de missão pode avançar um relógio de ameaça ativo
  try {
    if (!sucesso && typeof tickRandomOracleClock === 'function') {
      const clockName = tickRandomOracleClock('falha_missao_npc');
      if (clockName) {
        try {
          if (typeof appendToCampaignLog === 'function') {
            appendToCampaignLog({
              type: 'relogio',
              title: '⏳ +1 relógio (falha de missão)',
              text: 'Missão “' + (missao.titulo || '') + '” falhou → avançou “' + clockName + '”.',
              time: new Date().toLocaleString('pt-BR')
            });
          }
        } catch (e2) {}
      }
    }
  } catch (e) {}

  // Consequência de falha persistente (cicatriz / rival / rumor / dívida)
  try {
    if (!sucesso && typeof aplicarConsequenciaFalhaSolo === 'function') {
      const hero = typeof getNpcHeroSelecionado === 'function' ? getNpcHeroSelecionado() : null;
      aplicarConsequenciaFalhaSolo({
        fonte: 'missao_npc',
        label: missao.titulo || 'Missão de NPC',
        heroIds: hero && hero.id ? [hero.id] : []
      });
    }
  } catch (e) {}

  // Diário da campanha
  try {
    if (typeof appendToCampaignLog === 'function') {
      appendToCampaignLog({
        type: 'npc_missao',
        title: `Missão de ${n.nome}: ${missao.titulo}`,
        text: sucesso
          ? `Sucesso. Afeto +${missao.afetoOk} → ${n.afeto}/100. Recompensas aplicadas ao herói.`
          : `Falha. Afeto −${missao.afetoFail} → ${n.afeto}/100.`,
        time: new Date().toLocaleString('pt-BR')
      });
    }
  } catch (e) {}

  renderNpcList();
  openNpcDetail(npcId);

  if (!silent) {
    const a = afetoLabel(n.afeto);
    const hero = getNpcHeroSelecionado();
    let extra = '';
    if (sucesso && hero) {
      // recompensas já foram aplicadas no teste/combate; no manual ainda aplicamos
      const rew = aplicarRecompensaMissao(hero, missao, true);
      extra = `\nRecompensas: ${rew.msg}`;
    }
    alert((sucesso ? '✅ Missão cumprida!' : '❌ Missão falhou.') +
      `\nAfeto de ${n.nome}: ${delta >= 0 ? '+' : ''}${delta} → ${n.afeto}/100 (${a.text})${extra}`);
    fecharPainelMissaoNpc();
  } else {
    // No fluxo automático, só atualiza o detalhe; o resultado já está visível no painel
    const a = afetoLabel(n.afeto);
    const resEl = document.getElementById('npcMissionResult');
    if (resEl && !resEl.classList.contains('hidden')) {
      resEl.innerHTML += `<div style="margin-top:8px; font-size:0.85rem;">Afeto de ${esc(n.nome)}: ${delta >= 0 ? '+' : ''}${delta} → <strong>${n.afeto}/100</strong> (${a.text})</div>`;
    }
  }
}

function recrutarNpc(id) {
  const list = getNpcs();
  const idx = list.findIndex(x => x.id === id);
  if (idx < 0) return;
  const n = list[idx];
  if (n.afeto < 100) {
    alert('Afeto insuficiente. Precisa de 100 para recrutar.');
    return;
  }
  if (n.recrutado) {
    alert('Este NPC já foi recrutado.');
    return;
  }
  if (!confirm(`Recrutar ${n.nome} como personagem jogável?\nSerá criada uma ficha no Criador de Personagens.`)) return;

  const res = typeof calcResources === 'function'
    ? calcResources(n.P, n.H, n.R, n.vantagens || [], null)
    : { pa: n.P, pm: Math.max(1, n.H * 5), pv: Math.max(1, n.R * 5) };

  const char = {
    id: 'pc_from_' + n.id,
    nome: n.nome,
    conceito: `${n.classe} · ${n.sexoLabel} · ${n.idade} (ex-NPC)`,
    biografia: `Antigo NPC recrutado por afeto máximo. ${n.classeDesc || ''}`,
    maxPoints: 10,
    levelLabel: 'Iniciante',
    escala: 'Ningen',
    arquetipoId: '',
    arquetipoNome: 'Humano',
    arquetipoBonus: '',
    arquetipoDesv: '',
    P: n.P, H: n.H, R: n.R, XP: 0,
    pericias: [],
    vantagens: [...(n.vantagens || [])],
    desvantagens: [],
    stackCounts: { '+Vida': 0, '+Mana': 0, '+Ação': 0 },
    paMax: res.pa, pmMax: res.pm, pvMax: res.pv,
    pvAtual: res.pv,
    tipoDanoPadrao: 'Pancada',
    fraquezaDetail: { tipo: '', comum: false },
    pontoFracoDetail: '',
    tecnicas: [],
    artefatos: [],
    inventario: [],
    ouro: 20,
    status: 'normal',
    mantimentos: 5,
    image: null,
    fromNpcId: n.id,
    savedAt: new Date().toLocaleString('pt-BR')
  };

  const chars = typeof getSaved === 'function' ? getSaved() : [];
  chars.push(char);
  if (typeof setSaved === 'function') setSaved(chars);

  n.recrutado = true;
  list[idx] = n;
  setNpcs(list);
  renderNpcList();
  openNpcDetail(id);
  alert(`🛡️ ${n.nome} entrou no grupo!\nFicha criada em Personagens Salvos.\nVocê pode editá-la no Criador de Personagens.`);
}

function proporRomanceNpc(id) {
  const list = getNpcs();
  const idx = list.findIndex(x => x.id === id);
  if (idx < 0) return;
  const n = list[idx];
  if (n.afeto < 100) {
    alert('Afeto insuficiente para compromisso.');
    return;
  }
  if (n.idadeId === 'crianca') {
    alert('Não é possível propor compromisso com este NPC.');
    return;
  }
  const heroSel = document.getElementById('npcHeroSelect');
  const heroId = heroSel ? heroSel.value : '';
  const hero = (typeof getSaved === 'function' ? getSaved() : []).find(c => c.id === heroId);
  const heroName = hero ? hero.nome : 'seu herói';

  if (!confirm(`${n.nome} propõe um compromisso amoroso com ${heroName}.\nAceitar?`)) {
    alert(`${n.nome} respeita a recusa. O afeto permanece alto.`);
    return;
  }
  n.romance = true;
  n.romanceCom = heroId || null;
  n.romanceComNome = heroName;
  list[idx] = n;
  setNpcs(list);
  renderNpcList();
  openNpcDetail(id);
  alert(`💕 Compromisso aceito entre ${n.nome} e ${heroName}!\nO vínculo está registrado neste gerenciador.`);
}

function excluirNpc(id) {
  if (!confirm('Excluir este NPC permanentemente?')) return;
  setNpcs(getNpcs().filter(x => x.id !== id));
  closeNpcDetail();
  renderNpcList();
}


/* ===== [HUMOR_APARENCIA] linhas originais 14050-14849 ===== */
/* ==================== HUMOR POR APARÊNCIA (convívio) ====================
 * Conviver por ao menos 2 etapas do dia (Manhã / Tarde / Noite / Madrugada)
 * com alguém cuja Aparência ≠ Normal concede Humor (bônus ou redutor).
 * O Humor persiste por 2 etapas em quem recebeu o convívio.
 * Fontes de convívio: grupo selecionado, NPCs recrutados/romance, servos.
 */
function _aplicarHumorDeFonte(receptor, fonteNome, fonteAparencia, avisos) {
  const ap = aparenciaBonus(fonteAparencia);
  if (ap.mod === 0) return; // Normal não gera humor
  receptor.statusEffects = (receptor.statusEffects || []).filter(s => s.id !== 'humor_aparencia');
  receptor.statusEffects.push({
    id: 'humor_aparencia',
    nome: `Humor (convívio com ${fonteNome})`,
    bonus: `${ap.mod >= 0 ? '+' : ''}${ap.mod} de humor`,
    mod: ap.mod,
    periodosRestantes: 2
  });
  avisos.push(`${ap.mod > 0 ? '😊' : '😖'} ${receptor.nome}: humor ${ap.mod >= 0 ? '+' : ''}${ap.mod} por conviver com ${fonteNome} (${ap.label}). Dura 2 etapas.`);
}

function processarConvivioAparencia() {
  const party = typeof getSelectedPartyChars === 'function' ? getSelectedPartyChars() : [];
  let list = getSaved();
  const avisos = [];

  // 1) Convívio entre membros do grupo
  if (party && party.length >= 2) {
    for (let i = 0; i < party.length; i++) {
      for (let j = i + 1; j < party.length; j++) {
        const aIdx = list.findIndex(c => c.id === party[i].id);
        const bIdx = list.findIndex(c => c.id === party[j].id);
        if (aIdx < 0 || bIdx < 0) continue;
        const a = normalizeCharacter(list[aIdx]);
        const b = normalizeCharacter(list[bIdx]);
        a._convivio = a._convivio || {};
        b._convivio = b._convivio || {};
        a._convivio[b.id] = (a._convivio[b.id] || 0) + 1;
        b._convivio[a.id] = (b._convivio[a.id] || 0) + 1;
        if (a._convivio[b.id] >= 2) {
          _aplicarHumorDeFonte(a, b.nome, b.aparencia, avisos);
          a._convivio[b.id] = 0;
        }
        if (b._convivio[a.id] >= 2) {
          _aplicarHumorDeFonte(b, a.nome, a.aparencia, avisos);
          b._convivio[a.id] = 0;
        }
        list[aIdx] = a;
        list[bIdx] = b;
      }
    }
  }

  // 2) Convívio do grupo com NPCs próximos (recrutados, romance ou afeto ≥ 60)
  try {
    const npcs = typeof getNpcs === 'function' ? getNpcs() : [];
    const proximos = npcs.filter(n => n && (n.recrutado || n.romance || (n.afeto || 0) >= 60));
    if (party && party.length && proximos.length) {
      party.forEach(p => {
        const idx = list.findIndex(c => c.id === p.id);
        if (idx < 0) return;
        const hero = normalizeCharacter(list[idx]);
        hero._convivio = hero._convivio || {};
        proximos.forEach(n => {
          const key = 'npc_' + n.id;
          hero._convivio[key] = (hero._convivio[key] || 0) + 1;
          if (hero._convivio[key] >= 2) {
            _aplicarHumorDeFonte(hero, n.nome, n.aparencia != null ? n.aparencia : 5, avisos);
            hero._convivio[key] = 0;
          }
        });
        list[idx] = hero;
      });
    }
  } catch (e) {}

  // 3) Convívio com servos sob contrato
  try {
    if (party && party.length && typeof getServosOfOwner === 'function') {
      party.forEach(p => {
        const servos = getServosOfOwner(p.id) || [];
        if (!servos.length) return;
        const idx = list.findIndex(c => c.id === p.id);
        if (idx < 0) return;
        const hero = normalizeCharacter(list[idx]);
        hero._convivio = hero._convivio || {};
        servos.forEach(s => {
          const key = 'servo_' + s.id;
          hero._convivio[key] = (hero._convivio[key] || 0) + 1;
          if (hero._convivio[key] >= 2) {
            _aplicarHumorDeFonte(hero, s.nome, s.aparencia != null ? s.aparencia : 5, avisos);
            hero._convivio[key] = 0;
          }
        });
        list[idx] = hero;
      });
    }
  } catch (e) {}

  setSaved(list);
  return avisos;
}

/** Reduz 1 etapa da duração do efeito de Humor de todos os personagens salvos; remove ao zerar. */
function decrementarHumorPorEtapa() {
  let list = getSaved();
  let changed = false;
  list.forEach((raw, i) => {
    if (!raw || !Array.isArray(raw.statusEffects) || !raw.statusEffects.length) return;
    let localChange = false;
    ['humor_aparencia', 'cicatriz_falha'].forEach(idFx => {
      const h = raw.statusEffects.find(s => s.id === idFx);
      if (!h) return;
      h.periodosRestantes = (h.periodosRestantes != null ? h.periodosRestantes : 2) - 1;
      if (h.periodosRestantes <= 0) {
        raw.statusEffects = raw.statusEffects.filter(s => s.id !== idFx);
      }
      localChange = true;
    });
    if (localChange) {
      list[i] = raw;
      changed = true;
    }
  });
  if (changed) setSaved(list);
}

/** Chamado a cada etapa do dia que avança (independente de virar dia novo). */
function processarEtapaAparencia() {
  try { decrementarHumorPorEtapa(); } catch (e) {}
  try {
    const avisos = processarConvivioAparencia();
    return avisos;
  } catch (e) { return []; }
}

/** Níveis de Afeto e efeitos narrativos */
function afetoServoLabel(n) {
  n = Math.max(0, Math.min(100, Number(n) || 0));
  if (n <= 19) return { text: 'Ódio / Resignação', color: '#f87171', cls: 'status-morto', range: '0–19' };
  if (n <= 39) return { text: 'Indiferença', color: '#fb923c', cls: 'status-faminto', range: '20–39' };
  if (n <= 59) return { text: 'Neutro', color: '#94a3b8', cls: 'status-dormindo', range: '40–59' };
  if (n <= 79) return { text: 'Afeição', color: '#38bdf8', cls: 'status-paralisado', range: '60–79' };
  if (n <= 94) return { text: 'Devoção', color: '#a855f7', cls: 'status-abencoado', range: '80–94' };
  return { text: 'Adoração', color: '#fbbf24', cls: 'status-abencoado', range: '95–100' };
}

/**
 * Preço de mercado do servo.
 * Base 100 + Aparência×20 + (P+H+R)×10 + perícias×5 − Afeto×0.5
 * × multiplicador do tipo.
 */
function calcServoPreco(s) {
  if (!s) return 0;
  const apar = Number(s.aparencia) || 5;
  const attrs = (Number(s.P) || 0) + (Number(s.H) || 0) + (Number(s.R) || 0);
  const per = Array.isArray(s.pericias) ? s.pericias.length : 0;
  const afeto = Number(s.afeto) || 0;
  let base = 100 + (apar * 20) + (attrs * 10) + (per * 5) - (afeto * 0.5);
  const tipo = SERVO_TIPOS[s.tipo] || SERVO_TIPOS.empregado;
  base = Math.round(base * (tipo.mult || 1));
  return Math.max(20, base);
}

function getServos() {
  try {
    const arr = storeGetJSON(KEYS.servos, []);
    return Array.isArray(arr) ? arr : [];
  } catch (e) { return []; }
}

function setServos(list) {
  storeSet(KEYS.servos, Array.isArray(list) ? list : []);
}

function getServoById(id) {
  return getServos().find(s => s.id === id) || null;
}

function getServosOfOwner(ownerId) {
  if (!ownerId) return [];
  return getServos().filter(s => s.ownerId === ownerId && s.contratoAtivo !== false);
}

function getServosMercado() {
  return getServos().filter(s => !s.ownerId && s.contratoAtivo !== false);
}

let _servoEditState = { P: 1, H: 1, R: 1, aparencia: 5 };
let _servoLog = []; // sessão

function pushServoLog(msg) {
  const ts = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  _servoLog.unshift({ ts, msg });
  if (_servoLog.length > 50) _servoLog.pop();
  renderServoLog();
}

function renderServoLog() {
  const el = document.getElementById('servoLogBox');
  if (!el) return;
  if (!_servoLog.length) {
    el.innerHTML = '<p style="color:var(--muted); text-align:center;">Nenhum evento registrado nesta sessão.</p>';
    return;
  }
  el.innerHTML = _servoLog.map(e =>
    `<div style="border-bottom:1px solid rgba(255,255,255,0.06); padding:6px 0;"><span style="color:var(--muted); font-size:0.75rem;">${e.ts}</span> ${e.msg}</div>`
  ).join('');
}

function clearServoLog() {
  if (!confirm('Limpar log de servos desta sessão?')) return;
  _servoLog = [];
  renderServoLog();
}

function initServosScreen() {
  populateServoOwnerSelect();
  renderServoOwnedList();
  renderServoMercado();
  renderServoLog();
  closeServoDetail();
  closeServoEditor();
  try { renderCapturadosList(); } catch (e) {}
}

function populateServoOwnerSelect() {
  const sel = document.getElementById('servoOwnerSelect');
  if (!sel) return;
  const list = typeof getSaved === 'function' ? getSaved() : [];
  const current = sel.value;
  sel.innerHTML = '<option value="">— Selecione o dono —</option>' +
    list.filter(c => !c.isTemp).map(c =>
      `<option value="${c.id}">${esc(c.nome)} (${c.ouro || 0} Tibar)</option>`
    ).join('');
  if (current) sel.value = current;
  onServoOwnerChange();
}

function onServoOwnerChange() {
  const sel = document.getElementById('servoOwnerSelect');
  const ouroEl = document.getElementById('servoOwnerOuro');
  if (!sel || !ouroEl) return;
  const hero = (typeof getSaved === 'function' ? getSaved() : []).find(c => c.id === sel.value);
  ouroEl.textContent = hero ? `Ouro de ${hero.nome}: ${hero.ouro || 0} Tibar` : 'Ouro: — (selecione um herói)';
  renderServoOwnedList();
}

function getSelectedServoOwner() {
  const sel = document.getElementById('servoOwnerSelect');
  if (!sel || !sel.value) return null;
  return (typeof getSaved === 'function' ? getSaved() : []).find(c => c.id === sel.value) || null;
}

function changeServoAttr(key, delta) {
  if (key === 'aparencia') {
    _servoEditState.aparencia = Math.max(1, Math.min(10, (_servoEditState.aparencia || 5) + delta));
    document.getElementById('servoValApar').textContent = _servoEditState.aparencia;
    const b = aparenciaBonus(_servoEditState.aparencia);
    document.getElementById('servoAparLabel').textContent = b.label;
  } else {
    _servoEditState[key] = Math.max(0, Math.min(10, (_servoEditState[key] || 0) + delta));
    document.getElementById('servoVal' + key).textContent = _servoEditState[key];
  }
  // Formoso força aparência mínima 7
  const tipo = document.getElementById('servoTipo')?.value;
  if (tipo === 'formoso' && _servoEditState.aparencia < 7) {
    _servoEditState.aparencia = 7;
    document.getElementById('servoValApar').textContent = 7;
    document.getElementById('servoAparLabel').textContent = aparenciaBonus(7).label;
  }
}

function onServoTipoChange() {
  const tipo = document.getElementById('servoTipo')?.value;
  const box = document.getElementById('servoTipoBonusBox');
  if (box) box.textContent = (SERVO_TIPOS[tipo] || {}).desc || '';
  if (tipo === 'formoso' && _servoEditState.aparencia < 7) {
    _servoEditState.aparencia = 7;
    const el = document.getElementById('servoValApar');
    if (el) el.textContent = 7;
    const lab = document.getElementById('servoAparLabel');
    if (lab) lab.textContent = aparenciaBonus(7).label;
  }
}

function openServoEditor(existingId) {
  const panel = document.getElementById('servoEditorPanel');
  if (!panel) return;
  const s = existingId ? getServoById(existingId) : null;
  document.getElementById('servoEditId').value = s ? s.id : '';
  document.getElementById('servoNome').value = s ? s.nome : '';
  document.getElementById('servoSexo').value = s ? (s.sexo || 'F') : 'F';
  document.getElementById('servoTipo').value = s ? (s.tipo || 'empregado') : 'empregado';
  document.getElementById('servoMotivo').value = s ? (s.motivo || 'divida') : 'divida';
  _servoEditState = {
    P: s ? (s.P || 1) : 1,
    H: s ? (s.H || 1) : 1,
    R: s ? (s.R || 1) : 1,
    aparencia: s ? (s.aparencia || 5) : 5
  };
  document.getElementById('servoValP').textContent = _servoEditState.P;
  document.getElementById('servoValH').textContent = _servoEditState.H;
  document.getElementById('servoValR').textContent = _servoEditState.R;
  document.getElementById('servoValApar').textContent = _servoEditState.aparencia;
  document.getElementById('servoAparLabel').textContent = aparenciaBonus(_servoEditState.aparencia).label;
  document.getElementById('servoAfeto').value = s ? String(s.afeto ?? 10) : '10';
  document.getElementById('servoPericias').value = s && Array.isArray(s.pericias) ? s.pericias.join(', ') : '';
  document.getElementById('servoClausulaPrazo').checked = !!(s && s.clausulas && s.clausulas.prazo);
  document.getElementById('servoClausulaResgate').checked = !!(s && s.clausulas && s.clausulas.resgate);
  document.getElementById('servoClausulaHeranca').checked = !!(s && s.clausulas && s.clausulas.heranca);
  document.getElementById('servoClausulaSemManu').checked = !!(s && s.clausulas && s.clausulas.semManumissao);
  document.getElementById('servoNotas').value = s ? (s.notas || '') : '';
  onServoTipoChange();
  panel.classList.remove('hidden');
  panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function closeServoEditor() {
  const panel = document.getElementById('servoEditorPanel');
  if (panel) panel.classList.add('hidden');
}

function saveServoFromEditor() {
  const nome = (document.getElementById('servoNome').value || '').trim();
  if (!nome) { alert('Informe o nome do servo.'); return; }
  const editId = document.getElementById('servoEditId').value;
  const tipo = document.getElementById('servoTipo').value || 'empregado';
  let apar = _servoEditState.aparencia || 5;
  if (tipo === 'formoso' && apar < 7) apar = 7;
  const perStr = document.getElementById('servoPericias').value || '';
  const pericias = perStr.split(',').map(x => x.trim()).filter(Boolean);
  // Empregado: garante até 2 perícias com bônus implícito (apenas lista)
  const afeto = Math.max(0, Math.min(100, parseInt(document.getElementById('servoAfeto').value, 10) || 10));
  const owner = getSelectedServoOwner();

  const payload = {
    id: editId || ('servo_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5)),
    nome,
    sexo: document.getElementById('servoSexo').value || 'F',
    sexoLabel: (document.getElementById('servoSexo').value === 'M') ? 'Homem' : 'Mulher',
    tipo,
    motivo: document.getElementById('servoMotivo').value || 'divida',
    P: _servoEditState.P || 0,
    H: _servoEditState.H || 0,
    R: _servoEditState.R || 0,
    aparencia: apar,
    afeto,
    pericias,
    clausulas: {
      prazo: document.getElementById('servoClausulaPrazo').checked,
      resgate: document.getElementById('servoClausulaResgate').checked,
      heranca: document.getElementById('servoClausulaHeranca').checked,
      semManumissao: document.getElementById('servoClausulaSemManu').checked
    },
    notas: (document.getElementById('servoNotas').value || '').trim(),
    contratoAtivo: true,
    ownerId: editId ? (getServoById(editId)?.ownerId || null) : null,
    // se novo e há dono selecionado, não auto-atribui — fica no mercado a menos que já tivesse dono
    criadoEm: editId ? (getServoById(editId)?.criadoEm || new Date().toISOString()) : new Date().toISOString(),
    historicoAfeto: editId ? (getServoById(editId)?.historicoAfeto || []) : [],
    XP: editId ? (getServoById(editId)?.XP || 0) : 0,
    maxPoints: editId ? (getServoById(editId)?.maxPoints || 0) : 0,
    pontosLivres: editId ? (getServoById(editId)?.pontosLivres || 0) : 0,
    luxo: editId ? !!(getServoById(editId)?.luxo) : false
  };

  // Bônus de tipo combate: se não definido, aplica +2 no maior entre P e H
  if (tipo === 'combate' && !editId) {
    if (payload.P >= payload.H) payload.P = Math.min(10, payload.P + 2);
    else payload.H = Math.min(10, payload.H + 2);
  }

  const list = getServos();
  const idx = list.findIndex(x => x.id === payload.id);
  if (idx >= 0) list[idx] = { ...list[idx], ...payload };
  else list.unshift(payload);
  setServos(list);
  pushServoLog(`Servo <strong>${esc(payload.nome)}</strong> ${editId ? 'atualizado' : 'criado'} (tipo ${SERVO_TIPOS[tipo]?.label || tipo}).`);
  closeServoEditor();
  renderServoOwnedList();
  renderServoMercado();
  alert(editId ? 'Servo atualizado!' : 'Servo criado e disponível no mercado (ou mantenha o dono se já tinha).');
}

function gerarServoMercado() {
  const sexo = Math.random() < 0.35 ? 'M' : 'F';
  const tipoKeys = Object.keys(SERVO_TIPOS);
  const tipo = tipoKeys[Math.floor(Math.random() * tipoKeys.length)];
  const nome = (sexo === 'M' ? SERVO_NOMES_M : SERVO_NOMES_F)[Math.floor(Math.random() * (sexo === 'M' ? SERVO_NOMES_M.length : SERVO_NOMES_F.length))];
  const sob = SERVO_SOBRENOMES[Math.floor(Math.random() * SERVO_SOBRENOMES.length)];
  let P = 1 + Math.floor(Math.random() * 3);
  let H = 1 + Math.floor(Math.random() * 3);
  let R = 1 + Math.floor(Math.random() * 3);
  let apar = 3 + Math.floor(Math.random() * 5); // 3–7
  if (tipo === 'formoso') apar = 7 + Math.floor(Math.random() * 4); // 7–10
  if (tipo === 'combate') {
    if (Math.random() < 0.5) P = Math.min(10, P + 2);
    else H = Math.min(10, H + 2);
  }
  let pericias = [];
  if (tipo === 'empregado') {
    const shuffled = [...SERVO_PERICIAS_POOL].sort(() => Math.random() - 0.5);
    pericias = shuffled.slice(0, 2);
  } else if (Math.random() < 0.4) {
    pericias = [SERVO_PERICIAS_POOL[Math.floor(Math.random() * SERVO_PERICIAS_POOL.length)]];
  }
  const motivoKeys = Object.keys(SERVO_MOTIVOS);
  const motivo = motivoKeys[Math.floor(Math.random() * motivoKeys.length)];
  const afeto = 5 + Math.floor(Math.random() * 16); // 5–20 baixo

  const s = {
    id: 'servo_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
    nome: nome + ' ' + sob,
    sexo,
    sexoLabel: sexo === 'M' ? 'Homem' : 'Mulher',
    tipo,
    motivo,
    P, H, R,
    aparencia: apar,
    afeto,
    pericias,
    clausulas: {
      prazo: Math.random() < 0.2,
      resgate: Math.random() < 0.3,
      heranca: Math.random() < 0.15,
      semManumissao: Math.random() < 0.1
    },
    notas: 'Gerado no mercado de servos contratuais.',
    contratoAtivo: true,
    ownerId: null,
    criadoEm: new Date().toISOString(),
    historicoAfeto: [],
    XP: 0,
    maxPoints: 0,
    pontosLivres: 0,
    luxo: false
  };
  const list = getServos();
  list.unshift(s);
  setServos(list);
  pushServoLog(`Mercado: gerado <strong>${esc(s.nome)}</strong> (${SERVO_TIPOS[tipo].label}, ${calcServoPreco(s)} Tibar).`);
  renderServoMercado();
  openServoDetail(s.id);
}

function renderServoOwnedList() {
  const container = document.getElementById('servoOwnedList');
  const badge = document.getElementById('servoOwnedCount');
  if (!container) return;
  const owner = getSelectedServoOwner();
  const list = owner ? getServosOfOwner(owner.id) : [];
  if (badge) badge.textContent = String(list.length);
  if (!owner) {
    container.innerHTML = '<p style="color:var(--muted); text-align:center; padding:12px;">Selecione um herói acima.</p>';
    return;
  }
  if (!list.length) {
    container.innerHTML = '<p style="color:var(--muted); text-align:center; padding:12px;">Nenhum servo vinculado a este herói.</p>';
    return;
  }
  container.innerHTML = list.map(s => {
    const a = afetoServoLabel(s.afeto);
    const tipo = SERVO_TIPOS[s.tipo] || {};
    return `
      <div class="char-card" onclick="openServoDetail('${s.id}')" style="cursor:pointer;">
        <div>
          <div style="font-weight:800; font-size:1.05rem;">${esc(s.nome)}</div>
          <div style="font-size:0.85rem; color:var(--muted);">${s.sexoLabel} · ${tipo.label || s.tipo}${s.luxo ? ' · 💎 Luxo' : ''} · P${s.P} H${s.H} R${s.R} · Apar ${s.aparencia}/10 · XP ${s.XP || 0}</div>
          <div style="margin-top:6px;">
            <span class="status-badge ${a.cls}" style="font-size:0.75rem;">Afeto ${s.afeto}/100 — ${a.text}</span>
            ${s.contratoAtivo === false ? '<span class="tag" style="border-color:var(--muted);color:var(--muted)">Contrato encerrado</span>' : '<span class="tag" style="border-color:#fbbf24;color:#fbbf24">Contrato ativo</span>'}
          </div>
        </div>
        <button class="btn btn-sm btn-outline" onclick="event.stopPropagation(); openServoDetail('${s.id}')">Ver</button>
      </div>`;
  }).join('');
}

function renderServoMercado() {
  const container = document.getElementById('servoMercadoList');
  if (!container) return;
  const list = getServosMercado();
  if (!list.length) {
    container.innerHTML = '<p style="color:var(--muted); text-align:center; padding:12px;">Mercado vazio. Gere um servo ou libere algum.</p>';
    return;
  }
  container.innerHTML = list.map(s => {
    const preco = calcServoPreco(s);
    const tipo = SERVO_TIPOS[s.tipo] || {};
    const a = aparenciaBonus(s.aparencia);
    return `
      <div class="char-card" style="cursor:default;">
        <div>
          <div style="font-weight:800;">${esc(s.nome)}</div>
          <div style="font-size:0.85rem; color:var(--muted);">${s.sexoLabel} · ${tipo.label || s.tipo} · P${s.P} H${s.H} R${s.R}</div>
          <div style="font-size:0.8rem; color:var(--muted);">Aparência ${s.aparencia}/10 (${a.label}) · Afeto ${s.afeto}/100</div>
          <div style="font-weight:800; color:#fbbf24; margin-top:4px;">${preco} Tibar</div>
        </div>
        <div style="display:flex; flex-direction:column; gap:6px;">
          <button class="btn btn-sm btn-success" onclick="comprarServo('${s.id}')">Comprar</button>
          <button class="btn btn-sm btn-outline" onclick="openServoDetail('${s.id}')">Detalhe</button>
        </div>
      </div>`;
  }).join('');
}

function openServoDetail(id) {
  const s = getServoById(id);
  if (!s) return;
  const panel = document.getElementById('servoDetailPanel');
  const body = document.getElementById('servoDetailBody');
  const actions = document.getElementById('servoDetailActions');
  const title = document.getElementById('servoDetailTitle');
  if (!panel || !body) return;

  const a = afetoServoLabel(s.afeto);
  const ap = aparenciaBonus(s.aparencia);
  const tipo = SERVO_TIPOS[s.tipo] || {};
  const preco = calcServoPreco(s);
  const barPct = Math.min(100, Math.max(0, s.afeto));
  const owner = s.ownerId ? ((typeof getSaved === 'function' ? getSaved() : []).find(c => c.id === s.ownerId)) : null;

  title.textContent = s.nome;
  body.innerHTML = `
    <div style="text-align:center; margin-bottom:12px;">
      <div style="font-size:0.9rem; color:var(--muted);">${s.sexoLabel} · <strong style="color:#fbbf24">${tipo.label || s.tipo}</strong></div>
      <div style="font-size:0.85rem; color:var(--muted); margin-top:4px;">${tipo.desc || ''}</div>
      <div style="margin-top:8px;">
        ${s.contratoAtivo !== false
          ? '<span class="status-badge status-abencoado">Contrato ativo</span>'
          : '<span class="status-badge status-morto">Contrato encerrado</span>'}
      </div>
    </div>
    <div class="attr-display">
      <div class="attr-box"><div class="letter">PODER</div><div class="num">${s.P}</div></div>
      <div class="attr-box"><div class="letter">HABILIDADE</div><div class="num">${s.H}</div></div>
      <div class="attr-box"><div class="letter">RESISTÊNCIA</div><div class="num">${s.R}</div></div>
      <div class="attr-box"><div class="letter">APARÊNCIA</div><div class="num">${s.aparencia}</div></div>
    </div>
    <div style="text-align:center; font-size:0.85rem; color:var(--muted); margin-bottom:10px;">Aparência: ${ap.label} · Preço ref.: ${preco} Tibar</div>
    <div class="section-title">Afeto (obediência emocional)</div>
    <div style="background:var(--bg-input); border:1px solid var(--border); border-radius:10px; padding:12px;">
      <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
        <span class="status-badge ${a.cls}">${a.text}</span>
        <strong style="color:${a.color}">${s.afeto} / 100</strong>
      </div>
      <div class="bar-bg" style="height:12px;"><div class="bar-fill" style="width:${barPct}%; background:linear-gradient(90deg,#f87171,#fbbf24,#a855f7);"></div></div>
      <div style="font-size:0.78rem; color:var(--muted); margin-top:8px;">
        0–19 Ódio · 20–39 Indiferença · 40–59 Neutro · 60–79 Afeição · 80–94 Devoção · 95–100 Adoração
      </div>
    </div>
    <div class="section-title">Motivo do contrato</div>
    <div class="list-section">${esc(SERVO_MOTIVOS[s.motivo] || s.motivo || '—')}</div>
    <div class="section-title">Perícias</div>
    <div class="list-section">${(s.pericias || []).map(p => esc(p)).join(', ') || '—'}</div>
    <div class="section-title">Cláusulas</div>
    <div class="list-section">${
      s.clausulas ? [
        s.clausulas.prazo ? 'Prazo limitado' : null,
        s.clausulas.resgate ? 'Resgate progressivo' : null,
        s.clausulas.heranca ? 'Herança' : null,
        s.clausulas.semManumissao ? 'Sem manumissão voluntária' : null
      ].filter(Boolean).join(' · ') || 'Nenhuma cláusula especial'
      : '—'
    }</div>
    <div class="section-title">Dono atual</div>
    <div class="list-section">${owner ? esc(owner.nome) : (s.ownerId ? s.ownerId : '— no mercado —')}</div>
    <div class="section-title">Notas</div>
    <div class="list-section" style="white-space:pre-wrap">${esc(s.notas || '—')}</div>
    <div class="section-title">⭐ XP e Evolução</div>
    <div class="list-section">
      XP: <strong>${s.XP || 0} / 10</strong>
      · Pontos livres: <strong style="color:var(--accent)">${s.pontosLivres || 0}</strong>
      · Evoluções totais: ${s.maxPoints || 0}
      ${s.luxo ? ' · <span style="color:#f472b6">Escrava de luxo</span>' : ''}
      <div style="font-size:0.78rem; color:var(--muted); margin-top:4px;">A cada 10 XP o servo ganha +1 ponto livre (P, H, R ou Aparência, máx. 10).</div>
    </div>
  `;

  const isOwned = !!s.ownerId && s.contratoAtivo !== false;
  const isMarket = !s.ownerId && s.contratoAtivo !== false;
  let acts = `
    <button class="btn btn-outline" onclick="openServoEditor('${s.id}')">✏️ Editar</button>
  `;
  if (isOwned) {
    acts += `
      <button class="btn" onclick="ajustarAfetoServo('${s.id}', 3)">+3 Afeto (ordem desejada)</button>
      <button class="btn btn-outline" onclick="ajustarAfetoServo('${s.id}', 5)">+5 Bondade/presente</button>
      <button class="btn btn-outline" onclick="ajustarAfetoServo('${s.id}', -2)">−2 Ordem contrária</button>
      <button class="btn btn-outline" onclick="ajustarAfetoServo('${s.id}', -5)">−5 Humilhação</button>
      <button class="btn btn-danger" onclick="ajustarAfetoServo('${s.id}', -15)">−15 Dano físico</button>
      <button class="btn" style="background:linear-gradient(135deg,#10b981,#059669);color:#fff;" onclick="protegerServo('${s.id}')">🛡️ Proteger vida (+10–20)</button>
      <button class="btn btn-magic" onclick="ordenarTarefaServo('${s.id}')">📋 Ordenar tarefa</button>
      <button class="btn btn-outline" onclick="venderServoMercado('${s.id}')">💰 Vender no mercado</button>
      <button class="btn btn-success" onclick="manumitirServo('${s.id}')">🕊️ Manumissão / Liberar</button>
      <button class="btn btn-sm" style="width:auto; background:#7c3aed;color:#fff;" onclick="addServoXP('${s.id}',5,'Treino manual'); openServoDetail('${s.id}');">⭐ +5 XP</button>
      <button class="btn btn-sm btn-outline" style="width:auto;" onclick="gastarPontoServo('${s.id}','P')">📈 +1 P</button>
      <button class="btn btn-sm btn-outline" style="width:auto;" onclick="gastarPontoServo('${s.id}','H')">📈 +1 H</button>
      <button class="btn btn-sm btn-outline" style="width:auto;" onclick="gastarPontoServo('${s.id}','R')">📈 +1 R</button>
      <button class="btn btn-sm btn-outline" style="width:auto;" onclick="gastarPontoServo('${s.id}','aparencia')">📈 +1 Apar</button>
    `;
  }
  if (isMarket) {
    acts += `<button class="btn btn-success" onclick="comprarServo('${s.id}')">🛒 Comprar (${preco} Tibar)</button>`;
  }
  acts += `<button class="btn btn-danger" onclick="excluirServo('${s.id}')">🗑️ Excluir</button>`;
  actions.innerHTML = acts;
  panel.classList.remove('hidden');
  panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function closeServoDetail() {
  const panel = document.getElementById('servoDetailPanel');
  if (panel) panel.classList.add('hidden');
}

/**
 * Altera Afeto conforme tabela de regras.
 * Registra no histórico do servo e no log de sessão.
 */
function ajustarAfetoServo(id, delta, reason) {
  const list = getServos();
  const idx = list.findIndex(x => x.id === id);
  if (idx < 0) return;
  const s = list[idx];
  const before = s.afeto || 0;
  // Abuso extremo pode zerar
  let after = before + delta;
  if (delta <= -30) after = Math.min(after, 0);
  after = Math.max(0, Math.min(100, after));
  s.afeto = after;
  if (!Array.isArray(s.historicoAfeto)) s.historicoAfeto = [];
  s.historicoAfeto.unshift({
    time: new Date().toLocaleString('pt-BR'),
    delta,
    before,
    after,
    reason: reason || (delta >= 0 ? 'Ação positiva' : 'Ação negativa')
  });
  if (s.historicoAfeto.length > 30) s.historicoAfeto = s.historicoAfeto.slice(0, 30);
  list[idx] = s;
  setServos(list);
  const a = afetoServoLabel(after);
  pushServoLog(`Afeto de <strong>${esc(s.nome)}</strong>: ${delta >= 0 ? '+' : ''}${delta} → ${after}/100 (${a.text})`);
  renderServoOwnedList();
  openServoDetail(id);
}

function protegerServo(id) {
  const gain = 10 + Math.floor(Math.random() * 11); // 10–20
  ajustarAfetoServo(id, gain, 'Proteger a vida do servo');
}

function ordenarTarefaServo(id) {
  const s = getServoById(id);
  if (!s) return;
  const tarefas = [
    { nome: 'Tarefa doméstica rotineira', delta: 1, desc: 'Limpeza, cozinha, organização.' },
    { nome: 'Serviço especializado (ofício)', delta: 2, desc: 'Usa perícia do servo.' },
    { nome: 'Companhia social / apresentação', delta: 2, desc: 'Aparência e etiqueta importam.' },
    { nome: 'Escolta / guarda', delta: 3, desc: 'Tipo Combate se destaca.' },
    { nome: 'Tarefa humilhante (pública)', delta: -5, desc: 'Humilhação verbal/pública.' },
    { nome: 'Ordem contra princípios do servo', delta: -6, desc: 'Conflito moral interno (ainda obedece).' },
    { nome: 'Tarefa muito pessoal / íntima', delta: 0, desc: 'Afeto depende do nível atual e do tratamento.' }
  ];
  const t = tarefas[Math.floor(Math.random() * tarefas.length)];
  let delta = t.delta;
  // Ajuste por nível de afeto
  if (s.afeto >= 60 && delta < 0 && t.nome.indexOf('humilhante') < 0 && t.nome.indexOf('princípios') < 0) {
    delta = 0; // afeição: ordens que antes causariam perda não causam mais (exceto extremos)
  }
  if (t.nome.indexOf('pessoal') >= 0) {
    if (s.afeto >= 80) delta = 2;
    else if (s.afeto >= 40) delta = 1;
    else if (s.afeto < 20) delta = -3;
    else delta = -1;
    // Formoso: bônus de satisfação
    if (s.tipo === 'formoso' && delta > 0) delta += 1;
  }
  alert(`📋 Ordem: ${t.nome}\n${t.desc}\n\nEfeito de Afeto estimado: ${delta >= 0 ? '+' : ''}${delta}`);
  if (delta !== 0) ajustarAfetoServo(id, delta, 'Tarefa: ' + t.nome);
  else pushServoLog(`Ordem a <strong>${esc(s.nome)}</strong>: ${t.nome} (sem mudança de afeto).`);
  try { addServoXP(id, 1, 'Tarefa: ' + t.nome); } catch (e) {}
}

function comprarServo(id) {
  const s = getServoById(id);
  if (!s) return;
  if (s.ownerId) { alert('Este servo já tem dono.'); return; }
  const owner = getSelectedServoOwner();
  if (!owner) {
    alert('Selecione o herói comprador no topo da tela.');
    return;
  }
  const preco = calcServoPreco(s);
  if ((owner.ouro || 0) < preco) {
    alert(`${owner.nome} tem apenas ${owner.ouro || 0} Tibar. Preço: ${preco}.`);
    return;
  }
  if (!confirm(`Comprar ${s.nome} por ${preco} Tibar?\nO contrato mágico vinculante será ativado em nome de ${owner.nome}.`)) return;

  // Debita ouro
  const chars = getSaved();
  const cidx = chars.findIndex(c => c.id === owner.id);
  if (cidx < 0) return;
  chars[cidx].ouro = (chars[cidx].ouro || 0) - preco;
  setSaved(chars);

  const list = getServos();
  const idx = list.findIndex(x => x.id === id);
  list[idx].ownerId = owner.id;
  list[idx].contratoAtivo = true;
  list[idx].compradoEm = new Date().toISOString();
  list[idx].precoPago = preco;
  // Afeto inicial baixo permanece
  setServos(list);
  pushServoLog(`<strong>${esc(owner.nome)}</strong> comprou <strong>${esc(s.nome)}</strong> por ${preco} Tibar. Contrato ativo.`);
  onServoOwnerChange();
  renderServoMercado();
  openServoDetail(id);
  alert(`Contrato firmado!\n${s.nome} agora serve a ${owner.nome}.\nAfeto inicial: ${s.afeto}/100.`);
}

function venderServoMercado(id) {
  const s = getServoById(id);
  if (!s || !s.ownerId) return;
  const preco = Math.round(calcServoPreco(s) * 0.7); // revenda 70%
  const owner = (typeof getSaved === 'function' ? getSaved() : []).find(c => c.id === s.ownerId);
  if (!confirm(`Vender ${s.nome} no mercado por ~${preco} Tibar (70% do valor de referência)?`)) return;
  if (owner) {
    const chars = getSaved();
    const cidx = chars.findIndex(c => c.id === owner.id);
    if (cidx >= 0) {
      chars[cidx].ouro = (chars[cidx].ouro || 0) + preco;
      setSaved(chars);
    }
  }
  const list = getServos();
  const idx = list.findIndex(x => x.id === id);
  list[idx].ownerId = null;
  list[idx].contratoAtivo = true;
  setServos(list);
  pushServoLog(`<strong>${esc(s.nome)}</strong> colocado no mercado (${preco} Tibar para o antigo dono).`);
  onServoOwnerChange();
  renderServoMercado();
  openServoDetail(id);
}

function manumitirServo(id) {
  const s = getServoById(id);
  if (!s) return;
  if (s.clausulas && s.clausulas.semManumissao && (s.afeto || 0) < 95) {
    alert('Cláusula “Sem manumissão voluntária” impede a liberação enquanto o Afeto for < 95.');
    return;
  }
  const livre = (s.afeto || 0) >= 95;
  const msg = livre
    ? `${s.nome} está em Adoração (Afeto ≥95). A liberação é voluntária e sem resistência. Confirmar manumissão?`
    : `Manumitir ${s.nome}? O contrato será encerrado. (Afeto atual: ${s.afeto}/100)`;
  if (!confirm(msg)) return;
  const list = getServos();
  const idx = list.findIndex(x => x.id === id);
  list[idx].contratoAtivo = false;
  list[idx].ownerId = null;
  list[idx].manumitidoEm = new Date().toISOString();
  setServos(list);
  pushServoLog(`🕊️ <strong>${esc(s.nome)}</strong> liberado (manumissão). Contrato encerrado.`);
  renderServoOwnedList();
  renderServoMercado();
  openServoDetail(id);
  alert(`${s.nome} está livre. O contrato mágico foi dissolvido.`);
}

function excluirServo(id) {
  if (!confirm('Excluir este servo permanentemente dos dados?')) return;
  setServos(getServos().filter(x => x.id !== id));
  closeServoDetail();
  renderServoOwnedList();
  renderServoMercado();
}

/** Integração na ficha do personagem (tela de visualização) */
function renderCharServosOnView(charId) {
  const el = document.getElementById('vServos');
  if (!el) return;
  const list = getServosOfOwner(charId);
  if (!list.length) {
    el.innerHTML = 'Nenhum servo contratual.';
    return;
  }
  el.innerHTML = list.map(s => {
    const a = afetoServoLabel(s.afeto);
    const tipo = SERVO_TIPOS[s.tipo] || {};
    return `<div style="margin:4px 0;">• <strong>${esc(s.nome)}</strong> (${tipo.label || s.tipo}) — Afeto ${s.afeto}/100 <em style="color:${a.color}">${a.text}</em> · Apar ${s.aparencia}/10 · P${s.P} H${s.H} R${s.R}
      <button class="btn btn-sm btn-outline" style="width:auto;padding:2px 8px;font-size:0.72rem;margin-left:6px;" onclick="goTo('servos'); setTimeout(()=>{ const sel=document.getElementById('servoOwnerSelect'); if(sel){ sel.value='${charId}'; onServoOwnerChange(); } openServoDetail('${s.id}'); }, 120);">Abrir</button>
    </div>`;
  }).join('');
}


