// @ts-nocheck
"use client";

import styled from "styled-components";
import OfflineBoltIcon from "@mui/icons-material/OfflineBolt";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const logo = "/logo.png";
const logoBig = "/logo-big.png";

type HomeHeaderProps = {
  smoothScrollTo: (elementId: string) => void;
};

export default function HomeHeader({ smoothScrollTo }: HomeHeaderProps) {
  return (
    <>
      <Navbar>
        <div className="top">
          <span>Already a member?</span>
          <p>Stay ahead with the HiringBull app on Google Play Store</p>
          <div className="download-btn">Download Now ↗</div>
        </div>
        <div className="bottom">
          <div className="left">
            <img className="logobig" src={logo} alt="" />
            HiringBull
          </div>
          <div className="right">
            <a href="#features" onClick={(e) => { e.preventDefault(); smoothScrollTo("features"); }} style={{ cursor: "pointer" }}>Features</a>
            <a href="#compare" onClick={(e) => { e.preventDefault(); smoothScrollTo("compare"); }} style={{ cursor: "pointer" }}>Compare</a>
            <a href="#pricing" onClick={(e) => { e.preventDefault(); smoothScrollTo("pricing"); }} style={{ cursor: "pointer" }}>Pricing</a>
            <a href="#faq" onClick={(e) => { e.preventDefault(); smoothScrollTo("faq"); }} style={{ cursor: "pointer" }}>FAQ</a>
            <a href="/join-membership" className="type2">Apply for Membership <OfflineBoltIcon /></a>
          </div>
        </div>
      </Navbar>

      <Hero>
        <img src={logoBig} alt="" />
        <p className="hero-title main-title">Apply early.</p>
        <p className="hero-subtitle">Compete with <u>50 applicants</u>, not 50,000.</p>
        <div className="btns">
          <a href="/join-membership" className="apply-btn">Apply for Membership <OfflineBoltIcon /></a>
        </div>
        <div className="dancing-scroll-action" onClick={() => window.scrollTo({ top: window.innerHeight, behavior: "smooth" })}>
          <ExpandMoreIcon />
        </div>
      </Hero>
    </>
  );
}

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
    }
  }

  .bottom {
    height: 45px;
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

      p,
      span {
        display: none;
      }

      .download-btn {
        padding: 4px 8px;
        font-size: 0.7rem;
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

const Hero = styled.div`
  position: relative;
  width: 100vw;
  min-height: calc(100vh - 85px);
  background-color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  img {
    height: 100px;
    margin-top: -60px;
  }

  .hero-title {
    font-size: 3.8rem;
    line-height: 1.15;
    letter-spacing: 3.5px;
    text-align: center;
    max-width: 900px;
    margin: 1rem 0;
    text-transform: uppercase;
    font-weight: 700;
  }

  .hero-subtitle {
    font-size: 1.65rem;
    font-weight: 200;
    line-height: 1.5;
    text-align: center;
    color: #333;
    max-width: 720px;
    margin-left: auto;
    margin-right: auto;

    u {
      color: #333;
      font-weight: 400;
    }
  }

  .btns {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;

    .apply-btn {
      margin-top: 30px;
      padding: 12px 25px;
      background-color: black;
      color: white;
      border-radius: 100px;
      cursor: pointer;
      font-size: 1.1rem;
      font-weight: 600;
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: 8px;

      svg {
        font-size: 1.5rem;
        fill: #ffc502;
      }
    }
  }

  .dancing-scroll-action {
    position: absolute;
    bottom: 40px;
    left: 50%;
    transform: translateX(-50%);
    cursor: pointer;
    transition: all 0.3s ease;
    animation: float 3s ease-in-out infinite;

    &:hover {
      transform: translateX(-50%) scale(1.1);
      animation-play-state: paused;
    }
  }

  .dancing-scroll-action svg {
    font-size: 4rem;
    fill: #888;
  }

  @keyframes float {
    0%, 100% {
      transform: translate(-50%, 0);
      opacity: 0.8;
    }
    50% {
      transform: translate(-50%, -15px);
      opacity: 1;
    }
  }

  @media (max-width: 500px) {
    img {
      height: 60px;
      margin-top: -60px;
    }

    .hero-title {
      font-size: 2.5rem;
      line-height: 1.15;
    }

    .hero-subtitle {
      font-size: 1.25rem;
    }

    .btns {
      margin-top: 40px;

      .apply-btn {
        margin: 0;
        padding: 10px 20px;
        font-size: 0.9rem;
      }
    }
  }
`;
