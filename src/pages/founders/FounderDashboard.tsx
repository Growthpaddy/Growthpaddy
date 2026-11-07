import React, { useState, useEffect, useCallback } from 'react';
import { FounderProfile, logoutFounder, getCachedFounderProfile } from '../../lib/founderAuth';
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
  addCustomDistraction,
  saveFounderAppointment,
  updateAppointmentStatus,
  updateFounderProfileData,
  DEFAULT_EZEJI_PROFILE
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
  const [profile, setProfile] = useState<FounderProfile>(DEFAULT_EZEJI_PROFILE);
  const [publishedArticles, setPublishedArticles] = useState<FounderArticle[]>([]);
  const [draftArticles, setDraftArticles] = useState<FounderArticle[]>([]);
  const [podcasts, setPodcasts] = useState<FounderPodcast[]>([]);
  const [dailyGoal, setDailyGoal] = useState<FounderDailyGoal>({
    id: 'goal_init',
    goal_date: new Date().toISOString().split('T')[0],
    title: 'Make progress on content, partnerships and product development.',
    benchmark_percent: 80
  });
  const [todayTasks, setTodayTasks] = useState<FounderTask[]>([]);
  const [distractions, setDistractions] = useState<FounderDistraction[]>([]);
  const [appointments, setAppointments] = useState<FounderAppointment[]>([]);
  const [objectives, setObjectives] = useState<FounderObjective[]>([]);
  const [keyResults, setKeyResults] = useState<FounderKeyResult[]>([]);
  const [stats, setStats] = useState({
    publishedArticlesCount: 8,
    draftArticlesCount: 3,
    podcastsCount: 4,
    todayProgressPercent: 72,
    completedTasksCount: 4,
    totalTasksCount: 6
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
    try {
      const data = await getFounderDashboardData();
      setProfile(data.profile);
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
      console.warn('Dashboard data fetch notification:', err);
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

  // Task Actions
  const handleToggleTask = async (taskId: string) => {
    const updatedTasks = await toggleTaskCompletion(taskId);
    setTodayTasks(updatedTasks);
    // Recalculate stats live
    const total = updatedTasks.length;
    const completed = updatedTasks.filter(t => t.is_completed).length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    setStats(prev => ({
      ...prev,
      todayProgressPercent: percent,
      completedTasksCount: completed,
      totalTasksCount: total
    }));
  };

  const handleAddTask = async (title: string, priority: 'low' | 'medium' | 'high' | 'urgent', estimatedMinutes: number) => {
    const updatedTasks = await createFounderTask(title, priority, estimatedMinutes);
    setTodayTasks(updatedTasks);
    const total = updatedTasks.length;
    const completed = updatedTasks.filter(t => t.is_completed).length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    setStats(prev => ({
      ...prev,
      todayProgressPercent: percent,
      completedTasksCount: completed,
      totalTasksCount: total
    }));
    showToast('Task added to today\'s planner');
  };

  const handleDeleteTask = async (taskId: string) => {
    const updatedTasks = await deleteFounderTask(taskId);
    setTodayTasks(updatedTasks);
    const total = updatedTasks.length;
    const completed = updatedTasks.filter(t => t.is_completed).length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    setStats(prev => ({
      ...prev,
      todayProgressPercent: percent,
      completedTasksCount: completed,
      totalTasksCount: total
    }));
  };

  // Daily Goal Update
  const handleUpdateDailyGoal = async (title: string, benchmarkPercent: number) => {
    const updated = await updateDailyGoal(title, benchmarkPercent);
    setDailyGoal(updated);
    showToast('Daily goal updated');
  };

  // Article Actions
  const handleSaveArticle = async (articleData: Partial<FounderArticle>) => {
    await saveFounderArticle(articleData);
    await refreshData();
    showToast(articleData.status === 'published' ? 'Article published successfully' : 'Draft saved');
  };

  const handleDeleteArticle = async (articleId: string) => {
    await deleteFounderArticle(articleId);
    await refreshData();
    showToast('Article deleted');
  };

  // Podcast Actions
  const handleSavePodcast = async (data: any) => {
    await saveFounderPodcast(data);
    await refreshData();
    showToast('Podcast session added');
  };

  const handleDeletePodcast = async (podcastId: string) => {
    await deleteFounderPodcast(podcastId);
    await refreshData();
    showToast('Podcast session removed');
  };

  // Distraction Actions
  const handleToggleDistraction = async (id: string) => {
    const updated = await toggleDistractionSelection(id);
    setDistractions(updated);
  };

  const handleAddCustomDistraction = async (name: string, category: any, icon: string) => {
    const updated = await addCustomDistraction(name, category, icon);
    setDistractions(updated);
    showToast('Custom distraction added');
  };

  // Appointment Actions
  const handleScheduleAppointment = async (data: any) => {
    await saveFounderAppointment(data);
    await refreshData();
    showToast('Appointment scheduled');
  };

  const handleUpdateAppointmentStatus = async (id: string, newStatus: any) => {
    const updated = await updateAppointmentStatus(id, newStatus);
    setAppointments(updated);
    showToast(`Appointment marked as ${newStatus}`);
  };

  const handleDeleteAppointment = async (id: string) => {
    // Local filter and sync
    setAppointments(prev => prev.filter(a => a.id !== id));
    showToast('Appointment record removed');
  };

  // Profile Save
  const handleSaveProfile = async (updates: Partial<FounderProfile>) => {
    const updated = await updateFounderProfileData(updates);
    setProfile(updated);
    showToast('Profile updated successfully');
  };

  // Share helpers
  const handleShareProfile = () => {
    const url = `https://digitalcampux.com/founders/${profile.slug || 'ezeji-patrick'}`;
    navigator.clipboard.writeText(url);
    showToast('Public profile link copied to clipboard!');
  };

  const handleShareArticle = (art: FounderArticle) => {
    const url = `https://digitalcampux.com/founders/${profile.slug || 'ezeji-patrick'}/articles/${art.slug}`;
    navigator.clipboard.writeText(url);
    showToast('Article link copied to clipboard!');
  };

  const handleSharePodcast = (pod: FounderPodcast) => {
    navigator.clipboard.writeText(pod.video_url);
    showToast('Podcast video link copied to clipboard!');
  };

  // AI Task Breakdown Apply
  const handleApplyAITasks = async (newTasks: Array<{ title: string; priority: any; estimatedMinutes: number }>) => {
    for (const t of newTasks) {
      await createFounderTask(t.title, t.priority, t.estimatedMinutes);
    }
    await refreshData();
    showToast(`Added ${newTasks.length} tasks to today's focus`);
  };

  const allArticlesCombined = [...publishedArticles, ...draftArticles];

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
          articles={allArticlesCombined}
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
          onAddCustomDistraction={handleAddCustomDistraction}
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
