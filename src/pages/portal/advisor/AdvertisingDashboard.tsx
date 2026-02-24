import React, { useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { 
  Play, Video, FileText, Mic, Calendar, Target,
  Zap, PenTool, LayoutTemplate, Briefcase, BarChart, CheckCircle2 
} from 'lucide-react';

const AdvertisingDashboard = () => {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 overflow-x-hidden">
      
      {/* 1. Hero Section */}
      <section className="relative pt-24 pb-32 overflow-hidden">
        {/* Background shapes */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute top-10 right-[-10%] w-[120%] h-[120%] bg-gradient-to-tr from-white to-gray-50 transform -skew-y-3 z-0" />
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 150, repeat: Infinity, ease: "linear" }}
            className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] border-[40px] border-[#1A4D3E]/5 rounded-full"
          />
          <motion.div 
            animate={{ rotate: -360 }}
            transition={{ duration: 200, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] border-[20px] border-[#C8A96E]/10 rounded-full"
          />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-5xl md:text-7xl font-bold text-[#1A4D3E] tracking-tight leading-tight mb-6"
            >
              Run Smarter Ads.<br/> Reach More Clients.<br/> Grow Your Practice.
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto"
            >
              Launch AI-powered ad campaigns across 13+ platforms — all from one place, built exclusively for Everence Wealth advisors.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
            >
              <a 
                href="https://launch.yenomai.com/?ref_id=IPxLDDZso3Z1XsmXbpGK2kkf2gn2"
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto px-8 py-4 bg-[#1A4D3E] text-white font-medium hover:bg-[#143d30] transition-colors rounded-none shadow-[0_20px_60px_rgba(26,77,62,0.12)] flex items-center justify-center gap-2"
              >
                Launch Your Ad Account
                <Target size={18} />
              </a>
              <button className="w-full sm:w-auto px-8 py-4 bg-white text-[#1A4D3E] border border-[#1A4D3E] font-medium hover:bg-gray-50 transition-colors rounded-none">
                See How It Works
              </button>
            </motion.div>

            {/* Stat Counters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-gray-100 pt-10">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <div className="text-4xl font-bold text-[#C8A96E] mb-2">100,000+</div>
                <div className="text-sm text-gray-500 uppercase tracking-wider font-semibold">Campaigns Launched</div>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="border-t md:border-t-0 md:border-l border-gray-100 pt-8 mt-8 md:pt-0 md:mt-0"
              >
                <div className="text-4xl font-bold text-[#C8A96E] mb-2">90%</div>
                <div className="text-sm text-gray-500 uppercase tracking-wider font-semibold">Reduction in Ad Costs</div>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="border-t md:border-t-0 md:border-l border-gray-100 pt-8 mt-8 md:pt-0 md:mt-0"
              >
                <div className="text-4xl font-bold text-[#C8A96E] mb-2">15x</div>
                <div className="text-sm text-gray-500 uppercase tracking-wider font-semibold">Average CTR Increase</div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Ticker Strip */}
      <div className="w-full bg-[#1A4D3E] py-4 overflow-hidden shadow-inner flex items-center">
        <motion.div 
          animate={{ x: [0, -1035] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="flex whitespace-nowrap gap-12 font-bold text-white/70 uppercase tracking-widest text-sm"
        >
          {Array.from({ length: 4 }).map((_, i) => (
            <React.Fragment key={i}>
              <span className="flex items-center gap-2"><Zap size={14} className="text-[#C8A96E]" /> Meta Ads</span>
              <span className="flex items-center gap-2"><Zap size={14} className="text-[#C8A96E]" /> Google Ads</span>
              <span className="flex items-center gap-2"><Zap size={14} className="text-[#C8A96E]" /> LinkedIn Ads</span>
              <span className="flex items-center gap-2"><Zap size={14} className="text-[#C8A96E]" /> TikTok Ads</span>
              <span className="flex items-center gap-2"><Zap size={14} className="text-[#C8A96E]" /> YouTube Ads</span>
              <span className="flex items-center gap-2"><Zap size={14} className="text-[#C8A96E]" /> Spotify Ads</span>
              <span className="flex items-center gap-2"><Zap size={14} className="text-[#C8A96E]" /> Postcard Ads</span>
            </React.Fragment>
          ))}
        </motion.div>
      </div>

      {/* 2. Platform Grid */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-[#C8A96E] font-bold tracking-widest text-sm mb-3">13 PLATFORMS. ONE DASHBOARD.</h3>
            <h2 className="text-4xl font-bold text-[#1A4D3E]">Advertise Everywhere That Matters</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: 'Meta Ads', features: ['Facebook & Instagram', 'Feed, Stories & Reels', 'Messenger & WhatsApp', 'Lead Gen & Conversion'] },
              { name: 'Google Ads', features: ['Search & Display', 'Performance Max', 'Shopping & YouTube', 'Local Service Ads'] },
              { name: 'LinkedIn Ads', features: ['B2B Lead Generation', 'Message & Conversion Ads', 'AI-Refined Targeting', 'Faster Optimization'] },
              { name: 'TikTok Ads', features: ['Viral-Ready Campaigns', 'Spark Ads & Lead Forms', 'Website Conversions', 'AI Creative Insights'] },
              { name: 'YouTube Ads', features: ['In-Stream & Shorts', 'Contextual Placements', 'AI-Assisted Creative', 'Targeting Suggestions'] },
              { name: 'WhatsApp Ads', features: ['Click-to-Chat Campaigns', 'Start Real Conversations', 'Conversion-Ready Leads', 'Direct Engagement'] },
              { name: 'Bing Ads', features: ['AI-Generated Headlines', 'Descriptions & Keywords', 'Targeting Suggestions', 'Launch Search Campaigns'] },
              { name: 'Snapchat Ads', features: ['Vertical Video Ads', 'Traffic & Awareness', 'Conversion Campaigns', 'AI-Generated Creative'] },
              { name: 'Spotify Ads', features: ['AI Audio Scripts', 'AI Voiceovers', 'Background Music', 'Target Podcast Listeners'] },
              { name: 'Postcard Ads', features: ['Physical Postcards', 'Digital-Like Targeting', 'AI Handles Layout', 'Unique Marketing Channel'] },
              { name: 'Amazon Ads', upcoming: true, features: ['For Amazon Sellers', 'AI-Powered Campaigns', 'Optimize Product Listings', 'Increase Sales Velocity'] },
              { name: 'X / Twitter Ads', upcoming: true, features: ['Text, Image & Video', 'AI Optimization', 'Reach a Vocal Audience', 'Drive Conversation'] },
              { name: 'Pinterest Ads', upcoming: true, features: ['Visual Discovery Ads', 'Product Catalogues', 'Lifestyle Targeting', 'AI Creative'] },
            ].map((platform, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
                className="bg-white p-6 border-l-[3px] border-[#1A4D3E] rounded max-w-full shadow-sm hover:shadow-[0_20px_60px_rgba(26,77,62,0.12)] transition-all duration-300 transform group"
              >
                <div className="group-hover:-translate-y-2 group-hover:rotate-x-2 transition-transform duration-300">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-xl font-bold text-[#1A4D3E] group-hover:text-[#C8A96E] transition-colors">{platform.name}</h4>
                    {platform.upcoming && (
                      <span className="bg-[#C8A96E]/10 text-[#C8A96E] text-[10px] uppercase font-bold px-2 py-1 rounded">Coming Soon</span>
                    )}
                  </div>
                  <ul className="space-y-2">
                    {platform.features.map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2 text-sm text-gray-600">
                        <CheckCircle2 size={16} className="text-[#1A4D3E] mt-0.5 shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. AI Creative Studio */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold text-[#1A4D3E] mb-4">Create. Publish. Convert.</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">Harness the power of AI to generate all your creative assets effortlessly within the Everence Wealth Advertising platform.</p>
          </div>

          <div className="space-y-32">
            {/* Block A */}
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
              <div className="lg:w-1/2">
                <div className="w-16 h-16 bg-[#C8A96E]/10 flex items-center justify-center rounded-none mb-6">
                  <FileText className="text-[#C8A96E]" size={32} />
                </div>
                <h3 className="text-3xl font-bold text-[#1A4D3E] mb-4">AI Writes Your Ad Copy Instantly</h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  Generate high-converting headlines, compelling body text, and powerful CTAs tailored specifically for financial services audiences. Our AI understands compliance-friendly language and optimizes for engagement across different ad networks.
                </p>
              </div>
              <div className="lg:w-1/2 w-full perspective-1000">
                <motion.div 
                  initial={{ rotateY: 20, opacity: 0, x: 50 }}
                  whileInView={{ rotateY: 0, opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, type: "spring" }}
                  className="bg-gray-50 p-6 shadow-[0_20px_60px_rgba(26,77,62,0.12)] border border-gray-100 rounded-sm relative"
                >
                  <div className="w-full h-8 border-b border-gray-200 mb-4 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                  <div className="space-y-4">
                    <div className="p-3 bg-white border border-gray-200 rounded-sm text-sm text-gray-500 flex items-center gap-2">
                      <Zap size={14} className="text-[#C8A96E]" />
                      Draft an ad for early retirement planning...
                    </div>
                    <div className="bg-[#1A4D3E] text-white p-4 rounded-sm">
                      <h4 className="font-bold text-[#C8A96E] mb-2 uppercase text-xs">Generated Headline</h4>
                      <p className="font-medium mb-4">Secure Your Future: The Blueprint to Early Retirement</p>
                      
                      <h4 className="font-bold text-[#C8A96E] mb-2 uppercase text-xs">Body Copy</h4>
                      <p className="text-sm opacity-90 leading-relaxed font-light">
                        Don't leave your golden years to chance. Discover the exact strategies top advisors use to help clients retire up to 5 years earlier. Get your free custom analysis today and take control of your wealth trajectory.
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Block B */}
            <div className="flex flex-col lg:flex-row-reverse items-center gap-12 lg:gap-24">
              <div className="lg:w-1/2">
                <div className="w-16 h-16 bg-[#1A4D3E]/10 flex items-center justify-center rounded-none mb-6">
                  <Video className="text-[#1A4D3E]" size={32} />
                </div>
                <h3 className="text-3xl font-bold text-[#1A4D3E] mb-4">Turn Your Message Into a Video Ad</h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  Generate professional spokesperson videos using AI UGC-style avatars. No camera, no crew, no editing required — just input your text, select an avatar, and let our system create high-converting video content in minutes.
                </p>
              </div>
              <div className="lg:w-1/2 w-full perspective-1000">
                <motion.div 
                  initial={{ rotateY: -20, opacity: 0, x: -50 }}
                  whileInView={{ rotateY: 0, opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, type: "spring" }}
                  className="relative p-2 bg-white shadow-[0_20px_60px_rgba(26,77,62,0.12)] border border-[#C8A96E] rounded-sm group cursor-pointer"
                >
                  <div className="aspect-video bg-gray-100 relative overflow-hidden rounded-sm flex items-center justify-center">
                    {/* SVG abstract pattern for video avatar */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#1A4D3E] to-gray-900 opacity-90"></div>
                    <svg className="absolute bottom-0 w-3/4 h-3/4 opacity-40 text-white" viewBox="0 0 100 100" fill="currentColor">
                      <path d="M50 50 C 30 50, 15 70, 15 100 L 85 100 C 85 70, 70 50, 50 50 Z"/>
                      <circle cx="50" cy="30" r="15" />
                    </svg>
                    
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center z-10 group-hover:scale-110 transition-transform border border-white/40">
                      <Play className="text-white ml-1" size={24} fill="white" />
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Block C */}
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
              <div className="lg:w-1/2">
                <div className="w-16 h-16 bg-[#C8A96E]/10 flex items-center justify-center rounded-none mb-6">
                  <Mic className="text-[#C8A96E]" size={32} />
                </div>
                <h3 className="text-3xl font-bold text-[#1A4D3E] mb-4">Your Voice on Every Platform</h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  AI instantly generates audio scripts and professional voiceovers optimized for Spotify and podcast listeners. Reach an entirely new demographic with high-quality audio ads generated from text.
                </p>
              </div>
              <div className="lg:w-1/2 w-full flex items-center justify-center">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  className="bg-[#1A4D3E] p-8 w-full shadow-[0_20px_60px_rgba(26,77,62,0.12)] flex items-center gap-4 rounded-sm"
                >
                  <div className="w-12 h-12 rounded-full bg-[#C8A96E] flex items-center justify-center shrink-0">
                    <Play className="text-white ml-1" size={20} fill="white" />
                  </div>
                  <div className="flex-1 flex items-center gap-1 h-12 overflow-hidden">
                    {Array.from({ length: 40 }).map((_, i) => (
                      <motion.div 
                        key={i}
                        animate={{ height: ['20%', `${Math.random() * 80 + 20}%`, '20%'] }}
                        transition={{ duration: Math.random() * 1 + 0.5, repeat: Infinity }}
                        className="w-2 bg-[#C8A96E]/80 rounded-full"
                      />
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Block D */}
            <div className="flex flex-col lg:flex-row-reverse items-center gap-12 lg:gap-24">
              <div className="lg:w-1/2">
                <div className="w-16 h-16 bg-[#1A4D3E]/10 flex items-center justify-center rounded-none mb-6">
                  <Calendar className="text-[#1A4D3E]" size={32} />
                </div>
                <h3 className="text-3xl font-bold text-[#1A4D3E] mb-4">Schedule Organic Posts Too</h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  Don't just run paid ads. Plan, generate, and publish organic content across Instagram, Facebook, LinkedIn, and TikTok directly from the same powerful dashboard. Keep your brand active automatically.
                </p>
              </div>
              <div className="lg:w-1/2 w-full">
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="bg-white p-6 shadow-[0_20px_60px_rgba(26,77,62,0.12)] border border-gray-100 rounded-sm"
                >
                  <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-gray-400 mb-2">
                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map(d => <div key={d}>{d}</div>)}
                  </div>
                  <div className="grid grid-cols-7 gap-2">
                    {Array.from({ length: 14 }).map((_, i) => {
                      const isActive = [2, 5, 8, 11].includes(i);
                      return (
                        <div key={i} className={`aspect-square border border-gray-100 p-1 flex items-end justify-center rounded-sm ${isActive ? 'bg-gray-50' : 'bg-white'}`}>
                          {isActive && (
                            <div className="w-full h-1/2 bg-[#1A4D3E]/20 rounded-sm border border-[#1A4D3E]/30 relative overflow-hidden group">
                              <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-[#1A4D3E] rounded-full"></div>
                              <div className="absolute inset-0 bg-[#1A4D3E] scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300"></div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. How It Works */}
      <section className="py-24 bg-[#1A4D3E] text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold">From Zero to Live Campaign in Minutes</h2>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative max-w-5xl mx-auto">
            {/* Animated dashed line on desktop */}
            <div className="hidden md:block absolute top-[40px] left-10 right-10 h-[2px] z-0 overflow-hidden">
              <motion.div 
                animate={{ x: [0, 1000] }}
                transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                className="w-full h-full border-t-2 border-dashed border-[#C8A96E]/50 absolute top-0 w-[200%]"
              />
            </div>

            {[
              { id: 1, title: 'Connect Platforms', desc: 'Securely link your accounts in one click.' },
              { id: 2, title: 'Describe Goal', desc: 'Tell the AI what you want to achieve.' },
              { id: 3, title: 'AI Builds Campaign', desc: 'Copy, creative, and targeting generated instantly.' },
              { id: 4, title: 'Launch & Optimize', desc: 'Publish and let the system maximize ROI.' },
            ].map((step, idx) => (
              <motion.div 
                key={step.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.15 }}
                className="flex flex-col items-center text-center relative z-10 w-full md:w-1/4"
              >
                <div className="w-20 h-20 rounded-full bg-[#1A4D3E] border-[3px] border-[#C8A96E] text-[#C8A96E] flex items-center justify-center text-2xl font-bold mb-6 shadow-lg shadow-[#C8A96E]/20">
                  {step.id}
                </div>
                <h4 className="text-xl font-bold mb-2 text-white">{step.title}</h4>
                <p className="text-gray-300 text-sm max-w-[200px]">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Performance Infographic */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#1A4D3E]">The Numbers Speak</h2>
            <p className="text-gray-600 mt-4 text-lg">Real data from financial advisors utilizing our AI engine.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Stat 1 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gray-50 p-10 border border-gray-100 rounded-sm relative overflow-hidden"
            >
              <h3 className="text-sm font-bold text-[#C8A96E] uppercase tracking-widest mb-12">Cost Per Lead</h3>
              <div className="text-6xl font-bold text-[#1A4D3E] mb-8">90% <span className="text-2xl text-gray-400 font-normal">Reduction</span></div>
              
              <div className="h-32 flex items-end gap-4 border-b border-gray-200 pb-2 relative">
                <div className="absolute top-0 w-full border-t border-dashed border-gray-300"></div>
                <div className="w-1/2 bg-gray-300 h-full flex flex-col justify-end">
                  <span className="text-xs text-center text-gray-500 mb-2 font-bold block">Previous</span>
                </div>
                <div className="w-1/2 bg-[#1A4D3E] h-[10%] flex flex-col justify-end text-white">
                  <span className="text-[10px] text-center mb-1 font-bold block">Now</span>
                </div>
              </div>
            </motion.div>

            {/* Stat 2 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-[#1A4D3E] p-10 rounded-sm relative overflow-hidden text-white"
            >
              <h3 className="text-sm font-bold text-[#C8A96E] uppercase tracking-widest mb-12 relative z-10">Click-Through Rate</h3>
              <div className="text-6xl font-bold text-white mb-8 relative z-10">1500% <span className="text-2xl text-[#C8A96E] font-normal">Increase</span></div>
              
              <div className="h-32 w-full relative z-10 opacity-80 pt-10">
                <svg viewBox="0 0 100 50" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                  <motion.path 
                    initial={{ pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    d="M 0 50 L 20 40 L 40 45 L 60 20 L 80 25 L 100 0" 
                    fill="none" 
                    stroke="#C8A96E" 
                    strokeWidth="4"
                  />
                  <motion.path 
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 0.2 }}
                    viewport={{ once: true }}
                    transition={{ delay: 1 }}
                    d="M 0 50 L 20 40 L 40 45 L 60 20 L 80 25 L 100 0 L 100 50 Z" 
                    fill="#C8A96E" 
                  />
                </svg>
              </div>
            </motion.div>

            {/* Stat 3 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-gray-50 p-10 border border-gray-100 rounded-sm flex flex-col items-center justify-center text-center"
            >
              <div className="relative w-48 h-48 mb-8 flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                  <circle cx="50" cy="50" r="40" stroke="#E5E7EB" strokeWidth="8" fill="none" />
                  <motion.circle 
                    initial={{ strokeDashoffset: 251 }}
                    whileInView={{ strokeDashoffset: 40 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    cx="50" cy="50" r="40" 
                    stroke="#1A4D3E" 
                    strokeWidth="8" 
                    fill="none" 
                    strokeDasharray="251"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-4xl font-bold text-[#1A4D3E]">$9</div>
                  <div className="text-[10px] uppercase font-bold text-gray-500 mt-1">Avg Cost</div>
                </div>
              </div>
              <h3 className="text-xl font-bold text-[#1A4D3E]">Average CPL</h3>
              <p className="text-gray-500 text-sm mt-2">Highly qualified leads for financial services.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 6. Feature Strip */}
      <section className="py-20 border-t border-gray-100 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 text-center">
            {[
              { icon: Target, name: 'AI Targeting', desc: 'Find ideal clients' },
              { icon: Zap, name: 'Automated Optimization', desc: 'Real-time ROI focus' },
              { icon: Briefcase, name: 'White-Label Branding', desc: 'Your firm\'s identity' },
              { icon: LayoutTemplate, name: 'Template Library', desc: 'Proven frameworks' },
              { icon: LayoutTemplate, name: 'Cross-Platform Dashboard', desc: 'Manage all networks' }, // Re-using layout icon suitable for dashboard
              { icon: BarChart, name: 'Performance Reporting', desc: 'Client-ready exports' },
            ].map((feature, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <div className="w-12 h-12 bg-[#C8A96E]/10 flex items-center justify-center rounded-none mb-4 text-[#C8A96E]">
                  <feature.icon size={24} />
                </div>
                <h4 className="font-bold text-[#1A4D3E] text-sm mb-1">{feature.name}</h4>
                <p className="text-xs text-gray-500">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. CTA Section */}
      <section className="py-24 bg-[#1A4D3E] relative overflow-hidden">
        {/* Abstract background */}
        <div className="absolute inset-0 opacity-10">
           <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
             <defs>
               <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                 <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#C8A96E" strokeWidth="1"/>
               </pattern>
             </defs>
             <rect width="100%" height="100%" fill="url(#grid)" />
           </svg>
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to Put Your Practice<br className="hidden md:block"/> in Front of the Right Clients?</h2>
          <p className="text-xl text-[#C8A96E] mb-10 max-w-2xl mx-auto">Your Everence Wealth advertising account is ready to activate. Launch your first campaign today.</p>
          
          <a 
            href="https://launch.yenomai.com/?ref_id=IPxLDDZso3Z1XsmXbpGK2kkf2gn2"
            target="_blank"
            rel="noreferrer"
            className="inline-block px-10 py-5 bg-[#C8A96E] text-[#1A4D3E] font-bold text-lg hover:bg-white transition-colors rounded-none shadow-2xl hover:-translate-y-1 transform duration-200"
          >
            Open My Advertising Account
          </a>
          
          <p className="mt-8 text-sm text-white/50 font-medium tracking-wide uppercase">Powered by Everence Wealth Advisor Tools</p>
        </div>
      </section>

    </div>
  );
};

export default AdvertisingDashboard;
