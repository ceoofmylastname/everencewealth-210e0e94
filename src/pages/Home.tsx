import React from 'react';
import { Header } from '../components/home/Header';
import { Footer } from '../components/home/Footer';
import { Hero } from '../components/home/sections/Hero';
import { WakeUpCall } from '../components/homepage/WakeUpCall';
import { StackingCards } from '../components/homepage/StackingCards';
import { WealthPhilosophy } from '../components/homepage/WealthPhilosophy';
import { FiduciaryDifference } from '../components/homepage/FiduciaryDifference';
import { TheGap } from '../components/homepage/TheGap';
import { Services } from '../components/homepage/Services';
import { HomepageAbout } from '../components/homepage/HomepageAbout';
import { Stats } from '../components/homepage/Stats';
import { Assessment } from '../components/homepage/Assessment';
import { FAQ } from '../components/homepage/FAQ';
import { BlogPreview } from '../components/homepage/BlogPreview';
import { CTA } from '../components/homepage/CTA';
import { CursorGlow } from '../components/CursorGlow';
import { ScrollProgressBar } from '../components/homepage/ScrollProgressBar';

function Home() {
  const sectionClass = "rounded-3xl overflow-hidden";
  return (
    <div className="min-h-screen flex flex-col font-sans text-white bg-white">
      <ScrollProgressBar />
      <Header />
      <CursorGlow />
      <main className="flex-grow mx-2 md:mx-4 lg:mx-6 space-y-4 md:space-y-6 py-4 md:py-6">
        <div className={sectionClass}><Hero /></div>
        <div className={sectionClass}><WakeUpCall /></div>
        <div className={sectionClass}><StackingCards /></div>
        <div className={sectionClass}><WealthPhilosophy /></div>
        <div className={sectionClass}><FiduciaryDifference /></div>
        <div className={sectionClass}><TheGap /></div>
        <div className={sectionClass}><Services /></div>
        <div className={sectionClass}><HomepageAbout /></div>
        <div className={sectionClass}><Stats /></div>
        <div className={sectionClass}><Assessment /></div>
        <div className={sectionClass}><FAQ /></div>
        <div className={sectionClass}><BlogPreview /></div>
        <div className={sectionClass}><CTA /></div>
      </main>
      <div className="mx-2 md:mx-4 lg:mx-6 mb-4 md:mb-6 rounded-3xl overflow-hidden">
        <Footer />
      </div>
    </div>
  );
}

export default Home;
