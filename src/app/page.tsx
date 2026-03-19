"use client";

import { Suspense } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import FeaturedProperties from "@/components/FeaturedProperties";
import About from "@/components/About";
import Services from "@/components/Services";
import Testimonials from "@/components/Testimonials";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function HomePage() {
  return (
    <Suspense>
      <div className="min-h-screen">
        <Header />
        <Hero />
        <FeaturedProperties />
        <About />
        <Services />
        <Testimonials />
        <Contact />
        <Footer />
      </div>
    </Suspense>
  );
}
