const checkRole = (roles) => {
  
  return (req, res, next) => {
    console.log(req.user)
    if (req.user && roles.includes(req.user.role)) {
      next();
    } else {
      res.status(403).json({ message: "No estás autorizado a realizar esta acción." });
    }
  };
};

const checkSuperRole = checkRole(['super']);
const checkAdminRole = checkRole(['admin', 'super']);
const checkOperatorRole = checkRole(['oper', 'admin', 'super']);

export { checkSuperRole, checkAdminRole, checkOperatorRole };
