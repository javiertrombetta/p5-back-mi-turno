import cron from 'node-cron';
import Sequelize from 'sequelize';
import Reservation from '../models/Reservation.js';
import User from '../models/User.js';
import { transporter } from './mailTransporter.js';
import emailTemplates from '../utils/emailTemplates.js';

cron.schedule('0 0 * * *', async () => {
  try {
    const now = new Date();
    const [updatedRows] = await Reservation.update(
      { state: 'ausente' },
      {
        where: {
          state: ['pendiente', 'confirmado'],
          date: {
            [Sequelize.Op.lt]: now
          }
        }
      }
    );
    console.log(`Reservas actualizadas a ausente: ${updatedRows}`);
  } catch (error) {
    console.error('Error al actualizar reservas:', error);
  }
});
cron.schedule('0 * * * *', async () => {
  try {
    const now = new Date();
    const oneDayAhead = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const reservationsToRemind = await Reservation.findAll({
      where: {
        date: {
          [Sequelize.Op.gte]: now,
          [Sequelize.Op.lt]: oneDayAhead
        },
        state: 'confirmado'
      },
      include: [{ model: User }]
    });

    reservationsToRemind.forEach(async reservation => {
      const emailOptions = emailTemplates.reminderNotification(reservation.User, reservation);
      await transporter.sendMail(emailOptions);
    });
  } catch (error) {
    console.error('Error al enviar recordatorios de reserva:', error);
  }
});



