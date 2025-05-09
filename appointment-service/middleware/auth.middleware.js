const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        res.status(401).json({ message: 'Token missing' });
        return;
    }
    console.log("Token" + token);

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || 'supersecretkey'
        );

        req.user = {
            id: decoded.id,
            role: decoded.role,
            hospitalId: decoded.hospitalId,
        };
        console.log("Decode Jwt" + req.user.id);

        next();
    } catch (err) {
        res.status(403).json({ message: 'Token invalid' });
        return;
    }
};

// Middleware to authorize specific roles
const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authenticated' });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Access denied' });
        }
        console.log("Role" + req.user.role);
        next();
    };

};

module.exports = {
    verifyToken,
    authorizeRoles
};