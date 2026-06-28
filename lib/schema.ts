// Schema.org pour BricoMaroc

export function schemaOrganisation() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'BricoMaroc',
    url: 'https://bricomaroc.vercel.app',
    logo: 'https://bricomaroc.vercel.app/icons/icon-192.svg',
    description: 'La plateforme de confiance pour trouver un artisan qualifie au Maroc.',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'MA',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      email: 'contact@bricomaroc.ma',
    },
    sameAs: [
      'https://bricomaroc.vercel.app',
    ],
  }
}

export function schemaWebSite() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'BricoMaroc',
    url: 'https://bricomaroc.vercel.app',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://bricomaroc.vercel.app/artisans?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  }
}

export function schemaArtisan(artisan: any, user: any) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: user?.full_name ?? 'Artisan',
    jobTitle: artisan?.categories?.[0]?.categorie?.nom ?? 'Artisan',
    address: {
      '@type': 'PostalAddress',
      addressLocality: artisan?.ville ?? 'Maroc',
      addressCountry: 'MA',
    },
    aggregateRating: artisan?.nb_avis > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: artisan?.note_moyenne?.toFixed(1),
      reviewCount: artisan?.nb_avis,
      bestRating: '5',
      worstRating: '1',
    } : undefined,
    priceRange: `${artisan?.tarif_min ?? 0}-${artisan?.tarif_max ?? 0} MAD/h`,
  }
}

export function schemaService(service: any, ville?: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: `${service.nom}${ville ? ` a ${ville}` : ' au Maroc'}`,
    description: service.description,
    provider: {
      '@type': 'Organization',
      name: 'BricoMaroc',
      url: 'https://bricomaroc.vercel.app',
    },
    areaServed: ville ?? 'Maroc',
    serviceType: service.categorie,
    offers: {
      '@type': 'Offer',
      priceSpecification: {
        '@type': 'PriceSpecification',
        price: service.tarif,
        priceCurrency: 'MAD',
      },
    },
  }
}

export function schemaFAQ(faqs: { question: string; reponse: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.reponse,
      },
    })),
  }
}

export function schemaBreadcrumb(items: { nom: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.nom,
      item: item.url,
    })),
  }
}