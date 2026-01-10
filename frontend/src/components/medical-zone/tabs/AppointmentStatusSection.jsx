// components/medical-zone/AppointmentStatusSection.jsx
import React from 'react';
import { Calendar, Clock, UserCheck } from 'lucide-react';

const AppointmentStatusSection = ({ data, onAdd }) => {
  const appointments = data.appointments || [];
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">All Appointments</h3>
        <button 
          onClick={() => onAdd('appointment')}
          className="px-4 py-2 bg-teal-100 text-teal-700 rounded-lg hover:bg-teal-200 flex items-center gap-2"
        >
          <span className="text-lg">+</span>
          New Appointment
        </button>
      </div>
      
      {appointments.length === 0 ? (
        <div className="text-center py-12">
          <UserCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No appointment history</p>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((appointment, index) => (
            <div key={appointment.id || index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-lg text-gray-900">{appointment.purpose || 'Appointment'}</h4>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="flex items-center gap-1 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      {appointment.date ? new Date(appointment.date).toLocaleDateString() : 'No date'}
                    </span>
                    <span className="flex items-center gap-1 text-gray-600">
                      <Clock className="w-4 h-4" />
                      {appointment.time || 'N/A'}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      (appointment.status || 'scheduled') === 'completed' ? 'bg-green-100 text-green-800' :
                      (appointment.status || 'scheduled') === 'cancelled' ? 'bg-red-100 text-red-800' :
                      (appointment.status || 'scheduled') === 'rescheduled' ? 'bg-yellow-100 text-yellow-800' :
                      (appointment.status || 'scheduled') === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {appointment.status || 'scheduled'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">
                    {appointment.doctor?.name || 'Unknown doctor'}
                  </span>
                </div>
              </div>
              {appointment.notes && (
                <p className="text-gray-600 mt-4 p-3 bg-gray-50 rounded-lg">{appointment.notes}</p>
              )}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Type: {appointment.type || 'Consultation'}</span>
                  <span>Priority: 
                    <span className={`ml-1 px-2 py-1 rounded ${
                      (appointment.priority || 'medium') === 'high' ? 'bg-red-100 text-red-800' :
                      (appointment.priority || 'medium') === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {appointment.priority || 'medium'}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AppointmentStatusSection;

