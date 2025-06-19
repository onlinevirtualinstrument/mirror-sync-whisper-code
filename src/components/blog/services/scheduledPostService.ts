
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  updateDoc 
} from 'firebase/firestore';
import { db } from '@/utils/auth/firebase';

const blogsCollection = collection(db, 'blogs');

// Auto-publish scheduled posts that are ready
export const checkAndPublishScheduledPosts = async (): Promise<void> => {
  try {
    const currentTime = Date.now();
    const q = query(
      blogsCollection,
      where('status', '==', 'scheduled'),
      where('scheduledFor', '<=', currentTime)
    );
    
    const snapshot = await getDocs(q);
    const postsToPublish = snapshot.docs;
    
    if (postsToPublish.length > 0) {
      console.log(`Found ${postsToPublish.length} scheduled posts ready to publish`);
      
      for (const postDoc of postsToPublish) {
        try {
          await updateDoc(postDoc.ref, {
            status: 'published',
            updatedAt: Date.now(),
            publishedAt: Date.now(),
            // Remove scheduledFor to clean up the data
            scheduledFor: null
          });
          console.log(`Published scheduled post: ${postDoc.id}`);
        } catch (error) {
          console.error(`Error publishing post ${postDoc.id}:`, error);
        }
      }
    }
  } catch (error) {
    console.error('Error checking scheduled posts:', error);
  }
};

class ScheduledPostService {
  private intervalId: NodeJS.Timeout | null = null;
  private readonly CHECK_INTERVAL = 60000; // Check every minute

  start() {
    if (this.intervalId) {
      console.log('Scheduled post service already running');
      return;
    }

    console.log('Starting scheduled post service');
    this.intervalId = setInterval(async () => {
      try {
        await checkAndPublishScheduledPosts();
      } catch (error) {
        console.error('Error in scheduled post check:', error);
      }
    }, this.CHECK_INTERVAL);

    // Run initial check
    this.checkScheduledPosts();
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('Scheduled post service stopped');
    }
  }

  private async checkScheduledPosts() {
    try {
      await checkAndPublishScheduledPosts();
    } catch (error) {
      console.error('Error checking scheduled posts:', error);
    }
  }
}

export const scheduledPostService = new ScheduledPostService();