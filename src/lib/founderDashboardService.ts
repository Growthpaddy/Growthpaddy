import { supabase } from './supabaseClient';
import { FounderProfile, getAuthenticatedFounderProfile, normalizeUrl } from './founderAuth';
import type {
  FounderArticle,
  FounderPodcast,
  FounderTask,
  FounderDailyGoal,
  FounderDistraction,
  FounderAppointment,
  FounderObjective,
  FounderKeyResult
} from '../types';

type DashboardStats = {
  publishedArticlesCount: number;
  draftArticlesCount: number;
  podcastsCount: number;
  todayProgressPercent: number;
  completedTasksCount: number;
  totalTasksCount: number;
};

export interface FounderDashboardData {
  profile: FounderProfile;
  allArticles: FounderArticle[];
  publishedArticles: FounderArticle[];
  draftArticles: FounderArticle[];
  podcasts: FounderPodcast[];
  dailyGoal: FounderDailyGoal | null;
  todayTasks: FounderTask[];
  distractions: FounderDistraction[];
  appointments: FounderAppointment[];
  objectives: FounderObjective[];
  keyResults: FounderKeyResult[];
  stats: DashboardStats;
}

function localDateString(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function throwDatabaseError(operation: string, error: { message?: string; code?: string } | null): void {
  if (!error) return;
  const code = error.code ? ` (${error.code})` : '';
  throw new Error(`${operation} failed${code}: ${error.message || 'Unknown database error'}`);
}

async function getTodayTasks(founderId: string, today = localDateString()): Promise<FounderTask[]> {
  const { data, error } = await supabase
    .from('founder_tasks')
    .select('*')
    .eq('founder_id', founderId)
    .eq('task_date', today)
    .order('order_index', { ascending: true });
  throwDatabaseError('Loading daily tasks', error);
  return (data || []) as FounderTask[];
}

async function getFounderAppointments(founderId: string): Promise<FounderAppointment[]> {
  const { data, error } = await supabase
    .from('founder_appointments')
    .select('*')
    .eq('founder_id', founderId)
    .order('start_time', { ascending: true });
  throwDatabaseError('Loading appointments', error);
  return (data || []) as FounderAppointment[];
}

async function getFounderDistractions(founderId: string, today = localDateString()): Promise<FounderDistraction[]> {
  const [catalogResult, selectionResult] = await Promise.all([
    supabase.from('founder_distraction_catalog').select('*').order('category').order('name'),
    supabase
      .from('founder_distraction_selections')
      .select('id,catalog_id,is_active_today')
      .eq('founder_id', founderId)
      .eq('selection_date', today)
  ]);

  throwDatabaseError('Loading distraction catalogue', catalogResult.error);
  throwDatabaseError('Loading your distraction selections', selectionResult.error);

  const selectedByCatalogId = new Map<string, boolean>();
  for (const selection of selectionResult.data || []) {
    if (selection.catalog_id) selectedByCatalogId.set(selection.catalog_id, Boolean(selection.is_active_today));
  }

  return (catalogResult.data || []).map((item: any) => ({
    id: item.id,
    name: item.name,
    category: item.category,
    icon: item.icon,
    description: item.description || undefined,
    is_active_today: selectedByCatalogId.get(item.id) || false
  })) as FounderDistraction[];
}

/** Every dashboard read is from Supabase and scoped to the verified Auth user. */
export async function getFounderDashboardData(): Promise<FounderDashboardData> {
  const profile = await getAuthenticatedFounderProfile({ requireApproved: true });
  const founderId = profile.id;
  const today = localDateString();

  const [
    articlesResult,
    podcastsResult,
    goalResult,
    tasks,
    distractions,
    appointments,
    objectivesResult,
    keyResultsResult
  ] = await Promise.all([
    supabase.from('founder_articles').select('*').eq('founder_id', founderId).order('created_at', { ascending: false }),
    supabase.from('founder_podcasts').select('*').eq('founder_id', founderId).order('recorded_at', { ascending: false }),
    supabase.from('founder_daily_goals').select('*').eq('founder_id', founderId).eq('goal_date', today).maybeSingle(),
    getTodayTasks(founderId, today),
    getFounderDistractions(founderId, today),
    getFounderAppointments(founderId),
    supabase.from('founder_objectives').select('*').eq('founder_id', founderId).order('created_at', { ascending: false }),
    supabase.from('founder_key_results').select('*').eq('founder_id', founderId).order('created_at', { ascending: true })
  ]);

  throwDatabaseError('Loading founder articles', articlesResult.error);
  throwDatabaseError('Loading founder podcasts', podcastsResult.error);
  throwDatabaseError('Loading daily goal', goalResult.error);
  throwDatabaseError('Loading monthly objectives', objectivesResult.error);
  throwDatabaseError('Loading key results', keyResultsResult.error);

  const allArticles = (articlesResult.data || []) as FounderArticle[];
  const publishedArticles = allArticles.filter(article => article.status === 'published');
  const draftArticles = allArticles.filter(article => article.status === 'draft');
  const completedTasksCount = tasks.filter(task => task.is_completed).length;
  const totalTasksCount = tasks.length;

  return {
    profile,
    allArticles,
    publishedArticles,
    draftArticles,
    podcasts: (podcastsResult.data || []) as FounderPodcast[],
    dailyGoal: (goalResult.data || null) as FounderDailyGoal | null,
    todayTasks: tasks,
    distractions,
    appointments,
    objectives: (objectivesResult.data || []) as FounderObjective[],
    keyResults: (keyResultsResult.data || []) as FounderKeyResult[],
    stats: {
      publishedArticlesCount: publishedArticles.length,
      draftArticlesCount: allArticles.filter(article => article.status === 'draft').length,
      podcastsCount: (podcastsResult.data || []).length,
      todayProgressPercent: totalTasksCount ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0,
      completedTasksCount,
      totalTasksCount
    }
  };
}

export async function toggleTaskCompletion(taskId: string): Promise<FounderTask[]> {
  const profile = await getAuthenticatedFounderProfile();
  const { data: task, error: taskError } = await supabase
    .from('founder_tasks')
    .select('id,is_completed')
    .eq('id', taskId)
    .eq('founder_id', profile.id)
    .single();
  throwDatabaseError('Verifying task ownership', taskError);
  if (!task) throw new Error('Task not found or access denied.');

  const isCompleted = !task.is_completed;
  const { data, error } = await supabase
    .from('founder_tasks')
    .update({ is_completed: isCompleted, completed_at: isCompleted ? new Date().toISOString() : null })
    .eq('id', taskId)
    .eq('founder_id', profile.id)
    .select('id');
  throwDatabaseError('Updating task', error);
  if (!data?.length) throw new Error('Task was not updated. It may have been removed or access was denied.');
  return getTodayTasks(profile.id);
}

export async function createFounderTask(
  title: string,
  priority: 'low' | 'medium' | 'high' | 'urgent',
  estimatedMinutes = 30
): Promise<FounderTask[]> {
  const profile = await getAuthenticatedFounderProfile();
  const cleanTitle = title.trim();
  if (!cleanTitle) throw new Error('Task title is required.');
  if (!Number.isInteger(estimatedMinutes) || estimatedMinutes < 1 || estimatedMinutes > 1440) {
    throw new Error('Estimated time must be between 1 and 1440 minutes.');
  }

  const currentTasks = await getTodayTasks(profile.id);
  const { error } = await supabase.from('founder_tasks').insert({
    founder_id: profile.id,
    task_date: localDateString(),
    title: cleanTitle,
    priority,
    estimated_minutes: estimatedMinutes,
    is_completed: false,
    order_index: currentTasks.length + 1
  });
  throwDatabaseError('Creating task', error);
  return getTodayTasks(profile.id);
}

export async function deleteFounderTask(taskId: string): Promise<FounderTask[]> {
  const profile = await getAuthenticatedFounderProfile();
  const { data, error } = await supabase
    .from('founder_tasks')
    .delete()
    .eq('id', taskId)
    .eq('founder_id', profile.id)
    .select('id');
  throwDatabaseError('Deleting task', error);
  if (!data?.length) throw new Error('Task not found or access denied.');
  return getTodayTasks(profile.id);
}

export async function updateDailyGoal(title: string, benchmarkPercent = 80): Promise<FounderDailyGoal> {
  const profile = await getAuthenticatedFounderProfile();
  const cleanTitle = title.trim();
  if (!cleanTitle) throw new Error('Daily goal title is required.');
  if (!Number.isInteger(benchmarkPercent) || benchmarkPercent < 0 || benchmarkPercent > 100) {
    throw new Error('Daily benchmark must be between 0 and 100.');
  }

  const { data, error } = await supabase
    .from('founder_daily_goals')
    .upsert({
      founder_id: profile.id,
      goal_date: localDateString(),
      title: cleanTitle,
      benchmark_percent: benchmarkPercent
    }, { onConflict: 'founder_id,goal_date' })
    .select('*')
    .single();
  throwDatabaseError('Saving daily goal', error);
  if (!data) throw new Error('Daily goal was not returned by the database.');
  return data as FounderDailyGoal;
}

function makeSlug(value: string): string {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export async function saveFounderArticle(article: Partial<FounderArticle>): Promise<FounderArticle> {
  const profile = await getAuthenticatedFounderProfile();
  const title = article.title?.trim() || '';
  const content = article.content?.trim() || '';
  if (!title) throw new Error('Article title is required.');
  if (!content) throw new Error('Article content is required.');

  let existing: FounderArticle | null = null;
  if (article.id) {
    const { data, error } = await supabase
      .from('founder_articles')
      .select('*')
      .eq('id', article.id)
      .eq('founder_id', profile.id)
      .maybeSingle();
    throwDatabaseError('Verifying article ownership', error);
    if (!data) throw new Error('Article not found or access denied.');
    existing = data as FounderArticle;
  }

  const requestedStatus = article.status || existing?.status || 'draft';
  const estimatedReadingTime = Math.max(1, Math.ceil((content.match(/\S+/g) || []).length / 200));
  const suppliedReadingTime = Number(article.reading_time_minutes);
  const readingTime = Number.isInteger(suppliedReadingTime) && suppliedReadingTime >= 1 ? suppliedReadingTime : estimatedReadingTime;
  // Founder-submitted articles enter review; only an administrator should publish a new submission.
  const status = requestedStatus === 'published' ? 'pending_review' : requestedStatus;
  const payload: Record<string, unknown> = {
    founder_id: profile.id,
    title,
    slug: makeSlug(article.slug?.trim() || title),
    excerpt: article.excerpt?.trim() || null,
    content,
    cover_image_url: article.cover_image_url?.trim() || null,
    reading_time_minutes: readingTime,
    status,
    published_at: null,
    updated_at: new Date().toISOString()
  };

  if (existing) {
    const { data, error } = await supabase
      .from('founder_articles')
      .update(payload)
      .eq('id', existing.id)
      .eq('founder_id', profile.id)
      .select('*')
      .single();
    throwDatabaseError('Updating article', error);
    if (!data) throw new Error('Article update returned no record.');
    return data as FounderArticle;
  }

  const { data, error } = await supabase
    .from('founder_articles')
    .insert(payload)
    .select('*')
    .single();
  throwDatabaseError('Creating article', error);
  if (!data) throw new Error('Article creation returned no record.');
  return data as FounderArticle;
}

export async function deleteFounderArticle(articleId: string): Promise<void> {
  const profile = await getAuthenticatedFounderProfile();
  const { data, error } = await supabase
    .from('founder_articles')
    .delete()
    .eq('id', articleId)
    .eq('founder_id', profile.id)
    .select('id');
  throwDatabaseError('Deleting article', error);
  if (!data?.length) throw new Error('Article not found or access denied.');
}

function getVideoEmbedUrl(videoUrl: string): { embedUrl: string; thumbnailUrl: string | null } {
  const youtubeMatch = videoUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  if (youtubeMatch?.[1]) {
    return {
      embedUrl: `https://www.youtube.com/embed/${youtubeMatch[1]}`,
      thumbnailUrl: `https://img.youtube.com/vi/${youtubeMatch[1]}/hqdefault.jpg`
    };
  }
  const vimeoMatch = videoUrl.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeoMatch?.[1]) {
    return { embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`, thumbnailUrl: null };
  }
  return { embedUrl: videoUrl, thumbnailUrl: null };
}

export async function saveFounderPodcast(data: {
  title: string;
  channel_name: string;
  video_url: string;
  duration_display?: string;
  thumbnail_url?: string;
  recorded_at?: string;
}): Promise<FounderPodcast> {
  const profile = await getAuthenticatedFounderProfile();
  const title = data.title.trim();
  const videoUrl = data.video_url.trim();
  const channelName = data.channel_name.trim();
  if (!title || !channelName || !videoUrl) throw new Error('Podcast title, channel/show name and video URL are required.');
  let parsedUrl: URL;
  try { parsedUrl = new URL(videoUrl); } catch { throw new Error('Enter a valid YouTube or Vimeo URL.'); }
  if (!['youtube.com', 'www.youtube.com', 'youtu.be', 'vimeo.com', 'www.vimeo.com'].includes(parsedUrl.hostname.toLowerCase())) {
    throw new Error('Only YouTube and Vimeo video URLs are supported.');
  }

  const video = getVideoEmbedUrl(videoUrl);
  const payload: Record<string, unknown> = {
    founder_id: profile.id,
    title,
    channel_name: channelName,
    video_url: videoUrl,
    embed_url: video.embedUrl,
    recorded_at: data.recorded_at || null,
    thumbnail_url: data.thumbnail_url?.trim() || video.thumbnailUrl
  };
  if (data.duration_display?.trim()) payload.duration_display = data.duration_display.trim();

  const { data: saved, error } = await supabase
    .from('founder_podcasts')
    .insert(payload)
    .select('*')
    .single();
  throwDatabaseError('Saving podcast', error);
  if (!saved) throw new Error('Podcast was not returned by the database.');
  return saved as FounderPodcast;
}

export async function deleteFounderPodcast(podcastId: string): Promise<void> {
  const profile = await getAuthenticatedFounderProfile();
  const { data, error } = await supabase
    .from('founder_podcasts')
    .delete()
    .eq('id', podcastId)
    .eq('founder_id', profile.id)
    .select('id');
  throwDatabaseError('Deleting podcast', error);
  if (!data?.length) throw new Error('Podcast not found or access denied.');
}

export async function toggleDistractionSelection(distractionCatalogId: string): Promise<FounderDistraction[]> {
  const profile = await getAuthenticatedFounderProfile();
  const today = localDateString();
  const { data: catalogItem, error: catalogError } = await supabase
    .from('founder_distraction_catalog')
    .select('id')
    .eq('id', distractionCatalogId)
    .maybeSingle();
  throwDatabaseError('Verifying distraction', catalogError);
  if (!catalogItem) throw new Error('Distraction option not found.');

  const { data: existing, error: selectionError } = await supabase
    .from('founder_distraction_selections')
    .select('id,is_active_today')
    .eq('founder_id', profile.id)
    .eq('catalog_id', distractionCatalogId)
    .eq('selection_date', today)
    .limit(1)
    .maybeSingle();
  throwDatabaseError('Checking distraction selection', selectionError);

  if (existing) {
    const { error } = await supabase
      .from('founder_distraction_selections')
      .update({ is_active_today: !existing.is_active_today })
      .eq('id', existing.id)
      .eq('founder_id', profile.id);
    throwDatabaseError('Updating distraction selection', error);
  } else {
    const { error } = await supabase.from('founder_distraction_selections').insert({
      founder_id: profile.id,
      catalog_id: distractionCatalogId,
      is_active_today: true,
      selection_date: today
    });
    throwDatabaseError('Saving distraction selection', error);
  }

  return getFounderDistractions(profile.id, today);
}

export async function saveFounderAppointment(data: {
  title: string;
  attendee_name: string;
  attendee_email?: string;
  start_time: string;
  end_time?: string;
  meeting_url?: string;
  notes?: string;
}): Promise<FounderAppointment> {
  const profile = await getAuthenticatedFounderProfile();
  const title = data.title.trim();
  const attendeeName = data.attendee_name.trim();
  if (!title || !attendeeName || !data.start_time) throw new Error('Appointment title, attendee and start time are required.');
  const payload = {
    founder_id: profile.id,
    title,
    attendee_name: attendeeName,
    attendee_email: data.attendee_email?.trim() || null,
    start_time: data.start_time,
    end_time: data.end_time || null,
    meeting_url: data.meeting_url?.trim() || null,
    status: 'upcoming',
    notes: data.notes?.trim() || null
  };
  const { data: saved, error } = await supabase
    .from('founder_appointments')
    .insert(payload)
    .select('*')
    .single();
  throwDatabaseError('Scheduling appointment', error);
  if (!saved) throw new Error('Appointment was not returned by the database.');
  return saved as FounderAppointment;
}

export async function updateAppointmentStatus(
  appointmentId: string,
  status: 'upcoming' | 'completed' | 'cancelled'
): Promise<FounderAppointment[]> {
  const profile = await getAuthenticatedFounderProfile();
  const { data, error } = await supabase
    .from('founder_appointments')
    .update({ status })
    .eq('id', appointmentId)
    .eq('founder_id', profile.id)
    .select('id');
  throwDatabaseError('Updating appointment status', error);
  if (!data?.length) throw new Error('Appointment not found or access denied.');
  return getFounderAppointments(profile.id);
}

export async function deleteFounderAppointment(appointmentId: string): Promise<FounderAppointment[]> {
  const profile = await getAuthenticatedFounderProfile();
  const { data, error } = await supabase
    .from('founder_appointments')
    .delete()
    .eq('id', appointmentId)
    .eq('founder_id', profile.id)
    .select('id');
  throwDatabaseError('Deleting appointment', error);
  if (!data?.length) throw new Error('Appointment not found or access denied.');
  return getFounderAppointments(profile.id);
}

export async function updateFounderProfileData(updates: Partial<FounderProfile>): Promise<FounderProfile> {
  const profile = await getAuthenticatedFounderProfile();
  const editableFields: Record<string, unknown> = {};
  if (updates.full_name !== undefined) editableFields.full_name = updates.full_name.trim();
  if (updates.headline !== undefined) editableFields.headline = updates.headline?.trim() || null;
  if (updates.bio !== undefined) editableFields.bio = updates.bio?.trim() || null;
  if (updates.avatar_url !== undefined) editableFields.avatar_url = updates.avatar_url?.trim() || null;
  if (updates.slug !== undefined) editableFields.slug = updates.slug?.trim() || null;
  if (updates.location !== undefined) editableFields.location = updates.location?.trim() || null;
  if (updates.linkedin_url !== undefined) editableFields.linkedin_url = normalizeUrl(updates.linkedin_url);
  if (updates.twitter_url !== undefined) editableFields.twitter_url = normalizeUrl(updates.twitter_url);
  if (updates.business_name !== undefined) editableFields.business_name = updates.business_name?.trim() || null;
  if (updates.website !== undefined) editableFields.website = normalizeUrl(updates.website);

  if (!Object.keys(editableFields).length) return profile;

  const { data, error } = await supabase
    .from('founder_profiles')
    .update(editableFields)
    .eq('id', profile.id)
    .select('*')
    .single();
  throwDatabaseError('Updating founder profile', error);
  if (!data) throw new Error('Profile update returned no record.');
  return data as FounderProfile;
}
