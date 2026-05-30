function selectGuess(marker) {
  appState.selectedGuess = marker;
  appState.markers.forEach(item => item.setIcon(markerIcon(item.sound)));
  marker.setIcon(markerIcon(marker.sound, 'guess-marker'));
}

function startGame() {
  appState.round = 1;
  appState.score = 0;
  appState.selectedGuess = null;
  document.querySelector('#gameIntro').classList.add('hidden');
  document.querySelector('#gameResult').classList.add('hidden');
  document.querySelector('#gameSummary').classList.add('hidden');
  document.querySelector('#gamePlay').classList.remove('hidden');
  setRound();
}

function setRound() {
  const target = sounds[(appState.round + 1) % sounds.length];
  document.querySelector('#roundNumber').textContent = appState.round;
  document.querySelector('#scoreNumber').textContent = appState.score;
  document.querySelector('#gamePrompt').textContent = `Which marker matches "${target.title}"?`;
  document.querySelector('#submitGuess').dataset.answer = target.id;
  appState.selectedGuess = null;
  appState.markers.forEach(marker => marker.setIcon(markerIcon(marker.sound)));
  showToast('Select a marker on the map');
}

function submitGuess() {
  if (!appState.selectedGuess) {
    showToast('Choose a marker first');
    return;
  }

  const answerId = Number(document.querySelector('#submitGuess').dataset.answer);
  const correct = appState.selectedGuess.sound.id === answerId;
  if (correct) appState.score += 1;

  const answer = sounds.find(sound => sound.id === answerId);
  document.querySelector('#gamePlay').classList.add('hidden');
  document.querySelector('#gameResult').classList.remove('hidden');
  document.querySelector('#gameResultTitle').textContent = correct ? 'Correct' : 'Not quite';
  document.querySelector('#gameResultDetail').textContent = `Answer: ${answer.title} in ${answer.region}.`;
  appState.markers.forEach(marker => {
    marker.setIcon(markerIcon(marker.sound, marker.sound.id === answerId ? 'answer-marker' : ''));
  });
}

function nextRound() {
  if (appState.round >= 3) {
    document.querySelector('#gameResult').classList.add('hidden');
    document.querySelector('#gameSummary').classList.remove('hidden');
    document.querySelector('#gameFinalScore').textContent = `${appState.score}/3`;
    document.querySelector('#gameCorrectCount').textContent = `${appState.score} correct answer${appState.score === 1 ? '' : 's'}`;
    return;
  }

  appState.round += 1;
  document.querySelector('#gameResult').classList.add('hidden');
  document.querySelector('#gamePlay').classList.remove('hidden');
  setRound();
}

function bindGameEvents() {
  document.querySelector('#startGame').addEventListener('click', startGame);
  document.querySelector('#submitGuess').addEventListener('click', submitGuess);
  document.querySelector('#nextRound').addEventListener('click', nextRound);
  document.querySelector('#restartGame').addEventListener('click', startGame);
}
