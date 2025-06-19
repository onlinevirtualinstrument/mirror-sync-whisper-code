
import { BlogPost } from '../blog';

export const formatScheduledTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleString();
};

export const isScheduledPostReadyToPublish = (post: BlogPost): boolean => {
  return post.status === 'scheduled' && 
         post.scheduledFor && 
         post.scheduledFor <= Date.now();
};

export const shouldShowToUser = (post: BlogPost, isAdmin: boolean): boolean => {
  if (post.status === 'scheduled') {
    return isAdmin || isScheduledPostReadyToPublish(post);
  }
  return post.status === 'published';
};

export const getDisplayStatus = (post: BlogPost): string => {
  if (post.status === 'scheduled' && isScheduledPostReadyToPublish(post)) {
    return 'published';
  }
  return post.status || 'published';
};
