
import { 
  collection, 
  query, 
  getDocs, 
  updateDoc,
  doc
} from 'firebase/firestore';
import { db } from '@/utils/auth/firebase';

const blogsCollection = collection(db, 'blogs');

// Auto-publish scheduled posts that are ready
export const checkAndPublishScheduledPosts = async (): Promise<void> => {
  try {
    const currentTime = Date.now();
    
    // Get all posts and filter client-side to avoid index issues
    const q = query(blogsCollection);
    const snapshot = await getDocs(q);
    
    const scheduledPosts = snapshot.docs.filter(docSnap => {
      const data = docSnap.data();
      return data.status === 'scheduled' && 
             data.scheduledFor && 
             data.scheduledFor <= currentTime;
    });
    
    if (scheduledPosts.length > 0) {
      console.log(`Found ${scheduledPosts.length} scheduled posts ready to publish`);
      
      for (const postDoc of scheduledPosts) {
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
  private isRunning = false;

  start() {
    if (this.isRunning) {
      console.log('Scheduled post service already running');
      return;
    }

    console.log('Starting scheduled post service');
    this.isRunning = true;
    
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
      this.isRunning = false;
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