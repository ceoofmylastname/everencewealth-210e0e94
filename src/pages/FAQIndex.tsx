import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Header } from '@/components/home/Header';
import { Footer } from '@/components/home/Footer';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, ChevronRight } from 'lucide-react';

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'de', name: 'German' },
  { code: 'nl', name: 'Dutch' },
  { code: 'fr', name: 'French' },
  { code: 'pl', name: 'Polish' },
  { code: 'sv', name: 'Swedish' },
  { code: 'da', name: 'Danish' },
  { code: 'hu', name: 'Hungarian' },
  { code: 'fi', name: 'Finnish' },
  { code: 'no', name: 'Norwegian' },
];

export default function FAQIndex() {
  const [searchTerm, setSearchTerm] = useState('');
  const [languageFilter, setLanguageFilter] = useState<string>('all');

  const { data: faqPages = [], isLoading } = useQuery({
    queryKey: ['published-faq-pages', languageFilter],
    queryFn: async () => {
      let query = supabase
        .from('faq_pages')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (languageFilter !== 'all') {
        query = query.eq('language', languageFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  const filteredFaqs = faqPages.filter((faq: any) =>
    faq.question_main.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stripHtml = (html: string) => html.replace(/<[^>]*>/g, '');

  return (
    <>
      <Helmet>
        <title>Frequently Asked Questions | Del Sol Prime Homes</title>
        <meta
          name="description"
          content="Find answers to common questions about buying property in Costa del Sol, Spain. Expert advice on real estate, legal processes, and lifestyle."
        />
        <link rel="canonical" href="https://www.delsolprimehomes.com/faq" />
      </Helmet>

      <Header variant="solid" />

      <main className="min-h-screen bg-background pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Expert answers to your questions about Costa del Sol real estate, property buying, and lifestyle.
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8 max-w-2xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={languageFilter} onValueChange={setLanguageFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Languages</SelectItem>
                {LANGUAGES.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* FAQ Cards Grid */}
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="h-48 w-full" />
                  <CardContent className="p-5">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full mb-1" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredFaqs.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground">No FAQ pages found.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFaqs.map((faq: any) => (
                <Link key={faq.id} to={`/faq/${faq.slug}`}>
                  <Card className="overflow-hidden h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
                    {faq.featured_image_url && (
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={faq.featured_image_url}
                          alt={faq.featured_image_alt || faq.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3 left-3 flex gap-2">
                          <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm">
                            {faq.language.toUpperCase()}
                          </Badge>
                          <Badge
                            variant={faq.faq_type === 'core' ? 'default' : 'outline'}
                            className="bg-white/90 backdrop-blur-sm text-foreground"
                          >
                            {faq.faq_type === 'core' ? 'Guide' : 'Tips'}
                          </Badge>
                        </div>
                      </div>
                    )}
                    <CardContent className="p-5">
                      <h2 className="font-display font-semibold text-lg text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                        {faq.question_main}
                      </h2>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {stripHtml(faq.answer_main).substring(0, 150)}...
                      </p>
                      <div className="flex items-center text-primary text-sm font-medium mt-4">
                        Read Answer
                        <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
