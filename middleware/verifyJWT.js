const jwt = require('jsonwebtoken');

const verifyJWT = async (req, res, next) => {
    console.log('verifyJWT');
    // retrieve the memory where access token is being stored
    const header = req.headers.authorization || req.headers.Authorization;
    const token = header.split(' ')[1];
    // verify access token
    jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET,
        (err, decoded) => {
            // error
            if (err) return res.sendStatus(403); // expired token
            // success
            console.log('UserInfo', decoded.UserInfo);
            req.user = decoded.UserInfo.username;
            req.roles = decoded.UserInfo.roles;
        }
    );
    next();
    console.log('--');
}

module.exports = verifyJWT;