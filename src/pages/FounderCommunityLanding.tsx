import React from 'react';
import { FounderCommunityHeader } from '../components/founder-community/FounderCommunityHeader';
import { FounderHeroSection } from '../components/founder-community/FounderHeroSection';
import { FounderPlatformBar } from '../components/founder-community/FounderPlatformBar';
import { WhyDigitalCampuxSection } from '../components/founder-community/WhyDigitalCampuxSection';
import { OurMissionSection } from '../components/founder-community/OurMissionSection';
import { FounderStoriesSection } from '../components/founder-community/FounderStoriesSection';
import { ProcessSection } from '../components/founder-community/ProcessSection';
import { WhatsAppBanner } from '../components/founder-community/WhatsAppBanner';
import { FAQFounderSection } from '../components/founder-community/FAQFounderSection';
import { FounderCommunityFooter } from '../components/founder-community/FounderCommunityFooter';
import { PageType } from '../types';

interface FounderCommunityLandingProps {
  navigateToPage: (page: PageType) => void;
}

export const FounderCommunityLanding: React.FC<FounderCommunityLandingProps> = ({
  navigateToPage
}) => {
  const scrollToForm = () => {
    const el = document.getElementById('founder-form');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const scrollToStories = () => {
    const el = document.getElementById('founder-stories');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-white text-neutral-900 font-sans antialiased selection:bg-[#16834A]/20 selection:text-[#16834A]">
      
      {/* 1. Header & Navigation */}
      <FounderCommunityHeader 
        onJoinClick={scrollToForm}
        onNavigateToDigitalJobs={() => navigateToPage('digital-jobs')}
      />

      {/* 2. Hero Section */}
      <FounderHeroSection 
        onJoinClick={scrollToForm}
        onWatchIntroClick={scrollToStories}
      />

      {/* 3. Social Platforms Bar (YouTube, Zoom, etc.) */}
      <FounderPlatformBar />

      {/* 4. Why Digital Campux Section + Embedded Founder Application Form */}
      <WhyDigitalCampuxSection />

      {/* 5. Our Mission Section */}
      <OurMissionSection />

      {/* 6. Founder Stories Section */}
      <FounderStoriesSection />

      {/* 7. How It Works: A simple process to get started */}
      <ProcessSection />

      {/* 8. WhatsApp Community Invitation Banner */}
      <WhatsAppBanner onJoinClick={scrollToForm} />

      {/* 9. Frequently Asked Questions: Quick Answers */}
      <FAQFounderSection />

      {/* 10. Footer */}
      <FounderCommunityFooter 
        onNavigateHome={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        onNavigateToDigitalJobs={() => navigateToPage('digital-jobs')}
      />

    </div>
  );
};

export default FounderCommunityLanding;
