import React from 'react';
import { Header } from '../components/home/Header';
import { Footer } from '../components/home/Footer';
import { Hero } from '../components/home/sections/Hero';
import { WakeUpCall } from '../components/homepage/WakeUpCall';
import { SilentKillers } from '../components/homepage/SilentKillers';
import { TaxBuckets } from '../components/homepage/TaxBuckets';
import { IndexedAdvantage } from '../components/homepage/IndexedAdvantage';
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

function Home() {
  return (
    <div className="min-h-screen flex flex-col font-sans text-white bg-dark-bg">
      <Header />
      <CursorGlow />
      <main className="flex-grow">
        <Hero />
        <WakeUpCall />
        <SilentKillers />
        <TaxBuckets />
        <IndexedAdvantage />
        <WealthPhilosophy />
        <FiduciaryDifference />
        <TheGap />
        <Services />
        <HomepageAbout />
        <Stats />
        <Assessment />
        <FAQ />
        <BlogPreview />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}

export default Home;
