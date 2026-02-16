import React from 'react';
import { useState } from "react";
import styled from 'styled-components';
import OfflineBoltIcon from '@material-ui/icons/OfflineBolt';
import logo from '../utils/logo.png';
import logoBig from '../utils/logo-big.png';
import social1 from '../utils/social1.png';
import social2 from '../utils/social2.png';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import WorkOutlineIcon from '@material-ui/icons/WorkOutline';

const Landing = () => {
  const rows = [
    {
      aspect: "Competition Level",
      hiringbull: "Limited to 1,000 members → early apply, significantly less competition",
      others: "Extremely high competition",
      groups: "Extremely high competition",
      hbType: "good",
      oType: "bad",
      gType: "bad"
    },
    {
      aspect: "Access Control",
      hiringbull: "Capped membership (only 1,000 users at a time)",
      others: "Open to everyone",
      groups: "Open to everyone",
      hbType: "good",
      oType: "bad",
      gType: "bad"
    },
    {
      aspect: "Job Discovery Speed",
      hiringbull: "Early alerts from company career pages",
      others: "Often delayed",
      groups: "Early alerts",
      hbType: "good",
      oType: "warn",
      gType: "good"
    },
    {
      aspect: "Job Quality",
      hiringbull: "Verified company career-page links only",
      others: "Mixed quality",
      groups: "Unverified, noisy",
      hbType: "good",
      oType: "warn",
      gType: "bad"
    },
    {
      aspect: "Personalization",
      hiringbull: "Based on your segment & company choice",
      others: "Broad, generic",
      groups: "None",
      hbType: "good",
      oType: "warn",
      gType: "bad"
    },
    {
      aspect: "Notifications",
      hiringbull: "Only for relevant jobs you opt into",
      others: "High-noise alerts",
      groups: "High-noise alerts",
      hbType: "good",
      oType: "warn",
      gType: "warn"
    },
    {
      aspect: "DM Visibility (to company employees or HRs)",
      hiringbull: "100% visibility with up to 3 controlled requests/month",
      others: "No visibility guarantee",
      groups: "No access to employees / HRs",
      hbType: "good",
      oType: "bad",
      gType: "bad"
    },
    {
      aspect: "Fake / Expired Jobs",
      hiringbull: "Actively filtered",
      others: "Common",
      groups: "Common",
      hbType: "good",
      oType: "bad",
      gType: "bad"
    },
    {
      aspect: "Social Media Important Posts",
      hiringbull: "Curated hiring posts from LinkedIn, Reddit, Twitter",
      others: "Not centralized",
      groups: "None",
      hbType: "good",
      oType: "bad",
      gType: "bad"
    },
    {
      aspect: "Promotional / Spam Entries",
      hiringbull: "No promotions, ads, or paid postings",
      others: "Sponsored & promoted listings",
      groups: "Heavy promotions & spam",
      hbType: "good",
      oType: "warn",
      gType: "bad"
    },
    {
      aspect: "Target Audience",
      hiringbull: "Built specifically for India",
      others: "Global, not India-focused",
      groups: "Indian groups exist but unstructured",
      hbType: "good",
      oType: "bad",
      gType: "warn"
    }
  ];

  const faqData = [
    {
      question: "What is HiringBull?",
      answer: "HiringBull is a job-search and mentorship platform that delivers early job alerts from verified company career pages and provides curated hiring signals, outreach tools, and mock interviews to help you land your next role."
    },
    {
      question: "How quickly do I receive job alerts?",
      answer: "Job alerts are delivered within approximately 10 minutes of being posted on verified company career pages, giving you a significant head start over other applicants."
    },
    {
      question: "Why is membership capped?",
      answer: "Membership is limited to around 1,000 users per experience level to reduce competition and ensure you're competing with fewer candidates for each opportunity."
    },
    {
      question: "What does the outreach feature include?",
      answer: "The outreach feature allows you to send up to 3 structured requests per month—such as referral requests, resume reviews, or mock interview requests—via curated communities of professionals."
    },
    {
      question: "What are the differences between pricing plans?",
      answer: "Core features are available across all plans, but 3-month and 6-month plans include priority support and are eligible for our 100% money-back guarantee if you get placed during your active membership. Terms applied."
    },
    {
      question: "What is the refund policy?",
      answer: "If you secure a job placement during an active 3-month or 6-month membership, you're eligible for a 100% refund upon submitting official proof such as a selection or offer email."
    },
    {
      question: "Is HiringBull available on iOS?",
      answer: "HiringBull is currently available on Android via the Play Store, and iOS support is coming soon."
    },
    {
      question: "Are the job postings verified?",
      answer: "Yes, all job alerts come from verified company career pages with no paid promotions or ads—only curated and authentic opportunities."
    },
    {
      question: "What are hiring signals?",
      answer: "Hiring signals are curated social media posts from employees and recruiters indicating active hiring, such as 'DM for referral' or 'actively hiring,' helping you discover hidden opportunities."
    },
    {
      question: "What does the Pro plan include?",
      answer: "The Pro plan includes regular mock interviews conducted by employees from FAANG and top MNCs, along with peer comparison features to benchmark your progress."
    },
    {
      question: "How are users grouped on the platform?",
      answer: "Users are grouped by experience level to ensure discussions, opportunities, and networking remain relevant and valuable to your career stage."
    },
    {
      question: "Is HiringBull affiliated with companies like Google or Amazon?",
      answer: "No, HiringBull is an independent platform and is not affiliated with any specific companies."
    },
    {
      question: "How is my data protected?",
      answer: "HiringBull prioritizes data privacy and trust, implementing robust security measures to protect your personal and professional information."
    },
    {
      question: "What kind of support can I expect?",
      answer: "All users receive standard support, while 3-month and 6-month plan members receive priority support for faster assistance with any questions or issues."
    },
    {
      question: "Can I cancel my membership anytime?",
      answer: "Yes, you can cancel your membership at any time, though refunds are only applicable under the terms of our money-back guarantee for active 3-month or 6-month members who secure placement."
    }
  ];

  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const [isDiscountApplied, setIsDiscountApplied] = useState(false);

  const handleReferralClick = () => {
    setIsDiscountApplied(!isDiscountApplied);
  };

  const smoothScrollTo = (elementId) => {
    const element = document.getElementById(elementId);
    if (element) {
      let navbarHeight = 85; // Default height for other sections
      if (elementId === 'features') {
        navbarHeight = 60; // Account for black notification bar and partial white nav
      }
      const elementPosition = element.offsetTop - navbarHeight;
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      });
    }
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
            <a href="/explore-jobs" style={{ cursor: 'pointer' }}>Jobs</a>
            <a href="#features" onClick={(e) => { e.preventDefault(); smoothScrollTo('features'); }} style={{ cursor: 'pointer' }}>Features</a>
            <a href="#compare" onClick={(e) => { e.preventDefault(); smoothScrollTo('compare'); }} style={{ cursor: 'pointer' }}>Compare</a>
            <a href="#pricing" onClick={(e) => { e.preventDefault(); smoothScrollTo('pricing'); }} style={{ cursor: 'pointer' }}>Pricing</a>
            <a href="#faq" onClick={(e) => { e.preventDefault(); smoothScrollTo('faq'); }} style={{ cursor: 'pointer' }}>FAQ</a>
            <a href="/join-membership" className='type2'>Apply for Membership <OfflineBoltIcon /></a>
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

        <div className="btns">
          <a href='/explore-jobs' className="btn">
            Explore All Jobs 
            <WorkOutlineIcon/>
          </a>

          <a href='/join-membership' className="apply-btn">
            Apply for Membership <OfflineBoltIcon />
          </a>
        </div>


        <div className="dancing-scroll-action" onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}>
          <ExpandMoreIcon />
        </div>
      </Page1>
      <PageGap>
        <div className="ticker">
          <div className="ticker__content">
            <span>Application currently available only on Play Store. iOS coming soon.</span>
            <img src={logo} alt="" />
            <span>Application currently available only on Play Store. iOS coming soon.</span>
            <img src={logo} alt="" />
            <span>Application currently available only on Play Store. iOS coming soon.</span>
            <img src={logo} alt="" />
          </div>

          <div className="ticker__content">
            <span>Application currently available only on Play Store. iOS coming soon.</span>
            <img src={logo} alt="" />
            <span>Application currently available only on Play Store. iOS coming soon.</span>
            <img src={logo} alt="" />
            <span>Application currently available only on Play Store. iOS coming soon.</span>
            <img src={logo} alt="" />
          </div>
        </div>
      </PageGap>
      <Page id='features'>
        <h1>
          Features
          <img src={logo} alt="" />
        </h1>
        <h2>
          What you get with HiringBull
        </h2>
        <div className="container1000">
          <div className="square-2">
            <div className="svgs">
              <div className="svg">
                <svg
                  width="56"
                  height="56"
                  viewBox="0 0 56 56"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M18 24C18 18.477 22.477 14 28 14C33.523 14 38 18.477 38 24V31.5C38 33.433 38.784 35.285 40.18 36.68L41 37.5H15L15.82 36.68C17.216 35.285 18 33.433 18 31.5V24Z"
                    fill="#FFC107"
                  />

                  <path
                    d="M24 40C24 42.209 25.791 44 28 44C30.209 44 32 42.209 32 40H24Z"
                    fill="#FFB300"
                  />

                  <circle cx="28" cy="36.5" r="2" fill="#FFA000" />

                  <path
                    d="M22 24C22 21 24.5 18.5 28 18.5"
                    stroke="white"
                    stroke-opacity="0.6"
                    stroke-width="2"
                    stroke-linecap="round"
                  />

                  <path
                    d="M12 26C9 24 9 20 12 18"
                    stroke="#FFC107"
                    stroke-width="2.5"
                    stroke-linecap="round"
                  />

                  <path
                    d="M44 26C47 24 47 20 44 18"
                    stroke="#FFC107"
                    stroke-width="2.5"
                    stroke-linecap="round"
                  />
                </svg>
              </div>
            </div>
            <div className="title">
              Apply Before the Crowd Does - Get alerted when jobs go live - Only career page links
            </div>
            <div className="desc">
              We monitor company career pages and social channels so you can apply early, when there are dozens of applicants instead of thousands. Most jobs? You'll know in under 10 minutes. Tougher sites? We catch them from social posts, still way faster than manual searching.
            </div>
            <div className="tags">
              <div className="tag">150+ Companies</div>
              <div className="tag">Verified Career Page Links</div>
              <div className="tag">Within 10 Minutes</div>
            </div>
          </div>
          <div className="square">
            <div className="svgs">
              <div className="svg">
                <svg
                  width="56"
                  height="56"
                  viewBox="0 0 56 56"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <text
                    x="28"
                    y="36"
                    text-anchor="middle"
                    font-size="24"
                    font-weight="800"
                    fill="#FFC107"
                    font-family="Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif"
                  >
                    3×
                  </text>
                </svg>
              </div>
            </div>
            <div className="title">
              Outreach with company employees and recruiters.
            </div>
            <div className="desc">
              Write what you need once we deliver it to verified employees in curated WhatsApp communities. To avoid spam, we limit to 3 requests a month.
            </div>
            <div className="tags">
              <div className="tag">3 times per month</div>
            </div>
          </div>
          <div className="square">
            <div className="svgs">
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/LinkedIn_logo_initials.png/960px-LinkedIn_logo_initials.png" alt="" />
              <img src="https://store-images.s-microsoft.com/image/apps.15970.14375561300249796.05fe8c27-ce9e-4144-8702-0e81e2f575b1.042364cb-b745-4796-a520-61291e2dd6b9" alt="" />
              <img src="https://img.freepik.com/free-vector/twitter-app-new-logo-x-black-background_1017-45425.jpg?semt=ais_hybrid&w=740&q=80" alt="" />
            </div>
            <div className="title">
              Discover hidden opportunities from real social posts.
            </div>
            <div className="desc">
              Catch posts like "my team is hiring," "DM for referral," or "looking for a React dev"—before they hit job boards. We share the authentic post URL so you can reach out directly.
            </div>
            <div className="tags">
              <div className="tag">Linkedin</div>
              <div className="tag">Reddit</div>
              <div className="tag">X</div>
            </div>
          </div>
          <div className="square">
            <div className="svgs">
              <div className="svg">
                <svg
                  width="56"
                  height="56"
                  viewBox="0 0 56 56"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <text
                    x="28"
                    y="36"
                    text-anchor="middle"
                    font-size="22"
                    font-weight="800"
                    fill="#FFC107"
                    font-family="Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif"
                  >
                    1000
                  </text>
                </svg>
              </div>
            </div>
            <div className="title">
              Exclusive <br /> 1,000-member cap
            </div>
            <div className="desc">
              Early alerts only work when access is limited. The cap ensures members act before applications flood in.
            </div>
            <u>Make it easier — use a <b>registerd email as referral code</b> to get a discount and priority access.</u>
            <div className="tags">
              <div className="tag">Exclusive Club</div>
            </div>
          </div>
          <div className="square">
            <div className="svgs">
              <div className="svg">
                <svg
                  width="56"
                  height="56"
                  viewBox="0 0 56 56"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <text
                    x="28"
                    y="26"
                    text-anchor="middle"
                    font-size="16"
                    font-weight="800"
                    fill="#FFC107"
                    font-family="Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif"
                  >
                    100%
                  </text>

                  <text
                    x="28"
                    y="42"
                    text-anchor="middle"
                    font-size="16"
                    font-weight="800"
                    fill="#FFC107"
                    font-family="Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif"
                  >
                    OFF
                  </text>
                </svg>

              </div>
            </div>
            <div className="title">
              Get Placed. Get 100% Back.
            </div>
            <div className="desc">
              If you're confident in landing a job or internship, this is effectively your free ticket get placed during mentorship and we refund your membership payment.
            </div>
            <u><b>Terms apply</b> - eg. verify using official selection emails or offer letters.</u>
            <div className="tags">
              <div className="tag">100% Money Back</div>
            </div>
          </div>
        </div>

        <div className="request-feature">
          <div className="github-logo">
            <img src="https://cdn-icons-png.flaticon.com/512/25/25231.png" alt="" />
          </div>
          <div className="text">
            Can't find a feature you need? <br /><b>Request it</b> and we'll built it for you! ❤️
          </div>
          <div className="hiringbull-logo">
            <img src={logoBig} alt="" />
          </div>
        </div>

      </Page>
      <PageBetween className='no-mobile'>
        <div className="line"></div>
        <img src={logo} alt="" />
        <div className="line"></div>
      </PageBetween>
      <Page className='no-mobile' id="compare">
        <h1>
          Why HiringBull Works
          <img src={logo} alt="" />
        </h1>
        <h2>
          Early access. Smaller competition. Real visibility.
        </h2>

        <Table>
          <div className="comparison-wrapper">
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>Aspect</th>
                  <th><img src={logoBig} alt="" /> </th>
                  <th><img src={social1} alt="" /></th>
                  <th><img src={social2} alt="" /></th>
                </tr>
              </thead>

              <tbody>
                {rows.map((row, i) => (
                  <tr key={i}>
                    <td className="aspect">{row.aspect}</td>

                    <td className={`cell ${row.hbType}`}>
                      <span className="icon">
                        {row.hbType == "good" ? "✅" : "✖️"}
                      </span>
                      {row.hiringbull}
                    </td>

                    <td className={`cell ${row.oType}`}>
                      <span className="icon">
                        {row.oType == "good" ? "✅" : "✖️"}
                      </span>
                      {row.others}
                    </td>

                    <td className={`cell ${row.gType}`}>
                      <span className="icon">
                        {row.gType == "good" ? "✅" : "✖️"}
                      </span>
                      {row.groups}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Table>

        {/* <div className="request-feature">
          <div className="github-logo">
            <img src="https://cdn-icons-png.flaticon.com/512/25/25231.png" alt="" />
          </div>
          <div className="text">
            Can't find a feature you need? <br /><b>Request it</b> and we'll built it for you! ❤️
          </div>
          <div className="hiringbull-logo">
            <img src={logoBig} alt="" />
          </div>
        </div> */}

      </Page>
      <PageBetween>
        <div className="line"></div>
        <img src={logo} alt="" />
        <div className="line"></div>
      </PageBetween>
      <Page id="pricing">
        <h1>
          <span>Pricing & </span> Membership Plans
          <img src={logo} alt="" />
        </h1>
        <h2>
          A small membership fee for a much larger advantage.
        </h2>

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

        {/* --- REFERRAL SECTION --- */}
        <div className="referral">
          {/* Added onClick and dynamic styles for the box */}
          <div
            className="box"
            onClick={handleReferralClick}
            style={{
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: isDiscountApplied ? '#e6fffa' : 'white',
              borderColor: isDiscountApplied ? '#16a34a' : '#ddd'
            }}
          >
            {isDiscountApplied && <CheckBoxIcon style={{ color: '#16a34a' }} />}
          </div>
          <div className="text" onClick={handleReferralClick} style={{ cursor: 'pointer' }}>
            <div className="title">
              {isDiscountApplied ? "Discount Applied Successfully!" : "Click to check new prices - Unlock an instant 25% discount"}
            </div>
            <div className="desc">
              Have a friend already with HiringBull Membership? Share their registered membership email to unlock a flat 25% off your plan - and your friend earns 25% of your plan value as a referral reward.
            </div>
          </div>
        </div>
      </Page>
      <PageBetween>
        <div className="line"></div>
        <img src={logo} alt="" />
        <div className="line"></div>
      </PageBetween>
      <Page id="faq">
        <h1>
          Frequently Asked Questions
          <img src={logo} alt="" />
        </h1>
        <h2>
          Get all your questions answered
        </h2>
        <div className="faq">
          {faqData.map((item, index) => (
            <div
              key={index}
              className={`qna ${openIndex === index ? "open" : ""}`}
            >
              <div className="question" onClick={() => toggleFAQ(index)}>
                <div className="text">{item.question}</div>
                <div className="symbol">+</div>
              </div>

              <div className="answer">{item.answer}</div>
            </div>
          ))}
        </div>
      </Page>
      <Footer>
        <div className="footer-grid">
          <div className="col brand">
            <img src={logoBig} className='logo' alt="" />
            <div className="tagline">Compete with 50 applicants, not 50,000. <br /> Apply early.  </div>
            <div className="trust">
              Early job alerts · Curated access · Limited members
            </div>
          </div>

          <div className="col">
            <div className="heading">Product</div>
            <a href="#features" onClick={(e) => { e.preventDefault(); smoothScrollTo('features'); }} style={{ cursor: 'pointer' }}>Features</a>
            <a href="#compare" onClick={(e) => { e.preventDefault(); smoothScrollTo('compare'); }} style={{ cursor: 'pointer' }}>Compare</a>
            <a href="#pricing" onClick={(e) => { e.preventDefault(); smoothScrollTo('pricing'); }} style={{ cursor: 'pointer' }}>Pricing</a>
            <a href="#faq" onClick={(e) => { e.preventDefault(); smoothScrollTo('faq'); }} style={{ cursor: 'pointer' }}>FAQ</a>
          </div>

          <div className="col">
            <div className="heading">Support</div>
            <a href="/join-membership">Apply for Membership</a>
            <a href="mailto:team@hiringbull.org">Contact</a>
            <a href="/referral-program">Referral Program</a>
          </div>

          <div className="col">
            <div className="heading">Legal</div>
            <a href="/terms">Terms</a>
            <a href="/privacy">Privacy</a>
            <a href="/refund">Refund Policy</a>
          </div>
        </div>

        <div className="footer-bottom">
          © 2026 HiringBull · Opensource platform
        </div>
      </Footer>
    </Container >
  )
}

export default Landing

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
  position: relative;
  width: 100vw;
  min-height: calc(100vh - 85px);
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
    font-size: 3.8rem;
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

  .btns{
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;  

    .btn{
      margin-top: 30px;
      padding: 12px 25px;
      color: #000;
      border: 1px solid #000;
      border-radius: 100px;
      cursor: pointer;
      font-size: 1.1rem;
      font-weight: 600;
  
      text-decoration: none;
  
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .apply-btn{
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

      svg{
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

  @media (max-width: 500px) {
    img{
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

    .btns{
      flex-direction: column;
      margin-top: 40px;
      
      .btn{
        margin: 0;
        padding: 10px 20px;
        font-size: 0.9rem;
        background-color: black;
        color: white;

        svg{
          font-size: 1.5rem;  
          fill: #ffc502;
        }
      }

      .apply-btn{
        display: none;
        margin: 0;
        padding: 10px 20px;
        font-size: 0.9rem;
      }
    }

  }
`;

const Page = styled.div`
  min-height: 100vh;
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

  .container1000{
    width: 100%;
    max-width: 1000px;

    margin: 40px 0;

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
      background-color: #ffb30003;

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

  .request-feature {
    margin: 40px auto 0 auto;

    width: 100%;
    max-width: 600px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 15px;

    padding: 15px 25px;
    border-radius: 1000px;
    background: #fff;
    box-shadow: 0 0 8px rgba(0, 0, 0, 0.1);
    border: 1px solid black;

    .github-logo {
      width: 40px;
      height: 40px;

      img {
        width: 40px;
        height: 40px;
      }
    }

    .text {
      font-size: 1rem;
      font-weight: 300;
      color: #333;
      margin: 0 10px;
      text-align: center;
    }

    .hiringbull-logo {
      height: 40px;

      img {
        height: 100%;
      }
    }

    /* ========================= */
    /* 📱 MOBILE (≤500px) */
    /* ========================= */
    @media (max-width: 500px) {
      width: 100%;
      padding: 10px;
      margin-top: 0px;

      justify-content: center;

      /* .github-logo, */
      .hiringbull-logo {
        display: none;
      }

      .text {
        font-size: 0.85rem;
        margin: 0;
        line-height: 1.3;
      }
    }
  }

  .referral{
    display: flex;
    align-items: center;
    max-width: 1000px;
    margin-top: 20px;
    padding: 0 40px;

    .box{
      height: 30px;
      aspect-ratio: 1/1;
      border-radius: 4px;
      border: 1px solid black;
      margin-right: 20px;
    }

    .text{
      .title{
        font-size: 1.25rem;
        font-weight: 500;
      }

      .desc{
        font-size: 0.9rem;
        font-weight: 300;
      }
    }

    @media (max-width: 500px) {
      display: flex;
      align-items: flex-start;
      margin-top: 20px;
      padding: 0 20px;

      .box{
        margin-top: 10px;
      }

      .text{
        .title{
          font-size: 1rem;
          font-weight: 500;
        }

        .desc{
          font-size: 0.85rem;
          font-weight: 300;
        }
      }
    }
  }

  .faq{
    margin-top: 80px;
    margin-bottom: 40px;

    @media (max-width: 500px) {
      margin: 40px 20px;
    }
  }

  .qna {
    border-bottom: 1px solid #eee;
    padding: 20px 0;
    max-width: 1000px;
    
    .question {
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: pointer;
      
      .text {
        font-size: 1.25rem;
        font-weight: 500;
        color: #111;
      }
      
      .symbol {
        font-size: 2rem;
        font-weight: 400;
        transition: transform 0.25s ease;
        color: #555;
      }

      @media (max-width: 500px) {
        .text{
          font-size: 1rem;
        }

        .symbol{
          font-size: 1.5rem;
        }
      }
    }
  
    .answer {
      max-height: 0;
      overflow: hidden;
      font-size: 1rem;
      line-height: 1.6;
      color: #555;
      transition-duration: 250ms;
      /* transition: max-height 0.3s ease, opacity 0.2s ease; */
      opacity: 0;

      @media (max-width: 500px) {
        font-size: 0.85rem; 
      }
    }
  
  }
  
  /* OPEN STATE */
  .qna.open .answer {
    max-height: 300px;
    margin-top: 12px;
    opacity: 1;
  }

  .qna.open .symbol {
    transform: rotate(45deg); /* + becomes × */
  }

  @media (max-width: 500px) {
    padding: 100px 20px;

    h1{
      font-size: 1.75rem;

      span{
        display: none;
      }

      img{
        height: 45px;
      }
    }

    h2{
      font-size: 1.15rem;
    }
  }
`;

const PageGap = styled.div`
  height: 40px;
  background-color: #222;

  display: flex;
  align-items: center;
  overflow: hidden;

  .ticker {
    display: flex;
    width: max-content;
    animation: scroll-left 25s linear infinite;
  }

  .ticker__content {
    display: inline-flex;
    align-items: center;
    white-space: nowrap;
    padding-right: 40px;
  }

  span {
    font-size: 0.85rem;
    font-weight: 500;
    font-style: italic;
    color: white;
  }

  img {
    height: 32px;
    margin: 0 20px;
    vertical-align: middle;
  }

  @keyframes scroll-left {
    from {
      transform: translateX(0);
    }
    to {
      transform: translateX(-50%);
    }
  }
`;

const PageBetween = styled.div`
  width: 100vw;
  height: 60px;
  
  display: flex;  
  align-items: center;  
  justify-content: center;

  padding: 0 60px;

  .line {
    flex: 1;
    height: 1px;
    background-color: #ccc;
    margin: 40px auto;
  } 

  img{
    height: 40px;
    margin: 0 20px;
  }
`

const Table = styled.div`
  width: 100%;
  margin-top: 40px;

  /* Wrapper for mobile responsiveness */
  .comparison-wrapper {
    width: 100%;
    overflow-x: auto;
    border-radius: 12px;
    box-shadow: 0 0 8px rgba(0, 0, 0, 0.1);
    border: 1px solid black;
  }

  .comparison-table {
    width: 100%;
    border-collapse: collapse;
    min-width: 800px; /* Ensures columns don't get too narrow on mobile */
    background-color: #ffffff;
    table-layout: fixed; /* Enforces equal width logic unless specified */
  }

  /* --- Header Styling --- */
  thead tr {
    background-color: #ffffff;
  }

  th {
    padding: 1rem 1.25rem;
    text-align: left;
    font-size: 0.95rem;
    /* text-transform: uppercase; */
    font-weight: 600;
    letter-spacing: 0.05em;
    border-bottom: 1px solid #000;
    border-left: 1px solid #000;
    color: #4b5563;

    img{
      height: 40px;
      margin-bottom: -10px;
    }
  }
  
  .compare-company{
    display: flex;
    align-items: center;
    
    img{
      height: 40px;
    }
  }

  th:first-child {
    border-left: none;
  }

  /* --- Row & Cell Styling --- */
  td {
    padding: 1.25rem;
    font-size: 0.95rem;
    line-height: 1.5;
    color: #4b5563;
    border-bottom: 1px solid #000;
    
    /* Key for variable row heights: align text to top */
    vertical-align: top; 
  }

  /* Remove border from last row */
  tbody tr:last-child td {
    border-bottom: none;
  }

  /* Aspect Column (First Column) Styling */
  .aspect {
    width: 20%; /* Fixed width for the label column */
    font-weight: 600;
    background-color: #ffffff;
  }

  /* --- Status Logic (Good/Bad/Warn) --- */
  .cell {
    position: relative;
    transition: background-color 0.2s ease;
    border-left: 1px solid #000;
  }

  /* Good State */
  .good {
    background-color: #f0fdf4; /* Very light green bg */
    color: #15803d;
  }
  
  /* Bad State */
  .bad {
    background-color: #e28282; /* Very light red bg */
    color: #b91c1c;
  }

  /* Warn State */
  .warn {
    background-color: #f9d0d0; /* Very light #ffc502 bg */
    color: #b45309;
  }

  /* --- Icon Styling --- */
  .icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-right: 8px;
    font-weight: 800;
    font-size: 1.1em;
  }

  /* Specific icon colors if you want them to pop more than text */
  .good .icon { color: #16a34a; }
  .bad .icon { color: #dc2626; }
  .warn .icon { color: #d97706; }

  /* --- Mobile Tweak --- */
  @media (max-width: 768px) {
    th, td {
      padding: 1rem;
    }
  }
`;

const Footer = styled.footer`
  background: #0f0f0f;
  color: #ddd;
  padding: 64px 80px 24px;

  @media (max-width: 768px) {
    padding: 48px 24px 20px;
  }

  .footer-grid {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr;
    gap: 48px;
    margin-bottom: 40px;

    @media (max-width: 768px) {
      grid-template-columns: 1fr 1fr;
      gap: 32px;
    }

    @media (max-width: 480px) {
      grid-template-columns: 1fr;
    }
  }

  .col {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .brand {
    max-width: 360px;
  }

  .logo {
    width: 300px;
  }

  .tagline {
    font-size: 0.95rem;
    font-weight: 500;
    color: #aaa;
  }

  .trust {
    font-size: 0.85rem;
    color: #777;
    margin-top: 8px;
    line-height: 1.5;
  }

  .heading {
    font-size: 0.8rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #999;
    margin-bottom: 8px;
  }

  a {
    font-size: 0.9rem;
    color: #ddd;
    text-decoration: none;
    transition: color 0.2s ease;
  }

  a:hover {
    color: #fff;
  }

  .footer-bottom {
    border-top: 1px solid #222;
    padding-top: 16px;
    font-size: 0.8rem;
    color: #777;
    text-align: center;
  }
`;
