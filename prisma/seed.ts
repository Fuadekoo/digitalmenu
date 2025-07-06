import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // Admin user
  await prisma.user.create({
    data: {
      username: "System Admin",
      phone: "0942303571",
      password: "admin123", // Hash in production!
      role: "admin",
      clientPassCode: "2090",
      chatId: "631321369",
    },
  });

  // Waiters
  const waiter1 = await prisma.waiters.create({
    data: {
      name: "Ali",
      phone: "0911000001",
    },
  });
  const waiter2 = await prisma.waiters.create({
    data: {
      name: "Sara",
      phone: "0911000002",
    },
  });

  // Tables
  await prisma.table.createMany({
    data: [
      { name: "Table 1", tNumber: 1, waiterId: waiter1.id },
      { name: "Table 2", tNumber: 2, waiterId: waiter2.id },
      { name: "Table 3", tNumber: 3, waiterId: waiter1.id },
    ],
  });

  // Product Categories
  const cat1 = await prisma.productCategory.create({
    data: { cname: "Pizza" },
  });
  const cat2 = await prisma.productCategory.create({
    data: { cname: "Drinks" },
  });

  // Products
  await prisma.product.createMany({
    data: [
      {
        name: "Margherita Pizza",
        description: "Classic cheese pizza",
        photo: "/pizza1.jpg",
        price: 10.99,
        quantity: 100,
        categoryId: cat1.id,
      },
      {
        name: "Pepperoni Pizza",
        description: "Pepperoni and cheese",
        photo: "/pizza2.jpg",
        price: 12.99,
        quantity: 100,
        categoryId: cat1.id,
      },
      {
        name: "Coke",
        description: "Chilled soft drink",
        photo: "/coke.jpg",
        price: 2.5,
        quantity: 200,
        categoryId: cat2.id,
      },
      {
        name: "Water",
        description: "Bottled water",
        photo: "/water.jpg",
        price: 1.5,
        quantity: 200,
        categoryId: cat2.id,
      },
    ],
  });

  // Feedbacks
  await prisma.feedBack.createMany({
    data: [
      {
        clientName: "Guest 1",
        phone: "0911222333",
        message: "Great service!",
        rate: 5,
      },
      {
        clientName: "Guest 2",
        phone: "0911444555",
        message: "Pizza was delicious.",
        rate: 4,
      },
    ],
  });

  console.log("Seed data created!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
