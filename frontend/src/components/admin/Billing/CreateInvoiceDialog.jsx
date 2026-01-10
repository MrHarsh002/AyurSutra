import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Typography,
  Box,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  Alert,
  CircularProgress
} from '@mui/material';
import { Add, Delete, Receipt } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import moment from 'moment';
import api from '../../../services/api';

const CreateInvoiceDialog = ({ open, onClose, onInvoiceCreated }) => {
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [ paymentMethods, setPaymentMethods] = useState([]);

  const [formData, setFormData] = useState({
    patient: '',
    appointment: '',
    dueDate: moment().add(7, 'days'),
    items: [
      { description: 'Consultation Fee', quantity: 1, unitPrice: 500, amount: 500 }
    ],
    subtotal: 500,
    tax: 90,
    discount: 0,
    totalAmount: 590,
    paymentMethod: 'cash',
    notes: '',
    insurance: {
      provider: '',
      policyNumber: '',
      coveredAmount: 0
    }
  });
  const [error, setError] = useState('');

  // Fetch patients and appointments
  useEffect(() => {
    if (open) {
      fetchPatients();
      fetchAppointments();
    }
  }, [open]);

  // Fetch meta data for payment methods and status
   useEffect(() => {
    const fetchMeta = async () => {
      try {
        const res = await api.get('/doctors/meta');
        setPaymentMethods(res.data.paymentMethods);
      } catch (err) {
        console.error('Failed to fetch meta:', err);
      }
    };
    fetchMeta();
  }, []);


  const fetchPatients = async () => {
    try {
      const response = await api.get('/patients');
      setPatients(response.data.patients || []);
    } catch (err) {
      console.error('Error fetching patients:', err);
    }
  };

  const fetchAppointments = async () => {
    try {
      const response = await api.get('/appointments?status=completed');
      setAppointments(response.data.appointments || []);
    } catch (err) {
      console.error('Error fetching appointments:', err);
    }
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Calculate amount
    if (field === 'quantity' || field === 'unitPrice') {
      newItems[index].amount = newItems[index].quantity * newItems[index].unitPrice;
    }
    
    setFormData({ ...formData, items: newItems });
    calculateTotals(newItems);
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        { description: '', quantity: 1, unitPrice: 0, amount: 0 }
      ]
    });
  };

  const removeItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
    calculateTotals(newItems);
  };

  const calculateTotals = (items) => {
    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
    const tax = subtotal * 0.18; // 18% GST
    const totalAmount = subtotal + tax - formData.discount;
    
    setFormData(prev => ({
      ...prev,
      subtotal,
      tax,
      totalAmount
    }));
  };

  const handleDiscountChange = (value) => {
    const discount = parseFloat(value) || 0;
    const totalAmount = formData.subtotal + formData.tax - discount;
    
    setFormData({
      ...formData,
      discount,
      totalAmount
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.patient) {
      setError('Please select a patient');
      return;
    }

    if (formData.items.length === 0) {
      setError('Please add at least one item');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const invoiceData = {
        patient: formData.patient,
        appointment: formData.appointment || undefined,
        items: formData.items,
        subtotal: formData.subtotal,
        tax: formData.tax,
        discount: formData.discount,
        totalAmount: formData.totalAmount,
        paymentMethod: formData.paymentMethod,
        notes: formData.notes,
        dueDate: formData.dueDate.format('YYYY-MM-DD'),
        insurance: formData.insurance.provider ? formData.insurance : undefined
      };

      const response = await api.post('/billing', invoiceData);
      
      if (response.data.success) {
        onInvoiceCreated();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create invoice');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth scroll="paper">
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <Receipt color="primary" />
          <Typography variant="h6">Create New Invoice</Typography>
        </Box>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
          <Grid container spacing={3}>
            {/* Patient Selection */}
            <Grid item xs={12} sm={6} md={6}>
              <Autocomplete
                options={patients}
                getOptionLabel={(option) => `${option.fullName} (${option.patientId})`}
                value={patients.find(p => p._id === formData.patient) || null}
                onChange={(e, newValue) => {
                  setFormData({
                    ...formData,
                    patient: newValue?._id || '',
                    appointment: '' // Reset appointment when patient changes
                  });
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Patient"
                    required
                    fullWidth
                  />
                )}
                sx={{ minWidth: 300 }} // Optional: ensures minimum width
              />
            </Grid>

            <Grid item xs={12} sm={6} md={6}>
              <Autocomplete
                options={appointments.filter(app => 
                  !formData.patient || app.patient._id === formData.patient
                )}
                getOptionLabel={(option) => 
                  `${moment(option.date).format('DD/MM/YYYY')} - ${option.type}`
                }
                value={appointments.find(a => a._id === formData.appointment) || null}
                onChange={(e, newValue) => {
                  setFormData({
                    ...formData,
                    appointment: newValue?._id || ''
                  });
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Appointment (Optional)"
                    fullWidth
                  />
                )}
                disabled={!formData.patient}
                sx={{ minWidth: 300 }}
              />
            </Grid>


            {/* Items Table */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Invoice Items
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Description</TableCell>
                      <TableCell width={100}>Quantity</TableCell>
                      <TableCell width={120}>Unit Price (₹)</TableCell>
                      <TableCell width={120}>Amount (₹)</TableCell>
                      <TableCell width={50}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {formData.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <TextField
                            fullWidth
                            size="small"
                            value={item.description}
                            onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            type="number"
                            size="small"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 0)}
                            inputProps={{ min: 1 }}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            type="number"
                            size="small"
                            value={item.unitPrice}
                            onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            ₹{item.amount.toFixed(2)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => removeItem(index)}
                            disabled={formData.items.length === 1}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Button
                startIcon={<Add />}
                onClick={addItem}
                sx={{ mt: 1 }}
                size="small"
              >
                Add Item
              </Button>
            </Grid>

            {/* Totals */}
            <Grid item xs={12}>
              <Box p={2} bgcolor="#f5f5f5" borderRadius={1}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Discount (₹)"
                      type="number"
                      fullWidth
                      value={formData.discount}
                      onChange={(e) => handleDiscountChange(e.target.value)}
                      InputProps={{ inputProps: { min: 0 } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Payment Method</InputLabel>
                      <Select
                        value={formData.paymentMethod}
                        label="Payment Method"
                        onChange={(e) =>
                          setFormData({ ...formData, paymentMethod: e.target.value })
                        }
                      >
                        {paymentMethods.map((method) => (
                          <MenuItem key={method} value={method}>
                            {method.charAt(0).toUpperCase() + method.slice(1)}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <Box display="flex" justifyContent="space-between" mt={2}>
                      <Box>
                        <Typography variant="body2" color="textSecondary">
                          Subtotal
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Tax (18%)
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Discount
                        </Typography>
                        <Typography variant="h6" mt={1}>
                          Total Amount
                        </Typography>
                      </Box>
                      <Box textAlign="right">
                        <Typography variant="body2" fontWeight="medium">
                          ₹{formData.subtotal.toFixed(2)}
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                          ₹{formData.tax.toFixed(2)}
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                          -₹{formData.discount.toFixed(2)}
                        </Typography>
                        <Typography variant="h6" fontWeight="bold" mt={1}>
                          ₹{formData.totalAmount.toFixed(2)}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </Grid>

            {/* Additional Fields */}
            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Due Date"
                value={formData.dueDate}
                onChange={(date) => setFormData({...formData, dueDate: date})}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Notes"
                fullWidth
                multiline
                rows={2}
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
              />
            </Grid>

            {/* Error Message */}
            {error && (
              <Grid item xs={12}>
                <Alert severity="error">{error}</Alert>
              </Grid>
            )}
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Create Invoice'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CreateInvoiceDialog;