import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface Post {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  created_at: string;
  is_published: boolean;
}

const News = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllPosts();
  }, []);

  const fetchAllPosts = async () => {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    if (data) {
      setPosts(data);
    } else if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
    setLoading(false);
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-20 text-center">Loading news...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center gap-4 mb-12">
          <Button variant="outline" onClick={() => navigate('/')}>
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          <div>
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground">
              School News & Events
            </h1>
            <p className="text-muted-foreground mt-2">All published updates from Africana Muslim Secondary School</p>
          </div>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-20">
            <h2 className="text-2xl font-semibold mb-4">No News Yet</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              No published news articles at the moment. Check back soon for updates!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 mb-12">
            {posts.map((post) => (
              <Card key={post.id} className="hover:shadow-xl transition-all duration-300 cursor-pointer" onClick={() => navigate(`/news/${post.id}`)}>
                {post.image_url && (
                  <div className="h-64 w-full overflow-hidden bg-muted">
                    <img 
                      src={post.image_url} 
                      alt={post.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <CardHeader className="p-6">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                    <Clock className="w-3 h-3" />
                    <time>{new Date(post.created_at).toLocaleDateString()}</time>
                  </div>
                  <CardTitle className="font-serif text-2xl line-clamp-2">
                    {post.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 pt-0 pb-8">
                  <p className="text-muted-foreground leading-relaxed line-clamp-4">
                    {post.content.replace(/<[^>]*>/g, '').slice(0, 200)}...
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default News;

