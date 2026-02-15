import { Helmet } from "react-helmet";
import { getRetargetingTranslations } from "@/lib/retargetingTranslations";
import { retargetingRoutes } from "@/lib/retargetingRoutes";

interface RetargetingMetaProps {
  language: string;
}

const localeMap: Record<string, string> = {
  en: "en_US",
  es: "es_ES",
};

export const RetargetingMeta = ({ language }: RetargetingMetaProps) => {
  const t = getRetargetingTranslations(language);
  const baseUrl = "https://www.everencewealth.com";
  const route = retargetingRoutes.find((r) => r.lang === language);
  const pageUrl = route ? `${baseUrl}${route.path}` : `${baseUrl}/en/welcome-back`;
  const locale = localeMap[language] || "en_US";
  const ogImage = `${baseUrl}/images/retargeting-og.jpg`;

  return (
    <Helmet>
      <title>{t.metaTitle}</title>
      <meta name="description" content={t.metaDescription} />
      <meta name="robots" content="index, follow" />
      <meta property="og:title" content={t.metaTitle} />
      <meta property="og:description" content={t.metaDescription} />
      <meta property="og:url" content={pageUrl} />
      <meta property="og:type" content="website" />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content={locale} />
      <meta property="og:site_name" content="Everence Wealth" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={t.metaTitle} />
      <meta name="twitter:description" content={t.metaDescription} />
      <meta name="twitter:image" content={ogImage} />
      <html lang={language} />
    </Helmet>
  );
};
