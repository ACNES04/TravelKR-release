export interface AttractionFeedbackComment {
  id: string;
  author: string;
  email: string;
  message: string;
  createdAt: string;
}

export interface AttractionFeedback {
  likes: number;
  likedBy: string[];
  comments: AttractionFeedbackComment[];
  title?: string;
}

const STORAGE_KEY = 'travelkr_attraction_feedback';

function isClient() {
  return typeof window !== 'undefined';
}

function readFeedback(): Record<string, AttractionFeedback> {
  if (!isClient()) return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, AttractionFeedback>) : {};
  } catch {
    return {};
  }
}

function writeFeedback(data: Record<string, AttractionFeedback>) {
  if (!isClient()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getFeedback(contentId: string, title?: string) {
  const feedback = readFeedback()[contentId];
  if (feedback) return feedback;
  return { likes: 0, likedBy: [], comments: [], title };
}

export function getAllFeedback() {
  return readFeedback();
}

export function hasLiked(contentId: string, userEmail: string) {
  const feedback = readFeedback()[contentId];
  return feedback?.likedBy?.includes(userEmail.trim().toLowerCase()) ?? false;
}

export function toggleLike(contentId: string, userEmail: string, title?: string) {
  if (!isClient()) return { likes: 0, likedBy: [], comments: [] };
  const email = userEmail.trim().toLowerCase();
  if (!email) throw new Error('로그인이 필요합니다.');

  const feedback = readFeedback();
  const current = feedback[contentId] || { likes: 0, likedBy: [], comments: [], title };
  const liked = current.likedBy.includes(email);

  if (liked) {
    current.likedBy = current.likedBy.filter((item) => item !== email);
  } else {
    current.likedBy.push(email);
  }
  current.likes = current.likedBy.length;
  if (title) current.title = title;
  feedback[contentId] = current;
  writeFeedback(feedback);

  return current;
}

export function addComment(contentId: string, author: string, email: string, message: string, title?: string) {
  if (!isClient()) return { likes: 0, likedBy: [], comments: [] };
  const userEmail = email.trim().toLowerCase();
  if (!userEmail) throw new Error('로그인이 필요합니다.');
  if (!message.trim()) throw new Error('댓글 내용을 입력해주세요.');

  const feedback = readFeedback();
  const current = feedback[contentId] || { likes: 0, likedBy: [], comments: [], title };
  const comment = {
    id: `${contentId}-${Date.now()}`,
    author: author.trim() || '익명',
    email: userEmail,
    message: message.trim(),
    createdAt: new Date().toISOString(),
  };
  current.comments = [comment, ...(current.comments || [])];
  if (title) current.title = title;
  feedback[contentId] = current;
  writeFeedback(feedback);

  return current;
}

export function getTopLikedAttractions(limit = 5) {
  const feedback = readFeedback();
  return Object.entries(feedback)
    .filter(([, item]) => item.likes > 0)
    .sort(([, a], [, b]) => b.likes - a.likes)
    .slice(0, limit)
    .map(([contentId, item]) => ({
      id: contentId,
      title: item.title || '좋아요 많은 장소',
      likes: item.likes,
      comments: item.comments.length,
    }));
}
