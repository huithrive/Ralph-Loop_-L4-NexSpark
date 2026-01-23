-- 001_initial_schema.sql
-- Initial database schema for NexSpark Strategist Module

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Research Results Table
CREATE TABLE research_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    website_url VARCHAR(2048) NOT NULL,
    product_description TEXT NOT NULL,
    market_size JSONB,
    competitors JSONB,
    target_audience JSONB,
    channels JSONB,
    pain_points JSONB,
    raw_response TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Interview Sessions Table
CREATE TABLE interview_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    research_id UUID REFERENCES research_results(id),
    status VARCHAR(20) DEFAULT 'in_progress',
    current_question INTEGER DEFAULT 1,
    analysis JSONB,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- Interview Responses Table
CREATE TABLE interview_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES interview_sessions(id),
    question_number INTEGER NOT NULL,
    question_text TEXT NOT NULL,
    response_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- GTM Reports Table
CREATE TABLE gtm_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    research_id UUID REFERENCES research_results(id),
    interview_session_id UUID REFERENCES interview_sessions(id),
    report_data JSONB NOT NULL,
    status VARCHAR(20) DEFAULT 'draft',
    pdf_url VARCHAR(2048),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX idx_research_url ON research_results(website_url);
CREATE INDEX idx_research_created ON research_results(created_at);
CREATE INDEX idx_sessions_research ON interview_sessions(research_id);
CREATE INDEX idx_responses_session ON interview_responses(session_id);
CREATE INDEX idx_reports_research ON gtm_reports(research_id);
CREATE INDEX idx_reports_session ON gtm_reports(interview_session_id);

-- Add update trigger for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_research_updated_at BEFORE UPDATE ON research_results
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON gtm_reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();