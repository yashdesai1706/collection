const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    // Audit Fix: Exclude password from default query projections
    password: { type: String, required: true, select: false },
    isAdmin: { type: Boolean, default: false },
    // TODO: requires product/client decision: Mandatory phone field — whether existing accounts without one get prompted on next login
    address: {
        street: String,
        city: String,
        state: String,
        postalCode: String,
        country: String
    }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
