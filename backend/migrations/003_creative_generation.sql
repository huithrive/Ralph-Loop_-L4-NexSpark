-- Creative Generation Tables
-- Module 2.4: Creative Generation with PixVerse API

-- Table for storing creative generation jobs
CREATE TABLE creative_generations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID UNIQUE NOT NULL,
    provider VARCHAR(50) NOT NULL DEFAULT 'pixverse',
    status VARCHAR(20) NOT NULL DEFAULT 'pending',

    -- Input data
    prompt TEXT NOT NULL,
    negative_prompt TEXT,
    image_url TEXT,

    -- Generation options
    duration INTEGER CHECK (duration IN (5, 8, 10)),
    quality VARCHAR(10) CHECK (quality IN ('360p', '540p', '720p', '1080p')),
    style VARCHAR(20),
    motion_mode VARCHAR(10) CHECK (motion_mode IN ('normal', 'fast')),
    seed INTEGER,

    -- Provider-specific IDs
    provider_img_id BIGINT,
    provider_video_id BIGINT,

    -- Results
    video_url TEXT,
    img_url TEXT,
    file_size VARCHAR(20),
    width INTEGER,
    height INTEGER,

    -- Metadata
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    error_message TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table for tracking generation attempts and retries
CREATE TABLE creative_generation_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    generation_id UUID REFERENCES creative_generations(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL,
    attempt_number INTEGER NOT NULL DEFAULT 1,

    -- Attempt details
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    error_message TEXT,

    -- Provider response data
    provider_response JSONB,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_creative_generations_job_id ON creative_generations(job_id);
CREATE INDEX idx_creative_generations_status ON creative_generations(status);
CREATE INDEX idx_creative_generations_provider ON creative_generations(provider);
CREATE INDEX idx_creative_generations_created ON creative_generations(created_at);
CREATE INDEX idx_creative_generation_attempts_generation_id ON creative_generation_attempts(generation_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_creative_generations_updated_at
    BEFORE UPDATE ON creative_generations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();