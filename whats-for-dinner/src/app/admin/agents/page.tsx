'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bot, 
  Settings, 
  Play, 
  Pause, 
  Edit, 
  Trash2, 
  Plus,
  Brain,
  ChefHat,
  BookOpen,
  TrendingUp,
  Users,
  Package,
  DollarSign
} from 'lucide-react';
import { agentOrchestrator, AIAgent, AgentPackage } from '@/lib/ai-agents/agentOrchestrator';

const AGENT_ICONS = {
  'dietary-coach': Brain,
  'chef': ChefHat,
  'ebook-generator': BookOpen,
  'trend-analyzer': TrendingUp,
  'meal-planner': Bot,
  'nutritionist': Brain,
  'shopping-assistant': Bot,
  'recipe-optimizer': Bot,
  'food-critic': Bot,
  'dietary-restriction-specialist': Brain,
};

export default function AgentsPage() {
  const [agents, setAgents] = useState<AIAgent[]>([]);
  const [packages, setPackages] = useState<AgentPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState<AIAgent | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const allAgents = agentOrchestrator.getAllAgents();
      const allPackages = agentOrchestrator.getAgentPackages();
      
      setAgents(allAgents);
      setPackages(allPackages);
    } catch (error) {
      console.error('Error loading agents:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAgentStatus = async (agentId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    // In a real implementation, you would update the agent status in the database
    console.log(`Toggling agent ${agentId} to ${newStatus}`);
    loadData(); // Reload data
  };

  if (loading) {
    return <div className="p-6">Loading agents...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">AI Agents Management</h1>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Agent
        </Button>
      </div>

      <Tabs defaultValue="agents" className="space-y-4">
        <TabsList>
          <TabsTrigger value="agents">Agents</TabsTrigger>
          <TabsTrigger value="packages">Packages</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="agents" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {agents.map((agent) => {
              const Icon = AGENT_ICONS[agent.type] || Bot;
              return (
                <Card key={agent.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{agent.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{agent.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={agent.status === 'active' ? 'default' : 'secondary'}
                      >
                        {agent.status}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleAgentStatus(agent.id, agent.status)}
                      >
                        {agent.status === 'active' ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {agent.description}
                    </p>
                    
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Capabilities:</div>
                      <div className="flex flex-wrap gap-1">
                        {agent.capabilities.map((capability) => (
                          <Badge key={capability} variant="outline" className="text-xs">
                            {capability}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 flex justify-between items-center">
                      <div className="text-xs text-muted-foreground">
                        v{agent.version}
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedAgent(agent)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => console.log('Delete agent', agent.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="packages" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {packages.map((pkg) => (
              <Card key={pkg.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{pkg.name}</CardTitle>
                    <Badge variant={pkg.isActive ? 'default' : 'secondary'}>
                      {pkg.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {pkg.description}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="text-2xl font-bold text-primary">
                        {pkg.price === 0 ? 'Free' : `$${pkg.price}`}
                        {pkg.price > 0 && (
                          <span className="text-sm text-muted-foreground">/{pkg.currency}</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="text-sm font-medium mb-2">Included Agents:</div>
                      <div className="space-y-1">
                        {pkg.agents.map((agentId) => {
                          const agent = agents.find(a => a.id === agentId);
                          return agent ? (
                            <div key={agentId} className="flex items-center gap-2 text-sm">
                              <Bot className="h-4 w-4" />
                              <span>{agent.name}</span>
                            </div>
                          ) : null;
                        })}
                      </div>
                    </div>

                    <div>
                      <div className="text-sm font-medium mb-2">Features:</div>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {pkg.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <div className="w-1 h-1 bg-primary rounded-full" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex gap-2">
                      <Button className="flex-1">
                        <Package className="h-4 w-4 mr-2" />
                        {pkg.price === 0 ? 'Activate' : 'Purchase'}
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <Bot className="h-8 w-8 text-primary" />
                  <div>
                    <div className="text-2xl font-bold">{agents.length}</div>
                    <div className="text-sm text-muted-foreground">Total Agents</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <Users className="h-8 w-8 text-green-600" />
                  <div>
                    <div className="text-2xl font-bold">
                      {agents.filter(a => a.status === 'active').length}
                    </div>
                    <div className="text-sm text-muted-foreground">Active Agents</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <Package className="h-8 w-8 text-blue-600" />
                  <div>
                    <div className="text-2xl font-bold">{packages.length}</div>
                    <div className="text-sm text-muted-foreground">Agent Packages</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-8 w-8 text-yellow-600" />
                  <div>
                    <div className="text-2xl font-bold">
                      ${packages.reduce((sum, pkg) => sum + pkg.price, 0)}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Revenue</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Agent Usage Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Analytics dashboard coming soon...
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Agent Details Modal */}
      {selectedAgent && (
        <AgentDetailsModal
          agent={selectedAgent}
          onClose={() => setSelectedAgent(null)}
        />
      )}
    </div>
  );
}

interface AgentDetailsModalProps {
  agent: AIAgent;
  onClose: () => void;
}

function AgentDetailsModal({ agent, onClose }: AgentDetailsModalProps) {
  const Icon = AGENT_ICONS[agent.type] || Bot;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Icon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">{agent.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{agent.type}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-sm text-muted-foreground">{agent.description}</p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Capabilities</h3>
            <div className="flex flex-wrap gap-2">
              {agent.capabilities.map((capability) => (
                <Badge key={capability} variant="outline">
                  {capability}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">System Prompt</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <pre className="text-sm whitespace-pre-wrap">{agent.systemPrompt}</pre>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Tools</h3>
            <div className="space-y-2">
              {agent.tools.map((tool, index) => (
                <div key={index} className="border rounded-lg p-3">
                  <div className="font-medium">{tool.name}</div>
                  <div className="text-sm text-muted-foreground">{tool.description}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button>
              <Settings className="h-4 w-4 mr-2" />
              Configure
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}