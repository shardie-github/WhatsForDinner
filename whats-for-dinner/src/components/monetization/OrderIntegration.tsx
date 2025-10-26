'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ShoppingCart, 
  Truck, 
  Store, 
  ChefHat, 
  ExternalLink,
  Clock,
  MapPin,
  Star,
  DollarSign,
  Users
} from 'lucide-react';
import { affiliateSystem, AffiliatePartner, ChefPartnership } from '@/lib/monetization/affiliateSystem';

interface OrderIntegrationProps {
  recipeId?: string;
  ingredients?: Array<{
    name: string;
    amount: string;
    unit: string;
  }>;
  userLocation?: {
    lat: number;
    lng: number;
    address: string;
  };
}

export function OrderIntegration({ recipeId, ingredients, userLocation }: OrderIntegrationProps) {
  const [deliveryPartners, setDeliveryPartners] = useState<AffiliatePartner[]>([]);
  const [groceryPartners, setGroceryPartners] = useState<AffiliatePartner[]>([]);
  const [chefPartnerships, setChefPartnerships] = useState<ChefPartnership[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPartner, setSelectedPartner] = useState<string | null>(null);
  const [orderStatus, setOrderStatus] = useState<'idle' | 'creating' | 'created' | 'error'>('idle');

  useEffect(() => {
    loadPartners();
  }, [userLocation]);

  const loadPartners = async () => {
    try {
      setLoading(true);
      
      // Get delivery partners
      const delivery = affiliateSystem.getDeliveryPartners('US'); // Default to US
      setDeliveryPartners(delivery);
      
      // Get grocery partners
      const grocery = affiliateSystem.getGroceryPartners('US');
      setGroceryPartners(grocery);
      
      // Get chef partnerships
      const chefs = affiliateSystem.getChefPartnerships();
      setChefPartnerships(chefs);
      
    } catch (error) {
      console.error('Error loading partners:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeliveryOrder = async (partnerId: string) => {
    if (!ingredients || !userLocation) {
      alert('Location and ingredients are required for delivery orders');
      return;
    }

    setOrderStatus('creating');
    setSelectedPartner(partnerId);

    try {
      // Convert ingredients to order items
      const items = ingredients.map(ingredient => ({
        id: `ingredient_${ingredient.name}`,
        name: ingredient.name,
        quantity: parseFloat(ingredient.amount) || 1,
        price: Math.random() * 10 + 5, // Mock pricing
        category: 'ingredient',
        description: `${ingredient.amount} ${ingredient.unit}`
      }));

      const order = await affiliateSystem.createDeliveryOrder(
        partnerId,
        'current_user_id', // In real app, get from auth context
        'Recipe Ingredients',
        items,
        userLocation
      );

      setOrderStatus('created');
      console.log('Delivery order created:', order);
    } catch (error) {
      console.error('Error creating delivery order:', error);
      setOrderStatus('error');
    }
  };

  const handleGroceryOrder = async (partnerId: string) => {
    if (!ingredients || !userLocation) {
      alert('Location and ingredients are required for grocery orders');
      return;
    }

    setOrderStatus('creating');
    setSelectedPartner(partnerId);

    try {
      // Convert ingredients to order items
      const items = ingredients.map(ingredient => ({
        id: `ingredient_${ingredient.name}`,
        name: ingredient.name,
        quantity: parseFloat(ingredient.amount) || 1,
        price: Math.random() * 8 + 3, // Mock pricing
        category: 'ingredient',
        description: `${ingredient.amount} ${ingredient.unit}`
      }));

      const order = await affiliateSystem.createGroceryOrder(
        partnerId,
        'current_user_id',
        'Local Grocery Store',
        items,
        userLocation
      );

      setOrderStatus('created');
      console.log('Grocery order created:', order);
    } catch (error) {
      console.error('Error creating grocery order:', error);
      setOrderStatus('error');
    }
  };

  const handleChefPackagePurchase = async (chefId: string, packageId: string) => {
    setOrderStatus('creating');
    setSelectedPartner(chefId);

    try {
      const result = await affiliateSystem.purchaseChefPackage(
        chefId,
        packageId,
        'current_user_id'
      );

      if (result.success) {
        setOrderStatus('created');
        console.log('Chef package purchased:', result);
      }
    } catch (error) {
      console.error('Error purchasing chef package:', error);
      setOrderStatus('error');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading partners...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          Order Ingredients & More
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="delivery" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="delivery" className="flex items-center gap-2">
              <Truck className="h-4 w-4" />
              Delivery
            </TabsTrigger>
            <TabsTrigger value="grocery" className="flex items-center gap-2">
              <Store className="h-4 w-4" />
              Grocery
            </TabsTrigger>
            <TabsTrigger value="chef" className="flex items-center gap-2">
              <ChefHat className="h-4 w-4" />
              Chef Packages
            </TabsTrigger>
          </TabsList>

          <TabsContent value="delivery" className="space-y-4">
            <div className="text-sm text-muted-foreground mb-4">
              Get ingredients delivered from restaurants
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {deliveryPartners.map((partner) => (
                <Card key={partner.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {partner.logoUrl && (
                          <img 
                            src={partner.logoUrl} 
                            alt={partner.name}
                            className="h-8 w-8 object-contain"
                          />
                        )}
                        <div>
                          <CardTitle className="text-lg">{partner.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {partner.commissionRate}% commission
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline">
                        {partner.commissionRate}%
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {partner.description}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                      <Clock className="h-4 w-4" />
                      <span>30-45 min delivery</span>
                    </div>
                    <Button 
                      onClick={() => handleDeliveryOrder(partner.id)}
                      disabled={orderStatus === 'creating' && selectedPartner === partner.id}
                      className="w-full"
                    >
                      {orderStatus === 'creating' && selectedPartner === partner.id ? (
                        'Creating Order...'
                      ) : (
                        <>
                          Order Now
                          <ExternalLink className="h-4 w-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="grocery" className="space-y-4">
            <div className="text-sm text-muted-foreground mb-4">
              Order fresh ingredients from grocery stores
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {groceryPartners.map((partner) => (
                <Card key={partner.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {partner.logoUrl && (
                          <img 
                            src={partner.logoUrl} 
                            alt={partner.name}
                            className="h-8 w-8 object-contain"
                          />
                        )}
                        <div>
                          <CardTitle className="text-lg">{partner.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {partner.commissionRate}% commission
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline">
                        {partner.commissionRate}%
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {partner.description}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                      <MapPin className="h-4 w-4" />
                      <span>Pickup or delivery available</span>
                    </div>
                    <Button 
                      onClick={() => handleGroceryOrder(partner.id)}
                      disabled={orderStatus === 'creating' && selectedPartner === partner.id}
                      className="w-full"
                    >
                      {orderStatus === 'creating' && selectedPartner === partner.id ? (
                        'Creating Order...'
                      ) : (
                        <>
                          Order Groceries
                          <ExternalLink className="h-4 w-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="chef" className="space-y-4">
            <div className="text-sm text-muted-foreground mb-4">
              Learn from professional chefs with exclusive packages
            </div>
            <div className="space-y-6">
              {chefPartnerships.map((chef) => (
                <Card key={chef.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      {chef.profileImageUrl && (
                        <img 
                          src={chef.profileImageUrl} 
                          alt={chef.chefName}
                          className="h-16 w-16 rounded-full object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <CardTitle className="text-xl">{chef.chefName}</CardTitle>
                        <p className="text-sm text-muted-foreground mb-2">
                          {chef.specialty} • {chef.commissionRate}% commission
                        </p>
                        {chef.bio && (
                          <p className="text-sm">{chef.bio}</p>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                      {chef.packages.map((package_) => (
                        <Card key={package_.id} className="relative">
                          {package_.isPopular && (
                            <Badge className="absolute -top-2 left-4 bg-primary">
                              Popular
                            </Badge>
                          )}
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-lg">{package_.name}</CardTitle>
                              <div className="text-right">
                                <div className="text-2xl font-bold">
                                  ${package_.price}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {package_.duration}
                                </div>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {package_.description}
                            </p>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2 mb-4">
                              <div className="text-sm font-medium">Includes:</div>
                              <ul className="text-sm text-muted-foreground space-y-1">
                                {package_.includes.map((item, index) => (
                                  <li key={index} className="flex items-center gap-2">
                                    <div className="w-1 h-1 bg-primary rounded-full" />
                                    {item}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <Button 
                              onClick={() => handleChefPackagePurchase(chef.id, package_.id)}
                              disabled={orderStatus === 'creating' && selectedPartner === chef.id}
                              className="w-full"
                            >
                              {orderStatus === 'creating' && selectedPartner === chef.id ? (
                                'Processing...'
                              ) : (
                                <>
                                  Purchase Package
                                  <DollarSign className="h-4 w-4 ml-2" />
                                </>
                              )}
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {orderStatus === 'created' && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 text-green-800">
              <Star className="h-4 w-4" />
              <span className="font-medium">Order Created Successfully!</span>
            </div>
            <p className="text-sm text-green-700 mt-1">
              You'll receive a confirmation email shortly with tracking details.
            </p>
          </div>
        )}

        {orderStatus === 'error' && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-800">
              <Users className="h-4 w-4" />
              <span className="font-medium">Order Failed</span>
            </div>
            <p className="text-sm text-red-700 mt-1">
              There was an error creating your order. Please try again.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}