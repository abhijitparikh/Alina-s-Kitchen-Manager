import React, { useState, useRef, useEffect } from 'react';
import { MenuItem } from '../types';
import { curateMenu } from '../services/geminiService';
import { Plus, ChefHat, Sparkles, Trash2, Tag, Leaf, Camera, Image as ImageIcon, BarChart2, Package, Utensils, XCircle } from 'lucide-react';

const INDIAN_DISH_LIBRARY = [
    { name: 'Butter Chicken', price: 14.50, category: 'Main', isVeg: false, desc: 'Creamy tomato curry' },
    { name: 'Paneer Tikka Masala', price: 13.00, category: 'Main', isVeg: true, desc: 'Spiced grilled cottage cheese' },
    { name: 'Dal Makhani', price: 11.00, category: 'Main', isVeg: true, desc: 'Slow cooked black lentils' },
    { name: 'Chicken Biryani', price: 15.00, category: 'Main', isVeg: false, desc: 'Aromatic rice with chicken' },
    { name: 'Samosa (2pc)', price: 5.00, category: 'Starter', isVeg: true, desc: 'Crispy pastry with potato' },
    { name: 'Garlic Naan', price: 3.50, category: 'Side', isVeg: true, desc: 'Leavened bread with garlic' }
];

const DEFAULT_MENU_ITEMS: MenuItem[] = [
    { id: '1', name: 'Butter Chicken', description: 'Creamy tomato curry', price: 14.50, category: 'Main', isVegetarian: false, imageUrl: 'https://via.placeholder.com/150' },
    { id: '2', name: 'Standard Veg Tiffin', description: 'Dal, Rice, 3 Roti, Sabzi, Salad', price: 12.00, category: 'Tiffin', isVegetarian: true, isCombo: true },
];

const MenuManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'current' | 'tiffins' | 'analytics' | 'ai-chef'>('current');
  
  // Menu Items State with Persistence
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    const saved = localStorage.getItem('kitchen_menu');
    return saved ? JSON.parse(saved) : DEFAULT_MENU_ITEMS;
  });

  // Persistence Effect
  useEffect(() => {
    localStorage.setItem('kitchen_menu', JSON.stringify(menuItems));
  }, [menuItems]);

  // Item Modal State
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [newItem, setNewItem] = useState<Partial<MenuItem>>({
      name: '', price: 0, description: '', category: 'Main', isVegetarian: true
  });

  // Tiffin Modal State
  const [isTiffinModalOpen, setIsTiffinModalOpen] = useState(false);
  const [newTiffin, setNewTiffin] = useState<Partial<MenuItem>>({
      name: '', price: 0, description: '', category: 'Tiffin', isVegetarian: true, isCombo: true
  });

  const [ingredients, setIngredients] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleQuickAdd = (dish: any) => {
      const newItem: MenuItem = {
          id: Date.now().toString(),
          name: dish.name,
          description: dish.desc,
          price: dish.price,
          category: dish.category as any,
          isVegetarian: dish.isVeg,
      };
      setMenuItems([newItem, ...menuItems]);
  };

  const handleAddItem = () => {
      if (!newItem.name || !newItem.price) return;
      const item: MenuItem = {
          id: Date.now().toString(),
          name: newItem.name,
          description: newItem.description || '',
          price: parseFloat(newItem.price.toString()),
          category: newItem.category as any,
          isVegetarian: newItem.isVegetarian || false
      };
      setMenuItems([item, ...menuItems]);
      setIsItemModalOpen(false);
      setNewItem({ name: '', price: 0, description: '', category: 'Main', isVegetarian: true });
  };

  const handleAddTiffin = () => {
      if (!newTiffin.name || !newTiffin.price) return;
      const tiffin: MenuItem = {
          id: Date.now().toString(),
          name: newTiffin.name,
          description: newTiffin.description || 'Standard Combo',
          price: parseFloat(newTiffin.price.toString()),
          category: 'Tiffin',
          isVegetarian: newTiffin.isVegetarian || false,
          isCombo: true
      };
      setMenuItems([tiffin, ...menuItems]);
      setIsTiffinModalOpen(false);
      setNewTiffin({ name: '', price: 0, description: '', category: 'Tiffin', isVegetarian: true, isCombo: true });
  };

  const deleteItem = (id: string, name: string) => {
      if (window.confirm(`Are you sure you want to PERMANENTLY delete "${name}" from your menu?`)) {
          setMenuItems(prev => prev.filter(m => m.id !== id));
      }
  };

  const handleCurateMenu = async () => {
    if (!ingredients.trim()) return;
    setLoading(true);
    const results = await curateMenu(ingredients);
    setSuggestions(results);
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Menu & Products</h2>
          <p className="text-gray-500">Manage A La Carte, Tiffin Subscriptions, and Pricing</p>
        </div>
        {activeTab === 'current' && (
             <button onClick={() => setIsItemModalOpen(true)} className="bg-teal-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-bold text-sm shadow-sm hover:bg-teal-700">
                 <Plus size={16} /> Add New Dish
             </button>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex overflow-x-auto">
         {[
             {id: 'current', label: 'A La Carte', icon: Utensils},
             {id: 'tiffins', label: 'Tiffins', icon: Package},
             {id: 'analytics', label: 'Analytics', icon: BarChart2},
             {id: 'ai-chef', label: 'AI Curator', icon: Sparkles}
         ].map(tab => (
            <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 py-4 min-w-[100px] text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                  activeTab === tab.id 
                    ? 'text-teal-600 border-b-2 border-teal-600 bg-teal-50/50' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
            >
                <tab.icon size={18} /> {tab.label}
            </button>
         ))}
      </div>

      <div className="p-1">
        {/* CURRENT MENU TAB */}
        {activeTab === 'current' && (
            <div className="space-y-6">
                {/* Quick Library */}
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Quick Add from Library</h4>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        {INDIAN_DISH_LIBRARY.map((dish, idx) => (
                            <button 
                                key={idx}
                                onClick={() => handleQuickAdd(dish)}
                                className="flex-shrink-0 bg-gray-50 hover:bg-teal-50 border border-gray-200 hover:border-teal-200 rounded-lg px-3 py-2 text-sm transition-colors text-left"
                            >
                                <div className="font-bold text-gray-800">{dish.name}</div>
                                <div className="text-[10px] text-gray-500">€{dish.price.toFixed(2)}</div>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {menuItems.filter(m => !m.isCombo).length === 0 && (
                        <div className="col-span-3 text-center py-8 text-gray-400">No dishes in menu. Add one above!</div>
                    )}
                    {menuItems.filter(m => !m.isCombo).map((item) => (
                        <div key={item.id} className="border border-gray-100 rounded-xl p-5 bg-white shadow-sm relative group">
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold text-gray-800">{item.name}</h4>
                                <span className="font-bold text-teal-600">€{item.price.toFixed(2)}</span>
                            </div>
                            <p className="text-sm text-gray-500 mb-3">{item.description}</p>
                            <div className="flex gap-2">
                                {item.isVegetarian && <span className="text-[10px] bg-green-50 text-green-700 px-2 py-1 rounded border border-green-100 flex items-center gap-1"><Leaf size={10}/> Veg</span>}
                                <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-1 rounded border border-gray-200">{item.category}</span>
                            </div>
                             <button 
                                onClick={() => deleteItem(item.id, item.name)} 
                                className="absolute top-4 right-4 text-gray-300 hover:text-red-600 p-1.5 bg-white/80 rounded-full hover:bg-red-50 transition-colors"
                                title="Delete Item"
                             >
                                <Trash2 size={16}/>
                             </button>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* TIFFINS TAB */}
        {activeTab === 'tiffins' && (
            <div className="space-y-6">
                 <div className="bg-teal-50 border border-teal-100 p-6 rounded-xl">
                     <div className="flex justify-between items-center">
                        <div>
                            <h3 className="font-bold text-teal-900 text-lg">Tiffin Subscriptions</h3>
                            <p className="text-sm text-teal-700">Manage daily combo meals for subscribers.</p>
                        </div>
                        <button onClick={() => setIsTiffinModalOpen(true)} className="bg-teal-600 text-white px-4 py-2 rounded-lg font-medium shadow hover:bg-teal-700">+ Create Combo</button>
                     </div>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {menuItems.filter(m => m.isCombo).map(item => (
                        <div key={item.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm relative">
                             <div className="flex items-center justify-between mb-4">
                                 <h4 className="font-bold text-xl text-gray-800">{item.name}</h4>
                                 <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2 py-1 rounded">COMBO</span>
                             </div>
                             <div className="bg-gray-50 p-4 rounded-lg mb-4 text-sm text-gray-600 leading-relaxed">
                                 {item.description}
                             </div>
                             <div className="flex justify-between items-center border-t border-gray-100 pt-4">
                                 <span className="text-2xl font-bold text-gray-900">€{item.price.toFixed(2)}</span>
                                 <button onClick={() => deleteItem(item.id, item.name)} className="text-gray-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50"><Trash2 size={18}/></button>
                             </div>
                        </div>
                    ))}
                 </div>
            </div>
        )}

        {/* ANALYTICS TAB */}
        {activeTab === 'analytics' && (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                     <h3 className="font-bold text-gray-800 mb-4">Best Selling Dishes</h3>
                     <div className="space-y-4">
                         {[
                             {name: 'Butter Chicken', sold: 142, revenue: '€2,059'},
                             {name: 'Veg Tiffin', sold: 98, revenue: '€1,176'},
                             {name: 'Garlic Naan', sold: 215, revenue: '€752'},
                         ].map((stat, i) => (
                             <div key={i} className="flex items-center justify-between">
                                 <div className="flex items-center gap-3">
                                     <span className="font-bold text-gray-400 text-lg">#{i+1}</span>
                                     <span className="font-medium text-gray-800">{stat.name}</span>
                                 </div>
                                 <div className="text-right">
                                     <div className="font-bold text-gray-900">{stat.sold} sold</div>
                                     <div className="text-xs text-green-600">{stat.revenue}</div>
                                 </div>
                             </div>
                         ))}
                     </div>
                 </div>

                 <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                     <h3 className="font-bold text-gray-800 mb-4">Grocery Usage</h3>
                     <p className="text-sm text-gray-500 mb-4">Top ingredients consumed this week based on orders.</p>
                     <div className="flex flex-wrap gap-2">
                         {['Chicken (40kg)', 'Basmati Rice (25kg)', 'Onions (15kg)', 'Paneer (10kg)', 'Cream (5L)'].map(ing => (
                             <span key={ing} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">{ing}</span>
                         ))}
                     </div>
                     <div className="mt-6 bg-yellow-50 border border-yellow-100 p-4 rounded-lg">
                         <h4 className="font-bold text-yellow-800 text-sm flex items-center gap-2"><Sparkles size={14}/> AI Recommendation</h4>
                         <p className="text-xs text-yellow-800 mt-1">
                             Promote <strong>Paneer Tikka</strong> next week. You have excess Paneer stock and margin is high (65%).
                         </p>
                     </div>
                 </div>
             </div>
        )}

        {/* AI CHEF */}
        {activeTab === 'ai-chef' && (
            <div className="bg-teal-50 border border-teal-100 rounded-xl p-6">
                 <h3 className="font-bold text-teal-900 mb-2">AI Menu Curator</h3>
                 <p className="text-sm text-teal-700 mb-4">Enter ingredients to get menu suggestions.</p>
                 <div className="flex gap-3">
                   <input 
                    type="text" 
                    value={ingredients}
                    onChange={(e) => setIngredients(e.target.value)}
                    placeholder="e.g. Potatoes, Peas, Paneer"
                    className="flex-1 border border-teal-200 rounded-lg px-4 py-2 outline-none"
                   />
                   <button onClick={handleCurateMenu} disabled={loading} className="bg-teal-600 text-white px-6 py-2 rounded-lg font-medium">
                     {loading ? 'Thinking...' : 'Curate'}
                   </button>
                 </div>
                 {suggestions.length > 0 && (
                     <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                         {suggestions.map((s, i) => (
                             <div key={i} className="bg-white p-4 rounded-lg border border-gray-200">
                                 <div className="font-bold">{s.name}</div>
                                 <div className="text-sm text-gray-600">{s.description}</div>
                                 <button onClick={() => handleQuickAdd(s)} className="mt-2 text-teal-600 text-sm font-bold">+ Add to Menu</button>
                             </div>
                         ))}
                     </div>
                 )}
            </div>
        )}
      </div>

      {/* MODALS */}
      {isItemModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
              <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-lg">Add New Dish</h3>
                      <button onClick={() => setIsItemModalOpen(false)}><XCircle className="text-gray-400" /></button>
                  </div>
                  <div className="space-y-4">
                      <input type="text" placeholder="Dish Name" className="w-full border rounded px-3 py-2" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} />
                      <div className="grid grid-cols-2 gap-4">
                          <input type="number" placeholder="Price (€)" className="w-full border rounded px-3 py-2" value={newItem.price} onChange={e => setNewItem({...newItem, price: parseFloat(e.target.value)})} />
                           <select className="w-full border rounded px-3 py-2" value={newItem.category} onChange={e => setNewItem({...newItem, category: e.target.value as any})}>
                               <option value="Main">Main</option>
                               <option value="Starter">Starter</option>
                               <option value="Dessert">Dessert</option>
                               <option value="Beverage">Beverage</option>
                           </select>
                      </div>
                      <textarea placeholder="Description" className="w-full border rounded px-3 py-2" value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})} />
                      <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={newItem.isVegetarian} onChange={e => setNewItem({...newItem, isVegetarian: e.target.checked})} />
                          <span className="text-sm">Is Vegetarian?</span>
                      </label>
                      <button onClick={handleAddItem} className="w-full bg-teal-600 text-white py-3 rounded-lg font-bold">Add Dish</button>
                  </div>
              </div>
          </div>
      )}

      {isTiffinModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
              <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-lg">Create Tiffin Combo</h3>
                      <button onClick={() => setIsTiffinModalOpen(false)}><XCircle className="text-gray-400" /></button>
                  </div>
                  <div className="space-y-4">
                      <input type="text" placeholder="Combo Name (e.g. Monday Special)" className="w-full border rounded px-3 py-2" value={newTiffin.name} onChange={e => setNewTiffin({...newTiffin, name: e.target.value})} />
                      <input type="number" placeholder="Price (€)" className="w-full border rounded px-3 py-2" value={newTiffin.price} onChange={e => setNewTiffin({...newTiffin, price: parseFloat(e.target.value)})} />
                      <textarea placeholder="Contents (e.g. 2 Roti, 1 Dal, Rice)" className="w-full border rounded px-3 py-2 h-24" value={newTiffin.description} onChange={e => setNewTiffin({...newTiffin, description: e.target.value})} />
                      <button onClick={handleAddTiffin} className="w-full bg-teal-600 text-white py-3 rounded-lg font-bold">Create Combo</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default MenuManager;