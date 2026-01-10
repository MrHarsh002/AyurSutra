const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');

const searchAll = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Please enter a search query"
      });
    }

    const regex = new RegExp(q, "i"); // case insensitive

    // Patients search
    const patients = await Patient.find({
      $or: [
        { fullName: regex },
        { phone: regex },
        { patientId: regex },
        { email: regex },
      ]
    }).limit(10);

    // Doctors search
    const doctors = await Doctor.find({
      $or: [
        { specialization: regex },
        { department: regex }
      ]
    }).populate("user", "name email phone").limit(10);

    // Appointments search
    const appointments = await Appointment.find({
      $or: [
        { status: regex },
      ]
    })
      .populate("patient", "fullName patientId")
      .populate("doctor", "department")
      .limit(10);

    res.json({
      success: true,
      message: `Results for "${q}"`,
      results: {
        patients,
        doctors,
        appointments
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

module.exports = { searchAll };
