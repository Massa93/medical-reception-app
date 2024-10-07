const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://localhost/medical_register', { useNewUrlParser: true, useUnifiedTopology: true });

const PatientSchema = new mongoose.Schema({
  name: String,
  fileNumber: String,
  age: Number,
  paymentMethod: String,
  medicalAidProvider: String,
  registrationDate: { type: Date, default: Date.now }
});

const Patient = mongoose.model('Patient', PatientSchema);

app.post('/api/patients', async (req, res) => {
  const patient = new Patient(req.body);
  await patient.save();
  res.json(patient);
});

app.get('/api/patients', async (req, res) => {
  const { search } = req.query;
  let query = {};
  if (search) {
    query = { name: new RegExp(search, 'i') };
  }
  const patients = await Patient.find(query);
  res.json(patients);
});

app.get('/api/daily-records', async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const patients = await Patient.find({ registrationDate: { $gte: today } });
  const totalMoney = patients.reduce((sum, patient) => sum + (patient.paymentMethod === 'cash' ? 100 : 50), 0); // Assuming fixed prices
  res.json({ patients, totalMoney });
});

app.get('/api/weekly-report', async (req, res) => {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const patients = await Patient.find({ registrationDate: { $gte: weekAgo } });
  const totalMoney = patients.reduce((sum, patient) => sum + (patient.paymentMethod === 'cash' ? 100 : 50), 0);
  res.json({ patients, totalMoney });
});

app.listen(5000, () => console.log('Server running on port 5000'));