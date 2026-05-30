function initMap() {
  appState.map = L.map('mapContainer', { zoomControl: false }).setView([16.2, 106.4], 6);
  L.control.zoom({ position: 'bottomright' }).addTo(appState.map);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(appState.map);

  sounds.forEach(sound => {
    const marker = L.marker(sound.coords, { icon: markerIcon(sound) }).addTo(appState.map);
    marker.sound = sound;
    marker.bindPopup(`<div class="popup-title">${sound.title}</div><span class="popup-category">${sound.label}</span><p>${sound.summary}</p>`);
    marker.on('click', () => {
      if (document.querySelector('#gamePlay:not(.hidden)')) {
        selectGuess(marker);
        return;
      }
      showSound(sound);
      openPanel('explore');
    });
    appState.markers.push(marker);
  });

  addMapLabels();
  appState.map.on('click', handleMapClick);
}

function markerIcon(sound, extraClass = '') {
  return L.divIcon({
    html: `<div class="marker-icon marker-${sound.category} ${extraClass}">${sound.icon}</div>`,
    className: '',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18]
  });
}

function addMapLabels() {
  [
    ['Ha Noi', [21.04, 105.75], 'vn-label-large'],
    ['Hue', [16.5, 107.45], 'vn-label-medium'],
    ['Ho Chi Minh City', [10.84, 106.62], 'vn-label-large'],
    ['East Sea', [14.8, 112.2], 'vn-label-sea']
  ].forEach(([name, coords, cls]) => {
    L.marker(coords, {
      interactive: false,
      icon: L.divIcon({ className: `vn-label ${cls}`, html: name, iconSize: [140, 20] })
    }).addTo(appState.map);
  });

  L.marker([16.5, 112.0], {
    interactive: false,
    icon: L.divIcon({
      className: 'sovereignty-label',
      html: '<div class="sovereignty-text">Hoang Sa<br><small>Vietnam</small></div>',
      iconSize: [90, 42]
    })
  }).addTo(appState.map);
}

function filterMarkers(category) {
  appState.markers.forEach(marker => {
    const visible = category === 'all' || marker.sound.category === category;
    marker.getElement()?.classList.toggle('marker-faded', !visible);
    if (visible && !appState.map.hasLayer(marker)) marker.addTo(appState.map);
  });
}
