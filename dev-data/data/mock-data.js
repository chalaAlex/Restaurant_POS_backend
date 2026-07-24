// Mock data for Restaurant POS system

const mockData = {
  restaurants: [
    {
      name: 'Habesha Restaurant',
      address: 'Bole Road, Addis Ababa',
      phone: '0911223344',
      isActive: true,
    },
    {
      name: 'Lucy Restaurant',
      address: 'Piazza, Addis Ababa',
      phone: '0922334455',
      isActive: true,
    },
  ],

  owners: [
    {
      name: 'Alemayehu Tadesse',
      phone: '0911111111',
      password: 'owner123',
      role: 'Owner',
    },
    {
      name: 'Tigist Hailu',
      phone: '0922222222',
      password: 'owner456',
      role: 'Owner',
    },
  ],

  cashiers: [
    {
      name: 'Abebe Bekele',
      phone: '0912345678',
      password: 'cashier123',
      role: 'Cashier',
    },
    {
      name: 'Sara Mohammed',
      phone: '0913456789',
      password: 'cashier456',
      role: 'Cashier',
    },
    {
      name: 'Dawit Tesfaye',
      phone: '0914567890',
      password: 'cashier789',
      role: 'Cashier',
    },
  ],

  foodItems: [
    { name: 'Burger', category: 'Food', price: 150, description: 'Beef burger with cheese and vegetables' },
    { name: 'Pizza', category: 'Food', price: 250, description: 'Large pizza with mixed toppings' },
    { name: 'Pasta', category: 'Food', price: 180, description: 'Italian pasta with tomato sauce' },
    { name: 'Injera with Wot', category: 'Food', price: 120, description: 'Traditional Ethiopian dish' },
    { name: 'Tibs', category: 'Food', price: 200, description: 'Grilled meat with vegetables' },
    { name: 'Tea', category: 'Tea', price: 25, description: 'Ethiopian tea' },
    { name: 'Black Coffee', category: 'Coffee', price: 30, description: 'Ethiopian coffee' },
    { name: 'Macchiato', category: 'Coffee', price: 35, description: 'Macchiato coffee' },
    { name: 'Cappuccino', category: 'Coffee', price: 40, description: 'Cappuccino coffee' },
    { name: 'Fresh Milk', category: 'Milk', price: 45, description: 'Fresh cold milk' },
    { name: 'Milk Shake', category: 'Milk', price: 60, description: 'Flavored milk shake' },
    { name: 'Soft Drink', category: 'Other', price: 20, description: 'Coca-Cola, Pepsi, Sprite' },
  ],
};

module.exports = mockData;
