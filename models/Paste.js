const mongoose = require('mongoose');

const PasteSchema = new mongoose.Schema({
    name: { type: String, required: false },
    key: { type: String, required: true, unique: true },
    content: { type: String, required: true },
    paste_type: { type: String, required: false, default: 0 }
});

module.exports = mongoose.model("Paste", PasteSchema)