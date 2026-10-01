const API_BASE_URL = 'https://hsa144roqi.execute-api.eu-west-3.amazonaws.com';

const TYPE_LABELS = {
  panne: 'Panne',
  temperature: 'Température anormale',
  produit_bloque: 'Produit bloqué',
  paiement: 'Problème de paiement',
};

const STATUT_LABELS = {
  a_traiter: 'À traiter',
  en_cours: 'En cours',
  resolu: 'Résolu',
};

const form = document.getElementById('incident-form');
const formMessage = document.getElementById('form-message');
const listMessage = document.getElementById('list-message');
const incidentsBody = document.getElementById('incidents-body');
const refreshBtn = document.getElementById('refresh-btn');

document.getElementById('dateSignalement').valueAsDate = new Date();

function showMessage(el, text, type) {
  el.textContent = text;
  el.className = 'message' + (type ? ' ' + type : '');
}

async function loadIncidents() {
  showMessage(listMessage, 'Chargement...', '');
  try {
    const res = await fetch(`${API_BASE_URL}/incidents`);
    if (!res.ok) throw new Error('Erreur serveur');
    const incidents = await res.json();
    renderIncidents(incidents);
    showMessage(listMessage, '', '');
  } catch (err) {
    showMessage(listMessage, "Impossible de charger les incidents. Vérifie API_BASE_URL dans app.js.", 'error');
  }
}

function renderIncidents(incidents) {
  incidentsBody.innerHTML = '';

  if (incidents.length === 0) {
    const row = document.createElement('tr');
    row.innerHTML = '<td colspan="6">Aucun incident signalé pour le moment.</td>';
    incidentsBody.appendChild(row);
    return;
  }

  for (const incident of incidents) {
    const row = document.createElement('tr');

    row.innerHTML = `
      <td>${escapeHtml(incident.distributeurId)}</td>
      <td>${TYPE_LABELS[incident.typeIncident] || incident.typeIncident}</td>
      <td>${escapeHtml(incident.description)}</td>
      <td>${escapeHtml(incident.dateSignalement)}</td>
      <td></td>
      <td><button class="danger" data-action="delete">Supprimer</button></td>
    `;

    const statutCell = row.children[4];
    const select = document.createElement('select');
    for (const [value, label] of Object.entries(STATUT_LABELS)) {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = label;
      if (value === incident.statut) option.selected = true;
      select.appendChild(option);
    }
    select.addEventListener('change', () => updateStatus(incident.incidentId, select.value));
    statutCell.appendChild(select);

    row.querySelector('[data-action="delete"]').addEventListener('click', () => {
      deleteIncident(incident.incidentId);
    });

    incidentsBody.appendChild(row);
  }
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  showMessage(formMessage, 'Envoi...', '');

  const payload = {
    distributeurId: document.getElementById('distributeurId').value.trim(),
    typeIncident: document.getElementById('typeIncident').value,
    description: document.getElementById('description').value.trim(),
    dateSignalement: document.getElementById('dateSignalement').value,
  };

  try {
    const res = await fetch(`${API_BASE_URL}/incidents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Erreur lors de la création');
    }
    form.reset();
    document.getElementById('dateSignalement').valueAsDate = new Date();
    showMessage(formMessage, 'Incident signalé avec succès.', 'success');
    loadIncidents();
  } catch (err) {
    showMessage(formMessage, err.message, 'error');
  }
});

async function updateStatus(incidentId, statut) {
  try {
    const res = await fetch(`${API_BASE_URL}/incidents/${incidentId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ statut }),
    });
    if (!res.ok) throw new Error('Erreur lors de la mise à jour du statut');
    showMessage(listMessage, 'Statut mis à jour.', 'success');
  } catch (err) {
    showMessage(listMessage, err.message, 'error');
    loadIncidents();
  }
}

async function deleteIncident(incidentId) {
  if (!confirm('Supprimer cet incident ?')) return;
  try {
    const res = await fetch(`${API_BASE_URL}/incidents/${incidentId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Erreur lors de la suppression');
    showMessage(listMessage, 'Incident supprimé.', 'success');
    loadIncidents();
  } catch (err) {
    showMessage(listMessage, err.message, 'error');
  }
}

refreshBtn.addEventListener('click', loadIncidents);

loadIncidents();
