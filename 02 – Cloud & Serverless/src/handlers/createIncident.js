const { PutCommand } = require('@aws-sdk/lib-dynamodb');
const { docClient } = require('../lib/dynamo');
const { response } = require('../lib/http');
const { TYPES_INCIDENT } = require('../lib/constants');

exports.handler = async (event) => {
  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return response(400, { message: 'JSON invalide' });
  }

  const { distributeurId, typeIncident, description, dateSignalement } = body;

  if (!distributeurId || !typeIncident || !description || !dateSignalement) {
    return response(400, {
      message: 'Champs requis : distributeurId, typeIncident, description, dateSignalement',
    });
  }

  if (!TYPES_INCIDENT.includes(typeIncident)) {
    return response(400, {
      message: `typeIncident doit être l'un de : ${TYPES_INCIDENT.join(', ')}`,
    });
  }

  const incident = {
    incidentId: crypto.randomUUID(),
    distributeurId,
    typeIncident,
    description,
    dateSignalement,
    statut: 'a_traiter',
    createdAt: new Date().toISOString(),
  };

  try {
    await docClient.send(
      new PutCommand({ TableName: process.env.TABLE_NAME, Item: incident })
    );
    return response(201, incident);
  } catch (err) {
    console.error(err);
    return response(500, { message: "Erreur lors de la création de l'incident" });
  }
};
