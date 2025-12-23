// Shared utility for hreflang group management

export const ALL_SUPPORTED_LANGUAGES = ['en', 'de', 'nl', 'fr', 'pl', 'sv', 'da', 'hu', 'fi', 'no'];

export const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  de: 'German',
  nl: 'Dutch',
  fr: 'French',
  pl: 'Polish',
  sv: 'Swedish',
  da: 'Danish',
  hu: 'Hungarian',
  fi: 'Finnish',
  no: 'Norwegian',
};

/**
 * Generate a unique hreflang_group_id for linking translations
 */
export function generateHreflangGroupId(): string {
  return crypto.randomUUID();
}

/**
 * Validate that source language is English (English-first strategy)
 * Returns true if valid, false if not
 */
export function validateEnglishFirstStrategy(sourceLanguage: string): boolean {
  return sourceLanguage === 'en';
}

/**
 * Get warning message for non-English source
 */
export function getEnglishFirstWarning(sourceLanguage: string): string {
  if (sourceLanguage === 'en') return '';
  return `Warning: Source article is in ${LANGUAGE_NAMES[sourceLanguage] || sourceLanguage}. For optimal SEO, English should be the source language for all translations.`;
}

/**
 * Build canonical URL with language prefix
 */
export function buildCanonicalUrl(
  baseUrl: string,
  language: string,
  contentType: 'blog' | 'qa' | 'compare' | 'locations',
  slug: string,
  additionalPath?: string
): string {
  const langPrefix = language === 'en' ? '' : `/${language}`;
  const path = additionalPath ? `/${contentType}/${additionalPath}/${slug}` : `/${contentType}/${slug}`;
  return `${baseUrl}${langPrefix}${path}`;
}

/**
 * Assign hreflang_group_id to multiple records in a table
 */
export async function assignHreflangGroup(
  supabase: any,
  tableName: string,
  groupId: string,
  recordIds: string[]
): Promise<void> {
  if (recordIds.length === 0) return;

  const { error } = await supabase
    .from(tableName)
    .update({ hreflang_group_id: groupId })
    .in('id', recordIds);

  if (error) {
    console.error(`Failed to assign hreflang_group_id to ${tableName}:`, error);
    throw error;
  }

  console.log(`✅ Assigned hreflang_group_id ${groupId} to ${recordIds.length} records in ${tableName}`);
}

/**
 * Link translations between pages by updating the translations JSON field
 */
export async function linkTranslationsByGroup(
  supabase: any,
  tableName: string,
  groupId: string,
  slugField: string = 'slug'
): Promise<void> {
  // Fetch all pages with this hreflang_group_id
  const { data: pages, error } = await supabase
    .from(tableName)
    .select(`id, language, ${slugField}`)
    .eq('hreflang_group_id', groupId);

  if (error) {
    console.error(`Failed to fetch pages for translation linking:`, error);
    throw error;
  }

  if (!pages || pages.length <= 1) {
    console.log(`No translations to link for group ${groupId}`);
    return;
  }

  // Build translations map: language -> slug
  const translationsMap: Record<string, string> = {};
  for (const page of pages) {
    translationsMap[page.language] = page[slugField];
  }

  // Update each page with its sibling translations
  for (const page of pages) {
    const siblings = { ...translationsMap };
    delete siblings[page.language]; // Remove self

    await supabase
      .from(tableName)
      .update({ translations: siblings })
      .eq('id', page.id);
  }

  console.log(`✅ Linked ${pages.length} translations for group ${groupId}`);
}
