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
  Badge,
  Avatar,
  alpha,
  useTheme
} from "@mui/material";
import {
  Add,
  Search,
  FilterList,
  Edit,
  Delete,
  Visibility,
  AccessTime,
  LocalHospital,
  Person,
  Label,
  PriorityHigh,
  DateRange,
  MoreVert,
  Close,
  Download,
  Share,
  Print
} from "@mui/icons-material";
import api from "../../../services/api";
import { format, parseISO, isValid } from "date-fns";

const NotesSection = () => {
  const { patientId } = useParams();
  const theme = useTheme();
  const [notes, setNotes] = useState([]);
  const [recentNotes, setRecentNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  
  // Modal states
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  
  // Selected note for operations
  const [selectedNote, setSelectedNote] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "clinical_note",
    priority: "medium",
    tags: []
  });
  
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    fetchNotes();
  }, [patientId, searchTerm, categoryFilter]);

  /* ================= FETCH FUNCTIONS ================= */
  const fetchNotes = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/medical-zone/${patientId}/notes`, {
        params: {
          search: searchTerm || undefined,
          category: categoryFilter !== "all" ? categoryFilter : undefined,
          limit: 50
        }
      });
      const notesData = res.data.notes || [];
      setNotes(notesData);
      
      // Get recent notes from the same response (first 4)
      setRecentNotes(notesData.slice(0, 4));
    } catch (err) {
      console.error("Failed to load notes", err);
      setError("Failed to load clinical notes");
    } finally {
      setLoading(false);
    }
  };

  /* ================= FILTERED NOTES ================= */
  const filteredNotes = notes.filter(note => {
    if (priorityFilter !== "all" && note.priority !== priorityFilter) return false;
    return true;
  });

  /* ================= MODAL HANDLERS ================= */
  const handleOpenAddModal = () => {
    setFormData({
      title: "",
      content: "",
      category: "clinical_note",
      priority: "medium",
      tags: []
    });
    setAddModalOpen(true);
  };

  const handleOpenViewModal = (note) => {
    setSelectedNote(note);
    setViewModalOpen(true);
  };

  const handleOpenEditModal = (note) => {
    setSelectedNote(note);
    setFormData({
      title: note.title || note.diagnosis || "Untitled Note",
      content: note.content || note.notes || "",
      category: note.category || note.visitType || "clinical_note",
      priority: note.priority || "medium",
      tags: note.tags || []
    });
    setEditModalOpen(true);
  };

  const handleOpenDeleteModal = (note) => {
    setSelectedNote(note);
    setDeleteModalOpen(true);
  };

  /* ================= FORM HANDLERS ================= */
  const handleSubmitAdd = async () => {
    try {
      await api.post(`/medical-zone/${patientId}/notes`, {
        title: formData.title,
        content: formData.content,
        category: formData.category,
        priority: formData.priority,
        tags: formData.tags
      });

      setAddModalOpen(false);
      fetchNotes();
    } catch (err) {
      console.error("Failed to add note", err);
    }
  };

  const handleSubmitEdit = async () => {
    try {
      await api.put(`/medical-zone/notes/${selectedNote.id}`, {
        title: formData.title,
        content: formData.content,
        category: formData.category,
        priority: formData.priority,
        tags: formData.tags
      });

      setEditModalOpen(false);
      fetchNotes();
    } catch (err) {
      console.error("Failed to update note", err);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/medical-zone/notes/${selectedNote.id}`);
      setDeleteModalOpen(false);
      fetchNotes();
    } catch (err) {
      console.error("Failed to delete note", err);
    }
  };

  const handleAddTag = () => {
    if (tagInput && !formData.tags.includes(tagInput)) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput]
      });
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      handleAddTag();
    }
  };

  /* ================= PRIORITY CONFIG ================= */
  const priorityConfig = {
    low: { color: "success", icon: "🟢" },
    medium: { color: "warning", icon: "🟡" },
    high: { color: "error", icon: "🔴" },
    critical: { color: "error", icon: "💀" }
  };

  const categoryColors = {
    consultation: "#4CAF50",
    followup: "#2196F3",
    emergency: "#F44336",
    clinical_note: "#9C27B0",
    other: "#FF9800"
  };

  /* ================= HELPER FUNCTIONS ================= */
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = parseISO(dateString);
      return isValid(date) ? format(date, 'MMM dd, yyyy') : "Invalid date";
    } catch {
      return "Invalid date";
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = parseISO(dateString);
      return isValid(date) ? format(date, 'PPpp') : "Invalid date";
    } catch {
      return "Invalid date";
    }
  };

  const getNoteTitle = (note) => {
  if (!note) return "Untitled Note";
  return note.title || "Untitled Note";
};

  const getNoteContent = (note) => {
    return note.content || note.notes || "No content available";
  };

  const getNoteCategory = (note) => {
    return note.category || note.visitType || "clinical_note";
  };

  /* ================= UI STATES ================= */
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* ================= HEADER ================= */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="800" gutterBottom color="primary">
          Clinical Notes
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Manage patient clinical notes, observations, and medical records
        </Typography>
      </Box>

      {/* ================= SEARCH & FILTER BAR ================= */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 4,
          borderRadius: 3,
          bgcolor: alpha(theme.palette.primary.main, 0.03),
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search notes..."
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
          
          <Grid item xs={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Category</InputLabel>
              <Select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                label="Category"
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="all">All Categories</MenuItem>
                <MenuItem value="consultation">Consultation</MenuItem>
                <MenuItem value="followup">Follow-up</MenuItem>
                <MenuItem value="emergency">Emergency</MenuItem>
                <MenuItem value="clinical_note">Clinical Note</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={6} md={2}>
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
          
          <Grid item xs={12} md={4} sx={{ textAlign: { md: 'right' } }}>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleOpenAddModal}
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1,
                boxShadow: theme.shadows[3],
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
              }}
            >
              New Note
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* ================= RECENT NOTES CARDS (4 CARDS) ================= */}
      {recentNotes.length > 0 && (
        <>
          <Typography variant="h6" fontWeight="600" sx={{ mb: 3 }}>
            Recent Notes
          </Typography>
          
          <Grid container spacing={3} sx={{ mb: 6 }}>
            {recentNotes.map((note) => (
              <Grid item xs={12} sm={6} md={3} key={note.id || note._id}>
                <Card
                  elevation={2}
                  sx={{
                    height: '100%',
                    borderRadius: 3,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: theme.shadows[8],
                      borderLeft: `4px solid ${categoryColors[getNoteCategory(note)] || theme.palette.primary.main}`
                    }
                  }}
                  onClick={() => handleOpenViewModal(note)}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Chip
                        label={getNoteCategory(note)}
                        size="small"
                        sx={{
                          bgcolor: alpha(categoryColors[getNoteCategory(note)] || theme.palette.primary.main, 0.1),
                          color: categoryColors[getNoteCategory(note)] || theme.palette.primary.main,
                          fontWeight: 600,
                          textTransform: 'capitalize'
                        }}
                      />
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">
                          {priorityConfig[note.priority]?.icon || "⚪"}
                        </Typography>
                        <Typography variant="caption" fontWeight="600" color={`${priorityConfig[note.priority]?.color}.main`}>
                          {note.priority || "medium"}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Typography variant="h6" fontWeight="600" gutterBottom noWrap>
                      {getNoteTitle(note)}
                    </Typography>
                    
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mb: 2,
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      {getNoteContent(note)}
                    </Typography>
                    
                    <Divider sx={{ my: 1.5 }} />
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary" display="block">
                          <AccessTime sx={{ fontSize: 12, mr: 0.5, verticalAlign: 'middle' }} />
                          {formatDate(note.date || note.createdAt)}
                        </Typography>
                        {note.doctor?.name && (
                          <Typography variant="caption" color="text.secondary">
                            <Person sx={{ fontSize: 12, mr: 0.5, verticalAlign: 'middle' }} />
                            {note.doctor.name.split(' ')[0] || 'Doctor'}
                          </Typography>
                        )}
                      </Box>
                      
                      {note.tags && note.tags.length > 0 && (
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          {note.tags.slice(0, 2).map((tag, idx) => (
                            <Chip
                              key={idx}
                              label={tag}
                              size="small"
                              variant="outlined"
                              sx={{ height: 20, fontSize: '0.6rem' }}
                            />
                          ))}
                        </Box>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {/* ================= ALL NOTES LIST ================= */}
      <Typography variant="h6" fontWeight="600" sx={{ mb: 3 }}>
        All Notes ({filteredNotes.length})
      </Typography>
      
      {filteredNotes.length === 0 ? (
        <Paper
          sx={{
            p: 8,
            textAlign: 'center',
            borderRadius: 3,
            bgcolor: alpha(theme.palette.background.default, 0.5)
          }}
        >
          <LocalHospital sx={{ fontSize: 80, color: 'grey.300', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No clinical notes found
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            {searchTerm || categoryFilter !== 'all' || priorityFilter !== 'all' 
              ? 'Try changing your filters'
              : 'Start by adding your first clinical note'}
          </Typography>
          <Button
            variant="outlined"
            startIcon={<Add />}
            onClick={handleOpenAddModal}
          >
            Add First Note
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredNotes.map((note) => (
            <Grid item xs={12} md={6} key={note.id || note._id}>
              <Paper
                elevation={1}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  borderLeft: `4px solid ${categoryColors[getNoteCategory(note)] || theme.palette.primary.main}`,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    boxShadow: theme.shadows[4],
                    bgcolor: alpha(theme.palette.primary.main, 0.02)
                  }
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="h6" fontWeight="600" gutterBottom>
                      {getNoteTitle(note)}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Chip
                        label={getNoteCategory(note)}
                        size="small"
                        sx={{
                          bgcolor: alpha(categoryColors[getNoteCategory(note)] || theme.palette.primary.main, 0.1),
                          color: categoryColors[getNoteCategory(note)] || theme.palette.primary.main,
                          textTransform: 'capitalize'
                        }}
                      />
                      <Chip
                        label={note.priority || "medium"}
                        size="small"
                        variant="outlined"
                        color={priorityConfig[note.priority]?.color || "default"}
                      />
                    </Box>
                  </Box>
                  
                  <Box>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenViewModal(note);
                      }}
                      sx={{ mr: 1 }}
                    >
                      <Visibility fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenEditModal(note);
                      }}
                      sx={{ mr: 1 }}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenDeleteModal(note);
                      }}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
                
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mb: 2,
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}
                >
                  {getNoteContent(note)}
                </Typography>
                
                {note.tags && note.tags.length > 0 && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                    {note.tags.map((tag, idx) => (
                      <Chip
                        key={idx}
                        label={tag}
                        size="small"
                        variant="outlined"
                        sx={{ height: 24 }}
                      />
                    ))}
                  </Box>
                )}
                
                <Divider sx={{ my: 2 }} />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {note.doctor?.name && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Person sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">
                          {note.doctor.name}
                        </Typography>
                      </Box>
                    )}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <DateRange sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(note.date || note.createdAt)}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Button
                    size="small"
                    onClick={() => handleOpenViewModal(note)}
                    endIcon={<Visibility />}
                  >
                    View Details
                  </Button>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      {/* ================= ADD NOTE MODAL ================= */}
      <Dialog
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ borderBottom: `1px solid ${theme.palette.divider}`, pb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5" fontWeight="600">Add Clinical Note</Typography>
            <IconButton onClick={() => setAddModalOpen(false)} size="small">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3 }}>
          <AddEditNoteForm
            formData={formData}
            setFormData={setFormData}
            tagInput={tagInput}
            setTagInput={setTagInput}
            handleAddTag={handleAddTag}
            handleRemoveTag={handleRemoveTag}
            handleKeyPress={handleKeyPress}
          />
        </DialogContent>
        
        <DialogActions sx={{ px: 3, pb: 3, borderTop: `1px solid ${theme.palette.divider}`, pt: 2 }}>
          <Button onClick={() => setAddModalOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmitAdd}
            disabled={!formData.content}
          >
            Save Note
          </Button>
        </DialogActions>
      </Dialog>

      {/* ================= VIEW NOTE MODAL ================= */}
      <Dialog
        open={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedNote && (
          <>
            <DialogTitle sx={{ borderBottom: `1px solid ${theme.palette.divider}`, pb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" fontWeight="600">{getNoteTitle(selectedNote)}</Typography>
                <Box>
                  <IconButton
                    size="small"
                    sx={{ mr: 1 }}
                    onClick={() => {
                      // Print functionality
                      const printWindow = window.open('', '_blank');
                      if (printWindow) {
                        printWindow.document.write(`
                          <html>
                            <head>
                              <title>Clinical Note - ${getNoteTitle(selectedNote)}</title>
                              <style>
                                body { font-family: Arial, sans-serif; padding: 20px; }
                                .header { text-align: center; margin-bottom: 30px; }
                                .content { line-height: 1.6; }
                                .meta { margin-top: 30px; font-size: 12px; color: #666; }
                              </style>
                            </head>
                            <body>
                              <div class="header">
                                <h1>${getNoteTitle(selectedNote)}</h1>
                                <p>Category: ${getNoteCategory(selectedNote)} | Priority: ${selectedNote.priority}</p>
                              </div>
                              <div class="content">${getNoteContent(selectedNote)}</div>
                              <div class="meta">
                                <p>Created: ${formatDateTime(selectedNote.createdAt)}</p>
                                ${selectedNote.updatedAt && selectedNote.updatedAt !== selectedNote.createdAt 
                                  ? `<p>Updated: ${formatDateTime(selectedNote.updatedAt)}</p>` 
                                  : ''}
                              </div>
                            </body>
                          </html>
                        `);
                        printWindow.document.close();
                        printWindow.print();
                      }
                    }}
                  >
                    <Print />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `${window.location.origin}/medical-zone/${patientId}/notes/${selectedNote.id}`
                      );
                      // You might want to add a snackbar notification here
                    }}
                    sx={{ mr: 1 }}
                  >
                    <Share />
                  </IconButton>
                  <IconButton size="small" onClick={() => setViewModalOpen(false)}>
                    <Close />
                  </IconButton>
                </Box>
              </Box>
            </DialogTitle>
            
            <DialogContent sx={{ pt: 3 }}>
              <ViewNoteContent 
                note={selectedNote} 
                formatDate={formatDate}
                formatDateTime={formatDateTime}
              />
            </DialogContent>
            
            <DialogActions sx={{ px: 3, pb: 3, borderTop: `1px solid ${theme.palette.divider}`, pt: 2 }}>
              <Button onClick={() => setViewModalOpen(false)}>Close</Button>
              <Button
                variant="outlined"
                startIcon={<Edit />}
                onClick={() => {
                  setViewModalOpen(false);
                  handleOpenEditModal(selectedNote);
                }}
              >
                Edit
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* ================= EDIT NOTE MODAL ================= */}
      <Dialog
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ borderBottom: `1px solid ${theme.palette.divider}`, pb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5" fontWeight="600">Edit Clinical Note</Typography>
            <IconButton onClick={() => setEditModalOpen(false)} size="small">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3 }}>
          <AddEditNoteForm
            formData={formData}
            setFormData={setFormData}
            tagInput={tagInput}
            setTagInput={setTagInput}
            handleAddTag={handleAddTag}
            handleRemoveTag={handleRemoveTag}
            handleKeyPress={handleKeyPress}
          />
        </DialogContent>
        
        <DialogActions sx={{ px: 3, pb: 3, borderTop: `1px solid ${theme.palette.divider}`, pt: 2 }}>
          <Button onClick={() => setEditModalOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmitEdit}
            disabled={!formData.content}
          >
            Update Note
          </Button>
        </DialogActions>
      </Dialog>

      {/* ================= DELETE CONFIRMATION MODAL ================= */}
      <Dialog
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        maxWidth="sm"
      >
        <DialogTitle sx={{ borderBottom: `1px solid ${theme.palette.divider}`, pb: 2 }}>
          <Typography variant="h6" fontWeight="600">Delete Note</Typography>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <PriorityHigh sx={{ fontSize: 60, color: 'error.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Delete "{getNoteTitle(selectedNote)}"?
            </Typography>
            <Typography color="text.secondary">
              This action cannot be undone. All data associated with this clinical note will be permanently deleted.
            </Typography>
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setDeleteModalOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDelete}
          >
            Delete Note
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

// ================= REUSABLE FORM COMPONENT =================
const AddEditNoteForm = ({ 
  formData, 
  setFormData, 
  tagInput, 
  setTagInput, 
  handleAddTag, 
  handleRemoveTag,
  handleKeyPress 
}) => {
  const theme = useTheme();
  
  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Note Title"
          value={formData.title}
          onChange={(e) => setFormData({...formData, title: e.target.value})}
          sx={{ mb: 2 }}
          InputProps={{
            sx: { borderRadius: 2 }
          }}
          placeholder="Enter note title (optional)"
        />
      </Grid>
      
      <Grid item xs={12} md={6}>
        <FormControl fullWidth>
          <InputLabel>Category</InputLabel>
          <Select
            value={formData.category}
            onChange={(e) => setFormData({...formData, category: e.target.value})}
            label="Category"
            sx={{ borderRadius: 2 }}
          >
            <MenuItem value="consultation">Consultation</MenuItem>
            <MenuItem value="followup">Follow-up</MenuItem>
            <MenuItem value="emergency">Emergency</MenuItem>
            <MenuItem value="clinical_note">Clinical Note</MenuItem>
            <MenuItem value="other">Other</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <FormControl fullWidth>
          <InputLabel>Priority</InputLabel>
          <Select
            value={formData.priority}
            onChange={(e) => setFormData({...formData, priority: e.target.value})}
            label="Priority"
            sx={{ borderRadius: 2 }}
          >
            <MenuItem value="low">Low</MenuItem>
            <MenuItem value="medium">Medium</MenuItem>
            <MenuItem value="high">High</MenuItem>
            <MenuItem value="critical">Critical</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Tags"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyPress={handleKeyPress}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Button
                  size="small"
                  onClick={handleAddTag}
                  disabled={!tagInput.trim()}
                >
                  Add
                </Button>
              </InputAdornment>
            ),
            sx: { borderRadius: 2 }
          }}
          helperText="Press Enter or click Add to add tags"
        />
        
        {formData.tags.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
            {formData.tags.map((tag, index) => (
              <Chip
                key={index}
                label={tag}
                onDelete={() => handleRemoveTag(tag)}
                sx={{
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  '& .MuiChip-deleteIcon': {
                    color: theme.palette.primary.main
                  }
                }}
              />
            ))}
          </Box>
        )}
      </Grid>
      
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Content *"
          value={formData.content}
          onChange={(e) => setFormData({...formData, content: e.target.value})}
          multiline
          rows={8}
          required
          InputProps={{
            sx: { borderRadius: 2 }
          }}
          placeholder="Enter clinical notes here..."
        />
      </Grid>
    </Grid>
  );
};

// ================= VIEW NOTE CONTENT COMPONENT =================
const ViewNoteContent = ({ note, formatDate, formatDateTime }) => {
  const theme = useTheme();
  const noteCategory = note.category || note.visitType || "clinical_note";
  
  return (
    <Box>
      {/* Note Header */}
      <Box sx={{
        p: 3,
        mb: 3,
        borderRadius: 2,
        bgcolor: alpha(theme.palette.primary.main, 0.03),
        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
      }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <InfoRow icon={<LocalHospital />} label="Category" value={noteCategory} />
            {note.doctor?.name && (
              <InfoRow icon={<Person />} label="Doctor" value={note.doctor.name} />
            )}
          </Grid>
          <Grid item xs={12} md={6}>
            <InfoRow 
              icon={<PriorityHigh />} 
              label="Priority" 
              value={
                <Chip
                  label={note.priority || "medium"}
                  size="small"
                  color={
                    note.priority === 'high' || note.priority === 'critical' 
                      ? 'error' 
                      : note.priority === 'medium' 
                      ? 'warning' 
                      : 'success'
                  }
                />
              }
            />
            <InfoRow 
              icon={<DateRange />} 
              label="Date" 
              value={formatDate(note.date || note.createdAt)} 
            />
          </Grid>
        </Grid>
      </Box>
      
      {/* Note Content */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 2,
          bgcolor: 'grey.50',
          border: `1px solid ${theme.palette.divider}`
        }}
      >
        <Typography variant="body1" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
          {note.content || note.notes || "No content available"}
        </Typography>
      </Paper>
      
      {/* Tags */}
      {note.tags && note.tags.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" fontWeight="600" gutterBottom>
            Tags
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {note.tags.map((tag, idx) => (
              <Chip
                key={idx}
                label={tag}
                sx={{
                  bgcolor: alpha(theme.palette.secondary.main, 0.1),
                  color: theme.palette.secondary.main
                }}
              />
            ))}
          </Box>
        </Box>
      )}
      
      {/* Metadata */}
      <Paper
        variant="outlined"
        sx={{ p: 2, borderRadius: 2 }}
      >
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary" display="block">
              Created At
            </Typography>
            <Typography variant="body2">
              {formatDateTime(note.createdAt)}
            </Typography>
          </Grid>
          {note.updatedAt && note.updatedAt !== note.createdAt && (
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary" display="block">
                Last Updated
              </Typography>
              <Typography variant="body2">
                {formatDateTime(note.updatedAt)}
              </Typography>
            </Grid>
          )}
        </Grid>
      </Paper>
    </Box>
  );
};

// ================= INFO ROW COMPONENT =================
const InfoRow = ({ icon, label, value }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
    <Box sx={{ mr: 2, color: 'primary.main' }}>
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

export default NotesSection;