import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSettings } from '../context/SettingsContext';
import { getImageUrl } from '../utils/imageUrl';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { ShoppingCart, Plus, Minus, Package, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { getApiUrl } from '@/config/env';

const API = getApiUrl();

const Store = () => {
  const { settings } = useSettings();
  const [merchandise, setMerchandise] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutForm, setCheckoutForm] = useState({
    shipping_name: '',
    shipping_email: '',
    shipping_phone: '',
    shipping_address: '',
    shipping_city: '',
    shipping_state: '',
    shipping_pincode: ''
  });

  useEffect(() => {
    fetchMerchandise();
  }, []);

  const fetchMerchandise = async () => {
    try {
      const response = await axios.get(`${API}/merchandise`);
      setMerchandise(response.data);
    } catch (error) {
      console.error('Error fetching merchandise:', error);
      toast.error('Failed to load merchandise');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (item) => {
    if (item.stock <= 0) {
      toast.error('Item is out of stock');
      return;
    }
    const existingItem = cart.find(c => c.id === item.id);
    if (existingItem) {
      if (existingItem.quantity >= item.stock) {
        toast.error('Cannot add more items. Stock limited');
        return;
      }
      setCart(cart.map(c => 
        c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
      ));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
    toast.success('Added to cart');
  };

  const updateQuantity = (itemId, change) => {
    setCart(cart.map(item => {
      if (item.id === itemId) {
        const newQuantity = item.quantity + change;
        if (newQuantity <= 0) {
          return null;
        }
        const merch = merchandise.find(m => m.id === itemId);
        if (merch && newQuantity > merch.stock) {
          toast.error('Insufficient stock');
          return item;
        }
        return { ...item, quantity: newQuantity };
      }
      return item;
    }).filter(Boolean));
  };

  const removeFromCart = (itemId) => {
    setCart(cart.filter(item => item.id !== itemId));
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    setCheckoutLoading(true);

    try {
      const orderItems = cart.map(item => ({
        merchandise_id: item.id,
        quantity: item.quantity,
        price: item.price
      }));

      await axios.post(`${API}/orders`, {
        items: orderItems,
        ...checkoutForm
      });

      toast.success('Order placed successfully! We will contact you soon.');
      setCart([]);
      setCheckoutOpen(false);
      setCheckoutForm({
        shipping_name: '',
        shipping_email: '',
        shipping_phone: '',
        shipping_address: '',
        shipping_city: '',
        shipping_state: '',
        shipping_pincode: ''
      });
      fetchMerchandise(); // Refresh stock
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error(error.response?.data?.detail || 'Failed to place order');
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Package className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-slate-600">Loading merchandise...</p>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="store-page">
      {/* Hero Section */}
      <section className="relative py-20 bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-secondary mb-4">
              Our Store
            </p>
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-6">
              Support Our Mission
            </h1>
            <p className="text-lg text-slate-300 leading-relaxed">
              Purchase merchandise and show your support for medical negligence awareness. 
              All proceeds go towards supporting victims and spreading awareness.
            </p>
          </div>
        </div>
      </section>

      {/* Store Section */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="font-serif text-2xl font-bold text-primary">Available Items</h2>
            {cart.length > 0 && (
              <Button
                onClick={() => setCheckoutOpen(true)}
                className="bg-primary hover:bg-slate-800"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Cart ({cart.length}) - ₹{getCartTotal().toFixed(2)}
              </Button>
            )}
          </div>

          {merchandise.length === 0 ? (
            <div className="text-center py-16">
              <Package className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600 text-lg">No merchandise available at the moment.</p>
              <p className="text-slate-400 text-sm mt-2">Check back soon for new items!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {merchandise.map((item) => (
                <Card key={item.id} className="border-slate-200 overflow-hidden">
                  {item.image_url && (
                    <div className="aspect-square bg-slate-100 overflow-hidden">
                      <img
                        src={getImageUrl(item.image_url)}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardContent className="p-6">
                    <div className="mb-4">
                      <h3 className="font-serif text-xl font-bold text-primary mb-2">
                        {item.name}
                      </h3>
                      <p className="text-slate-600 text-sm mb-4">{item.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="font-serif text-2xl font-bold text-secondary">
                          ₹{item.price.toFixed(2)}
                        </span>
                        <span className={`text-sm ${item.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {item.stock > 0 ? `${item.stock} in stock` : 'Out of stock'}
                        </span>
                      </div>
                    </div>
                    <Button
                      onClick={() => addToCart(item)}
                      disabled={item.stock <= 0}
                      className="w-full bg-primary hover:bg-slate-800"
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Add to Cart
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Cart Sidebar */}
      {cart.length > 0 && (
        <div className="fixed bottom-4 right-4 z-50">
          <Button
            onClick={() => setCheckoutOpen(true)}
            size="lg"
            className="bg-primary hover:bg-slate-800 shadow-lg"
          >
            <ShoppingCart className="h-5 w-5 mr-2" />
            View Cart ({cart.length})
          </Button>
        </div>
      )}

      {/* Checkout Dialog */}
      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">Checkout</DialogTitle>
            <DialogDescription>
              Review your cart and provide shipping information
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Cart Items */}
            <div>
              <h3 className="font-serif font-bold text-primary mb-4">Order Summary</h3>
              <div className="space-y-3">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 rounded">
                    <div className="flex-1">
                      <p className="font-medium text-primary">{item.name}</p>
                      <p className="text-sm text-slate-600">₹{item.price.toFixed(2)} × {item.quantity}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.id, -1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.id, 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <span className="ml-4 font-bold">₹{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-slate-200 flex justify-between items-center">
                <span className="font-serif text-xl font-bold text-primary">Total</span>
                <span className="font-serif text-2xl font-bold text-secondary">
                  ₹{getCartTotal().toFixed(2)}
                </span>
              </div>
            </div>

            {/* Shipping Form */}
            <form onSubmit={handleCheckout} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="shipping_name">Full Name *</Label>
                  <Input
                    id="shipping_name"
                    value={checkoutForm.shipping_name}
                    onChange={(e) => setCheckoutForm({ ...checkoutForm, shipping_name: e.target.value })}
                    required
                    placeholder="Your full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shipping_email">Email *</Label>
                  <Input
                    id="shipping_email"
                    type="email"
                    value={checkoutForm.shipping_email}
                    onChange={(e) => setCheckoutForm({ ...checkoutForm, shipping_email: e.target.value })}
                    required
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="shipping_phone">Phone Number *</Label>
                <Input
                  id="shipping_phone"
                  type="tel"
                  value={checkoutForm.shipping_phone}
                  onChange={(e) => setCheckoutForm({ ...checkoutForm, shipping_phone: e.target.value })}
                  required
                  placeholder="+91 XXXXX XXXXX"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="shipping_address">Address *</Label>
                <Textarea
                  id="shipping_address"
                  value={checkoutForm.shipping_address}
                  onChange={(e) => setCheckoutForm({ ...checkoutForm, shipping_address: e.target.value })}
                  required
                  placeholder="Street address"
                  rows={3}
                />
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="shipping_city">City *</Label>
                  <Input
                    id="shipping_city"
                    value={checkoutForm.shipping_city}
                    onChange={(e) => setCheckoutForm({ ...checkoutForm, shipping_city: e.target.value })}
                    required
                    placeholder="City"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shipping_state">State *</Label>
                  <Input
                    id="shipping_state"
                    value={checkoutForm.shipping_state}
                    onChange={(e) => setCheckoutForm({ ...checkoutForm, shipping_state: e.target.value })}
                    required
                    placeholder="State"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shipping_pincode">Pincode *</Label>
                  <Input
                    id="shipping_pincode"
                    value={checkoutForm.shipping_pincode}
                    onChange={(e) => setCheckoutForm({ ...checkoutForm, shipping_pincode: e.target.value })}
                    required
                    placeholder="PIN Code"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCheckoutOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={checkoutLoading}
                  className="bg-primary hover:bg-slate-800"
                >
                  {checkoutLoading ? 'Placing Order...' : 'Place Order'}
                </Button>
              </DialogFooter>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Store;

