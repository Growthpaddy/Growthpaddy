import React from 'react';
import { SEOMetaTags } from '../components/seo-game/SEOMetaTags';
import { SEOGameHeader } from '../components/seo-game/SEOGameHeader';
import { SEOGameHero } from '../components/seo-game/SEOGameHero';
import { FeatureCards } from '../components/seo-game/FeatureCards';
import { DecisionSimulation } from '../components/seo-game/DecisionSimulation';
import { HowItWorksTimeline } from '../components/seo-game/HowItWorksTimeline';
import { SkillGrid } from '../components/seo-game/SkillGrid';
import { AlgorithmEvent } from '../components/seo-game/AlgorithmEvent';
import { MissionPreview } from '../components/seo-game/MissionPreview';
import { LeaderboardPreview } from '../components/seo-game/LeaderboardPreview';
import { FAQAccordion } from '../components/seo-game/FAQAccordion';
import { FinalCTA } from '../components/seo-game/FinalCTA';
import { SEOGameFooter } from '../components/seo-game/SEOGameFooter';
import { PageType } from '../types';

interface SEOGameLandingPageProps {
  isLoggedIn: boolean;
  userName?: string;
  userEmail?: string;
  navigateToPage: (page: PageType) => void;
  openSignInModal: () => void;
  openSignupModal: () => void;
}

export default function SEOGameLandingPage({
  isLoggedIn,
  userName,
  userEmail,
  navigateToPage,
  openSignInModal,
  openSignupModal
}: SEOGameLandingPageProps) {

  const handleStartPlaying = () => {
    if (isLoggedIn) {
      navigateToPage('the-seo-game-play');
    } else {
      openSignupModal();
    }
  };

  return (
    <div className="min-h-screen bg-[#06090F] text-slate-100 font-sans selection:bg-[#18B892]/30 selection:text-white relative overflow-x-hidden">
      
      {/* 1. Dynamic SEO, Open Graph & JSON-LD Structured Data */}
      <SEOMetaTags />

      {/* Background Ambient Grid & Subtle Lighting */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#1e293b0f_1px,transparent_1px),linear-gradient(to_bottom,#1e293b0f_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none z-0" />
      <div className="fixed top-0 left-1/4 w-[600px] h-[600px] bg-[#18B892]/5 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="fixed bottom-0 right-1/4 w-[600px] h-[600px] bg-cyan-600/5 rounded-full blur-[140px] pointer-events-none z-0" />

      {/* Main Content Area */}
      <div className="relative z-10">
        
        {/* 2. Custom Dark Game Header */}
        <SEOGameHeader
          isLoggedIn={isLoggedIn}
          userName={userName}
          onSignInClick={openSignInModal}
          onCreateAccountClick={openSignupModal}
          onStartPlayingClick={handleStartPlaying}
        />

        <main>
          {/* 3. Hero Section (Headline, Value Prop, Interactive District & SERP Visual) */}
          <SEOGameHero
            isLoggedIn={isLoggedIn}
            onStartPlayingClick={handleStartPlaying}
            onSignInClick={openSignInModal}
          />

          {/* 4. Four Core Gameplay Feature Cards */}
          <FeatureCards />

          {/* 5. "Your Decisions Change The Results" Section */}
          <DecisionSimulation />

          {/* 6. How It Works - 4-Step Progression Timeline */}
          <HowItWorksTimeline onStartPlayingClick={handleStartPlaying} />

          {/* 7. What The Player Will Learn - 18 Game Disciplines Grid */}
          <SkillGrid />

          {/* 8. Algorithm Update Game Event Warning */}
          <AlgorithmEvent />

          {/* 9. Missions Board Preview */}
          <MissionPreview onStartPlayingClick={handleStartPlaying} />

          {/* 10. Global Weekly Leaderboard Preview */}
          <LeaderboardPreview />

          {/* 11. Frequently Asked Questions */}
          <FAQAccordion />

          {/* 12. Dramatic Final Call-To-Action */}
          <FinalCTA
            isLoggedIn={isLoggedIn}
            onCreateAccountClick={openSignupModal}
            onSignInClick={openSignInModal}
            onStartPlayingClick={handleStartPlaying}
          />
        </main>

        {/* 13. Dark Footer */}
        <SEOGameFooter
          onSignInClick={openSignInModal}
          onCreateAccountClick={openSignupModal}
        />

      </div>

    </div>
  );
}
