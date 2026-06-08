import { api } from './api';

export const cxcService = {
  getAll: async () => {
    return api.get('/cxc');
  },
  getByCustomer: async (customerId) => {
    return api.get(`/cxc/customer/${customerId}`);
  },
  createPayment: async (account_receivable_id, amount, payment_method_id) => {
    return api.post('/cxc/payment', { account_receivable_id, amount, payment_method_id });
  }
};
