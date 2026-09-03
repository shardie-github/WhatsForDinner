'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera,
  Upload,
  Receipt,
  Refrigerator,
  Archive,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  Plus,
  ArrowRight,
  TrendingUp,
  Leaf,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export interface DetectedItem {
  id: string;
  name: string;
  category: 'protein' | 'produce' | 'dairy' | 'grain' | 'staple';
  quantity: string;
  confidence: number;
  estimatedShelfLifeDays: number;
  expirationHazard: 'low' | 'medium' | 'high';
  suggestedAction: string;
}

interface VisionScannerProps {
  onItemsAdded?: (items: string[]) => void;
  className?: string;
}

export function VisionScanner({ onItemsAdded, className = '' }: VisionScannerProps) {
  const [scanMode, setScanMode] = useState<'fridge' | 'pantry' | 'receipt'>('fridge');
  const [isScanning, setIsScanning] = useState(false);
  const [detectedItems, setDetectedItems] = useState<DetectedItem[]>([]);
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [impact, setImpact] = useState<{ dollarsSaved: number; co2PreventedKg: number } | null>(null);

  const handleScan = async (mode = scanMode) => {
    setIsScanning(true);
    try {
      const res = await fetch('/api/pantry/vision-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode }),
      });

      const data = await res.json();
      if (data.success) {
        setDetectedItems(data.items);
        setSelectedItemIds(data.items.map((i: DetectedItem) => i.id));
        setImpact(data.impact);
        toast.success(`Vision AI recognized ${data.detectedCount} ingredients!`, {
          description: `${data.highRiskCount} items flagged for quick use to prevent waste.`,
        });
      } else {
        toast.error(data.error || 'Failed to analyze image');
      }
    } catch {
      toast.error('Could not connect to vision recognition service');
    } finally {
      setIsScanning(false);
    }
  };

  const toggleItem = (id: string) => {
    setSelectedItemIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleAddSelectedToPantry = async () => {
    const selected = detectedItems.filter(i => selectedItemIds.includes(i.id));
    if (selected.length === 0) return;

    try {
      const res = await fetch('/api/pantry/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: selected.map(i => ({
            name: i.name,
            category: i.category,
            quantity: 1,
            unit: i.quantity,
          })),
          source: 'vision_scanner',
        }),
      });

      const result = await res.json();
      if (result.success) {
        toast.success(`Added ${selected.length} items directly to your pantry!`);
        if (onItemsAdded) {
          onItemsAdded(selected.map(i => i.name));
        }
      }
    } catch {
      toast.error('Failed to sync items to pantry');
    }
  };

  return (
    <Card className={`border shadow-xl overflow-hidden ${className}`}>
      <CardHeader className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent pb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle className="text-xl sm:text-2xl font-bold flex items-center gap-2">
              <Camera className="w-5 h-5 text-primary" />
              <span>VisionPantry™ Multimodal Scanner</span>
            </CardTitle>
            <CardDescription className="text-sm mt-1">
              Snap a photo of your fridge, pantry shelf, or receipt. Neural vision auto-extracts ingredients and calculates expiration hazards.
            </CardDescription>
          </div>
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
            <Sparkles className="w-3 h-3 mr-1" />
            AI Multimodal v2.4
          </Badge>
        </div>

        {/* Scan Mode Toggle */}
        <div className="flex flex-wrap gap-2 pt-3">
          {[
            { id: 'fridge', label: 'Fridge Photo', icon: Refrigerator },
            { id: 'pantry', label: 'Pantry Shelves', icon: Archive },
            { id: 'receipt', label: 'Grocery Receipt', icon: Receipt },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = scanMode === tab.id;
            return (
              <Button
                key={tab.id}
                variant={isActive ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setScanMode(tab.id as typeof scanMode);
                  handleScan(tab.id as typeof scanMode);
                }}
                disabled={isScanning}
                className="text-xs h-8"
              >
                <Icon className="w-3.5 h-3.5 mr-1.5" />
                {tab.label}
              </Button>
            );
          })}
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Upload Dropzone / Trigger Area */}
        <div
          onClick={() => handleScan(scanMode)}
          className="cursor-pointer border-2 border-dashed rounded-2xl p-8 text-center transition-all bg-muted/20 hover:bg-muted/40 border-muted-foreground/20 hover:border-primary/50 group"
        >
          {isScanning ? (
            <div className="space-y-3 py-4">
              <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto" />
              <p className="font-semibold text-sm">
                Scanning image with neural vision algorithms...
              </p>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Extracting item boundaries, matching against nutrition database, and estimating shelf-life decay curves.
              </p>
            </div>
          ) : (
            <div className="space-y-3 py-2">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <p className="font-semibold text-sm">
                  Click to simulate {scanMode === 'receipt' ? 'Receipt OCR' : 'Fridge Camera Scan'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Supports JPEG, PNG, HEIC, or live mobile camera snapshot
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Impact Ticker if Scanned */}
        {impact && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20"
          >
            <div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
                <TrendingUp className="w-3.5 h-3.5 text-green-600" />
                <span>Food Value Rescued</span>
              </div>
              <p className="text-lg font-extrabold text-foreground mt-0.5">
                ${impact.dollarsSaved}
              </p>
            </div>
            <div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
                <Leaf className="w-3.5 h-3.5 text-emerald-600" />
                <span>CO2 Emissions Prevented</span>
              </div>
              <p className="text-lg font-extrabold text-foreground mt-0.5">
                {impact.co2PreventedKg} kg
              </p>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <div className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>Urgent Expiration Risk</span>
              </div>
              <p className="text-lg font-extrabold text-foreground mt-0.5">
                {detectedItems.filter(i => i.expirationHazard === 'high').length} items
              </p>
            </div>
          </motion.div>
        )}

        {/* Detected Items Grid */}
        <AnimatePresence>
          {detectedItems.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold tracking-tight">
                  Recognized Ingredients ({selectedItemIds.length}/{detectedItems.length})
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setSelectedItemIds(
                      selectedItemIds.length === detectedItems.length
                        ? []
                        : detectedItems.map(i => i.id)
                    )
                  }
                  className="text-xs h-7"
                >
                  {selectedItemIds.length === detectedItems.length ? 'Deselect All' : 'Select All'}
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {detectedItems.map(item => {
                  const isSelected = selectedItemIds.includes(item.id);
                  const isUrgent = item.expirationHazard === 'high';

                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleItem(item.id)}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex items-start gap-3 ${
                        isSelected
                          ? 'border-primary bg-primary/5 shadow-sm'
                          : 'border-muted opacity-60 bg-background hover:opacity-100'
                      }`}
                    >
                      <div className="pt-0.5">
                        {isSelected ? (
                          <CheckCircle2 className="w-4 h-4 text-primary" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-muted-foreground/30" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-semibold text-sm truncate">
                            {item.name}
                          </span>
                          <Badge
                            variant="outline"
                            className={`text-[10px] px-1.5 py-0 capitalize ${
                              isUrgent
                                ? 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400 border-red-200'
                                : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {isUrgent && <AlertTriangle className="w-2.5 h-2.5 mr-1" />}
                            {item.quantity}
                          </Badge>
                        </div>

                        <p className="text-xs text-muted-foreground truncate">
                          {item.suggestedAction}
                        </p>

                        <div className="flex items-center gap-2 pt-0.5 text-[11px] text-muted-foreground font-medium">
                          <span>Shelf-life: {item.estimatedShelfLifeDays}d</span>
                          <span>•</span>
                          <span>Confidence: {Math.round(item.confidence * 100)}%</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Action Bar */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t">
                <Button
                  onClick={handleAddSelectedToPantry}
                  disabled={selectedItemIds.length === 0}
                  className="font-semibold"
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  <span>Add {selectedItemIds.length} Items to Smart Pantry</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
