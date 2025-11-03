/**
 * Pricing Survey Component (Van Westendorp)
 * React Native-compatible four-question UI
 * Persists responses offline
 */

'use client';

import { useState } from 'react';
import { useSubmitSurvey } from '@whats-for-dinner/data/src/pricing';

interface PricingSurveyProps {
  country: string;
  currency?: string;
  onComplete?: (medianPrice: number) => void;
}

export function PricingSurvey({ country, currency = 'USD', onComplete }: PricingSurveyProps) {
  const [tooCheap, setTooCheap] = useState<string>('');
  const [cheap, setCheap] = useState<string>('');
  const [expensive, setExpensive] = useState<string>('');
  const [tooExpensive, setTooExpensive] = useState<string>('');

  const submitSurvey = useSubmitSurvey();

  const handleSubmit = async () => {
    const tooCheapNum = parseFloat(tooCheap);
    const cheapNum = parseFloat(cheap);
    const expensiveNum = parseFloat(expensive);
    const tooExpensiveNum = parseFloat(tooExpensive);

    // Validation
    if (
      isNaN(tooCheapNum) ||
      isNaN(cheapNum) ||
      isNaN(expensiveNum) ||
      isNaN(tooExpensiveNum) ||
      tooCheapNum < 0 ||
      cheapNum < 0 ||
      expensiveNum < 0 ||
      tooExpensiveNum < 0 ||
      !(tooCheapNum < cheapNum && cheapNum < expensiveNum && expensiveNum < tooExpensiveNum)
    ) {
      alert('Please enter valid price points: too_cheap < cheap < expensive < too_expensive');
      return;
    }

    try {
      const result = await submitSurvey.mutateAsync({
        too_cheap: tooCheapNum,
        cheap: cheapNum,
        expensive: expensiveNum,
        too_expensive: tooExpensiveNum,
        country,
        currency,
      });

      if (onComplete) {
        onComplete(result.median_optimal_price);
      }

      // Store in localStorage for offline persistence
      if (typeof window !== 'undefined') {
        const offlineData = {
          too_cheap: tooCheapNum,
          cheap: cheapNum,
          expensive: expensiveNum,
          too_expensive: tooExpensiveNum,
          country,
          currency,
          timestamp: new Date().toISOString(),
        };
        localStorage.setItem('pricing_survey_pending', JSON.stringify(offlineData));
      }
    } catch (error) {
      console.error('Error submitting survey:', error);
      alert('Failed to submit survey. Please try again.');
    }
  };

  return (
    <div className="space-y-6 p-6 border rounded-lg">
      <div>
        <h2 className="text-2xl font-bold mb-2">Help Us Set the Right Price</h2>
        <p className="text-gray-600">
          Please answer these four questions about pricing. Your feedback helps us optimize our
          pricing strategy.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            At what price would you consider this product to be <strong>too cheap</strong>? ({currency})
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={tooCheap}
            onChange={(e) => setTooCheap(e.target.value)}
            placeholder="0.00"
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            At what price would you consider this product to be <strong>cheap</strong>? ({currency})
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={cheap}
            onChange={(e) => setCheap(e.target.value)}
            placeholder="0.00"
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            At what price would you consider this product to be <strong>expensive</strong>? ({currency})
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={expensive}
            onChange={(e) => setExpensive(e.target.value)}
            placeholder="0.00"
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            At what price would you consider this product to be <strong>too expensive</strong>? ({currency})
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={tooExpensive}
            onChange={(e) => setTooExpensive(e.target.value)}
            placeholder="0.00"
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={submitSurvey.isPending}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {submitSurvey.isPending ? 'Submitting...' : 'Submit Survey'}
      </button>

      {submitSurvey.isSuccess && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-green-800">Thank you! Your feedback has been recorded.</p>
        </div>
      )}
    </div>
  );
}
