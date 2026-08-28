require('dotenv').config({ quiet: true });
const path = require('path');
const express = require('express');
const session = require('express-session');

require('./db/init');

const requireAuth = require('./middleware/requireAuth');
const authRoutes = require('./routes/auth');
const daysRoutes = require('./routes/days');
const expensesRoutes = require('./routes/expenses');
const uploadsRoutes = require('./routes/uploads');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('trust proxy', 1);
app.use(express.json({ limit: '2mb' }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'change-me-in-.env',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 14, // 14 days
    sameSite: 'lax',
    secure: process.env.COOKIE_SECURE === 'true',
  },
}));

app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/auth', authRoutes);
app.use('/api/days', requireAuth, daysRoutes);
app.use('/api/expenses', requireAuth, expensesRoutes);
app.use('/api', requireAuth, uploadsRoutes);
app.use('/uploads', requireAuth, express.static(path.join(__dirname, 'uploads')));

app.use((req, res) => res.status(404).json({ error: 'Not found' }));

app.listen(PORT, () => {
  console.log(`Trip WAS listening on http://localhost:${PORT}`);
});
