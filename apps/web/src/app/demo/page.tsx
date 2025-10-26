'use client';

import { Button } from '@whats-for-dinner/ui';
import { usePantry } from '@whats-for-dinner/utils';

export default function DemoPage() {
  const { items, addItem, removeItem, clearItems } = usePantry();

  return (
    <div className="bg-background min-h-screen p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="text-center">
          <h1 className="text-foreground text-4xl font-bold">
            What's for Dinner? - Demo
          </h1>
          <p className="text-muted-foreground mt-4 text-lg">
            Demonstrating shared components across platforms
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Pantry Management */}
          <div className="space-y-4">
            <h2 className="text-foreground text-2xl font-semibold">
              Pantry Items
            </h2>

            <div className="space-y-2">
              <input
                type="text"
                placeholder="Add an item..."
                className="border-input bg-background text-foreground w-full rounded-md border px-3 py-2"
                onKeyPress={e => {
                  if (e.key === 'Enter' && e.currentTarget.value) {
                    addItem(e.currentTarget.value);
                    e.currentTarget.value = '';
                  }
                }}
              />

              <div className="flex gap-2">
                <Button
                  variant="primary"
                  onPress={() => {
                    const item = prompt('Add item:');
                    if (item) addItem(item);
                  }}
                >
                  Add Item
                </Button>

                <Button variant="outline" onPress={clearItems}>
                  Clear All
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              {items.length === 0 ? (
                <p className="text-muted-foreground">No items in pantry</p>
              ) : (
                items.map((item, index) => (
                  <div
                    key={index}
                    className="border-input bg-card flex items-center justify-between rounded-md border p-3"
                  >
                    <span className="text-card-foreground">{item}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onPress={() => removeItem(index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Button Variants */}
          <div className="space-y-4">
            <h2 className="text-foreground text-2xl font-semibold">
              Button Variants
            </h2>

            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-foreground text-lg font-medium">Sizes</h3>
                <div className="flex gap-2">
                  <Button size="sm" onPress={() => alert('Small button!')}>
                    Small
                  </Button>
                  <Button size="md" onPress={() => alert('Medium button!')}>
                    Medium
                  </Button>
                  <Button size="lg" onPress={() => alert('Large button!')}>
                    Large
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-foreground text-lg font-medium">
                  Variants
                </h3>
                <div className="flex flex-wrap gap-2">
                  <Button variant="primary" onPress={() => alert('Primary!')}>
                    Primary
                  </Button>
                  <Button
                    variant="secondary"
                    onPress={() => alert('Secondary!')}
                  >
                    Secondary
                  </Button>
                  <Button variant="outline" onPress={() => alert('Outline!')}>
                    Outline
                  </Button>
                  <Button variant="ghost" onPress={() => alert('Ghost!')}>
                    Ghost
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-foreground text-lg font-medium">States</h3>
                <div className="flex gap-2">
                  <Button onPress={() => alert('Normal!')}>Normal</Button>
                  <Button disabled>Disabled</Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PWA Features */}
        <div className="space-y-4">
          <h2 className="text-foreground text-2xl font-semibold">
            PWA Features
          </h2>
          <div className="border-input bg-card rounded-lg border p-6">
            <p className="text-card-foreground">
              This web app is a Progressive Web App (PWA) with offline support.
              You can install it on your device for a native app-like
              experience.
            </p>
            <div className="mt-4">
              <Button
                variant="primary"
                onPress={() => {
                  if ('serviceWorker' in navigator) {
                    navigator.serviceWorker
                      .register('/sw.js')
                      .then(() => alert('Service Worker registered!'))
                      .catch(() =>
                        alert('Service Worker registration failed!')
                      );
                  } else {
                    alert('Service Workers not supported in this browser');
                  }
                }}
              >
                Register Service Worker
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
