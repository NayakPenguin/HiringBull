import React, { useEffect, useState, useMemo } from 'react';
import styled from 'styled-components';
import OfflineBoltIcon from '@material-ui/icons/OfflineBolt';
import logo from '../utils/logo.png';
import logoBig from '../utils/logo-big.png';
import FavoriteBorderIcon from '@material-ui/icons/FavoriteBorder';
import FavoriteIcon from '@material-ui/icons/Favorite';
import CallMadeIcon from '@material-ui/icons/CallMade';
import YouTubeIcon from '@material-ui/icons/YouTube';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import WorkOutlineIcon from '@material-ui/icons/WorkOutline';

const GetMembership = () => {
  const [isDiscountApplied, setIsDiscountApplied] = useState(false);

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
            HiringBull Membership
          </div>
          <div className="right">
            <a href="/join-membership" className="type2">
              Try Free
            </a>
          </div>
        </div>
      </Navbar>
      <Page1>
        <img src={logoBig} alt="" />
        <h1>Get Premium Membership.</h1>
        <div className="desc">Download the HiringBull Membership App from the Play Store, choose your plan, and unlock early job alerts, curated hiring signals, and priority outreach — so you can stay ahead of the competition.</div>
        <div className="container1000">
          {/* --- STARTER PLAN --- */}
          <div className="square-pricing">
            <div className="title">Starter Plan - <i>1 Month</i></div>
            <div className="desc">Best for trying HiringBull</div>
            <div className="line"></div>
            <div className="price">
              <div className="current-amount">
                {isDiscountApplied ? (
                  <>
                    <span style={{ textDecoration: 'line-through', color: '#999', fontSize: '0.8em', marginRight: '5px' }}>₹249</span>
                    <span>₹187</span>
                  </>
                ) : (
                  <span>₹249</span>
                )}
                / month
              </div>

              <div className="total-amount">
                ( 1 Month Access )
              </div>

              {/* Savings Badge */}
              {isDiscountApplied && (
                <div style={{ color: '#16a34a', fontSize: '0.9rem', marginTop: '5px', fontWeight: 'bold' }}>
                  You saved a total of ₹62
                </div>
              )}
            </div>
            <div className="advantage-points">
              <div className="point"><CheckCircleIcon /> Early alerts from verified career pages you select</div>
              <div className="point"><CheckCircleIcon /> Curated hiring signals from social posts</div>
              <div className="point"><CheckCircleIcon /> Up to 3 outreach requests per month</div>
            </div>
            <a href="/join-membership" className='apply-btn'>Apply for Membership <OfflineBoltIcon /></a>
          </div>

          {/* --- GROWTH PLAN (Most Popular) --- */}
          <div className="square-pricing recommended">
            <div className="tag">Most Popular</div>
            <div className="title">Growth Plan - <i>3 Months</i></div>
            <div className="desc">Best for active job seekers</div>
            <div className="line"></div>
            <div className="price">
              <div className="current-amount">
                {isDiscountApplied ? (
                  <>
                    <span style={{ textDecoration: 'line-through', color: '#999', fontSize: '0.8em', marginRight: '5px' }}>₹199</span>
                    {/* 449 / 3 months approx 150 */}
                    <span>₹150</span>
                  </>
                ) : (
                  <span>₹199</span>
                )}
                / month
              </div>
              <div className="total-amount">
                ( 3 Month Access -
                {isDiscountApplied ? (
                  <>
                    <span style={{ textDecoration: 'line-through', color: '#888', margin: '0 5px' }}>₹599</span>
                    <span>₹449</span>
                  </>
                ) : (
                  <span>₹599</span>
                )}
                Total )
              </div>
              {/* Savings Badge */}
              {isDiscountApplied && (
                <div style={{ color: '#16a34a', fontSize: '0.9rem', marginTop: '5px', fontWeight: 'bold' }}>
                  You saved a total of ₹150
                </div>
              )}
            </div>
            <div className="advantage-points">
              <div className="point"><CheckCircleIcon /> All Starter features included</div>
              <div className="point"><CheckCircleIcon /> <p>100% money-back guarantee if placed <u>Terms apply</u></p></div>
              <div className="point"><CheckCircleIcon /> Priority support</div>
            </div>
            <a href="/join-membership" className='apply-btn'>Apply for Membership <OfflineBoltIcon /></a>
          </div>

          {/* --- PRO PLAN --- */}
          <div className="square-pricing">
            <div className="title">Pro Plan - <i>6 Months</i></div>
            <div className="desc">Maximum Advantage 🔥</div>
            <div className="line"></div>
            <div className="price">
              <div className="current-amount">
                {isDiscountApplied ? (
                  <>
                    <span style={{ textDecoration: 'line-through', color: '#999', fontSize: '0.8em', marginRight: '5px' }}>₹167</span>
                    {/* 749 / 6 months approx 125 */}
                    <span>₹125</span>
                  </>
                ) : (
                  <span>₹167</span>
                )}
                / month
              </div>
              <div className="total-amount">
                ( 6 Month Access -
                {isDiscountApplied ? (
                  <>
                    <span style={{ textDecoration: 'line-through', color: '#888', margin: '0 5px' }}>₹999</span>
                    <span>₹749</span>
                  </>
                ) : (
                  <span>₹999</span>
                )}
                Total )
              </div>
              {/* Savings Badge */}
              {isDiscountApplied && (
                <div style={{ color: '#16a34a', fontSize: '0.9rem', marginTop: '5px', fontWeight: 'bold' }}>
                  You saved a total of ₹250
                </div>
              )}
            </div>
            <div className="advantage-points">
              <div className="point"><CheckCircleIcon /> All Growth features included</div>
              <div className="point"><CheckCircleIcon /> Free mock interviews with FAANG employees</div>
              <div className="point"><CheckCircleIcon /> Outreach feature priority</div>
            </div>
            <a href="/join-membership" className='apply-btn'>Apply for Membership <OfflineBoltIcon /></a>
          </div>
        </div>
      </Page1>
    </Container>
  )
}

export default GetMembership;

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

        /* background-color: black; */
        /* color: #ffffff; */

        border: 1px solid black;

        display: flex;
        align-items: center;
        gap: 5px;
      }

      svg {
        font-size: 1.25rem;
        fill: #ea4444;
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

const Page1 = styled.div`
  padding: 40px;
  background-color: rgba(245, 245, 245, 0.54);

  display: flex;
  flex-direction: column;
  align-items: center; 
  justify-content: center;

  img{
    width: 150px;
    margin-bottom: 20px;
  }

  h1{
    font-size: 2rem;
    text-align: center;
    font-weight: 500;
  }

  .desc{
    width: 100%;
    max-width: 900px;
    text-align: center;
    font-size: 0.9rem;
    font-weight: 200;
  }

  .container1000{
    width: 100%;
    max-width: 1000px;

    margin: 80px 0 0 0;

    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-auto-rows: 460px;
    gap: 24px;

    box-sizing: border-box;

    /* Common square styles */
    .square,
    .square-2 {
      position: relative;
      background: #fff;
      border-radius: 28px;
      box-shadow: 0 0 8px rgba(0, 0, 0, 0.1);
      border: 1px solid #f4eeee;

      padding: 25px;

      .svgs{
        display: flex;
        align-items: center;
        justify-content: flex-start;

        .svg{
          width: 60px;
          height: 60px;
          display: flex; 
          align-items: center;  
          justify-content: center;  
          /* background-color: #d3d3d352; */
          border-radius: 10px;
          font-size: 0.85rem;
          font-weight: 500;
          margin-right: 15px;

          background-color: #faeff0;
          border: 1px solid #d9c8c8;
        } 

        img{
          width: 40px;
          height: 40px;
          margin-right: 15px;
          border-radius: 8px;
        }
      }
      
      .title{
        font-size: 1.5rem;
        font-weight: 600;
        text-align: left;
        margin-top: 15px;
      }

      .desc{
        margin-top: 15px;
        font-size: 1rem;
        font-weight: 300;
        color: #555;
        text-align: left;
      }

      u{
        color: #555;
        font-weight: 200; 
        margin-top: 10px;  
        font-size: 0.85rem;
        font-style: italic;

        b{
          font-weight: 400;
        }

        text-align: left;
        display: block; 
      }

      .tags{
        display: flex;  
        align-items: center;
        gap: 10px;
        margin-top: 20px;

        position: absolute;
        bottom: 20px;

        .tag{
          padding: 7.5px 15px;
          background-color: #ffefc1;
          border-radius: 100px;
          font-size: 0.75rem;
          font-weight: 500;
          color: #b8860b;
        }
      }

    }
      
      /* Large rectangle (spans 2 columns) */
    .square-2 {
      grid-column: span 2;
    }

    .square-pricing{
      position: relative;
      background: #fff;
      border-radius: 28px;
      box-shadow: 0 0 8px rgba(0, 0, 0, 0.1);
      border: 1px solid #f4eeee;

      padding: 25px;

      display: flex;
      flex-direction: column;
      align-items: flex-start;
      justify-content: flex-start;

      .title{
        font-size: 1rem;
        font-weight: 600;
        text-align: left;
        /* padding: 10px 20px; */
        /* background-color: #a6f0b9; */
        /* border-radius: 100px; */

        i{
          font-weight: 300;
        }
      }

      .desc{
        margin-top: 5px;
        font-size: 0.9rem;
        font-weight: 300;
        color: #555;
        text-align: left;
      }

      .line{
        height: 1px;
        width: 100%;

        background-color: #cccccc;

        margin: 15px 0;
      }

      .price{
        .current-amount{
          font-size: 0.85rem;
          font-weight: 300;
          letter-spacing: 0rem;

          span{
            font-size: 1.5rem;
          }
        }

        .total-amount{
          font-size: 0.85rem;
          font-weight: 300;
          margin-top: 5px;
        }


        span{
          font-weight: 600;
          letter-spacing: 0.1rem;

          font-family: 'Inter', system-ui, sans-serif;
          font-feature-settings: "tnum";
          font-variant-numeric: tabular-nums;
        }
      }

      .advantage-points{
        .point{
          display: flex;
          align-items: center;

          font-size: 0.85rem;
          font-weight: 300;
          margin-top: 10px;

          svg{
            margin-right: 10px;
            font-size: 1rem;
          }
        }
      }

      .apply-btn{
        position: absolute;
        width: calc(100% - 50px);
        bottom: 25px;
        padding: 12px 25px;
        background-color: black;    
        color: white;
        border-radius: 100px;
        cursor: pointer;
        font-size: 0.9rem;
        font-weight: 600;

        opacity: 0.75;

        text-decoration: none;

        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;

        text-align: center;
        
        svg{
          font-size: 1.5rem;  
          fill: #ffff00c4;
        }

        &:hover{
          opacity: 1;
          transition-duration: 250ms;
          color: white;
          scale: 1.05;

          svg{
            fill: #ffc502;
          }
        }
      }

    }

    .recommended{
      border: 2px solid #ffb300;
      scale: 1.05;
      /* background-color: #ffb30003; */

      .tag{
        background-color: #ffb300;
        color: #fff; 

        left: calc(50% - 50px);

        position: absolute;
        top: -12.5px;
        padding: 5px 15px;
        font-size: 0.75rem;
        font-weight: 600;

        border-radius: 100px;
      }

      .apply-btn{
        text-align: center;
        opacity: 0.85;
      }
    }

    /* ---------------- SHRINK ---------------- */
    @media (max-width: 1120px) {
      width: calc(100vw - 40px);
      grid-template-columns: 1fr;
      margin: 30px 0;
      grid-auto-rows: auto;
      height: auto;

      .square, .square-2 {
        height: auto;

        .tags{
          display: none;
        }
      }

      .square-2 {
        grid-column: span 1;
      }

      .square-pricing{
        padding: 25px;
        padding-bottom: 100px;

        .apply-btn{
          padding: 10px 20px;
          background-color: black;    
          opacity: 1;
        }
      }

      .recommended{
        border: inherit;
        scale: inherit;
        background-color: inherit;
      }
    }
  }
`