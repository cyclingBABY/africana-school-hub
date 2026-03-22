import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock } from 'lucide-react';

interface Post {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  created_at: string;
  is_published: boolean;
}

const NewsSection = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPublishedPosts();
  }, []);

  const fetchPublishedPosts = async () => {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .limit(6);

    if (data) {
      setPosts(data);
    }
    setLoading(false);
  };

  if (loading) {
    return <div className="py-20 text-center">Loading news...</div>;
  }

  return (
    <section id="news" className="py-20 bg-gradient-to-b from-background to-muted">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-6">
            Latest News & Events
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Stay updated with the latest happenings at Africana Muslim Secondary School
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">No news posts yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Card key={post.id} className="group hover:shadow-xl transition-all duration-300 overflow-hidden h-full">
                {post.image_url && (
                  <div className="h-48 w-full overflow-hidden bg-muted">
                    <img 
                      src={post.image_url} 
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                )}
                <CardHeader className="p-6">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                    <Clock className="w-3 h-3" />
                    <time>{new Date(post.created_at).toLocaleDateString()}</time>
                  </div>
                  <CardTitle className="font-serif text-xl line-clamp-2 group-hover:text-primary transition-colors">
                    {post.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 pt-0 pb-8">
                  <p className="text-muted-foreground line-clamp-3 mb-6 leading-relaxed">
                    {post.content.slice(0, 150)}...
                  </p>
                  <Button variant="outline" className="w-full" onClick={() => navigate(`/news/${post.id}`)}>
                    Read More
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        <div className="text-center mt-16">
          <Button size="lg" onClick={() => navigate("/news")}>
            View All News
          </Button>
        </div>
      </div>
    </section>
  );
};

export default NewsSection;

