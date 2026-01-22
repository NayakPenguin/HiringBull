import React, { useState, useEffect } from 'react';
import GitHubIcon from '@material-ui/icons/GitHub';
import logo from '../utils/logo.png';
import styled from 'styled-components';
const companies_CACHE_KEY = "hiringbull_companies_cache";
const API_KEY_STORAGE = "hiringbull_x_api_key";

const AddJobs = () => {
  // 🔑 Load api key from localStorage initially
  const [apiKey, setApiKey] = useState(
    () => localStorage.getItem(API_KEY_STORAGE) || ""
  );

  const [job, setJob] = useState({
    companyId: "",
    title: "",
    segment: "INTERNSHIP",
    careerpage_link: "",
    tags: ""
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  /* ===================== */
  /* Persist API key */
  /* ===================== */
  useEffect(() => {
    if (apiKey) {
      localStorage.setItem(API_KEY_STORAGE, apiKey);
    }
  }, [apiKey]);

  /* ===================== */
  /* Companies State */
  /* ===================== */
  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState("");
  const [companyLoading, setCompanyLoading] = useState(false);

  /* ===================== */
  /* Fetch Companies */
  /* ===================== */
  const fetchCompanies = async (force = false) => {
    try {
      setCompanyLoading(true);

      if (!force) {
        const cached = localStorage.getItem(companies_CACHE_KEY);
        if (cached) {
          setCompanies(JSON.parse(cached));
          setCompanyLoading(false);
          return;
        }
      }

      const res = await fetch(
        "https://api.hiringbull.org/api/companies"
      );
      const data = await res.json();

      setCompanies(data);
      localStorage.setItem(
        companies_CACHE_KEY,
        JSON.stringify(data)
      );
    } catch (err) {
      console.error("Failed to fetch companies", err);
    } finally {
      setCompanyLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies(false);
  }, []);

  /* ===================== */
  /* Submit Job */
  /* ===================== */
  const handleSubmit = async () => {
    try {
      setLoading(true);
      setMessage("");

      const payload = [
        {
          companyId: job.companyId,
          title: job.title,
          segment: job.segment,
          careerpage_link: job.careerpage_link,
          tags: job.tags.split(",").map(t => t.trim())
        }
      ];

      const res = await fetch(
        "https://api.hiringbull.org/api/jobs/bulk",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey
          },
          body: JSON.stringify(payload)
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed");

      setMessage("✅ Job pushed successfully");
    } catch (err) {
      setMessage(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const filteredCompanies = companies.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Container>
      <Navbar>
        <div className="top">
          <span>HiringBull Testing Team</span>
          <p>- Testing route for pushing jobs and notifying users</p>
        </div>

        <div className="bottom">
          <div className="left">
            <img src={logo} alt="" />
            HiringBull
          </div>
          <div className="right">
            <a
              href="https://github.com/NayakPenguin/HiringBull/"
              target="_blank"
              rel="noreferrer"
              className="type2"
            >
              HiringBull Github <GitHubIcon />
            </a>
          </div>
        </div>
      </Navbar>

      <Form>
        <h2>Push Job</h2>

        <input
          placeholder="x-api-key"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
        />

        <CompanyBox>
          <div className="header">
            <input
              placeholder="Search Company"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button onClick={() => fetchCompanies(true)}>
              Refresh Companies
            </button>
          </div>

          <div className="list">
            {companyLoading && <p>Loading companies...</p>}
            {!companyLoading &&
              filteredCompanies.map((c) => (
                <div
                  key={c.id}
                  className={`item ${
                    job.companyId === c.id ? "active" : ""
                  }`}
                  onClick={() =>
                    setJob({ ...job, companyId: c.id })
                  }
                >
                  <div className="left">
                    <img src={c.logo} alt="" />
                  </div>
                  <div className="right">
                    <span>{c.name}</span>
                    <small>{c.id}</small>
                  </div>
                </div>
              ))}
          </div>
        </CompanyBox>

        <input
          placeholder="Selected Company ID"
          value={job.companyId}
          readOnly
        />

        <input
          placeholder="Job Title"
          value={job.title}
          onChange={(e) =>
            setJob({ ...job, title: e.target.value })
          }
        />

        <select
          value={job.segment}
          onChange={(e) =>
            setJob({ ...job, segment: e.target.value })
          }
        >
          <option value="INTERNSHIP">INTERNSHIP</option>
          <option value="FRESHER_OR_LESS_THAN_1_YEAR">
            FRESHER OR LESS THAN 1 YEAR
          </option>
          <option value="ONE_TO_THREE_YEARS">
            ONE TO THREE YEARS
          </option>
        </select>

        <input
          placeholder="Career Page Link"
          value={job.careerpage_link}
          onChange={(e) =>
            setJob({ ...job, careerpage_link: e.target.value })
          }
        />

        <input
          placeholder="Tags (comma separated)"
          value={job.tags}
          onChange={(e) =>
            setJob({ ...job, tags: e.target.value })
          }
        />

        <button onClick={handleSubmit} disabled={loading}>
          {loading ? "Pushing..." : "Push Job"}
        </button>

        {message && <p className="message">{message}</p>}
      </Form>
    </Container>
  );
};

export default AddJobs;

/* ===================== */
/* Existing styles untouched */
/* ===================== */

const Container = styled.div`
  width: 100vw; 

  display: flex;
  flex-direction: column;
  align-items: center;
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
        margin-left: 5px;
        margin-top: -1px;
        font-size: 1.15rem;
        fill: #fff;
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

      display: flex;
      flex-direction: column;
      height: 50px;
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

const Form = styled.div`
  max-width: 500px;
  margin: 20px;
  padding: 25px;
  border: 1px solid #ddd;
  border-radius: 10px;

  h2{
    margin-bottom: 20px;
    font-weight: 600;
  }

  input, select {
    width: 100%;
    padding: 10px;
    margin-bottom: 14px;
    border-radius: 6px;
    border: 1px solid #ccc;
  }

  button {
    width: 100%;
    padding: 10px;
    background-color: #1e1d2f;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
  }

  .message {
    margin-top: 15px;
  }
`;

/* ===================== */
/* NEW styles only */
/* ===================== */

const CompanyBox = styled.div`
  border: 1px solid #ccc;
  border-radius: 6px;
  margin-bottom: 14px;

  .header {
    display: flex;
    gap: 10px;
    padding: 10px;

    input {
      margin-bottom: 0;
    }

    button {
      width: auto;
      padding: 8px 12px;
      font-size: 0.8rem;
    }
  }

  .list {
    max-height: 200px;
    overflow-y: auto;
    border-top: 1px solid #eee;
  }

  .item {
    padding: 10px;
    cursor: pointer;
    border-bottom: 1px solid #f1f1f1;

    display: flex;
    align-items: center;

    img{
        height: 45px;
        margin-right: 20px;
        border: 1px solid #f1f1f1;
        border-radius: 5px;
    }

    span {
      display: block;
      font-weight: 500;
    }

    small {
      font-size: 0.7rem;
      color: #666;
    }

    &:hover {
      background-color: #f7f7f7;
    }

    &.active {
      background-color: #eaeaea;
    }
  }
`;
