const sounds = [
  {
    id: 1,
    title: 'Street Vendor Call',
    category: 'tieng_rao',
    label: 'Street calls',
    region: 'Ha Noi',
    coords: [21.0285, 105.8542],
    icon: 'R',
    summary: 'A bright morning call from a neighborhood vendor, layered with motorbikes, birds, and market chatter.',
    story: 'These calls carry small fragments of daily life: route, rhythm, product, and memory. The map collects them as cultural signals tied to place.',
    ai: 'Likely source: human voice, open street, morning market. Cultural context: neighborhood commerce and informal oral advertising.'
  },
  {
    id: 2,
    title: 'Hue Court Music',
    category: 'nhac_cu',
    label: 'Instruments',
    region: 'Hue',
    coords: [16.4637, 107.5909],
    icon: 'N',
    summary: 'Ceremonial ensemble textures with drum, bell, and plucked string gestures.',
    story: 'The sound reflects royal ritual practice and the careful handoff between performers, teachers, and community archives.',
    ai: 'Likely source: traditional ensemble. Cultural context: ceremonial performance and formal heritage education.'
  },
  {
    id: 3,
    title: 'Gong Festival Night',
    category: 'le_hoi',
    label: 'Festivals',
    region: 'Gia Lai',
    coords: [13.9833, 108.0],
    icon: 'F',
    summary: 'A circle of resonant gongs recorded during a community gathering in the Central Highlands.',
    story: 'The rhythm marks shared time: people answer one another through repeated motifs, dance, and pauses.',
    ai: 'Likely source: bronze gongs. Cultural context: highland festival, communal ritual, and oral transmission.'
  },
  {
    id: 4,
    title: 'Pottery Wheel',
    category: 'lang_nghe',
    label: 'Craft',
    region: 'Bat Trang',
    coords: [20.9779, 105.9139],
    icon: 'C',
    summary: 'Clay, water, and wheel movement recorded inside a pottery workshop.',
    story: 'Craft sounds are often quiet but distinctive. They preserve the tempo of hand skills that are hard to describe in text.',
    ai: 'Likely source: rotating wheel and wet clay. Cultural context: traditional craft village and apprenticeship.'
  },
  {
    id: 5,
    title: 'Mekong Dawn Water',
    category: 'thien_nhien',
    label: 'Nature',
    region: 'Can Tho',
    coords: [10.0452, 105.7469],
    icon: 'W',
    summary: 'Water, boats, insects, and distant market activity at sunrise.',
    story: 'Natural soundscapes show how place, livelihood, and ecology overlap in daily listening.',
    ai: 'Likely source: river edge and boat traffic. Cultural context: floating market routines and wetland life.'
  }
];

const panels = {
  explore: document.querySelector('#explorePanel'),
  timeline: document.querySelector('#timelinePanel'),
  game: document.querySelector('#gamePanel'),
  contribute: document.querySelector('#contributePanel')
};

let map;
let markers = [];
let selectedSound = sounds[0];
let pickingLocation = false;
let pickedMarker = null;
let selectedGuess = null;
let round = 1;
let score = 0;

function initMap() {
  map = L.map('mapContainer', { zoomControl: false }).setView([16.2, 106.4], 6);
  L.control.zoom({ position: 'bottomright' }).addTo(map);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  sounds.forEach(sound => {
    const marker = L.marker(sound.coords, { icon: markerIcon(sound) }).addTo(map);
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
    markers.push(marker);
  });

  addMapLabels();
  map.on('click', handleMapClick);
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
    }).addTo(map);
  });

  L.marker([16.5, 112.0], {
    interactive: false,
    icon: L.divIcon({
      className: 'sovereignty-label',
      html: '<div class="sovereignty-text">Hoang Sa<br><small>Vietnam</small></div>',
      iconSize: [90, 42]
    })
  }).addTo(map);
}

function openPanel(name) {
  Object.values(panels).forEach(panel => panel.classList.add('hidden'));
  panels[name].classList.remove('hidden');
  document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.panel === name));
  setTimeout(() => map.invalidateSize(), 100);
}

function showSound(sound) {
  selectedSound = sound;
  document.querySelector('#soundTitle').textContent = sound.title;
  document.querySelector('#soundCategory').textContent = sound.label;
  document.querySelector('#soundRegion').textContent = sound.region;
  document.querySelector('#soundSummary').textContent = sound.summary;
  document.querySelector('#soundStory').textContent = sound.story;
  document.querySelector('#aiResultContent').textContent = sound.ai;
}

function filterMarkers(category) {
  markers.forEach(marker => {
    const visible = category === 'all' || marker.sound.category === category;
    marker.getElement()?.classList.toggle('marker-faded', !visible);
    if (visible && !map.hasLayer(marker)) marker.addTo(map);
  });
}

function showToast(message) {
  const toast = document.querySelector('#toast');
  toast.textContent = message;
  toast.classList.remove('hidden');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.add('hidden'), 2400);
}

function startLocationPick() {
  pickingLocation = true;
  document.body.classList.add('picking-location');
  panels.contribute.classList.add('temporarily-hidden');
  document.querySelector('#locationPickerBanner').classList.remove('hidden');
}

function stopLocationPick() {
  pickingLocation = false;
  document.body.classList.remove('picking-location');
  panels.contribute.classList.remove('temporarily-hidden');
  document.querySelector('#locationPickerBanner').classList.add('hidden');
}

function handleMapClick(event) {
  if (!pickingLocation) return;
  const { lat, lng } = event.latlng;
  document.querySelector('#contribLocation').textContent = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  if (pickedMarker) pickedMarker.remove();
  pickedMarker = L.marker([lat, lng], {
    icon: L.divIcon({
      html: '<div class="marker-icon answer-marker">+</div>',
      className: '',
      iconSize: [36, 36],
      iconAnchor: [18, 18]
    })
  }).addTo(map);
  stopLocationPick();
  showToast('Location selected');
}

function selectGuess(marker) {
  selectedGuess = marker;
  markers.forEach(item => item.setIcon(markerIcon(item.sound)));
  marker.setIcon(markerIcon(marker.sound, 'guess-marker'));
}

function startGame() {
  round = 1;
  score = 0;
  selectedGuess = null;
  document.querySelector('#gameIntro').classList.add('hidden');
  document.querySelector('#gameResult').classList.add('hidden');
  document.querySelector('#gameSummary').classList.add('hidden');
  document.querySelector('#gamePlay').classList.remove('hidden');
  setRound();
}

function setRound() {
  const target = sounds[(round + 1) % sounds.length];
  document.querySelector('#roundNumber').textContent = round;
  document.querySelector('#scoreNumber').textContent = score;
  document.querySelector('#gamePrompt').textContent = `Which marker matches "${target.title}"?`;
  document.querySelector('#submitGuess').dataset.answer = target.id;
  selectedGuess = null;
  markers.forEach(marker => marker.setIcon(markerIcon(marker.sound)));
  showToast('Select a marker on the map');
}

function submitGuess() {
  if (!selectedGuess) {
    showToast('Choose a marker first');
    return;
  }
  const answerId = Number(document.querySelector('#submitGuess').dataset.answer);
  const correct = selectedGuess.sound.id === answerId;
  if (correct) score += 1;
  const answer = sounds.find(sound => sound.id === answerId);
  document.querySelector('#gamePlay').classList.add('hidden');
  document.querySelector('#gameResult').classList.remove('hidden');
  document.querySelector('#gameResultTitle').textContent = correct ? 'Correct' : 'Not quite';
  document.querySelector('#gameResultDetail').textContent = `Answer: ${answer.title} in ${answer.region}.`;
  markers.forEach(marker => {
    marker.setIcon(markerIcon(marker.sound, marker.sound.id === answerId ? 'answer-marker' : ''));
  });
}

function nextRound() {
  if (round >= 3) {
    document.querySelector('#gameResult').classList.add('hidden');
    document.querySelector('#gameSummary').classList.remove('hidden');
    document.querySelector('#gameFinalScore').textContent = `${score}/3`;
    document.querySelector('#gameCorrectCount').textContent = `${score} correct answer${score === 1 ? '' : 's'}`;
    return;
  }
  round += 1;
  document.querySelector('#gameResult').classList.add('hidden');
  document.querySelector('#gamePlay').classList.remove('hidden');
  setRound();
}

function bindEvents() {
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
    const contexts = [
      '1980: many recordings survive through memory and local performance rather than digital archives.',
      '2000: cassette, radio, and early digital collections preserve more urban and festival sounds.',
      '2020: mobile recordings and community archives begin making local sound heritage easier to preserve.',
      '2026: AI-assisted tagging helps communities search by place, source, and cultural context.'
    ];
    document.querySelector('#timelineContext').textContent = contexts[Number(event.target.value)];
    markers.forEach((marker, index) => marker.getElement()?.classList.toggle('marker-faded', Number(event.target.value) < index % 4));
  });

  document.querySelector('#playSound').addEventListener('click', () => {
    showToast(`Playing preview: ${selectedSound.title}`);
  });

  document.querySelector('#startGame').addEventListener('click', startGame);
  document.querySelector('#submitGuess').addEventListener('click', submitGuess);
  document.querySelector('#nextRound').addEventListener('click', nextRound);
  document.querySelector('#restartGame').addEventListener('click', startGame);
  document.querySelector('#btnPickLocation').addEventListener('click', startLocationPick);
  document.querySelector('#cancelPickLocation').addEventListener('click', stopLocationPick);
  document.querySelector('#btnContribRecord').addEventListener('click', () => showToast('Recording demo started'));
  document.querySelector('#contributeForm').addEventListener('submit', event => {
    event.preventDefault();
    showToast('Contribution saved as a local demo');
  });
}

window.addEventListener('load', () => {
  initMap();
  bindEvents();
  showSound(sounds[0]);
  setTimeout(() => {
    document.querySelector('#loadingOverlay').style.display = 'none';
    map.invalidateSize();
  }, 700);
});