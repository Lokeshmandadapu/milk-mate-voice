import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Milk, Calendar, Users, Plus, IndianRupee, TrendingUp, Trash2 } from 'lucide-react';
import VoiceRecorder from '@/components/VoiceRecorder';
import DailySales from '@/components/DailySales';
import CustomerTotals from '@/components/CustomerTotals';
import { useToast } from '@/hooks/use-toast';

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

const Index = () => {
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [isListening, setIsListening] = useState(false);
  const { toast } = useToast();

  const PRICE_PER_LITER = 80;

  // Calculate customer balances (debt)
  const getCustomerBalances = () => {
    const balanceMap = new Map<string, number>();
    
    // Add sales (debt)
    sales.forEach(sale => {
      const key = sale.customerName.toLowerCase();
      balanceMap.set(key, (balanceMap.get(key) || 0) + sale.amount);
    });
    
    // Subtract payments
    payments.forEach(payment => {
      const key = payment.customerName.toLowerCase();
      balanceMap.set(key, (balanceMap.get(key) || 0) - payment.amount);
    });
    
    return balanceMap;
  };

  const customerBalances = getCustomerBalances();
  const totalDebt = Array.from(customerBalances.values()).reduce((sum, balance) => sum + Math.max(0, balance), 0);
  const totalRevenue = sales.reduce((sum, sale) => sum + sale.amount, 0);
  const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);

  const parseVoiceInput = (transcript: string) => {
    const text = transcript.trim();
    
    // Support multiple languages - check for payment keywords in English and Telugu
    const paidKeywords = ['paid', 'payment', 'చెల్లించాడు', 'చెల్లించింది', 'ఇచ్చాడు', 'ఇచ్చింది'];
    const paidPattern = new RegExp(`(.+?)\\s+(${paidKeywords.join('|')})\\s+(\\d+(?:\\.\\d+)?)`, 'i');
    const paidMatch = text.match(paidPattern);
    if (paidMatch) {
      const customerName = paidMatch[1].trim();
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
      const customerName = numberMatch[1].trim();
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

  return (
    <div className="min-h-screen bg-background">
      {/* Professional Header with Stats */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary-foreground/20 rounded-full flex items-center justify-center">
                <Milk className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Digital Dairy Khatha</h1>
                <p className="text-primary-foreground/80 text-sm">Professional Milk Sales Tracker</p>
              </div>
            </div>
          </div>
          
          {/* Financial Summary Cards */}
          <div className="grid grid-cols-3 gap-3 mt-4">
            <Card className="bg-white/10 border-white/20">
              <CardContent className="p-3 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <TrendingUp className="w-4 h-4" />
                  <p className="text-xs font-medium">Total Revenue</p>
                </div>
                <p className="text-lg font-bold text-primary-foreground">₹{totalRevenue}</p>
              </CardContent>
            </Card>
            <Card className="bg-white/10 border-white/20">
              <CardContent className="p-3 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <IndianRupee className="w-4 h-4" />
                  <p className="text-xs font-medium">Money Received</p>
                </div>
                <p className="text-lg font-bold text-primary-foreground">₹{totalPaid}</p>
              </CardContent>
            </Card>
            <Card className="bg-white/10 border-white/20">
              <CardContent className="p-3 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Calendar className="w-4 h-4" />
                  <p className="text-xs font-medium">Total Debt</p>
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
            <VoiceRecorder
              onTranscription={parseVoiceInput}
              isListening={isListening}
              onStartListening={() => setIsListening(true)}
              onStopListening={() => setIsListening(false)}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="transactions" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="transactions" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Sales
            </TabsTrigger>
            <TabsTrigger value="customers" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Customer Accounts
            </TabsTrigger>
            <TabsTrigger value="daily" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Daily Reports
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
                {sales.length === 0 && payments.length === 0 ? (
                  <div className="text-center py-8">
                    <Milk className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No sales yet</p>
                    <p className="text-sm text-muted-foreground">Use voice command above to add sales or payments</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {[...sales.map(sale => ({ ...sale, type: 'sale' as const })), 
                      ...payments.map(payment => ({ ...payment, type: 'payment' as const }))]
                      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                      .slice(0, 10)
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
                  Customer Account Balances
                </CardTitle>
              </CardHeader>
              <CardContent>
                {customerBalances.size === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No customers yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {Array.from(customerBalances.entries())
                      .filter(([_, balance]) => balance > 0.01) // Only show customers with debt
                      .sort(([,a], [,b]) => b - a)
                      .map(([customerKey, balance]) => {
                        const customerName = sales.find(s => s.customerName.toLowerCase() === customerKey)?.customerName || customerKey;
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
                                  Outstanding balance • {sales.filter(s => s.customerName.toLowerCase() === customerKey).reduce((sum, s) => sum + s.liters, 0)}L total
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="text-right">
                                <p className="font-bold text-destructive">₹{balance.toFixed(2)}</p>
                                <p className="text-xs text-muted-foreground">Amount due</p>
                              </div>
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
                        );
                      })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="daily" className="space-y-4">
            <DailySales sales={sales} payments={payments} />
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