const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const driverSchema = new Schema({
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    isikukood: {
        type: Number,
        required: true
    },
    driverLicenseNumber: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    vehicle: {
        type: String,
        required: false
    }
})

module.exports = mongoose.model('Driver', driverSchema);