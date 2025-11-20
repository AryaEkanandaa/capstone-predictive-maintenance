const express = require('express');
const app = express();
const PORT = 5000;

const anomalyRoutes = require('./routes/anomalyRoutes'); 
const authRoutes = require('./routes/auth/authRoutes');

app.use(express.json());

app.use('/api', anomalyRoutes);
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
    res.status(200).send('Predictive Maintenance Copilot Backend API is running!');
});

app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});