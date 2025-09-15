module.exports = async () => {
  process.env.ML_API_URL = 'http://test.ml-api.com';
  process.env.N8N_WEBHOOK_URL_Calendar = 'http://test.n8n.com/booking';
  process.env.N8N_WEBHOOK_URL_Available = 'http://test.n8n.com/available-times';
};
