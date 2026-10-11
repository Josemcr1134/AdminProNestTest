import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const suppliersData = [
  { name: 'TecnoDistribuciones', email: 'ventas@tecnodist.com', phone: '3001234567' },
  { name: 'Hogar Total', email: 'contacto@hogartotal.com', phone: '3017654321' },
  { name: 'Deportes Andinos', email: 'pedidos@deportesandinos.com' },
  { name: 'Librería Central', email: 'compras@libreriacentral.com', phone: '3029876543' },
  { name: 'Importadora Global', email: 'info@importadoraglobal.com' },
];

async function main() {
  // 1. Categorías
  const names = ['Electrónica', 'Hogar', 'Deportes', 'Libros'];
  for (const name of names) {
    await prisma.category.upsert({ where: { name }, update: {}, create: { name } });
  }
  const categories = await prisma.category.findMany();

  // 2. Proveedores (email es @unique, por eso sirve para el upsert)
  for (const s of suppliersData) {
    await prisma.supplier.upsert({ where: { email: s.email }, update: {}, create: s });
  }
  const suppliers = await prisma.supplier.findMany({ orderBy: { id: 'asc' } });

  const books = categories.find((c) => c.name === 'Libros');
  if (!books) throw new Error('Falta la categoría Libros');
  // 3. Productos: cada quinto queda sin proveedor
  for (let i = 1; i <= 40; i++) {
    const sku = `SKU-${i.toString().padStart(3, '0')}`;
    const withoutSupplier = i % 5 === 0;

    const supplierId = withoutSupplier ? null : suppliers[i % suppliers.length].id;
    const categoryId = withoutSupplier ? books.id : categories[i % categories.length].id;

    await prisma.product.upsert({
      where: { sku },
      update: { supplierId, categoryId },
      create: {
        name: `Producto ${i}`,
        sku,
        price: Math.round(Math.random() * 500_00) / 100 + 1,
        stock: Math.floor(Math.random() * 100),
        categoryId,
        supplierId,
      },
    });
  };

  await prisma.user.upsert({
    where: { email: 'admin@adminpro.com' },
    update: {},
    create: {
      email: 'admin@adminpro.com',
      name: 'Admin',
      password: await bcrypt.hash('Admin1234', 10),
      role: 'ADMIN',
    },
  });

  console.log(`Seed listo: ${categories.length} categorías, ${suppliers.length} proveedores, 40 productos`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
