import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Header } from '@/components/home/Header';
import { Footer } from '@/components/home/Footer';
import { CSHero } from '@/components/client-stories/CSHero';
import { CSFeaturedStory } from '@/components/client-stories/CSFeaturedStory';
import { CSStoriesGrid } from '@/components/client-stories/CSStoriesGrid';
import { CSStats } from '@/components/client-stories/CSStats';
import { CSCTA } from '@/components/client-stories/CSCTA';
import BlogEmmaChat from '@/components/blog-article/BlogEmmaChat';

const ClientStories = () => {
  const { lang = 'en' } = useParams<{ lang: string }>();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-2 md:mx-4 lg:mx-6 space-y-4 md:space-y-6 py-4 md:py-6">
        <div className="rounded-3xl overflow-hidden"><CSHero /></div>
        <div className="rounded-3xl overflow-hidden"><CSFeaturedStory /></div>
        <div className="rounded-3xl overflow-hidden"><CSStoriesGrid /></div>
        <div className="rounded-3xl overflow-hidden"><CSStats /></div>
        <div className="rounded-3xl overflow-hidden"><CSCTA /></div>
      </main>
      <Footer />
      <BlogEmmaChat language={lang} />
    </div>
  );
};

export default ClientStories;
