const { DeleteCommand } = require('@aws-sdk/lib-dynamodb');
const { docClient } = require('../lib/dynamo');
const { response } = require('../lib/http');

exports.handler = async (event) => {
  const incidentId = event.pathParameters && event.pathParameters.id;
  if (!incidentId) {
    return response(400, { message: "Paramètre d'URL 'id' manquant" });
  }

  try {
    await docClient.send(
      new DeleteCommand({
        TableName: process.env.TABLE_NAME,
        Key: { incidentId },
        ConditionExpression: 'attribute_exists(incidentId)',
      })
    );
    return response(200, { message: 'Incident supprimé' });
  } catch (err) {
    if (err.name === 'ConditionalCheckFailedException') {
      return response(404, { message: 'Incident introuvable' });
    }
    console.error(err);
    return response(500, { message: "Erreur lors de la suppression de l'incident" });
  }
};
