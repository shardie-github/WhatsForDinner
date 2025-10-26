'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import PantryManager from '@/components/PantryManager';
import Navbar from '@/components/Navbar';

export default function PantryPage() {
  const [user, setUser] = useState<any>(null);
  const [pantryItems, setPantryItems] = useState<
    Array<{ id: number; ingredient: string; quantity: number }>
  >([]);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data: pantry } = await supabase
          .from('pantry_items')
          .select('*')
          .eq('user_id', user.id)
          .order('ingredient');

        if (pantry) {
          setPantryItems(pantry);
        }
      }
    };

    getUser();
  }, []);

  const addItem = async (ingredient: string, quantity: number) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('pantry_items')
        .insert({
          user_id: user.id,
          ingredient,
          quantity,
        })
        .select()
        .single();

      if (error) throw error;
      setPantryItems([...pantryItems, data]);
    } catch (error) {
      console.error('Error adding item:', error);
    }
  };

  const updateItem = async (id: number, quantity: number) => {
    try {
      const { error } = await supabase
        .from('pantry_items')
        .update({ quantity })
        .eq('id', id);

      if (error) throw error;

      setPantryItems(
        pantryItems.map(item => (item.id === id ? { ...item, quantity } : item))
      );
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  const deleteItem = async (id: number) => {
    try {
      const { error } = await supabase
        .from('pantry_items')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setPantryItems(pantryItems.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900">
            Pantry Manager
          </h1>
          <p className="text-lg text-gray-600">
            Manage your ingredients and quantities
          </p>
        </div>

        <PantryManager
          items={pantryItems}
          onAdd={addItem}
          onUpdate={updateItem}
          onDelete={deleteItem}
        />
      </main>
    </div>
  );
}
