"""
Simplified Landing Page Generation Pipeline
Calls Claude to generate COPY_TOKENS and THEME_TOKENS, then applies to template
"""

import os
import json
import asyncio
from typing import Dict, Any, Optional
from anthropic import AsyncAnthropic

COPY_TOKENS_SYSTEM = """You are a conversion copywriter specializing in e-commerce landing pages. Return only valid JSON."""

THEME_TOKENS_SYSTEM = """You are a UI designer specializing in color palettes for e-commerce. Return only valid JSON."""


class LandingPageGenerator:
    def __init__(self):
        api_key = os.getenv("ANTHROPIC_API_KEY")
        if not api_key:
            raise ValueError("ANTHROPIC_API_KEY environment variable not set")
        self.client = AsyncAnthropic(api_key=api_key)
        self.model = "claude-3-5-sonnet-20241022"
        
    async def generate(
        self,
        brand_name: str,
        industry: str,
        target_market: str,
        brief: str,
        change_type: str = "content"
    ) -> Dict[str, Any]:
        """
        Generate landing page by:
        1. Generating COPY_TOKENS and THEME_TOKENS in parallel
        2. Loading template
        3. Applying tokens to template
        4. Returning generated code
        """
        
        # Generate tokens in parallel
        copy_task = self._generate_copy_tokens(brand_name, industry, target_market, brief)
        theme_task = self._generate_theme_tokens(brand_name, industry, brief)
        
        copy_tokens, theme_tokens = await asyncio.gather(copy_task, theme_task)
        
        # Load template
        template = self._load_template()
        
        # Apply tokens
        generated_code = self._apply_tokens(template, copy_tokens, theme_tokens, brand_name)
        
        return {
            "code": generated_code,
            "copy_tokens": copy_tokens,
            "theme_tokens": theme_tokens
        }
    
    async def _generate_copy_tokens(
        self, 
        brand_name: str, 
        industry: str, 
        target_market: str, 
        brief: str
    ) -> Dict[str, Any]:
        """Generate copy tokens using Claude"""
        
        prompt = f"""Generate compelling e-commerce landing page copy for:

Brand: {brand_name}
Industry: {industry}
Target Market: {target_market}
Brief: {brief}

Return a JSON object with these fields:
- heroEyebrow (string): Short overline text above main headline
- heroTitleSuffix (string): Main headline suffix (combines with brand name)
- heroDescription (string): 1-2 sentence hero description
- heroPrimaryCta (string): Primary CTA button text
- heroSecondaryCta (string): Secondary CTA button text
- catalogEyebrow (string): Section label for product catalog
- catalogHeading (string): Catalog section heading
- featuresEyebrow (string): Section label for features
- featuresHeading (string): Features section heading
- features (array): 3-4 feature objects with title, description
- statsEyebrow (string): Section label for stats
- stats (array): 3-4 stat objects with value, label
- testimonialsEyebrow (string): Section label for testimonials
- testimonialsHeading (string): Testimonials section heading
- testimonials (array): 2-3 testimonial objects with quote, author, role
- faqEyebrow (string): Section label for FAQs
- faqHeading (string): FAQ section heading
- faqs (array): 4-6 FAQ objects with question, answer
- newsletterEyebrow (string): Newsletter section label
- newsletterHeading (string): Newsletter heading
- newsletterBody (string): Newsletter description
- trustTiles (array): 3-4 trust signals (e.g., "Free Shipping", "30-Day Returns")
- benefits (array): 3-4 key benefit strings
- brandFallback (string): Generic brand description if brand name not provided

Return ONLY valid JSON, no markdown or explanation."""

        response = await self.client.messages.create(
            model=self.model,
            max_tokens=2000,
            system=COPY_TOKENS_SYSTEM,
            messages=[{"role": "user", "content": prompt}]
        )
        
        content = response.content[0].text
        # Strip markdown if present
        if content.startswith("```json"):
            content = content.split("```json")[1].split("```")[0].strip()
        elif content.startswith("```"):
            content = content.split("```")[1].split("```")[0].strip()
            
        return json.loads(content)
    
    async def _generate_theme_tokens(
        self, 
        brand_name: str, 
        industry: str, 
        brief: str
    ) -> Dict[str, Any]:
        """Generate theme tokens using Claude"""
        
        prompt = f"""Create a modern, conversion-optimized color palette for:

Brand: {brand_name}
Industry: {industry}
Brief: {brief}

Return a JSON object with:
- colors (object):
  - backgroundTop (hex): Gradient top color
  - backgroundBottom (hex): Gradient bottom color
  - surface (hex): Card/surface background
  - surfaceMuted (hex): Muted surface variant
  - text (hex): Primary text color
  - textMuted (hex): Secondary text color
  - border (hex): Border color
  - primary (hex): Primary brand color
  - primaryHover (hex): Primary hover state
  - accent (hex): Accent/highlight color
  - darkSurface (hex): Dark mode surface
  - darkCard (hex): Dark mode card
  - darkText (hex): Dark mode text
- effects (object):
  - cardShadow (string): CSS box-shadow for cards
  - heroShadow (string): CSS box-shadow for hero section

Return ONLY valid JSON, no markdown or explanation."""

        response = await self.client.messages.create(
            model=self.model,
            max_tokens=1000,
            system=THEME_TOKENS_SYSTEM,
            messages=[{"role": "user", "content": prompt}]
        )
        
        content = response.content[0].text
        # Strip markdown if present
        if content.startswith("```json"):
            content = content.split("```json")[1].split("```")[0].strip()
        elif content.startswith("```"):
            content = content.split("```")[1].split("```")[0].strip()
            
        return json.loads(content)
    
    def _load_template(self) -> str:
        """Load the React template"""
        template_path = os.path.join(
            os.path.dirname(__file__),
            "templates",
            "page_template.jsx"
        )
        with open(template_path, "r") as f:
            return f.read()
    
    def _apply_tokens(
        self, 
        template: str, 
        copy_tokens: Dict[str, Any], 
        theme_tokens: Dict[str, Any],
        brand_name: str
    ) -> str:
        """Apply tokens to template using simple string replacement"""
        
        result = template
        
        # Replace COPY_TOKENS
        for key, value in copy_tokens.items():
            placeholder = f"{{{{COPY_TOKENS.{key}}}}}"
            if isinstance(value, str):
                result = result.replace(placeholder, value)
            elif isinstance(value, list):
                # For arrays, we'll use JSON stringification
                # Template should handle parsing
                result = result.replace(placeholder, json.dumps(value))
        
        # Replace THEME_TOKENS
        if "colors" in theme_tokens:
            for key, value in theme_tokens["colors"].items():
                placeholder = f"{{{{THEME_TOKENS.colors.{key}}}}}"
                result = result.replace(placeholder, value)
        
        if "effects" in theme_tokens:
            for key, value in theme_tokens["effects"].items():
                placeholder = f"{{{{THEME_TOKENS.effects.{key}}}}}"
                result = result.replace(placeholder, value)
        
        # Replace brand name
        result = result.replace("{{BRAND_NAME}}", brand_name)
        
        return result
