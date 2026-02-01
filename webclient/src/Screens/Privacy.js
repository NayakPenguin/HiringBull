import React from 'react';
import styled from 'styled-components';

const Privacy = () => {
  return (
    <Container>
      <h1>Privacy Policy</h1>
      <span>Last updated: January 2026</span>

      <p>
        Hiringbull.org values your privacy. This Privacy Policy explains how we
        collect, use, and protect your information when you use our platform.
      </p>

      <h2>1. Information We Collect</h2>
      <p>
        We may collect personal information such as your name, email address,
        and preferences when you apply for membership or use our services.
      </p>

      <h2>2. How We Use Your Information</h2>
      <p>
        Your information is used to provide job notifications, manage
        memberships, improve platform functionality, and communicate important
        updates.
      </p>

      <h2>3. Third-Party Services</h2>
      <p>
        We may use third-party services such as payment processors, analytics
        tools, and notification providers. These services may process limited
        user data strictly for their intended purpose.
      </p>

      <h2>4. Data Security</h2>
      <p>
        We implement reasonable security measures to protect your data.
        However, no method of transmission over the internet is 100% secure.
      </p>

      <h2>5. Cookies</h2>
      <p>
        We may use cookies or similar technologies to enhance user experience
        and analyze platform usage.
      </p>

      <h2>6. Data Sharing</h2>
      <p>
        We do not sell or rent your personal data. Data may only be shared if
        required by law or to operate essential services.
      </p>

      <h2>7. Changes to This Policy</h2>
      <p>
        This Privacy Policy may be updated periodically. Continued use of the
        platform indicates acceptance of the updated policy.
      </p>

      <h2>8. Contact</h2>
      <p>
        For privacy-related questions, contact us at team@hiringbull.org.
      </p>
    </Container>
  );
};

export default Privacy;

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
