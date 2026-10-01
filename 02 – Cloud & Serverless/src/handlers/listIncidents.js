const { ScanCommand } = require('@aws-sdk/lib-dynamodb');
const { docClient } = require('../lib/dynamo');
const { response } = require('../lib/http');

exports.handler = async () => {
  try {
    const result = await docClient.send(
      new ScanCommand({ TableName: process.env.TABLE_NAME })
    );
    const items = (result.Items || []).sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
    return response(200, items);
  } catch (err) {
    console.error(err);
    return response(500, { message: 'Erreur lors de la récupération des incidents' });
  }
};
