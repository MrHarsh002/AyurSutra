import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Tooltip,
  Alert,
  CircularProgress,
  Paper,
  Tabs,
  Tab
} from '@mui/material';
import {
  Search,
  FilterList,
  Print,
  Download,
  Add,
  Edit,
  Delete,
  Visibility,
  Payment,
  CalendarToday,
  Person,
  AttachMoney,
  TrendingUp,
  Receipt
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import moment from 'moment';
import api from '../../services/api';
import InvoicePDF from '../../components/admin/Billing/InvoicePDF';
import PaymentDialog from '../../components/admin/Billing/PaymentDialog';
import CreateInvoiceDialog from '../../components/admin/Billing/CreateInvoiceDialog';

const BillingMain = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    paymentStatus: '',
    startDate: null,
    endDate: null,
    patientId: ''
  });
  const [pagination, setPagination] = useState({
    page: 0,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [stats, setStats] = useState({
    totalRevenue: 0,
    collectedRevenue: 0,
    pendingPayments: 0
  });
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [openDialog, setOpenDialog] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [paymentStatus, setPaymentStatus] = useState([]);

  
    // Fetch meta data for payment methods and status
     useEffect(() => {
      const fetchMeta = async () => {
        try {
          const res = await api.get('/doctors/meta');
          setPaymentStatus(res.data.paymentStatus);
        } catch (err) {
          console.error('Failed to fetch meta:', err);
        }
      };
      fetchMeta();
    }, []);
  // Fetch invoices
  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page + 1,
        limit: pagination.limit,
        ...filters
      };

      if (search) params.search = search;
      if (filters.startDate) params.startDate = filters.startDate.format('YYYY-MM-DD');
      if (filters.endDate) params.endDate = filters.endDate.format('YYYY-MM-DD');

      const response = await api.get('/billing', { params });
      setInvoices(response.data.invoices);
      setPagination({
        ...pagination,
        total: response.data.total,
        totalPages: response.data.totalPages
      });
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch invoices');
      console.error('Error fetching invoices:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const response = await api.get('/billing/stats/financial');
      setStats(response.data.stats);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  useEffect(() => {
    fetchInvoices();
    fetchStats();
  }, [pagination.page, pagination.limit, filters]);

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (search !== '') {
        fetchInvoices();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Handle page change
  const handlePageChange = (event, newPage) => {
    setPagination({ ...pagination, page: newPage });
  };

  const handleRowsPerPageChange = (event) => {
    setPagination({
      ...pagination,
      limit: parseInt(event.target.value, 10),
      page: 0
    });
  };

  // Handle filter changes
  const handleFilterChange = (name, value) => {
    setFilters({ ...filters, [name]: value });
  };

  // Open dialogs
  const handleOpenDialog = (dialog, invoice = null) => {
    setSelectedInvoice(invoice);
    setOpenDialog(dialog);
  };

  const handleCloseDialog = () => {
    setOpenDialog('');
    setSelectedInvoice(null);
  };

  // Handle actions
  const handlePrintInvoice = async (invoiceId) => {
    try {
      const response = await api.get(`/billing/${invoiceId}/pdf`, {
        responseType: 'blob'
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      window.open(url);
    } catch (err) {
      setError('Failed to generate PDF');
      console.error('Error generating PDF:', err);
    }
  };

  const handleDeleteInvoice = async (invoiceId) => {
    if (!window.confirm('Are you sure you want to delete this invoice?')) return;

    try {
      await api.delete(`/billing/${invoiceId}`);
      setError('');
      fetchInvoices();
      fetchStats();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete invoice');
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'success';
      case 'partial': return 'warning';
      case 'pending': return 'info';
      case 'overdue': return 'error';
      default: return 'default';
    }
  };

  // Calculate fade animation delay
  const getFadeDelay = (index) => ({
    animation: `fadeIn 0.5s ease-out ${index * 0.1}s both`,
    '@keyframes fadeIn': {
      '0%': { opacity: 0, transform: 'translateY(20px)' },
      '100%': { opacity: 1, transform: 'translateY(0)' }
    }
  });

  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {/* Stats Cards with Fade Animation */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Card 
              sx={{ 
                height: '100%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                ...getFadeDelay(0)
              }}
            >
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <AttachMoney sx={{ fontSize: 40, mr: 2 }} />
                  <Box>
                    <Typography variant="h6">Total Revenue</Typography>
                    <Typography variant="h4" fontWeight="bold">
                      {formatCurrency(stats.totalRevenue)}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="body2">
                  All time collected amount
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card 
              sx={{ 
                height: '100%',
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                color: 'white',
                ...getFadeDelay(1)
              }}
            >
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <TrendingUp sx={{ fontSize: 40, mr: 2 }} />
                  <Box>
                    <Typography variant="h6">Collected</Typography>
                    <Typography variant="h4" fontWeight="bold">
                      {formatCurrency(stats.collectedRevenue)}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="body2">
                  Successfully received payments
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card 
              sx={{ 
                height: '100%',
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                color: 'white',
                ...getFadeDelay(2)
              }}
            >
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Receipt sx={{ fontSize: 40, mr: 2 }} />
                  <Box>
                    <Typography variant="h6">Pending</Typography>
                    <Typography variant="h4" fontWeight="bold">
                      {formatCurrency(stats.pendingPayments)}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="body2">
                  Awaiting payment collection
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Main Content Card */}
        <Card sx={{ ...getFadeDelay(3) }}>
          <CardContent>
            {/* Header with Tabs */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
                <Tab label="All Invoices" />
                <Tab label="Pending" />
                <Tab label="Overdue" />
                <Tab label="Paid" />
              </Tabs>
              
              <Box>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<Add />}
                  onClick={() => handleOpenDialog('create')}
                  sx={{ mr: 1 }}
                >
                  New Invoice
                </Button>
                <Tooltip title="Download Report">
                  <IconButton>
                    <Download />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            {/* Search and Filters */}
            <Box display="flex" gap={2} mb={3} flexWrap="wrap">
              <TextField
                placeholder="Search invoices or patients..."
                variant="outlined"
                size="small"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
                sx={{ flex: 1, minWidth: 200 }}
              />

              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.paymentStatus}
                  label="Status"
                  onChange={(e) => handleFilterChange('paymentStatus', e.target.value)}
                >
                  <MenuItem value="">All</MenuItem>
                  {paymentStatus.map((status) => (
                    <MenuItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <DatePicker
                label="From Date"
                value={filters.startDate}
                onChange={(date) => handleFilterChange('startDate', date)}
                slotProps={{ textField: { size: 'small', sx: { width: 150 } } }}
              />

              <DatePicker
                label="To Date"
                value={filters.endDate}
                onChange={(date) => handleFilterChange('endDate', date)}
                slotProps={{ textField: { size: 'small', sx: { width: 150 } } }}
              />

              <Button
                variant="outlined"
                startIcon={<FilterList />}
                onClick={() => setFilters({
                  paymentStatus: '',
                  startDate: null,
                  endDate: null,
                  patientId: ''
                })}
              >
                Clear Filters
              </Button>
            </Box>

            {/* Error Alert */}
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {/* Invoices Table */}
            <TableContainer component={Paper}>
              {loading ? (
                <Box display="flex" justifyContent="center" p={4}>
                  <CircularProgress />
                </Box>
              ) : (
                <>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableCell>Invoice ID</TableCell>
                        <TableCell>Patient</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell>Due Date</TableCell>
                        <TableCell>Amount</TableCell>
                        <TableCell>Paid</TableCell>
                        <TableCell>Balance</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="center">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {invoices.map((invoice, index) => (
                        <TableRow 
                          key={invoice._id}
                          hover
                          sx={{ 
                            '&:hover': { backgroundColor: '#fafafa' },
                            ...getFadeDelay(index)
                          }}
                        >
                          <TableCell>
                            <Typography variant="body2" fontWeight="bold">
                              {invoice.invoiceId}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                {invoice.patient?.fullName || 'N/A'}
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                ID: {invoice.patient?.patientId}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            {moment(invoice.billDate).format('DD/MM/YYYY')}
                          </TableCell>
                          <TableCell>
                            {moment(invoice.dueDate).format('DD/MM/YYYY')}
                          </TableCell>
                          <TableCell>
                            <Typography fontWeight="bold">
                              {formatCurrency(invoice.totalAmount)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {formatCurrency(invoice.paidAmount)}
                          </TableCell>
                          <TableCell>
                            <Typography 
                              fontWeight="bold"
                              color={invoice.balanceAmount > 0 ? 'error' : 'success'}
                            >
                              {formatCurrency(invoice.balanceAmount)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={invoice.paymentStatus.toUpperCase()}
                              color={getStatusColor(invoice.paymentStatus)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Box display="flex" gap={1} justifyContent="center">
                              <Tooltip title="View Details">
                                <IconButton
                                  size="small"
                                  onClick={() => handleOpenDialog('view', invoice)}
                                >
                                  <Visibility fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              
                              <Tooltip title="Add Payment">
                                <IconButton
                                  size="small"
                                  onClick={() => handleOpenDialog('payment', invoice)}
                                  disabled={invoice.paymentStatus === 'paid'}
                                >
                                  <Payment fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              
                              <Tooltip title="Print Invoice">
                                <IconButton
                                  size="small"
                                  onClick={() => handlePrintInvoice(invoice._id)}
                                >
                                  <Print fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              
                              <Tooltip title="Delete Invoice">
                                <IconButton
                                  size="small"
                                  onClick={() => handleDeleteInvoice(invoice._id)}
                                  color="error"
                                  disabled={invoice.paidAmount > 0}
                                >
                                  <Delete fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* Pagination */}
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    component="div"
                    count={pagination.total}
                    rowsPerPage={pagination.limit}
                    page={pagination.page}
                    onPageChange={handlePageChange}
                    onRowsPerPageChange={handleRowsPerPageChange}
                  />
                </>
              )}
            </TableContainer>
          </CardContent>
        </Card>

        {/* Dialogs */}
        {openDialog === 'view' && selectedInvoice && (
          <InvoicePDF
            open={openDialog === 'view'}
            onClose={handleCloseDialog}
            invoice={selectedInvoice}
          />
        )}

        {openDialog === 'payment' && selectedInvoice && (
          <PaymentDialog
            open={openDialog === 'payment'}
            onClose={handleCloseDialog}
            invoice={selectedInvoice}
            onPaymentSuccess={() => {
              fetchInvoices();
              fetchStats();
              handleCloseDialog();
            }}
          />
        )}

        {openDialog === 'create' && (
          <CreateInvoiceDialog
            open={openDialog === 'create'}
            onClose={handleCloseDialog}
            onInvoiceCreated={() => {
              fetchInvoices();
              fetchStats();
              handleCloseDialog();
            }}
          />
        )}
      </Container>
    </LocalizationProvider>
  );
};

export default BillingMain;