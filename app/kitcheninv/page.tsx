"use client"

 import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Edit3,
  Plus,
  Trash2,
  ChefHat,
  AlertTriangle,
  UtensilsCrossed,
  Pencil,
  X,
} from "lucide-react";

type Unit = "g" | "kg" | "ml" | "l" | "pcs";

type Ingredient = {
  name: string;
  quantity: number;
  unit: Unit;
};

type Dish = {
  id: string;
  name: string;
  ingredients: Record<string, number>;
};

type Transaction = {
  id: string;
  time: string;
  type: "make" | "add" | "edit" | "create_dish" | "delete_dish";
  details: string;
};

const genId = (() => {
  let counter = 0;
  return () => `id_${Date.now()}_${++counter}`;
})();

export default function KitchenInventoryResort() {
  const initialStore: Ingredient[] = [
    { name: "rice", quantity: 10000, unit: "g" },
    { name: "chicken", quantity: 7000, unit: "g" },
    { name: "fish", quantity: 4000, unit: "g" },
    { name: "egg", quantity: 200, unit: "pcs" },
    { name: "vegetables", quantity: 5000, unit: "g" },
    { name: "oil", quantity: 5000, unit: "ml" },
    { name: "spices", quantity: 1500, unit: "g" },
    { name: "salt", quantity: 2000, unit: "g" },
    { name: "butter", quantity: 2000, unit: "g" },
    { name: "cheese", quantity: 1500, unit: "g" },
    { name: "pasta", quantity: 3000, unit: "g" },
    { name: "tomato", quantity: 4000, unit: "g" },
    { name: "onion", quantity: 3000, unit: "g" },
    { name: "garlic", quantity: 500, unit: "g" },
    { name: "milk", quantity: 3000, unit: "ml" },
    { name: "cream", quantity: 1000, unit: "ml" },
    { name: "flour", quantity: 5000, unit: "g" },
    { name: "sugar", quantity: 2000, unit: "g" },
    { name: "lemon", quantity: 50, unit: "pcs" },
    { name: "potato", quantity: 4000, unit: "g" },
  ];

  const initialDishes: Dish[] = [
    {
      id: "chicken_biryani",
      name: "Chicken Biryani",
      ingredients: { rice: 160, chicken: 180, oil: 10, spices: 8, salt: 5, onion: 50 },
    },
    {
      id: "fish_curry",
      name: "Fish Curry",
      ingredients: { fish: 150, spices: 6, salt: 4, oil: 10, tomato: 80, onion: 40 },
    },
    {
      id: "pasta_carbonara",
      name: "Pasta Carbonara",
      ingredients: { pasta: 200, egg: 2, cheese: 50, butter: 30, salt: 3 },
    },
    {
      id: "grilled_chicken",
      name: "Grilled Chicken",
      ingredients: { chicken: 250, oil: 15, spices: 10, salt: 5, lemon: 1 },
    },
    {
      id: "vegetable_stir_fry",
      name: "Vegetable Stir Fry",
      ingredients: { vegetables: 300, oil: 20, garlic: 10, salt: 4, spices: 5 },
    },
    {
      id: "fish_fry",
      name: "Fish Fry",
      ingredients: { fish: 200, flour: 30, spices: 8, salt: 5, oil: 25 },
    },
    {
      id: "egg_omelette",
      name: "Egg Omelette",
      ingredients: { egg: 3, butter: 15, salt: 2, onion: 20, tomato: 30 },
    },
    {
      id: "mashed_potato",
      name: "Mashed Potato",
      ingredients: { potato: 300, butter: 40, milk: 100, salt: 4 },
    },
    {
      id: "creamy_pasta",
      name: "Creamy Pasta",
      ingredients: { pasta: 180, cream: 150, cheese: 60, garlic: 8, salt: 4, butter: 20 },
    },
    {
      id: "tomato_soup",
      name: "Tomato Soup",
      ingredients: { tomato: 400, onion: 60, garlic: 10, cream: 80, salt: 5, butter: 25 },
    },
  ];

  const [store, setStore] = useState(initialStore);
  const [dishes, setDishes] = useState(initialDishes);
  const [selectedDish, setSelectedDish] = useState(initialDishes[0].id);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [portions, setPortions] = useState(1);
  const [newIngredient, setNewIngredient] = useState({
    name: "",
    quantity: 0,
    unit: "g" as Unit,
  });
  const [newDish, setNewDish] = useState({
    name: "",
    ingredients: [] as { name: string; amount: number; unit: Unit }[],
  });
  const [tempIngredient, setTempIngredient] = useState({ name: "", amount: 0, unit: "g" as Unit });
  const [editingDish, setEditingDish] = useState<Dish | null>(null);
  const [editTempIngredient, setEditTempIngredient] = useState({ name: "", amount: 0 });
  const [isAddDishOpen, setIsAddDishOpen] = useState(false);

  const now = () => new Date().toLocaleString();
  const pushTx = (t: Transaction) => setTransactions((s) => [t, ...s].slice(0, 100));

  function sanitizeNumberInput(value: string): number {
    if (value === "") return 0;
    const num = parseFloat(value) || 0;
    return num < 0 ? 0 : num;
  }

  // Cook dish logic
  function makeDish(dishId: string, qty: number) {
    const dish = dishes.find((d) => d.id === dishId);
    if (!dish) return;

    const insufficient = Object.entries(dish.ingredients).filter(([ing, need]) => {
      const item = store.find((s) => s.name === ing);
      return !item || item.quantity < need * qty;
    });

    if (insufficient.length) {
      alert("Insufficient stock for: " + insufficient.map(([k]) => k).join(", "));
      return;
    }

    setStore((prev) =>
      prev.map((i) => {
        const used = dish.ingredients[i.name] || 0;
        return used ? { ...i, quantity: Math.max(0, i.quantity - used * qty) } : i;
      })
    );

    pushTx({ id: genId(), time: now(), type: "make", details: `Cooked ${qty}× ${dish.name}` });
  }

  // Inventory Functions
  function addIngredient() {
    if (!newIngredient.name || newIngredient.quantity <= 0) return;
    const name = newIngredient.name.trim().toLowerCase();
    setStore((prev) => {
      const exist = prev.find((i) => i.name === name);
      if (exist)
        return prev.map((i) =>
          i.name === name
            ? { ...i, quantity: i.quantity + newIngredient.quantity }
            : i
        );
      return [...prev, { name, quantity: newIngredient.quantity, unit: newIngredient.unit }];
    });
    pushTx({
      id: genId(),
      time: now(),
      type: "add",
      details: `Added ${newIngredient.quantity}${newIngredient.unit} ${name}`,
    });
    setNewIngredient({ name: "", quantity: 0, unit: "g" });
  }

  function deleteIngredient(name: string) {
    setStore((prev) => prev.filter((i) => i.name !== name));
    pushTx({ id: genId(), time: now(), type: "edit", details: `Deleted ingredient: ${name}` });
  }

  function editIngredient(name: string, field: keyof Ingredient, value: any) {
    setStore((prev) =>
      prev.map((i) => (i.name === name ? { ...i, [field]: value } : i))
    );
  }

  // Dish Functions
  function addIngredientToNewDish() {
    if (!tempIngredient.name.trim() || tempIngredient.amount <= 0) return;
    const ingredientName = tempIngredient.name.trim().toLowerCase();
    setNewDish((prev) => ({
      ...prev,
      ingredients: [...prev.ingredients, { name: ingredientName, amount: tempIngredient.amount, unit: tempIngredient.unit }],
    }));
    setTempIngredient({ name: "", amount: 0, unit: "g" });
  }

  function removeIngredientFromNewDish(index: number) {
    setNewDish((prev) => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index),
    }));
  }

  function createDish() {
    if (!newDish.name.trim() || newDish.ingredients.length === 0) {
      alert("Please enter a dish name and add at least one ingredient");
      return;
    }
    const formattedIngredients: Record<string, number> = {};
    newDish.ingredients.forEach((i) => {
      formattedIngredients[i.name] = i.amount;
    });
    const dish: Dish = {
      id: newDish.name.trim().toLowerCase().replace(/\s+/g, "_"),
      name: newDish.name.trim(),
      ingredients: formattedIngredients,
    };
    setDishes((prev) => [...prev, dish]);
    pushTx({ id: genId(), time: now(), type: "create_dish", details: `Created dish: ${dish.name}` });
    setNewDish({ name: "", ingredients: [] });
    setIsAddDishOpen(false);
  }

  function deleteDish(id: string) {
    const d = dishes.find((x) => x.id === id);
    if (!d) return;
    setDishes((prev) => prev.filter((dish) => dish.id !== id));
    pushTx({ id: genId(), time: now(), type: "delete_dish", details: `Deleted dish: ${d.name}` });
  }

  function updateDishIngredient(dishId: string, ingredient: string, value: number) {
    setDishes((prev) =>
      prev.map((d) =>
        d.id === dishId
          ? { ...d, ingredients: { ...d.ingredients, [ingredient]: value } }
          : d
      )
    );
    
    if (editingDish && editingDish.id === dishId) {
      setEditingDish((prev) => 
        prev ? { ...prev, ingredients: { ...prev.ingredients, [ingredient]: value } } : null
      );
    }
  }

  function removeDishIngredient(dishId: string, ingredient: string) {
    setDishes((prev) =>
      prev.map((d) => {
        if (d.id !== dishId) return d;
        const newIngs = { ...d.ingredients };
        delete newIngs[ingredient];
        return { ...d, ingredients: newIngs };
      })
    );
    
    if (editingDish && editingDish.id === dishId) {
      setEditingDish((prev) => {
        if (!prev) return null;
        const newIngs = { ...prev.ingredients };
        delete newIngs[ingredient];
        return { ...prev, ingredients: newIngs };
      });
    }
  }

  function addIngredientToEditingDish() {
    if (!editingDish || !editTempIngredient.name.trim() || editTempIngredient.amount <= 0) return;
    
    const ingredientName = editTempIngredient.name.trim().toLowerCase();
    
    setDishes((prev) =>
      prev.map((d) =>
        d.id === editingDish.id
          ? { ...d, ingredients: { ...d.ingredients, [ingredientName]: editTempIngredient.amount } }
          : d
      )
    );
    
    setEditingDish((prev) =>
      prev ? { ...prev, ingredients: { ...prev.ingredients, [ingredientName]: editTempIngredient.amount } } : null
    );
    
    setEditTempIngredient({ name: "", amount: 0 });
  }

  function saveEditedDish() {
    if (editingDish) {
      pushTx({ id: genId(), time: now(), type: "edit", details: `Updated dish: ${editingDish.name}` });
    }
    setEditingDish(null);
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <header className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold flex items-center gap-2">
          <ChefHat className="w-7 h-7 text-emerald-600" /> Resort Kitchen Control Panel
        </h1>
      </header>

      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UtensilsCrossed /> Cook Dish
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Select value={selectedDish} onValueChange={setSelectedDish}>
              <SelectTrigger>
                <SelectValue placeholder="Select dish" />
              </SelectTrigger>
              <SelectContent>
                {dishes.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Input
                type="number"
                value={portions === 0 ? "" : portions}
                onChange={(e) => setPortions(sanitizeNumberInput(e.target.value))}
                className="w-24"
                placeholder="Qty"
              />
              <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => makeDish(selectedDish, portions)}>
                Cook
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="text-amber-500" /> Inventory
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full mb-3">
                  <Plus className="w-4 h-4 mr-2" /> Add Ingredient
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Ingredient</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                  <Input placeholder="Name" value={newIngredient.name} onChange={(e) => setNewIngredient({ ...newIngredient, name: e.target.value })} />
                  <Input type="number" placeholder="Quantity" value={newIngredient.quantity === 0 ? "" : newIngredient.quantity} onChange={(e) => setNewIngredient({ ...newIngredient, quantity: sanitizeNumberInput(e.target.value) })} />
                  <Select value={newIngredient.unit} onValueChange={(v: Unit) => setNewIngredient({ ...newIngredient, unit: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="g">g</SelectItem>
                      <SelectItem value="kg">kg</SelectItem>
                      <SelectItem value="ml">ml</SelectItem>
                      <SelectItem value="l">l</SelectItem>
                      <SelectItem value="pcs">pcs</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={addIngredient} className="w-full">Save</Button>
                </div>
              </DialogContent>
            </Dialog>

            <ScrollArea className="h-[25rem]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {store.map((i) => (
                    <TableRow key={i.name}>
                      <TableCell>{i.name}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={i.quantity}
                          onChange={(e) => editIngredient(i.name, "quantity", sanitizeNumberInput(e.target.value))}
                        />
                      </TableCell>
                      <TableCell>
                        <Select
                          value={i.unit}
                          onValueChange={(v: Unit) => editIngredient(i.name, "unit", v)}
                        >
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="g">g</SelectItem>
                            <SelectItem value="kg">kg</SelectItem>
                            <SelectItem value="ml">ml</SelectItem>
                            <SelectItem value="l">l</SelectItem>
                            <SelectItem value="pcs">pcs</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Button variant="destructive" size="sm" onClick={() => deleteIngredient(i.name)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dishes</CardTitle>
          </CardHeader>
          <CardContent>
            <Dialog open={isAddDishOpen} onOpenChange={setIsAddDishOpen}>
              <DialogTrigger asChild>
                <Button className="w-full mb-3">
                  <Plus className="w-4 h-4 mr-2" /> Add New Dish
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Dish</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Dish Name</Label>
                    <Input
                      placeholder="Enter dish name"
                      value={newDish.name}
                      onChange={(e) => setNewDish({ ...newDish, name: e.target.value })}
                    />
                  </div>

                  <div className="border-t pt-4">
                    <Label className="text-lg font-semibold">Ingredients</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        placeholder="Ingredient name"
                        value={tempIngredient.name}
                        onChange={(e) => setTempIngredient({ ...tempIngredient, name: e.target.value })}
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        placeholder="Amount"
                        value={tempIngredient.amount === 0 ? "" : tempIngredient.amount}
                        onChange={(e) => setTempIngredient({ ...tempIngredient, amount: sanitizeNumberInput(e.target.value) })}
                        className="w-24"
                      />
                      <Select value={tempIngredient.unit} onValueChange={(v: Unit) => setTempIngredient({ ...tempIngredient, unit: v })}>
                        <SelectTrigger className="w-20"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="g">g</SelectItem>
                          <SelectItem value="kg">kg</SelectItem>
                          <SelectItem value="ml">ml</SelectItem>
                          <SelectItem value="l">l</SelectItem>
                          <SelectItem value="pcs">pcs</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button onClick={addIngredientToNewDish}>
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>

                    <ScrollArea className="h-[200px] mt-3">
                      {newDish.ingredients.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-4">No ingredients added yet</p>
                      ) : (
                        <div className="space-y-2">
                          {newDish.ingredients.map((ing, idx) => (
                            <div key={idx} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                              <span className="font-medium">{ing.name}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-gray-600">{ing.amount} {ing.unit}</span>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => removeIngredientFromNewDish(idx)}
                                >
                                  <X className="w-4 h-4 text-red-500" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </div>

                  <Button onClick={createDish} className="w-full">Create Dish</Button>
                </div>
              </DialogContent>
            </Dialog>

            <ScrollArea className="h-[25rem]">
              {dishes.map((dish) => (
                <div key={dish.id} className="border p-3 mb-2 rounded-md">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold">{dish.name}</h3>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => setEditingDish(dish)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => deleteDish(dish.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <ul className="pl-4 mt-2 text-sm space-y-1">
                    {Object.entries(dish.ingredients).map(([k, v]) => (
                      <li key={k} className="text-gray-600">
                        <span className="font-medium text-gray-800">{k}</span>: {v}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {editingDish && (
        <Dialog open={!!editingDish} onOpenChange={() => setEditingDish(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Dish: {editingDish.name}</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="border-b pb-3">
                <Label className="text-lg font-semibold mb-2">Current Ingredients</Label>
                <ScrollArea className="max-h-[250px]">
                  <div className="space-y-2 pr-4">
                    {Object.entries(editingDish.ingredients).map(([ing, qty]) => (
                      <div key={ing} className="flex items-center gap-2">
                        <Label className="w-32 capitalize">{ing}</Label>
                        <Input
                          type="number"
                          value={qty}
                          onChange={(e) => updateDishIngredient(editingDish.id, ing, sanitizeNumberInput(e.target.value))}
                          className="flex-1"
                          placeholder="0"
                        />
                        <Button size="sm" variant="destructive" onClick={() => removeDishIngredient(editingDish.id, ing)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              <div className="border-t pt-3">
                <Label className="text-lg font-semibold mb-2">Add New Ingredient</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="Ingredient name"
                    value={editTempIngredient.name}
                    onChange={(e) => setEditTempIngredient({ ...editTempIngredient, name: e.target.value })}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    placeholder="Amount"
                    value={editTempIngredient.amount === 0 ? "" : editTempIngredient.amount}
                    onChange={(e) => setEditTempIngredient({ ...editTempIngredient, amount: sanitizeNumberInput(e.target.value) })}
                    className="w-24"
                  />
                  <Button onClick={addIngredientToEditingDish}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <Button onClick={saveEditedDish} className="w-full">Save Changes</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}