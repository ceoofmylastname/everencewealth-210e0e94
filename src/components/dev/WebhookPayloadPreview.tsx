import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Copy, Download, FileJson } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export function WebhookPayloadPreview() {
  const [selectedScenario, setSelectedScenario] = useState<string>('emma_completed_homepage_en');
  
  // Sample payloads for each scenario
  const payloads: Record<string, Record<string, unknown>> = {
    // EMMA SCENARIOS
    emma_completed_homepage_en: {
      firstName: "John",
      lastName: "Smith",
      email: "john@example.com",
      phone: "+447700900000",
      country_prefix: "+44",
      
      timeline: "within_6_months",
      buyerProfile: "primary_residence",
      budget: "€500k-€750k",
      areasOfInterest: ["Marbella", "Estepona"],
      propertyType: ["villa"],
      specificNeeds: ["Sea view", "3-4 bedrooms", "primary_residence"],
      
      leadSource: "Emma Chatbot",
      leadSourceDetail: "emma_chat_en",
      emmaConversationStatus: "completed",
      emmaQuestionsAnswered: 3,
      emmaIntakeComplete: true,
      emmaConversationDuration: "4m 32s",
      emmaExitPoint: "completed",
      
      pageType: "homepage",
      language: "en",
      pageUrl: "https://www.delsolprimehomes.com/en",
      pageTitle: "Costa del Sol Luxury Real Estate",
      referrer: "https://www.google.com",
      timestamp: new Date().toISOString(),
      
      leadSegment: "Hot_Primary",
      initialLeadScore: 25
    },
    
    emma_completed_location_nl: {
      firstName: "Jan",
      lastName: "de Vries",
      phone: "+31612345678",
      country_prefix: "+31",
      
      timeline: "within_1_year",
      buyerProfile: "holiday",
      budget: "€400k-€600k",
      areasOfInterest: ["Marbella", "Nueva Andalucía"],
      propertyType: ["apartment"],
      specificNeeds: ["Sea view", "2-3 bedrooms"],
      
      leadSource: "Emma Chatbot",
      leadSourceDetail: "emma_chat_nl",
      emmaConversationStatus: "completed",
      emmaQuestionsAnswered: 3,
      emmaIntakeComplete: true,
      emmaConversationDuration: "5m 12s",
      emmaExitPoint: "completed",
      
      pageType: "location_page",
      language: "nl",
      pageUrl: "https://www.delsolprimehomes.com/nl/locations/marbella",
      pageTitle: "Marbella Vastgoed",
      referrer: "https://www.google.nl",
      timestamp: new Date().toISOString(),
      
      leadSegment: "Warm_Holiday",
      initialLeadScore: 25
    },
    
    emma_timeout_blog_de: {
      firstName: "Klaus",
      lastName: "",
      phone: "+4917012345678",
      
      timeline: "within_6_months",
      buyerProfile: "investment",
      budget: "€700k-€1M",
      areasOfInterest: ["Estepona"],
      propertyType: [],
      specificNeeds: [],
      
      leadSource: "Emma Chatbot",
      leadSourceDetail: "emma_chat_de",
      emmaConversationStatus: "abandoned",
      emmaQuestionsAnswered: 2,
      emmaIntakeComplete: false,
      emmaConversationDuration: "2m 15s",
      emmaExitPoint: "property_criteria_location_timeout",
      
      pageType: "blog_page",
      language: "de",
      pageUrl: "https://www.delsolprimehomes.com/de/blog/investieren-marbella",
      pageTitle: "Investieren in Marbella Immobilien",
      referrer: "https://www.google.de",
      timestamp: new Date().toISOString(),
      
      leadSegment: "Hot_Investor",
      initialLeadScore: 15
    },
    
    // TRADITIONAL FORM SCENARIOS
    form_homepage_en: {
      firstName: "Sarah",
      lastName: "Johnson",
      email: "sarah@example.com",
      phone: "+447700900000",
      message: "Interested in luxury villas",
      
      leadSource: "Website Form",
      leadSourceDetail: "homepage_en",
      pageType: "homepage",
      language: "en",
      pageUrl: "https://www.delsolprimehomes.com/en",
      pageTitle: "Costa del Sol Luxury Real Estate",
      referrer: "https://www.google.com",
      timestamp: new Date().toISOString(),
      initialLeadScore: 20
    },
    
    form_location_nl: {
      firstName: "Pieter",
      lastName: "van der Berg",
      email: "pieter@example.nl",
      phone: "+31612345678",
      message: "Zoek een villa in Marbella",
      
      leadSource: "Website Form",
      leadSourceDetail: "location_page_nl",
      pageType: "location_page",
      language: "nl",
      pageUrl: "https://www.delsolprimehomes.com/nl/locations/marbella",
      pageTitle: "Marbella Vastgoed",
      referrer: "https://www.google.nl",
      timestamp: new Date().toISOString(),
      initialLeadScore: 20
    },
    
    form_blog_fr: {
      firstName: "Marie",
      lastName: "Dubois",
      email: "marie@example.fr",
      phone: "+33612345678",
      message: "Question sur le visa Digital Nomad",
      
      leadSource: "Website Form",
      leadSourceDetail: "blog_page_fr",
      pageType: "blog_page",
      language: "fr",
      pageUrl: "https://www.delsolprimehomes.com/fr/blog/visa-nomade-numerique",
      pageTitle: "Visa Nomade Numérique Espagne",
      referrer: "https://www.google.fr",
      timestamp: new Date().toISOString(),
      initialLeadScore: 20
    },
    
    form_property_es: {
      firstName: "Carlos",
      lastName: "García",
      email: "carlos@example.es",
      phone: "+34612345678",
      message: "Interesado en esta propiedad",
      propertyRef: "R4567890",
      propertyPrice: "€850,000",
      propertyType: "Villa",
      
      leadSource: "Website Form",
      leadSourceDetail: "property_detail_es",
      pageType: "property_detail",
      language: "es",
      pageUrl: "https://www.delsolprimehomes.com/es/properties/R4567890",
      pageTitle: "Villa de Lujo en Marbella",
      referrer: "https://www.google.es",
      timestamp: new Date().toISOString(),
      initialLeadScore: 20
    },
    
    form_brochure_de: {
      firstName: "Hans",
      lastName: "Mueller",
      email: "hans@example.de",
      phone: "+4917012345678",
      message: "Bitte senden Sie mir die Broschüre",
      cityName: "Marbella",
      citySlug: "marbella",
      
      leadSource: "Website Form",
      leadSourceDetail: "brochure_page_de",
      pageType: "brochure_page",
      language: "de",
      pageUrl: "https://www.delsolprimehomes.com/de/brochures/marbella",
      pageTitle: "Marbella Immobilien Broschüre",
      referrer: "https://www.google.de",
      timestamp: new Date().toISOString(),
      initialLeadScore: 20
    },
    
    form_qa_pl: {
      firstName: "Wojciech",
      lastName: "Kowalski",
      email: "wojciech@example.pl",
      phone: "+48123456789",
      message: "Pytanie o podatki w Hiszpanii",
      
      leadSource: "Website Form",
      leadSourceDetail: "qa_page_pl",
      pageType: "qa_page",
      language: "pl",
      pageUrl: "https://www.delsolprimehomes.com/pl/qa/podatki-hiszpania",
      pageTitle: "Podatki w Hiszpanii - FAQ",
      referrer: "https://www.google.pl",
      timestamp: new Date().toISOString(),
      initialLeadScore: 20
    },
    
    form_buyers_guide_sv: {
      firstName: "Erik",
      lastName: "Andersson",
      email: "erik@example.se",
      phone: "+46701234567",
      message: "Vill ha mer information",
      
      leadSource: "Website Form",
      leadSourceDetail: "buyers_guide_sv",
      pageType: "buyers_guide",
      language: "sv",
      pageUrl: "https://www.delsolprimehomes.com/sv/buyers-guide",
      pageTitle: "Köpguide Costa del Sol",
      referrer: "https://www.google.se",
      timestamp: new Date().toISOString(),
      initialLeadScore: 20
    }
  };
  
  const scenarios = [
    { id: 'emma_completed_homepage_en', label: 'Emma Completed - Homepage (EN)', type: 'emma' },
    { id: 'emma_completed_location_nl', label: 'Emma Completed - Location Page (NL)', type: 'emma' },
    { id: 'emma_timeout_blog_de', label: 'Emma 60s Timeout - Blog (DE)', type: 'emma' },
    { id: 'form_homepage_en', label: 'Form - Homepage (EN)', type: 'form' },
    { id: 'form_location_nl', label: 'Form - Location Page (NL)', type: 'form' },
    { id: 'form_blog_fr', label: 'Form - Blog Page (FR)', type: 'form' },
    { id: 'form_property_es', label: 'Form - Property Detail (ES)', type: 'form' },
    { id: 'form_brochure_de', label: 'Form - Brochure Download (DE)', type: 'form' },
    { id: 'form_qa_pl', label: 'Form - QA Page (PL)', type: 'form' },
    { id: 'form_buyers_guide_sv', label: 'Form - Buyers Guide (SV)', type: 'form' }
  ];
  
  const currentPayload = payloads[selectedScenario];
  const currentScenario = scenarios.find(s => s.id === selectedScenario);
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(currentPayload, null, 2));
    toast({
      title: "Copied!",
      description: "Payload copied to clipboard",
    });
  };
  
  const downloadJSON = () => {
    const blob = new Blob([JSON.stringify(currentPayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `webhook-payload-${selectedScenario}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  const downloadAllJSON = () => {
    const blob = new Blob([JSON.stringify(payloads, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'all-webhook-payloads.json';
    a.click();
    URL.revokeObjectURL(url);
  };
  
  return (
    <div className="space-y-6">
      {/* Scenario Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileJson className="h-5 w-5" />
            Select Webhook Scenario
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={selectedScenario} onValueChange={setSelectedScenario}>
            <SelectTrigger>
              <SelectValue placeholder="Select a scenario" />
            </SelectTrigger>
            <SelectContent>
              <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">Emma Chatbot</div>
              {scenarios.filter(s => s.type === 'emma').map(s => (
                <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
              ))}
              <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground mt-2">Traditional Forms</div>
              {scenarios.filter(s => s.type === 'form').map(s => (
                <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <div className="flex gap-2 flex-wrap">
            <Badge variant={currentScenario?.type === 'emma' ? 'default' : 'secondary'}>
              {currentScenario?.type === 'emma' ? '🤖 Emma Chatbot' : '📝 Website Form'}
            </Badge>
            <Badge variant="outline">
              {currentPayload.pageType as string}
            </Badge>
            <Badge variant="outline">
              {(currentPayload.language as string).toUpperCase()}
            </Badge>
            {currentPayload.leadSegment && (
              <Badge className="bg-primary/20 text-primary">
                {currentPayload.leadSegment as string}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Action Buttons */}
      <div className="flex gap-2 flex-wrap">
        <Button onClick={copyToClipboard} variant="outline">
          <Copy className="h-4 w-4 mr-2" />
          Copy JSON
        </Button>
        <Button onClick={downloadJSON} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Download This
        </Button>
        <Button onClick={downloadAllJSON} variant="secondary">
          <Download className="h-4 w-4 mr-2" />
          Download All Scenarios
        </Button>
      </div>
      
      {/* Payload Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Webhook Payload</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-lg overflow-auto max-h-[500px] text-sm font-mono">
            {JSON.stringify(currentPayload, null, 2)}
          </pre>
        </CardContent>
      </Card>
      
      {/* Key Fields Reference */}
      <Card>
        <CardHeader>
          <CardTitle>Key Fields for GHL Mapping</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 text-sm">
            <div className="flex items-start gap-2">
              <code className="bg-muted px-2 py-0.5 rounded font-mono text-primary">leadSource</code>
              <span className="text-muted-foreground">- "Emma Chatbot" or "Website Form"</span>
            </div>
            <div className="flex items-start gap-2">
              <code className="bg-muted px-2 py-0.5 rounded font-mono text-primary">leadSourceDetail</code>
              <span className="text-muted-foreground">- Format: "{'{source}_{language}'}" (e.g., "emma_chat_nl", "blog_page_fr")</span>
            </div>
            <div className="flex items-start gap-2">
              <code className="bg-muted px-2 py-0.5 rounded font-mono text-primary">pageType</code>
              <span className="text-muted-foreground">- Where submission originated (homepage, blog_page, property_detail, etc.)</span>
            </div>
            <div className="flex items-start gap-2">
              <code className="bg-muted px-2 py-0.5 rounded font-mono text-primary">language</code>
              <span className="text-muted-foreground">- 2-letter language code (en, nl, de, fr, etc.)</span>
            </div>
            <div className="flex items-start gap-2">
              <code className="bg-muted px-2 py-0.5 rounded font-mono text-primary">leadSegment</code>
              <span className="text-muted-foreground">- (Emma only) Calculated segment like "Hot_Primary", "Warm_Investor"</span>
            </div>
            <div className="flex items-start gap-2">
              <code className="bg-muted px-2 py-0.5 rounded font-mono text-primary">timeline</code>
              <span className="text-muted-foreground">- (Emma only) Buyer timeline: "within_6_months", "within_1_year", etc.</span>
            </div>
            <div className="flex items-start gap-2">
              <code className="bg-muted px-2 py-0.5 rounded font-mono text-primary">buyerProfile</code>
              <span className="text-muted-foreground">- (Emma only) Buyer type: "primary_residence", "holiday", "investment"</span>
            </div>
            <div className="flex items-start gap-2">
              <code className="bg-muted px-2 py-0.5 rounded font-mono text-primary">initialLeadScore</code>
              <span className="text-muted-foreground">- Numeric score: 25 (Emma complete), 20 (Form), 15 (Emma abandoned)</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
