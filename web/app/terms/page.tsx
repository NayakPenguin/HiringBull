// @ts-nocheck
"use client";
import React from 'react';
import styled from 'styled-components';

const Terms = () => {
  return (
    <Container>
      <h1>Terms & Conditions</h1>
      <span>Last updated: January 2026</span>

      <p>
        Welcome to Hiringbull.org. By accessing or using our platform, you agree
        to be bound by these Terms & Conditions. If you do not agree with any
        part of these terms, please do not use the service.
      </p>

      <h2>1. About Hiringbull</h2>
      <p>
        Hiringbull is a membership-based job intelligence platform. Users apply
        for membership, and upon approval, gain access to a members-only
        application that provides real-time job updates and notifications.
      </p>

      <h2>2. Membership & Access</h2>
      <p>
        Membership access is granted at the sole discretion of Hiringbull. We
        reserve the right to approve, reject, suspend, or revoke access at any
        time for misuse, abuse, or violation of these terms.
      </p>

      <h2>3. Use of the Platform</h2>
      <p>
        You agree to use the platform only for lawful purposes. You must not
        attempt to scrape data, reverse engineer the application, or misuse job
        information provided through the service.
      </p>

      <h2>4. Accuracy of Job Information</h2>
      <p>
        Hiringbull aggregates and notifies users about job opportunities from
        various sources. We do not guarantee the accuracy, availability, or
        continued validity of any job listing.
      </p>

      <h2>5. Payments</h2>
      <p>
        Payments made for membership grant access to the platform features and
        notifications. Payment does not guarantee job placement, interviews, or
        employment.
      </p>

      <h2>6. Limitation of Liability</h2>
      <p>
        Hiringbull shall not be liable for any direct or indirect damages arising
        from the use or inability to use the platform.
      </p>

      <h2>7. Changes to Terms</h2>
      <p>
        We may update these Terms from time to time. Continued use of the
        platform after changes constitutes acceptance of the updated terms.
      </p>

      <h2>8. Contact</h2>
      <p>
        For questions regarding these Terms, please contact us at
        support@hiringbull.org.
      </p>
    </Container>
  );
};

export default Terms;

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
