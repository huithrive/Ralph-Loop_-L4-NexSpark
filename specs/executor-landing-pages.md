# Module 2: Executor - Landing Page Builder

## Purpose
Automated landing page creation using Lovable API, Shopify integration, and domain management.

## Components

### 1. Lovable API Integration
**Endpoint:** POST `/api/executor/landing-page/create`

**Input:**
```json
{
  "user_id": "uuid",
  "research_id": "uuid",
  "brand_assets": {
    "logo_url": "string",
    "colors": ["#hex1", "#hex2"],
    "fonts": ["font1", "font2"]
  },
  "content": {
    "hero_headline": "string",
    "hero_subheadline": "string",
    "product_features": ["feature1", "feature2"],
    "testimonials": [],
    "cta_text": "string"
  }
}
```

**Output:**
```json
{
  "landing_page_id": "uuid",
  "preview_url": "https://preview.lovable.dev/xxx",
  "published_url": "https://yourdomain.com",
  "pages_created": ["homepage", "product", "thank-you"],
  "status": "published"
}
```

**Implementation:**
- File: `backend/services/lovable.js`
- File: `backend/api/executor/landing-page.js`
- Lovable API: Use GTM research data to populate pages
- Generate responsive HTML/CSS
- Include: Hero, Features, Social Proof, CTA, FAQ, Footer

### 2. Shopify Integration
**Endpoint:** POST `/api/executor/shopify/setup`

**Features:**
- Connect to existing Shopify store OR create new
- Auto-create products from research data
- Install Meta Pixel via ScriptTag API
- Set up webhooks for order tracking
- Sync inventory and pricing

**Files:**
- `backend/services/shopify.js`
- `backend/api/executor/shopify.js`
- `backend/models/shopify-store.js`

**Shopify APIs:**
- Admin API for product creation
- ScriptTag API for pixel injection
- Webhook API for events

### 3. Domain Management (NameSilo)
**Endpoint:** POST `/api/executor/domain/acquire`

**Features:**
- Check domain availability
- Suggest brand-based alternatives
- Purchase domain via NameSilo API
- Configure DNS (A records, CNAME)
- Set up SSL certificate
- Connect domain to landing page

**Files:**
- `backend/services/namesilo.js`
- `backend/api/executor/domain.js`

### 4. Creative Generation (Video & Image)
**Endpoint:** POST `/api/executor/creative/generate`

**Purpose:**
Generate video and image creatives for advertising and SEO content using cost-effective APIs.

**Input:**
```json
{
  "user_id": "uuid",
  "research_id": "uuid",
  "creative_type": "video" | "image",
  "source_image_url": "string",
  "prompt": "string",
  "style": "anime" | "3d_animation" | "clay" | "cyberpunk" | "comic",
  "duration": 5 | 8,
  "quality": "360p" | "540p" | "720p" | "1080p",
  "motion_mode": "normal" | "fast",
  "camera_movement": "zoom_in" | "zoom_out" | "horizontal_left" | "horizontal_right" | "vertical_up" | "vertical_down" | "crane_up" | "camera_rotation" | "robo_arm" | "super_dolly_out" | "whip_pan" | "hitchcock" | "left_follow" | "right_follow" | "pan_left" | "pan_right" | "fix_bg" | "quickly_zoom_in" | "quickly_zoom_out" | "smooth_zoom_in",
  "negative_prompt": "string",
  "use_case": "advertisement" | "seo_content" | "social_media"
}
```

**Output:**
```json
{
  "creative_id": "uuid",
  "video_id": "integer",
  "status": "pending" | "processing" | "completed" | "failed",
  "video_url": "string",
  "thumbnail_url": "string",
  "duration": 5,
  "quality": "540p",
  "created_at": "timestamp"
}
```

**Integration Strategy:**

**Primary: Pixverse AI (Image-to-Video)**
- **API Base:** `https://app-api.pixverseai.cn/openapi/v2`
- **Image Upload:** `POST /image/upload` (form-data with image file)
- **Video Generation:** `POST /video/img/generate`
- **Status Check:** `GET /video/result/{video_id}`
- **Documentation:** https://docs.platform.pai.video/6740019m0
- **Requirements:**
  - API-KEY header
  - Unique Ai-trace-id header per request
  - Image format: JPG/PNG/WebP, max 4000×4000px, ≤ 20MB
  - Model: "v4.5"
  - Supports 5s and 8s videos (1080p only supports 5s)

**Alternative APIs (Fallback Options):**
- **Kling AI:** Video generation from text/prompts
- **RunwayML:** Image-to-video generation
- **Stable Diffusion:** Image generation (via Replicate API)
- **DALL-E 3:** Image generation (via OpenAI API)

**Workflow:**
1. Upload source image to Pixverse (if provided)
2. Generate video from image using prompt and style parameters
3. Poll for completion status (status: 1 = success, 5 = processing, 7 = rejected, 8 = failed)
4. Store creative metadata and URLs in database
5. Return creative ID and status

**Files:**
- `backend/services/pixverse.js` (primary)
- `backend/services/creative-generator.js` (orchestrator)
- `backend/api/executor/creative.js`
- `backend/models/creative.js`

**API Endpoints:**
- `POST /api/executor/creative/generate` - Generate new creative
- `GET /api/executor/creative/:id` - Get creative status and details
- `GET /api/executor/creative/:id/status` - Poll for status updates
- `GET /api/executor/creatives` - List all creatives for user

## Database Schema

### landing_pages table
```sql
CREATE TABLE landing_pages (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  research_id UUID REFERENCES research_results(id),
  lovable_project_id VARCHAR(255),
  preview_url TEXT,
  published_url TEXT,
  domain VARCHAR(255),
  pages JSONB,
  brand_assets JSONB,
  status VARCHAR(50),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### shopify_stores table
```sql
CREATE TABLE shopify_stores (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  store_url VARCHAR(255),
  access_token TEXT,
  products JSONB,
  pixel_installed BOOLEAN,
  webhooks JSONB,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### creatives table
```sql
CREATE TABLE creatives (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  research_id UUID REFERENCES research_results(id),
  creative_type VARCHAR(50) NOT NULL, -- 'video' or 'image'
  source_image_url TEXT,
  prompt TEXT NOT NULL,
  style VARCHAR(50),
  duration INTEGER, -- 5 or 8 seconds
  quality VARCHAR(10), -- '360p', '540p', '720p', '1080p'
  motion_mode VARCHAR(20), -- 'normal' or 'fast'
  camera_movement VARCHAR(50),
  negative_prompt TEXT,
  use_case VARCHAR(50), -- 'advertisement', 'seo_content', 'social_media'
  provider VARCHAR(50) DEFAULT 'pixverse', -- 'pixverse', 'kling', 'runway', etc.
  provider_video_id VARCHAR(255), -- External API video ID
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  video_url TEXT,
  thumbnail_url TEXT,
  metadata JSONB, -- Store full API response
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_creatives_user ON creatives(user_id);
CREATE INDEX idx_creatives_research ON creatives(research_id);
CREATE INDEX idx_creatives_status ON creatives(status);
```

## Environment Variables
```
# Landing Pages
LOVABLE_API_KEY=xxx

# Shopify
SHOPIFY_API_KEY=xxx
SHOPIFY_API_SECRET=xxx

# Domain Management
NAMESILO_API_KEY=xxx

# Creative Generation
PIXVERSE_API_KEY=xxx
KLING_API_KEY=xxx
RUNWAY_API_KEY=xxx
OPENAI_API_KEY=xxx
REPLICATE_API_TOKEN=xxx
```

## Acceptance Criteria
- [ ] Lovable API integration creates landing pages
- [ ] Shopify connection and product creation works
- [ ] Domain acquisition via NameSilo succeeds
- [ ] DNS configuration automated
- [ ] Landing page accessible via custom domain
- [ ] Meta Pixel installed on Shopify
- [ ] **Pixverse API integration for image-to-video generation works**
- [ ] **Image upload to Pixverse succeeds (form-data format)**
- [ ] **Video generation from images with prompts and styles works**
- [ ] **Status polling for video generation completion works**
- [ ] **Creative metadata stored in database correctly**
- [ ] **Fallback to alternative APIs if Pixverse fails**
- [ ] All endpoints have error handling
- [ ] Integration tests pass
