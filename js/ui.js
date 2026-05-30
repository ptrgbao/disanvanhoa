function openPanel(name) {
  Object.values(appState.panels).forEach(panel => panel.classList.add('hidden'));
  appState.panels[name].classList.remove('hidden');
  document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.panel === name));
  setTimeout(() => appState.map.invalidateSize(), 100);
}

function showSound(sound) {
  appState.selectedSound = sound;
  document.querySelector('#soundTitle').textContent = sound.title;
  document.querySelector('#soundCategory').textContent = sound.label;
  document.querySelector('#soundRegion').textContent = sound.region;
  document.querySelector('#soundSummary').textContent = sound.summary;
  document.querySelector('#soundStory').textContent = sound.story;
  document.querySelector('#aiResultContent').textContent = sound.ai;
}

function showToast(message) {
  const toast = document.querySelector('#toast');
  toast.textContent = message;
  toast.classList.remove('hidden');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.add('hidden'), 2400);
}

function bindUiEvents() {
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => openPanel(btn.dataset.panel));
  });

  document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', () => btn.closest('.panel').classList.add('hidden'));
  });

  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(item => item.classList.remove('active'));
      btn.classList.add('active');
      filterMarkers(btn.dataset.filter);
    });
  });

  document.querySelectorAll('.era-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.era-btn').forEach(item => item.classList.remove('active'));
      btn.classList.add('active');
      showToast(`Viewing ${btn.textContent} boundaries`);
    });
  });

  document.querySelector('#timelineSlider').addEventListener('input', event => {
    document.querySelector('#timelineContext').textContent = timelineContexts[Number(event.target.value)];
    appState.markers.forEach((marker, index) => marker.getElement()?.classList.toggle('marker-faded', Number(event.target.value) < index % 4));
  });

  document.querySelector('#playSound').addEventListener('click', () => {
    showToast(`Playing preview: ${appState.selectedSound.title}`);
  });
}