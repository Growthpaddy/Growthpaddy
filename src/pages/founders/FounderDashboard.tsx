import React, { useState, useEffect, useCallback } from 'react';
import { logoutFounder, type FounderProfile } from '../../lib/founderAuth';
import { PageType, FounderArticle, FounderPodcast, FounderTask, FounderDailyGoal, FounderDistraction, FounderAppointment, FounderObjective, FounderKeyResult } from '../../types';
import { 
  getFounderDashboardData,
  toggleTaskCompletion,
  createFounderTask,
  deleteFounderTask,
  updateDailyGoal,
  saveFounderArticle,
  deleteFounderArticle,
  saveFounderPodcast,
  deleteFounderPodcast,
  toggleDistractionSelection,
  saveFounderAppointment,
  updateAppointmentStatus,
  deleteFounderAppointment,
  updateFounderProfileData
} from '../../lib/founderDashboardService';

import { FounderDashboardLayout } from '../../components/founders/FounderDashboardLayout';
import { FounderOverviewView } from '../../components/founders/FounderOverviewView';
import { FounderArticlesView } from '../../components/founders/FounderArticlesView';
import { FounderPodcastsView } from '../../components/founders/FounderPodcastsView';
import { FounderPlannerView } from '../../components/founders/FounderPlannerView';
import { FounderDistractionsView } from '../../components/founders/FounderDistractionsView';
import { FounderAppointmentsView } from '../../components/founders/FounderAppointmentsView';

import { FounderEditProfileModal } from '../../components/founders/FounderEditProfileModal';
import { FounderPublicProfileModal } from '../../components/founders/FounderPublicProfileModal';
import { FounderArticleEditorModal } from '../../components/founders/FounderArticleEditorModal';
import { FounderArticleReaderModal } from '../../components/founders/FounderArticleReaderModal';
import { FounderPodcastModal } from '../../components/founders/FounderPodcastModal';
import { FounderVideoPlayerModal } from '../../components/founders/FounderVideoPlayerModal';
import { FounderAIBreakdownModal } from '../../components/founders/FounderAIBreakdownModal';
import { FounderScheduleModal } from '../../components/founders/FounderScheduleModal';

interface FounderDashboardProps {
  onSignOut: () => void;
  onNavigateHome: () => void;
  onNavigateToDigitalJobs?: () => void;
  initialSubpage?: PageType;
  onNavigateSubpage?: (page: PageType) => void;
}

export const FounderDashboard: React.FC<FounderDashboardProps> = ({
  onSignOut,
  onNavigateHome,
  onNavigateToDigitalJobs,
  initialSubpage = 'founder-overview',
  onNavigateSubpage
}) => {
  // Active subpage tab
  const [currentSubpage, setCurrentSubpage] = useState<PageType>(initialSubpage);

  // Synchronize when parent passes subpage
  useEffect(() => {
    if (initialSubpage && initialSubpage !== currentSubpage) {
      setCurrentSubpage(initialSubpage);
    }
  }, [initialSubpage]);

  // Main Dashboard Data State
  const [profile, setProfile] = useState<FounderProfile | null>(null);
  const [allArticles, setAllArticles] = useState<FounderArticle[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [publishedArticles, setPublishedArticles] = useState<FounderArticle[]>([]);
  const [draftArticles, setDraftArticles] = useState<FounderArticle[]>([]);
  const [podcasts, setPodcasts] = useState<FounderPodcast[]>([]);
  const [dailyGoal, setDailyGoal] = useState<FounderDailyGoal | null>(null);
  const [todayTasks, setTodayTasks] = useState<FounderTask[]>([]);
  const [distractions, setDistractions] = useState<FounderDistraction[]>([]);
  const [appointments, setAppointments] = useState<FounderAppointment[]>([]);
  const [objectives, setObjectives] = useState<FounderObjective[]>([]);
  const [keyResults, setKeyResults] = useState<FounderKeyResult[]>([]);
  const [stats, setStats] = useState({
    publishedArticlesCount: 0,
    draftArticlesCount: 0,
    podcastsCount: 0,
    todayProgressPercent: 0,
    completedTasksCount: 0,
    totalTasksCount: 0
  });

  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isPublicProfileOpen, setIsPublicProfileOpen] = useState(false);
  const [isArticleEditorOpen, setIsArticleEditorOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<FounderArticle | null>(null);
  const [readingArticle, setReadingArticle] = useState<FounderArticle | null>(null);
  const [isPodcastModalOpen, setIsPodcastModalOpen] = useState(false);
  const [activeVideoModal, setActiveVideoModal] = useState<FounderPodcast | null>(null);
  const [isAIBreakdownOpen, setIsAIBreakdownOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Load authoritative data from service
  const refreshData = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await getFounderDashboardData();
      setProfile(data.profile);
      setAllArticles(data.allArticles);
      setPublishedArticles(data.publishedArticles);
      setDraftArticles(data.draftArticles);
      setPodcasts(data.podcasts);
      setDailyGoal(data.dailyGoal);
      setTodayTasks(data.todayTasks);
      setDistractions(data.distractions);
      setAppointments(data.appointments);
      setObjectives(data.objectives);
      setKeyResults(data.keyResults);
      setStats(data.stats);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to load your founder workspace.';
      setLoadError(message);
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Navigate handler that also notifies parent route listener
  const handleNavigate = (page: PageType) => {
    if (page === 'home') {
      onNavigateHome();
      return;
    }
    if (page === 'digital-jobs' && onNavigateToDigitalJobs) {
      onNavigateToDigitalJobs();
      return;
    }
    setCurrentSubpage(page);
    if (onNavigateSubpage) {
      onNavigateSubpage(page);
    } else {
      // Direct history push
      const pathMap: Record<string, string> = {
        'founder-overview': '/founders/overview',
        'founder-articles': '/founders/articles',
        'founder-podcasts': '/founders/podcasts',
        'founder-planner': '/founders/planner',
        'founder-distractions': '/founders/distractions',
        'founder-appointments': '/founders/appointments'
      };
      if (pathMap[page]) {
        window.history.pushState(null, '', pathMap[page]);
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Mutations are persisted by the service before local state is updated.
  const handleToggleTask = async (taskId: string) => {
    try {
      const updatedTasks = await toggleTaskCompletion(taskId);
      setTodayTasks(updatedTasks);
      const completed = updatedTasks.filter(task => task.is_completed).length;
      const total = updatedTasks.length;
      setStats(prev => ({
        ...prev,
        todayProgressPercent: total ? Math.round((completed / total) * 100) : 0,
        completedTasksCount: completed,
        totalTasksCount: total
      }));
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not update task.');
    }
  };

  const handleAddTask = async (title: string, priority: 'low' | 'medium' | 'high' | 'urgent', estimatedMinutes: number) => {
    try {
      const updatedTasks = await createFounderTask(title, priority, estimatedMinutes);
      setTodayTasks(updatedTasks);
      const completed = updatedTasks.filter(task => task.is_completed).length;
      const total = updatedTasks.length;
      setStats(prev => ({
        ...prev,
        todayProgressPercent: total ? Math.round((completed / total) * 100) : 0,
        completedTasksCount: completed,
        totalTasksCount: total
      }));
      showToast("Task added to today's planner");
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not add task.');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const updatedTasks = await deleteFounderTask(taskId);
      setTodayTasks(updatedTasks);
      const completed = updatedTasks.filter(task => task.is_completed).length;
      const total = updatedTasks.length;
      setStats(prev => ({
        ...prev,
        todayProgressPercent: total ? Math.round((completed / total) * 100) : 0,
        completedTasksCount: completed,
        totalTasksCount: total
      }));
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not delete task.');
    }
  };

  const handleUpdateDailyGoal = async (title: string, benchmarkPercent: number) => {
    try {
      const updated = await updateDailyGoal(title, benchmarkPercent);
      setDailyGoal(updated);
      showToast('Daily goal updated');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not save daily goal.');
    }
  };

  const handleSaveArticle = async (articleData: Partial<FounderArticle>) => {
    try {
      await saveFounderArticle(articleData);
      await refreshData();
      showToast(articleData.status === 'published' ? 'Article submitted for review' : 'Draft saved');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not save article.');
      throw err;
    }
  };

  const handleDeleteArticle = async (articleId: string) => {
    try {
      await deleteFounderArticle(articleId);
      await refreshData();
      showToast('Article deleted');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not delete article.');
    }
  };

  const handleSavePodcast = async (data: any) => {
    try {
      await saveFounderPodcast(data);
      await refreshData();
      showToast('Podcast session added');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not save podcast.');
      throw err;
    }
  };

  const handleDeletePodcast = async (podcastId: string) => {
    try {
      await deleteFounderPodcast(podcastId);
      await refreshData();
      showToast('Podcast session removed');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not delete podcast.');
    }
  };

  const handleToggleDistraction = async (id: string) => {
    try {
      const updated = await toggleDistractionSelection(id);
      setDistractions(updated);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not update distraction selection.');
    }
  };

  const handleScheduleAppointment = async (data: any) => {
    try {
      await saveFounderAppointment(data);
      await refreshData();
      showToast('Appointment scheduled');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not schedule appointment.');
      throw err;
    }
  };

  const handleUpdateAppointmentStatus = async (id: string, newStatus: any) => {
    try {
      const updated = await updateAppointmentStatus(id, newStatus);
      setAppointments(updated);
      showToast(`Appointment marked as ${newStatus}`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not update appointment.');
    }
  };

  const handleDeleteAppointment = async (id: string) => {
    try {
      const updated = await deleteFounderAppointment(id);
      setAppointments(updated);
      showToast('Appointment record removed');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not delete appointment.');
    }
  };

  const handleSaveProfile = async (updates: Partial<FounderProfile>) => {
    try {
      const updated = await updateFounderProfileData(updates);
      setProfile(updated);
      showToast('Profile updated successfully');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not update profile.');
      throw err;
    }
  };

  // Share helpers
  const handleShareProfile = async () => {
    if (!profile?.slug) { showToast('Add a public profile URL slug before sharing.'); return; }
    try { await navigator.clipboard.writeText(`https://digitalcampux.com/founders/${profile.slug}`); showToast('Public profile link copied to clipboard!'); }
    catch { showToast('Could not copy the profile link.'); }
  };

  const handleShareArticle = async (art: FounderArticle) => {
    if (!profile?.slug || !art.slug || art.status !== 'published') { showToast('Only published articles with a public profile URL can be shared.'); return; }
    try { await navigator.clipboard.writeText(`https://digitalcampux.com/founders/${profile.slug}/articles/${art.slug}`); showToast('Article link copied to clipboard!'); }
    catch { showToast('Could not copy the article link.'); }
  };

  const handleSharePodcast = async (pod: FounderPodcast) => {
    try { await navigator.clipboard.writeText(pod.video_url); showToast('Podcast video link copied to clipboard!'); }
    catch { showToast('Could not copy the podcast link.'); }
  };

  // AI Task Breakdown Apply
  const handleApplyAITasks = async (newTasks: Array<{ title: string; priority: any; estimatedMinutes: number }>) => {
    try {
      for (const task of newTasks) await createFounderTask(task.title, task.priority, task.estimatedMinutes);
      await refreshData();
      showToast(`Added ${newTasks.length} tasks to today's focus`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Some suggested tasks could not be saved.');
      await refreshData();
    }
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#F3F5F3] text-slate-600 text-sm">Loading your founder workspace…</div>;
  }

  if (loadError || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F3F5F3] p-6">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-6 text-center space-y-4">
          <h1 className="text-lg font-bold text-slate-900">Founder workspace unavailable</h1>
          <p className="text-sm text-slate-600">{loadError || 'Your founder profile could not be loaded.'}</p>
          <div className="flex justify-center gap-3">
            <button onClick={refreshData} className="px-4 py-2 rounded-lg bg-emerald-700 text-white text-sm font-semibold">Retry</button>
            <button onClick={async () => {
              try { await logoutFounder(); }
              catch (error) { console.error('Founder sign-out failed:', error); }
              finally { onSignOut(); }
            }} className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-sm font-semibold">Return to sign in</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <FounderDashboardLayout
      currentPage={currentSubpage}
      onNavigate={handleNavigate}
      onSignOut={onSignOut}
      profile={profile}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      onOpenEditProfile={() => setIsEditProfileOpen(true)}
      onOpenPublicProfile={() => setIsPublicProfileOpen(true)}
    >
      {/* GLOBAL TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-2xl border border-slate-700 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* VIEW 1: OVERVIEW (EXACT SCREENSHOT REPLICA) */}
      {(currentSubpage === 'founder-overview' || currentSubpage === 'founder-dashboard') && (
        <FounderOverviewView
          profile={profile}
          publishedArticles={publishedArticles}
          draftArticles={draftArticles}
          podcasts={podcasts}
          dailyGoal={dailyGoal}
          todayTasks={todayTasks}
          distractions={distractions}
          stats={stats}
          onNavigate={handleNavigate}
          onOpenWriteArticle={() => {
            setEditingArticle(null);
            setIsArticleEditorOpen(true);
          }}
          onOpenEditProfile={() => setIsEditProfileOpen(true)}
          onOpenPublicProfile={() => setIsPublicProfileOpen(true)}
          onShareProfile={handleShareProfile}
          onShareArticle={handleShareArticle}
          onSharePodcast={handleSharePodcast}
          onPlayPodcast={(pod) => setActiveVideoModal(pod)}
          onReadArticle={(art) => setReadingArticle(art)}
        />
      )}

      {/* VIEW 2: ARTICLES */}
      {currentSubpage === 'founder-articles' && (
        <FounderArticlesView
          articles={allArticles}
          onOpenWriteArticle={() => {
            setEditingArticle(null);
            setIsArticleEditorOpen(true);
          }}
          onEditArticle={(art) => {
            setEditingArticle(art);
            setIsArticleEditorOpen(true);
          }}
          onDeleteArticle={handleDeleteArticle}
          onReadArticle={(art) => setReadingArticle(art)}
          onShareArticle={handleShareArticle}
        />
      )}

      {/* VIEW 3: PODCASTS */}
      {currentSubpage === 'founder-podcasts' && (
        <FounderPodcastsView
          podcasts={podcasts}
          onOpenAddPodcast={() => setIsPodcastModalOpen(true)}
          onPlayPodcast={(pod) => setActiveVideoModal(pod)}
          onDeletePodcast={handleDeletePodcast}
          onSharePodcast={handleSharePodcast}
        />
      )}

      {/* VIEW 4: PLANNER */}
      {currentSubpage === 'founder-planner' && (
        <FounderPlannerView
          dailyGoal={dailyGoal}
          tasks={todayTasks}
          objectives={objectives}
          keyResults={keyResults}
          onToggleTask={handleToggleTask}
          onAddTask={handleAddTask}
          onDeleteTask={handleDeleteTask}
          onUpdateDailyGoal={handleUpdateDailyGoal}
          onOpenAIBreakdown={() => setIsAIBreakdownOpen(true)}
        />
      )}

      {/* VIEW 5: DISTRACTIONS */}
      {currentSubpage === 'founder-distractions' && (
        <FounderDistractionsView
          distractions={distractions}
          onToggleDistraction={handleToggleDistraction}
        />
      )}

      {/* VIEW 6: APPOINTMENTS */}
      {currentSubpage === 'founder-appointments' && (
        <FounderAppointmentsView
          appointments={appointments}
          onOpenSchedule={() => setIsScheduleModalOpen(true)}
          onUpdateStatus={handleUpdateAppointmentStatus}
          onDeleteAppointment={handleDeleteAppointment}
        />
      )}

      {/* MODALS */}
      <FounderEditProfileModal
        profile={profile}
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        onSave={handleSaveProfile}
      />

      <FounderPublicProfileModal
        profile={profile}
        publishedArticles={publishedArticles}
        podcasts={podcasts}
        isOpen={isPublicProfileOpen}
        onClose={() => setIsPublicProfileOpen(false)}
        onReadArticle={(art) => {
          setIsPublicProfileOpen(false);
          setReadingArticle(art);
        }}
        onPlayPodcast={(pod) => {
          setIsPublicProfileOpen(false);
          setActiveVideoModal(pod)}
        }
      />

      <FounderArticleEditorModal
        isOpen={isArticleEditorOpen}
        onClose={() => {
          setIsArticleEditorOpen(false);
          setEditingArticle(null);
        }}
        onSave={handleSaveArticle}
        initialArticle={editingArticle}
      />

      <FounderArticleReaderModal
        article={readingArticle}
        isOpen={Boolean(readingArticle)}
        onClose={() => setReadingArticle(null)}
        onShare={handleShareArticle}
        authorName={profile.full_name}
      />

      <FounderPodcastModal
        isOpen={isPodcastModalOpen}
        onClose={() => setIsPodcastModalOpen(false)}
        onSave={handleSavePodcast}
      />

      <FounderVideoPlayerModal
        podcast={activeVideoModal}
        isOpen={Boolean(activeVideoModal)}
        onClose={() => setActiveVideoModal(null)}
        onShare={handleSharePodcast}
      />

      <FounderAIBreakdownModal
        isOpen={isAIBreakdownOpen}
        onClose={() => setIsAIBreakdownOpen(false)}
        onApplyTasks={handleApplyAITasks}
      />

      <FounderScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        onSchedule={handleScheduleAppointment}
      />

    </FounderDashboardLayout>
  );
};
