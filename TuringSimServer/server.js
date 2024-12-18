// Main app

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const authRoutes = require('./routes/auth');
const registrationRoutes = require('./routes/registration');
const saveRoutes = require('./routes/save');
const loadRoutes = require('./routes/load');
const loadConfigsRoutes = require('./routes/load_configs');
const deleteConfigRoutes = require('./routes/delete_config');

app.use(authRoutes);
app.use(registrationRoutes);
app.use(saveRoutes);
app.use(loadRoutes);
app.use(loadConfigsRoutes);
app.use(deleteConfigRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
