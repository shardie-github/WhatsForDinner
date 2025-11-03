'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { RealtimeChannel } from '@supabase/supabase-js';

/**
 * Real-time family chat subscription
 */
export function useRealtimeFamilyChat(familyId: string | undefined) {
  const [messages, setMessages] = useState<any[]>([]);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!familyId) return;

    // Subscribe to chat messages
    const chatChannel = supabase
      .channel(`family-chat:${familyId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'family_chat_messages',
          filter: `family_id=eq.${familyId}`,
        },
        (payload) => {
          // Fetch full message with user profile
          supabase
            .from('family_chat_messages')
            .select('*, user_profiles(*)')
            .eq('id', payload.new.id)
            .single()
            .then(({ data }) => {
              if (data) {
                setMessages((prev) => [...prev, data]);
              }
            });
        }
      )
      .subscribe();

    setChannel(chatChannel);

    return () => {
      supabase.removeChannel(chatChannel);
    };
  }, [familyId]);

  return { messages, setMessages, channel };
}

/**
 * Real-time family activity feed subscription
 */
export function useRealtimeFamilyActivity(familyId: string | undefined) {
  const [activities, setActivities] = useState<any[]>([]);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!familyId) return;

    const activityChannel = supabase
      .channel(`family-activity:${familyId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'family_activities',
          filter: `family_id=eq.${familyId}`,
        },
        (payload) => {
          // Fetch full activity with user profile
          supabase
            .from('family_activities')
            .select('*, user_profiles(*)')
            .eq('id', payload.new.id)
            .single()
            .then(({ data }) => {
              if (data) {
                setActivities((prev) => [data, ...prev]);
              }
            });
        }
      )
      .subscribe();

    setChannel(activityChannel);

    return () => {
      supabase.removeChannel(activityChannel);
    };
  }, [familyId]);

  return { activities, setActivities, channel };
}

/**
 * Real-time grocery list updates
 */
export function useRealtimeGroceryList(groceryListId: string | undefined) {
  const [items, setItems] = useState<any[]>([]);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!groceryListId) return;

    const listChannel = supabase
      .channel(`grocery-list:${groceryListId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'grocery_list_items',
          filter: `grocery_list_id=eq.${groceryListId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setItems((prev) => [...prev, payload.new]);
          } else if (payload.eventType === 'UPDATE') {
            setItems((prev) =>
              prev.map((item) =>
                item.id === payload.new.id ? payload.new : item
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setItems((prev) => prev.filter((item) => item.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    setChannel(listChannel);

    return () => {
      supabase.removeChannel(listChannel);
    };
  }, [groceryListId]);

  return { items, setItems, channel };
}

/**
 * Real-time meal plan updates
 */
export function useRealtimeMealPlans(familyId: string | undefined) {
  const [mealPlans, setMealPlans] = useState<any[]>([]);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!familyId) return;

    const mealChannel = supabase
      .channel(`family-meal-plans:${familyId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'meal_plans',
          filter: `family_id=eq.${familyId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setMealPlans((prev) => [...prev, payload.new]);
          } else if (payload.eventType === 'UPDATE') {
            setMealPlans((prev) =>
              prev.map((plan) =>
                plan.id === payload.new.id ? payload.new : plan
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setMealPlans((prev) =>
              prev.filter((plan) => plan.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    setChannel(mealChannel);

    return () => {
      supabase.removeChannel(mealChannel);
    };
  }, [familyId]);

  return { mealPlans, setMealPlans, channel };
}
