const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
    origin: process.env.CLIENT_URL || '*', // Allow all or specific client
    credentials: true
}));
app.use(bodyParser.json());

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://kapil44352005_db_user:vpTWCjUEDf5yVERl@cluster012.2g0syil.mongodb.net/?appName=Cluster012';

mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB Connection Error:', err));

// Models
const Form = require('./models/Form');
const Response = require('./models/Response');
const User = require('./models/User');

// --- Routes ---

// 1. Save a new form
app.post('/api/forms', async (req, res) => {
    try {
        const { title, fields, theme } = req.body;
        const newForm = new Form({
            title,
            fields,
            theme: theme || { color: '#6366f1', font: 'sans' }
        });
        const savedForm = await newForm.save();
        res.status(201).json({ message: 'Form saved successfully', id: savedForm._id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Get all forms
app.get('/api/forms', async (req, res) => {
    try {
        const forms = await Form.find().sort({ createdAt: -1 });
        res.json(forms.map(f => ({
            id: f._id,
            title: f.title,
            fields: f.fields,
            theme: f.theme,
            createdAt: f.createdAt
        })));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Get a specific form by ID
app.get('/api/forms/:id', async (req, res) => {
    try {
        const form = await Form.findById(req.params.id);
        if (!form) return res.status(404).json({ message: 'Form not found' });

        res.json({
            id: form._id,
            title: form.title,
            fields: form.fields,
            theme: form.theme
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. Submit a response
app.post('/api/forms/:id/submit', async (req, res) => {
    try {
        const { id } = req.params;
        const responseData = req.body;

        const newResponse = new Response({
            formId: id,
            data: responseData
        });
        await newResponse.save();

        res.status(201).json({ message: 'Response submitted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 5. Get responses for a specific form
app.get('/api/forms/:id/responses', async (req, res) => {
    try {
        const { id } = req.params;

        const form = await Form.findById(id);
        if (!form) return res.status(404).json({ message: 'Form not found' });

        const responses = await Response.find({ formId: id }).sort({ submittedAt: -1 });

        res.json({
            form: {
                id: form._id,
                title: form.title,
                fields: form.fields,
                theme: form.theme
            },
            responses: responses.map(r => ({
                id: r._id,
                data: r.data,
                submittedAt: r.submittedAt
            }))
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 6. User Registration
app.post('/api/register', async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email, and password are required' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        const newUser = new User({
            name,
            email,
            phone: phone || undefined,
            password // In a production app, hash the password
        });

        const savedUser = await newUser.save();
        res.status(201).json({ message: 'User registered successfully', userId: savedUser._id });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 7. User Login (Supports Email and Phone Signin)
app.post('/api/login', async (req, res) => {
    try {
        const { identifier, password } = req.body;

        if (!identifier || !password) {
            return res.status(400).json({ message: 'Email/Phone and password are required' });
        }

        // Find user by either email or phone
        const user = await User.findOne({
            $or: [
                { email: identifier },
                { phone: identifier }
            ]
        });

        if (!user || user.password !== password) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        res.json({ message: 'Login successful', user: { id: user._id, name: user.name, email: user.email, phone: user.phone } });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 8. AI Form Generator (Mock AI)
app.post('/api/generate-form', (req, res) => {
    const { prompt } = req.body;

    if (!prompt) return res.status(400).json({ message: 'Prompt is required' });

    const p = prompt.toLowerCase();
    let fields = [];
    let title = 'Generated Form';

    // Smart Keyword Matching Logic
    if (p.includes('feedback') || p.includes('review') || p.includes('survey')) {
        title = 'Feedback Form';
        fields = [
            { id: 1, type: 'text', label: 'Full Name', placeholder: 'Your Name', required: true },
            { id: 2, type: 'email', label: 'Email Address', placeholder: 'you@example.com', required: true },
            { id: 3, type: 'radio', label: 'How would you rate us?', options: ['Excellent', 'Good', 'Average', 'Poor'], required: true },
            { id: 4, type: 'textarea', label: 'What did you like the most?', placeholder: 'Share your thoughts...', required: false },
            { id: 5, type: 'textarea', label: 'How can we improve?', placeholder: 'Suggestions...', required: false }
        ];
    } else if (p.includes('contact') || p.includes('inquiry') || p.includes('message')) {
        title = 'Contact Us';
        fields = [
            { id: 1, type: 'text', label: 'Full Name', placeholder: 'John Doe', required: true },
            { id: 2, type: 'email', label: 'Email', placeholder: 'john@example.com', required: true },
            { id: 3, type: 'text', label: 'Subject', placeholder: 'Inquiry Subject', required: true },
            { id: 4, type: 'textarea', label: 'Message', placeholder: 'Type your message...', required: true }
        ];
    } else if (p.includes('job') || p.includes('application') || p.includes('hiring') || p.includes('career')) {
        title = 'Job Application';
        fields = [
            { id: 1, type: 'text', label: 'Full Name', placeholder: 'Candidate Name', required: true },
            { id: 2, type: 'email', label: 'Email Address', placeholder: 'email@example.com', required: true },
            { id: 3, type: 'text', label: 'Phone Number', placeholder: '+1 234...', required: true },
            { id: 4, type: 'text', label: 'Portfolio/LinkedIn', placeholder: 'https://...', required: false },
            { id: 5, type: 'dropdown', label: 'Position', options: ['Developer', 'Designer', 'Manager', 'Analyst'], required: true },
            { id: 6, type: 'file', label: 'Resume/CV', required: true }
        ];
    } else if (p.includes('event') || p.includes('registration') || p.includes('meetup') || p.includes('rsvp')) {
        title = 'Event Registration';
        fields = [
            { id: 1, type: 'text', label: 'Attendee Name', required: true },
            { id: 2, type: 'email', label: 'Email Address', required: true },
            { id: 3, type: 'number', label: 'Number of Guests', placeholder: '1', required: true },
            { id: 4, type: 'dropdown', label: 'Dietary Preferences', options: ['None', 'Vegetarian', 'Vegan', 'Gluten-Free'], required: false }
        ];
    } else if (p.includes('pizza') || p.includes('food') || p.includes('order') || p.includes('restaurant')) {
        title = 'Food Order Form';
        fields = [
            { id: 1, type: 'text', label: 'Customer Name', required: true },
            { id: 2, type: 'text', label: 'Delivery Address', placeholder: 'Street, City, Zip', required: true },
            { id: 3, type: 'dropdown', label: 'Choose Item', options: ['Pizza', 'Burger', 'Pasta', 'Salad'], required: true },
            { id: 4, type: 'dropdown', label: 'Size', options: ['Small', 'Medium', 'Large'], required: true },
            { id: 5, type: 'textarea', label: 'Special Instructions', placeholder: 'No onions, extra cheese...', required: false }
        ];
    } else {
        // Default Generic Form
        title = 'New Form';
        fields = [
            { id: 1, type: 'text', label: 'Name', required: true },
            { id: 2, type: 'email', label: 'Email', required: true },
            { id: 3, type: 'textarea', label: 'Description', required: true }
        ];
    }

    res.json({ title, fields, theme: { color: '#8b5cf6', font: 'font-sans' } });
});

app.get('/', (req, res) => {
    res.send('API is running...');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
