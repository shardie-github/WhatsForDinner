'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle, CheckCircle } from 'lucide-react';

interface AgeGateProps {
  onVerified: (isVerified: boolean) => void;
  config?: {
    minimumAge: number;
    jurisdictions: string[];
    verificationMethods: string[];
    redirectUrl?: string;
  };
}

export function AgeGate({ onVerified, config }: AgeGateProps) {
  const [step, setStep] = useState<'age' | 'verification' | 'parental_consent' | 'verified'>('age');
  const [age, setAge] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [verificationMethod, setVerificationMethod] = useState('');
  const [parentalConsent, setParentalConsent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const minimumAge = config?.minimumAge || 13;
  const jurisdictions = config?.jurisdictions || ['US', 'EU', 'CA'];
  const verificationMethods = config?.verificationMethods || ['self_declaration', 'id_verification', 'parental_consent'];

  useEffect(() => {
    // Check if user has already been verified in this session
    const verified = sessionStorage.getItem('age_verified');
    if (verified === 'true') {
      onVerified(true);
    }
  }, [onVerified]);

  const handleAgeVerification = () => {
    setError('');
    
    if (!age) {
      setError('Please enter your age');
      return;
    }

    const userAge = parseInt(age);
    if (isNaN(userAge) || userAge < 0) {
      setError('Please enter a valid age');
      return;
    }

    if (userAge < minimumAge) {
      if (verificationMethods.includes('parental_consent')) {
        setStep('parental_consent');
      } else {
        setError(`You must be at least ${minimumAge} years old to use this service`);
        return;
      }
    } else if (verificationMethods.includes('id_verification') && userAge < 18) {
      setStep('verification');
    } else {
      // Age verified, proceed
      handleVerificationComplete(true);
    }
  };

  const handleBirthDateVerification = () => {
    setError('');
    
    if (!birthDate) {
      setError('Please enter your birth date');
      return;
    }

    const birth = new Date(birthDate);
    const today = new Date();
    const ageInYears = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      ageInYears--;
    }

    if (ageInYears < minimumAge) {
      if (verificationMethods.includes('parental_consent')) {
        setStep('parental_consent');
      } else {
        setError(`You must be at least ${minimumAge} years old to use this service`);
        return;
      }
    } else if (verificationMethods.includes('id_verification') && ageInYears < 18) {
      setStep('verification');
    } else {
      handleVerificationComplete(true);
    }
  };

  const handleIDVerification = async () => {
    setLoading(true);
    setError('');

    try {
      // In a real implementation, this would integrate with an ID verification service
      // For now, we'll simulate the process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate verification result
      const isVerified = Math.random() > 0.1; // 90% success rate for demo
      
      if (isVerified) {
        handleVerificationComplete(true);
      } else {
        setError('ID verification failed. Please try again or contact support.');
      }
    } catch (error) {
      setError('Verification service is temporarily unavailable. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleParentalConsent = () => {
    if (!parentalConsent) {
      setError('Parental consent is required to proceed');
      return;
    }

    // In a real implementation, this would send a verification email to the parent
    // and require them to confirm consent
    handleVerificationComplete(true);
  };

  const handleVerificationComplete = (isVerified: boolean) => {
    if (isVerified) {
      sessionStorage.setItem('age_verified', 'true');
      onVerified(true);
    } else {
      if (config?.redirectUrl) {
        window.location.href = config.redirectUrl;
      } else {
        setError('Access denied. You must meet the age requirements to use this service.');
      }
    }
  };

  const renderAgeStep = () => (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
          <Shield className="h-8 w-8 text-blue-600" />
        </div>
        <CardTitle>Age Verification Required</CardTitle>
        <p className="text-sm text-muted-foreground">
          Please verify your age to continue using What's for Dinner
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="age">How old are you?</Label>
          <Input
            id="age"
            type="number"
            placeholder="Enter your age"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            min="0"
            max="120"
          />
        </div>
        
        <div className="text-center text-sm text-muted-foreground">
          OR
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="birthdate">Enter your birth date</Label>
          <Input
            id="birthdate"
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
          />
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2">
          <Button 
            onClick={handleAgeVerification}
            className="flex-1"
          >
            Verify Age
          </Button>
          <Button 
            onClick={() => handleBirthDateVerification()}
            variant="outline"
            className="flex-1"
          >
            Verify with Birth Date
          </Button>
        </div>

        <div className="text-xs text-muted-foreground text-center">
          Minimum age: {minimumAge} years
        </div>
      </CardContent>
    </Card>
  );

  const renderVerificationStep = () => (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 p-3 bg-yellow-100 rounded-full w-fit">
          <Shield className="h-8 w-8 text-yellow-600" />
        </div>
        <CardTitle>Additional Verification Required</CardTitle>
        <p className="text-sm text-muted-foreground">
          Please verify your identity to continue
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Verification Method</Label>
          <Select value={verificationMethod} onValueChange={setVerificationMethod}>
            <SelectTrigger>
              <SelectValue placeholder="Select verification method" />
            </SelectTrigger>
            <SelectContent>
              {verificationMethods.map((method) => (
                <SelectItem key={method} value={method}>
                  {method.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {verificationMethod === 'id_verification' && (
          <div className="space-y-2">
            <Label>Upload ID Document</Label>
            <Input type="file" accept="image/*,.pdf" />
            <p className="text-xs text-muted-foreground">
              Upload a clear photo of your government-issued ID
            </p>
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button 
          onClick={handleIDVerification}
          disabled={!verificationMethod || loading}
          className="w-full"
        >
          {loading ? 'Verifying...' : 'Verify Identity'}
        </Button>
      </CardContent>
    </Card>
  );

  const renderParentalConsentStep = () => (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 p-3 bg-green-100 rounded-full w-fit">
          <Shield className="h-8 w-8 text-green-600" />
        </div>
        <CardTitle>Parental Consent Required</CardTitle>
        <p className="text-sm text-muted-foreground">
          A parent or guardian must provide consent for users under {minimumAge}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <div className="text-sm">
            <p className="mb-2">To use What's for Dinner, we need parental consent because:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>You are under {minimumAge} years old</li>
              <li>We collect personal information</li>
              <li>We provide personalized content and recommendations</li>
            </ul>
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox
              id="parental-consent"
              checked={parentalConsent}
              onCheckedChange={(checked) => setParentalConsent(checked as boolean)}
            />
            <Label htmlFor="parental-consent" className="text-sm">
              I confirm that I am a parent or legal guardian and give consent for this child to use What's for Dinner
            </Label>
          </div>

          <div className="text-xs text-muted-foreground">
            By checking this box, you acknowledge that you have read and understood our Privacy Policy and Terms of Service.
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button 
          onClick={handleParentalConsent}
          disabled={!parentalConsent}
          className="w-full"
        >
          Provide Consent
        </Button>
      </CardContent>
    </Card>
  );

  const renderVerifiedStep = () => (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 p-3 bg-green-100 rounded-full w-fit">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <CardTitle>Verification Complete</CardTitle>
        <p className="text-sm text-muted-foreground">
          You can now access What's for Dinner
        </p>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={() => onVerified(true)}
          className="w-full"
        >
          Continue to App
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      {step === 'age' && renderAgeStep()}
      {step === 'verification' && renderVerificationStep()}
      {step === 'parental_consent' && renderParentalConsentStep()}
      {step === 'verified' && renderVerifiedStep()}
    </div>
  );
}