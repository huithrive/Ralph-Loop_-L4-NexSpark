#!/usr/bin/env python3
"""
Quick test script for the landing bridge service
Run after starting the service with ./start.sh
"""

import asyncio
import json
from bridge_service import LandingPageGenerator

async def test_generation():
    """Test the landing page generation pipeline"""
    
    print("🧪 Testing Landing Page Generation\n")
    
    try:
        generator = LandingPageGenerator()
        
        print("📝 Generating landing page for HydroLife water bottles...")
        result = await generator.generate(
            brand_name="HydroLife",
            industry="Consumer Goods",
            target_market="Environmentally conscious millennials",
            brief="Create a landing page for eco-friendly, reusable water bottles with temperature control",
            change_type="content"
        )
        
        print("\n✅ Generation complete!\n")
        
        print("📋 Copy Tokens:")
        print(f"   Hero: {result['copy_tokens'].get('heroEyebrow')} - {result['copy_tokens'].get('heroTitleSuffix')}")
        print(f"   Features: {len(result['copy_tokens'].get('features', []))} features")
        print(f"   Stats: {len(result['copy_tokens'].get('stats', []))} stats")
        print(f"   Testimonials: {len(result['copy_tokens'].get('testimonials', []))} testimonials")
        print(f"   FAQs: {len(result['copy_tokens'].get('faqs', []))} FAQs")
        
        print("\n🎨 Theme Tokens:")
        colors = result['theme_tokens'].get('colors', {})
        print(f"   Primary: {colors.get('primary')}")
        print(f"   Accent: {colors.get('accent')}")
        print(f"   Background: {colors.get('backgroundTop')} → {colors.get('backgroundBottom')}")
        
        print("\n📄 Generated Code:")
        code_preview = result['code'][:500]
        print(f"   {len(result['code'])} characters")
        print(f"   Preview: {code_preview}...")
        
        # Save to file
        output_file = "test_output.jsx"
        with open(output_file, "w") as f:
            f.write(result['code'])
        print(f"\n💾 Full code saved to: {output_file}")
        
        print("\n✨ Test successful!")
        
    except Exception as e:
        print(f"\n❌ Test failed: {str(e)}")
        raise

if __name__ == "__main__":
    asyncio.run(test_generation())
