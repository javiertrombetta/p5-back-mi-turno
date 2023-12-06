/*const checkEnv = (env) => {
  return (req, res, next) => {
    if (process.env.NODE_ENV !== env) {
      return res.status(403).json({
        message: `Esta acción solo está permitida en entorno de ${env}`,
      });
    }
    next();
  };
};

export const checkDevEnv = checkEnv("development");
export const checkProdEnv = checkEnv("production");*/
