const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    const user = req.user; // No type assertion needed in JS

    console.log("✅ Role check for:", user?.role);
    console.log("Allowed roles:", allowedRoles);

    if (!user || !allowedRoles.includes(user.role)) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    next();
  };
};

module.exports = { checkRole };
