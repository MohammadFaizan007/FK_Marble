import { getPrisma } from "@/lib/prisma";

export type AdminDashboardCounts = {
  activeCategories: number;
  publicProducts: number;
  demoProducts: number;
  enquiries: number;
  pendingEnquiries: number;
  activeStaff: number;
  suppliers: number;
  purchaseOrders: number;
  customers: number;
  salesOrders: number;
  quotations: number;
  invoices: number;
};

export async function getAdminDashboardCounts(): Promise<AdminDashboardCounts> {
  const prisma = getPrisma();
  const [activeCategories, publicProducts, demoProducts, enquiries, pendingEnquiries, activeStaff, suppliers, purchaseOrders, customers, salesOrders, quotations, invoices] =
    await Promise.all([
      prisma.category.count({ where: { isActive: true } }),
      prisma.product.count({ where: { isActive: true, isDemo: false } }),
      prisma.product.count({ where: { isDemo: true } }),
      prisma.enquiry.count(),
      prisma.enquiry.count({ where: { status: "PENDING" } }),
      prisma.adminUser.count({ where: { isActive: true } }),
      prisma.supplier.count(),
      prisma.purchaseOrder.count(),
      prisma.customer.count(),
      prisma.salesOrder.count(),
      prisma.quotation.count(),
      prisma.invoice.count(),
    ]);

  return {
    activeCategories,
    publicProducts,
    demoProducts,
    enquiries,
    pendingEnquiries,
    activeStaff,
    suppliers,
    purchaseOrders,
    customers,
    salesOrders,
    quotations,
    invoices,
  };
}
