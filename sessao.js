/* ===== [CONTADORES_SESSAO] linhas originais 5325-5351 ===== */
/* ---------- Contadores de Sessão ---------- */
function updateSessionDisplays() {
  document.getElementById('victoryCountDisplay').textContent = `${sessionVictories} / ${victoryThreshold}`;
  document.getElementById('accumXpDisplay').textContent = accumulatedXp;
  document.getElementById('totalEncountersDisplay').textContent = totalEncounters;
  document.getElementById('bankedXpDisplay').textContent = totalSessionXp;
  document.getElementById('sessionXpBadge').textContent = `XP Banco: ${accumulatedXp}`;
}

function resetSessionTrackers() {
  if (!confirm('Reiniciar contadores de vitórias, XP acumulado e encontros desta sessão?')) return;
  sessionVictories = 0;
  accumulatedXp = 0;
  totalEncounters = 0;
  victoryThreshold = 3 + Math.floor(Math.random() * 5); // 3 a 7
  eventResolved = false;
  updateSessionDisplays();
  alert(`Sessão reiniciada! Nova meta de vitórias: ${victoryThreshold}`);
}

function initSessionTrackers() {
  if (victoryThreshold < 3 || victoryThreshold > 7) {
    victoryThreshold = 3 + Math.floor(Math.random() * 5);
  }
  updateSessionDisplays();
}

/* ===== [SESSAO_RAPIDA] linhas originais 5352-5447 ===== */
/* ==================== SESSÃO RÁPIDA ~30 MIN ==================== */
const SESSION30_STEPS = [
  { id: 'pacote', titulo: '🎬 Pacote Solo', desc: 'Gere uma cena + complicação no Oráculo (botão Pacote Solo).', auto: 'pacote' },
  { id: 'agenda', titulo: '📋 Agenda', desc: 'Sugira 2–3 objetivos do dia e marque o foco da sessão.', auto: 'agenda' },
  { id: 'missao_ou_encontro', titulo: '📜 Missão ou Encontro', desc: 'Peça missão a um NPC ou gere 1 encontro procedural.', auto: null },
  { id: 'combate_ou_social', titulo: '⚔️ / 🗣️ Conflito', desc: 'Resolva combate na Arena, cena social ou teste de caminho.', auto: null },
  { id: 'descanso', titulo: '😴 Descanso', desc: 'Descanso curto (ou longo se a sessão acabar à noite).', auto: null },
  { id: 'resumo', titulo: '📋 Resumo', desc: 'Abra o resumo de 3 dias no diário e anote o que ficou pendente.', auto: 'resumo' }
];

let session30State = { active: false, step: 0 };

function renderSession30Status() {
  const el = document.getElementById('session30Status');
  if (!el) return;
  if (!session30State.active) {
    el.innerHTML = 'Nenhuma sessão rápida ativa.';
    return;
  }
  const step = SESSION30_STEPS[session30State.step];
  const n = session30State.step + 1;
  const total = SESSION30_STEPS.length;
  el.innerHTML = `<strong style="color:#f59e0b;">Passo ${n}/${total}: ${step ? step.titulo : '—'}</strong><br><span style="color:var(--muted);">${step ? step.desc : ''}</span>`;
}

function iniciarSessao30() {
  if (session30State.active && !confirm('Reiniciar a sessão rápida do zero?')) return;
  session30State = { active: true, step: 0 };
  renderSession30Status();
  try {
    if (typeof appendToCampaignLog === 'function') {
      appendToCampaignLog({
        type: 'sessao30',
        title: '⏱️ Sessão rápida iniciada',
        text: 'Modo ~30 min: pacote → agenda → missão/encontro → conflito → descanso → resumo.',
        time: new Date().toLocaleString('pt-BR')
      });
    }
  } catch (e) {}
  alert('⏱️ Sessão rápida iniciada!\n\nPasso 1/' + SESSION30_STEPS.length + ': ' + SESSION30_STEPS[0].titulo + '\n' + SESSION30_STEPS[0].desc + '\n\nUse “Próximo passo” quando concluir cada etapa.');
  // Auto passo 1
  executarAutoSessao30(SESSION30_STEPS[0]);
}

function executarAutoSessao30(step) {
  if (!step || !step.auto) return;
  try {
    if (step.auto === 'pacote' && typeof gerarPacoteSoloCompleto === 'function') {
      // Oráculo pode não estar na tela — ainda gera e salva
      gerarPacoteSoloCompleto();
    } else if (step.auto === 'agenda' && typeof sugerirAgendaDoDia === 'function') {
      sugerirAgendaDoDia();
    } else if (step.auto === 'resumo' && typeof resumirDiarioUltimosDias === 'function') {
      resumirDiarioUltimosDias(3);
    }
  } catch (e) {
    console.warn('auto sessao30', e);
  }
}

function avancarSessao30() {
  if (!session30State.active) {
    alert('Inicie uma sessão rápida primeiro.');
    return;
  }
  session30State.step++;
  if (session30State.step >= SESSION30_STEPS.length) {
    session30State.active = false;
    session30State.step = 0;
    renderSession30Status();
    alert('⏱️ Sessão rápida concluída!\n\nBom momento para exportar o diário ou fazer backup.');
    try {
      if (typeof appendToCampaignLog === 'function') {
        appendToCampaignLog({
          type: 'sessao30',
          title: '⏱️ Sessão rápida concluída',
          text: 'Todos os passos do modo 30 min foram marcados.',
          time: new Date().toLocaleString('pt-BR')
        });
      }
    } catch (e) {}
    return;
  }
  const step = SESSION30_STEPS[session30State.step];
  renderSession30Status();
  executarAutoSessao30(step);
  alert('Passo ' + (session30State.step + 1) + '/' + SESSION30_STEPS.length + ':\n' + step.titulo + '\n\n' + step.desc);
}

function cancelarSessao30() {
  if (!session30State.active) return;
  if (!confirm('Cancelar a sessão rápida?')) return;
  session30State = { active: false, step: 0 };
  renderSession30Status();
}

