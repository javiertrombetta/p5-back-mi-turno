import Sequelize from "sequelize";
import Reservation from "../models/Reservation.js";
import User from "../models/User.js";

const metrics = {
  getPeakTimes: async (branchIds) => {
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
  },
  getAverageCancellations: async (branchIds) => {
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
    const averageCancellations = {};
    branchIds.forEach(branchId => {
      const branchCancellation = cancellationCounts.find(c => c.branchId === branchId);
      averageCancellations[branchId] = branchCancellation ? branchCancellation.cancelCount / totalBranches : 0;
    });  
    return averageCancellations;
  },
  getMostVisitedBranches: async (branchIds) => {
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
  },
  getOperatorCount: async (branchIds) => {
    const operatorCounts = await User.count({
      where: {
        role: 'oper',
        branchId: branchIds
      },
      group: ['branchId']
    });  
    const operatorCountResult = {};
    branchIds.forEach(branchId => {
      const branchOperatorCount = operatorCounts.find(count => count.branchId === branchId);
      operatorCountResult[branchId] = branchOperatorCount ? branchOperatorCount.count : 0;
    });  
    return operatorCountResult;
  },
  getTotalReservationsByBranch: async (branchIds) => {
    return await Reservation.count({
      where: {
        branchId: branchIds
      },
      group: ['branchId']
    });
  },
  getTotalCancellationsByBranch: async (branchIds) => {
    return await Reservation.count({
      where: {
        branchId: branchIds,
        state: 'cancelado'
      },
      group: ['branchId']
    });
  },
  getTotalAttendancesByBranch: async (branchIds) => {
    return await Reservation.count({
      where: {
        branchId: branchIds,
        state: 'finalizado'
      },
      group: ['branchId']
    });
  }
};
export default metrics;

