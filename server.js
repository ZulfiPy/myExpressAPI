require('dotenv').config()
const express = require('express');
const app = express()
const mongoose = require('mongoose');
const PORT = process.env.PORT || 3500;
const connectDB = require('./config/dbConn');
const verifyJWT = require('./middleware/verifyJWT');
const cookieParser = require('cookie-parser');
const logger = require('./middleware/logger');
const errLogger = require('./middleware/errorHandler');

app.get('/', (req, res) => {
    res.send('hello world');
});

// connect Database
connectDB();

// Customer Middleware - request logger
app.use(logger);

app.use(express.json())

app.use(cookieParser());

// routes
app.use('/register', require('./routes/register'));
app.use('/auth', require('./routes/auth'));
app.use('/refresh', require('./routes/refresh'));
app.use('/logout', require('./routes/logout'));

// file iis defined as Drivers.js and Employee.js but for some reason it requires to import it as drivers.js and employee.js
app.use(verifyJWT);
app.use('/api/drivers', require('./routes/api/drivers'));
app.use('/api/employees', require('./routes/api/Employees'));

// Customer Middleware - error
app.use(errLogger);

mongoose.connection.once('open', () => {
    console.log('connected to MongoDB');
    app.listen(PORT, () => console.log(`listening on port ${PORT}`));
});