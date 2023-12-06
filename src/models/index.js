import Business from './Business.js';
import User from './User.js';
import Reservation from './Reservation.js';
import Branch from './Branch.js';

Branch.hasMany(Reservation, { foreignKey: 'branchId', onDelete: 'SET NULL' });
Reservation.belongsTo(Branch, { foreignKey: 'branchId', allowNull: true });

Branch.hasMany(User, { foreignKey: 'branchId', onDelete: 'SET NULL' });
User.belongsTo(Branch, { foreignKey: 'branchId', allowNull: true });

User.hasMany(Reservation, { foreignKey: 'userId' });
Reservation.belongsTo(User, { foreignKey: 'userId' });

Business.hasMany(User, { foreignKey: 'businessId' });
User.belongsTo(Business, { foreignKey: 'businessId' });

Business.hasMany(Branch, { foreignKey: 'businessId' });
Branch.belongsTo(Business, { foreignKey: 'businessId' });

Branch.belongsToMany(User, { through: 'UserBranches', foreignKey: 'branchId' });
User.belongsToMany(Branch, { through: 'UserBranches', foreignKey: 'userId' });

export default {
  Business,
  User,
  Reservation,
  Branch
};