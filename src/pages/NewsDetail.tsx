import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Clock, Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Post {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  created_at: string;
  is_published: boolean;
}

const NewsDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchPost(id);
    }
  }, [id]);

  const fetchPost = async (postId: string) => {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', postId)
      .eq('is_published', true)
      .single();

    if (data) {
      setPost(data);
    } else if (error) {
      toast({ title: "Error", description: "Post not found", variant: "destructive" });
      navigate('/news');
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p>Loading post...</p>
      </div>
    );
  }

  if (!post) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-12">
          <Button variant="outline" onClick={() => navigate('/news')}>
            <ChevronLeft className="w-4 h-4 mr-2" />
            All News
          </Button>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <time>{new Date(post.created_at).toLocaleDateString()}</time>
          </div>
        </div>

        {/* Main Image */}
        {post.image_url && (
          <div className="mb-12 rounded-xl overflow-hidden shadow-lg">
            <img 
              src={post.image_url} 
              alt={post.title}
              className="w-full h-96 object-cover"
            />
          </div>
        )}

        {/* Title */}
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-8 leading-tight">
          {post.title}
        </h1>

        {/* Content */}
        <div 
          className="prose prose-headings:font-serif prose-headings:font-bold prose-p:leading-relaxed prose-a:text-primary max-w-none mb-12"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row gap-4 pt-12 border-t border-border">
          <Button variant="outline" className="flex-1" onClick={() => navigate('/news')}>
            ← Back to News
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Share2 className="w-4 h-4" />
            Share
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NewsDetail;

