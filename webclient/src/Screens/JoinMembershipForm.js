import React from 'react';
import { useState, useEffect } from "react";
import styled from 'styled-components';
import OfflineBoltIcon from '@material-ui/icons/OfflineBolt';
import logo from '../utils/logo.png';
import logoBig from '../utils/logo-big.png';
import social1 from '../utils/social1.png';
import social2 from '../utils/social2.png';
import membershipGoldCoin from '../utils/membership-gold-coin.gif';
import { Radio, RadioGroup, FormControlLabel, FormControl, Switch, FormControlLabel as MuiFormControlLabel, ToggleButton, ToggleButtonGroup } from '@mui/material';

import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import CancelIcon from '@material-ui/icons/Cancel';
import InfoIcon from '@material-ui/icons/Info';
import { CircularProgress } from '@material-ui/core';
import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline';

const JoinMembershipForm = () => {
  const [errors, setErrors] = useState({});
  const [currentStep, setCurrentStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [referralStatus, setReferralStatus] = useState(null);
  const [mainError, setMainError] = useState(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

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


  // Form related states
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    socialProfile: "",
    reasonOption: "",
    reasonText: "",
    referralEmail: "",
    acknowledged: false,
    isDiscountApplied: false
  });

  const isValidUrl = (value) => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  };

  const validateField = (name, value) => {
    const newErrors = { ...errors };

    switch (name) {
      case 'email':
        if (!isValidEmail(value)) {
          newErrors.email = 'Please enter a valid email address';
        } else {
          delete newErrors.email;
        }
        break;
      case 'socialProfile':
        if (!isValidUrl(value)) {
          newErrors.socialProfile = 'Please enter a valid URL';
        } else {
          delete newErrors.socialProfile;
        }
        break;
      case 'reason':
        if (value.length < 5) {
          newErrors.reason = 'Please provide at least 5 characters';
        } else {
          delete newErrors.reason;
        }
        break;
      default:
        if (value.trim().length === 0) {
          newErrors[name] = 'This field is required';
        } else {
          delete newErrors[name];
        }
    }

    setErrors(newErrors);
  };

  const handleChange = (key) => (e) => {
    const value = e.target.value;
    setFormData({ ...formData, [key]: value });

    // Real-time validation
    if (submitted) {
      validateField(key, value);
    }
  };

  const handleNextPage2 = async () => {
    setSubmitted(true);
    setIsSubmitting(true);
    setMainError(null);

    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Required";
    }

    if (!isValidEmail(formData.email)) {
      newErrors.email = "Enter a valid email";
    }

    // socialProfile is now optional
    if (
      formData.socialProfile &&
      !isValidUrl(formData.socialProfile)
    ) {
      newErrors.socialProfile = "Valid link required";
    }

    if (!formData.reasonOption) {
      newErrors.reasonOption = "Please select one";
    }

    if (
      formData.reasonOption === "other" &&
      formData.reasonText.trim().length == 0
    ) {
      newErrors.reasonText = "Please write a reason (or select a different option)";
    }

    if (!formData.acknowledged) {
      newErrors.acknowledged = "Please confirm";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      setIsSubmitting(false);
      return;
    }

    await submitApplication();
    setCurrentStep(3);
    setIsSubmitting(false);
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

  const isValidEmail = (value) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);


  const handleReferralClick = async () => {
    setReferralStatus("checking");
    if (!formData.referralEmail || !isValidEmail(formData.referralEmail)) {
      setReferralStatus("invalid");
      return;
    }

    try {
      const res = await fetch(
        `https://api.hiringbull.org/api/public/referral/${formData.referralEmail}`
      );
      const data = await res.json();

      if (data.valid) {
        setReferralStatus("valid");
        setFormData(prev => ({
          ...prev,
          isDiscountApplied: true
        }));
      } else {
        setReferralStatus("invalid");
      }
    } catch (err) {
      console.error(err);
      setReferralStatus("invalid");
    }
  };

  const submitApplication = async () => {
    try {
      const finalReason =
        formData.reasonOption === "other"
          ? formData.reasonText
          : formData.reasonOption;

      const payload = {
        full_name: formData.fullName,
        email: formData.email,
        phone: formData.phone || "",
        social_profile:
          formData.socialProfile || "https://hiringbull.org/profile-not-provided",
        reason: finalReason,
      };

      const res = await fetch("https://api.hiringbull.org/api/membership", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let errorMessage = "Failed to submit application";
        try {
          const data = await res.json();
          errorMessage = data?.message || errorMessage;
        } catch { }
        throw new Error(errorMessage);
      }

      return await res.json();
    } catch (err) {
      console.error("❌ submitApplication error:", err);
      throw err;
    }
  };

  const startPayment = async ({ amount, planType }) => {
    try {
      const res = await fetch(
        "https://api.hiringbull.org/api/payment/create-order",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email,
            amount,
            planType,
            referralCode: formData.isDiscountApplied
              ? formData.referralEmail
              : null,
          }),
        }
      );

      if (!res.ok) {
        alert("Unable to initiate payment");
        return;
      }

      const data = await res.json();

      const options = {
        key: data.key,
        amount: data.amountInPaise,
        currency: "INR",
        order_id: data.orderId,
        name: "HiringBull",
        description: `${planType} Membership`,
        prefill: {
          name: formData.fullName,
          email: formData.email,
          contact: formData.phone || "",
        },
        handler: async (response) => {
          try {
            const verifyRes = await fetch(
              "https://api.hiringbull.org/api/payment/verify",
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(response),
              }
            );

            const verifyData = await verifyRes.json();

            if (!verifyRes.ok || !verifyData.success) {
              alert("Payment verification failed");
              return;
            }

            // ✅ DONE — membership already activated in backend
            setCurrentStep(4);
          } catch (err) {
            console.error(err);
            alert("Payment completed but verification failed");
          }
        },
        theme: { color: "#ffc600" },
      };

      new window.Razorpay(options).open();
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <Container>
      <Navbar>
        <div className="top">
          <span>Already a member?</span> <p>Stay ahead with the HiringBull app on Google Play Store</p> <div className="download-btn">Download <b>HiringBull Membership App</b> Now ↗</div>
        </div>
        {/* <div className="bottom">
          <div className="middle">
            <OfflineBoltIcon />
            Join HiringBull Membership
            <img className='logobig' src={logo} alt="" />
          </div>
        </div> */}
        {/* <div className="info">
          <InfoIcon />
          <div className="text">To protect quality, memberships are reviewed manually and approved within 24–48 hours.
            If your application isn’t approved, your payment is refunded automatically — no questions asked.</div>
        </div> */}
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
                Yay! We’ve activated your Membership 🎉 <br />
                <span>Download HiringBull App!</span>
                {/* <img src={logo} alt="" /> */}
              </h1>

              <h2>
                Our team will review your membership request within 24–48 hours, if it isn’t approved, your payment will be automatically refunded within 7 working days — no questions asked.
              </h2>


              <a href="/"><img src="https://static.vecteezy.com/system/resources/previews/024/170/871/non_2x/badge-google-play-and-app-store-button-download-free-png.png" alt="" /></a>
              <div className="contact">
                For any issues - <span>team@hirinbull.in</span>
              </div>
            </OneContentAfterPayment>
          )
        }

        {
          currentStep == 1 ? (
            <OneContent className="overview-step">
              <h1>
                Apply Early. Compete Less. Get Real Visibility.
                <img src={logo} alt="" />
              </h1>

              {/* <img className='membership-img' src={membershipGoldCoin} alt="" /> */}
              <h2>
                HiringBull is a <b>curated membership</b> for serious job seekers who want <b>early access to verified openings</b> from official company career pages. Instead of competing with thousands on public job portals, members apply when roles are still fresh and lightly contested.
              </h2>

              <h2>
                We continuously monitor company career pages and trusted signals to detect job postings the moment they go live. This lets you <b>apply within minutes</b>, not days later when positions are already saturated with applications.
              </h2>

              <h2>
                Members also get <b>limited, high-signal outreach</b> opportunities to verified employees and recruiters through curated communities, designed to keep communication meaningful and spam-free.
              </h2>

              <h2>
                Your membership is <b>activated immediately after payment</b>, so you can start receiving early job alerts and community access right away.
              </h2>

              <div className="next-btn" onClick={() => setCurrentStep(2)}>Continue to Your Details →</div>
            </OneContent>
          ) : (
            currentStep == 2 ? (
              <OneContent>
                <h1>
                  Tell Us about Yourself
                  <img src={logo} alt="" />
                </h1>

                <h2>This information helps us review your application quickly. Your details are private, securely handled, and never shared. </h2>

                {/* Full Name */}
                <div className="input">
                  <div className="left">
                    <div className="label-row">
                      <div className="label">Full Name</div>
                      <div className="status">{renderStatus(formData.fullName)}</div>
                    </div>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={handleChange("fullName")}
                      placeholder="Enter your full name"
                      aria-required="true"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="input">
                  <div className="left">
                    <div className="label-row">
                      <div className="label">Email</div>
                      <div className="status">
                        {renderStatus(formData.email, true, isValidEmail)}
                      </div>
                    </div>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={handleChange("email")}
                      placeholder="your.email@example.com"
                      aria-required="true"
                    />
                  </div>
                </div>

                {/* Phone (Optional) */}
                <div className="input">
                  <div className="left">
                    <div className="label-row">
                      <div className="label">
                        Phone Number <span>(Optional – to join WhatsApp groups with fellow job seekers)</span>
                      </div>
                      <div className="status">{renderStatus(formData.phone, false)}</div>
                    </div>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange("phone")}
                      placeholder="Phone number"
                    />
                  </div>
                </div>

                {/* Reason */}
                <div className="input">
                  <div className="left">
                    <div className="label-row">
                      <div className="label">
                        What is the main issue you are facing in your job search?
                      </div>
                      <div className="status">
                        {renderStatus(formData.reasonOption, true)}
                      </div>
                    </div>

                    <div className="options">
                      <label>
                        <input
                          type="radio"
                          name="reason"
                          value="want_notifications"
                          checked={formData.reasonOption === "want_notifications"}
                          onChange={handleChange("reasonOption")}
                        />
                        <div className="text">
                          I don’t want to constantly search for jobs, I want to get notified
                        </div>
                      </label>

                      <label>
                        <input
                          type="radio"
                          name="reason"
                          value="late_job_alerts"
                          checked={formData.reasonOption === "late_job_alerts"}
                          onChange={handleChange("reasonOption")}
                        />
                        <div className="text">
                          I usually find openings too late, after hundreds of people have applied
                        </div>
                      </label>

                      <label>
                        <input
                          type="radio"
                          name="reason"
                          value="too_much_competition"
                          checked={formData.reasonOption === "too_much_competition"}
                          onChange={handleChange("reasonOption")}
                        />
                        <div className="text">
                          There’s too much competition on job portals, and my application gets lost
                        </div>
                      </label>


                      <label>
                        <input
                          type="radio"
                          name="reason"
                          value="no_responses"
                          checked={formData.reasonOption === "no_responses"}
                          onChange={handleChange("reasonOption")}
                        />
                        <div className="text">
                          I apply to many roles but rarely receive interview calls or responses
                        </div>
                      </label>

                      <label>
                        <input
                          type="radio"
                          name="reason"
                          value="no_referrals"
                          checked={formData.reasonOption === "no_referrals"}
                          onChange={handleChange("reasonOption")}
                        />
                        <div className="text">
                          I don’t have referrals or connections inside companies
                        </div>
                      </label>

                      <label>
                        <input
                          type="radio"
                          name="reason"
                          value="not_finding_relevant_roles"
                          checked={formData.reasonOption === "not_finding_relevant_roles"}
                          onChange={handleChange("reasonOption")}
                        />
                        <div className="text">
                          I struggle to find roles that actually match my skills and experience
                        </div>
                      </label>

                      <label>
                        <input
                          type="radio"
                          name="reason"
                          value="confused_where_to_apply"
                          checked={formData.reasonOption === "confused_where_to_apply"}
                          onChange={handleChange("reasonOption")}
                        />
                        <div className="text">
                          I’m not sure where to apply or how to track good openings consistently
                        </div>
                      </label>

                      <label>
                        <input
                          type="radio"
                          name="reason"
                          value="confused_where_to_apply"
                          checked={formData.reasonOption === "confused_where_to_apply"}
                          onChange={handleChange("reasonOption")}
                        />
                        <div className="text">
                          None of the above
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Global Error */}
                {submitted && Object.keys(errors).length > 0 && (
                  <div className="form-error-banner">
                    <InfoIcon />
                    <span>
                      {mainError || "Please fix the highlighted fields to continue."}
                    </span>
                  </div>
                )}

                {/* CTA */}
                <div
                  className="next-btn"
                  role="button"
                  tabIndex="0"
                  onClick={handleNextPage2}
                  onKeyDown={(e) => e.key === "Enter" && handleNextPage2()}
                  disabled={!formData.acknowledged || isSubmitting}
                >
                  {isSubmitting ? "Processing..." : "Continue to Payment →"}
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
                    <div className="title">
                      Have a friend on HiringBull? Enter their membership registered email to get 25% off your plan
                    </div>

                    <div className="input">
                      <input
                        type="text"
                        placeholder="Friend's registered email"
                        value={formData.referralEmail}
                        onChange={(e) => {
                          setFormData(prev => ({ ...prev, referralEmail: e.target.value }));
                          setReferralStatus(null); // reset on change
                        }}
                      />

                      {
                        referralStatus === "checking" ? (
                          <CircularProgress size={18} />
                        ) : referralStatus === "valid" ? (
                          <CheckCircleOutlineIcon />
                        ) : (
                          <button onClick={handleReferralClick}>Apply</button>
                        )
                      }
                    </div>

                    {/* STATUS MESSAGE */}
                    {referralStatus === "valid" && (
                      <div style={{ color: "#16a34a", marginTop: "6px", fontSize: "0.85rem" }}>
                        ✅ Referral applied successfully
                      </div>
                    )}

                    {referralStatus === "invalid" && (
                      <div style={{ color: "#dc2626", marginTop: "6px", fontSize: "0.85rem" }}>
                        ❌ Referral email not found
                      </div>
                    )}
                  </div>

                  <div className="container600">
                    {/* --- STARTER PLAN --- */}
                    <div className="square-pricing">
                      <div className="title">Starter Plan - <i>1 Month</i></div>
                      <div className="desc">Best for trying HiringBull</div>
                      <div className="line"></div>
                      <div className="price">
                        <div className="current-amount">
                          {formData.isDiscountApplied ? (
                            <>
                              <span style={{ textDecoration: 'line-through', color: '#999', fontSize: '0.8em', marginRight: '5px' }}>₹249</span>
                              <span>₹187</span>
                            </>
                          ) : (
                            <span>₹249</span>
                          )}
                          / month
                        </div>

                        {/* <div className="total-amount">
                          ( 1 Month Access )
                        </div> */}

                        {/* Savings Badge */}
                        {formData.isDiscountApplied && (
                          <div className='discount-value'>
                            You saved a total of ₹62
                          </div>
                        )}
                      </div>
                      <div className="advantage-points">
                        <div className="point"><CheckCircleIcon /> Early alerts from verified career pages you select</div>
                        <div className="point"><CheckCircleIcon /> Curated hiring signals from social posts</div>
                        <div className="point"><CheckCircleIcon /> Up to 3 outreach requests per month</div>
                      </div>
                      <button
                        className="apply-btn"
                        onClick={() =>
                          startPayment({
                            amount: formData.isDiscountApplied ? 2 : 1,
                            planType: "STARTER",
                          })
                        }
                      >
                        Pay {formData.isDiscountApplied ? "₹187" : "₹249"} <OfflineBoltIcon />
                      </button>
                    </div>

                    {/* --- GROWTH PLAN (Most Popular) --- */}
                    <div className="square-pricing recommended">
                      <div className="tag">Most Popular</div>
                      <div className="title">Growth Plan - <i>3 Months</i></div>
                      <div className="desc">Best for active job seekers</div>
                      <div className="line"></div>
                      <div className="price">
                        <div className="current-amount">
                          {formData.isDiscountApplied ? (
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
                        {/* <div className="total-amount">
                          ( 3 Month Access -
                          {formData.isDiscountApplied ? (
                            <>
                              <span style={{ textDecoration: 'line-through', color: '#888', margin: '0 5px' }}>₹599</span>
                              <span>₹449</span>
                            </>
                          ) : (
                            <span>₹599</span>
                          )}
                          Total )
                        </div> */}
                        {/* Savings Badge */}
                        {formData.isDiscountApplied && (
                          <div className='discount-value'>
                            You saved a total of ₹150
                          </div>
                        )}
                      </div>
                      <div className="advantage-points">
                        <div className="point">
                          <CheckCircleIcon /> All Starter features included
                        </div>

                        <div className="point">
                          <CheckCircleIcon /> Priority access to Outreach features
                        </div>

                        <div className="point">
                          <CheckCircleIcon /> Added to a WhatsApp group with peers to discuss job updates, interviews, and opportunities
                        </div>

                      </div>
                      <button
                        className="apply-btn"
                        onClick={() =>
                          startPayment({
                            amount: formData.isDiscountApplied ? 2 : 1,
                            planType: "GROWTH",
                          })
                        }
                      >
                        Pay {formData.isDiscountApplied ? "₹449" : "₹599"} <OfflineBoltIcon />
                      </button>

                    </div>

                    {/* --- PRO PLAN --- */}
                    <div className="square-pricing">
                      <div className="title">Pro Plan - <i>6 Months</i></div>
                      <div className="desc">Maximum Advantage 🔥</div>
                      <div className="line"></div>
                      <div className="price">
                        <div className="current-amount">
                          {formData.isDiscountApplied ? (
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
                        {/* <div className="total-amount">
                          ( 6 Month Access -
                          {formData.isDiscountApplied ? (
                            <>
                              <span style={{ textDecoration: 'line-through', color: '#888', margin: '0 5px' }}>₹999</span>
                              <span>₹749</span>
                            </>
                          ) : (
                            <span>₹999</span>
                          )}
                          Total )
                        </div> */}
                        {/* Savings Badge */}
                        {formData.isDiscountApplied && (
                          <div className='discount-value'>
                            You saved a total of ₹250
                          </div>
                        )}
                      </div>
                      <div className="advantage-points">
                        <div className="point">
                          <CheckCircleIcon /> All Growth features included
                        </div>
                        <div className="point">
                          <CheckCircleIcon />
                          Private access to professionals from 10+ companies if not placed in 6 months
                        </div>
                      </div>
                      <button
                        className="apply-btn"
                        onClick={() =>
                          startPayment({
                            amount: formData.isDiscountApplied ? 2 : 1,
                            planType: "PRO",
                          })
                        }
                      >
                        Pay ₹{formData.isDiscountApplied ? 749 : 999} <OfflineBoltIcon />
                      </button>
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

export default JoinMembershipForm;

const Container = styled.div`
  width: 100vw; 
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


const Content = styled.div`
  width: 100%;
  max-width: 800px;
  margin: auto;
  min-height: calc(100vh - 200px);
  
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  
  padding: 80px 0 20px 0;
  
  @media (max-width: 500px) {
    min-height: calc(100vh - 220px);
    padding: 30px 0 20px 0;
    align-items: center;
  }
`

const Pagination = styled.div`
  /* border: 1px solid black; */
  display: flex;
  align-items: center;

  width: fit-content;
  padding-top: 0px;
  
  /* border-bottom: 1px solid #ccc; */
  padding-bottom: 50px; 

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
    margin: 0 auto;
    scale: 0.8;
    padding-bottom: 25px;
    padding-top: 20px;
  }  
`

const OneContent = styled.div`
  width: 100%;
  flex: 1;
  overflow-y: auto;
  
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;

  /* Fixed height for overview step */
  &.overview-step {
    height: 100%;
    /* justify-content: center; */
    /* align-items: center; */
    text-align: center;
    
    h1, h2 {
      max-width: 800px;
      margin: 0 auto 20px auto;
    }
  }

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
      font-weight: 400;
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
    align-items: center;
    width: 100%;
    margin-bottom: 25px;

    .left{
      flex: 1;
      display: flex;
      flex-direction: column;

      .label-row{
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 15px;

        .label{
          font-size: 0.85rem;
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

        .status{
          min-width: 80px;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          

          svg{
            font-size: 1rem;
            margin-right: 2.5px;
          }
          span{
            font-size: 0.7rem;
            text-align: right;
          }
        } 
      }

      input{
        background-color: #fafafa;
        border: 1px solid #d5d5d5;
        width: 100%;
        padding: 7.5px 12.5px;
        font-size: 0.75rem;
        font-weight: 300;
        letter-spacing: 0.07rem;
        border-radius: 100px;
        
        &:focus {
          outline: none;
          border: 1px solid #939393;
          box-shadow: 0 0 0 6px rgba(255, 255, 255, 0.8);
        }
        
        &:hover {
          border: 1px solid #939393;
        }
        
        &:disabled {
          background-color: #f0f0f0;
          cursor: not-allowed;
        }
      }

      textarea{
        background-color: #fafafa;
        border: 1px solid #d5d5d5;
        width: 100%;
        padding: 7.5px 10px;
        font-size: 0.85rem;
        font-weight: 300;
        letter-spacing: 0.05rem;
        height: 160px;
        transition: all 0.2s ease;
        border-radius: 4px;
        resize: vertical;
        
        &:focus {
          outline: none;
          border-color: #ffc600;
          box-shadow: 0 0 0 2px rgba(255, 198, 0, 0.2);
        }
        
        &:hover {
          border-color: #b0b0b0;
        }
      }

      .options{
        display: flex;
        flex-direction: column;

        label{ 
          cursor: pointer;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: flex-start;

          input{
            width: 30px;
          }

          font-size: 0.85rem;
          font-weight: 300;
        }
      }
    }
  }

  .acknowledgement{
    font-size: 0.9rem;
    font-weight: 500;
    margin-top: 20px;
  }

  .mui-radio-group {
    margin-top: 15px;
    margin-bottom: 10px;
    
    .MuiFormGroup-root {
      gap: 20px;
    }
    
    .MuiFormControlLabel-root {
      margin-right: 0;
      margin-bottom: 5px;
      
      &:hover {
        .MuiFormControlLabel-label {
          color: #ffc600;
        }
      }
    }
  }

  .experience-selection{
    width: 100%;
    margin: 0px 0 20px 0;
    
    .question{
      font-size: 1rem;
      font-weight: 600;
      color: #333;
      margin-bottom: 15px;
      text-align: left;
    }
  }

  .container600{
    width: 100%;
    margin: 40px 0;

    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-auto-rows: 410px;
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

      .discount-value{
        font-size: 0.75rem;
        color: #16a34a;
        font-weight: 500;
        margin-top: 5px;
      }

      .advantage-points{
        margin-top: 10px;
        
        .point{
          display: flex;
          align-items: flex-start;

          font-size: 0.78rem;
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
      width: 500px;
      display: flex;
      /* flex-direction: column; */
      
      input{
        background-color: #fafafa;
        border: 1px solid #d5d5d5;
        width: 100%;
        padding: 7.5px 12.5px;
        font-size: 0.75rem;
        font-weight: 300;
        letter-spacing: 0.07rem;
        border-radius: 100px;
        margin-right: 10px;
        
        &:focus {
          outline: none;
          border: 1px solid #939393;
          box-shadow: 0 0 0 6px rgba(255, 255, 255, 0.8);
        }
        
        &:hover {
          border: 1px solid #939393;
        }
        
        &:disabled {
          background-color: #f0f0f0;
          cursor: not-allowed;
        }
      }

      button{
          cursor: pointer;
          background-color: black;
          border: none;
          color: white;
          padding: 9.5px 20px;
          font-size: 0.75rem;
          font-weight: 300;
          border-radius: 100px;
          transition: all 0.2s ease;
          
          &:hover {
            background-color: #333;
            transform: translateY(-1px);
          }
          
          &:active {
            transform: translateY(0);
          }
      }
    }
  }

  .form-error-banner{
    margin-top: 20px;
    margin-bottom: -30px;
    
    display: flex;
    align-items: center;

    span{
      color: red;
      font-size: 0.85rem;
      font-weight: 500;
    }


    svg{
      fill: red;
      margin-right: 10px;
    }
  }

  .next-btn{
    padding: 12px 30px;
    border-radius: 100px;
    background-color: black;
    color: white;
    font-size: 0.85rem;
    margin-top: 50px;
    cursor: pointer;
    transition: all 0.3s ease;
    border: none;
    font-weight: 600;
    
    &:hover:not(:disabled) {
      background-color: #333;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    
    &:active:not(:disabled) {
      transform: translateY(0);
    }
    
    &:disabled {
      background-color: #ccc;
      cursor: not-allowed;
      opacity: 0.6;
    }
  }

  @media (max-width: 500px) {
    padding: 10px 30px;


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
          width: 100%;
        }
      }
    }

    .referral{
      margin-bottom: 30px;
      width: 100%;
      
      .title{
        font-size: 1rem;
        font-weight: 300;
        margin-bottom: 16px;
        text-align: left;
      }

      .input{
        width: 100%;
        max-width: 500px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        
        input{
          width: 100%;
        }

        button{
            cursor: pointer;
            background-color: black;
            border: none;
            color: white;
            padding: 9.5px 20px;
            font-size: 0.75rem;
            font-weight: 300;
            border-radius: 100px;
            transition: all 0.2s ease;
            
            &:hover {
              background-color: #333;
              transform: translateY(-1px);
            }
            
            &:active {
              transform: translateY(0);
            }
        }
      }
    }

    .next-btn{
      width: 100%;
      text-align: center;
    }

    .options{
      label{
        height: 180px;
        display: flex;
        align-items: center;
        justify-content: flex-start;
        margin-bottom: 10px;

        input{
          width: 40px;
        }
      } 
      
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

  padding: 20px;

  h1{
    font-size: 2rem;
    font-weight: 500;
    text-align: center;
    margin-bottom: 10px; 

    /* background-color: #f0f0f0; */

    span{
      font-weight: 600;
      color: orange;
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

  @media (max-width: 500px) {
    h1{
      font-size: 1.5rem;
    }

    h2{
      font-size: 0.9rem;
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
  }
`

