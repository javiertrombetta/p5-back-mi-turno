const checkSuperRole = (req, res, next) => {
  if (req.user && req.user.rol === 'super') {
    next();
  } 
  else {
    res.status(403).json({ message: "No estás autorizado a realizar esta acción." });
  }
};

const checkAdminRole = (req, res, next) => {
  if (req.user && (req.user.rol === 'admin' || req.user.rol === 'super')) {
    next();
  } 
  else {
    res.status(403).json({ message: "No estás autorizado a realizar esta acción." });
  }
};

const checkOperatorRole = (req, res, next) => {
  if (req.user && (req.user.rol === 'oper' || req.user.rol === 'admin' || req.user.rol === 'super')) {
    next();
  } 
  else {
    res.status(403).json({ message: "No estás autorizado a realizar esta acción." });
  }
};

export { checkSuperRole, checkAdminRole, checkOperatorRole };