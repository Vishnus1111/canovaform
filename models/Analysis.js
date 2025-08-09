const mongoose = require('mongoose');

const analysisSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  stat: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('Analysis', analysisSchema);
