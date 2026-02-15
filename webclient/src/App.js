import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import styled from "styled-components";
import Landing from "./Screens/Landing";
import JoinMembershipForm from "./Screens/JoinMembershipForm";
import Membership from "./Screens/Membership";
import Terms from "./Screens/Terms";
import Privacy from "./Screens/Privacy";
import Refund from "./Screens/Refund";
import Referral from "./Screens/Referral";
import TrailJobs from "./Screens/TrailJobs";
import FreeJobs from "./Screens/FreeJobs";
import TestPayment from "./Screens/TestPayment";
import AddJobs from "./Screens/AddJobs";
import GetMembership from "./Screens/GetMembership";

const App = () => {
  return (
    <Container>
      <Routes>
        <Route path="/" element={<Landing />} />
        {/* <Route path="join-membership" element={<JoinMembershipForm />} /> */}
        <Route path="join-membership" element={<GetMembership />} />
        <Route path="/membership/:userEmail" element={<Membership />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/refund" element={<Refund />} />
        <Route path="/referral-program" element={<Referral />} />
        <Route path="/jobs" element={<TrailJobs />} />
        <Route path="/explore-jobs" element={<FreeJobs />} />
        <Route path="/test-payment" element={<TestPayment />} />
        <Route path="/add-jobs-manual" element={<AddJobs />} />
      </Routes>
    </Container>
  )
}

export default App

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`
