/* ===== [INICIALIZACAO] linhas originais 14850-14875 ===== */
/* ==================== INICIALIZAÇÃO ==================== */
window.onload = async () => {
  try {
    await hydrateFromIndexedDB();
    await syncAllToIndexedDB();
  } catch (e) {
    console.warn('Storage hydrate/sync:', e);
  }
  try { loadTimeState(); } catch (e) {}
  buildLists();
  onEscalaChange();
  onArchetypeChange();
  initSessionTrackers();
  loadCover();
  updateStorageStatusUI();
  try { ensureSeraphineProgeny(); } catch (e) {}
  try { ensureSeleneMatilha(); } catch (e) {}
  try { ensureCityNpcs(); } catch (e) {}

  // Recarrega diário ao mudar nome da campanha
  const campInput = document.getElementById('campaignName');
  if (campInput) {
    campInput.addEventListener('change', loadCampaignLog);
    campInput.addEventListener('blur', loadCampaignLog);
  }
};
