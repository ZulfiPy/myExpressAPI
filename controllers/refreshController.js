const Employee = require('../model/employee');
const jwt = require('jsonwebtoken');

const handleRefreshToken = async (req, res) => {
    // extract the cookies
    const cookies = req?.cookies;
    console.log(`cookies available at refresh :${JSON.stringify(cookies)}`)
    // jwt cookie doesn't exist
    if (!cookies?.jwt) return res.status(403).json({ 'message': 'not found cookies.jwt' });
    // store jwt cookie before clear
    const refreshToken = cookies.jwt;
    console.log('refreshToken in refresh', refreshToken)
    // clear jwt cookie
    res.clearCookie('jwt', { httpOnly: true, sameSite: 'none' }) // secure: true


    // find employee whom belongs refreshToken
    const foundEmployee = await Employee.findOne({ refreshToken }).exec();

    // if token not found in the database - unclear whom belongs the cookie
    // user can be deleted or token misuse
    if (!foundEmployee) {
        // try to verify the cookie
        jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET,
            async (err, decoded) => {
                // cookie expired
                if (err) return res.sendStatus(401);
                // cookie verified and is still valid
                // find whom belongs the cookie
                const hackedEmployee = await Employee.findOne({ username: decoded.username }).exec();
                // clear out record of refresh tokens and save the record
                hackedEmployee.refreshToken = [];
                const result = await hackedEmployee.save();
                console.log('hachedEmployee', result);
            }
        )
        return res.sendStatus(403);
    }

    // define array with filtered out old jwt cookie
    const newRefreshTokenArray = foundEmployee.refreshToken.filter(rt => rt !== refreshToken);

    // token with the user found in the database 
    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        async (err, decoded) => {
            // cookie expired
            if (err) {
                foundEmployee.refreshToken = newRefreshTokenArray;
                const result = await foundEmployee.save();
                console.log('token expired', result)
                console.log(err)
            }
            // compare the name of found employee and refresh token username
            if (err || foundEmployee.username !== decoded.username) return res.sendStatus(403);

            const roles = Object.values(foundEmployee.roles).filter(Boolean);

            const newAccessToken = jwt.sign(
                {
                    "UserInfo": {
                        username: foundEmployee.username,
                        roles
                    }
                },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: "5m" }
            );

            const newRefreshToken = jwt.sign(
                { "username": foundEmployee.username },
                process.env.REFRESH_TOKEN_SECRET,
                { expiresIn: "1h" }
            );

            // update refreshToken record and save it
            foundEmployee.refreshToken = [...newRefreshTokenArray, newRefreshToken];
            const result = await foundEmployee.save();
            console.log('everything is done', result);

            res.cookie('jwt', newRefreshToken, { httpOnly: true, sameSite: 'none', maxAge: 24 * 60 * 60 * 1000 }); // secure: true

            return res.json({ newAccessToken });
        }
    )
}

module.exports = {
    handleRefreshToken
}