import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Employee from './models/Employee.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/accord-survey';

const employees = [
  { name: 'Beatrice Maingi', role: 'Operations Manager' },
  { name: 'Cornelius Bichanga', role: 'Sales' },
  { name: 'Doreen Chepkorir', role: 'Chief Executive' },
  { name: 'Geoffrey Nato', role: 'Manager' },
  { name: 'James Ondieki', role: 'Engineer' },
  { name: 'Kelvin Langat', role: 'Dispatch' },
  { name: 'Lucy Akinyi Omenya', role: 'Sales' },
  { name: 'Lucy Thiongo', role: 'Sales' },
  { name: 'Maxwell Barasa', role: 'Dispatch' },
  { name: 'Mburu Enock', role: 'Sales' },
  { name: 'Purity Jepkemei', role: 'Sales' },
  { name: 'Savi Syengo', role: 'Finance' },
  { name: 'Sharon Nyanchama', role: 'Sales' },
  { name: 'Vivian Kawira', role: 'Sales' },
  { name: 'Willmon Tirop', role: 'Engineer' },
  { name: 'Winnie Aduro', role: 'Telesales' },
  { name: 'Winnie Osunga', role: 'Sales' },
  { name: 'Seth Makori', role: 'Software Engineer' }
];

mongoose
  .connect(MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');

    console.log('Clearing existing employees...');
    await Employee.deleteMany({});

    console.log(`Seeding ${employees.length} employees...`);
    const created = await Employee.insertMany(employees.map((e) => ({ ...e })));

    console.log(`Created ${created.length} employees.`);
    created.forEach((c) => console.log(` - ${c.name} (${c.role})`));

    console.log('Employees seeded successfully. Exiting...');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Failed to seed employees:', err);
    process.exit(1);
  });
