const logEvents = require('./logEvents');

const logger = (req, res, next) => {
    const log = `${req.method}\t${req.headers.origin}\t${req.url}`;
    logEvents(log, 'reqLog.txt');
    next();
}

module.exports = logger;