import Sequelize from "sequelize";
import models from "../models/index.js";

const { User, Reservation } = models;

const metrics = {
  getPeakTimes: async (branchIds) => {
    const peakTimesCounts = await Reservation.findAll({
      attributes: [
        'branchId',
        [Sequelize.fn('date_part', 'hour', Sequelize.col('time')), 'hour'],
        [Sequelize.fn('count', Sequelize.col('id')), 'count']
      ],
      where: {
        branchId: branchIds,
        state: ['confirmado', 'finalizado']
      },
      group: ['branchId', Sequelize.fn('date_part', 'hour', Sequelize.col('time'))]
    });
  
    const peakTimes = {};
    branchIds.forEach(branchId => {
      const filteredTimes = peakTimesCounts
        .filter(pt => pt.branchId === branchId)
        .sort((a, b) => b.dataValues.count - a.dataValues.count);
  
      peakTimes[branchId] = filteredTimes.length > 0 ? filteredTimes[0].dataValues.hour : null;
    });
    return peakTimes;
  },  
  getAverageCancellations: async (branchIds) => {
    const totalReservations = await Reservation.findAll({
      attributes: [
        'branchId',
        [Sequelize.fn('count', Sequelize.col('id')), 'totalCount']
      ],
      where: {
        branchId: branchIds
      },
      group: ['branchId']
    });
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
      const totalReservationsForBranch = totalReservations.find(r => r.get('branchId') === branchId)?.get('totalCount') || 0;
      const cancellationsForBranch = cancellationCounts.find(c => c.get('branchId') === branchId)?.get('cancelCount') || 0;
      averageCancellations[branchId] = totalReservationsForBranch > 0 ? (cancellationsForBranch / totalReservationsForBranch) : 0;
    });  
    return averageCancellations;
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
    const totalReservationsCounts = await Reservation.count({
      where: {
        branchId: branchIds
      },
      group: ['branchId']
    });

    const totalReservations = {};
    branchIds.forEach(branchId => {
      const branchTotalReservations = totalReservationsCounts.find(tr => tr.branchId === branchId)?.count || 0;
      totalReservations[branchId] = branchTotalReservations;
    });
    return totalReservations;
  },
  getTotalCancellationsByBranch: async (branchIds) => {
    const totalCancellationsCounts = await Reservation.count({
      where: {
        branchId: branchIds,
        state: 'cancelado'
      },
      group: ['branchId']
    });  
    const totalCancellations = {};
    branchIds.forEach(branchId => {
      const branchTotalCancellations = totalCancellationsCounts.find(tc => tc.branchId === branchId)?.count || 0;
      totalCancellations[branchId] = branchTotalCancellations;
    });
    return totalCancellations;
  },
  getTotalAttendancesByBranch: async (branchIds) => {
    const totalAttendancesCounts = await Reservation.count({
      where: {
        branchId: branchIds,
        state: 'finalizado'
      },
      group: ['branchId']
    });  
    const totalAttendances = {};
    branchIds.forEach(branchId => {
      const branchTotalAttendances = totalAttendancesCounts.find(ta => ta.branchId === branchId)?.count || 0;
      totalAttendances[branchId] = branchTotalAttendances;
    });
    return totalAttendances;
  },
};
export default metrics;

