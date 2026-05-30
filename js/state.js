const appState = {
  map: null,
  markers: [],
  panels: {},
  selectedSound: sounds[0],
  pickingLocation: false,
  pickedMarker: null,
  selectedGuess: null,
  round: 1,
  score: 0
};

function cachePanels() {
  appState.panels = {
    explore: document.querySelector('#explorePanel'),
    timeline: document.querySelector('#timelinePanel'),
    game: document.querySelector('#gamePanel'),
    contribute: document.querySelector('#contributePanel')
  };
}
