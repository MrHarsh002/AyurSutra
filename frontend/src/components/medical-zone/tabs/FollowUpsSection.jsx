import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Divider,
  Tooltip,
  CircularProgress,
  Alert,
  Avatar,
  alpha,
  useTheme,
  Tabs,
  Tab,
  Stack,
  Badge
} from "@mui/material";
import {
  Add,
  Search,
  FilterList,
  Edit,
  Delete,
  Visibility,
  AccessTime,
  CalendarToday,
  Person,
  LocalHospital,
  CheckCircle,
  Schedule,
  Warning,
  Cancel,
  MoreVert,
  Close,
  Notifications,
  Phone,
  Email,
  LocationOn,
  Timer,
  ArrowForward,
  EventNote
} from "@mui/icons-material";
import { format, differenceInDays, isToday, isTomorrow } from "date-fns";
import api from "../../../services/api";
import { DatePicker, TimePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";

const FollowUpsSection = () => {
  const { patientId } = useParams();
  const theme = useTheme();
  const [followUps, setFollowUps] = useState([]);
  const [recentFollowUps, setRecentFollowUps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [tabValue, setTabValue] = useState(0);
  
  // Modal states
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  
  // Selected follow-up for operations
  const [selectedFollowUp, setSelectedFollowUp] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    date: new Date(),
    time: "09:00",
    purpose: "",
    priority: "medium",
    notes: "",
    duration: 30,
    location: "Clinic",
    reminder: true,
    reminderTime: "1 day before"
  });

  useEffect(() => {
    fetchFollowUps();
    fetchRecentFollowUps();
  }, [patientId, statusFilter, priorityFilter, searchTerm]);

  /* ================= FETCH FUNCTIONS ================= */
  const fetchFollowUps = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/medical-zone/${patientId}/follow-ups`, {
        params: {
          status: statusFilter !== "all" ? statusFilter : undefined,
          priority: priorityFilter !== "all" ? priorityFilter : undefined,
          search: searchTerm || undefined
        }
      });
      setFollowUps(res.data.followUps || []);
    } catch (err) {
      console.error("Failed to load follow-ups", err);
      setError("Failed to load follow-up appointments");
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentFollowUps = async () => {
    try {
      const res = await api.get(`/medical-zone/${patientId}/follow-ups/recent?limit=4`);
      setRecentFollowUps(res.data.followUps || []);
    } catch (err) {
      console.error("Failed to load recent follow-ups", err);
    }
  };

  /* ================= MODAL HANDLERS ================= */
  const handleOpenAddModal = () => {
    setFormData({
      date: new Date(),
      time: "09:00",
      purpose: "",
      priority: "medium",
      notes: "",
      duration: 30,
      location: "Clinic",
      reminder: true,
      reminderTime: "1 day before"
    });
    setAddModalOpen(true);
  };

  const handleOpenViewModal = (followUp) => {
    setSelectedFollowUp(followUp);
    setViewModalOpen(true);
  };

  const handleOpenEditModal = (followUp) => {
    setSelectedFollowUp(followUp);
    setFormData({
      date: new Date(followUp.date),
      time: followUp.time,
      purpose: followUp.purpose,
      priority: followUp.priority,
      notes: followUp.notes || "",
      duration: followUp.duration || 30,
      location: followUp.location || "Clinic",
      reminder: followUp.reminder !== false,
      reminderTime: followUp.reminderTime || "1 day before"
    });
    setEditModalOpen(true);
  };

  const handleOpenDeleteModal = (followUp) => {
    setSelectedFollowUp(followUp);
    setDeleteModalOpen(true);
  };

  const handleOpenCompleteModal = (followUp) => {
    setSelectedFollowUp(followUp);
    setCompleteModalOpen(true);
  };

  const handleOpenRescheduleModal = (followUp) => {
    setSelectedFollowUp(followUp);
    setFormData({
      date: new Date(followUp.date),
      time: followUp.time,
      reason: ""
    });
    setRescheduleModalOpen(true);
  };

  /* ================= FORM HANDLERS ================= */
const handleSubmitAdd = async () => {
  try {
    const payload = {
      date: formData.date,
      time: formData.time,
      reason: formData.reason,
      priority: formData.priority || "medium",
      doctor: formData.doctorId // REQUIRED
    };

    await api.post(
      `/medical-zone/${patientId}/follow-ups`,
      payload
    );

    setAddModalOpen(false);
    fetchFollowUps();
    fetchRecentFollowUps();
  } catch (err) {
    const message =
      err.response?.data?.message ||
      err.message ||
      "Unknown error";

    console.error("Failed to schedule follow-up:", err.response);
    alert("Failed to schedule follow-up: " + message);
  }
};




  const handleSubmitEdit = async () => {
    try {
      await api.put(`/medical-zone/follow-ups/${selectedFollowUp._id}`, formData);
      setEditModalOpen(false);
      fetchFollowUps();
      fetchRecentFollowUps();
    } catch (err) {
      console.error("Failed to update follow-up", err);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/medical-zone/follow-ups/${selectedFollowUp._id}`);
      setDeleteModalOpen(false);
      fetchFollowUps();
      fetchRecentFollowUps();
    } catch (err) {
      console.error("Failed to delete follow-up", err);
    }
  };

  const handleMarkComplete = async (outcomeNotes) => {
    try {
      await api.patch(`/medical-zone/follow-ups/${selectedFollowUp._id}/complete`, {
        outcomeNotes
      });
      setCompleteModalOpen(false);
      fetchFollowUps();
      fetchRecentFollowUps();
    } catch (err) {
      console.error("Failed to mark complete", err);
    }
  };

  const handleReschedule = async () => {
    try {
      await api.patch(`/medical-zone/follow-ups/${selectedFollowUp._id}/reschedule`, {
        newDate: formData.date,
        newTime: formData.time,
        reason: formData.reason
      });
      setRescheduleModalOpen(false);
      fetchFollowUps();
      fetchRecentFollowUps();
    } catch (err) {
      console.error("Failed to reschedule", err);
    }
  };

  /* ================= STATUS & PRIORITY CONFIG ================= */
  const statusConfig = {
    scheduled: { color: "warning", icon: <Schedule />, label: "Scheduled" },
    confirmed: { color: "info", icon: <CalendarToday />, label: "Confirmed" },
    rescheduled: { color: "secondary", icon: <AccessTime />, label: "Rescheduled" },
    completed: { color: "success", icon: <CheckCircle />, label: "Completed" },
    cancelled: { color: "error", icon: <Cancel />, label: "Cancelled" },
    "no-show": { color: "error", icon: <Warning />, label: "No Show" }
  };

  const priorityConfig = {
    low: { color: "success", bgColor: alpha(theme.palette.success.main, 0.1) },
    medium: { color: "warning", bgColor: alpha(theme.palette.warning.main, 0.1) },
    high: { color: "error", bgColor: alpha(theme.palette.error.main, 0.1) },
    critical: { color: "error", bgColor: alpha(theme.palette.error.main, 0.2) }
  };

  /* ================= FILTERED FOLLOW-UPS ================= */
  const filteredFollowUps = followUps.filter(followUp => {
    if (tabValue === 1 && followUp.status !== "scheduled") return false;
    if (tabValue === 2 && followUp.status !== "confirmed") return false;
    if (tabValue === 3 && followUp.status !== "completed") return false;
    return true;
  });

  const upcomingFollowUps = followUps.filter(f => 
    ["scheduled", "confirmed"].includes(f.status) && 
    new Date(f.date) >= new Date()
  );

  const overdueFollowUps = followUps.filter(f => 
    ["scheduled", "confirmed"].includes(f.status) && 
    new Date(f.date) < new Date()
  );

  /* ================= UI STATES ================= */
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* ================= HEADER ================= */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight="800" gutterBottom color="primary">
            Follow-up Appointments
          </Typography>
        </Box>

        {/* ================= STATS CARDS ================= */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={2} sx={{ borderRadius: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography color="text.secondary" variant="body2">
                      Total Follow-ups
                    </Typography>
                    <Typography variant="h4" fontWeight="700">
                      {followUps.length}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                    <CalendarToday color="primary" />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={2} sx={{ borderRadius: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography color="text.secondary" variant="body2">
                      Upcoming
                    </Typography>
                    <Typography variant="h4" fontWeight="700" color="primary">
                      {upcomingFollowUps.length}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: alpha(theme.palette.info.main, 0.1) }}>
                    <Schedule color="info" />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={2} sx={{ borderRadius: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography color="text.secondary" variant="body2">
                      Overdue
                    </Typography>
                    <Typography variant="h4" fontWeight="700" color="error">
                      {overdueFollowUps.length}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: alpha(theme.palette.error.main, 0.1) }}>
                    <Warning color="error" />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={2} sx={{ borderRadius: 3, cursor: 'pointer' }} onClick={handleOpenAddModal}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography color="text.secondary" variant="body2">
                      New Follow-up
                    </Typography>
                    <Typography variant="h6" fontWeight="700" color="primary">
                      Schedule Now
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: alpha(theme.palette.success.main, 0.1) }}>
                    <Add color="success" />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* ================= RECENT FOLLOW-UPS (4 CARDS) ================= */}
        <Typography variant="h6" fontWeight="600" sx={{ mb: 3, mt: 4 }}>
          Upcoming Follow-ups
        </Typography>
        
        {recentFollowUps.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3, mb: 4 }}>
            <CalendarToday sx={{ fontSize: 60, color: 'grey.300', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No upcoming follow-ups
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleOpenAddModal}
              sx={{ mt: 2 }}
            >
              Schedule First Follow-up
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={3} sx={{ mb: 6 }}>
            {recentFollowUps.map((followUp) => {
              const followUpDate = new Date(followUp.date);
              const daysUntil = differenceInDays(followUpDate, new Date());
              const isTodayFollowUp = isToday(followUpDate);
              const isTomorrowFollowUp = isTomorrow(followUpDate);
              
              return (
                <Grid item xs={12} sm={6} md={3} key={followUp._id}>
                  <Card
                    elevation={2}
                    sx={{
                      height: '100%',
                      borderRadius: 3,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      borderLeft: `4px solid ${priorityConfig[followUp.priority]?.color || theme.palette.primary.main}`,
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: theme.shadows[8]
                      }
                    }}
                    onClick={() => handleOpenViewModal(followUp)}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Chip
                          label={followUp.priority}
                          size="small"
                          sx={{
                            bgcolor: priorityConfig[followUp.priority]?.bgColor,
                            color: priorityConfig[followUp.priority]?.color,
                            fontWeight: 600
                          }}
                        />
                        <Box>
                          {isTodayFollowUp && (
                            <Chip label="Today" size="small" color="primary" sx={{ ml: 1 }} />
                          )}
                          {isTomorrowFollowUp && (
                            <Chip label="Tomorrow" size="small" color="secondary" sx={{ ml: 1 }} />
                          )}
                          {daysUntil < 0 && (
                            <Chip label="Overdue" size="small" color="error" sx={{ ml: 1 }} />
                          )}
                        </Box>
                      </Box>
                      
                      <Typography variant="h6" fontWeight="600" gutterBottom noWrap>
                        {followUp.purpose}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <CalendarToday sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {format(followUpDate, 'MMM dd, yyyy')}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <AccessTime sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {followUp.time} ({followUp.duration || 30} mins)
                        </Typography>
                      </Box>
                      
                      <Divider sx={{ my: 1.5 }} />
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ width: 32, height: 32, mr: 1 }}>
                            {followUp.doctor?.name?.charAt(0) || 'D'}
                          </Avatar>
                          <Typography variant="caption" color="text.secondary">
                            Dr. {followUp.doctor?.name?.split(' ')[0] || 'Unknown'}
                          </Typography>
                        </Box>
                        
                        <Box>
                          {daysUntil >= 0 ? (
                            <Typography variant="caption" color="primary" fontWeight="600">
                              In {daysUntil === 0 ? 'today' : `${daysUntil} day${daysUntil !== 1 ? 's' : ''}`}
                            </Typography>
                          ) : (
                            <Typography variant="caption" color="error" fontWeight="600">
                              {Math.abs(daysUntil)} day{Math.abs(daysUntil) !== 1 ? 's' : ''} ago
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}

        {/* ================= FILTER BAR & TABS ================= */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 4,
            borderRadius: 3,
            bgcolor: alpha(theme.palette.background.default, 0.7),
            border: `1px solid ${alpha(theme.palette.divider, 0.2)}`
          }}
        >
          <Tabs
            value={tabValue}
            onChange={(e, newValue) => setTabValue(newValue)}
            sx={{ mb: 3 }}
          >
            <Tab label="All Follow-ups" />
            <Tab label="Scheduled" />
            <Tab label="Confirmed" />
            <Tab label="Completed" />
          </Tabs>
          
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search follow-ups..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search color="action" />
                    </InputAdornment>
                  ),
                  sx: { borderRadius: 2 }
                }}
                size="small"
              />
            </Grid>
            
            <Grid item xs={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="Status"
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="scheduled">Scheduled</MenuItem>
                  <MenuItem value="confirmed">Confirmed</MenuItem>
                  <MenuItem value="rescheduled">Rescheduled</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                  <MenuItem value="no-show">No Show</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Priority</InputLabel>
                <Select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  label="Priority"
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="all">All Priorities</MenuItem>
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="critical">Critical</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={2} sx={{ textAlign: { md: 'right' } }}>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleOpenAddModal}
                sx={{
                  borderRadius: 2,
                  px: 3,
                  boxShadow: theme.shadows[2]
                }}
              >
                New
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* ================= FOLLOW-UPS LIST ================= */}
        {filteredFollowUps.length === 0 ? (
          <Paper sx={{ p: 8, textAlign: 'center', borderRadius: 3 }}>
            <CalendarToday sx={{ fontSize: 80, color: 'grey.300', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No follow-ups found
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all'
                ? 'Try changing your filters'
                : 'Schedule your first follow-up appointment'}
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleOpenAddModal}
            >
              Schedule Follow-up
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {filteredFollowUps.map((followUp) => {
              const followUpDate = new Date(followUp.date);
              const daysUntil = differenceInDays(followUpDate, new Date());
              const isOverdue = daysUntil < 0 && ["scheduled", "confirmed"].includes(followUp.status);
              
              return (
                <Grid item xs={12} key={followUp._id}>
                  <Paper
                    elevation={1}
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      borderLeft: `4px solid ${priorityConfig[followUp.priority]?.color || theme.palette.primary.main}`,
                      transition: 'all 0.2s ease',
                      bgcolor: isOverdue ? alpha(theme.palette.error.main, 0.05) : 'transparent',
                      '&:hover': {
                        boxShadow: theme.shadows[4],
                        transform: 'translateX(4px)'
                      }
                    }}
                  >
                    <Grid container spacing={2} alignItems="center">
                      {/* Date Column */}
                      <Grid item xs={12} md={2}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h5" fontWeight="700" color="primary">
                            {format(followUpDate, 'dd')}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {format(followUpDate, 'MMM')}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {format(followUpDate, 'yyyy')}
                          </Typography>
                          <Typography variant="body2" fontWeight="600" sx={{ mt: 1 }}>
                            {followUp.time}
                          </Typography>
                        </Box>
                      </Grid>
                      
                      {/* Details Column */}
                      <Grid item xs={12} md={6}>
                        <Box>
                          <Typography variant="h6" fontWeight="600" gutterBottom>
                            {followUp.purpose}
                          </Typography>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                            <Chip
                              icon={statusConfig[followUp.status]?.icon}
                              label={statusConfig[followUp.status]?.label}
                              size="small"
                              color={statusConfig[followUp.status]?.color}
                              variant="outlined"
                            />
                            
                            <Chip
                              label={followUp.priority}
                              size="small"
                              sx={{
                                bgcolor: priorityConfig[followUp.priority]?.bgColor,
                                color: priorityConfig[followUp.priority]?.color,
                                fontWeight: 600
                              }}
                            />
                            
                            {isOverdue && (
                              <Chip label="Overdue" size="small" color="error" />
                            )}
                          </Box>
                          
                          {followUp.notes && (
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden'
                              }}
                            >
                              {followUp.notes}
                            </Typography>
                          )}
                          
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Person sx={{ fontSize: 16, color: 'text.secondary' }} />
                              <Typography variant="caption" color="text.secondary">
                                Dr. {followUp.doctor?.name}
                              </Typography>
                            </Box>
                            
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <LocationOn sx={{ fontSize: 16, color: 'text.secondary' }} />
                              <Typography variant="caption" color="text.secondary">
                                {followUp.location || 'Clinic'}
                              </Typography>
                            </Box>
                            
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Timer sx={{ fontSize: 16, color: 'text.secondary' }} />
                              <Typography variant="caption" color="text.secondary">
                                {followUp.duration || 30} mins
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      </Grid>
                      
                      {/* Actions Column */}
                      <Grid item xs={12} md={4}>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenViewModal(followUp)}
                              color="primary"
                            >
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                          
                          {followUp.status === 'scheduled' || followUp.status === 'confirmed' ? (
                            <>
                              <Tooltip title="Mark Complete">
                                <IconButton
                                  size="small"
                                  onClick={() => handleOpenCompleteModal(followUp)}
                                  color="success"
                                >
                                  <CheckCircle />
                                </IconButton>
                              </Tooltip>
                              
                              <Tooltip title="Reschedule">
                                <IconButton
                                  size="small"
                                  onClick={() => handleOpenRescheduleModal(followUp)}
                                  color="secondary"
                                >
                                  <Schedule />
                                </IconButton>
                              </Tooltip>
                              
                              <Tooltip title="Edit">
                                <IconButton
                                  size="small"
                                  onClick={() => handleOpenEditModal(followUp)}
                                >
                                  <Edit />
                                </IconButton>
                              </Tooltip>
                            </>
                          ) : null}
                          
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDeleteModal(followUp)}
                              color="error"
                            >
                              <Delete />
                            </IconButton>
                          </Tooltip>
                        </Box>
                        
                        <Box sx={{ mt: 2, textAlign: 'right' }}>
                          {daysUntil >= 0 ? (
                            <Typography variant="caption" color="text.secondary">
                              {daysUntil === 0 
                                ? 'Today' 
                                : daysUntil === 1 
                                  ? 'Tomorrow' 
                                  : `${daysUntil} days remaining`
                              }
                            </Typography>
                          ) : (
                            <Typography variant="caption" color="error" fontWeight="600">
                              {Math.abs(daysUntil)} day{Math.abs(daysUntil) !== 1 ? 's' : ''} overdue
                            </Typography>
                          )}
                        </Box>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        )}

        {/* ================= ADD FOLLOW-UP MODAL ================= */}
        <AddEditFollowUpModal
          open={addModalOpen}
          onClose={() => setAddModalOpen(false)}
          title="Schedule Follow-up"
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSubmitAdd}
          submitText="Schedule"
        />

        {/* ================= VIEW FOLLOW-UP MODAL ================= */}
        <ViewFollowUpModal
          open={viewModalOpen}
          onClose={() => setViewModalOpen(false)}
          followUp={selectedFollowUp}
          onEdit={() => {
            setViewModalOpen(false);
            handleOpenEditModal(selectedFollowUp);
          }}
          onComplete={() => {
            setViewModalOpen(false);
            handleOpenCompleteModal(selectedFollowUp);
          }}
          onReschedule={() => {
            setViewModalOpen(false);
            handleOpenRescheduleModal(selectedFollowUp);
          }}
          onDelete={() => {
            setViewModalOpen(false);
            handleOpenDeleteModal(selectedFollowUp);
          }}
        />

        {/* ================= EDIT FOLLOW-UP MODAL ================= */}
        <AddEditFollowUpModal
          open={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          title="Edit Follow-up"
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSubmitEdit}
          submitText="Update"
        />

        {/* ================= DELETE CONFIRMATION MODAL ================= */}
        <DeleteConfirmationModal
          open={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={handleDelete}
          title={selectedFollowUp?.purpose}
        />

        {/* ================= COMPLETE FOLLOW-UP MODAL ================= */}
        <CompleteFollowUpModal
          open={completeModalOpen}
          onClose={() => setCompleteModalOpen(false)}
          onComplete={handleMarkComplete}
          followUp={selectedFollowUp}
        />

        {/* ================= RESCHEDULE MODAL ================= */}
        <RescheduleFollowUpModal
          open={rescheduleModalOpen}
          onClose={() => setRescheduleModalOpen(false)}
          formData={formData}
          setFormData={setFormData}
          onReschedule={handleReschedule}
          followUp={selectedFollowUp}
        />
      </Container>
    </LocalizationProvider>
  );
};

// ================= REUSABLE MODAL COMPONENTS =================

const AddEditFollowUpModal = ({ open, onClose, title, formData, setFormData, onSubmit, submitText }) => {
  const theme = useTheme();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ borderBottom: `1px solid ${theme.palette.divider}`, pb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" fontWeight="600">{title}</Typography>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ pt: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <DatePicker
              label="Date"
              value={formData.date}
              onChange={(newDate) => setFormData({...formData, date: newDate})}
              slotProps={{
                textField: {
                  fullWidth: true,
                  required: true
                }
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TimePicker
              label="Time"
              value={new Date(`1970-01-01T${formData.time}`)}
              onChange={(newTime) => {
                const timeString = newTime ? format(newTime, 'HH:mm') : '09:00';
                setFormData({...formData, time: timeString});
              }}
              slotProps={{
                textField: {
                  fullWidth: true,
                  required: true
                }
              }}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Purpose"
              value={formData.purpose}
              onChange={(e) => setFormData({...formData, purpose: e.target.value})}
              required
              multiline
              rows={2}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={formData.priority}
                onChange={(e) => setFormData({...formData, priority: e.target.value})}
                label="Priority"
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="critical">Critical</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Duration (minutes)"
              type="number"
              value={formData.duration}
              onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value) || 30})}
              InputProps={{
                endAdornment: <InputAdornment position="end">mins</InputAdornment>
              }}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Location"
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Notes"
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              multiline
              rows={3}
            />
          </Grid>
          
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Reminder</InputLabel>
                <Select
                  value={formData.reminderTime}
                  onChange={(e) => setFormData({...formData, reminderTime: e.target.value})}
                  label="Reminder"
                >
                  <MenuItem value="1 hour before">1 hour before</MenuItem>
                  <MenuItem value="2 hours before">2 hours before</MenuItem>
                  <MenuItem value="1 day before">1 day before</MenuItem>
                  <MenuItem value="2 days before">2 days before</MenuItem>
                  <MenuItem value="1 week before">1 week before</MenuItem>
                  <MenuItem value="no reminder">No reminder</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, pb: 3, borderTop: `1px solid ${theme.palette.divider}`, pt: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={onSubmit}
          disabled={!formData.purpose || !formData.date}
        >
          {submitText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const ViewFollowUpModal = ({ open, onClose, followUp, onEdit, onComplete, onReschedule, onDelete }) => {
  const theme = useTheme();
  
  if (!followUp) return null;
  
  const followUpDate = new Date(followUp.date);
  const daysUntil = differenceInDays(followUpDate, new Date());
  
  const statusConfig = {
    scheduled: { color: "warning", icon: <Schedule /> },
    confirmed: { color: "info", icon: <CalendarToday /> },
    completed: { color: "success", icon: <CheckCircle /> },
    cancelled: { color: "error", icon: <Cancel /> },
    "no-show": { color: "error", icon: <Warning /> }
  };
  
  const priorityConfig = {
    low: { color: "success", bgColor: alpha(theme.palette.success.main, 0.1) },
    medium: { color: "warning", bgColor: alpha(theme.palette.warning.main, 0.1) },
    high: { color: "error", bgColor: alpha(theme.palette.error.main, 0.1) },
    critical: { color: "error", bgColor: alpha(theme.palette.error.main, 0.2) }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ borderBottom: `1px solid ${theme.palette.divider}`, pb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" fontWeight="600">{followUp.purpose}</Typography>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ pt: 3 }}>
        <Grid container spacing={3}>
          {/* Left Column */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, borderRadius: 2, mb: 3 }}>
              <Typography variant="h6" fontWeight="600" gutterBottom>
                Appointment Details
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <InfoItem icon={<CalendarToday />} label="Date" value={format(followUpDate, 'PPPP')} />
                </Grid>
                <Grid item xs={6}>
                  <InfoItem icon={<AccessTime />} label="Time" value={`${followUp.time} (${followUp.duration || 30} mins)`} />
                </Grid>
                <Grid item xs={6}>
                  <InfoItem icon={<LocationOn />} label="Location" value={followUp.location || 'Clinic'} />
                </Grid>
                <Grid item xs={6}>
                  <InfoItem 
                    icon={statusConfig[followUp.status]?.icon} 
                    label="Status" 
                    value={
                      <Chip
                        label={followUp.status}
                        size="small"
                        color={statusConfig[followUp.status]?.color}
                        sx={{ textTransform: 'capitalize' }}
                      />
                    }
                  />
                </Grid>
                <Grid item xs={6}>
                  <InfoItem 
                    icon={<Warning />} 
                    label="Priority" 
                    value={
                      <Chip
                        label={followUp.priority}
                        size="small"
                        sx={{
                          bgcolor: priorityConfig[followUp.priority]?.bgColor,
                          color: priorityConfig[followUp.priority]?.color,
                          fontWeight: 600
                        }}
                      />
                    }
                  />
                </Grid>
                <Grid item xs={6}>
                  <InfoItem 
                    icon={<Notifications />} 
                    label="Reminder" 
                    value={followUp.reminderTime || '1 day before'} 
                  />
                </Grid>
              </Grid>
            </Paper>
            
            {followUp.notes && (
              <Paper sx={{ p: 3, borderRadius: 2, mb: 3 }}>
                <Typography variant="h6" fontWeight="600" gutterBottom>
                  Notes
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="body1" style={{ whiteSpace: 'pre-wrap' }}>
                  {followUp.notes}
                </Typography>
              </Paper>
            )}
            
            {followUp.outcomeNotes && (
              <Paper sx={{ p: 3, borderRadius: 2, bgcolor: alpha(theme.palette.success.main, 0.05) }}>
                <Typography variant="h6" fontWeight="600" gutterBottom color="success">
                  Outcome Notes
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="body1" style={{ whiteSpace: 'pre-wrap' }}>
                  {followUp.outcomeNotes}
                </Typography>
                {followUp.completedAt && (
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                    Completed on {format(new Date(followUp.completedAt), 'PPpp')}
                  </Typography>
                )}
              </Paper>
            )}
          </Grid>
          
          {/* Right Column */}
          <Grid item xs={12} md={4}>
            {/* Doctor Info */}
            <Paper sx={{ p: 3, borderRadius: 2, mb: 3 }}>
              <Typography variant="h6" fontWeight="600" gutterBottom>
                Doctor
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ width: 60, height: 60, bgcolor: 'primary.main' }}>
                  {followUp.doctor?.name?.charAt(0) || 'D'}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" fontWeight="600">
                    Dr. {followUp.doctor?.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {followUp.doctor?.specialty || 'General Physician'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    {followUp.doctor?.email}
                  </Typography>
                </Box>
              </Box>
            </Paper>
            
            {/* Timeline Info */}
            <Paper sx={{ p: 3, borderRadius: 2, mb: 3 }}>
              <Typography variant="h6" fontWeight="600" gutterBottom>
                Timeline
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Stack spacing={2}>
                <TimelineItem
                  label="Created"
                  value={format(new Date(followUp.createdAt), 'PPpp')}
                />
                {followUp.updatedAt && followUp.updatedAt !== followUp.createdAt && (
                  <TimelineItem
                    label="Last Updated"
                    value={format(new Date(followUp.updatedAt), 'PPpp')}
                  />
                )}
                <TimelineItem
                  label="Days Remaining"
                  value={
                    <Typography color={daysUntil < 0 ? 'error' : daysUntil === 0 ? 'primary' : 'text.primary'}>
                      {daysUntil < 0 
                        ? `${Math.abs(daysUntil)} day${Math.abs(daysUntil) !== 1 ? 's' : ''} ago` 
                        : daysUntil === 0 
                          ? 'Today' 
                          : `${daysUntil} day${daysUntil !== 1 ? 's' : ''}`
                      }
                    </Typography>
                  }
                />
              </Stack>
            </Paper>
            
            {/* Quick Actions */}
            <Paper sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" fontWeight="600" gutterBottom>
                Actions
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Stack spacing={1}>
                {followUp.status === 'scheduled' || followUp.status === 'confirmed' ? (
                  <>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<CheckCircle />}
                      onClick={onComplete}
                    >
                      Mark Complete
                    </Button>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<Schedule />}
                      onClick={onReschedule}
                    >
                      Reschedule
                    </Button>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<Edit />}
                      onClick={onEdit}
                    >
                      Edit
                    </Button>
                  </>
                ) : null}
                <Button
                  fullWidth
                  variant="outlined"
                  color="error"
                  startIcon={<Delete />}
                  onClick={onDelete}
                >
                  Delete
                </Button>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, pb: 3, pt: 2 }}>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

const DeleteConfirmationModal = ({ open, onClose, onConfirm, title }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm">
      <DialogTitle>Delete Follow-up</DialogTitle>
      <DialogContent>
        <Box sx={{ textAlign: 'center', py: 2 }}>
          <Warning sx={{ fontSize: 60, color: 'error.main', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Delete "{title}"?
          </Typography>
          <Typography color="text.secondary">
            This action cannot be undone. This follow-up appointment will be permanently deleted.
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onConfirm} color="error" variant="contained">
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const CompleteFollowUpModal = ({ open, onClose, onComplete, followUp }) => {
  const [outcomeNotes, setOutcomeNotes] = useState("");
  
  if (!followUp) return null;
  
  const handleSubmit = () => {
    onComplete(outcomeNotes);
    setOutcomeNotes("");
  };
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Complete Follow-up</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Mark "{followUp.purpose}" as complete?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Date: {format(new Date(followUp.date), 'PP')} at {followUp.time}
          </Typography>
        </Box>
        
        <TextField
          fullWidth
          multiline
          rows={4}
          label="Outcome Notes"
          placeholder="Enter outcome, findings, or notes from this follow-up..."
          value={outcomeNotes}
          onChange={(e) => setOutcomeNotes(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" color="success">
          Mark Complete
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const RescheduleFollowUpModal = ({ open, onClose, formData, setFormData, onReschedule, followUp }) => {
  if (!followUp) return null;
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Reschedule Follow-up</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Current: {format(new Date(followUp.date), 'PP')} at {followUp.time}
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <DatePicker
              label="New Date"
              value={formData.date}
              onChange={(newDate) => setFormData({...formData, date: newDate})}
              slotProps={{
                textField: {
                  fullWidth: true,
                  required: true
                }
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TimePicker
              label="New Time"
              value={new Date(`1970-01-01T${formData.time}`)}
              onChange={(newTime) => {
                const timeString = newTime ? format(newTime, 'HH:mm') : '09:00';
                setFormData({...formData, time: timeString});
              }}
              slotProps={{
                textField: {
                  fullWidth: true,
                  required: true
                }
              }}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Reason for Reschedule"
              value={formData.reason}
              onChange={(e) => setFormData({...formData, reason: e.target.value})}
              multiline
              rows={2}
              placeholder="Enter reason for rescheduling..."
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onReschedule} variant="contained">
          Reschedule
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ================= HELPER COMPONENTS =================

const InfoItem = ({ icon, label, value }) => (
  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
    <Box sx={{ color: 'primary.main', mr: 2, mt: 0.5 }}>
      {icon}
    </Box>
    <Box sx={{ flex: 1 }}>
      <Typography variant="caption" color="text.secondary" display="block">
        {label}
      </Typography>
      <Typography variant="body2" fontWeight="500">
        {value}
      </Typography>
    </Box>
  </Box>
);

const TimelineItem = ({ label, value }) => (
  <Box>
    <Typography variant="caption" color="text.secondary" display="block">
      {label}
    </Typography>
    <Typography variant="body2">
      {value}
    </Typography>
  </Box>
);

export default FollowUpsSection;