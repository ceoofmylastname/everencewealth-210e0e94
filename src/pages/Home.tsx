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
import { HomepageAbout } from '../components/homepage/HomepageAbout';
import { TheGap } from '../components/homepage/TheGap';
import { Stats } from '../components/homepage/Stats';
import { Assessment } from '../components/homepage/Assessment';
import { FAQ } from '../components/homepage/FAQ';
import { CTA } from '../components/homepage/CTA';
import { CursorGlow } from '../components/CursorGlow';

function Home() {
  return (
    <div className="min-h-screen flex flex-col font-sans text-white bg-[hsl(160_80%_2%)]">
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
        <HomepageAbout />
        <Stats />
        <Assessment />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}

export default Home;
