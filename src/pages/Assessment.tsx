import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/integrations/supabase/client';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { QUESTIONS, calculateScores, type AssessmentResult } from '@/lib/assessment-scoring';
import { AssessmentResults } from '@/components/assessment/AssessmentResults';

// ── Contact Form Schema ──────────────────────────────────────
const contactSchema = z.object({
  first_name: z.string().trim().min(1, 'First name is required').max(100),
  last_name: z.string().trim().min(1, 'Last name is required').max(100),
  email: z.string().trim().email('Please enter a valid email').max(255),
  phone: z.string().trim().min(7, 'Please enter a valid phone number').max(20),
});

type ContactForm = z.infer<typeof contactSchema>;

// ── Confetti ───────────────────────────────────────────────────
function launchConfetti(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d')!;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const colors = ['#C5A059', '#1A4D3E', '#FFD700', '#FFFFFF', '#F5E6CC', '#2E8B57'];
  const particles: {
    x: number; y: number; vx: number; vy: number;
    w: number; h: number; color: string; rot: number; vr: number; life: number;
  }[] = [];

  for (let side = 0; side < 2; side++) {
    const originX = side === 0 ? 0 : canvas.width;
    const dirX = side === 0 ? 1 : -1;
    for (let i = 0; i < 120; i++) {
      particles.push({
        x: originX,
        y: canvas.height * 0.3 + Math.random() * canvas.height * 0.4,
        vx: dirX * (3 + Math.random() * 8),
        vy: -(2 + Math.random() * 6),
        w: 6 + Math.random() * 8,
        h: 4 + Math.random() * 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        rot: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 0.3,
        life: 1,
      });
    }
  }

  let frame: number;
  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;
    for (const p of particles) {
      if (p.life <= 0) continue;
      alive = true;
      p.x += p.vx;
      p.vy += 0.15;
      p.y += p.vy;
      p.rot += p.vr;
      p.life -= 0.006;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }
    if (alive) frame = requestAnimationFrame(animate);
  };
  frame = requestAnimationFrame(animate);
  return () => cancelAnimationFrame(frame);
}

// ── Main Component ─────────────────────────────────────────────
const Assessment: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [direction, setDirection] = useState(1);
  const [assessmentResult, setAssessmentResult] = useState<AssessmentResult | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const totalSteps = QUESTIONS.length + 1; // questions + contact form
  const progress = step >= totalSteps ? 100 : Math.round((step / totalSteps) * 100);

  const form = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
    defaultValues: { first_name: '', last_name: '', email: '', phone: '' },
  });

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (step >= QUESTIONS.length) return;
      if (e.key === 'Enter' && answers[QUESTIONS[step].id]) {
        goNext();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [step, answers]);

  // Confetti on results
  useEffect(() => {
    if (step === totalSteps && canvasRef.current) {
      const cleanup = launchConfetti(canvasRef.current);
      return cleanup;
    }
  }, [step]);

  const goNext = useCallback(() => {
    setDirection(1);
    setStep((s) => s + 1);
  }, []);

  const goBack = useCallback(() => {
    setDirection(-1);
    setStep((s) => Math.max(0, s - 1));
  }, []);

  const selectOption = useCallback(
    (questionId: string, option: string) => {
      setAnswers((prev) => ({ ...prev, [questionId]: option }));
      setTimeout(() => {
        setDirection(1);
        setStep((s) => s + 1);
      }, 300);
    },
    []
  );

  const onSubmit = async (data: ContactForm) => {
    setSubmitting(true);
    try {
      // Calculate scores
      const result = calculateScores(answers);
      setAssessmentResult(result);

      // Get UTM parameters
      const urlParams = new URLSearchParams(window.location.search);

      // Insert to database with scores
      const { error } = await supabase.from('assessment_leads').insert({
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone: data.phone,
        // Original 3 answers
        retirement_concern: answers.retirement_concern || null,
        age_range: answers.age_range || null,
        tax_strategy_familiarity: answers.tax_strategy_familiarity || null,
        // New 7 answers
        savings_status: answers.savings_status || null,
        income_range: answers.income_range || null,
        tax_diversification: answers.tax_diversification || null,
        insurance_coverage: answers.insurance_coverage || null,
        market_volatility: answers.market_volatility || null,
        retirement_plan_formality: answers.retirement_plan_formality || null,
        legacy_planning: answers.legacy_planning || null,
        // Scores
        overall_score: result.overallScore,
        score_savings: result.categoryScores.savings,
        score_tax: result.categoryScores.tax,
        score_protection: result.categoryScores.protection,
        score_timeline: result.categoryScores.timeline,
        score_tier: result.tier,
        recommendations: result.recommendations,
        // Metadata
        page_url: window.location.href,
        user_agent: navigator.userAgent,
        language: navigator.language,
        utm_source: urlParams.get('utm_source') || null,
        utm_medium: urlParams.get('utm_medium') || null,
        utm_campaign: urlParams.get('utm_campaign') || null,
      } as any);

      if (error) throw error;

      // Send results email to user (fire and forget)
      supabase.functions
        .invoke('send-assessment-results', {
          body: {
            email: data.email,
            first_name: data.first_name,
            overall_score: result.overallScore,
            category_scores: result.categoryScores,
            tier: result.tier,
            tier_label: result.tierLabel,
            tier_description: result.tierDescription,
            recommendations: result.recommendations,
          },
        })
        .catch((err) => console.error('Assessment email error:', err));

      setFirstName(data.first_name);
      setUserEmail(data.email);
      setDirection(1);
      setStep(totalSteps);
    } catch (err) {
      console.error('Assessment submit error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
  };

  return (
    <div className="fixed inset-0 z-50 bg-[hsl(160_80%_2%)] overflow-y-auto">
      {/* Ambient gradient */}
      <div className="fixed inset-0 pointer-events-none">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px]"
          style={{
            background: 'radial-gradient(circle, hsl(var(--primary) / 0.06) 0%, transparent 70%)',
          }}
        />
      </div>

      {/* Confetti canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-[60]"
      />

      {/* Progress bar */}
      {step < totalSteps && (
        <div className="fixed top-0 left-0 right-0 z-[55] px-6 py-4">
          <Progress value={progress} className="h-1.5 bg-white/10" />
        </div>
      )}

      {/* Back button */}
      {step > 0 && step < totalSteps && (
        <button
          onClick={goBack}
          className="fixed top-6 left-6 z-[55] flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      )}

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-6 py-20">
        <AnimatePresence mode="wait" custom={direction}>
          {/* ── Question slides ── */}
          {step < QUESTIONS.length && (
            <motion.div
              key={`q-${step}`}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-2xl"
            >
              <div className="text-center mb-10">
                <span className="text-primary/70 text-sm font-medium tracking-widest uppercase mb-3 block">
                  Question {step + 1} of {QUESTIONS.length}
                </span>
                <h1 className="text-3xl md:text-4xl font-serif font-bold text-white mb-3">
                  {QUESTIONS[step].question}
                </h1>
                <p className="text-white/50">{QUESTIONS[step].subtitle}</p>
              </div>

              <div className="space-y-3">
                {QUESTIONS[step].options.map((option) => {
                  const isSelected = answers[QUESTIONS[step].id] === option;
                  return (
                    <button
                      key={option}
                      onClick={() => selectOption(QUESTIONS[step].id, option)}
                      className={`w-full text-left px-6 py-4 rounded-2xl border transition-all duration-200 group ${
                        isSelected
                          ? 'bg-primary/20 border-primary/50 text-white'
                          : 'bg-white/[0.04] border-white/10 text-white/80 hover:bg-white/[0.08] hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                            isSelected
                              ? 'border-primary bg-primary'
                              : 'border-white/30 group-hover:border-white/50'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                        </div>
                        <span className="text-base">{option}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* ── Contact form slide ── */}
          {step === QUESTIONS.length && (
            <motion.div
              key="contact"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-lg"
            >
              <div className="text-center mb-10">
                <span className="text-primary/70 text-sm font-medium tracking-widest uppercase mb-3 block">
                  Almost done
                </span>
                <h1 className="text-3xl md:text-4xl font-serif font-bold text-white mb-3">
                  See Your Personalized Results
                </h1>
                <p className="text-white/50">
                  Enter your info to see your Retirement Readiness Score instantly.
                </p>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="first_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white/70">First Name</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="John"
                              className="bg-white/[0.06] border-white/15 text-white placeholder:text-white/30 h-12 rounded-xl focus-visible:ring-primary/50"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="last_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white/70">Last Name</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Doe"
                              className="bg-white/[0.06] border-white/15 text-white placeholder:text-white/30 h-12 rounded-xl focus-visible:ring-primary/50"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white/70">Email</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="email"
                            placeholder="john@example.com"
                            className="bg-white/[0.06] border-white/15 text-white placeholder:text-white/30 h-12 rounded-xl focus-visible:ring-primary/50"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white/70">Phone</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="tel"
                            placeholder="(555) 123-4567"
                            className="bg-white/[0.06] border-white/15 text-white placeholder:text-white/30 h-12 rounded-xl focus-visible:ring-primary/50"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full h-14 rounded-xl bg-primary text-primary-foreground font-semibold text-lg hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                    style={{
                      boxShadow: '0 0 30px hsl(var(--primary) / 0.3)',
                    }}
                  >
                    {submitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Calculating Your Score...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        See My Results
                        <ArrowRight className="w-5 h-5" />
                      </span>
                    )}
                  </button>
                </form>
              </Form>
            </motion.div>
          )}

          {/* ── Results Page ── */}
          {step === totalSteps && assessmentResult && (
            <motion.div
              key="results"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="w-full"
            >
              <AssessmentResults
                firstName={firstName}
                email={userEmail}
                result={assessmentResult}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Assessment;
