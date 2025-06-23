
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Clock, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { BlogPost } from '../blog';
import { formatScheduledTime, getDisplayStatus } from '../utils/blogUtils';
import { motion } from 'framer-motion';

interface BlogCardProps {
  post: BlogPost;
  index: number;
  canEdit: boolean;
  showScheduled: boolean;
  onDelete: (postId: string, isScheduled: boolean) => void;
}

const BlogCard: React.FC<BlogCardProps> = ({ 
  post, 
  index, 
  canEdit, 
  showScheduled, 
  onDelete 
}) => {
  const navigate = useNavigate();
  const displayStatus = getDisplayStatus(post);
  const isScheduled = post.status === 'scheduled';
  const isDraft = post.status === 'draft';

  return (
    <motion.div
      key={post.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="w-full"
    >
      <Card className="hover:shadow-2xl hover:scale-[1.02] transition-all duration-200 bg-gradient-to-br from-[#F1F0FB] via-white to-[#E5DEFF] border-2 border-[#E5DEFF] animate-fade-in h-full flex flex-col">
        <CardHeader className="flex-shrink-0">
          <div className="flex justify-between items-start mb-2">
            <CardTitle className="line-clamp-2 text-[#1A1F2C] flex-1 text-sm sm:text-base">
              {isDraft ? (
                <span className="cursor-default">{post.title}</span>
              ) : (
                <Link to={`/blog/${post.id}`} className="hover:underline story-link">
                  {post.title}
                </Link>
              )}
            </CardTitle>
            <div className="ml-2 flex flex-col items-end gap-1">
              {canEdit && post.status === 'scheduled' && (
                <>
                  <Badge variant="outline" className="flex items-center gap-1 text-orange-600 border-orange-300 text-xs">
                    <Calendar size={10} />
                    Scheduled
                  </Badge>
                  {post.scheduledFor && (
                    <span className="text-xs text-orange-600 font-medium whitespace-nowrap">
                      {formatScheduledTime(post.scheduledFor)}
                    </span>
                  )}
                </>
              )}
              {canEdit && post.status === 'draft' && (
                <Badge variant="outline" className="flex items-center gap-1 text-yellow-600 border-yellow-300 text-xs">
                  <Edit size={10} />
                  Draft
                </Badge>
              )}
            </div>
          </div>
          <CardDescription>
            <div className="flex items-center gap-2">
              {post.authorPhotoURL ? (
                <img
                  src={post.authorPhotoURL}
                  alt={post.authorName}
                  className="w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 border-[#9b87f5]"
                />
              ) : (
                <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#D6BCFA] text-[#7E69AB] flex items-center justify-center text-xs font-bold">
                  {post.authorName?.charAt(0) || '?'}
                </div>
              )}
              <span className="text-[#7E69AB] text-xs sm:text-sm">
                {post.authorName || 'Unknown'}
              </span>
            </div>
          </CardDescription>
        </CardHeader>

        <CardContent className="flex-grow">
          {post.imageUrl && (
            <div className="mb-3 flex justify-center">
              <img
                src={post.imageUrl}
                alt="Thumbnail"
                className="w-full sm:w-[200px] lg:w-[250px] h-[120px] sm:h-[150px] object-cover rounded-lg shadow-md"
              />
            </div>
          )}
          <div
            className="prose max-w-none text-xs sm:text-sm"
            dangerouslySetInnerHTML={{
              __html: post.content.substring(0, 80) + '...',
            }}
          />
        </CardContent>

        <CardFooter className="flex justify-between items-center flex-shrink-0 pt-2">
          <span className="text-xs text-[#9b87f5]">
            {post.createdAt
              ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })
              : 'Unknown date'}
          </span>

          <div className="flex gap-1 sm:gap-2">
            {/* {isDraft && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/blog/edit/${post.id}?isDraft=true`)}
                className="text-[#1EAEDB] hover:text-[#7E69AB] border-[#D6BCFA] hover:bg-[#F3F0FF] text-xs px-2 py-1"
              >
                Continue
              </Button>
            )} */}

            {!showScheduled && !isScheduled && !isDraft && (
              <Button
                variant="outline"
                size="sm"
                asChild
                className="text-[#1EAEDB] hover:text-[#7E69AB] border-[#D6BCFA] hover:bg-[#F3F0FF] text-xs px-2 py-1"
              >
                <Link to={`/blog/${post.id}`}>Read</Link>
              </Button>
            )}

            {canEdit && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/blog/edit/${post.id}${isDraft ? '?isDraft=true' : ''}`)}
                  className="text-[#7E69AB] border-[#D6BCFA] hover:bg-[#F3F0FF] text-xs px-2 py-1"
                >
                  <Edit size={12} />
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onDelete(post.id, showScheduled || isScheduled)}
                  className="text-xs px-2 py-1"
                >
                  <Trash2 size={12} />
                </Button>
              </>
            )}
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default BlogCard;