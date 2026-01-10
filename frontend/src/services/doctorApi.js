import api from './api';

export const doctorApi = {

  getDoctors: async (params) => {
    try {
      const response = await api.get('/doctors', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching doctors:', error);
      throw error;
    }
  },

   getDoctorSchedule: async (doctorId, date) => {
    try {
      const params = date ? { date: date.toISOString().split("T")[0] } : {};
      const response = await api.get(`/doctors/${doctorId}/schedule`, { params });

      // ⭐ FIX — always return a proper object
      return response.data?.data || {
        doctor: null,
        date: null,
        totalAppointments: 0,
        appointments: [],
        timeSlots: [],
        stats: {}
      };
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  },

  getAllSchedules: async (date) => {
    try {
      const params = date ? { date: date.toISOString().split('T')[0] } : {};
      const response = await api.get('/doctors/all/schedules', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching all schedules:', error);
      throw error;
    }
  },

  updateAppointmentStatus: async (appointmentId, status, notes = '') => {
    try {
      const response = await api.put(`/appointments/${appointmentId}/status`, {
        status,
        notes
      });
      return response.data;
    } catch (error) {
      console.error('Error updating appointment status:', error);
      throw error;
    }
  },

  createAppointment: async (appointmentData) => {
    try {
      const response = await api.post('/appointments', appointmentData);
      return response.data;
    } catch (error) {
      console.error('Error creating appointment:', error);
      throw error;
    }
  },

  // 📌 FIXED EXPORT SCHEDULE
  exportSchedule: async (doctorId, startDate, endDate) => {
    try {

      if (!startDate || !endDate) {
        throw new Error("Start date and end date are required before export.");
      }

      const start = new Date(startDate);
      const end = new Date(endDate);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new Error("Date format invalid. Use YYYY-MM-DD.");
      }

      const response = await api.get(`/doctors/${doctorId}/export-schedule`, {
        params: {
          startDate: start.toISOString().split('T')[0],
          endDate: end.toISOString().split('T')[0]
        }
      });

      return response.data;

    } catch (error) {
      console.error('Error exporting schedule:', error.message);
      throw error;
    }
  }

};

export default doctorApi;
