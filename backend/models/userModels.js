const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    number: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      default: "",
    },
    photo: {
      type: String,
      default: "", // image URL
    },
    role: {
      type: String,
      enum: ['admin', 'doctor', 'therapist', 'patient'],
      default: 'patient',
    },
  },
  { timestamps: true }
);

// Hash password
UserSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
