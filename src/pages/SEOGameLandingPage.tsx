import React from 'react';
import { SEOMetaTags } from '../components/seo-game/SEOMetaTags';
import { SEOGameHeader } from '../components/seo-game/SEOGameHeader';
import { SEOGameHero } from '../components/seo-game/SEOGameHero';
import { FeatureStrip } from '../components/seo-game/FeatureStrip';
import { FinalCTA } from '../components/seo-game/FinalCTA';
import { SEOGameFooter } from '../components/seo-game/SEOGameFooter';
import { useSEOGameAudio } from '../hooks/useSEOGameAudio';
import { supabase } from '../lib/supabaseClient';
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
  const { 
    isMuted, 
    volume, 
    toggleSound, 
    setVolume, 
    playSfx, 
    triggerAudioUnlock 
  } = useSEOGameAudio({ initialVolume: 0.2 });

  const handleStartPlaying = async () => {
    triggerAudioUnlock();
    playSfx('success');

    // Section 21: Check active Supabase session
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const currentSession = sessionData?.session;

      if (currentSession?.user) {
        // Check if player profile already exists
        const { data: player } = await supabase
          .from('seo_game_players')
          .select('id')
          .eq('user_id', currentSession.user.id)
          .maybeSingle();

        if (player) {
          // Player already exists -> go directly to /The-SEO-Game/play
          navigateToPage('the-seo-game-play');
          return;
        } else {
          // Authenticated but does not have player profile -> show custom player setup form
          openSignupModal();
          return;
        }
      }
    } catch (err) {
      console.warn('Session verification note on Start Playing:', err);
    }

    // If not authenticated, open custom SEO Game signup modal
    openSignupModal();
  };

  const handleSignIn = () => {
    triggerAudioUnlock();
    playSfx('click');
    openSignInModal();
  };

  return (
    <div className="min-h-screen bg-[#06090F] text-slate-100 font-sans selection:bg-[#18B892]/30 selection:text-white relative overflow-x-hidden flex flex-col justify-between">
      
      {/* 1. Dynamic SEO, Open Graph & JSON-LD Structured Data */}
      <SEOMetaTags />

      {/* Background Ambient Grid & Subtle Lighting */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#1e293b0f_1px,transparent_1px),linear-gradient(to_bottom,#1e293b0f_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none z-0" />
      <div className="fixed top-0 left-1/4 w-[600px] h-[600px] bg-[#18B892]/5 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="fixed bottom-0 right-1/4 w-[600px] h-[600px] bg-cyan-600/5 rounded-full blur-[140px] pointer-events-none z-0" />

      {/* Main Content Area */}
      <div className="relative z-10 w-full flex-1 flex flex-col">
        
        {/* HEADER: DSP Academy | THE SEO GAME | Sound control | SIGN IN */}
        <SEOGameHeader
          isLoggedIn={isLoggedIn}
          userName={userName}
          onSignInClick={handleSignIn}
          onStartPlayingClick={handleStartPlaying}
          isSoundMuted={isMuted}
          onToggleSound={toggleSound}
          volume={volume}
          onVolumeChange={setVolume}
        />

        <main className="flex-1">
          {/* HERO: LEARN SEO. PLAY THE GAME. + Modern Business Environment */}
          <SEOGameHero
            isLoggedIn={isLoggedIn}
            onStartPlayingClick={handleStartPlaying}
            onSignInClick={handleSignIn}
            playSfx={playSfx}
            triggerAudioUnlock={triggerAudioUnlock}
          />

          {/* SMALL FEATURE STRIP: KEYWORDS · CONTENT · TECHNICAL SEO · AUTHORITY · SERP · AI SEARCH */}
          <FeatureStrip />

          {/* FINAL CTA: READY TO RANK? -> START PLAYING */}
          <FinalCTA
            onStartPlayingClick={handleStartPlaying}
          />
        </main>

        {/* Minimal Footer */}
        <SEOGameFooter
          onSignInClick={handleSignIn}
          onCreateAccountClick={openSignupModal}
        />

      </div>

      {/* Floating Game Audio HUD Pill */}
      <aside 
        aria-label="Game Sound HUD" 
        className="fixed bottom-4 right-4 z-50 flex items-center gap-2.5 bg-[#070D18]/90 backdrop-blur-md border border-slate-800/90 hover:border-slate-700/90 rounded-full py-1.5 px-3.5 shadow-2xl transition duration-200"
      >
        <button
          onClick={toggleSound}
          className="flex items-center gap-2 text-xs font-mono cursor-pointer select-none focus:outline-none"
          title={isMuted ? "Turn game sound on (the_mountain-retro-game-593063.mp3)" : "Mute game soundtrack"}
          aria-label={isMuted ? "Turn game sound on" : "Turn game sound off"}
        >
          <span className="text-sm leading-none" role="img" aria-label={isMuted ? "Sound muted" : "Sound active"}>
            {isMuted ? '🔇' : '🔊'}
          </span>
          <span className={`text-[10px] font-bold tracking-wider uppercase ${isMuted ? 'text-slate-400' : 'text-emerald-400'}`}>
            {isMuted ? 'SOUND OFF' : 'GAME SOUND'}
          </span>
        </button>
      </aside>

    </div>
  );
}
