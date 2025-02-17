
import React from "react";
import Navbar from '../components/Navbar'; 
import Footer from '../components/Footer'; 
import Header from "../components/Header";
import StorySection from "../components/StorySection";
import MissionSection from "../components/MissionSection";
import TeamSection from "../components/TeamSection";

const AboutPage = () => {
  return (
    <div>
        <Navbar />
            <div>
                <Header />
                <StorySection />
                <MissionSection />
                <TeamSection />
            </div>
        <Footer />
    </div>
  );
};

export default AboutPage;
