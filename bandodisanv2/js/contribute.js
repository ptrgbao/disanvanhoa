function startLocationPick() {
  appState.pickingLocation = true;
  document.body.classList.add('picking-location');
  appState.panels.contribute.classList.add('temporarily-hidden');
  document.querySelector('#locationPickerBanner').classList.remove('hidden');
}

function stopLocationPick() {
  appState.pickingLocation = false;
  document.body.classList.remove('picking-location');
  appState.panels.contribute.classList.remove('temporarily-hidden');
  document.querySelector('#locationPickerBanner').classList.add('hidden');
}

function handleMapClick(event) {
  if (!appState.pickingLocation) return;

  const { lat, lng } = event.latlng;
  document.querySelector('#contribLocation').textContent = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;

  if (appState.pickedMarker) appState.pickedMarker.remove();
  appState.pickedMarker = L.marker([lat, lng], {
    icon: L.divIcon({
      html: '<div class="marker-icon answer-marker">+</div>',
      className: '',
      iconSize: [36, 36],
      iconAnchor: [18, 18]
    })
  }).addTo(appState.map);

  stopLocationPick();
  showToast('Location selected');
}

function bindContributeEvents() {
  document.querySelector('#btnPickLocation').addEventListener('click', startLocationPick);
  document.querySelector('#cancelPickLocation').addEventListener('click', stopLocationPick);
  document.querySelector('#btnContribRecord').addEventListener('click', () => showToast('Recording demo started'));
  document.querySelector('#contributeForm').addEventListener('submit', event => {
    event.preventDefault();
    showToast('Contribution saved as a local demo');
  });
}
