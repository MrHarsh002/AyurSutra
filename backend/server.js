require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/dbConfig');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const profileRoutes = require("./routes/profileRoutes");
const patientRoutes = require('./routes/patientRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const therapyRoutes = require('./routes/therapyRoutes');
const treatmentRoutes = require('./routes/treatmentRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const billingRoutes = require('./routes/billingRoutes');
const reportRoutes = require('./routes/reportRoutes');
const metaRoutes = require('./routes/doctorMetaRoutes');
const searchRoutes=require("./routes/searchRoutes");
const medicalZoneRoutes = require('./routes/medicalZoneRoutes');
const dhashboarRoutes =require('./routes/dashboardRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');
const app = express();

// Connect to Database
connectDB();

const allowedOrigins = [
  'https://ayur-sutra-r2kz.vercel.app/',
  'https://ayur-sutra-five.vercel.app',
  'http://localhost:3000'
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));



app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//upload image
app.use("/uploads",express.static(path.join(__dirname, "uploads")));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users',userRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/doctors', metaRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/therapies', therapyRoutes);
app.use("/api/profile", profileRoutes);
app.use('/api/treatments', treatmentRoutes);
app.use('/api/reports', reportRoutes);
app.use("/api/search", searchRoutes);
app.use('/api/medical-zone', medicalZoneRoutes);
app.use('/api/dashboard', dhashboarRoutes);
app.use('/api/chatbot', chatbotRoutes);


// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Server Error' });
});

app.get('/', (req, res) => {
  res.send('API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});