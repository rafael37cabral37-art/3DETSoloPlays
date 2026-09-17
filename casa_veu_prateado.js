/* ===== [CASA_VEU_PRATEADO] linhas originais 11684-11871 ===== */
/* ==================== CASA DO VÉU PRATEADO — SELENE DRAE ==================== */
const VEU_DONA = {
  nome: 'Selene Drae',
  titulo: 'Senhora do Véu Prateado',
  personalidade: 'Aristocrata de fachada, alfa de verdade. Firme, territorial, leal à matilha.',
  raca: 'licantropo',
  idadeAparente: 'jovem nobre',
  idadeReal: 200,
  aparencia: 9,
  revelada: false,
  irma: 'Madame Seraphine',
  maldicao: 'Lobo — bruxa ainda viva (A Ordem)'
};

const SELENE_BOSS = {
  id: 'boss_selene',
  nome: 'Selene Drae',
  conceito: 'Alfa do Véu Prateado · Lobisomem aristocrata',
  arquetipoId: 'licantropo',
  arquetipoNome: '🐺 Licantropo',
  arquetipoBonus: 'Talento + Transformação + forma fera',
  arquetipoDesv: 'Fraqueza (prata)',
  escala: 'Sugoi',
  P: 7, H: 6, R: 6,
  aparencia: 9,
  XP: 0, maxPoints: 20, levelLabel: 'Lenda',
  vantagens: ['Forte','Imortal','Ágil','Regeneração','Sentidos Aguçados','Carismático'],
  desvantagens: ['Fraqueza','Fúria','Infame'],
  pericias: ['Luta','Influência','Percepção','Sobrevivência','Manha'],
  fraquezaDetail: { tipo: 'Prata', comum: false },
  pontoFracoDetail: 'Prata no coração / contenção mágica na forma humana',
  tipoDanoPadrao: 'Corte',
  status: 'normal',
  ouro: 4500,
  isBoss: true,
  isTemp: true,
  biografia: 'Irmã de Madame Seraphine. Amaldiçoada com o lobo pela mesma bruxa (A Ordem). Administra o Véu Prateado. Aparência 9/10.'
};

const SELENE_MATILHA = [
  {
    id: 'npc_matilha_astrid',
    nome: 'Astrid Veld',
    sexo: 'F', sexoLabel: 'Mulher',
    classeKey: 'matilha',
    classe: 'Matilha de Selene',
    classeDesc: 'Disciplinada, guarda do Véu. Testa a lealdade de estranhos.',
    idadeId: 'adulto', idade: 'Aparente 26',
    P: 5, H: 5, R: 5,
    vantagens: ['Forte','Ágil','Sentidos Aguçados'],
    desvantagens: ['Fraqueza'],
    arquetipoId: 'licantropo', arquetipoNome: '🐺 Licantropo',
    aparencia: 8, afeto: 12,
    matilhaSelene: true, racaOculta: 'licantropo',
    recrutado: false, romance: false,
    missoesFeitas: 0, missoesOk: 0, missoesFail: 0,
    notas: 'Serva lobisomem de Selene Drae. Guarda do Véu Prateado.',
    interacoesAfetoDia: 0, interacoesAfetoDiaRef: 0
  },
  {
    id: 'npc_matilha_neris',
    nome: 'Neris Ash',
    sexo: 'F', sexoLabel: 'Mulher',
    classeKey: 'matilha',
    classe: 'Matilha de Selene',
    classeDesc: 'Impulsiva, caçadora de ruas e fronteiras.',
    idadeId: 'adulto', idade: 'Aparente 23',
    P: 5, H: 6, R: 4,
    vantagens: ['Ágil','Forte'],
    desvantagens: ['Fraqueza','Fúria'],
    arquetipoId: 'licantropo', arquetipoNome: '🐺 Licantropo',
    aparencia: 7, afeto: 10,
    matilhaSelene: true, racaOculta: 'licantropo',
    recrutado: false, romance: false,
    missoesFeitas: 0, missoesOk: 0, missoesFail: 0,
    notas: 'Caçadora da matilha. Atração perigosa.',
    interacoesAfetoDia: 0, interacoesAfetoDiaRef: 0
  },
  {
    id: 'npc_matilha_corvinne',
    nome: 'Corvinne Drae',
    sexo: 'F', sexoLabel: 'Mulher',
    classeKey: 'matilha',
    classe: 'Matilha de Selene',
    classeDesc: 'Mais próxima de Selene; política do salão aristocrático.',
    idadeId: 'maduro', idade: 'Aparente 32',
    P: 4, H: 6, R: 5,
    vantagens: ['Carismático','Gênio','Sentidos Aguçados'],
    desvantagens: ['Fraqueza'],
    arquetipoId: 'licantropo', arquetipoNome: '🐺 Licantropo',
    aparencia: 8, afeto: 8,
    matilhaSelene: true, racaOculta: 'licantropo',
    recrutado: false, romance: false,
    missoesFeitas: 0, missoesOk: 0, missoesFail: 0,
    notas: 'Confidente de Selene. Segredos do Véu e da maldição.',
    interacoesAfetoDia: 0, interacoesAfetoDiaRef: 0
  }
];

function getVeuCasaState() {
  let st = storeGetJSON(KEYS.veuCasa, null);
  if (!st || typeof st !== 'object') st = { confianca: 30, banido: false, revelada: false, historico: [] };
  if (typeof st.confianca !== 'number') st.confianca = 30;
  return st;
}
function setVeuCasaState(st) { storeSet(KEYS.veuCasa, st); }

function veuAjustarConfianca(delta, motivo) {
  const st = getVeuCasaState();
  st.confianca = Math.max(0, Math.min(100, (st.confianca || 30) + delta));
  st.historico = (st.historico || []);
  st.historico.unshift({ t: new Date().toISOString(), delta, motivo: motivo || '', conf: st.confianca });
  st.historico = st.historico.slice(0, 30);
  setVeuCasaState(st);
  const el = document.getElementById('veuConfiancaLabel');
  if (el) el.textContent = String(st.confianca);
  try { changeReputation('veu_prateado', Math.round(delta / 2), motivo || 'Véu Prateado', true); } catch (e) {}
}

function ensureSeleneMatilha() {
  const list = getNpcs();
  let changed = false;
  SELENE_MATILHA.forEach(proto => {
    if (!list.find(n => n.id === proto.id)) {
      list.push(JSON.parse(JSON.stringify(proto)));
      changed = true;
    }
  });
  if (changed) setNpcs(list);
  return getNpcs();
}

function initVeuCasaUI() {
  ensureSeleneMatilha();
  const st = getVeuCasaState();
  const el = document.getElementById('veuConfiancaLabel');
  if (el) el.textContent = String(st.confianca || 30);
  const listEl = document.getElementById('veuMatilhaList');
  if (listEl) {
    const mats = getNpcs().filter(n => n.matilhaSelene);
    listEl.innerHTML = mats.map(n => {
      const a = typeof afetoLabel === 'function' ? afetoLabel(n.afeto) : { text: '', cls: '' };
      return `<div class="char-card" style="cursor:pointer;" onclick="goTo('npcs'); setTimeout(function(){ openNpcDetail('${n.id}'); }, 200)">
        <div>
          <div style="font-weight:800;">${esc(n.nome)} <span style="color:#94a3b8;font-size:0.8rem;">🐺</span></div>
          <div style="font-size:0.8rem;color:var(--muted);">${esc(n.classeDesc || '')}</div>
          <span class="status-badge ${a.cls}" style="font-size:0.75rem;">Afeto ${n.afeto}/100</span>
        </div>
        <button class="btn btn-sm btn-outline" onclick="event.stopPropagation(); goTo('npcs'); setTimeout(function(){ openNpcDetail('${n.id}'); }, 200)">Ver</button>
      </div>`;
    }).join('') || '<p style="color:var(--muted);">Matilha ainda não carregada.</p>';
  }
  const fala = document.getElementById('veuDonaFala');
  if (fala && st.banido) {
    fala.innerHTML = '<em style="color:#f87171;">“Saia. O Véu não cobre traidores da matilha.”</em> — Selene Drae';
  }
}

function desafiarSeleneDrae() {
  const st = getVeuCasaState();
  if (st.banido && !confirm('Selene já o expulsou. Forçar confronto?')) return;
  if (!confirm('Enfrentar Selene Drae (alfa lobisomem) na Arena?')) return;
  st.revelada = true;
  st.confianca = Math.min(st.confianca || 30, 5);
  st.banido = true;
  setVeuCasaState(st);
  try { changeReputation('veu_prateado', -15, 'Desafiou Selene', true); } catch (e) {}
  try { changeReputation('nobreza', -5, 'Confronto no Véu', true); } catch (e) {}
  const boss = typeof normalizeCharacter === 'function'
    ? normalizeCharacter(JSON.parse(JSON.stringify(SELENE_BOSS)))
    : JSON.parse(JSON.stringify(SELENE_BOSS));
  const res = typeof getCharResources === 'function' ? getCharResources(boss) : { pv: 45, pm: 30, pa: 8 };
  boss.pvMax = Math.max(res.pv || 45, 40);
  boss.pmMax = Math.max(res.pm || 30, 25);
  boss.pvAtual = boss.pvMax;
  boss.pmAtual = boss.pmMax;
  boss.isTemp = true;
  boss._selene = true;
  let list = getSaved().filter(c => c.id !== boss.id);
  list.push(boss);
  setSaved(list);
  goTo('battle');
  setTimeout(function() {
    try { loadFighters(); } catch (e) {}
    alert('🐺 Selene Drae revela a fera.\\n\\nLicantropo · Aparência 9/10 · P' + boss.P + ' H' + boss.H + ' R' + boss.R + '\\n\\nNa Arena, coloque-a como INIMIGA.');
  }, 200);
}

