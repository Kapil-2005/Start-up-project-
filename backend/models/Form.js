
const mongoose = require('mongoose');

const FormSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    fields: {
        type: Array, // Stores the array of field objects
        required: true
    },
    theme: {
        color: { type: String, default: '#6366f1' },
        font: { type: String, default: 'font-sans' }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Form', FormSchema);
