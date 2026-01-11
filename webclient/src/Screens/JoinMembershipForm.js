import React from 'react';
import { useState, useEffect } from "react";
import styled from 'styled-components';
import OfflineBoltIcon from '@material-ui/icons/OfflineBolt';
import logo from '../utils/logo.png';
import logoBig from '../utils/logo-big.png';
import social1 from '../utils/social1.png';
import social2 from '../utils/social2.png';
import membershipGoldCoin from '../utils/membership-gold-coin.gif';

import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import CancelIcon from '@material-ui/icons/Cancel';
import InfoIcon from '@material-ui/icons/Info';

const JoinMembershipForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isExperienced, setIsExperienced] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  const isValidEmail = (value) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const STEPS = [
    { id: 1, label: "Overview" },
    { id: 2, label: "Application" },
    { id: 3, label: "Payment" },
    // { id: 4, label: "Approval" },
  ];

  useEffect(() => {
    window.scrollTo({
      top: 0,
      // behavior: "smooth", // optional
    });
  }, [currentStep]);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    socialProfile: "",
    collegeName: "",
    fieldOfStudy: "",
    passoutYear: "",
    currentCompany: "",
    yearsOfExperience: "",
    triedAlternatives: "",
    reason: "",
  });

  const isValidUrl = (value) => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  };

  const handleChange = (key) => (e) => {
    setFormData({ ...formData, [key]: e.target.value });
  };

  const handleNextPage2 = () => {
    setSubmitted(true);

    const requiredFields = [
      formData.fullName,
      formData.email,
      formData.socialProfile,
      formData.triedAlternatives,
      formData.reason,
      isExperienced
        ? formData.currentCompany && formData.yearsOfExperience
        : formData.collegeName && formData.passoutYear,
    ];

    const allValid = requiredFields.every(Boolean);

    console.log('====================================');
    console.log(formData);
    console.log('====================================');

    if (allValid) {
      setCurrentStep(3);
    }
  };

  const renderStatus = (value, required = true, validator = null) => {
    const hasValue = value && (value.trim().length > 0);
    const isValid = validator ? validator(value) : hasValue;

    // LIVE SUCCESS (while typing)
    if (hasValue && isValid) {
      return <CheckCircleIcon style={{ fill: "#eebf2f" }} />;
    }

    // SHOW ERRORS ONLY AFTER CTA
    if (submitted) {
      if (required && !hasValue) {
        return (
          <>
            <InfoIcon />
            <span>Is required</span>
          </>
        );
      }

      if (hasValue && validator && !validator(value)) {
        return (
          <>
            <InfoIcon />
            <span>Invalid format</span>
          </>
        );
      }
    }

    return null;
  };


  return (
    <Container>
      <Navbar>
        {/* <div className="top">
          <span>Already a member?</span> Stay ahead with the HiringBull app on Google Play Store <div className="download-btn">Download Now ↗</div>
        </div> */}
        <div className="bottom">
          <div className="middle">
            <OfflineBoltIcon />
            Join HiringBull Membership
            <img className='logobig' src={logo} alt="" />
          </div>
        </div>
        <div className="info">
          <InfoIcon />
          <div className="text">To protect quality, memberships are reviewed manually and approved within 24–48 hours.
            If your application isn’t approved, your payment is refunded automatically — no questions asked.</div>
        </div>
      </Navbar>
      <Content>
        {
          currentStep < 4 ? (
            <Pagination>
              {STEPS.map((step, index) => {
                const isDone = step.id < currentStep;
                const isActive = step.id === currentStep;

                return (
                  <>
                    <div
                      className={`circle ${isDone ? "done" : ""} ${isActive ? "active" : ""
                        }`}
                      onClick={() => {
                        if (step.id < currentStep) {
                          setCurrentStep(step.id);
                        }
                      }}
                    >
                      {step.id} <span>{step.label}</span>
                    </div>

                    {index < STEPS.length - 1 && (
                      <div
                        className={`line ${step.id < currentStep ? "done" : ""
                          }`}
                      />
                    )}
                  </>
                );
              })}
            </Pagination>
          ) : (
            <OneContentAfterPayment>
              <div className="images">
                {/* <img src="https://png.pngtree.com/png-vector/20230105/ourmid/pngtree-d-green-check-mark-icon-in-round-isolated-transparent-background-tick-png-image_6552327.png" alt="" /> */}
                {/* <img className='logobig' src={logoBig} alt="" /> */}
                <img src={membershipGoldCoin} alt="" />
              </div>
              <h1>
                Yay! We’ve received your application 🎉
                {/* <img src={logo} alt="" /> */}
              </h1>

              <h2>
                Our team will review your membership request within <b>24–48 hours</b>
              </h2>

              <h2>
                <b>You’ll receive an email</b> once your application is approved.
                If it isn’t approved, your payment will be automatically refunded within 7 working days — no questions asked.
              </h2>


              {/* <img src={logoBig} alt="" /> */}
              <div className="contact">
                For any issues - <span>team@hirinbull.in</span>
              </div>
            </OneContentAfterPayment>
          )
        }

        {
          currentStep == 1 ? (
            <OneContent>
              <h1>
                Apply Early. Compete Less. Get Real Visibility.
                <img src={logo} alt="" />
              </h1>

              {/* <img className='membership-img' src={membershipGoldCoin} alt="" /> */}

              <h2>HiringBull is a curated membership for serious job seekers who want early access to verified openings on official company career pages and real visibility with company employees. Instead of competing with thousands on public job portals, members apply when openings are still fresh and lightly contested.</h2>

              <h2>We continuously monitor official career pages and trusted social signals to detect job postings the moment they go live. This allows you to apply within minutes, not days later when roles are already saturated with applications. Every alert is intentional, relevant, and sourced directly from the company.</h2>

              <h2>Beyond early access, HiringBull enables limited, high-signal outreach to verified employees and recruiters through curated communities. Outreach is capped to prevent spam and ensure that messages remain meaningful, relevant, and respectful of the people reviewing them.</h2>

              <h2>To maintain quality and fairness, every membership is manually reviewed and approved within 24–48 hours. If an application is not approved, the payment is automatically refunded, ensuring a risk-free and transparent experience for every applicant.</h2>
              <a href='/' className="link">Explore all features in detail ↗</a>
              <div className="next-btn" onClick={() => setCurrentStep(2)}>Continue to Your Details →</div>
            </OneContent>
          ) : (
            currentStep == 2 ? (
              <OneContent>
                <h1>
                  Tell Us about Yourself
                  <img src={logo} alt="" />
                </h1>

                <h2>
                  This information helps us review your application and ensure the membership
                  reaches people from diverse backgrounds who genuinely benefit from the
                  platform. Your information is private, securely handled, and never shared
                  without your consent.
                </h2>

                {/* Full Name */}
                <div className="input">
                  <div className="left">
                    <div className="label">Full Name</div>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={handleChange("fullName")}
                    />
                  </div>
                  <div className="status">
                    {renderStatus(formData.fullName)}
                  </div>
                </div>

                {/* Email */}
                <div className="input">
                  <div className="left">
                    <div className="label">Email</div>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={handleChange("email")}
                    />
                  </div>
                  <div className="status">
                    {renderStatus(formData.email, true, isValidEmail)}
                  </div>
                </div>


                {/* Social Profile */}
                <div className="input">
                  <div className="left">
                    <div className="label">
                      Social Profile <span>(Portfolio / GitHub / LinkedIn)</span>
                    </div>
                    <input
                      type="url"
                      placeholder="https://"
                      value={formData.socialProfile}
                      onChange={handleChange("socialProfile")}
                    />
                  </div>
                  <div className="status">
                    {renderStatus(formData.socialProfile, true, isValidUrl)}
                  </div>
                </div>

                {/* Experience Toggle */}
                <div className="checkbox-input">
                  <div className="left">
                    <label>
                      <input
                        type="checkbox"
                        checked={isExperienced}
                        onChange={() => setIsExperienced(!isExperienced)}
                      />{" "}
                      I am an experienced professional
                    </label>
                  </div>
                </div>

                {/* Experienced Professional Fields */}
                {isExperienced && (
                  <>
                    <div className="input">
                      <div className="left">
                        <div className="label">Current Company</div>
                        <input
                          type="text"
                          value={formData.currentCompany}
                          onChange={handleChange("currentCompany")}
                        />
                      </div>
                      <div className="status">
                        {renderStatus(formData.currentCompany)}
                      </div>
                    </div>

                    <div className="input">
                      <div className="left">
                        <div className="label">Years of Experience</div>
                        <input
                          type="number"
                          value={formData.yearsOfExperience}
                          onChange={handleChange("yearsOfExperience")}
                        />
                      </div>
                      <div className="status">
                        {renderStatus(formData.yearsOfExperience)}
                      </div>
                    </div>
                  </>
                )}

                {/* Student / Fresher Fields */}
                {!isExperienced && (
                  <>
                    <div className="input">
                      <div className="left">
                        <div className="label">College Name</div>
                        <input
                          type="text"
                          value={formData.collegeName}
                          onChange={handleChange("collegeName")}
                        />
                      </div>
                      <div className="status">
                        {renderStatus(formData.collegeName)}
                      </div>
                    </div>

                    <div className="input">
                      <div className="left">
                        <div className="label">
                          Field of Study <span>(Optional)</span>
                        </div>
                        <input
                          type="text"
                          value={formData.fieldOfStudy}
                          onChange={handleChange("fieldOfStudy")}
                        />
                      </div>
                      <div className="status">
                        {renderStatus(formData.fieldOfStudy, false)}
                      </div>
                    </div>

                    <div className="input">
                      <div className="left">
                        <div className="label">Expected Year of Passout</div>
                        <input
                          type="number"
                          value={formData.passoutYear}
                          onChange={handleChange("passoutYear")}
                        />
                      </div>
                      <div className="status">
                        {renderStatus(formData.passoutYear)}
                      </div>
                    </div>
                  </>
                )}

                {/* Tried Alternatives */}
                <div className="input">
                  <div className="left">
                    <div className="label">
                      Have you tried free alternatives like LinkedIn, job portals, or WhatsApp
                      groups? <span>(Yes / No)</span>
                    </div>
                    <input
                      type="text"
                      value={formData.triedAlternatives}
                      onChange={handleChange("triedAlternatives")}
                    />
                  </div>
                  <div className="status">
                    {renderStatus(formData.triedAlternatives)}
                  </div>
                </div>

                {/* Reason */}
                <div className="input">
                  <div className="left">
                    <div className="label">Why do you need HiringBull?</div>
                    <textarea
                      placeholder="e.g. I apply late and miss openings, want early alerts, limited competition, or better visibility with employees."
                      value={formData.reason}
                      onChange={handleChange("reason")}
                    />
                  </div>

                  <div className="status">
                    {formData.reason.length >= 80 ? (
                      <CheckCircleIcon style={{ fill: "#eebf2f" }} />
                    ) : submitted ? (
                      <>
                        <InfoIcon />
                        <span>Minimum 80 characters</span>
                      </>
                    ) : null}
                  </div>
                </div>


                <div className="next-btn" onClick={handleNextPage2}>
                  Continue to Payment →
                </div>
              </OneContent>
            ) : (
              currentStep == 3 ? (
                <OneContent>
                  <h1>
                    Costs Less Than a Missed Opportunity
                    <img src={logo} alt="" />
                  </h1>

                  <h2>
                    One late application can cost you an interview. HiringBull gives you early access to verified openings with instant job notifications — so you apply before the rush, not after.
                  </h2>

                  <div className="referral">
                    <div className="title">Have a friend on HiringBull? Enter their membership registered email to get 25% off your plan</div>
                    <div className="input">
                      <input type="text" placeholder='Friend’s registered email' />
                      <button>Apply</button>
                    </div>
                  </div>

                  <div className="container600">
                    <div className="square-pricing">
                      <div className="title">Starter Plan - <i>1 Month</i></div>
                      <div className="desc">Best for trying HiringBull</div>
                      <div className="line"></div>
                      <div className="price">
                        <div className="current-amount">
                          <span>₹199</span> / month
                        </div>
                        <div className="total-amount">
                          ( 1 Month Access )
                        </div>
                      </div>
                      <div className="advantage-points">
                        <div className="point"><CheckCircleIcon /> Early alerts from verified career pages you select</div>
                        <div className="point"><CheckCircleIcon /> Curated hiring signals from social posts</div>
                        <div className="point"><CheckCircleIcon /> Up to 3 outreach requests per month</div>
                      </div>
                      <a href="/join-membership" className='apply-btn'>Get Starter</a>
                    </div>
                    <div className="square-pricing recommended">
                      <div className="tag">Most Popular</div>
                      <div className="title">Growth Plan - <i>3 Months</i></div>
                      <div className="desc">Best for active job seekers</div>
                      <div className="line"></div>
                      <div className="price">
                        <div className="current-amount">
                          <span>₹149</span> / month
                        </div>
                        <div className="total-amount">
                          ( 3 Month Access - <span>₹447</span> Total )
                        </div>
                      </div>
                      <div className="advantage-points">
                        <div className="point"><CheckCircleIcon /> All Starter features included</div>
                        <div className="point"><CheckCircleIcon /> <p>100% money-back guarantee if placed <u>Terms apply</u></p></div>
                        <div className="point"><CheckCircleIcon /> Priority support</div>
                      </div>
                      <a href="/join-membership" className='apply-btn'>Get Growth</a>
                    </div>
                    <div className="square-pricing">
                      <div className="title">Pro Plan - <i>6 Months</i></div>
                      <div className="desc">Maximum Advantage 🔥</div>
                      <div className="line"></div>
                      <div className="price">
                        <div className="current-amount">
                          <span>₹119</span> / month
                        </div>
                        <div className="total-amount">
                          ( 6 Month Access - <span>₹714</span> Total )
                        </div>
                      </div>
                      <div className="advantage-points">
                        <div className="point"><CheckCircleIcon /> All Growth features included</div>
                        <div className="point"><CheckCircleIcon /> Free mock interviews with FAANG employees</div>
                        <div className="point"><CheckCircleIcon /> Outreach feature priority</div>
                      </div>
                      <a href="/join-membership" className='apply-btn'>Get Pro</a>
                    </div>
                  </div>
                </OneContent>
              ) : (
                null
              )
            )
          )
        }
      </Content>
    </Container>
  )
}

export default JoinMembershipForm

const Container = styled.div`
  width: 100vw; 
`;

const Navbar = styled.div`
  position: fixed;
  z-index: 10;
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
    background-color: black;

    display: flex; 
    align-items: center;  
    justify-content: center;
    padding: 0 50px;


    .middle{
      height: 30px;

      display: flex;  
      align-items: center;
      cursor: pointer;

      text-transform: uppercase;
      font-size: 1.1rem;
      font-weight: 600; 
      letter-spacing: 1.5px;
      color: yellow;

      img{
        height: 26px;
        scale: 1.75;
        margin: 0 20px;
      }

      svg{
        font-size: 1.5rem;
        margin: 0 10px;
        fill: yellow;
      }
    }
  }

  .info{
    display: flex;
    align-items: center;
    padding: 10px;
    background-color: white;
    /* background-color: #ffc60040; */
    /* border: 1px solid #ffc60070; */
    border-radius: 10px;
    
    svg{
      font-size: 1.5rem;
      margin-right: 10px;
      fill: #efc030;
    }
    
    .text{
      font-size: 0.85rem;
      font-weight: 300;
    }
  }

  /* ========================= */
    /* 📱 MOBILE (≤500px) */
    /* ========================= */
    @media (max-width: 500px) {
      padding: 0;

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
        background-color: black;

        display: flex; 
        align-items: center;  
        justify-content: center;
        padding: 0;


        .middle{
          height: 30px;
          font-size: 0.85rem;

          img{
            height: 20px;
            scale: 1.75;
            margin: 0 20px;
          }

          svg{
            font-size: 1.5rem;
            margin: 0 10px;
            fill: yellow;
          }
        }
      }

      .info{
        display: flex;
        align-items: center;
        padding: 10px;
        background-color: white;
        /* background-color: #ffc60040; */
        /* border: 1px solid #ffc60070; */
        border-radius: 10px;
        
        svg{
          font-size: 1.25rem;
          margin-right: 10px;
          fill: #efc030;
        }
        
        .text{
          font-size: 0.75rem;
          font-weight: 300;
        }
      }

    }
`;


const Content = styled.div`
  width: 100%;
  max-width: 800px;
  margin: auto;
  
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  
  padding: 80px 0;
  padding-top: 140px;
  
  @media (max-width: 500px) {
    padding-top: 180px;
    align-items: center;
  }
`

const Pagination = styled.div`
  /* border: 1px solid black; */
  display: flex;
  align-items: center;
  justify-content: center;

  margin-left: -15px;
  
  /* border-bottom: 1px solid #ccc; */
  padding-bottom: 27px; 

  scale: 0.9;

  .circle{
    position: relative;
    cursor: pointer;
    display: grid;
    place-items: center;

    font-size: 1rem;
    font-weight: 300;

    height: 45px;
    aspect-ratio: 1/1;

    border-radius: 50%;

    /* border: 1px solid black;  */
    background-color: #ece6e6;

    font-family: 'Inter', system-ui, sans-serif;
    font-feature-settings: "tnum";
    font-variant-numeric: tabular-nums;

    span{
      width: 80px;
      position: absolute;
      bottom: -30px;

      font-size: 0.85rem;
      padding-bottom: 2px;
      /* border: 1px solid black; */
      /* border-bottom: 4px solid green; */

      text-align: center;
    }
  }

  .line{
    width: 100px;
    height: 1px;
    background-color: #ccc;
  }

  .active{
    background-color: #ffc600;
    font-weight: 500;
    border: 1px solid black;

    span{
      border-bottom: 4px solid #ffc600;
    }
  }

  .done{
    background-color: #ffc600;
  }

  @media (max-width: 500px) {
    margin-left: 0;
  }  
`

const OneContent = styled.div`
  min-height: 600px;
  width: 100%;
  
  margin-top: 30px;

  display: flex;
  flex-direction: column;
  align-items: flex-start;
  /* justify-content: center; */

  h1{
    font-size: 2rem;
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
    font-size: 1rem;
    font-weight: 300;
    margin-bottom: 16px;

    text-align: left;

    b{
      font-weight: 500;
      background-color: #ffc60042;
      padding: 0 10px;
    }
  }

  .membership-img{
    float: left;
    height: 100px;
    margin: 20px 0; 
  }

  .logobig{
    height: 60px;
    margin: 20px 0;
  }

  .link{
    width: 100%;
    font-size: 1rem;
    font-weight: 300;
    margin-top: 10px;
    text-align: left;
    color: #333;
  }

  .input{
    display: flex;
    align-items: flex-start;
    width: 100%;
    margin-top: 20px;

    .left{
      flex: 1;
      display: flex;
      flex-direction: column;

      .label{
        font-size: 0.85rem;
        margin-bottom: 5px;
        text-transform: uppercase;
        letter-spacing: 0.1rem;
        font-weight: 600;
        
        span{
          text-transform: none;
          font-weight: 300;
          letter-spacing: 0rem;
          font-style: italic;
        }
      }

      input{
        background-color: #fff;
        border: 1px solid grey;
        width: 100%;
        padding: 7.5px 10px;
        font-size: 0.85rem;
        font-weight: 300;
        letter-spacing: 0.1rem;
      }

      textarea{
        background-color: #fff;
        border: 1px solid grey;
        width: 100%;
        padding: 7.5px 10px;
        font-size: 0.85rem;
        font-weight: 300;
        letter-spacing: 0.05rem;
        height: 160px;
      }
    }

    .status{
      position: relative;
      margin-left: 50px;
      width: 1.75rem;
      /* border: 1px solid black; */
      height: 100%;
      margin-top: 30px;
      
      svg{
        font-size: 1.5rem;
        
      }
      
      span{
        position: absolute;
        font-size: 0.75rem;
        font-weight: 300;
        font-style: italic;
        left: 30px;
        top: 3px;
        width: 160px;
      }
      
    } 
    
  }

  .checkbox-input{
    display: flex;
    align-items: center;

    margin-top: 40px;

    font-size: 0.85rem;
    margin-bottom: 5px;
    text-transform: uppercase;
    letter-spacing: 0.1rem;
    font-weight: 600;

    input{
      margin-right: 5px;
      scale: 1.25;
    }
  }

  .container600{
    width: 100%;

    margin: 40px 0;

    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-auto-rows: 460px;
    gap: 24px;

    box-sizing: border-box;

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
        color: #ffff00c4;
        border-radius: 100px;
        cursor: pointer;
        font-size: 0.9rem;
        font-weight: 600;

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
          transition-duration: 250ms;
          color: yellow;
          scale: 1.05;

          svg{
            fill: yellow;
          }
        }
      }

      &:hover{
        border: 1px solid #ffb300;
        background-color: #ffb30003;
      }

    }

    .recommended{

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
      }
    }

    /* ---------------- SHRINK ---------------- */
    @media (max-width: 1120px) {
      width: calc(100vw - 40px);
      grid-template-columns: 1fr;

      .square, .square-2 {
        height: auto;
      }

      .square-2 {
        grid-column: span 1;
      }
    }

    @media (max-width: 500px) {
      width: 100%;
    }
  }

  .referral{
    /* display: flex; */
    /* flex-direction: column; */
    /* align-items: center; */
    margin-bottom: 30px;
    width: 100%;
    .title{
      font-size: 1rem;
      font-weight: 300;
      margin-bottom: 16px;

      text-align: left;
    }

    .input{
      width: 80%;
      display: flex;
      align-items: center;
      
      input{
        background-color: #fff;
        box-shadow: 0 0 8px rgba(0, 0, 0, 0.1);
        border: 1px solid #000;
        width: 100%;
        padding: 7.5px 10px;
        font-size: 0.85rem;
        font-weight: 300;
        letter-spacing: 0.1rem;
        margin-right: 10px;
        border-radius: 10px;
      }

      button{
          cursor: pointer;
          background-color: black;
          border: none;
          color: white;
          padding: 9.5px 20px;
          font-size: 0.85rem;
          font-weight: 500;
          letter-spacing: 0.1rem;
          border-radius: 100px;
      }
    }
  }

  .next-btn{
    padding: 10px 30px;
    border-radius: 100px;
    background-color: black;
    color: white;
    font-size: 0.85rem;
    margin-top: 50px;
    cursor: pointer;
  }

  @media (max-width: 500px) {
    padding: 0 30px;
    h1{
      font-size: 1.5rem;
      text-align: left;

      img{
        display: none;
      }
    }

    h2{
      font-size: 0.9rem;
    }

    .input{
      .text{
        width: 100%;
      }
    }

    .input{
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      width: 100%;
      margin-top: 20px;

      .left{
        width: 100%;
        flex: 1;
        display: flex;
        flex-direction: column;

        .label{
          font-size: 0.85rem;
          margin-bottom: 5px;
          text-transform: uppercase;
          letter-spacing: 0.1rem;
          font-weight: 600;
          
          span{
            text-transform: none;
            font-weight: 300;
            letter-spacing: 0rem;
            font-style: italic;
          }
        }

        input{
          background-color: #fff;
          border: 1px solid grey;
          width: 100%;
          padding: 7.5px 10px;
          font-size: 0.85rem;
          font-weight: 300;
          letter-spacing: 0.1rem;
        }

        textarea{
          background-color: #fff;
          border: 1px solid grey;
          width: 100%;
          padding: 7.5px 10px;
          font-size: 0.85rem;
          font-weight: 300;
          letter-spacing: 0.05rem;
          height: 160px;
        }
      }

      .status{
        display: flex;
        justify-content: flex-start;
        width: auto;
        margin-top: 5px;
        width: 100%;
        margin-left: 0;
        
        svg{
          font-size: 1.25rem;
          margin-top: 2px;
          margin-right: 0;
        }
        
        span{
          position: relative;
          width: auto;
          /* border: 1px solid black; */
          margin-left: -20px;
        }
        
      } 
      
    }

    .referral{
      /* display: flex; */
      /* flex-direction: column; */
      /* align-items: center; */
      margin-bottom: 30px;
      width: 100%;

      .input{
        width: 100%;
        display: flex;
        align-items: flex-start;
        flex-direction: column;

        input{
          background-color: #fff;
          box-shadow: 0 0 8px rgba(0, 0, 0, 0.1);
          border: 1px solid #000;
          width: 100%;
          padding: 7.5px 10px;
          font-size: 0.85rem;
          font-weight: 300;
          letter-spacing: 0.1rem;
          margin-right: 10px;
          border-radius: 10px;
          margin-bottom: 10px;
        }

        button{
            cursor: pointer;
            background-color: black;
            border: none;
            color: white;
            padding: 9.5px 20px;
            font-size: 0.85rem;
            font-weight: 500;
            letter-spacing: 0.1rem;
            border-radius: 100px;
        }
      }
    }

    .next-btn{
      width: 100%;
      text-align: center;
    }
  }
`

const OneContentAfterPayment = styled.div`
  /* background-color: #faf9fa; */
  min-height: 600px;
  width: 100%;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  padding-bottom: 100px;

  h1{
    font-size: 2rem;
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
    font-size: 1rem;
    font-weight: 300;
    margin-bottom: 16px;

    text-align: center;

    b{
      font-weight: 500;
      background-color: #ffc60042;
      padding: 0 10px;
    }
  }

  .images{
    display: flex; 
    align-items: center;
    
    img{
      height: 140px;
      margin: 20px 0;
    }
  }

  img{
    height: 60px;
    margin: 20px 0;
  }

  .contact{
    font-size: 0.85rem;
    padding: 5px 10px;
    border-radius: 5px;
    margin-top: 20px;
    background-color: #fff0ca57;
    border: 1px solid #f1dca8;

    span{
      font-weight: 500;
    }
  }

  .next-btn{
    padding: 10px 30px;
    border-radius: 100px;
    background-color: black;
    color: white;
    font-size: 0.85rem;
    margin-top: 50px;
    cursor: pointer;
  }
`

