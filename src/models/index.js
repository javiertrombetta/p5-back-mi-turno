const db = require('../config/database');
const User = require('./User');
const Reservation = require('./Reservation');
const Business = require('./Business');
const Branch = require('./Branch');

Business.hasMany(Branch, { foreignKey: 'businessId' });
Branch.belongsTo(Business, { foreignKey: 'businessId' });

Branch.hasMany(Reservation, { foreignKey: 'branchId' });
Reservation.belongsTo(Branch, { foreignKey: 'branchId' });

Reservation.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Reservation, { foreignKey: 'userId' });

User.belongsToMany(Branch, { through: 'UserBranches', foreignKey: 'userId' });
Branch.belongsToMany(User, { through: 'UserBranches', foreignKey: 'branchId' });

module.exports = {
  db,
  User,
  Reservation,
  Business,
  Branch
};
