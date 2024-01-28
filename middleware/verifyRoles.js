const verifyRoles = (...allowedRoles) => {
    return (req, res, next) => {
        // don't have any roles
        console.log(req.roles)
        if (!req?.roles) return res.sendStatus(401);
        const found = req.roles.some(role => allowedRoles.includes(role));
        // don't have any of allowed roles
        if (!found) return res.status(401).json({ 'message': "you don't have any of allowed roles to make this request." });
        next();
    }
}

module.exports = verifyRoles;