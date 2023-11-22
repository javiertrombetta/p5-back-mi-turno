const checkAdminRole = (req, res, next) => {
  if (req.user && req.user.rol === 'admin') {
    next();
  } else {
    res.status(403).json({ message: "Access denied" });
  }
};

const checkOperatorRole = (req, res, next) => {
  if (req.user && req.user.rol === 'oper') {
    next();
  } else {
    res.status(403).json({ message: "Access denied" });
  }
};

export { checkAdminRole, checkOperatorRole };
