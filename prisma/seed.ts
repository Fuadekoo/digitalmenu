import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
const prisma = new PrismaClient();

async function main() {
  // Admin user
  const hashedPassword = bcrypt.hashSync("admin123", 10);
  await prisma.user.create({
    data: {
      username: "System Admin",
      phone: "0910737199",
      password: hashedPassword, // Hashed password
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

  // Orders
  const table1 = await prisma.table.findFirst({ where: { tNumber: 1 } });
  const table2 = await prisma.table.findFirst({ where: { tNumber: 2 } });
  const pizza = await prisma.product.findFirst({ where: { name: "Margherita Pizza" } });
  const pepperoni = await prisma.product.findFirst({ where: { name: "Pepperoni Pizza" } });
  const coke = await prisma.product.findFirst({ where: { name: "Coke" } });
  const water = await prisma.product.findFirst({ where: { name: "Water" } });

  // Order 1
  if (table1 && pizza && coke) {
    await prisma.order.create({
      data: {
        tableId: table1.id,
        totalPrice: pizza.price * 2 + coke.price,
        clientName: "Guest 1",
        phone: "0911222333",
        status: "pending",
        createdBy: "guest",
        orderItems: {
          create: [
            {
              productId: pizza.id,
              quantity: 2,
              price: pizza.price,
            },
            {
              productId: coke.id,
              quantity: 1,
              price: coke.price,
            },
          ],
        },
      },
    });
  }

  // Order 2
  if (table2 && pepperoni && water) {
    await prisma.order.create({
      data: {
        tableId: table2.id,
        totalPrice: pepperoni.price + water.price * 3,
        clientName: "Guest 2",
        phone: "0911444555",
        status: "pending",
        createdBy: "guest",
        orderItems: {
          create: [
            {
              productId: pepperoni.id,
              quantity: 1,
              price: pepperoni.price,
            },
            {
              productId: water.id,
              quantity: 3,
              price: water.price,
            },
          ],
        },
      },
    });
  }

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
