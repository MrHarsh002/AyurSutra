import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import styled, { keyframes} from 'styled-components';
import { FaFilePdf, FaFileExcel, FaTrash } from "react-icons/fa";

// Fade animation component [citation:1]
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const fadeOut = keyframes`
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(20px);
  }
`;

// Styled Components
const Container = styled.div`
  padding: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
`;

const ReportContainer = styled.div`
  animation: ${fadeIn} 0.5s ease-out;
  background: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 20px 60px rgba(0,0,0,0.15);
  margin-top: 1rem;
`;

const Title = styled.h1`
  color: white;
  text-align: center;
  margin-bottom: 2rem;
  font-size: 2.5rem;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
  animation: ${fadeIn} 0.8s ease-out;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const Card = styled.div`
  background: white;
  border-radius: 15px;
  padding: 1.5rem;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
  animation: ${fadeIn} 0.6s ease-out ${props => props.delay || '0ms'};
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 40px rgba(0,0,0,0.15);
  }
`;

const ReportCard = styled.div`
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 15px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  animation: ${props => props.exiting ? fadeOut : fadeIn} 0.5s ease-out;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
  
  th, td {
    padding: 1rem;
    text-align: left;
    border-bottom: 1px solid #e0e0e0;
  }
  
  th {
    background: #f8f9fa;
    font-weight: 600;
  }
  
  tr {
    animation: ${fadeIn} 0.3s ease-out;
    &:hover {
      background: #f8f9fa;
    }
  }
`;

const Button = styled.button`
  background: ${props => props.variant === 'primary' ? '#667eea' : props.variant === 'danger' ? '#ff4757' : '#f8f9fa'};
  color: ${props => props.variant === 'primary' || props.variant === 'danger' ? 'white' : '#333'};
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  margin-right: 0.5rem;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 1rem;
  background: white;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const Loading = styled.div`
  text-align: center;
  padding: 3rem;
  color: #667eea;
  font-size: 1.2rem;
`;

const Error = styled.div`
  background: #ffebee;
  color: #c62828;
  padding: 1rem;
  border-radius: 10px;
  margin: 1rem 0;
  animation: ${fadeIn} 0.3s ease-out;
`;

const Success = styled.div`
  background: #e8f5e9;
  color: #2e7d32;
  padding: 1rem;
  border-radius: 10px;
  margin: 1rem 0;
  animation: ${fadeIn} 0.3s ease-out;
`;

// Main Report Management Component
const ReportManager = () => {
  // State management using useState hook [citation:5]
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  const [exitingReport, setExitingReport] = useState(null);
  
  // Filter and pagination state [citation:3][citation:6]
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    startDate: '',
    endDate: '',
    page: 1,
    limit: 10
  });
  const [totalPages, setTotalPages] = useState(1);
  
  const [reportTypes, setReportTypes] = useState([]);
  const [reportFrequencies, setReportFrequencies] = useState([]);
  const [chartTypes, setChartTypes] = useState([]); 
  const [typeStatus, setTypeStatus] = useState([]);

  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const res = await api.get('/doctors/meta');
        setReportTypes(res.data.reportTypes);
        setReportFrequencies(res.data.reportFrequencies);
        setChartTypes(res.data.chartTypes);
        setTypeStatus(res.data.typeStatus);
      } catch (err) {
        console.error('Failed to fetch meta:', err);
      }
    };
    fetchMeta();
  }, []);
  // Report generation state
  const [reportForm, setReportForm] = useState({
    title: '',
    type: 'financial',
    startDate: '',
    endDate: '',
    format: 'json',
    filters: {}
  });
  const [generating, setGenerating] = useState(false);
  
  // Dashboard stats [citation:5]
  const [dashboardStats, setDashboardStats] = useState({
    patients: { total: 0, newThisMonth: 0 },
    appointments: { today: 0, thisWeek: 0 },
    financial: { monthlyRevenue: 0, collected: 0 },
    inventory: { lowStockItems: 0 }
  });

  // Fetch reports with pagination [citation:6]
  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) params.append(key, filters[key]);
      });
      
      const response = await api.get(`/reports?${params.toString()}`);
      setReports(response.data.reports);
      setTotalPages(response.data.totalPages);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Fetch dashboard statistics
  const fetchDashboardStats = useCallback(async () => {
    try {
      const response = await api.get('/reports/dashboard-stats');
      setDashboardStats(response.data.stats);
    } catch (err) {
      console.error('Failed to fetch dashboard stats:', err);
    }
  }, []);

  // Initial data loading
  useEffect(() => {
    fetchReports();
    fetchDashboardStats();
  }, [fetchReports, fetchDashboardStats]);

  // Handle report generation [citation:2][citation:8]
  const handleGenerateReport = async () => {
    try {
      setGenerating(true);
      const response = await api.post('/reports/generate', reportForm);
      
      setSuccess(`Report generated successfully! Download URL: ${response.data.downloadUrl}`);
      
      // Add new report with animation
      const newReport = response.data.report;
      setReports(prev => [newReport, ...prev]);
      
      // Reset form
      setReportForm({
        title: '',
        type: 'financial',
        startDate: '',
        endDate: '',
        format: 'json',
        filters: {}
      });
      
      // Refresh reports after 2 seconds
      setTimeout(() => {
        fetchReports();
      }, 2000);
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };

  // Handle report deletion with animation
  const handleDeleteReport = async (id) => {
    try {
      setExitingReport(id);
      
      // Wait for animation to complete
      await new Promise(resolve => setTimeout(resolve, 500));
      
      await api.delete(`/reports/${id}`);
      setReports(prev => prev.filter(report => report._id !== id));
      setSuccess('Report deleted successfully');
    } catch (err) {
      setError('Failed to delete report');
      setExitingReport(null);
    }
  };

  // Handle report download
  const handleDownloadReport = async (id, format) => {
    try {
      const response = await api.get(`/reports/${id}/download/${format}`, {
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report_${id}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
    } catch (err) {
      setError('Failed to download report');
    }
  };

  // Handle filter changes
  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value,
      page: 1 // Reset to first page on filter change
    }));
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setFilters(prev => ({ ...prev, page: newPage }));
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get report type color
  const getReportTypeColor = (type) => {
    const colors = {
      financial: '#4CAF50',
      patient: '#2196F3',
      appointment: '#FF9800',
      inventory: '#9C27B0',
      doctor: '#F44336',
      therapy: '#00BCD4'
    };
    return colors[type] || '#757575';
  };

  return (
    <Container>
      <Title>📊 AyurSutra Report Manager</Title>
      
      {/* Dashboard Stats [citation:5] */}
      <Grid>
        <Card delay="100ms">
          <h3>👥 Patients</h3>
          <p>Total: {dashboardStats.patients.total}</p>
          <p>New This Month: {dashboardStats.patients.newThisMonth}</p>
        </Card>
        
        <Card delay="200ms">
          <h3>📅 Appointments</h3>
          <p>Today: {dashboardStats.appointments.today}</p>
          <p>This Week: {dashboardStats.appointments.thisWeek}</p>
        </Card>
        
        <Card delay="300ms">
          <h3>💰 Financial</h3>
          <p>Monthly Revenue: ₹{dashboardStats.financial.monthlyRevenue}</p>
          <p>Collected: ₹{dashboardStats.financial.collected}</p>
        </Card>
        
        <Card delay="400ms">
          <h3>📦 Inventory</h3>
          <p>Low Stock Items: {dashboardStats.inventory.lowStockItems}</p>
        </Card>
      </Grid>
      
      {/* Error and Success Messages */}
      {error && <Error>{error}</Error>}
      {success && <Success>{success}</Success>}
      
      {/* Report Generation Form */}
      <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
  {/* LEFT: Generate New Report */}
  <ReportContainer style={{ flex: 1 }}>
    <h2>Generate New Report</h2>
    <form onSubmit={(e) => { e.preventDefault(); handleGenerateReport(); }}>
      <Grid>
        <FormGroup>
          <label>Report Title</label>
          <Input
            type="text"
            value={reportForm.title}
            onChange={(e) => setReportForm(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Enter report title"
            required
          />
        </FormGroup>

        <FormGroup>
          <label>Report Type</label>
          <Select
            value={reportForm.type}
            onChange={(e) => setReportForm(prev => ({ ...prev, type: e.target.value }))}
          >
            <option value="financial">Financial Report</option>
            <option value="patient">Patient Report</option>
            <option value="appointment">Appointment Report</option>
            <option value="inventory">Inventory Report</option>
            <option value="doctor">Doctor Report</option>
            <option value="therapy">Therapy Report</option>
          </Select>
        </FormGroup>

        <FormGroup>
          <label>Start Date</label>
          <Input
            type="date"
            value={reportForm.startDate}
            onChange={(e) => setReportForm(prev => ({ ...prev, startDate: e.target.value }))}
          />
        </FormGroup>

        <FormGroup>
          <label>End Date</label>
          <Input
            type="date"
            value={reportForm.endDate}
            onChange={(e) => setReportForm(prev => ({ ...prev, endDate: e.target.value }))}
          />
        </FormGroup>

        <FormGroup>
          <label>Output Format</label>
          <Select
            value={reportForm.format}
            onChange={(e) => setReportForm(prev => ({ ...prev, format: e.target.value }))}
          >
            <option value="json">JSON</option>
            <option value="excel">Excel</option>
            <option value="pdf">PDF</option>
          </Select>
        </FormGroup>
      </Grid>
      
      <Button 
        type="submit" 
        variant="primary"
        disabled={generating}
        style={{ marginTop: "1rem" }}
      >
        {generating ? 'Generating...' : 'Generate Report'}
      </Button>
    </form>
  </ReportContainer>

  {/* RIGHT: Filter Reports */}
  <ReportContainer style={{ flex: 1 }}>
    <h2>Filter Reports</h2>
    <Grid>
      <FormGroup>
        <label>Report Type</label>
        <Select
          value={filters.type}
          onChange={(e) => handleFilterChange('type', e.target.value)}
        >
          <option value="">All Types</option>
          <option value="financial">Financial</option>
          <option value="patient">Patient</option>
          <option value="appointment">Appointment</option>
          <option value="inventory">Inventory</option>
        </Select>
      </FormGroup>

      <FormGroup>
        <label>Status</label>
        <Select
          value={filters.status}
          onChange={(e) => handleFilterChange('status', e.target.value)}
        >
          <option value="">All Status</option>
          <option value="generated">Generated</option>
          <option value="processing">Processing</option>
          <option value="sent">Sent</option>
        </Select>
      </FormGroup>

      <FormGroup>
        <label>Start Date</label>
        <Input
          type="date"
          value={filters.startDate}
          onChange={(e) => handleFilterChange('startDate', e.target.value)}
        />
      </FormGroup>

      <FormGroup>
        <label>End Date</label>
        <Input
          type="date"
          value={filters.endDate}
          onChange={(e) => handleFilterChange('endDate', e.target.value)}
        />
      </FormGroup>
    </Grid>

    <Button 
      onClick={() => setFilters({
        type: '',
        status: '',
        startDate: '',
        endDate: '',
        page: 1,
        limit: 10
      })}
      style={{ marginTop: "1rem" }}
    >
      Clear Filters
    </Button>
  </ReportContainer>
</div>

      {/* Reports List */}
      <ReportContainer style={{ marginTop: '2rem' }}>
        <h2>Generated Reports</h2>
        
        {loading ? (
          <Loading>Loading reports...</Loading>
        ) : reports.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
            No reports found. Generate your first report!
          </div>
        ) : (
          <>
            <Table>
              <thead>
                <tr>
                  <th>Report ID</th>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Generated</th>
                  <th>Metrics</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report._id} style={{ animation: exitingReport === report._id ? `${fadeOut} 0.5s ease-out` : undefined }}>
                    <td>{report.reportId}</td>
                    <td>
                      <strong>{report.title}</strong>
                      <div style={{ fontSize: '0.875rem', color: '#666' }}>
                        {formatDate(report.period.startDate)} - {formatDate(report.period.endDate)}
                      </div>
                    </td>
                    <td>
                      <span style={{
                        display: 'inline-block',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '20px',
                        background: getReportTypeColor(report.type),
                        color: 'white',
                        fontSize: '0.875rem',
                        fontWeight: '500'
                      }}>
                        {report.type}
                      </span>
                    </td>
                    <td>
                      {formatDate(report.generatedAt)}
                      <div style={{ fontSize: '0.875rem', color: '#666' }}>
                        by {report.generatedBy?.name || 'System'}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.875rem' }}>
                        {report.type === 'financial' && (
                          <>Revenue: ₹{report.metrics?.totalRevenue || 0}</>
                        )}
                        {report.type === 'patient' && (
                          <>Patients: {report.metrics?.totalPatients || 0}</>
                        )}
                        {report.type === 'appointment' && (
                          <>Appointments: {report.metrics?.totalAppointments || 0}</>
                        )}
                      </div>
                    </td>
                    <td style={{ display: "flex", gap: "0.5rem" }}>
                      <button
                        onClick={() => handleDownloadReport(report._id, 'pdf')}
                        title="Download PDF"
                        style={{
                          background: "none", border: "none", cursor: "pointer", fontSize: "1.2rem"
                        }}
                      >
                        <FaFilePdf color="#d32f2f" />
                      </button>

                      <button
                        onClick={() => handleDownloadReport(report._id, 'excel')}
                        title="Download Excel"
                        style={{
                          background: "none", border: "none", cursor: "pointer", fontSize: "1.2rem"
                        }}
                      >
                        <FaFileExcel color="#2e7d32" />
                      </button>

                      <button
                        onClick={() => handleDeleteReport(report._id)}
                        title="Delete Report"
                        style={{
                          background: "none", border: "none", cursor: "pointer", fontSize: "1.2rem"
                        }}
                      >
                        <FaTrash color="#b71c1c" />
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </Table>
            
            {/* Pagination Controls [citation:6] */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              marginTop: '2rem',
              gap: '0.5rem'
            }}>
              <Button 
                onClick={() => handlePageChange(filters.page - 1)}
                disabled={filters.page <= 1}
              >
                ← Previous
              </Button>
              
              <span style={{ 
                padding: '0.75rem 1.5rem',
                display: 'flex',
                alignItems: 'center'
              }}>
                Page {filters.page} of {totalPages}
              </span>
              
              <Button 
                onClick={() => handlePageChange(filters.page + 1)}
                disabled={filters.page >= totalPages}
              >
                Next →
              </Button>
            </div>
          </>
        )}
      </ReportContainer>
    </Container>
  );
};

export default ReportManager;