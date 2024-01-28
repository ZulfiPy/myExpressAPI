require('dotenv').config()
const express = require('express');
const app = express()
const mongoose = require('mongoose');
const PORT = process.env.PORT || 3500;
const connectDB = require('./config/dbConn');
const verifyJWT = require('./middleware/verifyJWT');

app.get('/', (req, res) => {
    res.send('hello world');
});

// connect Database
connectDB();

app.use(express.json())

// routes
app.use('/register', require('./routes/register'));
app.use('/auth', require('./routes/auth'));

// file iis defined as Drivers.js and Employee.js but for some reason it requires to import it as drivers.js and employee.js
app.use(verifyJWT);
app.use('/api/drivers', require('./routes/api/drivers'));
app.use('/api/employees', require('./routes/api/Employees'));

mongoose.connection.once('open', () => {
    console.log('connected to MongoDB');
    app.listen(PORT, () => console.log(`listening on port ${PORT}`));
});