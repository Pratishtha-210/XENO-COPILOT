import { db, ICustomer } from '../db/connection';

export const segmentationService = {
  /**
   * Filters and returns list of customers matching the given audience criteria
   */
  filterCustomers: async (criteria: {
    totalSpendMin?: number;
    lastOrderDaysAgo?: number;
    specificProduct?: string;
  }): Promise<ICustomer[]> => {
    console.log('[Segmentation] Running filter with criteria:', criteria);

    // 1. Get all customers from DB
    const allCustomers = await db.customers.find();
    const matchedCustomers: ICustomer[] = [];

    const now = new Date();

    for (const customer of allCustomers) {
      // Rule A: Minimum Total Spend
      if (criteria.totalSpendMin !== undefined && criteria.totalSpendMin > 0) {
        if (customer.totalSpend < criteria.totalSpendMin) {
          continue; // Failed spend threshold
        }
      }

      // Rule B: Last Order Days Ago (Inactivity)
      if (criteria.lastOrderDaysAgo !== undefined && criteria.lastOrderDaysAgo > 0) {
        if (!customer.lastOrderDate) {
          continue; // No order history at all, skip win-back
        }

        const lastOrderTime = new Date(customer.lastOrderDate).getTime();
        const diffTime = Math.abs(now.getTime() - lastOrderTime);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < criteria.lastOrderDaysAgo) {
          continue; // Customer was active recently, skip
        }
      }

      // Rule C: Specific Product Purchase Affinity
      if (criteria.specificProduct && criteria.specificProduct.trim() !== '') {
        const customerOrders = await db.orders.find({ customerId: customer._id });
        const productQuery = criteria.specificProduct.toLowerCase();

        // Check if customer has bought this product type in the past
        const hasBoughtProduct = customerOrders.some(order => 
          order.itemBought.toLowerCase().includes(productQuery)
        );

        if (!hasBoughtProduct) {
          continue; // Never bought the target product
        }
      }

      // If customer passed all active filters, add to target audience
      matchedCustomers.push(customer);
    }

    console.log(`[Segmentation] Completed. Found ${matchedCustomers.length} matching customers.`);
    return matchedCustomers;
  }
};
