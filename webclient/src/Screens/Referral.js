import React from 'react';
import styled from 'styled-components';

const Referral = () => {
  return (
    <Container>
      <h1>Referral Program</h1>
      <span>Last updated: January 2026</span>

      <p>
        Hiringbull offers a referral program that rewards both the referrer and
        the new member for successful referrals.
      </p>

      <h2>1. How Referrals Work</h2>
      <p>
        When a new user signs up for a paid membership on Hiringbull using your
        email address as the referral email, both you and the referred user are
        eligible for referral benefits.
      </p>

      <h2>2. Referral Reward</h2>
      <p>
        Upon a successful referral:
      </p>
      <ul>
        <li>The referred user receives a <strong>25% benefit</strong> on their membership.</li>
        <li>You (the referrer) earn <strong>25% of the actual amount paid</strong> as referral credit.</li>
      </ul>

      <h2>3. Tracking Your Referral Earnings</h2>
      <p>
        You can track your accumulated referral amount by visiting:
      </p>
      <p>
        <strong>https://hiringbull.org/membership/{"{your-email}"}</strong>
      </p>

      <h2>4. Referral Payout</h2>
      <p>
        Once your total referral amount exceeds <strong>₹500</strong>, you may
        request a payout by emailing us at <strong>team@hiringbull.org</strong>.
      </p>

      <p>
        Please include the following details in your email:
      </p>
      <ul>
        <li>Your registered email address</li>
        <li>Your UPI ID</li>
      </ul>

      <h2>5. Payout Timeline</h2>
      <p>
        Approved referral payouts will be processed within
        <strong> 5–7 working days</strong>.
      </p>

      <h2>6. Abuse & Misuse</h2>
      <p>
        Hiringbull reserves the right to withhold or cancel referral rewards in
        cases of suspected abuse, self-referrals, fraudulent activity, or
        violation of platform policies.
      </p>

      <h2>7. Changes to the Referral Program</h2>
      <p>
        Hiringbull may modify or discontinue the referral program at any time
        without prior notice.
      </p>

      <h2>8. Contact</h2>
      <p>
        For any questions regarding referrals, please contact us at
        team@hiringbull.org.
      </p>
    </Container>
  );
};

export default Referral;

const Container = styled.div`
  width: 100%;
  max-width: 900px;
  margin: 40px auto;
  padding: 0 20px;
  line-height: 1.7;

  h1 {
    font-size: 2rem;
    font-weight: 600;
    margin-bottom: 12px;
  }

  h2 {
    margin-top: 28px;
    font-weight: 500;
    font-size: 1.25rem;
  }

  p {
    font-size: 0.9rem;
    font-weight: 200;
    color: #333;
  }

  span{
    font-size: 0.9rem;
    font-weight: 200;
    color: #333;
    font-style: italic;
  }

  ul{
    margin-left: 40px;
    li{
        font-size: 0.9rem;
        font-weight: 200;
        color: #333;
    }
  }
`;
