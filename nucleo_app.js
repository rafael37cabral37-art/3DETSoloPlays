/* ===== [NAVEGACAO] linhas originais 307-351 ===== */
/* ==================== NAVEGAÇÃO ==================== */
function goTo(section) {
  // Limpa inimigos temporários ao sair da arena
  if (document.getElementById('screenBattle')?.classList.contains('active') && section !== 'battle') {
    cleanupTempEnemies();
  }
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  if (section === 'main') {
    document.getElementById('screenMain').classList.add('active');
  } else if (section === 'creator') {
    document.getElementById('screenCreator').classList.add('active');
    showCreatorScreen('home');
  } else if (section === 'battle') {
    document.getElementById('screenBattle').classList.add('active');
    loadFighters();
  } else if (section === 'encounters') {
    document.getElementById('screenEncounters').classList.add('active');
    populateEncounterHeroes();
    loadCampaignLog();
    try { if (typeof renderAgendaList === 'function') renderAgendaList(); } catch (e) {}
    try { if (typeof renderFalhasPanel === 'function') renderFalhasPanel(); } catch (e) {}
    try { if (typeof renderMarcosCampanha === 'function') renderMarcosCampanha(); } catch (e) {}
    try { if (typeof renderSession30Status === 'function') renderSession30Status(); } catch (e) {}
    try { if (typeof renderPlanilhaRivaisUI === 'function') renderPlanilhaRivaisUI(); } catch (e) {}
  } else if (section === 'npcs') {
    document.getElementById('screenNpcs').classList.add('active');
    try { ensureSeraphineProgeny(); } catch (e) {}
    try { ensureSeleneMatilha(); } catch (e) {}
    try { ensureCityNpcs(); } catch (e) {}
    populateNpcHeroSelect();
    renderNpcList();
  } else if (section === 'oracle') {
    document.getElementById('screenOracle').classList.add('active');
    initOracleScreen();
  } else if (section === 'reputation') {
    document.getElementById('screenReputation').classList.add('active');
    renderReputationScreen();
  } else if (section === 'servos') {
    const el = document.getElementById('screenServos');
    if (el) el.classList.add('active');
    try { initServosScreen(); } catch (e) { console.warn(e); }
  }
  window.scrollTo(0,0);
}

/* ===== [CAPA_MENU] linhas originais 7832-7884 ===== */
/* ---------- Capa do Menu Principal ---------- */
const COVER_KEY = KEYS.cover;

function onCoverSelect(e) {
  const f = e.target.files && e.target.files[0];
  if (!f) return;
  if (f.size > 2.5 * 1024 * 1024) {
    alert('Imagem deve ter até 2,5 MB');
    e.target.value = '';
    return;
  }
  const r = new FileReader();
  r.onload = ev => {
    const data = ev.target.result;
    try {
      storeSet(COVER_KEY, data);
      applyCover(data);
    } catch (err) {
      alert('Não foi possível salvar a capa (espaço cheio). Tente uma imagem menor.');
    }
  };
  r.readAsDataURL(f);
}

function applyCover(dataUrl) {
  const img = document.getElementById('coverImg');
  const ph = document.getElementById('coverPlaceholder');
  if (!img || !ph) return;
  if (dataUrl) {
    img.src = dataUrl;
    img.style.display = 'block';
    ph.style.display = 'none';
  } else {
    img.removeAttribute('src');
    img.style.display = 'none';
    ph.style.display = 'flex';
  }
}

function removeCover() {
  storeRemove(COVER_KEY);
  applyCover(null);
  const input = document.getElementById('coverInput');
  if (input) input.value = '';
}

function loadCover() {
  try {
    const data = storeGet(COVER_KEY, null);
    if (data) applyCover(data);
  } catch (e) {}
}

