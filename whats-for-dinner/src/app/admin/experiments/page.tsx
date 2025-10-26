'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Play, 
  Pause, 
  BarChart3, 
  Users, 
  TrendingUp,
  Settings,
  Target
} from 'lucide-react';
import { featureFlags, FeatureFlag, ExperimentConfig } from '@/lib/featureFlags';

export default function ExperimentsPage() {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFlag, setSelectedFlag] = useState<FeatureFlag | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingFlag, setEditingFlag] = useState<FeatureFlag | null>(null);

  useEffect(() => {
    loadFlags();
  }, []);

  const loadFlags = async () => {
    try {
      const allFlags = await featureFlags.getAllFlags();
      setFlags(allFlags);
    } catch (error) {
      console.error('Error loading flags:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFlag = async (flagData: Partial<FeatureFlag>) => {
    try {
      await featureFlags.createFlag(flagData as FeatureFlag);
      await loadFlags();
      setShowCreateForm(false);
    } catch (error) {
      console.error('Error creating flag:', error);
    }
  };

  const handleUpdateFlag = async (flagId: string, updates: Partial<FeatureFlag>) => {
    try {
      await featureFlags.updateFlag(flagId, updates);
      await loadFlags();
      setEditingFlag(null);
    } catch (error) {
      console.error('Error updating flag:', error);
    }
  };

  const handleDeleteFlag = async (flagId: string) => {
    if (confirm('Are you sure you want to delete this feature flag?')) {
      try {
        await featureFlags.deleteFlag(flagId);
        await loadFlags();
      } catch (error) {
        console.error('Error deleting flag:', error);
      }
    }
  };

  const toggleFlag = async (flagId: string, enabled: boolean) => {
    await handleUpdateFlag(flagId, { enabled });
  };

  if (loading) {
    return <div className="p-6">Loading experiments...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Feature Flags & Experiments</h1>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Flag
        </Button>
      </div>

      <Tabs defaultValue="flags" className="space-y-4">
        <TabsList>
          <TabsTrigger value="flags">Feature Flags</TabsTrigger>
          <TabsTrigger value="experiments">Active Experiments</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="flags" className="space-y-4">
          <div className="grid gap-4">
            {flags.map((flag) => (
              <Card key={flag.id}>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{flag.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{flag.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={flag.enabled ? 'default' : 'secondary'}>
                      {flag.enabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                    <Switch
                      checked={flag.enabled}
                      onCheckedChange={(enabled) => toggleFlag(flag.id, enabled)}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingFlag(flag)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteFlag(flag.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <Label className="text-xs text-muted-foreground">Rollout</Label>
                      <p>{flag.rolloutPercentage}%</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Variants</Label>
                      <p>{flag.variants.length}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Created</Label>
                      <p>{new Date(flag.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Updated</Label>
                      <p>{new Date(flag.updatedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  {flag.experiment && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <BarChart3 className="h-4 w-4" />
                        <span className="font-medium">Experiment: {flag.experiment.name}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {flag.experiment.description}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="experiments" className="space-y-4">
          <div className="grid gap-4">
            {flags
              .filter(flag => flag.experiment && flag.enabled)
              .map((flag) => (
                <Card key={flag.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      {flag.experiment!.name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {flag.experiment!.description}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {flag.variants.length}
                        </div>
                        <div className="text-sm text-muted-foreground">Variants</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {flag.rolloutPercentage}%
                        </div>
                        <div className="text-sm text-muted-foreground">Rollout</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {flag.experiment!.metrics.length}
                        </div>
                        <div className="text-sm text-muted-foreground">Metrics</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">
                          {Math.round(flag.experiment!.successCriteria.confidenceLevel * 100)}%
                        </div>
                        <div className="text-sm text-muted-foreground">Confidence</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Start Date:</span>
                        <span>{new Date(flag.experiment!.startDate).toLocaleDateString()}</span>
                      </div>
                      {flag.experiment!.endDate && (
                        <div className="flex justify-between text-sm">
                          <span>End Date:</span>
                          <span>{new Date(flag.experiment!.endDate).toLocaleDateString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span>Primary Metric:</span>
                        <span>{flag.experiment!.successCriteria.primaryMetric}</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex gap-2">
                      <Button size="sm" variant="outline">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        View Results
                      </Button>
                      <Button size="sm" variant="outline">
                        <Settings className="h-4 w-4 mr-2" />
                        Configure
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Experiment Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  Analytics dashboard coming soon...
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create/Edit Flag Modal */}
      {(showCreateForm || editingFlag) && (
        <CreateFlagModal
          flag={editingFlag}
          onSave={editingFlag ? handleUpdateFlag : handleCreateFlag}
          onClose={() => {
            setShowCreateForm(false);
            setEditingFlag(null);
          }}
        />
      )}
    </div>
  );
}

interface CreateFlagModalProps {
  flag?: FeatureFlag | null;
  onSave: (flagId: string, data: Partial<FeatureFlag>) => void;
  onClose: () => void;
}

function CreateFlagModal({ flag, onSave, onClose }: CreateFlagModalProps) {
  const [formData, setFormData] = useState({
    name: flag?.name || '',
    description: flag?.description || '',
    enabled: flag?.enabled || false,
    rolloutPercentage: flag?.rolloutPercentage || 0,
    variants: flag?.variants || [{ id: '1', name: 'Control', value: true, weight: 50 }],
    targeting: flag?.targeting || {},
    experiment: flag?.experiment || null,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(flag?.id || '', formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>{flag ? 'Edit Feature Flag' : 'Create Feature Flag'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="rolloutPercentage">Rollout Percentage</Label>
                <Input
                  id="rolloutPercentage"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.rolloutPercentage}
                  onChange={(e) => setFormData(prev => ({ ...prev, rolloutPercentage: parseInt(e.target.value) }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="enabled"
                checked={formData.enabled}
                onCheckedChange={(enabled) => setFormData(prev => ({ ...prev, enabled }))}
              />
              <Label htmlFor="enabled">Enabled</Label>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                {flag ? 'Update' : 'Create'} Flag
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}