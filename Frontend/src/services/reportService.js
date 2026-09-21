import { api } from './api';

export const reportService = {
  getSummary: async (startDate, endDate) => {
    const params = new URLSearchParams({ start_date: startDate, end_date: endDate });
    return api.get(`/reports/summary?${params}`);
  },

  getSalesByDate: async (startDate, endDate, groupBy = 'day') => {
    const params = new URLSearchParams({ start_date: startDate, end_date: endDate, group_by: groupBy });
    return api.get(`/reports/sales-by-date?${params}`);
  },

  getTopProducts: async (startDate, endDate, limit = 10) => {
    const params = new URLSearchParams({ start_date: startDate, end_date: endDate, limit: String(limit) });
    return api.get(`/reports/top-products?${params}`);
  },

  getRevenueByCourt: async (startDate, endDate) => {
    const params = new URLSearchParams({ start_date: startDate, end_date: endDate });
    return api.get(`/reports/revenue-by-court?${params}`);
  },

  getBookingReport: async (startDate, endDate, status) => {
    const params = new URLSearchParams({ start_date: startDate, end_date: endDate });
    if (status) params.set('status', status);
    return api.get(`/reports/booking-report?${params}`);
  },

  getTopCustomers: async (startDate, endDate, limit = 10) => {
    const params = new URLSearchParams({ start_date: startDate, end_date: endDate, limit: String(limit) });
    return api.get(`/reports/top-customers?${params}`);
  },

  getCourtUtilization: async (startDate, endDate) => {
    const params = new URLSearchParams({ start_date: startDate, end_date: endDate });
    return api.get(`/reports/court-utilization?${params}`);
  }
};
