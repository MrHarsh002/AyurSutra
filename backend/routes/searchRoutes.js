const express = require("express");
const router = express.Router();

const Patient = require("../models/Patient");
const Doctor = require("../models/Doctor");
const Appointment = require("../models/Appointment");

router.get("/", async (req, res) => {
  try {
    const q = req.query.q;
    if (!q || !q.trim()) {
      return res.status(400).json({ success: false, message: "Query missing" });
    }

    const regex = new RegExp(q, "i");

    const patients = await Patient.find({
      $or: [
        { fullName: regex },
        { phone: regex },
        { patientId: regex },
        { email: regex },
      ]
    }).limit(10);

    const doctors = await Doctor.find({
      $or: [
        { specialization: regex },
        { department: regex },
      ]
    })
      .populate("user", "name email phone") // NO regex on ObjectId
      .limit(10);

    const appointments = await Appointment.find({
      $or: [
        { status: regex },
        { appointmentId: regex },
      ]
    })
      .populate("patient", "fullName patientId")
      .populate("doctor", "specialization department")
      .limit(10);

    return res.json({
      success: true,
      query: q,
      results: { patients, doctors, appointments }
    });

  } catch (error) {
    console.error("Search error:", error.message);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
});

module.exports = router;
