import { supabase } from '@/integrations/supabase/client';

export interface TranscriptMessage {
  role: 'assistant' | 'user';
  content: string;
  timestamp: string;
}

export interface EmmaLeadData {
  conversation_id: string;
  // Contact Info
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  country_prefix?: string;
  // Q&A Phase (up to 10 pairs)
  question_1?: string;
  answer_1?: string;
  question_2?: string;
  answer_2?: string;
  question_3?: string;
  answer_3?: string;
  question_4?: string;
  answer_4?: string;
  question_5?: string;
  answer_5?: string;
  question_6?: string;
  answer_6?: string;
  question_7?: string;
  answer_7?: string;
  question_8?: string;
  answer_8?: string;
  question_9?: string;
  answer_9?: string;
  question_10?: string;
  answer_10?: string;
  questions_answered?: number;
  // Financial Criteria
  retirement_timeline?: string;
  risk_tolerance?: string;
  budget_range?: string;
  coverage_amount?: string;
  product_interest?: string[];
  goal?: string;
  timeframe?: string;
  // Legacy fields (kept for DB compatibility)
  location_preference?: string[];
  sea_view_importance?: string;
  bedrooms_desired?: string;
  property_type?: string[];
  property_purpose?: string;
  // System Data
  detected_language?: string;
  intake_complete?: boolean;
  declined_selection?: boolean;
  conversation_status?: string;
  exit_point?: string;
  // Webhook tracking
  webhook_sent?: boolean;
  webhook_payload?: any;
  // NEW: Complete conversation transcript
  conversation_transcript?: TranscriptMessage[];
}

// Extract financial criteria from conversation history
export const extractFinancialCriteriaFromHistory = (messages: Array<{ role: string; content: string }>): Partial<EmmaLeadData> => {
  const criteria: Partial<EmmaLeadData> = {};
  
  // Risk tolerance patterns
  const riskPatterns = [
    { pattern: /conservative|protect what i have|safe|low risk/i, value: 'conservative' },
    { pattern: /moderate|balanced|middle ground/i, value: 'moderate' },
    { pattern: /aggressive|maximize growth|high growth/i, value: 'aggressive' }
  ];
  
  // Budget patterns (annual premium)
  const budgetPatterns = [
    { pattern: /under \$?5[,.]?000|less than 5k|under 5k/i, value: 'Under $5K/year' },
    { pattern: /\$?5[,.]?000.*\$?15[,.]?000|5k.*15k/i, value: '$5K-$15K/year' },
    { pattern: /\$?15[,.]?000.*\$?50[,.]?000|15k.*50k/i, value: '$15K-$50K/year' },
    { pattern: /\$?50[,.]?000\+?|over 50k|50k\+/i, value: '$50K+/year' }
  ];
  
  // Product interest patterns
  const productPatterns = [
    { pattern: /whole life/i, value: 'whole_life' },
    { pattern: /term life/i, value: 'term_life' },
    { pattern: /annuit/i, value: 'annuities' },
    { pattern: /ira|401k|rollover/i, value: 'ira_401k' },
    { pattern: /estate planning/i, value: 'estate_planning' }
  ];
  
  // Goal patterns
  const goalPatterns = [
    { pattern: /retirement income|retire/i, value: 'retirement_income' },
    { pattern: /family protection|protect my family/i, value: 'family_protection' },
    { pattern: /tax optim|tax strateg|reduce tax/i, value: 'tax_optimization' },
    { pattern: /wealth transfer|legacy|inheritance/i, value: 'wealth_transfer' },
    { pattern: /combination|both|all of/i, value: 'combination' }
  ];
  
  // Timeframe patterns
  const timeframePatterns = [
    { pattern: /immediately|right now|ready now|asap/i, value: 'immediately' },
    { pattern: /within 3 months|next 3 months/i, value: 'within_3_months' },
    { pattern: /within 6 months|next 6 months/i, value: 'within_6_months' },
    { pattern: /within 1 year|within a year|next year/i, value: 'within_1_year' },
    { pattern: /just exploring|no rush|not sure/i, value: 'just_exploring' }
  ];
  
  // Scan messages for criteria
  for (const msg of messages) {
    if (msg.role !== 'user') continue;
    const content = msg.content.toLowerCase();
    
    // Extract risk tolerance
    if (!criteria.risk_tolerance) {
      for (const pattern of riskPatterns) {
        if (pattern.pattern.test(content)) {
          criteria.risk_tolerance = pattern.value;
          break;
        }
      }
    }
    
    // Extract budget
    if (!criteria.budget_range) {
      for (const pattern of budgetPatterns) {
        if (pattern.pattern.test(content)) {
          criteria.budget_range = pattern.value;
          break;
        }
      }
    }
    
    // Extract product interests
    const foundProducts: string[] = [];
    for (const pattern of productPatterns) {
      if (pattern.pattern.test(content) && !foundProducts.includes(pattern.value)) {
        foundProducts.push(pattern.value);
      }
    }
    if (foundProducts.length > 0 && !criteria.product_interest) {
      criteria.product_interest = foundProducts;
    }
    
    // Extract goal
    if (!criteria.goal) {
      for (const pattern of goalPatterns) {
        if (pattern.pattern.test(content)) {
          criteria.goal = pattern.value;
          break;
        }
      }
    }
    
    // Extract timeframe
    if (!criteria.timeframe) {
      for (const pattern of timeframePatterns) {
        if (pattern.pattern.test(content)) {
          criteria.timeframe = pattern.value;
          break;
        }
      }
    }
  }
  
  return criteria;
};

// Upsert lead data to emma_leads table (progressive save)
export const upsertEmmaLead = async (data: Partial<EmmaLeadData> & { conversation_id: string }): Promise<boolean> => {
  try {
    // Prepare the data for upsert
    const leadData: Record<string, any> = {
      conversation_id: data.conversation_id,
      updated_at: new Date().toISOString()
    };
    
    // Only add fields that have values
    if (data.first_name) leadData.first_name = data.first_name;
    if (data.last_name) leadData.last_name = data.last_name;
    if (data.phone_number) leadData.phone_number = data.phone_number;
    if (data.country_prefix) leadData.country_prefix = data.country_prefix;
    // Q&A pairs 1-10
    if (data.question_1) leadData.question_1 = data.question_1;
    if (data.answer_1) leadData.answer_1 = data.answer_1;
    if (data.question_2) leadData.question_2 = data.question_2;
    if (data.answer_2) leadData.answer_2 = data.answer_2;
    if (data.question_3) leadData.question_3 = data.question_3;
    if (data.answer_3) leadData.answer_3 = data.answer_3;
    if (data.question_4) leadData.question_4 = data.question_4;
    if (data.answer_4) leadData.answer_4 = data.answer_4;
    if (data.question_5) leadData.question_5 = data.question_5;
    if (data.answer_5) leadData.answer_5 = data.answer_5;
    if (data.question_6) leadData.question_6 = data.question_6;
    if (data.answer_6) leadData.answer_6 = data.answer_6;
    if (data.question_7) leadData.question_7 = data.question_7;
    if (data.answer_7) leadData.answer_7 = data.answer_7;
    if (data.question_8) leadData.question_8 = data.question_8;
    if (data.answer_8) leadData.answer_8 = data.answer_8;
    if (data.question_9) leadData.question_9 = data.question_9;
    if (data.answer_9) leadData.answer_9 = data.answer_9;
    if (data.question_10) leadData.question_10 = data.question_10;
    if (data.answer_10) leadData.answer_10 = data.answer_10;
    if (data.questions_answered !== undefined) leadData.questions_answered = data.questions_answered;
    // Property criteria
    if (data.location_preference) leadData.location_preference = data.location_preference;
    if (data.sea_view_importance) leadData.sea_view_importance = data.sea_view_importance;
    if (data.budget_range) leadData.budget_range = data.budget_range;
    if (data.bedrooms_desired) leadData.bedrooms_desired = data.bedrooms_desired;
    if (data.property_type) leadData.property_type = data.property_type;
    if (data.property_purpose) leadData.property_purpose = data.property_purpose;
    if (data.timeframe) leadData.timeframe = data.timeframe;
    // System data
    if (data.detected_language) leadData.detected_language = data.detected_language;
    if (data.intake_complete !== undefined) leadData.intake_complete = data.intake_complete;
    if (data.declined_selection !== undefined) leadData.declined_selection = data.declined_selection;
    if (data.conversation_status) leadData.conversation_status = data.conversation_status;
    if (data.exit_point) leadData.exit_point = data.exit_point;
    if (data.webhook_sent !== undefined) leadData.webhook_sent = data.webhook_sent;
    if (data.webhook_payload) leadData.webhook_payload = data.webhook_payload;

    console.log('📊 PROGRESSIVE SAVE: Upserting lead data:', JSON.stringify(leadData, null, 2));

    const { error } = await supabase
      .from('emma_leads' as any)
      .upsert(leadData, { onConflict: 'conversation_id' });

    if (error) {
      console.error('❌ PROGRESSIVE SAVE: Failed to upsert lead:', error);
      console.error('❌ PROGRESSIVE SAVE: Error code:', error.code);
      console.error('❌ PROGRESSIVE SAVE: Error message:', error.message);
      console.error('❌ PROGRESSIVE SAVE: Error details:', error.details);
      console.error('❌ PROGRESSIVE SAVE: Data that failed:', JSON.stringify(leadData, null, 2));
      
      // Retry once after 1 second
      console.log('🔄 PROGRESSIVE SAVE: Retrying in 1 second...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const { error: retryError } = await supabase
        .from('emma_leads' as any)
        .upsert(leadData, { onConflict: 'conversation_id' });
      
      if (retryError) {
        console.error('❌ PROGRESSIVE SAVE: Retry also failed:', retryError);
        return false;
      }
      console.log('✅ PROGRESSIVE SAVE: Retry succeeded');
      return true;
    }

    console.log('✅ PROGRESSIVE SAVE: Lead data saved successfully');
    return true;
  } catch (error) {
    console.error('❌ PROGRESSIVE SAVE: Exception:', error);
    return false;
  }
};

// Update webhook status after sending
export const updateWebhookStatus = async (
  conversationId: string,
  success: boolean,
  payload?: any,
  errorMessage?: string
): Promise<void> => {
  try {
    const updateData: Record<string, any> = {
      webhook_attempts: supabase.rpc ? 1 : 1, // Will increment in edge function
      updated_at: new Date().toISOString()
    };

    if (success) {
      updateData.webhook_sent = true;
      updateData.webhook_sent_at = new Date().toISOString();
    } else {
      updateData.webhook_last_error = errorMessage || 'Unknown error';
    }

    if (payload) {
      updateData.webhook_payload = payload;
    }

    await supabase
      .from('emma_leads' as any)
      .update(updateData)
      .eq('conversation_id', conversationId);

    console.log(`📊 WEBHOOK STATUS: Updated for ${conversationId}, success=${success}`);
  } catch (error) {
    console.error('❌ WEBHOOK STATUS: Failed to update:', error);
  }
};
