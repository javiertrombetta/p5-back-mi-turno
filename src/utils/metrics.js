import Sequelize from "sequelize";
import models from "../models/index.js";

const { User, Reservation } = models;

const metrics = {
  getPeakTimes: async (branchIds, whereClause = {}) => {
    const peakTimesCounts = await Reservation.findAll({
      attributes: [
        'branchId',
        [Sequelize.fn('date_part', 'hour', Sequelize.col('time')), 'hour'],
        [Sequelize.fn('count', Sequelize.col('id')), 'count']
      ],
      where: {
        ...whereClause,
        branchId: branchIds,
        state: ['finalizado']
      },
      group: ['branchId', Sequelize.fn('date_part', 'hour', Sequelize.col('time'))]
    });  
    const peakTimes = {};
    branchIds.forEach(branchId => {
      const filteredTimes = peakTimesCounts
        .filter(pt => pt.branchId === branchId)
        .sort((a, b) => b.dataValues.count - a.dataValues.count);  
      peakTimes[branchId] = filteredTimes.length > 0 ? filteredTimes[0].dataValues.hour : "N/A";
    });  
    return peakTimes;
  },


  getAverageCancellations: async (branchIds, whereClause = {}) => {
    const totalReservations = await Reservation.count({
      where: {
        branchId: branchIds,
        ...whereClause
      },
      group: ['branchId']
    });
    const cancellationCounts = await Reservation.count({
      where: {
        branchId: branchIds,
        state: 'cancelado',
        ...whereClause
      },
      group: ['branchId']
    });  
    const averageCancellations = {};
    branchIds.forEach(branchId => {
      const total = totalReservations.find(r => r.branchId === branchId)?.count || 0;
      const cancellations = cancellationCounts.find(c => c.branchId === branchId)?.count || 0;
      averageCancellations[branchId] = total > 0 ? (cancellations / total) : 0;
    });
    return averageCancellations;
  },  
  getTotalReservationsByBranch: async (branchIds, whereClause = {}) => {
    const totalReservationsCounts = await Reservation.count({
      where: {
        branchId: branchIds,
        ...whereClause
      },
      group: ['branchId']
    });  
    const totalReservations = {};
    branchIds.forEach(branchId => {
      const count = totalReservationsCounts.find(tr => tr.branchId === branchId)?.count || 0;
      totalReservations[branchId] = count;
    });
    return totalReservations;
  },  
  getTotalCancellationsByBranch: async (branchIds, whereClause = {}) => {
    const totalCancellationsCounts = await Reservation.count({
      where: {
        branchId: branchIds,
        state: 'cancelado',
        ...whereClause
      },
      group: ['branchId']
    });  
    const totalCancellations = {};
    branchIds.forEach(branchId => {
      const count = totalCancellationsCounts.find(tc => tc.branchId === branchId)?.count || 0;
      totalCancellations[branchId] = count;
    });
    return totalCancellations;
  },  
  getTotalAttendancesByBranch: async (branchIds, whereClause = {}) => {
    const totalAttendancesCounts = await Reservation.count({
      where: {
        branchId: branchIds,
        state: 'finalizado',
        ...whereClause
      },
      group: ['branchId']
    });  
    const totalAttendances = {};
    branchIds.forEach(branchId => {
      const count = totalAttendancesCounts.find(ta => ta.branchId === branchId)?.count || 0;
      totalAttendances[branchId] = count;
    });
    return totalAttendances;
  },  
  getTotalPendingByBranch: async (branchIds, whereClause = {}) => {
    const totalPendingCounts = await Reservation.count({
      where: {
        branchId: branchIds,
        state: 'pendiente',
        ...whereClause
      },
      group: ['branchId']
    });  
    const totalPending = {};
    branchIds.forEach(branchId => {
      const count = totalPendingCounts.find(tp => tp.branchId === branchId)?.count || 0;
      totalPending[branchId] = count;
    });
    return totalPending;
  },  
  getTotalConfirmedByBranch: async (branchIds, whereClause = {}) => {
    const totalConfirmedCounts = await Reservation.count({
      where: {
        branchId: branchIds,
        state: 'confirmado',
        ...whereClause
      },
      group: ['branchId']
    });  
    const totalConfirmed = {};
    branchIds.forEach(branchId => {
      const count = totalConfirmedCounts.find(tc => tc.branchId === branchId)?.count || 0;
      totalConfirmed[branchId] = count;
    });
    return totalConfirmed;
  },  
  getTotalFinishedByBranch: async (branchIds, whereClause = {}) => {
    const totalFinishedCounts = await Reservation.count({
      where: {
        branchId: branchIds,
        state: 'finalizado',
        ...whereClause
      },
      group: ['branchId']
    });  
    const totalFinished = {};
    branchIds.forEach(branchId => {
      const count = totalFinishedCounts.find(tf => tf.branchId === branchId)?.count || 0;
      totalFinished[branchId] = count;
    });
    return totalFinished;
  },  
  getTotalNoShowByBranch: async (branchIds, whereClause = {}) => {
    const totalNoShowCounts = await Reservation.count({
      where: {
        branchId: branchIds,
        state: 'ausente',
        ...whereClause
      },
      group: ['branchId']
    });  
    const totalNoShow = {};
    branchIds.forEach(branchId => {
      const count = totalNoShowCounts.find(tns => tns.branchId === branchId)?.count || 0;
      totalNoShow[branchId] = count;
    });
    return totalNoShow;
  },
};
export default metrics;

