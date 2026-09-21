require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// In-memory data store for registrations
let registrations = [];

// Submit Registration Route
app.post('/api/register', (req, res) => {
    const { name, email, phone, institution, utr } = req.body;

    if (!name || !email || !phone || !utr) {
        return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    const newRecord = {
        id: 'REG-' + Math.floor(1000 + Math.random() * 9000),
        name,
        email,
        phone,
        institution,
        utr,
        status: 'PENDING', // Default status: PENDING, APPROVED, REJECTED
        date: new Date().toLocaleDateString()
    };

    registrations.push(newRecord);
    res.json({ success: true, record: newRecord });
});

// Admin Verification & Fetch Data Route
app.post('/api/admin/verify', (req, res) => {
    const { password } = req.body;

    if (password === process.env.ADMIN_PASSWORD) {
        res.json({ success: true, data: registrations });
    } else {
        res.status(401).json({ success: false, message: 'Invalid Admin Password' });
    }
});

// Admin Update Payment Status (Approve / Reject)
app.post('/api/admin/update-status', (req, res) => {
    const { password, regId, status } = req.body;

    if (password !== process.env.ADMIN_PASSWORD) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const record = registrations.find(r => r.id === regId);
    if (record) {
        record.status = status;
        return res.json({ success: true, data: registrations });
    } else {
        return res.status(404).json({ success: false, message: 'Record not found' });
    }
});

// Clear Data Route
app.post('/api/admin/clear', (req, res) => {
    const { password } = req.body;

    if (password === process.env.ADMIN_PASSWORD) {
        registrations = [];
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false, message: 'Unauthorized' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});