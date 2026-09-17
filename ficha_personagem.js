/* ===== [CRIADOR_PJ] linhas originais 1522-2173 ===== */
/* ==================== CRIADOR DE PERSONAGENS ==================== */
const STORAGE_KEY = KEYS.chars;

const arquetipos = [
  {id:"",nome:"Humano",custo:0,bonus:"Mais Além: 1x/cena gasta 2PM para Ganho.",desv:null},
  {id:"aberrante",nome:"Aberrante",custo:1,bonus:"Deformidade + Teratismo.",desv:"Monstruoso"},
  {id:"abissal",nome:"Abissal",custo:1,bonus:"Ágil + Desfavor.",desv:"Infame"},
  {id:"alien",nome:"Alien",custo:1,bonus:"Talento + Xenobiologia.",desv:"Inculto"},
  {id:"anao",nome:"Anão",custo:1,bonus:"Abascanto + A Ferro e Fogo + Infravisão.",desv:"Lento"},
  {id:"anfibio",nome:"Anfíbio",custo:1,bonus:"Imune (Anfíbio) + Vigoroso.",desv:"Ambiente"},
  {id:"celestial",nome:"Celestial",custo:1,bonus:"Carismático + Arrebatar.",desv:"Código"},
  {id:"centauro",nome:"Centauro",custo:2,bonus:"Corpo Táurico + Vigoroso.",desv:"Diferente"},
  {id:"ciborgue",nome:"Ciborgue",custo:2,bonus:"Construto Vivo + Imunidades.",desv:"Diretriz"},
  {id:"construto",nome:"Construto",custo:1,bonus:"Imunidades + Bateria.",desv:"Sem Vida"},
  {id:"dahllan",nome:"Dahllan",custo:1,bonus:"Benção da Natureza + Empatia Selvagem.",desv:"Código Dahllan"},
  {id:"elfo",nome:"Elfo",custo:1,bonus:"Impecável + Natureza Mística.",desv:"Frágil"},
  {id:"fada",nome:"Fada",custo:1,bonus:"Magia das Fadas (–1 PM).",desv:"Infame + Delicada"},
  {id:"fantasma",nome:"Fantasma",custo:2,bonus:"Espírito + Paralisia.",desv:"Devoto"},
  {id:"goblin",nome:"Goblin",custo:1,bonus:"Espertalhão + Subterrâneo.",desv:"Diferente"},
  {id:"hynne",nome:"Hynne",custo:1,bonus:"Atirador + Encantador.",desv:"Diferente"},
  {id:"kallyanach",nome:"Kallyanach",custo:2,bonus:"Baforada + Poder Dracônico.",desv:"Código dos Dragões"},
  {id:"kemono",nome:"Kemono",custo:1,bonus:"Percepção Apurada + Talento.",desv:"Cacoete"},
  {id:"medusa",nome:"Medusa",custo:1,bonus:"Carismático + Olhar Atordoante.",desv:"Fracote"},
  {id:"minotauro",nome:"Minotauro",custo:1,bonus:"Atlético + Sentido Labiríntico.",desv:"Fobia de altura"},
  {id:"ogro",nome:"Ogro",custo:1,bonus:"Destruidor + Intimidador.",desv:"Diferente"},
  /* Raça OCULTA — não é oferecida em tavernas; raríssima / sobrenatural */
  {id:"vampiro",nome:"🔒 Vampiro",custo:1,bonus:"[3DeT Victory] Talento (Ágil/Carismático/Forte/Gênio/Resoluto/Vigoroso) + Imortal. Poderes clássicos (Mordida, Fascínio…) = vantagens compradas depois com XP.",desv:"Fraqueza (luz do dia). Dependência de sangue opcional no PJ.",hidden:true,racaOculta:true},
  {id:"licantropo",nome:"🐺 Licantropo / Lobisomem",custo:1,bonus:"[Espelho Victory] Talento (Forte ou Ágil) + Transformação (lua/fúria/perto da morte). Forma fera: mais força. Poderes extras = vantagens com XP.",desv:"Fraqueza (prata). Transformação sob gatilho. Monstruoso só na forma fera.",hidden:true,racaOculta:true}
];

const escalasInfo = {
  Ningen: "Padrão dos jogadores. Sem bônus contra Ningen.",
  Sugoi: "Incrível/Super. Vs Ningen: Ganho, Crítico automático e Defesa Perfeita.",
  Kiodai: "Gigante/Poder descomunal. Bônus massivo contra escalas inferiores.",
  Kami: "Quase divino. Dominância total contra qualquer escala inferior."
};

const pericias = ["Animais","Arte","Esporte","Influência","Luta","Manha","Máquinas","Medicina","Mística","Percepção","Saber","Sobrevivência"];

const vantagens = [
  {nome:"Aceleração",custo:1},{nome:"+Ação",custo:1,stackable:true,extraPA:2},{nome:"Acumulador",custo:1},{nome:"Ágil",custo:1},
  {nome:"Ajudante",custo:1},{nome:"Alcance (1pt)",custo:1},{nome:"Alcance (2pt)",custo:2},{nome:"Anulação",custo:2},
  {nome:"Arena",custo:1},{nome:"Artefato",custo:1},{nome:"Ataque Especial",custo:1},{nome:"Base",custo:1},
  {nome:"Brutal",custo:1},{nome:"Carismático",custo:1},{nome:"Clone",custo:1},{nome:"Confusão",custo:1},
  {nome:"Cura",custo:1},{nome:"Defesa Especial",custo:1},{nome:"Desgaste",custo:1},{nome:"Devoto",custo:1},
  {nome:"Elo Mental",custo:1},{nome:"Estender",custo:1},{nome:"Famoso",custo:1},{nome:"Foco",custo:1},
  {nome:"Forte",custo:1},{nome:"Gênio",custo:1},{nome:"Grimório",custo:1},{nome:"Ilusão",custo:1},
  {nome:"Imitar",custo:1},{nome:"Imortal",custo:2},{nome:"Imune",custo:1},{nome:"Inofensivo",custo:1},
  {nome:"Instrutor",custo:1},{nome:"Invisível",custo:1},{nome:"Irresistível",custo:1},{nome:"Maestria",custo:1},
  {nome:"Magia",custo:2},{nome:"+Mana",custo:1,stackable:true,extraPM:10},{nome:"Mentor",custo:1},{nome:"Obstinado",custo:1},
  {nome:"Paralisia",custo:1},{nome:"Patrono",custo:1},{nome:"Punição",custo:1},{nome:"Regeneração",custo:1},
  {nome:"Resoluto",custo:1},{nome:"Riqueza",custo:2},{nome:"Sentido",custo:1},{nome:"Telepata",custo:1},
  {nome:"Teleporte",custo:1},{nome:"Torcida",custo:1},{nome:"Vigoroso",custo:1},{nome:"+Vida",custo:1,stackable:true,extraPV:10},{nome:"Voo",custo:1},
  /* —— Kit racial / sobrenatural (Vampiro e afins) —— */
  {nome:"Mordida de Sangue",custo:1,raca:"vampiro",desc:"Ataque especial: dano + drena PV do alvo; cura parte do dano causado."},
  {nome:"Força Sobrenatural",custo:1,raca:"vampiro",desc:"Bônus em testes de Poder e dano corpo a corpo; pode imobilizar ou arremessar."},
  {nome:"Fascínio",custo:1,raca:"vampiro",desc:"Presença hipnótica (H + carisma/aparência). Pode hesitar, confundir ou impedir ataque por 1 turno."},
  {nome:"Sentidos Aguçados",custo:1,raca:"vampiro",desc:"Detecta mentira, medo, batimentos; difícil de emboscar."},
  {nome:"Resistência a Dano Comum",custo:1,raca:"vampiro",desc:"Armas mundanas causam dano reduzido. Fogo, prata, sagrado e magia afetam normalmente."},
  {nome:"Regeneração Vampírica",custo:1,raca:"vampiro",desc:"Regenera PV com sangue ou fora de combate; em luta, cura lenta por turno se feriu alguém."},
  {nome:"Velocidade Sobrenatural",custo:1,raca:"vampiro",desc:"Bônus em iniciativa, esquiva e ataques rápidos."},
  {nome:"Forma das Sombras",custo:1,raca:"vampiro",desc:"Pode sumir na penumbra; próximo ataque com surpresa ou bônus."}
];

const desvantagens = [
  {nome:"Amnésia",custo:-1},{nome:"Ambiente",custo:-1},{nome:"Antipático",custo:-1},{nome:"Assombrado",custo:-1},
  {nome:"Atrapalhado",custo:-1},{nome:"Aura",custo:-1},{nome:"Código de Honra",custo:-1},{nome:"Compulsão",custo:-1},
  {nome:"Dependência",custo:-1},{nome:"Devoção",custo:-1},{nome:"Diferente",custo:-1},{nome:"Elo Vital",custo:-1},
  {nome:"Fracote",custo:-1},{nome:"Frágil",custo:-1},{nome:"Fraqueza",custo:-1,needsDetail:true},{nome:"Fúria",custo:-1},
  {nome:"Inculto",custo:-1},{nome:"Indeciso",custo:-1},{nome:"Infame",custo:-1},{nome:"Inimigo",custo:-1},
  {nome:"Inapto",custo:-1},{nome:"Lento",custo:-1},{nome:"Maldição",custo:-1},{nome:"Monstruoso",custo:-1},
  {nome:"Ponto Fraco",custo:-1,needsDetail:true},{nome:"Protegido",custo:-1},{nome:"Restrição",custo:-1},{nome:"Sem Vida",custo:-1},
  {nome:"Tapado",custo:-1},{nome:"Transtorno",custo:-1},{nome:"Utensílio",custo:-1},
  /* —— Desvantagens raciais Vampiro —— */
  {nome:"Sede de Sangue",custo:-1,raca:"vampiro",desc:"Compulsão: precisa de sangue vivo regularmente ou sofre penalidades (fraqueza, fúria, perda de controle)."},
  {nome:"Maldição Vampírica",custo:-1,raca:"vampiro",desc:"Não é mais verdadeiramente vivo. Ritual, fé verdadeira e caçadores podem rastreá-lo. Sol e sagrado são letais se expostos."},
  {nome:"Aversão ao Sagrado",custo:-1,raca:"vampiro",desc:"Símbolos de fé verdadeira, água benta e terreno consagrado causam dor e penalidade."},
  {nome:"Noctívago",custo:-1,raca:"vampiro",desc:"Penalidade severa sob sol pleno; age melhor à noite."}
];

// Tipos de dano oficiais (regra opcional de 3DeT Victory)
const TIPOS_DANO = [
  "Pancada","Corte","Perfuração","Fogo","Gelo","Elétrico","Ácido","Veneno",
  "Cósmico","Sagrado","Sombrio","Mental","Social","Energia","Arcano"
];

let maxPoints = 10, levelLabel = "Iniciante";
let P = 0, H = 0, R = 0, XP = 0;
let selectedPericias = new Set(), selectedVantagens = new Set(), selectedDesvantagens = new Set();
let stackCounts = { '+Vida': 0, '+Mana': 0, '+Ação': 0 }; // quantidades das vantagens empilháveis
let fraquezaDetail = { tipo: '', comum: false }; // detalhe da Fraqueza
let pontoFracoDetail = ''; // detalhe do Ponto Fraco
let tipoDanoPadrao = 'Pancada'; // tipo de dano básico do personagem (grátis)
let tecnicas = [], artefatos = [];
let currentArchetype = arquetipos[0], currentEscala = "Ningen", charImage = null;
let editingId = null, viewingId = null;

/** Calcula PV/PM/PA máximos considerando +Vida, +Mana e +Ação */
function calcResources(p, h, r, vantList, stacks) {
  const counts = { '+Vida': 0, '+Mana': 0, '+Ação': 0 };
  (vantList || []).forEach(v => {
    if (v === '+Vida' || (typeof v === 'string' && v.startsWith('+Vida'))) counts['+Vida']++;
    if (v === '+Mana' || (typeof v === 'string' && v.startsWith('+Mana'))) counts['+Mana']++;
    if (v === '+Ação' || (typeof v === 'string' && v.startsWith('+Ação'))) counts['+Ação']++;
  });
  // prioriza contagem explícita de stacks (salvo no personagem ou em edição)
  const sc = stacks || (typeof stackCounts !== 'undefined' ? stackCounts : null);
  if (sc) {
    counts['+Vida'] = Math.max(counts['+Vida'], sc['+Vida'] || 0);
    counts['+Mana'] = Math.max(counts['+Mana'], sc['+Mana'] || 0);
    counts['+Ação'] = Math.max(counts['+Ação'], sc['+Ação'] || 0);
  }
  const pa = Math.max(0, (p || 0) + counts['+Ação'] * 2);
  const pm = ((h || 0) === 0 ? 1 : h * 5) + counts['+Mana'] * 10;
  const pv = ((r || 0) === 0 ? 1 : r * 5) + counts['+Vida'] * 10;
  return { pa, pm, pv, extraPA: counts['+Ação'] * 2, extraPM: counts['+Mana'] * 10, extraPV: counts['+Vida'] * 10, counts };
}

/** Recursos finais de um personagem salvo (usa stackCounts se existir) */
function getCharResources(c) {
  if (!c) return { pa: 0, pm: 1, pv: 1 };
  const n = normalizeCharacter(c);
  if (n.pvMax != null && n.pmMax != null && n.paMax != null) {
    return { pa: n.paMax, pm: n.pmMax, pv: n.pvMax };
  }
  return calcResources(n.P || 0, n.H || 0, n.R || 0, n.vantagens || [], n.stackCounts || null);
}

/** Garante campos padrão em fichas antigas / importadas */
function normalizeCharacter(c) {
  if (!c || typeof c !== 'object') return c;
  const out = { ...c };
  out.P = out.P || 0;
  out.H = out.H || 0;
  out.R = out.R || 0;
  out.XP = out.XP || 0;
  out.pericias = Array.isArray(out.pericias) ? out.pericias : [];
  out.vantagens = Array.isArray(out.vantagens) ? out.vantagens : [];
  out.desvantagens = Array.isArray(out.desvantagens) ? out.desvantagens : [];
  out.tecnicas = Array.isArray(out.tecnicas) ? out.tecnicas : [];
  out.artefatos = Array.isArray(out.artefatos) ? out.artefatos : [];
  out.inventario = Array.isArray(out.inventario) ? out.inventario : [];
  out.ouro = typeof out.ouro === 'number' ? out.ouro : 0;
  // Equipamento (slots)
  if (!out.equipado || typeof out.equipado !== 'object') {
    out.equipado = { arma: null, escudo: null, armadura: null, acessorio: null };
  } else {
    out.equipado = {
      arma: out.equipado.arma || null,
      escudo: out.equipado.escudo || null,
      armadura: out.equipado.armadura || null,
      acessorio: out.equipado.acessorio || null
    };
  }
  if (!Array.isArray(out.statusEffects)) out.statusEffects = [];
  if (!Array.isArray(out.injuries)) out.injuries = [];
  if (typeof out.deathCount !== 'number') out.deathCount = 0;
  if (typeof out.pvMaxPenalty !== 'number') out.pvMaxPenalty = 0;
  // Aparência 1–10 (default 5 = Normal)
  if (typeof out.aparencia !== 'number' || out.aparencia < 1 || out.aparencia > 10) {
    out.aparencia = 5;
  } else {
    out.aparencia = Math.max(1, Math.min(10, Math.round(out.aparencia)));
  }
  // Gênero / sexo (F ou M) — usado pela galeria de retratos
  if (out.genero !== 'F' && out.genero !== 'M') {
    if (out.sexo === 'F' || out.sexo === 'M') out.genero = out.sexo;
    else if (out.sexoLabel && /f[eê]m/i.test(String(out.sexoLabel))) out.genero = 'F';
    else if (out.sexoLabel && /masc/i.test(String(out.sexoLabel))) out.genero = 'M';
    else out.genero = out.genero || '';
  }
  if (out.genero === 'F' || out.genero === 'M') {
    out.sexo = out.genero;
    out.sexoLabel = out.genero === 'F' ? 'Feminino' : 'Masculino';
  }
  if (typeof out.retrato !== 'string') out.retrato = out.retrato || '';
  if (!out._convivio || typeof out._convivio !== 'object') out._convivio = {};
  // Status e fome
  const STATUS_VALIDOS = ['normal','abençoado','faminto','paralisado','envenenado','dormindo','morto','prisioneiro','escravo'];
  if (!out.status || !STATUS_VALIDOS.includes(out.status)) out.status = 'normal';
  if (out.cativeiro && typeof out.cativeiro !== 'object') delete out.cativeiro;
  if (out.escravidao && typeof out.escravidao !== 'object') delete out.escravidao;
  if (typeof out.mantimentos !== 'number' || out.mantimentos < 0) out.mantimentos = 5;
  // PV atual (para dano de fome / combate persistente)
  if (typeof out.pvAtual !== 'number') {
    const resTmp = calcResources(out.P || 0, out.H || 0, out.R || 0, out.vantagens || [], out.stackCounts || null);
    out.pvAtual = out.pvMax != null ? out.pvMax : resTmp.pv;
  }
  // migra artefatos antigos (strings) para inventário se ainda não migrados
  if (out.artefatos.length && out.inventario.length === 0) {
    out.artefatos.forEach(a => {
      if (typeof a === 'string' && a.trim()) {
        out.inventario.push({
          id: 'mig_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
          nome: a,
          tipo: 'equipamento',
          valor: 20,
          qtd: 1,
          usavel: false
        });
      }
    });
  }
  out.tipoDanoPadrao = out.tipoDanoPadrao || 'Pancada';
  out.fraquezaDetail = out.fraquezaDetail || { tipo: '', comum: false };
  out.pontoFracoDetail = out.pontoFracoDetail || '';
  if (!out.stackCounts) {
    out.stackCounts = { '+Vida': 0, '+Mana': 0, '+Ação': 0 };
    out.vantagens.forEach(v => {
      if (v === '+Vida') out.stackCounts['+Vida']++;
      if (v === '+Mana') out.stackCounts['+Mana']++;
      if (v === '+Ação') out.stackCounts['+Ação']++;
    });
    if (out.vantagens.includes('+Vida') && out.stackCounts['+Vida'] === 0) out.stackCounts['+Vida'] = 1;
    if (out.vantagens.includes('+Mana') && out.stackCounts['+Mana'] === 0) out.stackCounts['+Mana'] = 1;
    if (out.vantagens.includes('+Ação') && out.stackCounts['+Ação'] === 0) out.stackCounts['+Ação'] = 1;
  } else {
    out.stackCounts = {
      '+Vida': out.stackCounts['+Vida'] || 0,
      '+Mana': out.stackCounts['+Mana'] || 0,
      '+Ação': out.stackCounts['+Ação'] || 0
    };
  }
  const res = calcResources(out.P, out.H, out.R, out.vantagens, out.stackCounts);
  out.paMax = res.pa;
  out.pmMax = res.pm;
  out.pvMax = res.pv;
  return out;
}

function goSaved() {
  renderSavedList();
  showCreatorScreen('saved');
}

function openNewEditor() {
  editingId = null;
  resetForm();
  document.getElementById('editorTitle').textContent = "Criar Novo Personagem";
  showCreatorScreen('editor');
}


function viewSetStatus(st) {
  if (!viewingId) return;
  if (!confirm('Alterar status para "' + (STATUS_LABELS[st] || st) + '"?')) return;
  setCharacterStatus(viewingId, st);
  openView(viewingId);
}
function viewResurrect() {
  if (!viewingId) return;
  if (!confirm('Ressuscitar este personagem? (Status → Normal, recupera metade dos PV)')) return;
  resurrectCharacter(viewingId);
  openView(viewingId);
  alert('Personagem ressuscitado!');
}
function viewAddMantimentos(q) {
  if (!viewingId) return;
  addMantimentos(viewingId, q);
  openView(viewingId);
}

function openEditorFromView() {
  if (!viewingId) return;
  loadCharacterToForm(viewingId);
  document.getElementById('editorTitle').textContent = "Editar Personagem";
  showCreatorScreen('editor');
}

function cancelEdit() {
  if (editingId) openView(editingId);
  else goSaved();
}

function openView(id) {
  const list = getSaved();
  const c = list.find(x => x.id === id);
  if (!c) return;
  viewingId = c.id;

  // Converte XP pendente automaticamente e persiste
  const conv = convertXpToPoints(c);
  if (conv.pontosGanhos > 0) {
    const idx = list.findIndex(x => x.id === id);
    if (idx >= 0) {
      list[idx] = c;
      setSaved(list);
    }
  }

  document.getElementById('vNome').textContent = c.nome || "Sem Nome";
  document.getElementById('vConceito').textContent = c.conceito || "Sem conceito";
  document.getElementById('vArquetipo').textContent = c.arquetipoNome || "Humano";
  document.getElementById('vNivel').textContent = `${c.levelLabel || 'Iniciante'} (${c.maxPoints || 10}pt)`;
  document.getElementById('vEscala').textContent = c.escala || "Ningen";
  document.getElementById('vP').textContent = c.P;
  document.getElementById('vH').textContent = c.H;
  document.getElementById('vR').textContent = c.R;
  const res = getCharResources(c);
  document.getElementById('vPA').textContent = res.pa;
  document.getElementById('vPM').textContent = res.pm;
  document.getElementById('vPV').textContent = res.pv;
  document.getElementById('vEscalaInfo').innerHTML = `<strong>${c.escala || 'Ningen'}</strong> — ${escalasInfo[c.escala || 'Ningen']}`;
  let vampBox = '';
  if (typeof isVampireChar === 'function' && isVampireChar(c)) {
    const sede = (c.vampiro && c.vampiro.sede) || 0;
    const sire = (c.vampiro && c.vampiro.sire) || '—';
    vampBox = `<div style="margin-top:6px;padding:10px;border-radius:8px;background:rgba(124,58,237,0.15);border:1px solid rgba(168,85,247,0.45);font-size:0.85rem;color:#e9d5ff;">
      🔒 <strong>Raça oculta: Vampiro</strong><br>
      Sire/origem: ${esc(sire)} · Sede de Sangue: <strong style="color:${sede>=3?'#f87171':'#c4b5fd'}">${sede}/5</strong>
      <div style="font-size:0.78rem;color:var(--muted);margin-top:4px;">Sol/Sagrado: Fraqueza · Mordida em combate · Regeneração se alimentado · Noite favorece</div>
      <button class="btn btn-sm" style="margin-top:8px;width:auto;background:linear-gradient(135deg,#7c3aed,#a855f7);color:#fff;" onclick="alimentarVampiro('${c.id}')">🩸 Alimentar-se (zera Sede)</button>
    </div>`;
  } else if (typeof isWerewolfChar === 'function' && isWerewolfChar(c)) {
    const g = (c.lobisomem && c.lobisomem.gatilho) || 'Lua cheia';
    const sire = (c.lobisomem && c.lobisomem.sire) || '—';
    vampBox = `<div style="margin-top:6px;padding:10px;border-radius:8px;background:rgba(100,116,139,0.2);border:1px solid rgba(148,163,184,0.45);font-size:0.85rem;color:#e2e8f0;">
      🐺 <strong>Raça oculta: Licantropo</strong><br>
      Origem: ${esc(sire)} · Gatilho: <strong>${esc(g)}</strong>
      <div style="font-size:0.78rem;color:var(--muted);margin-top:4px;">Fraqueza: prata · Forma fera sob gatilho · Poderes extras com XP</div>
    </div>`;
  } else {
    vampBox = `<div style="margin-top:6px;display:flex;flex-wrap:wrap;gap:6px;">
      <button class="btn btn-sm btn-outline" style="width:auto;" onclick="tentarTransformacaoVampirica('${c.id}','manual')">🔒 Tornar Vampiro (mesa)</button>
      <button class="btn btn-sm btn-outline" style="width:auto;" onclick="tentarTransformacaoLupinica('${c.id}','manual')">🐺 Tornar Lobisomem (mesa)</button>
    </div>`;
  }
  document.getElementById('vArqBonus').innerHTML = `<strong>${c.arquetipoNome || 'Humano'}</strong>: ${c.arquetipoBonus || 'Nenhum'}` + vampBox;
  document.getElementById('vPericias').textContent = (c.pericias && c.pericias.length) ? c.pericias.join(', ') : 'Nenhuma';
  {
    const sc = c.stackCounts || {};
    const vantLabels = (c.vantagens || []).map(v => {
      if (v === '+Vida' || v === '+Mana' || v === '+Ação') {
        const n = sc[v] || 1;
        return n > 1 ? `${v} ×${n}` : v;
      }
      return v;
    });
    document.getElementById('vVantagens').textContent = vantLabels.length ? vantLabels.join(', ') : 'Nenhuma';
  }
  let desvList = [...(c.desvantagens || [])].map(d => {
    if (d === 'Fraqueza' && c.fraquezaDetail && c.fraquezaDetail.tipo) {
      return `Fraqueza (${c.fraquezaDetail.tipo}${c.fraquezaDetail.comum ? ', comum' : ', incomum'})`;
    }
    if (d === 'Ponto Fraco' && c.pontoFracoDetail) {
      return `Ponto Fraco (${c.pontoFracoDetail})`;
    }
    return d;
  });
  if (c.arquetipoDesv) desvList.push(`${c.arquetipoDesv} (Arquétipo)`);
  document.getElementById('vDesvantagens').textContent = desvList.length ? desvList.join(', ') : 'Nenhuma';
  const vTipo = document.getElementById('vTipoDano');
  if (vTipo) vTipo.textContent = c.tipoDanoPadrao || 'Pancada';
  document.getElementById('vTecnicas').textContent = (c.tecnicas && c.tecnicas.length) ? c.tecnicas.join(', ') : 'Nenhuma';
  document.getElementById('vArtefatos').textContent = (c.artefatos && c.artefatos.length) ? c.artefatos.join(', ') : 'Nenhum';
  // Status + Mantimentos
  const STATUS_LABELS = {
    normal: 'Normal', abençoado: 'Abençoado', faminto: 'Faminto',
    paralisado: 'Paralisado', envenenado: 'Envenenado', dormindo: 'Dormindo', morto: 'Morto',
    prisioneiro: 'Prisioneiro', escravo: 'Escravo(a)'
  };
  const st = c.status || 'normal';
  const vStatus = document.getElementById('vStatus');
  if (vStatus) {
    const cls = 'status-' + (st === 'abençoado' ? 'abencoado' : st);
    let extra = '';
    if (st === 'prisioneiro' && c.cativeiro) {
      extra = ` <span style="font-size:0.75rem;color:var(--muted);">(${c.cativeiro.diasRestantes} dia(s) restante(s))</span>
        <button class="btn btn-sm btn-outline" style="width:auto;margin-left:6px;" onclick="tentarFugaPrisioneiro('${c.id}')">🔓 Tentar Fuga</button>`;
    }
    if (st === 'escravo' && c.escravidao) {
      const div = c.escravidao.divida > 0 ? ` · Dívida: <strong style="color:var(--accent2)">${c.escravidao.divida} Tibar</strong>` : ` · Preço: <strong>${c.escravidao.preco} Tibar</strong>`;
      extra = ` <span style="font-size:0.75rem;color:var(--muted);">${div}</span>
        <button class="btn btn-sm btn-outline" style="width:auto;margin-left:6px;" onclick="comprarLiberdadePJ('${c.id}')">🔓 Comprar e Libertar</button>`;
    }
    const trauma = (c.statusEffects || []).find(e => e.id === 'trauma_cativeiro' && e.expires > Date.now());
    if (trauma) extra += ` <span class="status-badge status-envenenado" style="font-size:0.72rem;" title="${esc(trauma.bonus)}">😞 Trauma</span>`;
    vStatus.innerHTML = `<span class="status-badge ${cls}">${STATUS_LABELS[st] || st}</span>${extra}`;
  }
  const vMant = document.getElementById('vMantimentos');
  if (vMant) {
    const m = typeof c.mantimentos === 'number' ? c.mantimentos : 5;
    const color = m <= 0 ? 'var(--danger)' : (m <= 2 ? 'var(--accent)' : 'var(--success)');
    vMant.innerHTML = `<strong style="color:${color}">${m}</strong> unidade(s)` +
      (m <= 0 ? ' <em style="color:var(--danger)">(sem comida!)</em>' : '');
  }
  const vOuro = document.getElementById('vOuro');
  if (vOuro) vOuro.textContent = `${c.ouro || 0} Tibar`;
  const vApar = document.getElementById('vAparencia');
  if (vApar) {
    if (typeof c.aparencia === 'number') {
      const ap = typeof aparenciaBonus === 'function' ? aparenciaBonus(c.aparencia) : null;
      const humor = (c.statusEffects || []).find(s => s.id === 'humor_aparencia');
      const humorHtml = humor ? ` <span class="status-badge ${humor.mod > 0 ? 'status-abencoado' : 'status-envenenado'}" style="font-size:0.72rem;" title="${esc(humor.nome)} · ${humor.periodosRestantes} etapa(s) restante(s)">${humor.mod > 0 ? '😊' : '😖'} Humor ${humor.mod >= 0 ? '+' : ''}${humor.mod} · ${humor.periodosRestantes != null ? humor.periodosRestantes : '?'} etapa(s)</span>` : '';
      vApar.innerHTML = `
        <div><strong>${c.aparencia}/10</strong>${ap ? ' — <span style="color:var(--accent)">' + esc(ap.label) + '</span>' : ''}${humorHtml}</div>
        <div style="font-size:0.72rem;color:var(--muted);margin:6px 0;line-height:1.45;">
          <strong>Níveis:</strong> Monstruosa −2 · Feia −1 · Normal 0 · Bonita +1 · Linda +2 · Maravilhosa +3<br>
          Bônus/redutor em <em>testes sociais</em>. Convívio ≥2 etapas do dia gera <em>Humor</em> (dura 2 etapas).
        </div>
        <button class="btn btn-sm btn-outline" style="width:auto;" onclick="abrirTesteSocialUI('${c.id}')">🗣️ Teste Social</button>
        <button class="btn btn-sm" style="width:auto;margin-left:4px;background:linear-gradient(135deg,#a855f7,#6366f1);color:#fff;" onclick="abrirCenaSocialUI('${c.id}')">🎭 Cena Social</button>
        <button class="btn btn-sm btn-outline" style="width:auto;margin-left:4px;" onclick="ajustarAparenciaManual('${c.id}')">✨ Ajustar</button>`;
    } else {
      vApar.innerHTML = `— <button class="btn btn-sm btn-outline" style="width:auto;margin-left:6px;" onclick="ajustarAparenciaManual('${c.id}')">Definir Aparência</button>`;
    }
  }
  const vAdj = document.getElementById('vAparAdjetivo');
  if (vAdj) {
    if (typeof c.aparencia === 'number' && typeof aparenciaBonus === 'function') {
      const apAdj = aparenciaBonus(c.aparencia);
      vAdj.innerHTML = `<span style="cursor:pointer; color:var(--accent); font-size:0.95rem; text-decoration:underline dotted;" title="Clique para ver a descrição" onclick="mostrarDescricaoAparencia('${apAdj.nivel}')">✨ ${esc(apAdj.label)}</span>`;
    } else {
      vAdj.innerHTML = '';
    }
  }
  // Ferimentos / mortes
  const vInj = document.getElementById('vInjuries');
  if (vInj) {
    const deaths = c.deathCount || 0;
    const inj = c.injuries || [];
    let html = `<div>Mortes: <strong style="color:${deaths ? 'var(--accent2)' : 'var(--muted)'}">${deaths}</strong></div>`;
    if (c.lastWill) html += `<div style="margin-top:4px; color:var(--muted);">Última vontade: <em>«${esc(c.lastWill)}»</em></div>`;
    if (inj.length) {
      html += inj.map(i => `<div style="margin-top:6px;">• <strong>${esc(i.nome)}</strong><div style="font-size:0.75rem;color:var(--muted);margin-left:8px;">${esc(i.desc || '')}</div></div>`).join('');
    } else {
      html += '<div style="color:var(--muted); margin-top:4px;">Nenhum ferimento permanente.</div>';
    }
    if (c.status === 'morto') {
      html += `<div style="margin-top:10px;"><button class="btn btn-sm" style="width:auto;background:var(--magic);" onclick="templeResurrect('${c.id}')">⛪ Ressuscitar no Templo (150 Tibar)</button></div>`;
    }
    vInj.innerHTML = html;
  }
  // Equipado
  const vEq = document.getElementById('vEquipado');
  if (vEq) {
    const eq = c.equipado || {};
    const slots = [
      { key: 'arma', label: '🗡️ Arma' },
      { key: 'escudo', label: '🛡️ Escudo' },
      { key: 'armadura', label: '🥋 Armadura' },
      { key: 'acessorio', label: '📿 Acessório' }
    ];
    vEq.innerHTML = slots.map(s => {
      const item = (c.inventario || []).find(i => i.id === eq[s.key]);
      if (item) {
        return `<div style="margin:4px 0; display:flex; justify-content:space-between; align-items:center; gap:6px; flex-wrap:wrap;">
          <span>${s.label}: <strong style="color:var(--accent)">${esc(item.nome)}</strong></span>
          <button class="btn btn-sm btn-outline" style="width:auto;padding:2px 8px;font-size:0.72rem;" onclick="unequipSlot('${c.id}','${s.key}'); setTimeout(()=>openView('${c.id}'),80);">Remover</button>
        </div>`;
      }
      return `<div style="margin:4px 0; color:var(--muted);">${s.label}: <em>vazio</em></div>`;
    }).join('') + `<div style="font-size:0.75rem;color:var(--muted);margin-top:6px;">Bônus ativos: ${esc(describeEquipBonuses(c))}</div>`;
  }
  const vInv = document.getElementById('vInventario');
  if (vInv) {
    const inv = c.inventario || [];
    if (inv.length === 0) {
      vInv.textContent = 'Vazio';
    } else {
      const eqIds = Object.values(c.equipado || {}).filter(Boolean);
      vInv.innerHTML = inv.map((i, idx) => {
        const qtd = i.qtd > 1 ? ` ×${i.qtd}` : '';
        const val = i.valor != null ? ` (${i.valor} Tibar)` : '';
        const equipped = eqIds.includes(i.id);
        const slot = getItemEquipSlot(i);
        const useBtn = i.usavel
          ? ` <button class="btn btn-sm" style="width:auto;padding:2px 8px;font-size:0.72rem;margin-left:4px;" onclick="useInventoryItem('${c.id}', ${idx}); setTimeout(()=>openView('${c.id}'),100);">Usar</button>`
          : '';
        const eqBtn = (!i.usavel && slot && !equipped)
          ? ` <button class="btn btn-sm" style="width:auto;padding:2px 8px;font-size:0.72rem;margin-left:4px;background:var(--accent);" onclick="equipItem('${c.id}', ${idx}); setTimeout(()=>openView('${c.id}'),80);">Equipar</button>`
          : (equipped ? ' <em style="color:var(--accent2);font-size:0.72rem;">[equipado]</em>' : '');
        return `<div style="margin:4px 0; line-height:1.4;">• <strong>${esc(i.nome)}</strong>${qtd}${val}${i.usavel ? ' <em style="color:var(--success)">[usável]</em>' : ''}${eqBtn}${useBtn}<div style="font-size:0.75rem;color:var(--muted);margin-left:10px;">${esc(i.desc || '')}</div></div>`;
      }).join('');
    }
  }
  document.getElementById('vXP').textContent = `${c.XP || 0} / 10 (próximo ponto de personagem)`;
  const vPontos = document.getElementById('vPontos');
  if (vPontos) vPontos.textContent = `${c.maxPoints || 10} pts (${c.levelLabel || 'Iniciante'})`;
  document.getElementById('vBiografia').textContent = c.biografia || '—';

  try { if (typeof renderCharServosOnView === 'function') renderCharServosOnView(c.id); } catch (e) {}

  const imgSrc = c.image || c.retrato || '';
  if (imgSrc) {
    document.getElementById('vImg').src = imgSrc;
    document.getElementById('vImg').style.display = 'block';
    document.getElementById('vImgPlaceholder').style.display = 'none';
  } else {
    document.getElementById('vImg').style.display = 'none';
    document.getElementById('vImgPlaceholder').style.display = 'flex';
  }
  showCreatorScreen('view');
}

function loadCharacterToForm(id) {
  const c = getSaved().find(x => x.id === id);
  if (!c) return;
  editingId = c.id;
  document.getElementById('nome').value = c.nome || '';
  document.getElementById('conceito').value = c.conceito || '';
  document.getElementById('biografia').value = c.biografia || '';
  updateBioCount();
  maxPoints = c.maxPoints || 10;
  setLevel(maxPoints);
  document.getElementById('escala').value = c.escala || 'Ningen';
  currentEscala = c.escala || 'Ningen';
  onEscalaChange();
  document.getElementById('arquetipo').value = c.arquetipoId || '';
  currentArchetype = arquetipos.find(a => a.id === (c.arquetipoId || '')) || arquetipos[0];
  onArchetypeChange();
  try {
    const gEl = document.getElementById('charGenero');
    if (gEl) gEl.value = (c.genero === 'F' || c.genero === 'M') ? c.genero : (c.sexo === 'F' || c.sexo === 'M' ? c.sexo : '');
  } catch (e) {}
  P = c.P || 0; H = c.H || 0; R = c.R || 0; XP = c.XP || 0;
  // Converte XP pendente em pontos de personagem ao carregar
  let pontosGanhosLoad = 0;
  while (XP >= 10) {
    XP -= 10;
    maxPoints += 1;
    pontosGanhosLoad++;
  }
  if (pontosGanhosLoad > 0) {
    if (maxPoints >= 35) levelLabel = 'Veterano';
    else if (maxPoints >= 20) levelLabel = 'Herói';
    else levelLabel = 'Iniciante';
    document.getElementById('levelName').textContent = levelLabel;
  }
  document.getElementById('valP').textContent = P;
  document.getElementById('valH').textContent = H;
  document.getElementById('valR').textContent = R;
  document.getElementById('valXP').textContent = XP;
  selectedPericias = new Set(c.pericias || []);
  selectedVantagens = new Set(c.vantagens || []);
  selectedDesvantagens = new Set(c.desvantagens || []);
  // restaura stacks (+Vida / +Mana / +Ação)
  stackCounts = { '+Vida': 0, '+Mana': 0, '+Ação': 0 };
  if (c.stackCounts) {
    stackCounts['+Vida'] = c.stackCounts['+Vida'] || 0;
    stackCounts['+Mana'] = c.stackCounts['+Mana'] || 0;
    stackCounts['+Ação'] = c.stackCounts['+Ação'] || 0;
  } else {
    // compatibilidade com fichas antigas: conta ocorrências no array
    (c.vantagens || []).forEach(v => {
      if (v === '+Vida') stackCounts['+Vida']++;
      if (v === '+Mana') stackCounts['+Mana']++;
      if (v === '+Ação') stackCounts['+Ação']++;
    });
    // se só tinha 1 entrada no Set, assume 1
    if (selectedVantagens.has('+Vida') && stackCounts['+Vida'] === 0) stackCounts['+Vida'] = 1;
    if (selectedVantagens.has('+Mana') && stackCounts['+Mana'] === 0) stackCounts['+Mana'] = 1;
    if (selectedVantagens.has('+Ação') && stackCounts['+Ação'] === 0) stackCounts['+Ação'] = 1;
  }
  if (stackCounts['+Vida'] > 0) selectedVantagens.add('+Vida');
  if (stackCounts['+Mana'] > 0) selectedVantagens.add('+Mana');
  if (stackCounts['+Ação'] > 0) selectedVantagens.add('+Ação');
  document.querySelectorAll('#periciasList input').forEach(x => x.checked = selectedPericias.has(x.value));
  document.querySelectorAll('#vantagensList input').forEach(x => x.checked = selectedVantagens.has(x.value));
  document.querySelectorAll('#desvantagensList input').forEach(x => x.checked = selectedDesvantagens.has(x.value));
  tecnicas = c.tecnicas ? [...c.tecnicas] : [];
  artefatos = c.artefatos ? [...c.artefatos] : [];
  // Tipo de dano + detalhes de Fraqueza / Ponto Fraco
  tipoDanoPadrao = c.tipoDanoPadrao || 'Pancada';
  const danoSel = document.getElementById('tipoDanoPadrao');
  if (danoSel) danoSel.value = tipoDanoPadrao;
  fraquezaDetail = {
    tipo: (c.fraquezaDetail && c.fraquezaDetail.tipo) || '',
    comum: !!(c.fraquezaDetail && c.fraquezaDetail.comum)
  };
  const fwTipo = document.getElementById('fraquezaTipo');
  const fwComum = document.getElementById('fraquezaComum');
  if (fwTipo) fwTipo.value = fraquezaDetail.tipo;
  if (fwComum) fwComum.value = fraquezaDetail.comum ? '2' : '1';
  pontoFracoDetail = c.pontoFracoDetail || '';
  const pfTipo = document.getElementById('pontoFracoTipo');
  if (pfTipo) pfTipo.value = pontoFracoDetail;
  renderTags();
  if (c.image) { charImage = c.image; showImg(true); }
  else if (c.retrato) { charImage = c.retrato; showImg(true); }
  else removeImage();
  updateAll();
}

function setLevel(pts) {
  if (pts < maxPoints && !confirm(`Reduzir orçamento de ${maxPoints} para ${pts} pts?\nPontos ganhos com XP serão perdidos.`)) {
    return;
  }
  maxPoints = pts;
  levelLabel = pts >= 35 ? 'Veterano' : pts >= 20 ? 'Herói' : 'Iniciante';
  document.querySelectorAll('.level-btn').forEach(b => b.classList.remove('active'));
  const btn = document.getElementById('lvl' + (pts >= 35 ? 35 : pts >= 20 ? 20 : 10));
  if (btn) btn.classList.add('active');
  document.getElementById('levelName').textContent = levelLabel;
  updateAll();
}

function onEscalaChange() {
  currentEscala = document.getElementById('escala').value;
  document.getElementById('escalaInfo').innerHTML = '<strong>' + currentEscala + '</strong><br>' + escalasInfo[currentEscala];
}

function onArchetypeChange() {
  const id = document.getElementById('arquetipo').value;
  currentArchetype = arquetipos.find(a => a.id === id) || arquetipos[0];
  let info = '<strong>' + currentArchetype.nome + ' (' + currentArchetype.custo + ' pt)</strong><br>' + currentArchetype.bonus + (currentArchetype.desv ? '<br><span style="color:var(--accent2)">Desvantagem: ' + currentArchetype.desv + '</span>' : '');
  if (currentArchetype.id === 'vampiro') {
    info += '<br><br><span style="color:#a855f7;font-weight:700;">🔒 Raça oculta — Vampiro</span>';
    info += '<br><span style="font-size:0.82rem;color:var(--muted)">Imortal relativo (~séculos). Aparência costuma ser alta. Sangue é vida. Sol e sagrado são a ruína. Marque as vantagens/desvantagens raciais abaixo (kit sugerido).</span>';
    info += '<br><button type="button" class="btn btn-sm" style="margin-top:8px;width:auto;background:linear-gradient(135deg,#7c3aed,#a855f7);color:#fff;" onclick="aplicarKitVampiro()">🩸 Aplicar pacote Victory Vampiro (1 pt)</button>';
  }
  if (id === 'licantropo') {
    info += '<br><button type="button" class="btn btn-sm" style="margin-top:8px;width:auto;background:linear-gradient(135deg,#64748b,#334155);color:#fff;" onclick="aplicarKitLicantropo()">🐺 Aplicar pacote Licantropo (1 pt)</button>';
  }
  document.getElementById('arqInfo').innerHTML = info;
  updateAll();
}

/** Marca automaticamente vantagens e desvantagens do kit Vampiro na planilha */
function aplicarKitVampiro() {
  // Pacote oficial 3DeT Victory (1 pt): Talento + Imortal + Fraqueza (luz do dia)
  // Poderes clássicos ficam para compra posterior com XP
  selectedVantagens.add('Imortal');
  selectedVantagens.add('Carismático'); // Talento padrão sugerido — jogador pode trocar
  selectedDesvantagens.add('Fraqueza');
  fraquezaDetail = { tipo: 'Luz do dia', comum: true };
  const ft = document.getElementById('fraquezaTipo');
  if (ft) ft.value = fraquezaDetail.tipo;
  const fc = document.getElementById('fraquezaComum');
  if (fc) fc.value = '2';
  document.querySelectorAll('#vantagensList input').forEach(x => { if (selectedVantagens.has(x.value)) x.checked = true; });
  document.querySelectorAll('#desvantagensList input').forEach(x => { if (selectedDesvantagens.has(x.value)) x.checked = true; });
  updateAll();
  alert('Arquétipo Vampiro (3DeT Victory, 1 pt) aplicado.\n\n• Talento sugerido: Carismático (troque se quiser)\n• Imortal\n• Fraqueza: luz do dia\n\nPoderes extras (Mordida, Fascínio, Regeneração…) compre depois com pontos/XP — o sangue desperta.');
}

function aplicarKitLicantropo() {
  selectedVantagens.add('Forte'); // Talento sugerido
  selectedVantagens.add('Imortal'); // resiliência da matilha / maldição viva
  selectedDesvantagens.add('Fraqueza');
  fraquezaDetail = { tipo: 'Prata', comum: false };
  const ft = document.getElementById('fraquezaTipo');
  if (ft) ft.value = fraquezaDetail.tipo;
  const fc = document.getElementById('fraquezaComum');
  if (fc) fc.value = '1';
  document.querySelectorAll('#vantagensList input').forEach(x => { if (selectedVantagens.has(x.value)) x.checked = true; });
  document.querySelectorAll('#desvantagensList input').forEach(x => { if (selectedDesvantagens.has(x.value)) x.checked = true; });
  updateAll();
  alert('Arquétipo Licantropo / Lobisomem (1 pt, espelho Victory) aplicado.\n\n• Talento sugerido: Forte\n• Transformação (defina gatilho: lua / fúria / perto da morte)\n• Fraqueza: prata\n\nPoderes extras compre com XP — a lua desperta.');
}


/* ===== [VAMPIRO_PJ_HDR] linhas originais 2174-2177 ===== */
/* ==================== TRANSFORMAÇÃO EM VAMPIRO (PJ) ====================
 * O personagem jogador pode tornar-se Vampiro (raça oculta).
 * Kit completo na planilha + mecânicas: Sede, Mordida, Regeneração, Sol/Noite.
 */
/* ===== [TRANSFORMACOES] linhas originais 2178-2572 ===== */
/* ==================== TRANSFORMAÇÕES: VAMPIRO (Victory) & LICANTROPO ====================
 * Base = pacote oficial/espelho 1 pt. Poderes extras = vantagens compradas com XP.
 * Rotas exclusivas: Vampiro (Seraphine) × Lobisomem (Selene).
 */
const VAMP_VANT_BASE = ['Imortal', 'Carismático']; // Talento padrão; jogador pode trocar
const VAMP_DESV_BASE = ['Fraqueza'];
const LOBO_VANT_BASE = ['Imortal', 'Forte'];
const LOBO_DESV_BASE = ['Fraqueza'];

function isVampireChar(c) {
  if (!c) return false;
  return c.arquetipoId === 'vampiro' || c.racaOculta === 'vampiro' || !!c.vampiro;
}
function isWerewolfChar(c) {
  if (!c) return false;
  return c.arquetipoId === 'licantropo' || c.racaOculta === 'licantropo' || !!c.lobisomem;
}
function personagemTemVantagem(c, nome) {
  return !!(c && Array.isArray(c.vantagens) && c.vantagens.includes(nome));
}

function rotaTransformacaoBloqueada(c, desejado) {
  if (desejado === 'vampiro' && isWerewolfChar(c))
    return 'Você já carrega a Marca de Selene (lobisomem). A matilha e o Véu não perdoam o Beijo da irmã.';
  if (desejado === 'licantropo' && isVampireChar(c))
    return 'Você já recebeu o Beijo de Seraphine (vampiro). Selene sente o cheiro da irmã em você — a Marca é recusada.';
  return null;
}

function transformarPersonagemEmVampiro(charId, source) {
  const list = typeof getSaved === 'function' ? getSaved() : [];
  const idx = list.findIndex(c => c.id === charId);
  if (idx < 0) { alert('Personagem não encontrado.'); return false; }
  let c = typeof normalizeCharacter === 'function' ? normalizeCharacter(list[idx]) : list[idx];
  const block = rotaTransformacaoBloqueada(c, 'vampiro');
  if (block) { alert(block); return false; }
  if (isVampireChar(c)) { alert(c.nome + ' já é Vampiro.'); return false; }
  const arq = (typeof arquetipos !== 'undefined') ? arquetipos.find(a => a.id === 'vampiro') : null;
  c.arquetipoId = 'vampiro';
  c.arquetipoNome = arq ? arq.nome : '🔒 Vampiro';
  c.arquetipoBonus = arq ? arq.bonus : 'Talento + Imortal (Victory 1 pt)';
  c.arquetipoDesv = arq ? arq.desv : 'Fraqueza (luz do dia)';
  c.racaOculta = 'vampiro';
  c.vampiro = {
    desde: new Date().toISOString(),
    sire: source || 'desconhecido',
    sede: 0,
    ultimoSangramentoDia: (typeof timeState !== 'undefined' && timeState) ? (timeState.day || 1) : 1,
    lastSedeProcDay: (typeof timeState !== 'undefined' && timeState) ? (timeState.day || 1) : 1,
    pacote: 'victory_1pt'
  };
  c.vantagens = Array.isArray(c.vantagens) ? c.vantagens.slice() : [];
  c.desvantagens = Array.isArray(c.desvantagens) ? c.desvantagens.slice() : [];
  VAMP_VANT_BASE.forEach(v => { if (!c.vantagens.includes(v)) c.vantagens.push(v); });
  VAMP_DESV_BASE.forEach(d => { if (!c.desvantagens.includes(d)) c.desvantagens.push(d); });
  c.fraquezaDetail = { tipo: 'Luz do dia', comum: true };
  c.pontoFracoDetail = c.pontoFracoDetail || 'Estaca no coração / fogo ritual';
  if (!c.tipoDanoPadrao || c.tipoDanoPadrao === 'Pancada') c.tipoDanoPadrao = 'Sombrio';
  if (typeof getCharResources === 'function') {
    const res = getCharResources(c);
    c.paMax = res.pa; c.pmMax = res.pm; c.pvMax = res.pv;
    if (typeof c.pvAtual !== 'number') c.pvAtual = c.pvMax;
    if (typeof c.pmAtual !== 'number') c.pmAtual = c.pmMax;
  }
  c.biografia = (c.biografia || '') + '\\n\\n[Beijo Vampírico — ' + new Date().toLocaleString('pt-BR') + '] Origem: ' + (source || '—') + '. Arquétipo Victory 1 pt. Poderes extras = vantagens futuras.';
  list[idx] = c;
  setSaved(list);
  try { changeReputation('luz_vermelha', 10, c.nome + ' aceitou o Beijo', true); } catch (e) {}
  try { changeReputation('submundo', 5, c.nome + ' abraçou a noite', true); } catch (e) {}
  try { changeReputation('veu_prateado', -25, c.nome + ' cheira a Seraphine', true); } catch (e) {}
  try { changeReputation('igreja', -8, c.nome + ' tornou-se Vampiro', true); } catch (e) {}
  alert('🩸 ' + c.nome + ' tornou-se VAMPIRO (3DeT Victory, 1 pt).\\n\\nTalento + Imortal + Fraqueza (luz do dia).\\nPoderes clássicos: compre com XP depois.\\n\\nO Véu Prateado e Selene passam a tratá-lo com hostilidade.');
  return true;
}

function transformarPersonagemEmLobisomem(charId, source) {
  const list = typeof getSaved === 'function' ? getSaved() : [];
  const idx = list.findIndex(c => c.id === charId);
  if (idx < 0) { alert('Personagem não encontrado.'); return false; }
  let c = typeof normalizeCharacter === 'function' ? normalizeCharacter(list[idx]) : list[idx];
  const block = rotaTransformacaoBloqueada(c, 'licantropo');
  if (block) { alert(block); return false; }
  if (isWerewolfChar(c)) { alert(c.nome + ' já é Licantropo.'); return false; }
  const arq = (typeof arquetipos !== 'undefined') ? arquetipos.find(a => a.id === 'licantropo') : null;
  c.arquetipoId = 'licantropo';
  c.arquetipoNome = arq ? arq.nome : '🐺 Licantropo';
  c.arquetipoBonus = arq ? arq.bonus : 'Talento + Transformação';
  c.arquetipoDesv = arq ? arq.desv : 'Fraqueza (prata)';
  c.racaOculta = 'licantropo';
  c.lobisomem = {
    desde: new Date().toISOString(),
    sire: source || 'desconhecido',
    gatilho: 'Lua cheia', // padrão; mesa pode mudar
    formaFera: false,
    pacote: 'victory_espelho_1pt'
  };
  c.vantagens = Array.isArray(c.vantagens) ? c.vantagens.slice() : [];
  c.desvantagens = Array.isArray(c.desvantagens) ? c.desvantagens.slice() : [];
  LOBO_VANT_BASE.forEach(v => { if (!c.vantagens.includes(v)) c.vantagens.push(v); });
  LOBO_DESV_BASE.forEach(d => { if (!c.desvantagens.includes(d)) c.desvantagens.push(d); });
  c.fraquezaDetail = { tipo: 'Prata', comum: false };
  c.pontoFracoDetail = c.pontoFracoDetail || 'Prata no coração / magia de contenção';
  if (typeof getCharResources === 'function') {
    const res = getCharResources(c);
    c.paMax = res.pa; c.pmMax = res.pm; c.pvMax = res.pv;
    if (typeof c.pvAtual !== 'number') c.pvAtual = c.pvMax;
  }
  c.biografia = (c.biografia || '') + '\\n\\n[Marca Lupina — ' + new Date().toLocaleString('pt-BR') + '] Origem: ' + (source || '—') + '. Gatilho: Lua cheia. Poderes extras = XP.';
  list[idx] = c;
  setSaved(list);
  try { changeReputation('veu_prateado', 10, c.nome + ' aceitou a Marca', true); } catch (e) {}
  try { changeReputation('nobreza', 3, c.nome + ' ligado ao Véu', true); } catch (e) {}
  try { changeReputation('luz_vermelha', -25, c.nome + ' cheira a Selene', true); } catch (e) {}
  try { changeReputation('submundo', -5, c.nome + ' escolheu a matilha', true); } catch (e) {}
  alert('🐺 ' + c.nome + ' tornou-se LICANTROPO / LOBISOMEM (1 pt).\\n\\nTalento + Transformação + Fraqueza (prata).\\nGatilho padrão: Lua cheia.\\n\\nA Luz Vermelha e Seraphine passam a tratá-lo com hostilidade.');
  return true;
}

function tentarTransformacaoVampirica(charId, via, npcId) {
  const list = getSaved();
  const c = list.find(x => x.id === charId);
  if (!c) { alert('Selecione/salve o herói.'); return; }
  const block = rotaTransformacaoBloqueada(c, 'vampiro');
  if (block) { alert(block); return; }
  if (isVampireChar(c)) { alert('Já é Vampiro.'); return; }

  if (via === 'seraphine') {
    const st = typeof getLuzCasaState === 'function' ? getLuzCasaState() : { confianca: 0 };
    if ((st.confianca || 0) < 70) {
      alert((typeof LUZ_DONA !== 'undefined' ? LUZ_DONA.nome : 'A Dona') + ': “A noite não se oferece a qualquer um.”\\n(Confiança ≥ 70)');
      return;
    }
    if (!confirm('Madame Seraphine oferece o Beijo.\\n\\n' + c.nome + ' → Vampiro (Victory 1 pt: Talento, Imortal, Fraqueza luz do dia).\\nPoderes extras depois com XP.\\nO Véu Prateado se tornará hostil.\\n\\nAceitar?')) return;
    transformarPersonagemEmVampiro(charId, 'Madame Seraphine');
    if (typeof luzAjustarConfianca === 'function') luzAjustarConfianca(5, 'Ofereceu o Beijo ao PJ');
    return;
  }
  if (via === 'progenie') {
    const n = (typeof getNpcs === 'function' ? getNpcs() : []).find(x => x.id === npcId);
    if (!n || !n.progenieSeraphine) { alert('Só a progênie de Seraphine pode oferecer isso.'); return; }
    if ((n.afeto || 0) < 80) {
      alert(n.nome + ': “Ainda não.” (Afeto ≥ 80)');
      return;
    }
    if (!confirm(n.nome + ' oferece o Beijo da linhagem de Seraphine.\\n\\n' + c.nome + ' → Vampiro (Victory 1 pt).\\n\\nAceitar?')) return;
    transformarPersonagemEmVampiro(charId, 'Progênie: ' + n.nome);
    const npcs = getNpcs();
    const i = npcs.findIndex(x => x.id === npcId);
    if (i >= 0) { npcs[i].afeto = Math.min(100, (npcs[i].afeto || 0) + 5); setNpcs(npcs); }
    return;
  }
  if (via === 'manual') {
    if (!confirm('Aplicar Vampiro Victory (1 pt) em ' + c.nome + '?')) return;
    transformarPersonagemEmVampiro(charId, 'manual/mesa');
  }
}

function tentarTransformacaoLupinica(charId, via, npcId) {
  const list = getSaved();
  const c = list.find(x => x.id === charId);
  if (!c) { alert('Selecione/salve o herói.'); return; }
  const block = rotaTransformacaoBloqueada(c, 'licantropo');
  if (block) { alert(block); return; }
  if (isWerewolfChar(c)) { alert('Já é Licantropo.'); return; }

  if (via === 'selene') {
    const st = typeof getVeuCasaState === 'function' ? getVeuCasaState() : { confianca: 0 };
    if ((st.confianca || 0) < 70) {
      alert('Selene Drae: “A matilha não marca estranhos.”\\n(Confiança da Alfa ≥ 70)');
      return;
    }
    if (!confirm('Selene oferece a Marca.\\n\\n' + c.nome + ' → Licantropo (1 pt: Talento, Transformação, Fraqueza prata).\\nA Luz Vermelha se tornará hostil.\\n\\nAceitar?')) return;
    transformarPersonagemEmLobisomem(charId, 'Selene Drae');
    if (typeof veuAjustarConfianca === 'function') veuAjustarConfianca(5, 'Ofereceu a Marca ao PJ');
    return;
  }
  if (via === 'matilha') {
    const n = (typeof getNpcs === 'function' ? getNpcs() : []).find(x => x.id === npcId);
    if (!n || !n.matilhaSelene) { alert('Só a matilha de Selene pode oferecer a Marca.'); return; }
    if ((n.afeto || 0) < 80) {
      alert(n.nome + ': “Ainda não é da matilha.” (Afeto ≥ 80)');
      return;
    }
    if (!confirm(n.nome + ' quer que Selene o marque.\\n\\n' + c.nome + ' → Licantropo.\\n\\nAceitar?')) return;
    transformarPersonagemEmLobisomem(charId, 'Matilha: ' + n.nome);
    const npcs = getNpcs();
    const i = npcs.findIndex(x => x.id === npcId);
    if (i >= 0) { npcs[i].afeto = Math.min(100, (npcs[i].afeto || 0) + 5); setNpcs(npcs); }
    return;
  }
  if (via === 'manual') {
    if (!confirm('Aplicar Licantropo (1 pt) em ' + c.nome + '?')) return;
    transformarPersonagemEmLobisomem(charId, 'manual/mesa');
  }
}

/** Alimentar-se de sangue (fora de combate) — reduz Sede e pode curar */
function alimentarVampiro(charId) {
  const list = getSaved();
  const idx = list.findIndex(c => c.id === charId);
  if (idx < 0) return;
  let c = list[idx];
  if (!isVampireChar(c)) { alert('Não é Vampiro.'); return; }
  c.vampiro = c.vampiro || { sede: 0 };
  const dia = (typeof timeState !== 'undefined' && timeState) ? (timeState.day || 1) : 1;
  c.vampiro.sede = 0;
  c.vampiro.ultimoSangramentoDia = dia;
  const res = typeof getCharResources === 'function' ? getCharResources(c) : null;
  if (res) {
    c.pvMax = res.pv; c.pmMax = res.pm;
    c.pvAtual = Math.min(res.pv, (c.pvAtual || 0) + Math.max(3, Math.floor(res.pv * 0.25)));
    c.pmAtual = Math.min(res.pm, (c.pmAtual || 0) + 2);
  }
  if (c.status === 'faminto' || c.status === 'ferido') c.status = 'normal';
  list[idx] = c;
  setSaved(list);
  try { if (typeof advancePeriod === 'function') advancePeriod(true); } catch (e) {}
  alert(`🩸 ${c.nome} alimentou-se.\nSede zerada. PV/PM recuperados parcialmente.\n(+1 período do dia)`);
  if (viewingId === charId && typeof openView === 'function') openView(charId);
}

/** Processa sede ao avançar dia de campanha */
function processarSedeVampiricaNoDia() {
  const list = typeof getSaved === 'function' ? getSaved() : [];
  let changed = false;
  const dia = (typeof timeState !== 'undefined' && timeState) ? (timeState.day || 1) : 1;
  list.forEach((c, i) => {
    if (!isVampireChar(c)) return;
    c.vampiro = c.vampiro || { sede: 0, ultimoSangramentoDia: dia };
    const ultimo = c.vampiro.ultimoSangramentoDia || dia;
    if (dia > ultimo) {
      c.vampiro.sede = Math.min(5, (c.vampiro.sede || 0) + (dia - ultimo));
      c.vampiro.ultimoSangramentoDia = dia; // marca processamento; alimentar reseta sede e dia
      // na verdade ultimoSangramentoDia should only update on feed - use lastProcessedDay
    }
  });
  // Better logic with lastProcessedDay
  list.forEach((c, i) => {
    if (!isVampireChar(c)) return;
    c.vampiro = c.vampiro || { sede: 0 };
    const lastProc = c.vampiro.lastSedeProcDay || c.vampiro.ultimoSangramentoDia || dia;
    if (dia > lastProc) {
      c.vampiro.sede = Math.min(5, (c.vampiro.sede || 0) + (dia - lastProc));
      c.vampiro.lastSedeProcDay = dia;
      if ((c.vampiro.sede || 0) >= 3) c.status = c.status === 'morto' ? 'morto' : 'faminto';
      list[i] = c;
      changed = true;
    }
  });
  if (changed) setSaved(list);
}

function penalidadeSedeVampiro(c) {
  if (!isVampireChar(c) || !c.vampiro) return 0;
  const s = c.vampiro.sede || 0;
  if (s >= 5) return -3;
  if (s >= 3) return -2;
  if (s >= 1) return -1;
  return 0;
}

function penalidadeSolVampiro(c) {
  if (!isVampireChar(c)) return 0;
  if (!personagemTemVantagem(c, 'Noctívago') && !(c.desvantagens || []).includes('Noctívago')) return 0;
  try {
    if (typeof timeState === 'undefined' || !timeState) return 0;
    const p = timeState.periodIndex || 0; // 0 Manhã, 1 Tarde, 2 Noite, 3 Madrugada
    if (p === 0 || p === 1) return -2; // sol
  } catch (e) {}
  return 0;
}

function modificadorVampiroCombate(fighter) {
  // fighter may be battle copy — check vantagens array and vampiro flag
  let mod = 0;
  const like = fighter;
  if (!like) return 0;
  if (like.vampiro || like.arquetipoId === 'vampiro' || (like.vantagens || []).includes('Mordida de Sangue')) {
    // map sede from saved if possible
    if (like.id && typeof getSaved === 'function') {
      const saved = getSaved().find(x => x.id === like.id);
      if (saved) {
        mod += penalidadeSedeVampiro(saved);
        mod += penalidadeSolVampiro(saved);
      }
    }
    if ((like.vantagens || []).includes('Força Sobrenatural') || (like.vantagens || []).includes('Velocidade Sobrenatural')) {
      // small passive already represented by attrs; no extra flat needed
    }
  }
  return mod;
}


function changeAttr(attr, delta) {
  if (attr === 'P') P = Math.max(0, P + delta);
  if (attr === 'H') H = Math.max(0, H + delta);
  if (attr === 'R') R = Math.max(0, R + delta);
  document.getElementById('valP').textContent = P;
  document.getElementById('valH').textContent = H;
  document.getElementById('valR').textContent = R;
  updateAll();
}

function changeXP(d) {
  XP = Math.max(0, XP + d);
  // Conversão automática: a cada 10 XP → +1 ponto de personagem
  let pontosGanhos = 0;
  while (XP >= 10) {
    XP -= 10;
    maxPoints += 1;
    pontosGanhos++;
  }
  if (pontosGanhos > 0) {
    // Atualiza o nível visual se cruzar limiares
    if (maxPoints >= 35) levelLabel = 'Veterano';
    else if (maxPoints >= 20) levelLabel = 'Herói';
    else levelLabel = 'Iniciante';
    document.getElementById('levelName').textContent = levelLabel;
    document.getElementById('pointsSpent').textContent = calcPoints().spent + ' / ' + maxPoints;
    // Atualiza botões de nível visualmente
    document.querySelectorAll('.level-btn').forEach(b => b.classList.remove('active'));
    if (maxPoints >= 35) document.getElementById('lvl35')?.classList.add('active');
    else if (maxPoints >= 20) document.getElementById('lvl20')?.classList.add('active');
    else document.getElementById('lvl10')?.classList.add('active');
    alert(`🎉 ${pontosGanhos} ponto(s) de personagem ganho(s)!\nOrçamento agora: ${maxPoints} pts\nXP restante: ${XP}`);
  }
  document.getElementById('valXP').textContent = XP;
  updateAll();
}

/** Converte XP de um personagem salvo (a cada 10 XP = +1 maxPoints) */
function convertXpToPoints(char) {
  if (!char) return { pontosGanhos: 0, msg: '' };
  let xp = char.XP || 0;
  let pontosGanhos = 0;
  while (xp >= 10) {
    xp -= 10;
    char.maxPoints = (char.maxPoints || 10) + 1;
    pontosGanhos++;
  }
  char.XP = xp;
  if (char.maxPoints >= 35) char.levelLabel = 'Veterano';
  else if (char.maxPoints >= 20) char.levelLabel = 'Herói';
  else char.levelLabel = 'Iniciante';
  return {
    pontosGanhos,
    msg: pontosGanhos > 0
      ? ` (+${pontosGanhos} ponto(s) de personagem → orçamento ${char.maxPoints} pts, XP restante ${xp})`
      : ''
  };
}

function togglePericia(cb) { cb.checked ? selectedPericias.add(cb.value) : selectedPericias.delete(cb.value); updateAll(); }
function toggleVantagem(cb) { cb.checked ? selectedVantagens.add(cb.value) : selectedVantagens.delete(cb.value); updateAll(); }
function toggleDesvantagem(cb) { cb.checked ? selectedDesvantagens.add(cb.value) : selectedDesvantagens.delete(cb.value); updateAll(); }

function addTag(type) {
  const inp = document.getElementById(type === 'tec' ? 'tecInput' : 'artInput');
  const v = inp.value.trim(); if (!v) return;
  if (type === 'tec') tecnicas.push(v); else artefatos.push(v);
  inp.value = '';
  renderTags();
}

function removeTag(type, i) {
  if (type === 'tec') tecnicas.splice(i, 1); else artefatos.splice(i, 1);
  renderTags();
}

function renderTags() {
  document.getElementById('tecTags').innerHTML = tecnicas.map((t, i) => '<span class="tag">' + esc(t) + ' <span class="x" onclick="removeTag(\'tec\',' + i + ')">×</span></span>').join('');
  document.getElementById('artTags').innerHTML = artefatos.map((t, i) => '<span class="tag">' + esc(t) + ' <span class="x" onclick="removeTag(\'art\',' + i + ')">×</span></span>').join('');
}

function onImageSelect(e) {
  const f = e.target.files[0]; if (!f) return;
  if (f.size > 1.5 * 1024 * 1024) { alert('Imagem deve ter até 1,5 MB'); return; }
  const r = new FileReader();
  r.onload = ev => { charImage = ev.target.result; showImg(true); };
  r.readAsDataURL(f);
}

function removeImage() {
  charImage = null;
  document.getElementById('imgInput').value = '';
  showImg(false);
}

function showImg(on) {
  document.getElementById('imgPreview').style.display = on ? 'block' : 'none';
  document.getElementById('imgPlaceholder').style.display = on ? 'none' : 'flex';
  if (on) document.getElementById('imgPreview').src = charImage;
}

/* ===== [RETRATOS] linhas originais 2573-3117 ===== */
/* ==================== RETRATOS (pastas externas) ====================
 * Pasta principal (qualquer nome):
 *   3DeT-....html
 *   retratos/Feminino/feminina1.jpeg …
 * No celular, Chrome/Safari em file:// frequentemente bloqueiam subpastas.
 * Use «Abrir arquivo da pasta» se as miniaturas falharem.
 */
const RETRATOS_CATALOG = {
  F: [
    { id: 'fem1', label: 'Feminina 1', src: 'retratos/Feminino/feminina1.jpeg', alts: [
      'retratos/Feminino/feminina1.jpg', 'retratos/Feminino/feminina1.png',
      'retratos/feminino/feminina1.jpeg', 'Retratos/Feminino/feminina1.jpeg'
    ]},
    { id: 'fem2', label: 'Feminina 2', src: 'retratos/Feminino/feminina2.jpeg', alts: [
      'retratos/Feminino/feminina2.jpg', 'retratos/Feminino/feminina2.png',
      'retratos/feminino/feminina2.jpeg'
    ]},
    { id: 'fem3', label: 'Feminina 3', src: 'retratos/Feminino/feminina3.jpeg', alts: [
      'retratos/Feminino/feminina3.jpg', 'retratos/Feminino/feminina3.png',
      'retratos/feminino/feminina3.jpeg'
    ]}
  ],
  M: [],
  NPCs: {}
};

function getHtmlFolderBase() {
  try {
    return (document.location.href || '').replace(/[?#].*$/, '').replace(/[^/\\]*$/, '');
  } catch (e) { return ''; }
}

function candidatasUrlRetrato(relPath) {
  const base = getHtmlFolderBase();
  const list = [];
  const add = (p) => { if (p && list.indexOf(p) < 0) list.push(p); };
  add(relPath);
  add('./' + relPath);
  if (base) add(base + relPath);
  return list;
}

function onGeneroChange() {}

function getRetratosPorGenero(genero) {
  if (genero === 'F') return RETRATOS_CATALOG.F || [];
  if (genero === 'M') return RETRATOS_CATALOG.M || [];
  return [];
}

function tentarCarregarRetrato(item, onOk, onFail) {
  const rels = [item.src].concat(item.alts || []);
  const urls = [];
  rels.forEach(r => candidatasUrlRetrato(r).forEach(u => { if (urls.indexOf(u) < 0) urls.push(u); }));
  let i = 0;
  function next() {
    if (i >= urls.length) { if (onFail) onFail(urls); return; }
    const url = urls[i++];
    const img = new Image();
    img.onload = function () { if (onOk) onOk(url); };
    img.onerror = function () { next(); };
    img.src = url;
  }
  next();
}

function abrirGaleriaRetratos() {
  const gEl = document.getElementById('charGenero');
  const genero = gEl ? gEl.value : '';
  if (genero !== 'F' && genero !== 'M') {
    alert('Selecione o Gênero (Feminino ou Masculino) antes de abrir os retratos.');
    return;
  }
  const lista = getRetratosPorGenero(genero);
  const pasta = genero === 'F' ? 'retratos/Feminino/' : 'retratos/Masculino/';
  const base = getHtmlFolderBase();
  const protocolo = (document.location.protocol || '').toLowerCase();

  const old = document.getElementById('retratoGalleryOverlay');
  if (old) old.remove();

  let bodyHtml = '';
  if (!lista.length) {
    bodyHtml = `<p style="text-align:center;color:var(--muted);padding:24px;font-size:1rem;">sem imagens</p>
      <p style="text-align:center;font-size:0.8rem;color:var(--muted);">Nenhuma entrada cadastrada para <code>${esc(pasta)}</code>.</p>`;
  } else {
    bodyHtml = `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(100px,1fr));gap:10px;">` +
      lista.map((item, i) => `
        <button type="button" class="btn btn-outline" style="padding:8px;display:flex;flex-direction:column;align-items:center;gap:6px;"
          onclick="selecionarRetratoPorIndice('${genero}',${i})">
          <img data-retrato-idx="${i}" data-retrato-genero="${genero}" src="${esc(item.src)}" alt="${esc(item.label)}"
            style="width:88px;height:88px;object-fit:cover;border-radius:8px;background:#222;"
            onerror="this.onerror=null;this.style.opacity=0.3;var s=this.nextElementSibling;if(s)s.style.display='block';">
          <span style="display:none;font-size:0.72rem;color:#f87171;">sem imagens</span>
          <span style="font-size:0.78rem;">${esc(item.label)}</span>
        </button>`).join('') +
      `</div>`;
  }

  const dica = protocolo === 'file:'
    ? `<p style="font-size:0.75rem;color:#fbbf24;margin-top:10px;line-height:1.4;">
        ⚠️ Modo arquivo local. No celular, o navegador pode <strong>bloquear</strong> imagens da subpasta.
        Se falhar: use <strong>Abrir arquivo da pasta</strong> (escolhe feminina1.jpeg etc.) ou tente o Firefox.
      </p>` : '';

  const html = `
    <div id="retratoGalleryOverlay" style="position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:10000;display:flex;align-items:center;justify-content:center;padding:16px;"
      onclick="if(event.target===this)fecharGaleriaRetratos()">
      <div class="card" style="max-width:440px;width:100%;max-height:85vh;overflow-y:auto;border-color:#ec4899;" onclick="event.stopPropagation()">
        <h2 style="color:#ec4899;margin-bottom:6px;">🖼️ Retratos — ${genero === 'F' ? 'Feminino' : 'Masculino'}</h2>
        <p style="font-size:0.78rem;color:var(--muted);margin-bottom:8px;line-height:1.4;">
          Esperado: <code>${esc(pasta)}</code><br>
          HTML em: <code style="word-break:break-all;">${esc(base || document.location.href || '—')}</code>
        </p>
        ${bodyHtml}
        ${dica}
        <div style="margin-top:12px;display:flex;flex-direction:column;gap:8px;">
          <label class="btn btn-sm" style="cursor:pointer;text-align:center;background:#22d3ee;color:#000;">
            📂 Abrir arquivo da pasta (sempre funciona)
            <input type="file" accept="image/*" style="display:none" onchange="onRetratoArquivoLocal(event)">
          </label>
          <button class="btn btn-sm btn-outline" onclick="diagnosticarRetratos('${genero}')">🔍 Diagnosticar caminhos</button>
          <button class="btn btn-outline" onclick="fecharGaleriaRetratos()">Fechar</button>
        </div>
      </div>
    </div>`;
  document.body.insertAdjacentHTML('beforeend', html);

  setTimeout(function () {
    try {
      lista.forEach(function (item, i) {
        const img = document.querySelector('img[data-retrato-idx="' + i + '"][data-retrato-genero="' + genero + '"]');
        if (!img) return;
        tentarCarregarRetrato(item, function (url) {
          img.src = url;
          img.style.opacity = '1';
          const s = img.nextElementSibling;
          if (s) s.style.display = 'none';
        }, function () {
          img.style.opacity = '0.3';
          const s = img.nextElementSibling;
          if (s) { s.style.display = 'block'; s.textContent = 'sem imagens'; }
        });
      });
    } catch (e) {}
  }, 40);
}

function fecharGaleriaRetratos() {
  const el = document.getElementById('retratoGalleryOverlay');
  if (el) el.remove();
}

function onRetratoArquivoLocal(e) {
  const f = e.target.files && e.target.files[0];
  if (!f) return;
  if (f.size > 2.5 * 1024 * 1024) { alert('Imagem muito grande (máx. ~2,5 MB).'); return; }
  const r = new FileReader();
  r.onload = function (ev) {
    charImage = ev.target.result;
    showImg(true);
    fecharGaleriaRetratos();
  };
  r.readAsDataURL(f);
}

function diagnosticarRetratos(genero) {
  const lista = getRetratosPorGenero(genero || 'F');
  const base = getHtmlFolderBase();
  let msg = 'Diagnóstico\n\nPágina: ' + (document.location.href || '—') +
    '\nPasta base: ' + (base || '—') +
    '\nProtocolo: ' + (document.location.protocol || '—') + '\n\n';
  if (!lista.length) { alert(msg + 'Lista vazia no HTML.'); return; }
  let pending = lista.length;
  const lines = [];
  lista.forEach(function (item) {
    tentarCarregarRetrato(item, function (url) {
      lines.push('OK ' + item.label + '\n  ' + url);
      pending--;
      if (pending <= 0) alert(msg + lines.join('\n\n'));
    }, function (tried) {
      lines.push('FALHOU ' + item.label + '\n  ' + (tried && tried[0] ? tried[0] : item.src));
      pending--;
      if (pending <= 0) alert(msg + lines.join('\n\n') +
        '\n\n1) HTML e pasta retratos/ juntos\n2) Feminino com F maiúsculo\n3) feminina1.jpeg\n4) No celular use «Abrir arquivo da pasta»');
    });
  });
}

function selecionarRetratoPorIndice(genero, idx) {
  const lista = getRetratosPorGenero(genero);
  const item = lista[idx];
  if (!item || !item.src) { alert('sem imagens'); return; }
  tentarCarregarRetrato(item, function (url) {
    charImage = item.src;
    showImg(true);
    try {
      document.getElementById('imgPreview').src = url;
      document.getElementById('imgPreview').style.display = 'block';
      document.getElementById('imgPlaceholder').style.display = 'none';
    } catch (e) {}
    fecharGaleriaRetratos();
  }, function () {
    alert('sem imagens\n\nNão carregou: ' + item.src +
      '\n\nUse «Abrir arquivo da pasta» e escolha o JPEG dentro de retratos/Feminino/');
  });
}

function updateBioCount() {
  document.getElementById('bioCount').textContent = document.getElementById('biografia').value.length;
}

function calcPoints() {
  let spent = P + H + R;
  spent += currentArchetype.custo;
  spent += selectedPericias.size * 2;
  // vantagens normais (não empilháveis)
  selectedVantagens.forEach(vName => {
    if (vName === '+Vida' || vName === '+Mana' || vName === '+Ação') return;
    const vObj = vantagens.find(x => x.nome === vName);
    if (vObj) spent += vObj.custo;
  });
  // vantagens empilháveis
  spent += (stackCounts['+Vida'] || 0) * 1;
  spent += (stackCounts['+Mana'] || 0) * 1;
  spent += (stackCounts['+Ação'] || 0) * 1;
  let desvPts = 0;
  selectedDesvantagens.forEach(dName => {
    if (dName === 'Fraqueza') {
      desvPts += fraquezaDetail.comum ? -2 : -1;
      return;
    }
    const dObj = desvantagens.find(x => x.nome === dName);
    if (dObj) desvPts += dObj.custo;
  });
  spent += desvPts;
  return { spent, desvPts };
}

function updateAll() {
  const res = calcResources(P, H, R, [...selectedVantagens]);
  // força uso dos stackCounts atuais
  const pa = Math.max(0, P + (stackCounts['+Ação'] || 0) * 2);
  const pm = (H === 0 ? 1 : H * 5) + (stackCounts['+Mana'] || 0) * 10;
  const pv = (R === 0 ? 1 : R * 5) + (stackCounts['+Vida'] || 0) * 10;
  document.getElementById('paVal').textContent = pa;
  document.getElementById('pmVal').textContent = pm;
  document.getElementById('pvVal').textContent = pv;
  // atualiza labels dos contadores empilháveis se existirem
  ['+Vida','+Mana','+Ação'].forEach(n => {
    const el = document.getElementById('stack_' + n.replace('+','plus'));
    if (el) el.textContent = stackCounts[n] || 0;
  });
  const { spent, desvPts } = calcPoints();
  const ptsBox = document.getElementById('pointsBox');
  document.getElementById('pointsSpent').textContent = spent + ' / ' + maxPoints;
  document.getElementById('desvLimit').textContent = desvPts + ' / -2';
  if (spent > maxPoints) ptsBox.classList.add('over');
  else ptsBox.classList.remove('over');
  const orc = document.getElementById('orcamentoDisplay');
  if (orc) orc.textContent = maxPoints;
  // mostra/esconde detalhe de Fraqueza / Ponto Fraco
  const fwBox = document.getElementById('fraquezaDetailBox');
  if (fwBox) fwBox.style.display = selectedDesvantagens.has('Fraqueza') ? 'block' : 'none';
  const pfBox = document.getElementById('pontoFracoDetailBox');
  if (pfBox) pfBox.style.display = selectedDesvantagens.has('Ponto Fraco') ? 'block' : 'none';
}

function changeStack(name, delta) {
  stackCounts[name] = Math.max(0, (stackCounts[name] || 0) + delta);
  if (stackCounts[name] > 0) selectedVantagens.add(name);
  else selectedVantagens.delete(name);
  updateAll();
}

function getSaved() {
  try {
    const arr = storeGetJSON(STORAGE_KEY, []);
    return (Array.isArray(arr) ? arr : []).map(c => normalizeCharacter(c));
  } catch (e) {
    return [];
  }
}
function setSaved(l) {
  try { storeSet(STORAGE_KEY, Array.isArray(l) ? l : []); }
  catch (e) { console.warn('setSaved falhou', e); }
}

function saveCharacter() {
  const nome = document.getElementById('nome').value.trim();
  if (!nome) { alert('Digite um nome para o personagem!'); return; }
  const { spent } = calcPoints();
  if (spent > maxPoints && !confirm('Você excedeu o limite de pontos. Salvar mesmo assim?')) return;
  const idToSave = editingId || Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const res = calcResources(P, H, R, [...selectedVantagens], stackCounts);
  const char = {
    id: idToSave, nome,
    conceito: document.getElementById('conceito').value.trim(),
    biografia: document.getElementById('biografia').value.trim(),
    maxPoints, levelLabel, escala: currentEscala,
    arquetipoId: currentArchetype.id, arquetipoNome: currentArchetype.nome,
    arquetipoBonus: currentArchetype.bonus, arquetipoDesv: currentArchetype.desv,
    P, H, R, XP,
    pericias: [...selectedPericias], vantagens: [...selectedVantagens], desvantagens: [...selectedDesvantagens],
    stackCounts: { '+Vida': stackCounts['+Vida'] || 0, '+Mana': stackCounts['+Mana'] || 0, '+Ação': stackCounts['+Ação'] || 0 },
    paMax: res.pa, pmMax: res.pm, pvMax: res.pv,
    tipoDanoPadrao: tipoDanoPadrao || 'Pancada',
    fraquezaDetail: {
      tipo: (document.getElementById('fraquezaTipo')?.value || fraquezaDetail.tipo || '').trim(),
      comum: !!(document.getElementById('fraquezaComum')?.value === '2' || fraquezaDetail.comum)
    },
    pontoFracoDetail: (document.getElementById('pontoFracoTipo')?.value || pontoFracoDetail || '').trim(),
    tecnicas: [...tecnicas], artefatos: [...artefatos], image: charImage,
    genero: (document.getElementById('charGenero') && document.getElementById('charGenero').value) || '',
    sexo: (document.getElementById('charGenero') && document.getElementById('charGenero').value) || '',
    sexoLabel: (function () {
      const g = document.getElementById('charGenero') && document.getElementById('charGenero').value;
      return g === 'F' ? 'Feminino' : (g === 'M' ? 'Masculino' : '');
    })(),
    retrato: (charImage && typeof charImage === 'string' && charImage.indexOf('retratos/') === 0) ? charImage : (charImage && String(charImage).indexOf('data:') === 0 ? '' : (charImage || '')),
    savedAt: new Date().toLocaleString('pt-BR')
  };
  let list = getSaved();
  const idx = list.findIndex(c => c.id === idToSave);
  // preserva inventário, ouro, status, mantimentos e PV atual (não são editados neste formulário)
  if (idx >= 0) {
    const prev = list[idx];
    char.inventario = prev.inventario || [];
    char.ouro = typeof prev.ouro === 'number' ? prev.ouro : 0;
    char.status = prev.status || 'normal';
    char.mantimentos = typeof prev.mantimentos === 'number' ? prev.mantimentos : 5;
    // Aparência já é sorteada só na criação — preserva; fichas antigas sem esse campo recebem a rolagem agora, uma única vez
    if (typeof prev.aparencia === 'number') {
      char.aparencia = prev.aparencia;
    } else {
      const aparRoll = (typeof rollExplodingD6 === 'function' ? rollExplodingD6().total : (1 + Math.floor(Math.random() * 6) + 1 + Math.floor(Math.random() * 6))) + 1;
      char.aparencia = Math.max(1, Math.min(10, aparRoll));
    }
    if (Array.isArray(prev.cativeiro) || prev.cativeiro) char.cativeiro = prev.cativeiro;
    if (prev.escravidao) char.escravidao = prev.escravidao;
    char.statusEffects = Array.isArray(prev.statusEffects) ? prev.statusEffects : [];
    char.injuries = Array.isArray(prev.injuries) ? prev.injuries : [];
    char.deathCount = typeof prev.deathCount === 'number' ? prev.deathCount : 0;
    char.pvMaxPenalty = typeof prev.pvMaxPenalty === 'number' ? prev.pvMaxPenalty : 0;
    if (prev.lastWill) char.lastWill = prev.lastWill;
    // ajusta PV atual se o máximo mudou (mantém proporção ou não ultrapassa o novo máximo)
    const oldMax = prev.pvMax || res.pv;
    const oldAtual = typeof prev.pvAtual === 'number' ? prev.pvAtual : oldMax;
    if (res.pv !== oldMax && oldMax > 0) {
      char.pvAtual = Math.max(0, Math.min(res.pv, Math.round(oldAtual * (res.pv / oldMax))));
    } else {
      char.pvAtual = Math.min(res.pv, oldAtual);
    }
    list[idx] = char;
  } else {
    char.inventario = [];
    char.ouro = 50; // ouro inicial para novos personagens
    char.status = 'normal';
    char.mantimentos = 5;
    char.pvAtual = res.pv;
    // Aparência (1–10): sorteada uma única vez, ao criar o personagem — 2D6+1
    const aparRoll = (typeof rollExplodingD6 === 'function' ? rollExplodingD6().total : (1 + Math.floor(Math.random() * 6) + 1 + Math.floor(Math.random() * 6))) + 1;
    char.aparencia = Math.max(1, Math.min(10, aparRoll));
    list.push(char);
  }
  setSaved(list);
  if (idx < 0) {
    const ap = typeof aparenciaBonus === 'function' ? aparenciaBonus(char.aparencia) : null;
    alert(`Personagem salvo com sucesso!\n\n✨ Aparência sorteada (2D6+1): ${char.aparencia}/10${ap ? ' — ' + ap.label : ''}`);
  } else {
    alert('Personagem salvo com sucesso!');
  }
  openView(idToSave);
}

function renderSavedList() {
  const list = getSaved().filter(c => c && !c.isTemp && !(c.id && String(c.id).startsWith('temp_enemy_')) && c.id !== 'boss_seraphine');
  const el = document.getElementById('savedList');
  if (!list.length) {
    el.innerHTML = '<div style="text-align:center; color:var(--muted); padding:40px;">Nenhum personagem salvo.<br><br><button class="btn" onclick="openNewEditor()">+ Criar Novo Personagem</button></div>';
    return;
  }
  el.innerHTML = list.map(c => `
    <div class="char-card" onclick="openView('${c.id}')">
      <div style="display:flex;gap:12px;align-items:center">
        ${(c.image || c.retrato) ? `<img src="${c.image || c.retrato}" style="width:52px;height:52px;border-radius:50%;object-fit:cover;border:2px solid var(--accent)">` : '<div style="width:52px;height:52px;border-radius:50%;background:var(--bg-input);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;color:var(--muted);font-size:.7rem;">Sem foto</div>'}
        <div>
          <h3 style="color:var(--accent); font-size:1.1rem; margin-bottom:2px;">${esc(c.nome)}</h3>
          <div style="font-size:.85rem; color:var(--muted)">
            ${esc(c.arquetipoNome || 'Humano')} · ${c.levelLabel || 'Iniciante'} (${c.maxPoints || 10}pt)<br>
            P${c.P} H${c.H} R${c.R} · Escala ${c.escala || 'Ningen'}
          </div>
        </div>
      </div>
      <div style="font-size:0.8rem; color:var(--muted); text-align:right;">Clique para abrir ➔</div>
    </div>
  `).join('');
}

function deleteCurrentCharacter() {
  if (!viewingId) return;
  if (!confirm('Tem certeza que deseja excluir este personagem?')) return;
  let list = getSaved().filter(c => c.id !== viewingId);
  setSaved(list);
  viewingId = null;
  alert('Personagem excluído.');
  goSaved();
}

function exportCurrentCharJSON() {
  if (!viewingId) return;
  const c = getSaved().find(x => x.id === viewingId);
  if (!c) return;
  const blob = new Blob([JSON.stringify(c, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${c.nome.toLowerCase().replace(/\s+/g, '_')}_3det.json`;
  a.click();
  URL.revokeObjectURL(a.href);
}

function importBackup(ev) {
  const f = ev.target.files && ev.target.files[0];
  if (!f) return;
  const r = new FileReader();
  r.onload = e => {
    try {
      const data = JSON.parse(e.target.result);
      let list = getSaved();
      if (Array.isArray(data)) list = [...list, ...data];
      else if (typeof data === 'object' && data.nome) {
        if (!data.id) data.id = Date.now().toString(36);
        list.push(data);
      } else throw new Error();
      setSaved(list);
      renderSavedList();
      alert('Personagem(ns) importado(s) com sucesso!');
    } catch (err) { alert('Arquivo JSON inválido.'); }
    ev.target.value = '';
  };
  r.readAsText(f);
}

function resetForm() {
  editingId = null;
  document.getElementById('nome').value = '';
  document.getElementById('conceito').value = '';
  document.getElementById('biografia').value = '';
  updateBioCount();
  setLevel(10);
  document.getElementById('escala').value = 'Ningen';
  onEscalaChange();
  document.getElementById('arquetipo').value = '';
  onArchetypeChange();
  try {
    const gEl = document.getElementById('charGenero');
    if (gEl) gEl.value = '';
  } catch (e) {}
  P = 0; H = 0; R = 0; XP = 0;
  document.getElementById('valP').textContent = '0';
  document.getElementById('valH').textContent = '0';
  document.getElementById('valR').textContent = '0';
  document.getElementById('valXP').textContent = '0';
  selectedPericias.clear(); selectedVantagens.clear(); selectedDesvantagens.clear();
  stackCounts = { '+Vida': 0, '+Mana': 0, '+Ação': 0 };
  tipoDanoPadrao = 'Pancada';
  fraquezaDetail = { tipo: '', comum: false };
  pontoFracoDetail = '';
  const danoSel = document.getElementById('tipoDanoPadrao');
  if (danoSel) danoSel.value = 'Pancada';
  const fwTipo = document.getElementById('fraquezaTipo');
  const fwComum = document.getElementById('fraquezaComum');
  if (fwTipo) fwTipo.value = '';
  if (fwComum) fwComum.value = '1';
  const pfTipo = document.getElementById('pontoFracoTipo');
  if (pfTipo) pfTipo.value = '';
  document.querySelectorAll('#periciasList input').forEach(x => x.checked = false);
  document.querySelectorAll('#vantagensList input').forEach(x => x.checked = false);
  document.querySelectorAll('#desvantagensList input').forEach(x => x.checked = false);
  tecnicas = []; artefatos = [];
  renderTags();
  removeImage();
  updateAll();
}

function buildLists() {
  const sel = document.getElementById('arquetipo');
  arquetipos.forEach(a => {
    if (!a.id) return;
    const o = document.createElement('option');
    o.value = a.id;
    o.textContent = a.nome + ' (' + a.custo + ' pt)';
    sel.appendChild(o);
  });
  const pL = document.getElementById('periciasList');
  pericias.forEach(p => {
    const d = document.createElement('label');
    d.className = 'check-item';
    d.innerHTML = '<input type="checkbox" value="' + p + '" onchange="togglePericia(this)"> ' + p;
    pL.appendChild(d);
  });
  const vL = document.getElementById('vantagensList');
  vantagens.forEach(v => {
    if (v.stackable) {
      const d = document.createElement('div');
      d.className = 'check-item';
      d.style.justifyContent = 'space-between';
      const idSafe = v.nome.replace('+','plus');
      d.innerHTML = `<span>${v.nome} (${v.custo}pt cada)</span>
        <span style="display:flex;align-items:center;gap:6px;">
          <button type="button" class="btn btn-sm btn-outline" onclick="changeStack('${v.nome}',-1)">−</button>
          <strong id="stack_${idSafe}" style="min-width:18px;text-align:center;color:var(--accent)">0</strong>
          <button type="button" class="btn btn-sm btn-outline" onclick="changeStack('${v.nome}',1)">+</button>
        </span>`;
      vL.appendChild(d);
    } else {
      const d = document.createElement('label');
      d.className = 'check-item';
      const tag = v.raca === 'vampiro' ? ' <span style="color:#a855f7;font-size:0.72rem;">🔒vampiro</span>' : '';
      d.innerHTML = '<input type="checkbox" value="' + v.nome + '" onchange="toggleVantagem(this)"> ' + v.nome + ' (' + v.custo + ')' + tag;
      vL.appendChild(d);
    }
  });
  const dL = document.getElementById('desvantagensList');
  desvantagens.forEach(d => {
    const el = document.createElement('label');
    el.className = 'check-item';
    const costLabel = d.nome === 'Fraqueza' ? '(-1 ou -2)' : '(' + d.custo + ')';
    const tagD = d.raca === 'vampiro' ? ' <span style="color:#a855f7;font-size:0.72rem;">🔒vampiro</span>' : '';
    el.innerHTML = '<input type="checkbox" value="' + d.nome + '" onchange="toggleDesvantagem(this)"> ' + d.nome + ' ' + costLabel + tagD;
    dL.appendChild(el);
  });
  // Tipo de dano padrão
  const danoSel = document.getElementById('tipoDanoPadrao');
  if (danoSel) {
    TIPOS_DANO.forEach(t => {
      const o = document.createElement('option');
      o.value = t; o.textContent = t;
      danoSel.appendChild(o);
    });
  }
}

function esc(s) { return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

/* ===== [EQUIPAMENTO] linhas originais 7019-7230 ===== */
/* ---------- Sistema de Equipamento (slots + bônus de combate) ---------- */
function getItemEquipSlot(item) {
  if (!item) return null;
  const ef = item.efeito || '';
  const nome = (item.nome || '').toLowerCase();
  if (ef === 'arma_aco' || /arma de aço|espada|machado|lança|adaga|arco|bastão/.test(nome)) return 'arma';
  if (ef === 'escudo_carvalho' || /escudo/.test(nome)) return 'escudo';
  if (ef === 'armadura_couro' || /armadura|couraça|cota/.test(nome)) return 'armadura';
  if (ef === 'capa_furtividade' || /capa|amuleto|anel|talismã|manto/.test(nome)) return 'acessorio';
  if (item.tipo === 'equipamento') {
    if (/arma|espada|machado|lança|adaga|arco/.test(nome)) return 'arma';
    if (/escudo/.test(nome)) return 'escudo';
    if (/armadura|couraça/.test(nome)) return 'armadura';
    return 'acessorio';
  }
  return null;
}

function findEquippedItem(char, slot) {
  const id = (char.equipado || {})[slot];
  if (!id) return null;
  return (char.inventario || []).find(i => i.id === id) || null;
}

function getEquipBonuses(char) {
  const b = {
    faFirstTurn: 0,
    faAlways: 0,
    fdBlock: 0,
    fdBlockVsRanged: 0,
    fdBlockVsCrush: 0,
    notes: []
  };
  const arma = findEquippedItem(char, 'arma');
  const escudo = findEquippedItem(char, 'escudo');
  const armadura = findEquippedItem(char, 'armadura');
  const acessorio = findEquippedItem(char, 'acessorio');

  if (arma) {
    if (arma.efeito === 'arma_aco' || /aço forjado/i.test(arma.nome || '')) {
      b.faFirstTurn += 1;
      b.notes.push('Arma: +1 FA no 1º ataque');
    }
    if (arma.faAlways) b.faAlways += Number(arma.faAlways) || 0;
    if (arma.efeito === 'arma_magica' || arma.danoTipo === 'Mágico') {
      if (!arma.faAlways) b.faAlways += 1;
      b.notes.push('Arma mágica: +1 FA · dano ' + (arma.danoTipo || 'Mágico'));
    } else if (arma.danoTipo) {
      b.notes.push('Arma: ' + (arma.nome || 'equipada') + ' · dano ' + arma.danoTipo);
    } else if (!(arma.efeito === 'arma_aco' || /aço forjado/i.test(arma.nome || ''))) {
      b.notes.push('Arma: ' + (arma.nome || 'equipada'));
    }
    b.danoTipo = arma.danoTipo || null;
  }
  if (escudo) {
    if (escudo.efeito === 'escudo_carvalho' || /carvalho/i.test(escudo.nome || '')) {
      b.fdBlockVsRanged += 1;
      b.notes.push('Escudo: +1 FD vs projéteis (Bloqueio)');
    } else {
      b.fdBlock += 1;
      b.notes.push('Escudo: +1 FD no Bloqueio');
    }
  }
  if (armadura) {
    if (armadura.efeito === 'armadura_couro' || /couro batido/i.test(armadura.nome || '')) {
      b.fdBlockVsCrush += 1;
      b.notes.push('Armadura: +1 FD vs esmagamento (Bloqueio)');
    } else {
      b.fdBlock += 1;
      b.notes.push('Armadura: +1 FD no Bloqueio');
    }
  }
  if (acessorio) {
    if (acessorio.efeito === 'capa_furtividade' || /passos silenciosos|furtividade/i.test(acessorio.nome || '')) {
      b.notes.push('Capa: especialização Furtividade');
    } else {
      b.notes.push('Acessório: ' + (acessorio.nome || 'equipado'));
    }
  }
  // Pedra de amolar (status)
  if ((char.statusEffects || []).some(s => s.id === 'pedra_amolar')) {
    b.faAlways += 1;
    b.notes.push('Pedra de Amolar: +1 FA neste ataque');
  }
  // Ferimento: mão trêmula (−1 FA no 1º ataque)
  if ((char.injuries || []).some(i => i.id === 'tremor') && !char._firstAttackDone) {
    b.faFirstTurn -= 1;
    b.notes.push('Mão trêmula: −1 FA no 1º ataque');
  }
  return b;
}

function describeEquipBonuses(char) {
  const b = getEquipBonuses(char);
  return b.notes.length ? b.notes.join(' · ') : 'nenhum';
}

function equipItem(charId, invIndex) {
  let list = getSaved();
  const idx = list.findIndex(c => c.id === charId);
  if (idx < 0) return;
  const c = normalizeCharacter(list[idx]);
  const inv = c.inventario || [];
  if (invIndex < 0 || invIndex >= inv.length) return;
  const item = inv[invIndex];
  const slot = getItemEquipSlot(item);
  if (!slot) {
    alert('Este item não pode ser equipado.');
    return;
  }
  if (!item.id) {
    item.id = 'item_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
  }
  c.equipado = c.equipado || { arma: null, escudo: null, armadura: null, acessorio: null };
  c.equipado[slot] = item.id;

  // Capa dos Passos Silenciosos → garante perícia Furtividade
  if (item.efeito === 'capa_furtividade' || /passos silenciosos/i.test(item.nome || '')) {
    c.pericias = c.pericias || [];
    if (!c.pericias.includes('Furtividade')) c.pericias.push('Furtividade');
  }

  list[idx] = c;
  setSaved(list);
  alert(`⚔️ ${c.nome} equipou «${item.nome}» no slot ${slot}.\n${describeEquipBonuses(c)}`);
}

function unequipSlot(charId, slot) {
  let list = getSaved();
  const idx = list.findIndex(c => c.id === charId);
  if (idx < 0) return;
  const c = normalizeCharacter(list[idx]);
  c.equipado = c.equipado || { arma: null, escudo: null, armadura: null, acessorio: null };
  const item = findEquippedItem(c, slot);
  c.equipado[slot] = null;
  // Remove Furtividade só se veio da capa e não há outra fonte
  if (item && (item.efeito === 'capa_furtividade' || /passos silenciosos/i.test(item.nome || ''))) {
    // mantém a perícia (personagem pode tê-la de outra origem); não remove automaticamente
  }
  list[idx] = c;
  setSaved(list);
  alert(`Removido do slot ${slot}.`);
}

/** Compra mantimentos no mercado (preço base 5 Tibar, modificado por reputação) */
function buyMantimentos(qtd) {
  const heroId = document.getElementById('marketHeroSelect').value;
  let list = getSaved();
  const idx = list.findIndex(c => c.id === heroId);
  if (idx < 0) return;
  const c = normalizeCharacter(list[idx]);
  let mod = 1.0;
  try {
    if (typeof marketPriceMod === 'function') mod = marketPriceMod();
  } catch (e) {}
  const unit = Math.max(1, Math.round(5 * mod));
  const custo = qtd * unit;
  if ((c.ouro || 0) < custo) {
    alert(`Ouro insuficiente! Precisa de ${custo} Tibar (tem ${c.ouro || 0}).`);
    return;
  }
  c.ouro -= custo;
  c.mantimentos = (c.mantimentos || 0) + qtd;
  if (c.status === 'faminto' && c.mantimentos > 0) c.status = 'normal';
  list[idx] = c;
  setSaved(list);
  alert(`✅ ${c.nome} comprou ${qtd} mantimento(s) por ${custo} Tibar.\nMantimentos: ${c.mantimentos} · Ouro: ${c.ouro}`);
  const sel = document.getElementById('marketHeroSelect');
  [...sel.options].forEach(o => {
    if (o.value === heroId) o.textContent = `${c.nome} (${c.ouro} Tibar)`;
  });
  renderMarketInventory();
}

function sellItem(heroId, itemIndex) {
  let list = getSaved();
  const idx = list.findIndex(c => c.id === heroId);
  if (idx < 0) return;
  const c = normalizeCharacter(list[idx]);
  const inv = c.inventario || [];
  if (itemIndex < 0 || itemIndex >= inv.length) return;
  const item = inv[itemIndex];
  let mod = 1.0;
  try {
    if (typeof marketPriceMod === 'function') mod = marketPriceMod();
  } catch (e) {}
  const sellMult = Math.max(0.35, Math.min(0.7, 0.5 / mod));
  const sellPrice = Math.max(1, Math.floor((item.valor || 10) * sellMult));
  creditarOuroComDivida(c, sellPrice);
  if ((item.qtd || 1) > 1) {
    item.qtd -= 1;
  } else {
    // Desequipa se estava em algum slot
    if (c.equipado && item.id) {
      Object.keys(c.equipado).forEach(slot => {
        if (c.equipado[slot] === item.id) c.equipado[slot] = null;
      });
    }
    inv.splice(itemIndex, 1);
  }
  c.inventario = inv;
  list[idx] = c;
  setSaved(list);
  alert(`✅ Vendeu "${item.nome}" por ${sellPrice} Tibar!\nOuro atual de ${c.nome}: ${c.ouro} Tibar`);
  const sel = document.getElementById('marketHeroSelect');
  const opts = [...sel.options];
  opts.forEach(o => {
    if (o.value === heroId) o.textContent = `${c.nome} (${c.ouro} Tibar)`;
  });
  renderMarketInventory();
}

