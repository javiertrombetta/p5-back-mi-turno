import { config } from "dotenv";
config();
import sequelize from '../config/database.js';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcrypt';
import Business from '../models/Business.js';
import Branch from '../models/Branch.js';
import User from '../models/User.js';
import Reservation from '../models/Reservation.js';

// Horarios de apertura y cierre para las sucursales
const openingHours = ['08:00', '08:30', '09:00', '09:30', '10:00'];
const closingHours = ['18:00', '18:30', '19:00', '19:30', '20:00'];

const saltRounds = 10; // Número de rondas de sal para bcrypt

const seedDatabase = async () => {
  await sequelize.sync({ force: true });

  // Generar datos para 'Business'
  const businesses = [];
  for (let i = 0; i < 10; i++) {
    const business = await Business.create({
      name: faker.company.name(),
      email: faker.internet.email(),
      phoneNumber: faker.datatype.number({ min: 100000000, max: 999999999 }),
      address: faker.address.streetAddress(),
    });
    businesses.push(business);
  }

  // Generar datos para 'Branch'
  const branches = [];
  for (let i = 0; i < 20; i++) {
    const businessId = faker.helpers.arrayElement(businesses).id;
    const openingTime = faker.helpers.arrayElement(openingHours);
    const closingTime = faker.helpers.arrayElement(closingHours);

    const branch = await Branch.create({
      name: faker.company.name(),
      email: faker.internet.email(),
      phoneNumber: faker.datatype.number({ min: 100000000, max: 999999999 }),
      address: faker.address.streetAddress(),
      capacity: faker.datatype.number({ min: 10, max: 100 }),
      openingTime,
      closingTime,
      turnDuration: 30,
      businessId
    });
    branches.push(branch);
  }

  // Generar datos para 'User'
  let userDNIs = [];
  for (let i = 0; i < 50; i++) {
    const dni = faker.datatype.number({ min: 10000000, max: 99999999 });
    const hashedPassword = await bcrypt.hash('password', saltRounds);

    const user = await User.create({
      dni,
      fullName: faker.name.fullName(),
      email: faker.internet.email(),
      phoneNumber: faker.datatype.number({ min: 100000000, max: 999999999 }),
      role: faker.helpers.arrayElement(['super', 'admin', 'oper', 'user']),
      password: hashedPassword,
      businessId: faker.helpers.arrayElement(businesses).id,
      branchId: faker.helpers.arrayElement(branches).id
    });
    userDNIs.push(dni);
  }

  // Generar datos para 'Reservation'
  for (let i = 0; i < 100; i++) {
    const branch = faker.helpers.arrayElement(branches);
    const time = generateRandomTimeWithinRange(branch.openingTime, branch.closingTime);

    await Reservation.create({
      date: faker.date.future(),
      time,
      state: faker.helpers.arrayElement(['pendiente', 'confirmado', 'cancelado', 'finalizado', 'ausente']),
      clientName: faker.name.fullName(),
      clientPhone: faker.datatype.number({ min: 100000000, max: 999999999 }),
      clientEmail: faker.internet.email(),
      branchId: branch.id,
      userId: faker.helpers.arrayElement(userDNIs)
    });
  }

  console.log('Datos de prueba generados con éxito');
};

// Funciones auxiliares
function generateRandomTimeWithinRange(openingTime, closingTime) {
  const startTime = convertTimeToMinutes(openingTime);
  const endTime = convertTimeToMinutes(closingTime);
  const randomTime = faker.datatype.number({ min: startTime, max: endTime - 15, precision: 15 });
  return convertMinutesToTime(randomTime);
}

function convertTimeToMinutes(time) {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function convertMinutesToTime(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

seedDatabase().catch(console.error);
