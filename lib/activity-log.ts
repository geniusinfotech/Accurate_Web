export const activityLoggers = {
  cashBankAccount: {
    created: async (id: string, data: any, message: string) => {
      console.log("[activity] cashBankAccount.created", { id, data, message });
    },
    updated: async (id: string, oldData: any, newData: any, message: string) => {
      console.log("[activity] cashBankAccount.updated", { id, oldData, newData, message });
    },
    deleted: async (id: string, data: any, message: string) => {
      console.log("[activity] cashBankAccount.deleted", { id, data, message });
    },
  },
  customer: {
    created: async (id: string, data: any, message: string) => {
      console.log("[activity] customer.created", { id, data, message });
    },
    updated: async (id: string, oldData: any, newData: any, message: string) => {
      console.log("[activity] customer.updated", { id, oldData, newData, message });
    },
    deleted: async (id: string, data: any, message: string) => {
      console.log("[activity] customer.deleted", { id, data, message });
    },
  },
  product: {
    created: async (id: string, data: any, message: string) => {
      console.log("[activity] product.created", { id, data, message });
    },
    updated: async (id: string, oldData: any, newData: any, message: string) => {
      console.log("[activity] product.updated", { id, oldData, newData, message });
    },
    deleted: async (id: string, data: any, message: string) => {
      console.log("[activity] product.deleted", { id, data, message });
    },
  },
  order: {
    created: async (id: string, data: any, message: string) => {
      console.log("[activity] order.created", { id, data, message });
    },
    updated: async (id: string, oldData: any, newData: any, message: string) => {
      console.log("[activity] order.updated", { id, oldData, newData, message });
    },
    deleted: async (id: string, data: any, message: string) => {
      console.log("[activity] order.deleted", { id, data, message });
    },
  },
  manager: {
    created: async (id: string, data: any, message: string) => {
      console.log("[activity] manager.created", { id, data, message });
    },
    updated: async (id: string, oldData: any, newData: any, message: string) => {
      console.log("[activity] manager.updated", { id, oldData, newData, message });
    },
    deleted: async (id: string, data: any, message: string) => {
      console.log("[activity] manager.deleted", { id, data, message });
    },
  },
  coupon: {
    created: async (id: string, data: any, message: string) => {
      console.log("[activity] coupon.created", { id, data, message });
    },
    updated: async (id: string, oldData: any, newData: any, message: string) => {
      console.log("[activity] coupon.updated", { id, oldData, newData, message });
    },
    deleted: async (id: string, data: any, message: string) => {
      console.log("[activity] coupon.deleted", { id, data, message });
    },
  },
  offer: {
    created: async (id: string, data: any, message: string) => {
      console.log("[activity] offer.created", { id, data, message });
    },
    updated: async (id: string, oldData: any, newData: any, message: string) => {
      console.log("[activity] offer.updated", { id, oldData, newData, message });
    },
    deleted: async (id: string, data: any, message: string) => {
      console.log("[activity] offer.deleted", { id, data, message });
    },
  },
  banner: {
    created: async (id: string, data: any, message: string) => {
      console.log("[activity] banner.created", { id, data, message });
    },
    updated: async (id: string, oldData: any, newData: any, message: string) => {
      console.log("[activity] banner.updated", { id, oldData, newData, message });
    },
    deleted: async (id: string, data: any, message: string) => {
      console.log("[activity] banner.deleted", { id, data, message });
    },
  },
  testimonial: {
    created: async (id: string, data: any, message: string) => {
      console.log("[activity] testimonial.created", { id, data, message });
    },
    updated: async (id: string, oldData: any, newData: any, message: string) => {
      console.log("[activity] testimonial.updated", { id, oldData, newData, message });
    },
    deleted: async (id: string, data: any, message: string) => {
      console.log("[activity] testimonial.deleted", { id, data, message });
    },
  },
  category: {
    created: async (id: string, data: any, message: string) => {
      console.log("[activity] category.created", { id, data, message });
    },
    updated: async (id: string, oldData: any, newData: any, message: string) => {
      console.log("[activity] category.updated", { id, oldData, newData, message });
    },
    deleted: async (id: string, data: any, message: string) => {
      console.log("[activity] category.deleted", { id, data, message });
    },
  },
  user: {
    created: async (id: string, data: any, message: string) => {
      console.log("[activity] user.created", { id, data, message });
    },
    updated: async (id: string, oldData: any, newData: any, message: string) => {
      console.log("[activity] user.updated", { id, oldData, newData, message });
    },
    deleted: async (id: string, data: any, message: string) => {
      console.log("[activity] user.deleted", { id, data, message });
    },
  },
  workerPayment: {
    created: async (id: string, data: any, message: string) => {
      console.log("[activity] workerPayment.created", { id, data, message });
    },
    updated: async (id: string, oldData: any, newData: any, message: string) => {
      console.log("[activity] workerPayment.updated", { id, oldData, newData, message });
    },
    deleted: async (id: string, data: any, message: string) => {
      console.log("[activity] workerPayment.deleted", { id, data, message });
    },
  },
  cashBankEntry: {
    created: async (id: string, data: any, message: string) => {
      console.log("[activity] cashBankEntry.created", { id, data, message });
    },
    updated: async (id: string, oldData: any, newData: any, message: string) => {
      console.log("[activity] cashBankEntry.updated", { id, oldData, newData, message });
    },
    deleted: async (id: string, data: any, message: string) => {
      console.log("[activity] cashBankEntry.deleted", { id, data, message });
    },
  },
  dealer: {
    created: async (id: string, data: any, message: string) => {
      console.log("[activity] dealer.created", { id, data, message });
    },
    updated: async (id: string, oldData: any, newData: any, message: string) => {
      console.log("[activity] dealer.updated", { id, oldData, newData, message });
    },
    deleted: async (id: string, data: any, message: string) => {
      console.log("[activity] dealer.deleted", { id, data, message });
    },
  },
};