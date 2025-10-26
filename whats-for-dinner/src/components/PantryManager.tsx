'use client';

import { useState } from 'react';

interface PantryItem {
  id: number;
  ingredient: string;
  quantity: number;
}

interface PantryManagerProps {
  items: PantryItem[];
  onAdd: (ingredient: string, quantity: number) => void;
  onUpdate: (id: number, quantity: number) => void;
  onDelete: (id: number) => void;
}

export default function PantryManager({
  items,
  onAdd,
  onUpdate,
  onDelete,
}: PantryManagerProps) {
  const [newIngredient, setNewIngredient] = useState('');
  const [newQuantity, setNewQuantity] = useState(1);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newIngredient.trim()) {
      onAdd(newIngredient.trim(), newQuantity);
      setNewIngredient('');
      setNewQuantity(1);
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <form
        className="mb-8 rounded-lg bg-white p-6 shadow-md"
        onSubmit={handleAdd}
      >
        <h2 className="mb-4 text-xl font-semibold text-gray-900">
          Add New Item
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Ingredient
            </label>
            <input
              required
              type="text"
              value={newIngredient}
              placeholder="e.g., tomatoes, chicken breast..."
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={e => setNewIngredient(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Quantity
            </label>
            <input
              type="number"
              value={newQuantity}
              min="1"
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={e => setNewQuantity(Number(e.target.value))}
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
            >
              Add Item
            </button>
          </div>
        </div>
      </form>

      <div className="overflow-hidden rounded-lg bg-white shadow-md">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-900">Your Pantry</h2>
        </div>

        {items.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No items in your pantry yet. Add some ingredients to get started!
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {items.map(item => (
              <div
                key={item.id}
                className="flex items-center justify-between px-6 py-4"
              >
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">
                    {item.ingredient}
                  </h3>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <button
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
                      onClick={() =>
                        onUpdate(item.id, Math.max(1, item.quantity - 1))
                      }
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-medium">
                      {item.quantity}
                    </span>
                    <button
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
                      onClick={() => onUpdate(item.id, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                  <button
                    className="p-2 text-red-600 hover:text-red-800"
                    onClick={() => onDelete(item.id)}
                  >
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
