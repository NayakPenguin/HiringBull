import React, { useEffect, useState, useMemo } from 'react';
import styled from 'styled-components';
import OfflineBoltIcon from '@material-ui/icons/OfflineBolt';
import logo from '../utils/logo.png';
import logoBig from '../utils/logo-big.png';
import FavoriteBorderIcon from '@material-ui/icons/FavoriteBorder';
import FavoriteIcon from '@material-ui/icons/Favorite';
import CallMadeIcon from '@material-ui/icons/CallMade';
import SearchIcon from '@material-ui/icons/Search';
import * as XLSX from "xlsx";

const CACHE_KEY = "freeJobs";
const TIMESTAMP_KEY = "freeJobsTimestamp";
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

const FreeJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [search, setSearch] = useState("");
  const [showAd, setShowAd] = useState(true);

  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem("favoriteJobs");
    return saved ? JSON.parse(saved) : {};
  });

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

    fetchJobsFromAPI();
  };

  useEffect(() => {
    loadJobs();
  }, []);

  function formatPostedTime(dateString) {
    const now = new Date();
    const posted = new Date(dateString);
    const diffMs = now - posted;

    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(days / 7);

    if (seconds < 60) return `Posted ${seconds} second${seconds !== 1 ? "s" : ""} ago`;
    if (minutes < 60) return `Posted ${minutes} min ago`;
    if (hours < 24) return `Posted ${hours} hour${hours !== 1 ? "s" : ""} ago`;
    if (days === 1) return `Posted Yesterday`;
    if (days < 7) return `Posted ${days} days ago`;
    if (weeks === 1) return `Posted 1 week ago`;
    if (weeks < 4) return `Posted few weeks ago`;

    const months = Math.floor(days / 30);
    if (months === 1) return `Posted 1 month ago`;
    if (months < 12) return `Posted ${months} months ago`;

    const years = Math.floor(days / 365);
    return `Posted ${years} year${years !== 1 ? "s" : ""} ago`;
  }

  const premiumFeatures = [
    "Early alerts from verified career pages",
    "Get referrals through direct outreach to employees.",
    "Curated hiring posts from LinkedIn",
    "Free mock interviews with employees",
    "Priority support with insider connections",
  ];

  const toggleFavorite = (job) => {
    setFavorites((prev) => {
      const updated = { ...prev };
      const key = job.id;

      if (updated[key]) {
        delete updated[key];
      } else {
        updated[key] = job;
      }

      localStorage.setItem("favoriteJobs", JSON.stringify(updated));
      return updated;
    });
  };

  // Filtered jobs based on search
  const filteredJobs = useMemo(() => {
    const text = search.toLowerCase();
    return jobs.filter((job) =>
      job.title?.toLowerCase().includes(text) ||
      job.company?.toLowerCase().includes(text)
    );
  }, [jobs, search]);

  const downloadExcel = () => {
    if (!filteredJobs.length) return;

    const data = filteredJobs.map((job) => ({
      Title: job.title || "",
      Company: job.company || "",
      Segment: job.segment || "",
      "Job Link": job.careerpage_link || "",
      Applied: "No", // default column
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Jobs");

    XLSX.writeFile(workbook, "HiringBull_Jobs.xlsx");
  };

  return (
    <Container>
      <Navbar>
        <div className="top">
          <span>Already a member?</span>
          <p>Stay ahead with the HiringBull app on Google Play Store</p>
          <div className="download-btn">
            Download <b>HiringBull Membership App</b> Now ↗
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
          <div className="top-info">
            <h1>Explore Jobs <span>Free Version</span></h1>
            <p className='desc'>
              Find your dream job from our curated list of opportunities.
              This is the free version, where jobs are displayed with a
              24–48 hour delay.
            </p>
          </div>

          <div className="controls">
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search company or job title ..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <SearchIcon />
            </div>
            <div className="download-excel" onClick={downloadExcel}>
              Download Excel
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Microsoft_Office_Excel_%282019%E2%80%932025%29.svg/960px-Microsoft_Office_Excel_%282019%E2%80%932025%29.svg.png"
                alt=""
              />
            </div>
          </div>

          <div className="showing-results">
            Showing {filteredJobs.length} job
            {filteredJobs.length !== 1 ? "s" : ""} with a 24–48 hour delay
          </div>

          <div className="all-jobs">
            {loading ? (
              <p>Loading jobs...</p>
            ) : error ? (
              <p>Error loading jobs.</p>
            ) : filteredJobs.length === 0 ? (
              <p>No jobs found.</p>
            ) : (
              filteredJobs.map((job, index) => {
                const key = job.id;
                const isFav = favorites[key];

                return (
                  <div className="job" key={index}>
                    <div className="left">
                      {job.companyRel?.logo && (
                        <img
                          src={job.companyRel.logo}
                          alt={job.company}
                        />
                      )}
                    </div>

                    <div className="center">
                      <p className="title">
                        <p>{job.title}</p>
                        <p>
                          <span className="no-desktop">
                            {job.company}
                          </span>
                          <span>
                            {job.segment
                              ?.toLowerCase()
                              .split("_")
                              .join(" ")
                              .replace(/\b\w/g, (c) => c.toUpperCase())}
                          </span>
                        </p>
                      </p>
                      <p className="company no-mobile">{job.company}</p>
                      <div className="date">
                        {formatPostedTime(job.created_at)}
                      </div>
                    </div>

                    <div className="right">
                      <div
                        className={`button ${isFav ? "fav" : ""}`}
                        onClick={() => toggleFavorite(job)}
                        style={{ cursor: "pointer" }}
                      >
                        {isFav
                          ? <FavoriteIcon />
                          : <FavoriteBorderIcon />
                        }
                      </div>

                      <div
                        className="button"
                        onClick={() =>
                          window.open(job.careerpage_link || "#", "_blank")
                        }
                        style={{ cursor: "pointer" }}
                      >
                        <CallMadeIcon />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Main>

        <Advertisement>
          <div className="one-ad">
            <img src={logoBig} alt="HiringBull Logo" />
            <h2>Don't Let 48 Hours Cost You the Job.</h2>
            <p>
              Free users see jobs 2 days late. Premium members apply the
              moment they go live.
            </p>

            <div className="features">
              {premiumFeatures.map((text, index) => (
                <div className="feature" key={index}>
                  <OfflineBoltIcon />
                  <div className="text">{text}</div>
                </div>
              ))}
            </div>

            <a href="/join-membership" className="apply-btn">
              Apply for Membership <OfflineBoltIcon />
            </a>
          </div>
        </Advertisement>
      </Page>

      {showAd && (
        <AdvertisementMobile>
          You’re seeing jobs with a 48-hour delay - while Premium members apply the moment they go live, reach out to employees for referrals, and get interview support to stay ahead of the competition.
          <div className="btns">
            <button onClick={() => window.location.href = "/join-membership"}>
              Get Premium
            </button>
            <button onClick={() => setShowAd(false)}>
              I don't want to upgrade
            </button>
          </div>
        </AdvertisementMobile>
      )}
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
        margin-right: 20px;
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
  width: calc(100% - 400px);
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  flex-direction: column;

  padding: 20px 40px;
  
  .top-info{
    h1 {
      display: flex;
      align-items: center;
      gap: 10px;
      font-weight: 600; 
      font-size: 1.75rem;

      span{
        font-size: 0.75rem; 
        border: 1px solid #a59e9e;
        padding: 5px 10px;
        border-radius: 100px;
        font-weight: 300;
      }
    }   

    .desc{
      margin-top: 10px;
      font-size: 0.9rem;
      font-weight: 300;
      color: #0000008a;
    }
  }
  
  .controls{
    width: 100%;
    display: flex;
    align-items: center;
    margin-top: 20px;

    .search-bar{
      flex: 1;
      height: 60px;
      background-color: #fff;
      border: 1px solid #e1dbdb;
      border-radius: 100px;
  
      display: flex;
      align-items: center;
      gap: 10px;
  
      padding: 0 25px;
  
      input{
        flex: 1;
        height: 100%;
        border: none;
        outline: none;
        font-size: 0.9rem;
        border-radius: 100px;
      }
  
      svg{
        font-size: 1.75rem;
        fill: #0000008a;
      } 
    }

    .download-excel{
      height: 60px;
      background-color: #fff;
      border: 1px solid #e1dbdb;
      border-radius: 100px;
      margin-left: 10px;

      display: flex;
      align-items: center;
      gap: 10px;

      padding: 0 20px;
      cursor: pointer;

      font-weight: 500;
      font-size: 0.85rem;

      img{
        height: 25px;
      }

      @media (max-width: 1100px) {
        display: none;
      }
    }
  }

  .showing-results{
    margin-top: 20px;
    font-size: 0.75rem;
    color: #0000008a;
    font-weight: 300;
    /* font-style: italic; */
  }

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
        border: 1px solid #e1dbdb;
        padding: 5px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 10px;

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

          p{
            margin-right: 10px;
            display: inline-block;
          }
          
          span{
            display: inline-block;
            font-size: 0.65rem;
            background-color: #f6f6f6;
            color: #000000;
            padding: 5px 10px;
            border-radius: 100px;
            font-weight: 400; 
          }

          .no-desktop{
            display: none;
          }
        }

        .tags{
          gap: 8px;
          display: flex;
          flex-wrap: wrap;
          margin-top: 8px;

          .tag{
            font-size: 0.65rem;
            padding: 3px 8px;
            background-color: #f6f6f6;
            color: #000000;
            border-radius: 100px;
            display: inline-block;
            margin-top: 8px;  
          }
        }

        .date{
          margin-top: 10px;
          padding-top: 10px;
          border-top: 1px solid #e1dbdb7d;
          font-size: 0.65rem;
          color: #0000005e;
        }
      }

      .right{
        display: flex;
        align-items: center;
        gap: 10px;

        .button{
          height: 50px;
          aspect-ratio: 1/1;
          /* background-color: whitesmoke; */
          border: 1px solid #e1dbdb;
          border-radius: 100px;
          cursor: pointer;
          font-size: 0.75rem;
          white-space: nowrap;

          display: grid;
          place-items: center;

          svg{
            font-size: 1.5rem;
            /* fill: white; */
          }

          &:hover{
            border: 1px solid #444;
            transition-duration: 250ms;
          }
        } 

        .fav{
          /* background-color: #333; */
          border-color: #333;
          transition-duration: 250ms;

          svg{
            fill: #333;
          }
        }
      }
    } 
  }

  @media (max-width: 1100px) {
    width: 100%;
    padding: 20px;

    .top-info{
      h1 { 
        font-size: 1.5rem;
      }   

      .desc{
        font-size: 0.8rem;
      }
    }

    .controls{
      width: 100%;

      .search-bar{
        flex: 1;
        min-width: 0;
        height: 50px;
        background-color: #fff;
        border: 1px solid #e1dbdb;
        border-radius: 100px;
    
        display: flex;
        align-items: center;
        gap: 10px;
    
        padding: 0;
    
        input{
          flex: 1;
          min-width: 0;
          height: 100%;
          border: none;
          outline: none;
          font-size: 0.85rem;
          border-radius: 100px;
          margin-left: 20px;
        }
    
        svg{
          margin-right: 20px;
          font-size: 1.75rem;
          fill: #0000008a;
        } 
      }

      .download-excel{
        display: none;
      }
    }

    .all-jobs{
      .job{
        position: relative;
        width: 100%;
        height: auto;

        display: flex;  
        flex-direction: column;
        align-items: flex-start;
        justify-content: flex-start;

        padding: 20px;
        padding-bottom: 0;

        .left{
          height: auto;
          
          img{
            height: 45px;
          }
        }
        
        .center{
          flex: 1;
          margin: 10px 0;

          .title{ 
            font-size: 0.9rem;
            font-weight: 500; 

            display: flex;
            align-items: flex-start;
            flex-direction: column;
            gap: 5px;

            span{
              border: 1px solid #e1dbdb;
            }

            .no-desktop{
              font-weight: 500;
              display: inline-block;
              margin-right: 5px;
            }
          }

          .date{
            margin-top: 10px;
            padding-top: 10px;
            border-top: 1px solid #e1dbdb7d;
            font-size: 0.65rem;
            color: #0000005e;
          }
        }

        .right{
          position: absolute;
          top: 15px;
          right: 15px;
          display: flex;
          align-items: center;
          gap: 10px;

          .button{
            height: 55px;
            aspect-ratio: 1/1;
            border-radius: 10px;
          } 
        }
      } 
    }
  }
`;

const Advertisement = styled.div`
  display: flex;
  flex-direction: column;
  width: calc(400px - 50px);
  position: sticky;
  top: 40px;
  
  .one-ad{
    background-color: #fff;
    border: 1px solid #e1dbdb;
    border-radius: 10px;
    padding: 20px;
    margin-top: 20px;
  
    img {
      max-width: 70%;
      border-radius: 10px;
    }

    .youtube-icon{
      height: 40px;
      display: inline-block;
    }
  
    h2 {
      font-size: 1.25rem;
      font-weight: 600;
    }
  
    p {
      font-size: 0.9rem;
      color: #0000008a;
    }
  
    .features{
      display: flex;
      align-items: center;
      flex-direction: column;
      margin-top: 15px;
      gap: 10px;
      
      .feature{
        width: 100%;
        display: flex;
        align-items: center;
        gap: 10px; 
        .text{
          font-size: 0.85rem;
          color: #0000008a;
        }
  
        svg{
          font-size: 1.5rem;
          fill: #000;
        }
      } 
    }
  
    .apply-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-top: 20px;
      text-decoration: none;
      font-size: 0.85rem;
      font-weight: 500;
      padding: 10px 15px;
      border-radius: 100px;
      cursor: pointer;
  
      background-color: black;
      color: #ffffff;
  
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .demo-btn{
      display: flex;
      align-items: center;
      justify-content: center;
      margin-top: 10px;
      text-decoration: none;
      font-size: 0.85rem;
      font-weight: 500;
      padding: 10px 15px;
      border-radius: 100px;
      cursor: pointer;

      background-color: transparent;
      color: black;
      border: 1px solid #fbdfdf;

      display: flex;
      align-items: center;
      gap: 5px; 

      img{
        height: 20px;
        margin-right: 5px;
      }
    }
  
    svg {
      font-size: 1.25rem;
      fill: #ffc502;
    }
  }

  @media (max-width: 1100px) {
    display: none;
  }
`;


const AdvertisementMobile = styled.div`
  position: fixed;
  bottom: 15px;
  left: 50%;
  transform: translateX(-50%);
  width: calc(100vw - 30px);

  /* Glass effect */
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px); /* Safari support */

  border: 1px solid white;
  border-radius: 14px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);

  padding: 10px;
  margin-top: 20px;

  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  flex-direction: column;
  gap: 15px;

  font-size: 0.75rem;

  .btns{
    display: flex;
    align-items: center;
    gap: 10px;

    button{
      padding: 8px 12px;
      border-radius: 100px;
      font-size: 0.75rem;
      font-weight: 500;
      cursor: pointer;
      border: none;

      &:first-child{
        background-color: black;
        color: white;
      }

      &:last-child{
        background-color: transparent;
        color: black;
        border: 1px solid #e1dbdb;
      }
    }
  }

  @media (min-width: 1100px) {
    display: none;
  }
`;