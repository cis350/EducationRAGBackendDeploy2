const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  settings: {
    colorTheme: {
      type: String,
      default: 'light', // Assuming 'light' is the default theme
    },
    expertiseLevel: {
      type: String,
      default: 'beginner',
    },
  },
});

const UserModel = mongoose.model('Users', UserSchema);
module.exports = UserModel;
