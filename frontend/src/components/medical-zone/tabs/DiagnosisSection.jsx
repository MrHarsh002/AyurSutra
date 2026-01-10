// src/components/medical-zone/DiagnosisSection.jsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Edit, Plus, X, Trash2, Calendar, User } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../../services/api";

const ITEMS_PER_PAGE = 4;

const DiagnosisSection = () => {
  const { patientId } = useParams();

  const [medicalData, setMedicalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editDiagnosis, setEditDiagnosis] = useState(null);
  const [page, setPage] = useState(1);

  const { register, handleSubmit, reset } = useForm();

  // ================= FETCH =================
  const fetchMedicalData = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/medical-zone/${patientId}`);
      setMedicalData(res.data);
      setPage(1);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load diagnosis data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (patientId) fetchMedicalData();
  }, [patientId]);

  // ================= MODAL =================
  const openModal = (diagnosis = null) => {
    if (diagnosis) {
      reset({
        name: diagnosis.name,
        notes: diagnosis.notes,
        confidence: diagnosis.confidence,
        type: diagnosis.type === "Primary" ? "routine" : "follow-up",
      });
    } else {
      reset({
        name: "",
        notes: "",
        confidence: "High",
        type: "routine",
      });
    }

    setEditDiagnosis(diagnosis);
    setShowModal(true);
  };

  // ================= DELETE =================
  const onDelete = async (recordId) => {
    if (!window.confirm("Delete this diagnosis?")) return;

    try {
      await api.delete(`/medical-zone/${patientId}/diagnosis/${recordId}`);
      toast.success("Diagnosis deleted");
      fetchMedicalData();
    } catch (err) {
      console.error(err);
      toast.error("Delete failed");
    }
  };

  // ================= SUBMIT =================
  const onSubmit = async (data) => {
    try {
      if (editDiagnosis) {
        await api.put(
          `/medical-zone/${patientId}/diagnosis/${editDiagnosis.id}`,
          data
        );
        toast.success("Diagnosis updated");
      } else {
        await api.post(`/medical-zone/${patientId}/diagnosis`, data);
        toast.success("Diagnosis added");
      }

      setShowModal(false);
      fetchMedicalData();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Save failed");
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  const diagnoses = medicalData?.diagnoses || [];
  const totalPages = Math.ceil(diagnoses.length / ITEMS_PER_PAGE);

  const paginated = diagnoses.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  // ================= UI =================
  return (
    <div className="p-6 relative">
      {/* ADD */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => openModal()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Diagnosis
        </button>
      </div>

      {/* LIST */}
      {paginated.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No diagnoses recorded
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {paginated.map((d) => (
            <div key={d.id} className="bg-white p-6 rounded-xl border shadow">
              <div className="flex justify-between mb-3">
                <div>
                  <h4 className="font-bold text-lg">{d.name}</h4>
                  <div className="flex gap-2 text-xs mt-1">
                    <span className="bg-green-100 px-2 py-1 rounded">
                      {d.confidence || "High"}
                    </span>
                    <span className="bg-blue-100 px-2 py-1 rounded">
                      {d.type}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openModal(d)}>
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => onDelete(d.id)}>
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>

              <p className="text-gray-600">{d.notes || "No notes"}</p>

              <div className="flex justify-between text-xs text-gray-500 mt-4">
                <span className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  {d.doctor?.name || "Doctor"}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(d.date).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-4 mt-8">
          <button
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Prev
          </button>

          <span className="text-sm">
            Page {page} / {totalPages}
          </span>

          <button
            disabled={page === totalPages}
            onClick={() => setPage(p => p + 1)}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-bold">
                {editDiagnosis ? "Edit Diagnosis" : "Add Diagnosis"}
              </h2>
              <button onClick={() => setShowModal(false)}>
                <X />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <input {...register("name", { required: true })} placeholder="Diagnosis name" className="w-full border p-2 rounded" />

              <select {...register("type")} className="w-full border p-2 rounded">
                <option value="routine">Primary</option>
                <option value="follow-up">Follow-up</option>
                <option value="emergency">Emergency</option>
                <option value="other">Other</option>
              </select>

              <textarea {...register("notes")} rows={3} className="w-full border p-2 rounded" />

              <select {...register("confidence")} className="w-full border p-2 rounded">
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>

              <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded">
                {editDiagnosis ? "Update" : "Add"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiagnosisSection;
