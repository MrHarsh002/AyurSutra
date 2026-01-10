import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import api from "../../services/api";

const AddClinicalNote = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [notesList, setNotesList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingNote, setEditingNote] = useState(null);

  const { register, handleSubmit, reset, setValue } = useForm({
    defaultValues: { content: "" }
  });

useEffect(() => {
  // Fetch notes when patientId changes
  const fetchNotes = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Fetching notes for patient ID:", patientId);
      
      const res = await api.get(`/medical-zone/${patientId}`);
      
      // Check if response has data
      if (res.data && res.data.notes) {
        setNotesList(res.data.notes || []);
      } else {
        setNotesList([]);
        setError("No notes data found in response");
      }
    } catch (err) {
      console.error("Error fetching notes:", err);
      setError(
        err.response?.data?.message || 
        err.message || 
        "Failed to load notes. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!patientId || patientId === ":patientId") {
    setError("Invalid patient ID. Please check the URL.");
    return;
  }
  fetchNotes();
}, [patientId]);

  // Add new note or update existing
  const onSubmit = async (data) => {
    if (!data.content || data.content.trim() === "") {
      alert("Please enter note content");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (editingNote) {
        // For now, we'll create a new note since your API doesn't have update
        // If you need update functionality, add it to your controller
        await api.post(`/medical-zone/${patientId}/notes`, data);
        setEditingNote(null);
        alert("Note updated successfully (created as new)");
      } else {
        await api.post(`/medical-zone/${patientId}/notes`, data);
        alert("Note added successfully");
      }
      
      reset();
      // Refresh the list by re-fetching
      const res = await api.get(`/medical-zone/${patientId}`);
      if (res.data && res.data.notes) {
        setNotesList(res.data.notes || []);
      }
    } catch (err) {
      console.error("Error saving note:", err);
      alert(
        err.response?.data?.message || 
        "Failed to save note. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Edit note
  const handleEdit = (note) => {
    setEditingNote(note);
    setValue("content", note.content);
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setEditingNote(null);
    reset();
  };

  // Delete note
  const handleDelete = async (noteId) => {
    if (!window.confirm("Are you sure you want to delete this note?")) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Make sure noteId is valid
      if (!noteId) {
        alert("Invalid note ID");
        return;
      }
      
      await api.delete(`/medical-zone/records/${noteId}`);
      alert("Note deleted successfully");
      // Refresh the list by re-fetching
      const res = await api.get(`/medical-zone/${patientId}`);
      if (res.data && res.data.notes) {
        setNotesList(res.data.notes || []);
      }
    } catch (err) {
      console.error("Error deleting note:", err);
      alert(
        err.response?.data?.message || 
        "Failed to delete note. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle no patient ID case
  if (!patientId || patientId === ":patientId") {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p className="font-bold">No patient selected</p>
          <p>Please select a patient from the patient list or check the URL.</p>
          <button
            onClick={() => navigate("/patients")}
            className="mt-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Go to Patients List
          </button>
        </div>
      </div>
    );
  }

  if (loading && notesList.length === 0) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-lg">Loading notes...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Clinical Notes</h1>
        <p className="text-gray-600">Patient ID: {patientId}</p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Existing Notes */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Existing Notes</h2>
        
        {notesList.length === 0 ? (
          <div className="bg-gray-100 border border-gray-300 rounded-lg p-6 text-center">
            <p className="text-gray-600">No clinical notes found for this patient.</p>
            <p className="text-gray-500 text-sm mt-1">Add your first note below.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notesList.map((note) => (
              <div 
                key={note.id || note._id || Math.random().toString(36).substr(2, 9)} 
                className="border border-gray-200 bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {note.author || "Unknown Doctor"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {note.date ? new Date(note.date).toLocaleDateString() : new Date().toLocaleDateString()}
                      {note.category && ` • ${note.category}`}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(note)}
                      className="text-xs bg-yellow-100 text-yellow-800 hover:bg-yellow-200 px-3 py-1 rounded transition-colors"
                      title="Edit note"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(note.id)}
                      className="text-xs bg-red-100 text-red-800 hover:bg-red-200 px-3 py-1 rounded transition-colors"
                      title="Delete note"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <div className="mt-2">
                  <h3 className="text-lg font-medium text-gray-800 mb-1">
                    {note.title || "Clinical Note"}
                  </h3>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {note.content || "No content"}
                  </p>
                  {note.tags && note.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {note.tags.map((tag, idx) => (
                        <span 
                          key={idx} 
                          className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Note Form */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          {editingNote ? "Edit Clinical Note" : "Add New Clinical Note"}
        </h2>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Note Content
            </label>
            <textarea
              {...register("content", { 
                required: "Note content is required",
                minLength: {
                  value: 10,
                  message: "Note must be at least 10 characters"
                }
              })}
              placeholder="Enter clinical notes, observations, or findings here..."
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition"
              rows={6}
            />
          </div>
          
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium py-2 px-6 rounded-lg transition-colors"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {editingNote ? "Updating..." : "Saving..."}
                </span>
              ) : (
                editingNote ? "Update Note" : "Save Note"
              )}
            </button>
            
            {editingNote && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-6 rounded-lg transition-colors"
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddClinicalNote;