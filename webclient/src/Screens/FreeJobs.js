import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import OfflineBoltIcon from '@material-ui/icons/OfflineBolt';
import logo from '../utils/logo.png';
import FavoriteBorderIcon from '@material-ui/icons/FavoriteBorder';
import FavoriteIcon from '@material-ui/icons/Favorite';
import CallMadeIcon from '@material-ui/icons/CallMade';

const CACHE_KEY = "freeJobs";
const TIMESTAMP_KEY = "freeJobsTimestamp";
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

const FreeJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchJobsFromAPI = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/free-jobs?page=1&limit=50`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const jobsArray = data?.data || data || [];

      // Save to cache
      localStorage.setItem(CACHE_KEY, JSON.stringify(jobsArray));
      localStorage.setItem(TIMESTAMP_KEY, Date.now().toString());

      setJobs(jobsArray);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const loadJobs = () => {
    const cachedJobs = localStorage.getItem(CACHE_KEY);
    const cachedTimestamp = localStorage.getItem(TIMESTAMP_KEY);

    if (cachedJobs && cachedTimestamp) {
      const timeDiff = Date.now() - parseInt(cachedTimestamp);

      if (timeDiff < CACHE_DURATION) {
        try {
          const jobsArray = JSON.parse(cachedJobs);
          setJobs(jobsArray);
          setLastUpdated(new Date(parseInt(cachedTimestamp)));
          setLoading(false);
          return;
        } catch (e) {
          localStorage.removeItem(CACHE_KEY);
          localStorage.removeItem(TIMESTAMP_KEY);
        }
      }
    }

    // Cache expired or not present
    fetchJobsFromAPI();
  };

  useEffect(() => {
    loadJobs();
  }, []);

  return (
    <Container>
      <Navbar>
        <div className="top">
          <span>Using the free version?</span>
          <p>See jobs from 25 companies with a 48-hour delay.</p>
          <div className="download-btn">
            Get the App for <b>Real-Time Alerts from 100+ Companies</b> ↗
          </div>
        </div>

        <div className="bottom">
          <div className="left">
            <img className="logobig" src={logo} alt="" />
            HiringBull
          </div>
          <div className="right">
            <a href="/join-membership" className="type2">
              Apply for Membership <OfflineBoltIcon />
            </a>
          </div>
        </div>
      </Navbar>

      <Page>
        <Main>
          <div className="controls">
            <button onClick={fetchJobsFromAPI} disabled={loading}>
              {loading ? "Refreshing..." : "Refresh Jobs"}
            </button>

            {lastUpdated && (
              <span className="last-updated">
                Last updated: {lastUpdated.toLocaleString()}
              </span>
            )}
          </div>

          <div className="all-jobs">
            {loading ? (
              <p>Loading jobs...</p>
            ) : error ? (
              <p>Error loading jobs.</p>
            ) : jobs.length === 0 ? (
              <p>No jobs available.</p>
            ) : (
              jobs.map((job, index) => (
                <div
                  className="job"
                  key={index}
                  onClick={() => window.open(job.careerpage_link || "#", "_blank")}
                  style={{ cursor: "pointer" }}
                >
                  <div className="left">
                    {job.companyRel && job.companyRel.logo ? (
                      <img
                        src={job.companyRel.logo}
                        alt={job.company}
                      />
                    ) : (
                      null
                    )}
                  </div>
                  <div className="center">
                    <p className="title">{job.title}</p>
                    <p className="company">{job.company}</p>
                    <div className="tags">
                      {job.tags && job.tags.map((tag, idx) => (
                        <span key={idx} className="tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="right">
                    <div className="button">
                      <FavoriteBorderIcon />
                    </div>
                    <div className="button">
                      <CallMadeIcon />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Main>
      </Page>
    </Container>
  );
};

export default FreeJobs;

const Container = styled.div`
  width: 100vw;
  padding-top: 40px;

  @media (max-width: 500px) {
    .no-mobile{
      display: none;
    }
  }
`;


const Navbar = styled.div`
  width: 100%;
  max-width: 100%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  display: flex;
  flex-direction: column;

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

    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;

    span {
      color: white;
      margin-right: 5px;
      font-weight: 500;
    }

    p{
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

      b{
        display: none;
      }
    }
  }

  .bottom {
    height: 45px;
    /* background-color: whitesmoke; */
    border-bottom: 1px solid #e1dbdb;

    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 50px;

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

      img {
        height: 25px;
        margin-top: 6px;
      }
    }
  }

  /* ========================= */
  /* 📱 MOBILE (≤500px) */
  /* ========================= */

  @media (max-width: 500px) {
    .top {
      padding: 0 12px;
      font-size: 0.75rem;

      p{
        display: none;
      }

      span{
        display: none;
      }


      .download-btn {
        padding: 4px 8px;
        font-size: 0.7rem;

        b{
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

        /* Hide normal links on mobile */
        a {
          display: none;
        }

        /* Keep primary CTA */
        .type2 {
          padding: 5px 12px;
          font-size: 0.75rem;
        }

        svg {
          font-size: 1.1rem;
        }

        img {
          height: 22px;
          margin-top: 0;
        }
      }
    }
  }
`;


const Page = styled.div`
  width: 100vw;

  display: flex;
  align-items: flex-start;
  justify-content: flex-start;  

  background-color: #f5f5f58a;
`

const Main = styled.div`
  width: calc(100% - 500px);
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  flex-direction: column;

  padding: 0 20px;

  .all-jobs{
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 20px;
    margin-top: 20px;

    .job{
      width: 100%;
      height: 120px;
      background-color: #fff;
      border-radius: 10px;

      border: 1px solid #e1dbdb;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);

      display: flex;  
      align-items: center;
      justify-content: space-between;

      padding: 20px;

      .left{
        height: 100%;
        
        img{
          height: 100%;
          aspect-ratio: 1/1;
          border-radius: 10px;
          object-fit: contain;  
        }
      }
      
      .center{
        flex: 1;
        margin: 0 20px;

        .title{ 
          font-size: 1.1rem;
          font-weight: 500;
        }

        .tags{
          gap: 8px;
          display: flex;
          flex-wrap: wrap;
          margin-top: 8px;

          .tag{
            font-size: 0.75rem;
            padding: 3px 8px;
            background-color: #f6f6f6;
            color: #000000;
            border-radius: 100px;
            display: inline-block;
            margin-top: 8px;  
          }
        }
      }

      .right{
        display: flex;
        align-items: center;
        gap: 10px;

        .button{
          height: 60px;
          aspect-ratio: 1/1;
          background-color: #f6f6f6;
          border-radius: 100px;
          cursor: pointer;
          font-size: 0.75rem;
          white-space: nowrap;

          display: grid;
          place-items: center;

          svg{
            font-size: 1.25rem;
            /* fill: white; */
          }
        } 
      }
    } 
  }

`;