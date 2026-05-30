window.addEventListener('load', () => {
  cachePanels();
  initMap();
  bindUiEvents();
  bindGameEvents();
  bindContributeEvents();
  showSound(sounds[0]);

  setTimeout(() => {
    document.querySelector('#loadingOverlay').style.display = 'none';
    appState.map.invalidateSize();
  }, 700);
});
