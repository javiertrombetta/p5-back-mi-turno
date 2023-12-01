import { config } from "dotenv";
config();
import sequelize from '../config/database.js';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcrypt';
import Business from '../models/Business.js';
import Branch from '../models/Branch.js';
import User from '../models/User.js';
import Reservation from '../models/Reservation.js';

const openingHours = ['08:00', '08:30', '09:00', '09:30', '10:00'];
const closingHours = ['18:00', '18:30', '19:00', '19:30', '20:00'];

const saltRounds = 10;

const seedDatabase = async () => {
  await sequelize.sync({ force: true });

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

  const branches = [];
  for (let i = 0; i < 20; i++) {
    const businessId = businesses[faker.datatype.number({ min: 0, max: businesses.length - 1 })].id;
    const openingTime = openingHours[faker.datatype.number({ min: 0, max: openingHours.length - 1 })];
    const closingTime = closingHours[faker.datatype.number({ min: 0, max: closingHours.length - 1 })];

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

  for (let i = 0; i < 100; i++) {
    const branch = branches[faker.datatype.number({ min: 0, max: branches.length - 1 })];
    const time = generateRandomTimeWithinRange(branch.openingTime, branch.closingTime);

    await Reservation.create({
      date: faker.date.future(),
      time,
      state: faker.helpers.arrayElement(['pendiente', 'confirmado', 'cancelado', 'finalizado', 'ausente']),
      clientName: faker.name.fullName(),
      clientPhone: faker.datatype.number({ min: 100000000, max: 999999999 }),
      clientEmail: faker.internet.email(),
      branchId: branch.id,
      userId: userDNIs[faker.datatype.number({ min: 0, max: userDNIs.length - 1 })]
    });
  }

  const specificUsers = [
    {
      dni: 11111111,
      fullName: 'Super User',
      email: 's@s.com',
      password: 'super',
      role: 'super',
      businessId: null,
      branchId: null
    },
    {
      dni: 22222222,
      fullName: 'Admin User',
      email: 'a@a.com',
      password: 'admin',
      role: 'admin',
      businessId: businesses[0].id,
      branchId: branches[0].id
    },
    {
      dni: 33333333,
      fullName: 'Operational User',
      email: 'o@o.com',
      password: 'oper',
      role: 'oper',
      businessId: businesses[0].id,
      branchId: branches[0].id
    },
    {
      dni: 44444444,
      fullName: 'Regular User',
      email: 'u@u.com',
      password: 'user',
      role: 'user',
      businessId: businesses[0].id,
      branchId: branches[0].id
    }
  ];

  for (const user of specificUsers) {
    const hashedPassword = await bcrypt.hash(user.password, saltRounds);
    await User.create({
      dni: user.dni,
      fullName: user.fullName,
      email: user.email,
      phoneNumber: faker.datatype.number({ min: 100000000, max: 999999999 }),
      role: user.role,
      password: hashedPassword,
      businessId: user.businessId,
      branchId: user.branchId
    });
  }

  console.log('Datos de prueba generados con éxito');
};

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
