'use client';

import { Button } from '@whats-for-dinner/ui';
import { usePantry } from '@whats-for-dinner/utils';

export default function TestPage() {
  const { items, addItem } = usePantry();

  return (
    <div className="bg-background min-h-screen p-8">
      <div className="mx-auto max-w-2xl space-y-8">
        <h1 className="text-foreground text-4xl font-bold">Test Page</h1>

        <div className="space-y-4">
          <Button variant="primary" onPress={() => addItem('Test Item')}>
            Add Test Item
          </Button>

          <div>
            <h2 className="mb-4 text-2xl font-semibold">
              Items ({items.length})
            </h2>
            {items.map((item, index) => (
              <div key={index} className="bg-card rounded p-2">
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
