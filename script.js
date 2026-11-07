(() => {
  'use strict';

  const $ = id => document.getElementById(id);
  const MATCH_KEY = 'footsimu.matches.v1';
  const TOKEN_KEY = 'footsimu.footballDataToken';
  const DEFAULT_START = '2026-11-07';
  let matches = loadSavedMatches();
  let busy = false;

  function loadSavedMatches() {
    try {
      const data = JSON.parse(localStorage.getItem(MATCH_KEY) || '[]');
      return Array.isArray(data) ? data : [];
    } catch { return []; }
  }
  function saveMatches() { localStorage.setItem(MATCH_KEY, JSON.stringify(matches)); }
  function dayOffset(day, count) {
    const date = new Date(`${day}T12:00:00`);
    date.setDate(date.getDate() + count);
    return date.toISOString().slice(0, 10);
  }
  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[char]);
  }
  function initials(value) {
    return String(value || '?').trim().split(/\s+/).slice(0, 2).map(part => part[0] || '').join('').toUpperCase();
  }
  function toast(message) {
    const element = $('toast');
    element.textContent = message;
    element.classList.add('show');
    window.setTimeout(() => element.classList.remove('show'), 2600);
  }
  function range() { return { from: $('startDate').value, to: $('endDate').value }; }
  function dateOf(match) { return String(match.utcDate || match.date || '').slice(0, 10); }
  function within(match, from, to) {
    const date = dateOf(match);
    return Boolean(date && from && to && date >= from && date <= to);
  }
  function visibleMatches() {
    const { from, to } = range();
    return matches.filter(match => within(match, from, to))
      .sort((a, b) => new Date(a.utcDate || a.date) - new Date(b.utcDate || b.date));
  }
  function poisson(mean, goals) {
    let probability = Math.exp(-mean);
    for (let n = 1; n <= goals; n++) probability *= mean / n;
    return probability;
  }
  function predict(homeXg, awayXg) {
    const homeMean = Math.max(.1, Math.min(5, Number(homeXg) || 1.45));
    const awayMean = Math.max(.1, Math.min(5, Number(awayXg) || 1.12));
    let home = 0, draw = 0, away = 0, bestProbability = -1, scoreHome = 0, scoreAway = 0;
    for (let homeGoals = 0; homeGoals <= 8; homeGoals++) {
      for (let awayGoals = 0; awayGoals <= 8; awayGoals++) {
        const probability = poisson(homeMean, homeGoals) * poisson(awayMean, awayGoals);
        if (homeGoals > awayGoals) home += probability;
        else if (homeGoals === awayGoals) draw += probability;
        else away += probability;
        if (probability > bestProbability) {
          bestProbability = probability;
          scoreHome = homeGoals;
          scoreAway = awayGoals;
        }
      }
    }
    return { scoreHome, scoreAway, home, draw, away };
  }
  function formatDate(value, withTime = true) {
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'short', day: 'numeric', month: 'short',
      ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {})
    }).format(new Date(value));
  }
  function setLabels() {
    const { from, to } = range();
    if (!from || !to) {
      $('weekLabel').textContent = 'Choisissez les dates';
      $('resultRange').textContent = '';
      return;
    }
    const format = day => new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC'
    }).format(new Date(`${day}T12:00:00Z`));
    $('weekLabel').textContent = `${format(from)} — ${format(to)}`;
    $('resultRange').textContent = `${format(from)} au ${format(to)}`;
  }
  function renderEmpty() {
    const empty = document.createElement('div');
    empty.className = 'empty';
    empty.innerHTML = '<strong>Aucun match dans cette période.</strong><br>Connectez une source de calendrier ou ajoutez vos rencontres pour lancer les simulations.<br><button class="btn btn-quiet" id="emptyAdd">＋ Ajouter un match</button>';
    $('matchList').replaceChildren(empty);
    $('emptyAdd').addEventListener('click', addManualMatch);
    $('avgScore').textContent = '—';
    $('homeFav').textContent = '—';
  }
  function renderMatch(match) {
    const prediction = predict(match.homeXg, match.awayXg);
    const card = document.createElement('article');
    card.className = 'match-card';
    card.innerHTML = `
      <div class="match-meta"><strong>${escapeHtml(match.competition || 'Match')}</strong><br>${escapeHtml(formatDate(match.utcDate || match.date))}${match.source === 'manual' ? ' · Manuel' : ''}</div>
      <div class="teams">
        <div class="team"><span class="crest">${escapeHtml(initials(match.homeTeam))}</span>${escapeHtml(match.homeTeam || 'Domicile')}</div>
        <div class="team"><span class="crest">${escapeHtml(initials(match.awayTeam))}</span>${escapeHtml(match.awayTeam || 'Extérieur')}</div>
      </div>
      <div class="prediction"><div class="pred-label">Score simulé</div><div class="score">${prediction.scoreHome}<i>–</i>${prediction.scoreAway}</div></div>
      <div class="chance"><span><b>${Math.round(prediction.home * 100)}%</b>1</span><span><b>${Math.round(prediction.draw * 100)}%</b>N</span><span><b>${Math.round(prediction.away * 100)}%</b>2</span></div>
      <div class="edit-xg"><span>Buts attendus :</span>
        <label>Dom. <input class="home-xg" aria-label="Buts attendus domicile" type="number" min="0.1" max="5" step="0.05" value="${Number(match.homeXg) || 1.45}"></label>
        <label>Ext. <input class="away-xg" aria-label="Buts attendus extérieur" type="number" min="0.1" max="5" step="0.05" value="${Number(match.awayXg) || 1.12}"></label>
        <button class="remove" type="button">Supprimer</button>
      </div>`;
    const update = () => {
      match.homeXg = Number(card.querySelector('.home-xg').value);
      match.awayXg = Number(card.querySelector('.away-xg').value);
      saveMatches();
      render();
    };
    card.querySelector('.home-xg').addEventListener('change', update);
    card.querySelector('.away-xg').addEventListener('change', update);
    card.querySelector('.remove').addEventListener('click', () => {
      matches = matches.filter(item => item.id !== match.id);
      saveMatches();
      render();
      toast('Rencontre supprimée.');
    });
    return { card, prediction };
  }
  function render() {
    setLabels();
    const list = visibleMatches();
    $('matchCount').textContent = String(list.length);
    $('simCount').innerHTML = `${list.length}<em> scénarios</em>`;
    $('matchList').replaceChildren();
    if (!list.length) { renderEmpty(); return; }

    let totalGoals = 0;
    let homeFavorites = 0;
    list.forEach(match => {
      const { card, prediction } = renderMatch(match);
      totalGoals += prediction.scoreHome + prediction.scoreAway;
      if (prediction.home > prediction.away) homeFavorites++;
      $('matchList').append(card);
    });
    $('avgScore').innerHTML = `${(totalGoals / list.length).toFixed(1)} <em>buts</em>`;
    $('homeFav').textContent = `${Math.round(homeFavorites / list.length * 100)}%`;
  }
  function addManualMatch() {
    const home = window.prompt('Équipe à domicile :');
    if (!home?.trim()) return;
    const away = window.prompt('Équipe à l’extérieur :');
    if (!away?.trim()) return;
    const { from } = range();
    const value = window.prompt('Date et heure locales (AAAA-MM-JJTHH:MM) :', `${from}T18:00`);
    if (!value || Number.isNaN(new Date(value).getTime())) { toast('Date invalide.'); return; }
    const date = new Date(value).toISOString();
    matches.push({
      id: `manual-${Date.now()}`, date, utcDate: date,
      homeTeam: home.trim(), awayTeam: away.trim(), competition: 'Match ajouté',
      homeXg: 1.45, awayXg: 1.12, source: 'manual'
    });
    saveMatches();
    render();
    toast('Match ajouté — ajustez les buts attendus.');
  }
  async function fetchMatches() {
    if (busy) return;
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      $('apiPanel').classList.add('open');
      $('apiToken').focus();
      toast('Ajoutez votre clé API pour continuer.');
      return;
    }
    const { from, to } = range();
    if (!from || !to || from > to) { toast('Vérifiez les dates sélectionnées.'); return; }

    busy = true;
    $('loadMatches').disabled = true;
    $('loadMatches').textContent = 'Chargement…';
    try {
      const url = `https://api.football-data.org/v4/matches?dateFrom=${encodeURIComponent(from)}&dateTo=${encodeURIComponent(to)}`;
      const response = await fetch(url, { headers: { 'X-Auth-Token': token } });
      if (!response.ok) {
        if (response.status === 403) throw new Error('Accès refusé : vérifiez la clé ou votre offre.');
        if (response.status === 429) throw new Error('Limite de requêtes atteinte. Réessayez plus tard.');
        throw new Error(`Erreur API (${response.status}).`);
      }
      const data = await response.json();
      const fetched = (data.matches || []).map(item => ({
        id: `api-${item.id}`, utcDate: item.utcDate, date: item.utcDate,
        homeTeam: item.homeTeam?.name || 'Domicile', awayTeam: item.awayTeam?.name || 'Extérieur',
        competition: item.competition?.name || 'Compétition', homeXg: 1.45, awayXg: 1.12, source: 'api'
      }));
      matches = matches.filter(match => match.source !== 'api' || !within(match, from, to));
      matches.push(...fetched);
      saveMatches();
      render();
      $('apiStatus').textContent = 'API connectée';
      $('apiDot').classList.add('live');
      toast(fetched.length ? `${fetched.length} match(s) actualisé(s).` : 'Aucun match sur cette période.');
    } catch (error) {
      toast(error.message || 'Impossible de contacter l’API.');
    } finally {
      busy = false;
      $('loadMatches').disabled = false;
      $('loadMatches').textContent = 'Actualiser les matchs';
    }
  }
  function saveToken() {
    const token = $('apiToken').value.trim();
    if (!token) { toast('Collez votre clé API.'); return; }
    localStorage.setItem(TOKEN_KEY, token);
    $('apiPanel').classList.remove('open');
    $('apiStatus').textContent = 'Clé enregistrée';
    toast('Clé enregistrée dans ce navigateur.');
  }
  function shiftWeek(steps) {
    const start = dayOffset($('startDate').value, steps * 7);
    $('startDate').value = start;
    $('endDate').value = dayOffset(start, 6);
    render();
  }

  $('startDate').value = DEFAULT_START;
  $('endDate').value = dayOffset(DEFAULT_START, 6);
  const savedToken = localStorage.getItem(TOKEN_KEY);
  if (savedToken) { $('apiToken').value = savedToken; $('apiStatus').textContent = 'Clé enregistrée'; }

  $('startDate').addEventListener('change', () => {
    if ($('startDate').value && $('endDate').value < $('startDate').value) $('endDate').value = $('startDate').value;
    render();
  });
  $('endDate').addEventListener('change', render);
  $('prevWeek').addEventListener('click', () => shiftWeek(-1));
  $('nextWeek').addEventListener('click', () => shiftWeek(1));
  $('addMatch').addEventListener('click', addManualMatch);
  $('loadMatches').addEventListener('click', fetchMatches);
  $('apiToggle').addEventListener('click', () => $('apiPanel').classList.toggle('open'));
  $('saveToken').addEventListener('click', saveToken);
  $('clearToken').addEventListener('click', () => {
    localStorage.removeItem(TOKEN_KEY);
    $('apiToken').value = '';
    $('apiStatus').textContent = 'Mode manuel';
    $('apiDot').classList.remove('live');
    toast('Clé API effacée.');
  });
  render();
})();
