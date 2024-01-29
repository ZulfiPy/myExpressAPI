const logEvents = require('./logEvents');

const errorHandler = (err, req, res, next) => {
    const log = `${err.name}: ${err.message}`;
    logEvents(log, 'errLog.txt');
    res.status(500).send(err.message);
}

module.exports = errorHandler;