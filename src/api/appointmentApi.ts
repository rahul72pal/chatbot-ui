import { apiClient } from '../utils/apiClient';

export interface Appointment {
  id: string;
  chatbot_id: string;
  chatbot_name?: string;
  name: string;
  email: string;
  contact_number: string;
  time: string;
  reason?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  created_at: string;
  updated_at?: string;
}

export const appointmentApi = {
  /**
   * Retrieves appointments for chatbots owned by the user, optionally filtered by chatbot ID.
   */
  getAppointments: async (chatbotId?: string): Promise<Appointment[]> => {
    const query = chatbotId ? `?chatbot_id=${encodeURIComponent(chatbotId)}` : '';
    return apiClient.get(`/appointments${query}`);
  },

  /**
   * Updates an appointment's status (pending, confirmed, cancelled, completed).
   */
  updateAppointmentStatus: async (
    appointmentId: string,
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  ): Promise<{ id: string; status: string; updated_at: string }> => {
    return apiClient.patch(`/appointments/${appointmentId}/status`, { status });
  },

  /**
   * Deletes an appointment record.
   */
  deleteAppointment: async (appointmentId: string): Promise<{ ok: boolean; message: string }> => {
    return apiClient.delete(`/appointments/${appointmentId}`);
  },
};

