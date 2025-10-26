'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, MessageCircle, Bug, Lightbulb, Heart, Star, Send, Camera, Mic } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FeedbackWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  context?: {
    page?: string;
    feature?: string;
    userId?: string;
    sessionId?: string;
  };
}

type FeedbackType = 'bug' | 'feature' | 'general' | 'praise' | 'complaint';
type Priority = 'low' | 'medium' | 'high' | 'urgent';

interface FeedbackData {
  type: FeedbackType;
  priority: Priority;
  title: string;
  description: string;
  email?: string;
  attachments?: File[];
  metadata: {
    userAgent: string;
    url: string;
    timestamp: string;
    userId?: string;
    sessionId?: string;
    page: string;
    feature?: string;
  };
}

const FEEDBACK_TYPES = [
  { value: 'bug', label: 'Bug Report', icon: Bug, color: 'destructive' },
  { value: 'feature', label: 'Feature Request', icon: Lightbulb, color: 'default' },
  { value: 'general', label: 'General Feedback', icon: MessageCircle, color: 'secondary' },
  { value: 'praise', label: 'Praise', icon: Heart, color: 'default' },
  { value: 'complaint', label: 'Complaint', icon: MessageCircle, color: 'destructive' },
] as const;

const PRIORITY_LEVELS = [
  { value: 'low', label: 'Low', color: 'bg-green-100 text-green-800' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
  { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800' },
] as const;

export function FeedbackWidget({ isOpen, onClose, context }: FeedbackWidgetProps) {
  const [feedbackData, setFeedbackData] = useState<FeedbackData>({
    type: 'general',
    priority: 'medium',
    title: '',
    description: '',
    email: '',
    attachments: [],
    metadata: {
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : '',
      url: typeof window !== 'undefined' ? window.location.href : '',
      timestamp: new Date().toISOString(),
      userId: context?.userId,
      sessionId: context?.sessionId,
      page: context?.page || 'unknown',
      feature: context?.feature,
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedbackData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit feedback');
      }

      toast({
        title: 'Feedback Submitted',
        description: 'Thank you for your feedback! We\'ll review it and get back to you soon.',
      });

      // Reset form
      setFeedbackData({
        type: 'general',
        priority: 'medium',
        title: '',
        description: '',
        email: '',
        attachments: [],
        metadata: {
          userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : '',
          url: typeof window !== 'undefined' ? window.location.href : '',
          timestamp: new Date().toISOString(),
          userId: context?.userId,
          sessionId: context?.sessionId,
          page: context?.page || 'unknown',
          feature: context?.feature,
        },
      });
      setCurrentStep(1);
      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit feedback. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFeedbackData(prev => ({
      ...prev,
      attachments: [...(prev.attachments || []), ...files],
    }));
  };

  const removeAttachment = (index: number) => {
    setFeedbackData(prev => ({
      ...prev,
      attachments: prev.attachments?.filter((_, i) => i !== index) || [],
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-semibold">Share Your Feedback</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Feedback Type */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <Label className="text-base font-medium">What type of feedback is this?</Label>
                <div className="grid grid-cols-2 gap-3">
                  {FEEDBACK_TYPES.map((type) => {
                    const Icon = type.icon;
                    return (
                      <Button
                        key={type.value}
                        type="button"
                        variant={feedbackData.type === type.value ? 'default' : 'outline'}
                        className="h-auto p-4 flex flex-col items-center gap-2"
                        onClick={() => setFeedbackData(prev => ({ ...prev, type: type.value as FeedbackType }))}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="text-sm">{type.label}</span>
                      </Button>
                    );
                  })}
                </div>
                <div className="flex justify-end">
                  <Button type="button" onClick={() => setCurrentStep(2)}>
                    Next
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Priority & Title */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-base font-medium">Priority Level</Label>
                  <Select
                    value={feedbackData.priority}
                    onValueChange={(value) => setFeedbackData(prev => ({ ...prev, priority: value as Priority }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRIORITY_LEVELS.map((priority) => (
                        <SelectItem key={priority.value} value={priority.value}>
                          <div className="flex items-center gap-2">
                            <Badge className={priority.color}>{priority.label}</Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title" className="text-base font-medium">
                    Brief Title
                  </Label>
                  <Input
                    id="title"
                    placeholder="Summarize your feedback in a few words"
                    value={feedbackData.title}
                    onChange={(e) => setFeedbackData(prev => ({ ...prev, title: e.target.value }))}
                    required
                  />
                </div>

                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={() => setCurrentStep(1)}>
                    Back
                  </Button>
                  <Button type="button" onClick={() => setCurrentStep(3)}>
                    Next
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Description & Details */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-base font-medium">
                    Detailed Description
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Please provide as much detail as possible. For bugs, include steps to reproduce. For features, explain the use case."
                    value={feedbackData.description}
                    onChange={(e) => setFeedbackData(prev => ({ ...prev, description: e.target.value }))}
                    rows={6}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-base font-medium">
                    Email (Optional)
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={feedbackData.email}
                    onChange={(e) => setFeedbackData(prev => ({ ...prev, email: e.target.value }))}
                  />
                  <p className="text-sm text-muted-foreground">
                    We'll use this to follow up on your feedback
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-base font-medium">Attachments (Optional)</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    <input
                      type="file"
                      multiple
                      accept="image/*,video/*,.pdf,.doc,.docx"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer flex flex-col items-center gap-2"
                    >
                      <Camera className="h-8 w-8 text-gray-400" />
                      <span className="text-sm text-gray-600">Click to upload files</span>
                      <span className="text-xs text-gray-500">Images, videos, documents</span>
                    </label>
                  </div>
                  
                  {feedbackData.attachments && feedbackData.attachments.length > 0 && (
                    <div className="space-y-2">
                      {feedbackData.attachments.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                          <span className="text-sm truncate">{file.name}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAttachment(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={() => setCurrentStep(2)}>
                    Back
                  </Button>
                  <Button type="button" onClick={() => setCurrentStep(4)}>
                    Next
                  </Button>
                </div>
              </div>
            )}

            {/* Step 4: Review & Submit */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-base font-medium">Review Your Feedback</Label>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Type:</span>
                      <Badge variant="outline">
                        {FEEDBACK_TYPES.find(t => t.value === feedbackData.type)?.label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Priority:</span>
                      <Badge className={PRIORITY_LEVELS.find(p => p.value === feedbackData.priority)?.color}>
                        {PRIORITY_LEVELS.find(p => p.value === feedbackData.priority)?.label}
                      </Badge>
                    </div>
                    <div>
                      <span className="font-medium">Title:</span>
                      <p className="text-sm">{feedbackData.title}</p>
                    </div>
                    <div>
                      <span className="font-medium">Description:</span>
                      <p className="text-sm whitespace-pre-wrap">{feedbackData.description}</p>
                    </div>
                    {feedbackData.email && (
                      <div>
                        <span className="font-medium">Email:</span>
                        <p className="text-sm">{feedbackData.email}</p>
                      </div>
                    )}
                    {feedbackData.attachments && feedbackData.attachments.length > 0 && (
                      <div>
                        <span className="font-medium">Attachments:</span>
                        <p className="text-sm">{feedbackData.attachments.length} file(s)</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={() => setCurrentStep(3)}>
                    Back
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Submit Feedback
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}