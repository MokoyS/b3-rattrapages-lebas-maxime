const { UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const { docClient } = require('../lib/dynamo');
const { response } = require('../lib/http');
const { STATUTS } = require('../lib/constants');

exports.handler = async (event) => {
  const incidentId = event.pathParameters && event.pathParameters.id;
  if (!incidentId) {
    return response(400, { message: "Paramètre d'URL 'id' manquant" });
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return response(400, { message: 'JSON invalide' });
  }

  const { statut } = body;
  if (!statut || !STATUTS.includes(statut)) {
    return response(400, { message: `statut doit être l'un de : ${STATUTS.join(', ')}` });
  }

  try {
    const result = await docClient.send(
      new UpdateCommand({
        TableName: process.env.TABLE_NAME,
        Key: { incidentId },
        UpdateExpression: 'SET statut = :statut',
        ConditionExpression: 'attribute_exists(incidentId)',
        ExpressionAttributeValues: { ':statut': statut },
        ReturnValues: 'ALL_NEW',
      })
    );
    return response(200, result.Attributes);
  } catch (err) {
    if (err.name === 'ConditionalCheckFailedException') {
      return response(404, { message: 'Incident introuvable' });
    }
    console.error(err);
    return response(500, { message: "Erreur lors de la mise à jour de l'incident" });
  }
};
