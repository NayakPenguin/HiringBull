import React from 'react';
import styled from 'styled-components';
import OfflineBoltIcon from '@material-ui/icons/OfflineBolt';
import logoBig from '../utils/logo-big.png';
import logo from '../utils/logo.png';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

const Landing = () => {
  return (
    <Container>
      <Navbar>
        <div className="top">
          <span>Already a member?</span> Stay ahead with the HiringBull app on Google Play Store <div className="download-btn">Download Now ↗</div>
        </div>
        <div className="bottom">
          <div className="left">
            <img className='logobig' src={logo} alt="" />
            HiringBull
          </div>
          <div className="right">
            <a href="#how-it-works">How it works</a>
            <a href="#pricing">Pricing</a>
            <a href="#faq">FAQ</a>
            <a href="#apply" className='type2'>Apply for Membership <OfflineBoltIcon /></a>
          </div>
        </div>
      </Navbar>
      <Page1>
        <img src={logoBig} alt="" />

        <p class="hero-title main-title">
          Apply early.
        </p>

        <p class="hero-subtitle">
          Compete with <u>50 applicants</u>, not 50,000.
        </p>

        <a href='/' className="apply-btn">
          Apply for Membership <OfflineBoltIcon />
        </a>

        <div className="dancing-scroll-action">
          <ExpandMoreIcon />
        </div>
      </Page1>
      <PageGap></PageGap>
      <Page>
        <h1>
          Features
          <img src={logo} alt="" />
        </h1>
        <h2>
          What you get with HiringBull
          
        </h2>
      </Page>
    </Container>
  )
}

export default Landing

const Container = styled.div`
  width: 100vw; 
`

const Navbar = styled.div`
  width: 100vw; 
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);   

  display: flex;
  flex-direction: column;

  .top{
    height: 40px;
    border-bottom: 1px solid black;

    display: flex; 
    align-items: center;  
    justify-content: center;
    padding: 0 20px;

    background-color: #ffc502;

    font-size: 0.85rem;
    font-weight: 300;
    
    span{
      margin-right: 5px;
      font-weight: 500;
    }

    .download-btn{
      margin-left: 5px;
      padding: 5px 10px;
      background-color: black;
      color: white;
      border-radius: 100px;
      cursor: pointer;
      font-size: 0.75rem;
    }
  }

  .bottom{
    height: 45px;
    border-bottom: 1px solid black;

    display: flex; 
    align-items: center;  
    justify-content: space-between;
    padding: 0 50px;

    .left{
      width: 120px;
      height: 30px;

      display: flex;  
      align-items: center;
      cursor: pointer;

      text-transform: uppercase;
      font-size: 1.1rem;
      font-weight: 600; 
      letter-spacing: 1.5px;

      img{
        height: 26px;
        scale: 1.75;
        margin-right: 12px;
      }
    }

    .right{
      display: flex; 
      align-items: center; 
      gap: 25px;

      a{
        text-decoration: none; 
        color: black;
        font-size: 0.85rem;
        font-weight: 500;
        cursor: pointer;
      }

      .type2{
        padding: 5px 15px;  
        border-radius: 100px;
        cursor: pointer;

        background-color: black;
        color: yellow;

        display: flex; 
        align-items: center; 
        gap: 5px;
      }

      svg{
        font-size: 1.25rem;  
        fill: yellow;
      }

      img{
        height: 25px;
        margin-top: 6px;
      }
    }
  }
`

const Page1 = styled.div`
  position: relative;
  width: 100vw;
  height: calc(100vh - 85px);
  background-color: #fff; 

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  img{
    height: 100px;
    margin-top: -60px;
  }

  .hero-title {
    font-size: clamp(2.8rem, 4vw, 3.8rem);
    line-height: 1.15;
    letter-spacing: 3.5px;
    text-align: center;
    
    max-width: 900px;
    margin: 0 auto;
    text-transform: uppercase;
    font-weight: 700;
    margin: 1rem 0;
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
    
    u{
      color: #333;
      font-weight: 400;
    }
  }

  .apply-btn{
    margin-top: 30px;
    padding: 12px 25px;
    background-color: black;    
    color: yellow;
    border-radius: 100px;
    cursor: pointer;
    font-size: 1.1rem;
    font-weight: 600;

    text-decoration: none;

    display: flex;
    align-items: center;
    gap: 8px;
  }

  svg{
    font-size: 1.5rem;  
    fill: yellow;
  }

  .dancing-scroll-action {
    position: absolute;
    bottom: 40px;
    left: 50%;
    transform: translateX(-50%);
    cursor: pointer;

    animation: scrollBounce 1.8s ease-in-out infinite;
  }

  @keyframes scrollBounce {
    0% {
      transform: translate(-50%, 0);
      opacity: 0.6;
    }
    40% {
      transform: translate(-50%, 8px);
      opacity: 1;
    }
    80% {
      transform: translate(-50%, 0);
      opacity: 0.6;
    }
    100% {
      transform: translate(-50%, 0);
      opacity: 0.8;
    }
  }

  /* Optional: icon styling */
  .dancing-scroll-action svg {
    font-size: 4rem;
    fill: #888;
  }
`

const Page = styled.div`
  height: 100vh;
  width: 100vw;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;   

  padding: 80px 80px;

  h1{
    font-size: 2.5rem;
    font-weight: 500;
    text-align: center;
    margin-bottom: 10px; 

    /* background-color: #f0f0f0; */
    
    display: flex;
    align-items: center;
    gap: 12px;

    img{
      height: 60px;
    }
  }

  h2{
    font-size: 1.5rem;
    font-weight: 300;
    text-align: center;
    margin-bottom: 16px;

  }
`

const PageGap = styled.div`
  height: 120px;
  border: 1px solid black;

  display: flex; 
  align-items: center;  
  justify-content: center;
  padding: 0 20px;

  background-color: #aeffdf;

  font-size: 0.85rem;
  font-weight: 300;
  
  span{
    margin-right: 5px;
    font-weight: 500;
  }

  .btn{
    margin-left: 5px;
    padding: 5px 10px;
    background-color: black;
    color: white;
    border-radius: 100px;
    cursor: pointer;
    font-size: 0.75rem;
  }
`