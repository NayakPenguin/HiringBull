import React from 'react';
import styled from 'styled-components';

const MembershipModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <CloseButton onClick={onClose}>×</CloseButton>
        
        <ModalHeader>
          <h2>🚀 Upgrade to Premium</h2>
          <p>Get exclusive access to premium features</p>
        </ModalHeader>

        <MembershipPlans>
          <PlanCard>
            <PlanTitle>Free Member</PlanTitle>
            <PlanPrice>$0/month</PlanPrice>
            <PlanFeatures>
              <Feature>✅ Job listings updated every 24 hours</Feature>
              <Feature>✅ Basic company filtering</Feature>
              <Feature>✅ Limited job applications</Feature>
              <Feature>❌ Real-time updates</Feature>
              <Feature>❌ Exclusive listings</Feature>
            </PlanFeatures>
            <CurrentPlanButton>Current Plan</CurrentPlanButton>
          </PlanCard>

          <PlanCard featured>
            <PopularBadge>POPULAR</PopularBadge>
            <PlanTitle>Premium Member</PlanTitle>
            <PlanPrice>$19/month</PlanPrice>
            <PlanFeatures>
              <Feature>✅ Real-time job updates</Feature>
              <Feature>✅ Exclusive job listings</Feature>
              <Feature>✅ Advanced filtering</Feature>
              <Feature>✅ Unlimited applications</Feature>
              <Feature>✅ Priority support</Feature>
              <Feature>✅ Salary insights</Feature>
            </PlanFeatures>
            <UpgradeButton onClick={() => window.open('/join-membership', '_blank')}>
              Upgrade Now
            </UpgradeButton>
          </PlanCard>

          <PlanCard>
            <PlanTitle>Enterprise</PlanTitle>
            <PlanPrice>Contact Us</PlanPrice>
            <PlanFeatures>
              <Feature>✅ All Premium features</Feature>
              <Feature>✅ Team management</Feature>
              <Feature>✅ Custom integrations</Feature>
              <Feature>✅ Dedicated support</Feature>
              <Feature>✅ Analytics dashboard</Feature>
            </PlanFeatures>
            <ContactButton>Contact Sales</ContactButton>
          </PlanCard>
        </MembershipPlans>

        <ModalFooter>
          <p>🔒 Secure payment • Cancel anytime • 30-day money-back guarantee</p>
        </ModalFooter>
      </ModalContent>
    </ModalOverlay>
  );
};

export default MembershipModal;

// Styled Components
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  backdrop-filter: blur(4px);
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 16px;
  padding: 32px;
  max-width: 900px;
  width: 90%;
  max-height: 85vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);

  @media (max-width: 768px) {
    padding: 24px;
    width: 95%;
    margin: 20px;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  font-size: 28px;
  cursor: pointer;
  color: #666;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;

  &:hover {
    background: #f5f5f5;
    color: #000;
  }
`;

const ModalHeader = styled.div`
  text-align: center;
  margin-bottom: 32px;

  h2 {
    margin: 0 0 8px 0;
    font-size: 28px;
    color: #1a1a1a;
  }

  p {
    margin: 0;
    color: #666;
    font-size: 16px;
  }
`;

const MembershipPlans = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
`;

const PlanCard = styled.div`
  background: ${props => props.featured ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#f8f9fa'};
  border: ${props => props.featured ? 'none' : '1px solid #e0e0e0'};
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  position: relative;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
  }
`;

const PopularBadge = styled.div`
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  background: #ff6b6b;
  color: white;
  padding: 4px 16px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.5px;
`;

const PlanTitle = styled.h3`
  margin: 0 0 8px 0;
  font-size: 20px;
  color: ${props => props.featured ? 'white' : '#1a1a1a'};
`;

const PlanPrice = styled.div`
  font-size: 32px;
  font-weight: 700;
  color: ${props => props.featured ? 'white' : '#2c3e50'};
  margin-bottom: 24px;
`;

const PlanFeatures = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 24px 0;
  text-align: left;
`;

const Feature = styled.li`
  padding: 8px 0;
  font-size: 14px;
  color: ${props => props.featured ? 'rgba(255, 255, 255, 0.9)' : '#666'};
  border-bottom: 1px solid ${props => props.featured ? 'rgba(255, 255, 255, 0.1)' : '#f0f0f0'};

  &:last-child {
    border-bottom: none;
  }
`;

const CurrentPlanButton = styled.button`
  width: 100%;
  padding: 12px 24px;
  background: #e9ecef;
  color: #6c757d;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: not-allowed;
`;

const UpgradeButton = styled.button`
  width: 100%;
  padding: 12px 24px;
  background: white;
  color: #667eea;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f8f9fa;
    transform: translateY(-2px);
  }
`;

const ContactButton = styled.button`
  width: 100%;
  padding: 12px 24px;
  background: transparent;
  color: ${props => props.featured ? 'white' : '#667eea'};
  border: 2px solid ${props => props.featured ? 'white' : '#667eea'};
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.featured ? 'rgba(255, 255, 255, 0.1)' : '#f8f9fa'};
  }
`;

const ModalFooter = styled.div`
  text-align: center;
  padding-top: 24px;
  border-top: 1px solid #f0f0f0;

  p {
    margin: 0;
    color: #666;
    font-size: 14px;
  }
`;
