// Shared utility for hreflang group management

export const ALL_SUPPORTED_LANGUAGES = ['en', 'es'];

export const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  es: 'Spanish',
};

export function generateHreflangGroupId(): string {
  return crypto.randomUUID();
}

export function validateEnglishFirstStrategy(sourceLanguage: string): boolean {
  return sourceLanguage === 'en';
}

export function getEnglishFirstWarning(sourceLanguage: string): string {
  if (sourceLanguage === 'en') return '';
  return `Warning: Source article is in ${LANGUAGE_NAMES[sourceLanguage] || sourceLanguage}. For optimal SEO, English should be the source language for all translations.`;
}

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

export async function linkTranslationsByGroup(
  supabase: any,
  tableName: string,
  groupId: string,
  slugField: string = 'slug'
): Promise<void> {
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

  const translationsMap: Record<string, string> = {};
  for (const page of pages) {
    translationsMap[page.language] = page[slugField];
  }

  for (const page of pages) {
    const siblings = { ...translationsMap };
    delete siblings[page.language];

    await supabase
      .from(tableName)
      .update({ translations: siblings })
      .eq('id', page.id);
  }

  console.log(`✅ Linked ${pages.length} translations for group ${groupId}`);
}
