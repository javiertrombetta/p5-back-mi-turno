const db = require('../config/database');
const Business = require('./Business');
const User = require('./User');
const Reservation = require('./Reservation');
const Branch = require('./Branch');

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
Business.hasMany(Branch, { foreignKey: 'businessId' });
Business.hasMany(User, { foreignKey: 'businessId' });

module.exports = {
  db,
  Business,
  User,
  Reservation,  
  Branch
};