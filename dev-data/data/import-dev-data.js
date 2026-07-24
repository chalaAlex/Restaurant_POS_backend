const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../config.env') });

const Restaurant = require('../../model/restaurantModel');
const User = require('../../model/userModel');
const FoodItem = require('../../model/foodItemModel');
const Order = require('../../model/orderModel');
const AuditLog = require('../../model/auditLogModel');
const mockData = require('./mock-data');

// Use the correct database connection
const DB = process.env.DATABASE_LOCAL || 'mongodb://localhost:27017/restaurant';

console.log('Connecting to database:', DB);

mongoose
  .connect(DB, {})
  .then(() => {
    console.log('✅ Database connection successful!');
    console.log('Connected to database:', mongoose.connection.name);
  })
  .catch((err) => {
    console.log('❌ ERROR:', err);
    process.exit(1);
  });

// IMPORT DATA INTO DB
const importData = async () => {
  try {
    console.log('\n🗑️  Deleting existing data...');
    await Restaurant.deleteMany({});
    await User.deleteMany({});
    await FoodItem.deleteMany({});
    await Order.deleteMany({});
    await AuditLog.deleteMany({});

    console.log('🏢 Creating restaurants...');
    const restaurants = await Restaurant.create(mockData.restaurants);
    console.log(`✅ Created ${restaurants.length} restaurants`);

    console.log('👥 Creating users...');
    const users = [];

    // Create owners for each restaurant
    for (let i = 0; i < restaurants.length; i++) {
      const ownerData = mockData.owners[i];
      const passwordHash = await bcrypt.hash(ownerData.password, 12);

      const owner = await User.create({
        restaurantId: restaurants[i]._id,
        name: ownerData.name,
        phone: ownerData.phone,
        passwordHash,
        role: 'Owner',
        isActive: true,
      });
      users.push(owner);
      console.log(`✅ Created owner: ${owner.name} for ${restaurants[i].name}`);
    }

    // Create cashiers for first restaurant
    for (const cashierData of mockData.cashiers) {
      const passwordHash = await bcrypt.hash(cashierData.password, 12);

      const cashier = await User.create({
        restaurantId: restaurants[0]._id,
        name: cashierData.name,
        phone: cashierData.phone,
        passwordHash,
        role: 'Cashier',
        isActive: true,
      });
      users.push(cashier);
      console.log(`✅ Created cashier: ${cashier.name}`);
    }

    console.log('🍔 Creating food items...');
    const foodItems = [];

    for (const restaurant of restaurants) {
      for (const foodData of mockData.foodItems) {
        const foodItem = await FoodItem.create({
          restaurantId: restaurant._id,
          name: foodData.name,
          category: foodData.category,
          price: foodData.price,
          description: foodData.description,
          isAvailable: true,
        });
        foodItems.push(foodItem);
      }
    }
    console.log(`✅ Created ${foodItems.length} food items`);

    console.log('\n📊 Database Seed Summary:');
    console.log(`   Restaurants: ${restaurants.length}`);
    console.log(`   Users: ${users.length}`);
    console.log(`   Food Items: ${foodItems.length}`);
    console.log('\n🎉 Data successfully imported!');

    console.log('\n📝 Login Credentials:');
    console.log('\n   Restaurant 1 (Habesha Restaurant):');
    console.log(`   Owner - Phone: ${mockData.owners[0].phone}, Password: ${mockData.owners[0].password}`);
    console.log(`   Cashier 1 - Phone: ${mockData.cashiers[0].phone}, Password: ${mockData.cashiers[0].password}`);
    console.log(`   Cashier 2 - Phone: ${mockData.cashiers[1].phone}, Password: ${mockData.cashiers[1].password}`);
    console.log(`   Cashier 3 - Phone: ${mockData.cashiers[2].phone}, Password: ${mockData.cashiers[2].password}`);
    console.log('\n   Restaurant 2 (Lucy Restaurant):');
    console.log(`   Owner - Phone: ${mockData.owners[1].phone}, Password: ${mockData.owners[1].password}`);

  } catch (err) {
    console.log('❌ Import error:', err);
  }
  process.exit();
};

// DELETE ALL DATA FROM DB
const deleteData = async () => {
  try {
    const restaurantCount = await Restaurant.deleteMany({});
    const userCount = await User.deleteMany({});
    const foodItemCount = await FoodItem.deleteMany({});
    const orderCount = await Order.deleteMany({});
    const auditLogCount = await AuditLog.deleteMany({});

    console.log('\n🗑️  Data successfully deleted!');
    console.log(`   Restaurants: ${restaurantCount.deletedCount}`);
    console.log(`   Users: ${userCount.deletedCount}`);
    console.log(`   Food Items: ${foodItemCount.deletedCount}`);
    console.log(`   Orders: ${orderCount.deletedCount}`);
    console.log(`   Audit Logs: ${auditLogCount.deletedCount}`);
  } catch (err) {
    console.log('❌ Delete error:', err);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
} else {
  console.log('\nUsage:');
  console.log('  node import-dev-data.js --import   # Import data');
  console.log('  node import-dev-data.js --delete   # Delete all data');
  process.exit();
}
