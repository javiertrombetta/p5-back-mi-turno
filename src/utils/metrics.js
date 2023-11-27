import Sequelize from "sequelize";
import Reservation from "../models/Reservation.js";
import User from "../models/User.js";

export async function getPeakTimes(branchIds) {
  return await Reservation.findAll({
    attributes: [
      [Sequelize.fn('date_part', 'hour', Sequelize.col('date')), 'hour'],
      [Sequelize.fn('count', Sequelize.col('id')), 'count']
    ],
    where: {
      branchId: branchIds,
      state: ['confirmado', 'finalizado']
    },
    group: ['hour'],
    order: [[Sequelize.fn('count', Sequelize.col('id')), 'DESC']],
    limit: 1
  });
}
export async function getAverageCancellations(branchIds, totalBranches) {
  const cancellationCounts = await Reservation.findAll({
    attributes: [
      'branchId',
      [Sequelize.fn('count', Sequelize.col('id')), 'cancelCount']
    ],
    where: {
      branchId: branchIds,
      state: 'cancelado'
    },
    group: ['branchId']
  });

  return cancellationCounts.reduce((acc, cancelCount) => {
    acc[cancelCount.branchId] = cancelCount.cancelCount / totalBranches;
    return acc;
  }, {});
}
export async function getMostVisitedBranches(branchIds) {
  return await Reservation.findAll({
    attributes: [
      'branchId',
      [Sequelize.fn('count', Sequelize.col('id')), 'visitCount']
    ],
    where: {
      branchId: branchIds,
      state: 'finalizado'
    },
    group: ['branchId'],
    order: [[Sequelize.fn('count', Sequelize.col('id')), 'DESC']],
    limit: 1
  });
}
export async function getOperatorCount(branchIds) {
  const operatorCounts = await User.count({
    where: {
      role: 'oper',
      BranchId: branchIds
    },
    group: ['BranchId']
  });
  return operatorCounts.reduce((acc, count) => {
    acc[count.BranchId] = count.count;
    return acc;
  }, {});
}
