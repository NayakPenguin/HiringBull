// @ts-nocheck
"use client";
import React from 'react';
import styled from 'styled-components';

const Refund = () => {
  return (
    <Container>
      <h1>Refund & Cancellation Policy</h1>
      <span>Last updated: January 2026</span>

      <p>
        Hiringbull offers a paid membership that provides access to a members-
        only job notification platform.
      </p>

      <h2>1. Refund Eligibility</h2>
      <p>
        Refund requests are eligible only if raised within 7 days of purchase
        and if the user has not substantially used the platform features.
      </p>

      <h2>2. Non-Refundable Cases</h2>
      <p>
        Refunds will not be provided if the membership has been actively used,
        notifications have been delivered, or access has been revoked due to
        policy violations.
      </p>

      <h2>3. Refund Process</h2>
      <p>
        To request a refund, please email team@hiringbull.org with your
        registered email and payment details.
      </p>

      <h2>4. Refund Timeline</h2>
      <p>
        Approved refunds will be processed within 5–7 business days to the
        original payment method.
      </p>

      <h2>5. Changes</h2>
      <p>
        Hiringbull reserves the right to modify this policy at any time.
      </p>
    </Container>
  );
};

export default Refund;

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
`;