import React, { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Milk, Calendar, Users, Plus, IndianRupee, TrendingUp, Trash2 } from 'lucide-react';
import VoiceRecorder from '@/components/VoiceRecorder';
import DailySales from '@/components/DailySales';
import CustomerHistory from '@/components/CustomerHistory';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface SaleRecord {
  id: string;
  customerName: string;
  liters: number;
  amount: number;
  timestamp: Date;
}

interface PaymentRecord {
  id: string;
  customerName: string;
  amount: number;
  timestamp: Date;
}

const SALES_STORAGE_KEY = 'milk_mate_sales';
const PAYMENTS_STORAGE_KEY = 'milk_mate_payments';

const Index = () => {
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [entryMode, setEntryMode] = useState<'sale' | 'payment'>('sale');
  const [manualCustomer, setManualCustomer] = useState('');
  const [manualLiters, setManualLiters] = useState('');
  const [manualAmount, setManualAmount] = useState('');
  const { toast } = useToast();
  const { user, logout } = useAuth();

  const PRICE_PER_LITER = 80;

  const isOwner = user?.role === 'owner';
  const isCustomer = user?.role === 'customer';
  const currentCustomerName = user?.name?.toLowerCase() || '';

  useEffect(() => {
    if (isCustomer && user?.name) {
      setSelectedCustomer(user.name);
    }
  }, [isCustomer, user?.name]);
  const visibleSales = isCustomer
    ? sales.filter((sale) => sale.customerName.toLowerCase() === currentCustomerName)
    : sales;
  const visiblePayments = isCustomer
    ? payments.filter((payment) => payment.customerName.toLowerCase() === currentCustomerName)
    : payments;

  useEffect(() => {
    try {
      const savedSales = localStorage.getItem(SALES_STORAGE_KEY);
      const savedPayments = localStorage.getItem(PAYMENTS_STORAGE_KEY);

      if (savedSales) {
        setSales(JSON.parse(savedSales).map((sale: any) => ({
          ...sale,
          timestamp: new Date(sale.timestamp),
        })));
      }

      if (savedPayments) {
        setPayments(JSON.parse(savedPayments).map((payment: any) => ({
          ...payment,
          timestamp: new Date(payment.timestamp),
        })));
      }
    } catch (error) {
      console.error('Failed to load saved customer records:', error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(SALES_STORAGE_KEY, JSON.stringify(sales));
      localStorage.setItem(PAYMENTS_STORAGE_KEY, JSON.stringify(payments));
    } catch (error) {
      console.error('Failed to save customer records:', error);
    }
  }, [sales, payments]);

  // Calculate customer balances (debt)
  const getCustomerBalances = () => {
    const balanceMap = new Map<string, number>();
    
    // Add sales (debt)
    visibleSales.forEach(sale => {
      const key = sale.customerName.toLowerCase();
      balanceMap.set(key, (balanceMap.get(key) || 0) + sale.amount);
    });
    
    // Subtract payments
    visiblePayments.forEach(payment => {
      const key = payment.customerName.toLowerCase();
      balanceMap.set(key, (balanceMap.get(key) || 0) - payment.amount);
    });
    
    return balanceMap;
  };

  const normalizeCustomerName = (customerName: string) => {
    const trimmedName = customerName.trim();
    if (!trimmedName) return trimmedName;

    const existingSale = sales.find(
      (record) => record.customerName.toLowerCase() === trimmedName.toLowerCase()
    );
    if (existingSale) return existingSale.customerName;

    const existingPayment = payments.find(
      (record) => record.customerName.toLowerCase() === trimmedName.toLowerCase()
    );
    if (existingPayment) return existingPayment.customerName;

    return trimmedName;
  };

  const customerBalances = getCustomerBalances();
  const totalDebt = Array.from(customerBalances.values()).reduce((sum, balance) => sum + Math.max(0, balance), 0);
  const totalRevenue = visibleSales.reduce((sum, sale) => sum + sale.amount, 0);
  const totalPaid = visiblePayments.reduce((sum, payment) => sum + payment.amount, 0);

  const parseVoiceInput = (transcript: string) => {
    const text = transcript.trim();
    
    // Support multiple languages - check for payment keywords in English and Telugu
    const paidKeywords = ['paid', 'payment', 'చెల్లించాడు', 'చెల్లించింది', 'ఇచ్చాడు', 'ఇచ్చింది'];
    const paidPattern = new RegExp(`(.+?)\\s+(${paidKeywords.join('|')})\\s+(\\d+(?:\\.\\d+)?)`, 'i');
    const paidMatch = text.match(paidPattern);
    if (paidMatch) {
      const customerName = normalizeCustomerName(paidMatch[1].trim());
      const paidAmount = parseFloat(paidMatch[3]);
      
      const newPayment: PaymentRecord = {
        id: Date.now().toString(),
        customerName,
        amount: paidAmount,
        timestamp: new Date(),
      };
      
      setPayments(prev => [newPayment, ...prev]);
      toast({
        title: "Payment recorded!",
        description: `₹${paidAmount} received from ${customerName}`,
        className: "bg-success text-success-foreground",
      });
      return;
    }
    
    // Regular sale: support English and Telugu
    const literKeywords = ['liter', 'litre', 'l', 'లీటర్', 'లీటరు', 'లిటర్'];
    const salePattern = new RegExp(`(.+?)\\s+(\\d+(?:\\.\\d+)?)\\s*(?:${literKeywords.join('|')}|$)`, 'i');
    const numberMatch = text.match(salePattern);
    if (numberMatch) {
      const customerName = normalizeCustomerName(numberMatch[1].trim());
      const liters = parseFloat(numberMatch[2]);
      const amount = liters * PRICE_PER_LITER;
      
      const newSale: SaleRecord = {
        id: Date.now().toString(),
        customerName,
        liters,
        amount,
        timestamp: new Date(),
      };
      
      setSales(prev => [newSale, ...prev]);
      toast({
        title: "Sale recorded!",
        description: `₹${amount} for ${liters}L to ${customerName}`,
        className: "bg-success text-success-foreground",
      });
    } else {
      toast({
        title: "Please try again",
        description: "Say customer name and liters (English/Telugu supported)",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCustomer = (customerName: string) => {
    setSales(prev => prev.filter(sale => sale.customerName.toLowerCase() !== customerName.toLowerCase()));
    setPayments(prev => prev.filter(payment => payment.customerName.toLowerCase() !== customerName.toLowerCase()));
    toast({
      title: "Customer deleted",
      description: `All records for ${customerName} have been removed`,
    });
  };

  const handleAddSale = () => {
    const customerName = normalizeCustomerName(manualCustomer.trim());
    const liters = parseFloat(manualLiters);

    if (!customerName) {
      toast({ title: 'Customer name is required', variant: 'destructive' });
      return;
    }

    if (Number.isNaN(liters) || liters <= 0) {
      toast({ title: 'Enter a valid milk quantity', variant: 'destructive' });
      return;
    }

    const newSale: SaleRecord = {
      id: crypto.randomUUID(),
      customerName,
      liters,
      amount: liters * PRICE_PER_LITER,
      timestamp: new Date(),
    };

    setSales(prev => [newSale, ...prev]);
    setManualCustomer('');
    setManualLiters('');
    toast({ title: 'Sale added', description: `${customerName} updated with ${liters}L` });
  };

  const handleAddPayment = () => {
    const customerName = normalizeCustomerName(manualCustomer.trim());
    const amount = parseFloat(manualAmount);

    if (!customerName) {
      toast({ title: 'Customer name is required', variant: 'destructive' });
      return;
    }

    if (Number.isNaN(amount) || amount <= 0) {
      toast({ title: 'Enter a valid payment amount', variant: 'destructive' });
      return;
    }

    const newPayment: PaymentRecord = {
      id: crypto.randomUUID(),
      customerName,
      amount,
      timestamp: new Date(),
    };

    setPayments(prev => [newPayment, ...prev]);
    setManualCustomer('');
    setManualAmount('');
    toast({ title: 'Payment recorded', description: `${customerName} paid ₹${amount}` });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Professional Header with Stats */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary-foreground/20 rounded-full flex items-center justify-center">
                <Milk className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Digital Dairy Khatha</h1>
                <p className="text-primary-foreground/80 text-sm">Professional Milk Sales Tracker</p>
              </div>
            </div>
            <div className="flex flex-col items-start gap-2 sm:items-end">
              <p className="text-sm text-primary-foreground/90">
                Signed in as <span className="font-semibold">{user?.name || user?.email || "User"}</span>
              </p>
              <Button variant="secondary" size="sm" onClick={logout} className="bg-white/10 text-white border-white/20 hover:bg-white/20">
                Logout
              </Button>
            </div>
          </div>
          
          {/* Financial Summary Cards */}
          <div className="grid grid-cols-3 gap-3 mt-4">
            <Card className="bg-white/10 border-white/20">
              <CardContent className="p-3 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <TrendingUp className="w-4 h-4" />
                  <p className="text-xs font-medium">{isCustomer ? 'Your billed amount' : 'Total Revenue'}</p>
                </div>
                <p className="text-lg font-bold text-primary-foreground">₹{totalRevenue}</p>
              </CardContent>
            </Card>
            <Card className="bg-white/10 border-white/20">
              <CardContent className="p-3 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <IndianRupee className="w-4 h-4" />
                  <p className="text-xs font-medium">{isCustomer ? 'Your payments' : 'Money Received'}</p>
                </div>
                <p className="text-lg font-bold text-primary-foreground">₹{totalPaid}</p>
              </CardContent>
            </Card>
            <Card className="bg-white/10 border-white/20">
              <CardContent className="p-3 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Calendar className="w-4 h-4" />
                  <p className="text-xs font-medium">{isCustomer ? 'Your due balance' : 'Total Debt'}</p>
                </div>
                <p className="text-lg font-bold text-destructive">₹{totalDebt}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Voice Assistant Section */}
      <div className="bg-muted/30 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="max-w-md mx-auto">
            {isOwner ? (
              <div className="space-y-4">
                <VoiceRecorder
                  onTranscription={parseVoiceInput}
                  isListening={isListening}
                  onStartListening={() => setIsListening(true)}
                  onStopListening={() => setIsListening(false)}
                />
                <Card className="border border-border bg-background/80">
                  <CardHeader>
                    <CardTitle className="text-sm font-semibold">Manual update</CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">Add a sale or payment for any customer.</p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant={entryMode === 'sale' ? 'default' : 'outline'}
                        onClick={() => setEntryMode('sale')}
                        className="w-full"
                      >
                        Sale
                      </Button>
                      <Button
                        variant={entryMode === 'payment' ? 'default' : 'outline'}
                        onClick={() => setEntryMode('payment')}
                        className="w-full"
                      >
                        Payment
                      </Button>
                    </div>
                    <div className="grid gap-3">
                      <div>
                        <label className="text-xs text-muted-foreground block mb-1">Customer name</label>
                        <input
                          type="text"
                          value={manualCustomer}
                          onChange={(event) => setManualCustomer(event.target.value)}
                          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                          placeholder="e.g. Ramesh"
                        />
                      </div>
                      {entryMode === 'sale' ? (
                        <div>
                          <label className="text-xs text-muted-foreground block mb-1">Liters</label>
                          <input
                            type="number"
                            value={manualLiters}
                            onChange={(event) => setManualLiters(event.target.value)}
                            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                            placeholder="e.g. 12"
                          />
                        </div>
                      ) : (
                        <div>
                          <label className="text-xs text-muted-foreground block mb-1">Amount</label>
                          <input
                            type="number"
                            value={manualAmount}
                            onChange={(event) => setManualAmount(event.target.value)}
                            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                            placeholder="e.g. 1200"
                          />
                        </div>
                      )}
                    </div>
                    <div className="flex justify-end">
                      <Button
                        onClick={entryMode === 'sale' ? handleAddSale : handleAddPayment}
                        className="w-full md:w-auto"
                      >
                        {entryMode === 'sale' ? 'Add Sale' : 'Add Payment'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="border border-border bg-background/80">
                <CardContent>
                  <p className="text-sm font-medium text-muted-foreground">Your milk consumption and dues are updated by the owner.</p>
                  <p className="mt-2 text-sm text-foreground">If any details are missing, ask Lokesh to update the record.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="transactions" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="transactions" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {isCustomer ? 'My Consumption' : 'Sales'}
            </TabsTrigger>
            <TabsTrigger value="customers" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              {isCustomer ? 'My Account' : 'Customer Accounts'}
            </TabsTrigger>
            <TabsTrigger value="daily" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              {isCustomer ? 'My Daily' : 'Daily Reports'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="transactions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Recent Sales
                </CardTitle>
              </CardHeader>
              <CardContent>
                {visibleSales.length === 0 && visiblePayments.length === 0 ? (
                  <div className="text-center py-8">
                    <Milk className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No sales yet</p>
                    <p className="text-sm text-muted-foreground">Use voice command above to add sales or payments</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {[...visibleSales.map(sale => ({ ...sale, type: 'sale' as const })), 
                      ...visiblePayments.map(payment => ({ ...payment, type: 'payment' as const }))]
                      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                      .map((transaction) => (
                        <div
                          key={transaction.id}
                          className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              transaction.type === 'sale' ? 'bg-primary/10' : 'bg-success/10'
                            }`}>
                              {transaction.type === 'sale' ? 
                                <Milk className="w-5 h-5 text-primary" /> :
                                <IndianRupee className="w-5 h-5 text-success" />
                              }
                            </div>
                            <div>
                              <p className="font-medium capitalize">{transaction.customerName}</p>
                              <p className="text-sm text-muted-foreground">
                                {transaction.type === 'sale' 
                                  ? `${(transaction as SaleRecord).liters}L milk` 
                                  : 'Payment received'
                                 } • {new Date(transaction.timestamp).toLocaleDateString('en-IN', {
                                   day: 'numeric', month: 'short', year: 'numeric'
                                 })} {new Date(transaction.timestamp).toLocaleTimeString('en-IN', {
                                   hour: '2-digit', minute: '2-digit', hour12: true
                                 })}
                              </p>
                            </div>
                          </div>
                          <div className={`font-bold ${
                            transaction.type === 'sale' ? 'text-primary' : 'text-success'
                          }`}>
                            {transaction.type === 'sale' ? '+' : '-'}₹{transaction.amount}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="customers" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  {isCustomer ? 'My Account Summary' : 'Customer Account Balances'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {customerBalances.size === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No customer records yet</p>
                  </div>
                ) : isCustomer ? (
                  <div className="space-y-4">
                    <div className="rounded-2xl border bg-muted/50 p-4">
                      <p className="text-sm text-muted-foreground">Welcome back, {user?.name || 'customer'}.</p>
                      <div className="mt-3 grid grid-cols-3 gap-3">
                        <div className="rounded-xl bg-white/10 p-3">
                          <p className="text-xs uppercase text-muted-foreground">Amount Due</p>
                          <p className="text-xl font-bold text-destructive">₹{customerBalances.get(currentCustomerName)?.toFixed(2) || '0.00'}</p>
                        </div>
                        <div className="rounded-xl bg-white/10 p-3">
                          <p className="text-xs uppercase text-muted-foreground">Total Paid</p>
                          <p className="text-xl font-bold text-success">₹{visiblePayments.reduce((sum, payment) => sum + payment.amount, 0)}</p>
                        </div>
                        <div className="rounded-xl bg-white/10 p-3">
                          <p className="text-xs uppercase text-muted-foreground">Total Milk</p>
                          <p className="text-xl font-bold text-primary">{visibleSales.reduce((sum, sale) => sum + sale.liters, 0)}L</p>
                        </div>
                      </div>
                    </div>
                    <CustomerHistory
                      customerName={user?.name || 'My Account'}
                      sales={visibleSales}
                      onClose={() => setSelectedCustomer(null)}
                      isCustomer={isCustomer}
                    />
                  </div>
                ) : (
                  <div className="space-y-3">
                    {Array.from(customerBalances.entries())
                      .sort(([, a], [, b]) => b - a)
                      .map(([customerKey, balance]) => {
                        const customerName = sales.find(s => s.customerName.toLowerCase() === customerKey)?.customerName || customerKey;
                        const balanceLabel = balance > 0 ? `₹${balance.toFixed(2)} due` : balance < 0 ? `₹${Math.abs(balance).toFixed(2)} credit` : `₹0.00`;
                        const balanceClass = balance > 0 ? 'text-destructive' : 'text-success';
                        return (
                          <div
                            key={customerKey}
                            className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                <Users className="w-5 h-5 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium capitalize">{customerName}</p>
                                <p className="text-sm text-muted-foreground">
                                  {sales.filter(s => s.customerName.toLowerCase() === customerKey).reduce((sum, s) => sum + s.liters, 0)}L total
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="text-right">
                                <p className={`font-bold ${balanceClass}`}>{balanceLabel}</p>
                                <p className="text-xs text-muted-foreground">Account balance</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedCustomer(customerName)}
                                >
                                  View
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteCustomer(customerName)}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </CardContent>
            </Card>
            {!isCustomer && selectedCustomer && (
              <div className="space-y-4">
                <CustomerHistory
                  customerName={selectedCustomer}
                  sales={sales}
                  onClose={() => setSelectedCustomer(null)}
                />
              </div>
            )}
          </TabsContent>

          <TabsContent value="daily" className="space-y-4">
            <DailySales sales={visibleSales} payments={visiblePayments} isCustomer={isCustomer} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer Info */}
      <div className="bg-muted/50 mt-12">
        <div className="container mx-auto px-4 py-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Milk Price: ₹80 per liter • Voice-enabled digital khatha
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;