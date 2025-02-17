import React from "react";
import Navbar from '../components/Navbar'; 
import Footer from '../components/Footer'; 
import WhatsAppSection from "../components/WhatsAppSection";
import ContactForm from "../components/ContactForm";

const ContactPage = () => {
  return (
    <div>
        <Navbar />
    <div className="container mt-5">
      <h2 className="text-center mb-4">¡Contáctanos!</h2>
      <div className="row">
        <WhatsAppSection />
        <ContactForm />
      </div>
    </div>
    <Footer />
</div>
  );
};

export default ContactPage;
