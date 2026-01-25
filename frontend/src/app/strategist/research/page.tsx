'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/common';
import { Button } from '../../../components/common';
import { Input, Textarea } from '../../../components/common';
import { strategistAPI } from '../../../api/strategist';
import { Search, Globe, FileText, ArrowLeft } from 'lucide-react';

const researchSchema = z.object({
  website_url: z
    .string()
    .min(1, 'Website URL is required')
    .url('Please enter a valid URL (including https://)'),
  product_description: z
    .string()
    .min(10, 'Product description must be at least 10 characters')
    .max(5000, 'Product description must be less than 5000 characters'),
});

type ResearchFormData = z.infer<typeof researchSchema>;

export default function ResearchPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ResearchFormData>({
    resolver: zodResolver(researchSchema),
  });

  const productDescription = watch('product_description', '');

  const onSubmit = async (data: ResearchFormData) => {
    setIsSubmitting(true);
    try {
      console.log('Submitting research:', data);

      // Call the API
      const result = await strategistAPI.createResearch({
        name: `Research for ${data.website_url}`,
        description: data.product_description,
        businessUrl: data.website_url,
      });

      // Redirect to results page
      if (result.data?.id) {
        window.location.href = `/strategist/research/${result.data.id}`;
      }

    } catch (error) {
      console.error('Research submission failed:', error);
      alert('Failed to start research. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    window.history.back();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          icon={<ArrowLeft size={16} />}
        >
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-text-primary font-antonio uppercase tracking-wide mb-2">
            Market Research Engine
          </h1>
          <p className="text-text-muted text-lg">
            AI-powered analysis of your market opportunity
          </p>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gold rounded-full flex items-center justify-center text-black font-bold text-sm">
            1
          </div>
          <span className="ml-2 text-sm font-medium text-gold">Research</span>
        </div>
        <div className="h-px bg-border-subtle flex-1"></div>
        <div className="flex items-center opacity-50">
          <div className="w-8 h-8 bg-border-subtle rounded-full flex items-center justify-center text-text-muted font-bold text-sm">
            2
          </div>
          <span className="ml-2 text-sm font-medium text-text-muted">Interview</span>
        </div>
        <div className="h-px bg-border-subtle flex-1"></div>
        <div className="flex items-center opacity-50">
          <div className="w-8 h-8 bg-border-subtle rounded-full flex items-center justify-center text-text-muted font-bold text-sm">
            3
          </div>
          <span className="ml-2 text-sm font-medium text-text-muted">Report</span>
        </div>
      </div>

      {/* Research Form */}
      <Card>
        <CardHeader>
          <CardTitle>Tell us about your business</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Website URL */}
            <Input
              label="Website URL"
              placeholder="https://yourwebsite.com"
              error={errors.website_url?.message}
              icon={<Globe size={18} />}
              fullWidth
              {...register('website_url')}
            />

            {/* Product Description */}
            <div>
              <Textarea
                label="Product Description"
                placeholder="Describe your product or service in detail. What problem does it solve? Who is your target audience? What makes it unique?"
                rows={8}
                error={errors.product_description?.message}
                hint={`${productDescription.length}/5000 characters`}
                fullWidth
                {...register('product_description')}
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={isSubmitting}
                icon={<Search size={20} />}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Analyzing...' : 'Start Research'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* What to Expect */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle>What to Expect</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-bold text-text-primary font-antonio uppercase tracking-wide">
                Analysis Includes
              </h4>
              <ul className="space-y-2 text-sm text-text-muted">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-gold rounded-full mr-3"></div>
                  Competitive landscape (top 5-7 competitors)
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-gold rounded-full mr-3"></div>
                  Market trends and growth projections
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-gold rounded-full mr-3"></div>
                  Target audience demographics
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-gold rounded-full mr-3"></div>
                  Market size (TAM/SAM analysis)
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-gold rounded-full mr-3"></div>
                  Customer pain points identification
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold text-text-primary font-antonio uppercase tracking-wide">
                Performance
              </h4>
              <ul className="space-y-2 text-sm text-text-muted">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue rounded-full mr-3"></div>
                  Response time: &lt;30 seconds
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue rounded-full mr-3"></div>
                  Powered by Claude Sonnet 4
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue rounded-full mr-3"></div>
                  Structured JSON output
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue rounded-full mr-3"></div>
                  Comprehensive recommendations
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tips */}
      <Card variant="glass">
        <CardContent>
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <FileText className="w-6 h-6 text-warning mt-1" />
            </div>
            <div>
              <h4 className="font-bold text-text-primary mb-2">
                Tips for Better Results
              </h4>
              <ul className="text-sm text-text-muted space-y-1">
                <li>• Be specific about your target audience and value proposition</li>
                <li>• Include information about your business model and pricing</li>
                <li>• Mention key features that differentiate you from competitors</li>
                <li>• Describe the problem you're solving and its urgency</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}