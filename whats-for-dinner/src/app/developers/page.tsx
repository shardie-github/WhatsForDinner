'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Code, 
  Download, 
  Key, 
  BarChart3, 
  BookOpen, 
  Play,
  Copy,
  Check,
  ExternalLink
} from 'lucide-react'

interface SDKInfo {
  language: string
  version: string
  downloadCount: number
  lastUpdated: string
  documentation: string
  examples: string[]
}

interface APIKey {
  id: string
  name: string
  key: string
  permissions: string[]
  rateLimits: any
  isActive: boolean
  lastUsed?: string
  createdAt: string
}

interface APIUsage {
  totalRequests: number
  totalCost: number
  averageResponseTime: number
  successRate: number
  topEndpoints: Array<{
    endpoint: string
    requests: number
    cost: number
  }>
}

export default function DevelopersPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [apiKeys, setApiKeys] = useState<APIKey[]>([])
  const [usage, setUsage] = useState<APIUsage | null>(null)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [newKeyName, setNewKeyName] = useState('')
  const [isCreatingKey, setIsCreatingKey] = useState(false)

  const sdks: SDKInfo[] = [
    {
      language: 'JavaScript',
      version: '2.1.0',
      downloadCount: 15420,
      lastUpdated: '2024-01-15',
      documentation: '/docs/javascript',
      examples: ['Basic Usage', 'Authentication', 'Error Handling', 'Webhooks']
    },
    {
      language: 'Python',
      version: '1.8.2',
      downloadCount: 8930,
      lastUpdated: '2024-01-12',
      documentation: '/docs/python',
      examples: ['Quick Start', 'Async Operations', 'Data Processing', 'Testing']
    },
    {
      language: 'Kotlin',
      version: '1.5.1',
      downloadCount: 3240,
      lastUpdated: '2024-01-10',
      documentation: '/docs/kotlin',
      examples: ['Android Integration', 'Coroutines', 'Data Classes', 'Networking']
    },
    {
      language: 'Swift',
      version: '1.3.0',
      downloadCount: 2890,
      lastUpdated: '2024-01-08',
      documentation: '/docs/swift',
      examples: ['iOS Integration', 'Combine', 'Codable', 'URLSession']
    },
    {
      language: 'Go',
      version: '1.2.0',
      downloadCount: 1560,
      lastUpdated: '2024-01-05',
      documentation: '/docs/go',
      examples: ['HTTP Client', 'Context', 'Error Handling', 'Testing']
    }
  ]

  useEffect(() => {
    loadAPIKeys()
    loadUsage()
  }, [])

  const loadAPIKeys = async () => {
    try {
      const response = await fetch('/api/developers/keys')
      const data = await response.json()
      setApiKeys(data.keys || [])
    } catch (error) {
      console.error('Error loading API keys:', error)
    }
  }

  const loadUsage = async () => {
    try {
      const response = await fetch('/api/developers/usage')
      const data = await response.json()
      setUsage(data.usage || null)
    } catch (error) {
      console.error('Error loading usage:', error)
    }
  }

  const createAPIKey = async () => {
    if (!newKeyName.trim()) return

    setIsCreatingKey(true)
    try {
      const response = await fetch('/api/developers/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newKeyName })
      })
      
      const data = await response.json()
      if (data.success) {
        setApiKeys([...apiKeys, data.key])
        setNewKeyName('')
      }
    } catch (error) {
      console.error('Error creating API key:', error)
    } finally {
      setIsCreatingKey(false)
    }
  }

  const copyToClipboard = async (text: string, keyId: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedKey(keyId)
      setTimeout(() => setCopiedKey(null), 2000)
    } catch (error) {
      console.error('Error copying to clipboard:', error)
    }
  }

  const toggleAPIKey = async (keyId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/developers/keys/${keyId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive })
      })
      
      if (response.ok) {
        setApiKeys(apiKeys.map(key => 
          key.id === keyId ? { ...key, isActive: !isActive } : key
        ))
      }
    } catch (error) {
      console.error('Error toggling API key:', error)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Developer Portal</h1>
        <p className="text-xl text-muted-foreground">
          Build amazing applications with our federated API ecosystem
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sdks">SDKs</TabsTrigger>
          <TabsTrigger value="api-keys">API Keys</TabsTrigger>
          <TabsTrigger value="usage">Usage</TabsTrigger>
          <TabsTrigger value="docs">Documentation</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{usage?.totalRequests.toLocaleString() || '0'}</div>
                <p className="text-xs text-muted-foreground">+12% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">API Cost</CardTitle>
                <Code className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${usage?.totalCost.toFixed(2) || '0.00'}</div>
                <p className="text-xs text-muted-foreground">+8% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                <Check className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{(usage?.successRate * 100).toFixed(1) || '0'}%</div>
                <p className="text-xs text-muted-foreground">+2% from last month</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Quick Start</CardTitle>
              <CardDescription>
                Get started with our API in minutes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <pre className="text-sm">
{`# Install the SDK
npm install @whats-for-dinner/api

# Initialize the client
import { WhatsForDinnerAPI } from '@whats-for-dinner/api'

const api = new WhatsForDinnerAPI({
  apiKey: 'your-api-key',
  tenantId: 'your-tenant-id'
})

# Generate recipes
const recipes = await api.recipes.generate({
  ingredients: ['chicken', 'rice', 'vegetables'],
  preferences: 'healthy'
})`}
                </pre>
              </div>
              <Button className="w-full">
                <Play className="mr-2 h-4 w-4" />
                Try in Playground
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sdks" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sdks.map((sdk) => (
              <Card key={sdk.language}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Code className="h-5 w-5" />
                      {sdk.language}
                    </CardTitle>
                    <Badge variant="secondary">v{sdk.version}</Badge>
                  </div>
                  <CardDescription>
                    {sdk.downloadCount.toLocaleString()} downloads
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    Last updated: {sdk.lastUpdated}
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Examples:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {sdk.examples.map((example, index) => (
                        <li key={index}>• {example}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1">
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                    <Button size="sm" variant="outline">
                      <BookOpen className="mr-2 h-4 w-4" />
                      Docs
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="api-keys" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>API Keys</CardTitle>
              <CardDescription>
                Manage your API keys and access permissions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="New API key name"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                />
                <Button 
                  onClick={createAPIKey}
                  disabled={isCreatingKey || !newKeyName.trim()}
                >
                  {isCreatingKey ? 'Creating...' : 'Create Key'}
                </Button>
              </div>

              <div className="space-y-2">
                {apiKeys.map((key) => (
                  <div key={key.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{key.name}</h4>
                        <Badge variant={key.isActive ? 'default' : 'secondary'}>
                          {key.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Created: {new Date(key.createdAt).toLocaleDateString()}
                        {key.lastUsed && (
                          <span> • Last used: {new Date(key.lastUsed).toLocaleDateString()}</span>
                        )}
                      </div>
                      <div className="text-xs font-mono bg-muted px-2 py-1 rounded mt-2">
                        {key.key.substring(0, 20)}...
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(key.key, key.id)}
                      >
                        {copiedKey === key.id ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleAPIKey(key.id, key.isActive)}
                      >
                        {key.isActive ? 'Disable' : 'Enable'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usage" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>API Usage</CardTitle>
              <CardDescription>
                Monitor your API usage and costs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{usage?.totalRequests.toLocaleString() || '0'}</div>
                  <div className="text-sm text-muted-foreground">Total Requests</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">${usage?.totalCost.toFixed(2) || '0.00'}</div>
                  <div className="text-sm text-muted-foreground">Total Cost</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{usage?.averageResponseTime.toFixed(0) || '0'}ms</div>
                  <div className="text-sm text-muted-foreground">Avg Response Time</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{(usage?.successRate * 100).toFixed(1) || '0'}%</div>
                  <div className="text-sm text-muted-foreground">Success Rate</div>
                </div>
              </div>

              {usage?.topEndpoints && (
                <div>
                  <h4 className="font-medium mb-4">Top Endpoints</h4>
                  <div className="space-y-2">
                    {usage.topEndpoints.map((endpoint, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                        <div className="font-mono text-sm">{endpoint.endpoint}</div>
                        <div className="text-sm text-muted-foreground">
                          {endpoint.requests.toLocaleString()} requests • ${endpoint.cost.toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="docs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>API Documentation</CardTitle>
              <CardDescription>
                Comprehensive guides and reference materials
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Getting Started</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• <a href="#" className="text-blue-600 hover:underline">Quick Start Guide</a></li>
                    <li>• <a href="#" className="text-blue-600 hover:underline">Authentication</a></li>
                    <li>• <a href="#" className="text-blue-600 hover:underline">Rate Limits</a></li>
                    <li>• <a href="#" className="text-blue-600 hover:underline">Error Handling</a></li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">API Reference</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• <a href="#" className="text-blue-600 hover:underline">Recipes API</a></li>
                    <li>• <a href="#" className="text-blue-600 hover:underline">Pantry API</a></li>
                    <li>• <a href="#" className="text-blue-600 hover:underline">Federation API</a></li>
                    <li>• <a href="#" className="text-blue-600 hover:underline">Webhooks</a></li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Integrations</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• <a href="#" className="text-blue-600 hover:underline">Shopify</a></li>
                    <li>• <a href="#" className="text-blue-600 hover:underline">Zapier</a></li>
                    <li>• <a href="#" className="text-blue-600 hover:underline">Alexa Skills</a></li>
                    <li>• <a href="#" className="text-blue-600 hover:underline">Google Home</a></li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Resources</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• <a href="#" className="text-blue-600 hover:underline">Changelog</a></li>
                    <li>• <a href="#" className="text-blue-600 hover:underline">Status Page</a></li>
                    <li>• <a href="#" className="text-blue-600 hover:underline">Support</a></li>
                    <li>• <a href="#" className="text-blue-600 hover:underline">Community</a></li>
                  </ul>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button className="w-full">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Open Full Documentation
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}