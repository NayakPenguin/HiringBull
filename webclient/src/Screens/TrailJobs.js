import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import OfflineBoltIcon from '@material-ui/icons/OfflineBolt';
import logo from '../utils/logo.png';
import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline';
import { Link } from 'react-router-dom';

const TrailJobs = () => {
  // State management
  const [experienceFilter, setExperienceFilter] = useState('All Experience');
  const [companyFilter, setCompanyFilter] = useState('Companies');
  const [jobs, setJobs] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [allJobs, setAllJobs] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalJobs, setTotalJobs] = useState(0);
  const jobsPerPage = 10;

  // Filter options
  const experienceOptions = ['All Experience', 'Internship', 'Fresher or Less than 1 year Exp', '1 - 3 Year exp'];
  const [companyOptions, setCompanyOptions] = useState(['Companies']);

  // Fetch companies from backend API with local storage caching
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        console.log('🚀 Starting fetchCompanies...');
        setLoading(true);
        setError(null);
        
        // Check if companies data is cached in local storage
        const cachedCompanies = localStorage.getItem('companies');
        const cachedTimestamp = localStorage.getItem('companiesTimestamp');
        const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours cache
        
        if (cachedCompanies && cachedTimestamp) {
          const timeDiff = Date.now() - parseInt(cachedTimestamp);
          if (timeDiff < CACHE_DURATION) {
            try {
              const data = JSON.parse(cachedCompanies);
              console.log('✅ Using cached companies:', data.length);
              setCompanies(data);
              setCompanyOptions(['Companies', ...data.map(company => company.name)]);
              setLoading(false);
              return;
            } catch (parseError) {
              console.error('Error parsing cached companies:', parseError);
              localStorage.removeItem('companies');
              localStorage.removeItem('companiesTimestamp');
            }
          }
        }
        
        // Fetch fresh data from API
        const fullUrl = `${process.env.REACT_APP_API_URL}/api/companies`;
        console.log('🌐 Fetching companies from:', fullUrl);
        
        const response = await fetch(fullUrl);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('📊 Received companies:', data.length);
        
        // Cache the data in local storage
        localStorage.setItem('companies', JSON.stringify(data));
        localStorage.setItem('companiesTimestamp', Date.now().toString());
        
        setCompanies(data);
        setCompanyOptions(['Companies', ...data.map(company => company.name)]);
        setLoading(false);
      } catch (error) {
        console.error('❌ Error fetching companies:', error);
        setError(error);
        setLoading(false);
      }
    };
    fetchCompanies();
  }, []);

  // Fetch all jobs from API with pagination and store in localStorage
  useEffect(() => {
    const fetchAllJobs = async () => {
      try {
        console.log('🚀 Starting fetchAllJobs');
        setLoading(true);
        setError(null);
        
        // Check if jobs are cached in localStorage
        const cachedJobs = localStorage.getItem('allJobs');
        const cachedTimestamp = localStorage.getItem('jobsTimestamp');
        const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache
        
        if (cachedJobs && cachedTimestamp) {
          const timeDiff = Date.now() - parseInt(cachedTimestamp);
          if (timeDiff < CACHE_DURATION) {
            try {
              const data = JSON.parse(cachedJobs);
              console.log('✅ Using cached jobs:', data.length);
              setAllJobs(data);
              setJobs(data);
              setTotalJobs(data.length);
              setTotalPages(Math.ceil(data.length / jobsPerPage));
              setLoading(false);
              return;
            } catch (parseError) {
              console.error('Error parsing cached jobs:', parseError);
              localStorage.removeItem('allJobs');
              localStorage.removeItem('jobsTimestamp');
            }
          }
        }
        
        // Fetch all pages from API
        let allJobsArray = [];
        let page = 1;
        let hasMorePages = true;
        
        while (hasMorePages) {
          const jobsEndpoint = `${process.env.REACT_APP_API_URL}/api/free-jobs?page=${page}&limit=${jobsPerPage}`;
          console.log('🌐 Fetching page', page, 'from:', jobsEndpoint);
          
          const response = await fetch(jobsEndpoint, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'User-Agent': 'HiringBull-WebClient/1.0'
            },
            mode: 'cors'
          });
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const data = await response.json();
          let jobsArray = [];
          
          if (data && data.data) {
            jobsArray = data.data;
            hasMorePages = data.pagination?.hasNextPage || false;
          } else if (Array.isArray(data)) {
            jobsArray = data;
            hasMorePages = jobsArray.length === jobsPerPage;
          }
          
          allJobsArray = [...allJobsArray, ...jobsArray];
          console.log('📊 Fetched page', page, 'with', jobsArray.length, 'jobs');
          
          if (!hasMorePages || jobsArray.length === 0) {
            break;
          }
          
          page++;
          
          // Safety limit to prevent infinite loops
          if (page > 100) {
            console.warn('🚨 Safety limit reached, stopping pagination');
            break;
          }
        }
        
        console.log('✅ Total jobs fetched:', allJobsArray.length);
        
        // Cache in localStorage
        localStorage.setItem('allJobs', JSON.stringify(allJobsArray));
        localStorage.setItem('jobsTimestamp', Date.now().toString());
        
        // Update state
        setAllJobs(allJobsArray);
        setJobs(allJobsArray);
        setTotalJobs(allJobsArray.length);
        setTotalPages(Math.ceil(allJobsArray.length / jobsPerPage));
        setLastUpdated(new Date());
        
        setLoading(false);
      } catch (error) {
        console.error('❌ Error fetching jobs:', error);
        
        let errorMessage = 'Failed to load job listings. Please try again later.';
        if (error.message.includes('404')) {
          errorMessage = 'Job listings endpoint not found. Please check API configuration.';
        } else if (error.message.includes('CORS')) {
          errorMessage = 'Network error. Please check your connection.';
        } else if (error.message.includes('Failed to fetch')) {
          errorMessage = 'Network connection failed. Please check your internet.';
        }
        
        setError(new Error(errorMessage));
        setLoading(false);
      }
    };
    
    fetchAllJobs();
  }, []); // Only fetch once on mount

  // Client-side filtering logic
  const currentJobs = jobs.filter(job => {
    const experienceMatch = experienceFilter === 'All Experience' || 
      (experienceFilter === 'Internship' && job.segment === 'INTERNSHIP') ||
      (experienceFilter === 'Fresher or Less than 1 year Exp' && job.segment === 'FRESHER_OR_LESS_THAN_1_YEAR') ||
      (experienceFilter === '1 - 3 Year exp' && job.segment === 'ONE_TO_THREE_YEARS');
    
    const companyMatch = companyFilter === 'Companies' || 
      (companyFilter !== 'Companies' && job.company && job.company.toLowerCase().includes(companyFilter.toLowerCase()));
    
    return experienceMatch && companyMatch;
  });

  // Client-side pagination of filtered results
  const filteredTotalPages = Math.ceil(currentJobs.length / jobsPerPage);
  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const paginatedJobs = currentJobs.slice(indexOfFirstJob, indexOfLastJob);
  
  // Display counts for UI
  const displayCount = paginatedJobs.length;
  const totalCount = currentJobs.length;

  // Pagination functions
  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  
  const goToNextPage = () => {
    if (currentPage < filteredTotalPages && !loading) {
      setCurrentPage(prev => prev + 1);
    }
  };
  
  const goToPrevPage = () => {
    if (currentPage > 1 && !loading) {
      setCurrentPage(prev => prev - 1);
    }
  };

  // Company logo generator
  const getCompanyLogo = (company) => {
    const logoMap = {
      'Google': (
        <svg width="40" height="40" viewBox="0 0 40 40">
          <circle cx="20" cy="20" r="18" fill="#4285F4"/>
          <text x="20" y="26" textAnchor="middle" fill="white" fontSize="16" fontWeight="bold">G</text>
        </svg>
      ),
      'Microsoft': (
        <svg width="40" height="40" viewBox="0 0 40 40">
          <rect x="2" y="2" width="16" height="16" fill="#F25022"/>
          <rect x="22" y="2" width="16" height="16" fill="#7FBA00"/>
          <rect x="2" y="22" width="16" height="16" fill="#00A4EF"/>
          <rect x="22" y="22" width="16" height="16" fill="#FFB900"/>
        </svg>
      ),
      'Amazon': (
        <svg width="40" height="40" viewBox="0 0 40 40">
          <rect width="40" height="40" fill="#FF9900" rx="8"/>
          <text x="20" y="25" textAnchor="middle" fill="white" fontSize="16" fontWeight="bold">A</text>
        </svg>
      )
    };
    
    return logoMap[company] || (
      <svg width="40" height="40" viewBox="0 0 40 40">
        <circle cx="20" cy="20" r="18" fill="#666"/>
        <text x="20" y="26" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">?</text>
      </svg>
    );
  };

  return (
    <Container>
      <Navbar>
        <div className="top">
          <span>Already a member?</span> <p>Stay ahead with the HiringBull app on Google Play Store</p> <div className="download-btn">Download <b>HiringBull Membership App</b> Now ↗</div>
        </div>
        <div className="bottom">
          <div className="left">
            <img className='logobig' src={logo} alt="" />
            HiringBull
          </div>
          <div className="right">
            <a href="#features">Features</a>
            <a href="#compare">Compare</a>
            <a href="#pricing">Pricing</a>
            <a href="#faq">FAQ</a>
            <a href="/join-membership" className='type2'>Apply for Membership <OfflineBoltIcon /></a>
          </div>
        </div>
      </Navbar>

      <MainContent>
        <MemberNotice>
          <InfoIcon>ℹ️</InfoIcon>
          <NoticeText>
            <strong>Free Member Access:</strong> Job listings are updated every 24 hours. 
            <UpgradeLink as={Link} to="/join-membership">Upgrade to Premium</UpgradeLink> for real-time job updates and exclusive listings.
          </NoticeText>
        </MemberNotice>

        <FilterSection>
          <Dropdown 
            value={experienceFilter} 
            onChange={(e) => {
              console.log('Experience filter changed to:', e.target.value);
              setExperienceFilter(e.target.value);
              setCurrentPage(1); // Reset to page 1 when filter changes
            }}
          >
            {experienceOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </Dropdown>
          
          <Dropdown 
            value={companyFilter} 
            onChange={(e) => {
              console.log('Company filter changed to:', e.target.value);
              setCompanyFilter(e.target.value);
              setCurrentPage(1); // Reset to page 1 when filter changes
            }}
          >
            {companyOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </Dropdown>
        </FilterSection>

        <JobStats>
          <LastUpdated>
            🕒 Last updated: {lastUpdated ? lastUpdated.toLocaleString() : 'Loading...'}
          </LastUpdated>
          <JobCount>
            Showing {displayCount} of {totalCount} jobs • <LimitedAccess>Free Access</LimitedAccess>
          </JobCount>
        </JobStats>

        <JobList>
          {/* Job content area that scrolls */}
          <div className="job-content">
            {loading ? (
              <LoadingMessage>Loading job listings...</LoadingMessage>
            ) : error ? (
              <ErrorMessage>
                {error.message}
                <br />
                <small style={{ fontSize: '12px', opacity: 0.7 }}>
                  Please refresh the page or try again later.
                </small>
              </ErrorMessage>
            ) : paginatedJobs.length === 0 ? (
              <NoJobsMessage>No jobs found matching your criteria.</NoJobsMessage>
            ) : (
              <>
                {paginatedJobs.map((job, index) => (
                  <JobBar key={index}>
                    <CompanyLogo>
                      {job.companyRel && job.companyRel.logo ? (
                        <img src={job.companyRel.logo} alt={job.company} width="40" height="40" />
                      ) : (
                        getCompanyLogo(job.company)
                      )}
                    </CompanyLogo>
                    
                    <JobTitle>
                      [{job.company}] - {job.title}
                    </JobTitle>
                    
                    <ExternalLinkIcon onClick={() => window.open(job.careerpage_link || '#', '_blank')}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="7" y1="17" x2="17" y2="7"></line>
                        <polyline points="7 7 17 7 17 17"></polyline>
                      </svg>
                    </ExternalLinkIcon>
                    
                    <VerifiedIcon>
                      <CheckCircleOutlineIcon />
                    </VerifiedIcon>
                  </JobBar>
                ))}
              </>
            )}
          </div>
          
          {/* Fixed navigation bar at bottom */}
          <div className="navigation-bar">
            <ListNavigator>
              <NavigatorButton 
                onClick={goToPrevPage} 
                disabled={currentPage <= 1 || filteredTotalPages === 0 || loading}
              >
                ← Previous
              </NavigatorButton>
              
              <PageInfo>
                {loading ? 'Loading...' : 
                 error ? 'Error loading jobs' :
                 filteredTotalPages > 0 ? `Page ${currentPage} of ${filteredTotalPages}` : 
                 'No jobs available'}
              </PageInfo>
              
              <NavigatorButton 
                onClick={goToNextPage} 
                disabled={currentPage >= filteredTotalPages || filteredTotalPages === 0 || loading}
              >
                Next →
              </NavigatorButton>
            </ListNavigator>
          </div>
        </JobList>
      </MainContent>
    </Container>
  );
};

export default TrailJobs;

// Styled Components
const Container = styled.div`
  width: 100vw;
  height: 100vh;
  background-color: #f8f9fa;
  padding-top: 85px;
  border: 1px solid #e0e0e0;
  overflow: hidden;
`;

const Navbar = styled.div`
  width: 100%;
  max-width: 100%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;

  .top {
    height: 40px;
    border-bottom: 1px solid black;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 20px;
    background-color: #000000;
    color: white;
    font-size: 0.85rem;
    font-weight: 300;

    span {
      color: white;
      margin-right: 5px;
      font-weight: 500;
    }

    p {
      color: #d4d1d1;
    }

    .download-btn {
      margin-left: 5px;
      padding: 5px 10px;
      background-color: #312f2f;
      color: white;
      border-radius: 100px;
      cursor: pointer;
      font-size: 0.75rem;
      white-space: nowrap;

      b {
        display: none;
      }
    }
  }

  .bottom {
    height: 45px;
    border-bottom: 1px solid #e1dbdb;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 50px;
    background-color: white;

    .left {
      width: auto;
      height: 30px;
      display: flex;
      align-items: center;
      cursor: pointer;
      text-transform: uppercase;
      font-size: 1.1rem;
      font-weight: 600;
      letter-spacing: 1.5px;

      img {
        height: 26px;
        scale: 1.75;
        margin-right: 12px;
      }
    }

    .right {
      display: flex;
      align-items: center;
      gap: 25px;

      a {
        text-decoration: none;
        color: black;
        font-size: 0.85rem;
        font-weight: 500;
        cursor: pointer;
      }

      .type2 {
        padding: 5px 15px;
        border-radius: 100px;
        cursor: pointer;
        background-color: black;
        color: #ffffff;
        display: flex;
        align-items: center;
        gap: 5px;
      }

      svg {
        font-size: 1.25rem;
        fill: #ffc502;
      }
    }
  }

  @media (max-width: 500px) {
    .top {
      padding: 0 12px;
      font-size: 0.75rem;

      p {
        display: none;
      }

      span {
        display: none;
      }

      .download-btn {
        padding: 4px 8px;
        font-size: 0.7rem;

        b {
          display: inline;
          color: white;
          font-weight: 600;
        }
      }
    }

    .bottom {
      padding: 0 16px;
      height: 52px;

      .left {
        font-size: 0.9rem;
        letter-spacing: 1px;

        img {
          height: 22px;
          scale: 1.4;
          margin-right: 8px;
        }
      }

      .right {
        gap: 12px;

        a {
          display: none;
        }

        .type2 {
          padding: 5px 12px;
          font-size: 0.75rem;
        }

        svg {
          font-size: 1.1rem;
        }
      }
    }
  }
`;

const MainContent = styled.div`
  width: 100%;
  margin: 0 auto;
  padding: 20px;
  padding-bottom: 120px;
`;

const MemberNotice = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background-color: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 8px;
  margin-bottom: 12px;
  color: #856404;
`;

const InfoIcon = styled.div`
  font-size: 20px;
  flex-shrink: 0;
`;

const NoticeText = styled.div`
  font-size: 14px;
  line-height: 1.5;
  font-weight: 700;
  text-align: center;
`;

const UpgradeLink = styled.span`
  color: #007bff;
  text-decoration: none;
  font-weight: 600;
  cursor: pointer;
  
  &:hover {
    text-decoration: underline;
  }
`;

const JobStats = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding: 12px 16px;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
`;

const LastUpdated = styled.div`
  font-size: 13px;
  color: #6c757d;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const JobCount = styled.div`
  font-size: 14px;
  color: #495057;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const LimitedAccess = styled.span`
  background-color: #ffc107;
  color: #212529;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
`;

const FilterSection = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
  position: sticky;
  top: 85px;
  z-index: 100;
  background-color: #f8f9fa;
  padding: 16px 12px;
  border-bottom: 1px solid #e9ecef;
`;

const Dropdown = styled.select`
  padding: 16px 40px 16px 16px;
  border: 2px solid #e1e5e9;
  border-radius: 12px;
  background-color: white;
  font-size: 15px;
  font-weight: 500;
  color: #2c3e50;
  cursor: pointer;
  min-width: 220px;
  text-align: left;
  text-align-last: left;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236c757d' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='7 10 12 15 17 10'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 16px center;
  background-size: 18px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

  &:hover {
    border-color: #4285f4;
    box-shadow: 0 4px 12px rgba(66, 133, 244, 0.15);
    transform: translateY(-1px);
  }

  &:focus {
    outline: none;
    border-color: #4285f4;
    box-shadow: 0 0 0 3px rgba(66, 133, 244, 0.1), 0 4px 12px rgba(66, 133, 244, 0.15);
    transform: translateY(-1px);
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

const JobList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
  border: 1px solid #000000;
  border-radius: 8px;
  overflow: hidden;
  height: 434.5px;
  margin-top: 5px;
  
  /* Job content area */
  .job-content {
    flex: 1;
    overflow-y: auto;
    padding-bottom: 0;
    padding-top: 0;
    
    &::-webkit-scrollbar {
      display: none;
    }
    
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  
  /* Navigation bar fixed at bottom */
  .navigation-bar {
    flex-shrink: 0;
    border-top: 1px solid #000000;
    background-color: white;
    padding: 8px 16px;
  }
`;

const JobBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  background-color: white;
  border-bottom: 1px solid #000000;
  width: 100%;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: #f8f9fa;
  }
`;

const CompanyLogo = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
`;

const JobTitle = styled.div`
  flex: 1;
  font-size: 16px;
  font-weight: 500;
  color: #333;
`;

const ExternalLinkIcon = styled.div`
  color: #666;
  margin-right: 12px;
  cursor: pointer;
  
  svg {
    font-size: 20px;
  }
`;

const VerifiedIcon = styled.div`
  color: #4caf50;
  
  svg {
    font-size: 24px;
  }
`;

const LoadingMessage = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: #666;
  font-size: 16px;
`;

const ErrorMessage = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: #e74c3c;
  font-size: 16px;
`;

const NoJobsMessage = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: #666;
  font-size: 16px;
`;

const ListNavigator = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 4px 0;
  background-color: transparent;
  gap: 24px;
`;

const NavigatorButton = styled.button`
  padding: 12px 20px;
  background-color: ${props => props.disabled ? '#e9ecef' : '#007bff'};
  color: ${props => props.disabled ? '#6c757d' : 'white'};
  border: none;
  border-radius: 6px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  min-width: 100px;
  text-align: center;

  &:hover:not(:disabled) {
    background-color: #0056b3;
  }

  &:disabled {
    opacity: 0.6;
  }
`;

const PageInfo = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #495057;
  text-align: center;
  min-width: 120px;
`;
