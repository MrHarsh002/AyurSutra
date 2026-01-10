import React, { useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
  Grid,
  IconButton,
  Chip,
  Card,
  CardContent
} from '@mui/material';
import { Print, Download, Close, Receipt, Person, CalendarToday, Payment, LocalHospital } from '@mui/icons-material';
import moment from 'moment';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const InvoicePDF = ({ open, onClose, invoice }) => {
  const invoiceRef = useRef(null);
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!invoiceRef.current) return;

    try {
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2, // Higher quality
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Invoice_${invoice.invoiceId}_${moment().format('YYYYMMDD')}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  // Print styles
  React.useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @media print {
        body * {
          visibility: hidden;
        }
        #invoice-print-content, #invoice-print-content * {
          visibility: visible;
        }
        #invoice-print-content {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          padding: 20px;
          background: white;
        }
        .no-print {
          display: none !important;
        }
        .print-only {
          display: block !important;
        }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'paid': return 'success';
      case 'pending': return 'warning';
      case 'overdue': return 'error';
      default: return 'default';
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="lg" 
      fullWidth
      PaperProps={{
        sx: { 
          borderRadius: 2,
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle sx={{ 
        bgcolor: 'primary.main', 
        color: 'white',
        py: 2
      }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={1}>
            <Receipt />
            <Typography variant="h6" fontWeight="bold">
              Invoice Preview - {invoice.invoiceId}
            </Typography>
          </Box>
          <IconButton 
            onClick={onClose} 
            sx={{ color: 'white' }}
            size="small"
          >
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent dividers sx={{ p: 0, bgcolor: '#f8fafc' }}>
        {/* Main Invoice Content - This will be captured for PDF */}
        <Box 
          ref={invoiceRef}
          id="invoice-print-content"
          sx={{ 
            p: { xs: 2, md: 4 },
            bgcolor: 'white',
            maxWidth: '210mm', // A4 width
            mx: 'auto'
          }}
        >
          {/* Header with Logo and Details */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start',
            mb: 4,
            flexWrap: 'wrap',
            gap: 2
          }}>
            <Box>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <LocalHospital sx={{ fontSize: 40, color: 'primary.main' }} />
                <Box>
                  <Typography variant="h4" fontWeight="bold" color="primary">
                    AyurSutra Ayurvedic Clinic
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Traditional Healing, Modern Care
                  </Typography>
                </Box>
              </Box>
              
              <Box>
                <Typography variant="body2">123 Ayurveda Street, Healing City, HC 123456</Typography>
                <Typography variant="body2">Phone: +91-9876543210 | Email: info@ayursutra.com</Typography>
                <Typography variant="body2" sx={{ mt: 1, fontWeight: 'medium' }}>
                  GSTIN: 27ABCDE1234F1Z5
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ 
              bgcolor: 'primary.light', 
              p: 2, 
              borderRadius: 2,
              minWidth: 200
            }}>
              <Typography variant="h5" fontWeight="bold" color="primary" align="center" gutterBottom>
                INVOICE
              </Typography>
              <Box>
                <Typography variant="body2"><strong>Invoice ID:</strong> {invoice.invoiceId}</Typography>
                <Typography variant="body2"><strong>Date:</strong> {moment(invoice.billDate).format('DD/MM/YYYY')}</Typography>
                <Typography variant="body2"><strong>Due Date:</strong> {moment(invoice.dueDate).format('DD/MM/YYYY')}</Typography>
              </Box>
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Patient and Invoice Details */}
          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <Person color="primary" />
                    <Typography variant="h6" fontWeight="bold">
                      Bill To
                    </Typography>
                  </Box>
                  <Typography variant="h6" gutterBottom>
                    {invoice.patient?.fullName || 'N/A'}
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2">
                      <strong>Patient ID:</strong> {invoice.patient?.patientId || 'N/A'}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Phone:</strong> {invoice.patient?.phone || 'N/A'}
                    </Typography>
                    {invoice.patient?.email && (
                      <Typography variant="body2">
                        <strong>Email:</strong> {invoice.patient.email}
                      </Typography>
                    )}
                    {invoice.patient?.address && (
                      <Typography variant="body2">
                        <strong>Address:</strong> {invoice.patient.address}
                      </Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <Payment color="primary" />
                    <Typography variant="h6" fontWeight="bold">
                      Payment Details
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="body1">Status:</Typography>
                    <Chip 
                      label={invoice.paymentStatus.toUpperCase()}
                      color={getStatusColor(invoice.paymentStatus)}
                      size="small"
                    />
                  </Box>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <CalendarToday fontSize="small" color="action" />
                    <Typography variant="body2">
                      <strong>Invoice Date:</strong> {moment(invoice.billDate).format('DD MMM YYYY')}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <CalendarToday fontSize="small" color="action" />
                    <Typography variant="body2">
                      <strong>Due Date:</strong> {moment(invoice.dueDate).format('DD MMM YYYY')}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Items Table */}
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Invoice Items
          </Typography>
          <TableContainer component={Paper} variant="outlined" sx={{ mb: 4 }}>
            <Table>
              <TableHead sx={{ bgcolor: 'primary.light' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Quantity</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Unit Price</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Amount</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {invoice.items.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Typography variant="body1" fontWeight="medium">
                        {item.description}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={item.quantity} 
                        size="small" 
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body1">
                        {formatCurrency(item.unitPrice)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body1" fontWeight="bold" color="primary">
                        {formatCurrency(item.amount)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Summary Section */}
          <Grid container spacing={2} justifyContent="flex-end">
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Invoice Summary
                  </Typography>
                  
                  <Box sx={{ mb: 2 }}>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body1">Subtotal:</Typography>
                      <Typography variant="body1">{formatCurrency(invoice.subtotal)}</Typography>
                    </Box>
                    
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body1">Tax (18%):</Typography>
                      <Typography variant="body1" color="primary">
                        {formatCurrency(invoice.tax)}
                      </Typography>
                    </Box>
                    
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body1">Discount:</Typography>
                      <Typography variant="body1" color="error">
                        -{formatCurrency(invoice.discount)}
                      </Typography>
                    </Box>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Box display="flex" justifyContent="space-between" mb={2}>
                      <Typography variant="h6" fontWeight="bold">Total:</Typography>
                      <Typography variant="h5" fontWeight="bold" color="primary">
                        {formatCurrency(invoice.totalAmount)}
                      </Typography>
                    </Box>
                    
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body1">Paid Amount:</Typography>
                      <Typography variant="body1" color="success.main" fontWeight="medium">
                        {formatCurrency(invoice.paidAmount)}
                      </Typography>
                    </Box>
                    
                    <Box display="flex" justifyContent="space-between" mt={2} pt={2} borderTop={1} borderColor="divider">
                      <Typography variant="h6" fontWeight="bold">Balance Due:</Typography>
                      <Typography variant="h6" fontWeight="bold" color="error">
                        {formatCurrency(invoice.balanceAmount)}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Footer */}
          <Box sx={{ 
            mt: 4, 
            pt: 3, 
            borderTop: 1, 
            borderColor: 'divider',
            textAlign: 'center'
          }}>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              Thank you for choosing AyurSutra Ayurvedic Clinic
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              We wish you good health and wellness!
            </Typography>
            <Typography variant="caption" color="text.secondary">
              This is a computer generated invoice. No signature required.
            </Typography>
            
            {/* Contact Information */}
            <Box sx={{ 
              mt: 3, 
              display: 'flex', 
              justifyContent: 'center', 
              gap: 3,
              flexWrap: 'wrap'
            }}>
              <Typography variant="caption" color="text.secondary">
                📧 info@ayursutra.com
              </Typography>
              <Typography variant="caption" color="text.secondary">
                📞 +91-9876543210
              </Typography>
              <Typography variant="caption" color="text.secondary">
                🌐 www.ayursutraclinic.com
              </Typography>
            </Box>
          </Box>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ 
        px: 3, 
        py: 2, 
        bgcolor: 'background.paper',
        borderTop: 1,
        borderColor: 'divider'
      }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          width: '100%',
          flexWrap: 'wrap',
          gap: 2
        }}>
          <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
            <LocalHospital fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
            Ayurvedic Healthcare Invoice
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button
              startIcon={<Download />}
              onClick={handleDownloadPDF}
              variant="outlined"
              size="medium"
            >
              Download PDF
            </Button>
            <Button
              startIcon={<Print />}
              variant="contained"
              onClick={handlePrint}
              size="medium"
              color="primary"
            >
              Print
            </Button>
            <Button
              onClick={onClose}
              variant="text"
              size="medium"
            >
              Close
            </Button>
          </Box>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default InvoicePDF;