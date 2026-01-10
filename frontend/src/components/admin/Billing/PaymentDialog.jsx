import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress
} from '@mui/material';
import { AttachMoney, CalendarToday } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import moment from 'moment';
import api from '../../../services/api';

const PaymentDialog = ({ open, onClose, invoice, onPaymentSuccess }) => {
  const [formData, setFormData] = useState({
    amount: invoice?.balanceAmount || 0,
    method: 'cash',
    reference: '',
    notes: '',
    date: moment()
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.amount > invoice.balanceAmount) {
      setError('Payment amount cannot exceed balance amount');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const paymentData = {
        amount: formData.amount,
        method: formData.method,
        reference: formData.reference,
        notes: formData.notes
      };

      await api.put(`/billing/${invoice._id}/payment`, paymentData);
      onPaymentSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to process payment');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <AttachMoney color="primary" />
          <Typography variant="h6">Process Payment</Typography>
        </Box>
      </DialogTitle>
      
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Grid container spacing={2}>
            {/* Invoice Info */}
            <Grid item xs={12}>
              <Box p={2} bgcolor="#f5f5f5" borderRadius={1}>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">
                      Invoice ID:
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {invoice.invoiceId}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">
                      Patient:
                    </Typography>
                    <Typography variant="body1">
                      {invoice.patient?.fullName}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">
                      Total Amount:
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {formatCurrency(invoice.totalAmount)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">
                      Balance Due:
                    </Typography>
                    <Typography variant="body1" color="error" fontWeight="bold">
                      {formatCurrency(invoice.balanceAmount)}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </Grid>

            {/* Payment Form */}
            <Grid item xs={12}>
              <TextField
                label="Payment Amount"
                type="number"
                fullWidth
                required
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: parseFloat(e.target.value)})}
                inputProps={{ 
                  min: 0,
                  max: invoice.balanceAmount,
                  step: 0.01
                }}
                helperText={`Maximum: ${formatCurrency(invoice.balanceAmount)}`}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Payment Method</InputLabel>
                <Select
                  value={formData.method}
                  label="Payment Method"
                  onChange={(e) => setFormData({...formData, method: e.target.value})}
                >
                  <MenuItem value="cash">Cash</MenuItem>
                  <MenuItem value="card">Credit/Debit Card</MenuItem>
                  <MenuItem value="upi">UPI</MenuItem>
                  <MenuItem value="cheque">Cheque</MenuItem>
                  <MenuItem value="online">Online Payment</MenuItem>
                  <MenuItem value="insurance">Insurance</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Payment Date"
                value={formData.date}
                onChange={(date) => setFormData({...formData, date})}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Reference Number"
                fullWidth
                value={formData.reference}
                onChange={(e) => setFormData({...formData, reference: e.target.value})}
                placeholder="Transaction ID, Cheque No., etc."
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
            disabled={loading || formData.amount <= 0}
          >
            {loading ? <CircularProgress size={24} /> : 'Process Payment'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default PaymentDialog;