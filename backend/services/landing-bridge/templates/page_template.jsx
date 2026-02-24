import React from 'react';

/**
 * Generated Landing Page Component
 * Brand: {{BRAND_NAME}}
 * 
 * This component uses Tailwind CSS for styling.
 * Theme tokens and copy tokens are injected during generation.
 */

export default function LandingPage() {
  const copyTokens = {
    heroEyebrow: "{{COPY_TOKENS.heroEyebrow}}",
    heroTitleSuffix: "{{COPY_TOKENS.heroTitleSuffix}}",
    heroDescription: "{{COPY_TOKENS.heroDescription}}",
    heroPrimaryCta: "{{COPY_TOKENS.heroPrimaryCta}}",
    heroSecondaryCta: "{{COPY_TOKENS.heroSecondaryCta}}",
    catalogEyebrow: "{{COPY_TOKENS.catalogEyebrow}}",
    catalogHeading: "{{COPY_TOKENS.catalogHeading}}",
    featuresEyebrow: "{{COPY_TOKENS.featuresEyebrow}}",
    featuresHeading: "{{COPY_TOKENS.featuresHeading}}",
    features: {{COPY_TOKENS.features}},
    statsEyebrow: "{{COPY_TOKENS.statsEyebrow}}",
    stats: {{COPY_TOKENS.stats}},
    testimonialsEyebrow: "{{COPY_TOKENS.testimonialsEyebrow}}",
    testimonialsHeading: "{{COPY_TOKENS.testimonialsHeading}}",
    testimonials: {{COPY_TOKENS.testimonials}},
    faqEyebrow: "{{COPY_TOKENS.faqEyebrow}}",
    faqHeading: "{{COPY_TOKENS.faqHeading}}",
    faqs: {{COPY_TOKENS.faqs}},
    newsletterEyebrow: "{{COPY_TOKENS.newsletterEyebrow}}",
    newsletterHeading: "{{COPY_TOKENS.newsletterHeading}}",
    newsletterBody: "{{COPY_TOKENS.newsletterBody}}",
    trustTiles: {{COPY_TOKENS.trustTiles}},
    benefits: {{COPY_TOKENS.benefits}},
  };

  const themeTokens = {
    colors: {
      backgroundTop: "{{THEME_TOKENS.colors.backgroundTop}}",
      backgroundBottom: "{{THEME_TOKENS.colors.backgroundBottom}}",
      surface: "{{THEME_TOKENS.colors.surface}}",
      surfaceMuted: "{{THEME_TOKENS.colors.surfaceMuted}}",
      text: "{{THEME_TOKENS.colors.text}}",
      textMuted: "{{THEME_TOKENS.colors.textMuted}}",
      border: "{{THEME_TOKENS.colors.border}}",
      primary: "{{THEME_TOKENS.colors.primary}}",
      primaryHover: "{{THEME_TOKENS.colors.primaryHover}}",
      accent: "{{THEME_TOKENS.colors.accent}}",
      darkSurface: "{{THEME_TOKENS.colors.darkSurface}}",
      darkCard: "{{THEME_TOKENS.colors.darkCard}}",
      darkText: "{{THEME_TOKENS.colors.darkText}}",
    },
    effects: {
      cardShadow: "{{THEME_TOKENS.effects.cardShadow}}",
      heroShadow: "{{THEME_TOKENS.effects.heroShadow}}",
    }
  };

  return (
    <div 
      className="min-h-screen"
      style={{
        background: `linear-gradient(135deg, ${themeTokens.colors.backgroundTop} 0%, ${themeTokens.colors.backgroundBottom} 100%)`,
        color: themeTokens.colors.text,
      }}
    >
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-6 py-24 lg:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <p 
              className="text-sm font-semibold uppercase tracking-wide mb-4"
              style={{ color: themeTokens.colors.accent }}
            >
              {copyTokens.heroEyebrow}
            </p>
            
            <h1 
              className="text-5xl lg:text-7xl font-bold mb-6"
              style={{ textShadow: themeTokens.effects.heroShadow }}
            >
              {{BRAND_NAME}} {copyTokens.heroTitleSuffix}
            </h1>
            
            <p 
              className="text-xl lg:text-2xl mb-8 max-w-2xl mx-auto"
              style={{ color: themeTokens.colors.textMuted }}
            >
              {copyTokens.heroDescription}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                className="px-8 py-4 rounded-lg font-semibold text-lg transition-all hover:scale-105"
                style={{
                  backgroundColor: themeTokens.colors.primary,
                  color: '#ffffff',
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = themeTokens.colors.primaryHover}
                onMouseLeave={(e) => e.target.style.backgroundColor = themeTokens.colors.primary}
              >
                {copyTokens.heroPrimaryCta}
              </button>
              
              <button
                className="px-8 py-4 rounded-lg font-semibold text-lg border-2 transition-all hover:scale-105"
                style={{
                  borderColor: themeTokens.colors.border,
                  color: themeTokens.colors.text,
                  backgroundColor: 'transparent',
                }}
              >
                {copyTokens.heroSecondaryCta}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Tiles */}
      <section className="py-8" style={{ backgroundColor: themeTokens.colors.surface }}>
        <div className="container mx-auto px-6">
          <div className="flex flex-wrap justify-center gap-8 text-center">
            {copyTokens.trustTiles.map((tile, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: themeTokens.colors.accent }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="font-medium">{tile}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <p 
            className="text-sm font-semibold uppercase tracking-wide text-center mb-4"
            style={{ color: themeTokens.colors.accent }}
          >
            {copyTokens.statsEyebrow}
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {copyTokens.stats.map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-4xl lg:text-5xl font-bold mb-2" style={{ color: themeTokens.colors.primary }}>
                  {stat.value}
                </div>
                <div className="text-sm" style={{ color: themeTokens.colors.textMuted }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20" style={{ backgroundColor: themeTokens.colors.surface }}>
        <div className="container mx-auto px-6">
          <p 
            className="text-sm font-semibold uppercase tracking-wide text-center mb-4"
            style={{ color: themeTokens.colors.accent }}
          >
            {copyTokens.featuresEyebrow}
          </p>
          
          <h2 className="text-4xl lg:text-5xl font-bold text-center mb-16">
            {copyTokens.featuresHeading}
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {copyTokens.features.map((feature, idx) => (
              <div 
                key={idx}
                className="p-8 rounded-2xl"
                style={{
                  backgroundColor: themeTokens.colors.surfaceMuted,
                  boxShadow: themeTokens.effects.cardShadow,
                }}
              >
                <div 
                  className="w-12 h-12 rounded-lg mb-4 flex items-center justify-center"
                  style={{ backgroundColor: themeTokens.colors.primary }}
                >
                  <span className="text-2xl">✨</span>
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p style={{ color: themeTokens.colors.textMuted }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <p 
            className="text-sm font-semibold uppercase tracking-wide text-center mb-4"
            style={{ color: themeTokens.colors.accent }}
          >
            {copyTokens.testimonialsEyebrow}
          </p>
          
          <h2 className="text-4xl lg:text-5xl font-bold text-center mb-16">
            {copyTokens.testimonialsHeading}
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {copyTokens.testimonials.map((testimonial, idx) => (
              <div 
                key={idx}
                className="p-8 rounded-2xl"
                style={{
                  backgroundColor: themeTokens.colors.surface,
                  boxShadow: themeTokens.effects.cardShadow,
                }}
              >
                <div className="mb-4">
                  <span className="text-3xl" style={{ color: themeTokens.colors.accent }}>★★★★★</span>
                </div>
                <p className="mb-6 italic">{testimonial.quote}</p>
                <div>
                  <p className="font-bold">{testimonial.author}</p>
                  <p className="text-sm" style={{ color: themeTokens.colors.textMuted }}>
                    {testimonial.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20" style={{ backgroundColor: themeTokens.colors.surface }}>
        <div className="container mx-auto px-6">
          <p 
            className="text-sm font-semibold uppercase tracking-wide text-center mb-4"
            style={{ color: themeTokens.colors.accent }}
          >
            {copyTokens.faqEyebrow}
          </p>
          
          <h2 className="text-4xl lg:text-5xl font-bold text-center mb-16">
            {copyTokens.faqHeading}
          </h2>
          
          <div className="max-w-3xl mx-auto space-y-6">
            {copyTokens.faqs.map((faq, idx) => (
              <details 
                key={idx}
                className="p-6 rounded-lg"
                style={{
                  backgroundColor: themeTokens.colors.surfaceMuted,
                  borderLeft: `4px solid ${themeTokens.colors.primary}`,
                }}
              >
                <summary className="font-bold text-lg cursor-pointer">
                  {faq.question}
                </summary>
                <p className="mt-4" style={{ color: themeTokens.colors.textMuted }}>
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div 
            className="max-w-2xl mx-auto p-12 rounded-3xl text-center"
            style={{
              backgroundColor: themeTokens.colors.primary,
              boxShadow: themeTokens.effects.cardShadow,
            }}
          >
            <p className="text-sm font-semibold uppercase tracking-wide mb-4 text-white/80">
              {copyTokens.newsletterEyebrow}
            </p>
            
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-white">
              {copyTokens.newsletterHeading}
            </h2>
            
            <p className="mb-8 text-white/90">
              {copyTokens.newsletterBody}
            </p>
            
            <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-6 py-3 rounded-lg"
                style={{
                  backgroundColor: 'white',
                  color: themeTokens.colors.text,
                }}
              />
              <button
                type="submit"
                className="px-8 py-3 rounded-lg font-semibold transition-all hover:scale-105"
                style={{
                  backgroundColor: themeTokens.colors.accent,
                  color: 'white',
                }}
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer 
        className="py-12 text-center"
        style={{
          backgroundColor: themeTokens.colors.surface,
          borderTop: `1px solid ${themeTokens.colors.border}`,
        }}
      >
        <p style={{ color: themeTokens.colors.textMuted }}>
          © 2024 {{BRAND_NAME}}. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
