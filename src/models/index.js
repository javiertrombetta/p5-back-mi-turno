const db = require('../config/database');
const User = require('./User');
const Reservation = require('./Reservation');
const Business = require('./Business');
const Branch = require('./Branch');

Business.hasMany(Branch, { foreignKey: 'businessId' });
Business.hasMany(User, { foreignKey: 'businessId' });
Branch.belongsTo(Business, { foreignKey: 'businessId' });
Branch.hasMany(Reservation, { foreignKey: 'branchId' });
Branch.hasMany(User, { foreignKey: 'branchId' });
Branch.belongsToMany(User, { through: 'UserBranches', foreignKey: 'branchId' });
Reservation.belongsTo(Branch, { foreignKey: 'branchId' });
Reservation.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Reservation, { foreignKey: 'userId' });
User.belongsToMany(Branch, { through: 'UserBranches', foreignKey: 'userId' });
User.belongsTo(Business, { foreignKey: 'businessId' });
User.belongsTo(Branch, { foreignKey: 'branchId' });


module.exports = {
  db,
  User,
  Reservation,
  Business,
  Branch
};