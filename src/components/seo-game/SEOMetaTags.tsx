import { useEffect } from 'react';

export function SEOMetaTags() {
  useEffect(() => {
    // 1. Update Title
    const originalTitle = document.title;
    document.title = 'Learn SEO Playing The SEO Game | DSP Academy';

    // 2. Helper to set or create meta tag
    const setMetaTag = (attrName: string, attrVal: string, content: string) => {
      let meta = document.querySelector(`meta[${attrName}="${attrVal}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attrName, attrVal);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // 3. Helper to set or create canonical link
    const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://digitalcampux.com';
    const canonicalUrl = `${currentOrigin}/The-SEO-Game`;
    
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonicalUrl);

    // 4. Meta Description
    setMetaTag(
      'name',
      'description',
      'Learn SEO by playing a realistic SEO strategy game. Build websites, target keywords, create content, compete in SERPs, survive algorithm updates and master modern SEO.'
    );

    // 5. Open Graph Meta Tags
    setMetaTag('property', 'og:type', 'website');
    setMetaTag('property', 'og:title', 'Learn SEO Playing THE SEO GAME | DSP Academy');
    setMetaTag(
      'property',
      'og:description',
      'Build. Optimize. Rank. Compete. Learn SEO by actually doing it.'
    );
    setMetaTag('property', 'og:url', canonicalUrl);
    setMetaTag('property', 'og:site_name', 'DSP Academy - The SEO Game');

    // 6. Twitter Card Meta Tags
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', 'Learn SEO Playing THE SEO GAME | DSP Academy');
    setMetaTag(
      'name',
      'twitter:description',
      'Build. Optimize. Rank. Compete. Learn SEO by actually doing it.'
    );

    // 7. Structured Data (JSON-LD)
    const scriptId = 'seo-game-structured-data';
    let scriptTag = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = scriptId;
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }

    const structuredData = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebPage',
          '@id': `${canonicalUrl}#webpage`,
          'url': canonicalUrl,
          'name': 'Learn SEO Playing The SEO Game | DSP Academy',
          'description': 'Learn SEO by playing a realistic SEO strategy game. Build websites, target keywords, create content, compete in SERPs, survive algorithm updates and master modern SEO.',
          'breadcrumb': {
            '@type': 'BreadcrumbList',
            'itemListElement': [
              {
                '@type': 'ListItem',
                'position': 1,
                'name': 'Home',
                'item': currentOrigin
              },
              {
                '@type': 'ListItem',
                'position': 2,
                'name': 'The SEO Game',
                'item': canonicalUrl
              }
            ]
          }
        },
        {
          '@type': 'EducationalOccupationalProgram',
          '@id': `${canonicalUrl}#program`,
          'name': 'THE SEO GAME - Practical Search Engine Optimization Simulator',
          'description': 'Interactive business strategy and simulation game teaching technical SEO, content strategy, keyword research, link architecture, and AI search optimization.',
          'provider': {
            '@type': 'Organization',
            'name': 'DSP Academy',
            'url': currentOrigin
          },
          'educationalCredentialAwarded': 'DSP Verified SEO Practitioner Accreditation',
          'hasCourse': [
            {
              '@type': 'Course',
              'name': 'Interactive SEO Strategy & SERP Simulation Game',
              'description': 'Real-world experiential simulation covering on-page optimization, SERP competition, algorithm update recovery, and Generative Engine Optimization (GEO).'
            }
          ]
        },
        {
          '@type': 'Organization',
          '@id': `${currentOrigin}#organization`,
          'name': 'DSP Academy',
          'url': currentOrigin
        }
      ]
    };

    scriptTag.text = JSON.stringify(structuredData);

    return () => {
      document.title = originalTitle;
      const scriptToRemove = document.getElementById(scriptId);
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, []);

  return null;
}
