// components/MedicalForms.jsx
import React from 'react';
import { useForm } from 'react-hook-form';

const MedicalForms = ({ type, initialData, onSubmit, onCancel }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: initialData || {}
  });

  const submitForm = (data) => {
    onSubmit(data);
  };

  const renderSymptomForm = () => (
    <form onSubmit={handleSubmit(submitForm)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Symptom Name *
        </label>
        <input
          {...register('name', { required: 'Symptom name is required' })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          placeholder="e.g., Fever, Headache"
        />
        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Severity *
          </label>
          <select
            {...register('severity', { required: 'Severity is required' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">Select severity</option>
            <option value="low">Low</option>
            <option value="moderate">Moderate</option>
            <option value="high">High</option>
          </select>
          {errors.severity && <p className="text-red-500 text-sm mt-1">{errors.severity.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Duration
          </label>
          <input
            {...register('duration')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            placeholder="e.g., 3 days"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          {...register('description')}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          rows="3"
          placeholder="Describe the symptom..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Onset
          </label>
          <input
            {...register('onset')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            placeholder="e.g., Sudden, Gradual"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Pattern
          </label>
          <input
            {...register('pattern')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            placeholder="e.g., Intermittent, Continuous"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Triggers
        </label>
        <input
          {...register('triggers')}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          placeholder="e.g., Stress, Certain foods"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notes
        </label>
        <textarea
          {...register('notes')}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          rows="2"
          placeholder="Additional notes..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Status
        </label>
        <select
          {...register('status')}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
        >
          <option value="active">Active</option>
          <option value="resolved">Resolved</option>
          <option value="monitoring">Monitoring</option>
        </select>
      </div>
    </form>
  );

  const renderDiagnosisForm = () => (
    <form onSubmit={handleSubmit(submitForm)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Diagnosis Name *
        </label>
        <input
          {...register('name', { required: 'Diagnosis name is required' })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          placeholder="e.g., Acute Upper Respiratory Infection"
        />
        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Code
          </label>
          <input
            {...register('code')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            placeholder="e.g., ICD-10 code"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type
          </label>
          <select
            {...register('type')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="Primary">Primary</option>
            <option value="Secondary">Secondary</option>
            <option value="Differential">Differential</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Confidence Level
        </label>
        <select
          {...register('confidence')}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
        >
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notes
        </label>
        <textarea
          {...register('notes')}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          rows="4"
          placeholder="Detailed diagnosis notes..."
        />
      </div>
    </form>
  );

  const renderTreatmentForm = () => (
    <form onSubmit={handleSubmit(submitForm)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Treatment Name *
        </label>
        <input
          {...register('name', { required: 'Treatment name is required' })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          placeholder="e.g., Antibiotic Therapy"
        />
        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type
          </label>
          <select
            {...register('type')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="Medication">Medication</option>
            <option value="Therapy">Therapy</option>
            <option value="Surgery">Surgery</option>
            <option value="Lifestyle">Lifestyle Change</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Duration
          </label>
          <input
            {...register('duration')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            placeholder="e.g., 7 days"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Instructions *
        </label>
        <textarea
          {...register('instructions', { required: 'Instructions are required' })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          rows="4"
          placeholder="Detailed treatment instructions..."
        />
        {errors.instructions && <p className="text-red-500 text-sm mt-1">{errors.instructions.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Date
          </label>
          <input
            type="date"
            {...register('startDate')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            End Date
          </label>
          <input
            type="date"
            {...register('endDate')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>
      </div>
    </form>
  );

  const renderNoteForm = () => (
    <form onSubmit={handleSubmit(submitForm)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Note Content *
        </label>
        <textarea
          {...register('content', { required: 'Note content is required' })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          rows="6"
          placeholder="Enter clinical note..."
        />
        {errors.content && <p className="text-red-500 text-sm mt-1">{errors.content.message}</p>}
      </div>
    </form>
  );

  const renderForms = () => {
    switch (type) {
      case 'symptom':
        return renderSymptomForm();
      case 'diagnosis':
        return renderDiagnosisForm();
      case 'treatment':
        return renderTreatmentForm();
      case 'note':
        return renderNoteForm();
      case 'prescription':
        return renderTreatmentForm(); // Reuse treatment form for now
      case 'followUp':
        return renderTreatmentForm(); // Reuse treatment form for now
      default:
        return <div>Unknown form type: {type}</div>;
    }
  };

  return (
    <div>
      {renderForms()}
      <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit(submitForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {initialData ? 'Update' : 'Save'}
        </button>
      </div>
    </div>
  );
};

export default MedicalForms;