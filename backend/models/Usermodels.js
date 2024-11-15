const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },  // Add these fields
  gender: { type: String },
  birthday: { type: Date },
  followers: [{ type: Schema.Types.ObjectId, ref: 'User' }],  // Array of User IDs who follow this user
  following: [{ type: Schema.Types.ObjectId, ref: 'User' }]   // Array of User IDs the user is following
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);

module.exports = User;
