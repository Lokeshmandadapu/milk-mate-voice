import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, IndianRupee, User, Milk } from 'lucide-react';

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

interface DailySalesProps {
  sales: SaleRecord[];
  payments: PaymentRecord[];
  isCustomer?: boolean;
}

const DailySales: React.FC<DailySalesProps> = ({ sales, payments, isCustomer }) => {
  const today = new Date();
  const todaySales = sales.filter(sale => {
    const saleDate = new Date(sale.timestamp);
    return saleDate.toDateString() === today.toDateString();
  });

  const todayPayments = payments.filter(payment => {
    const paymentDate = new Date(payment.timestamp);
    return paymentDate.toDateString() === today.toDateString();
  });

  const totalSalesAmount = todaySales.reduce((sum, sale) => sum + sale.amount, 0);
  const totalPaymentsAmount = todayPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const totalLiters = todaySales.reduce((sum, sale) => sum + sale.liters, 0);

  const formatTime = (timestamp: Date) => {
    return new Date(timestamp).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div className="space-y-4">
      {/* Daily Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-primary" />
            {isCustomer ? "Today's Consumption" : "Today's Sales Summary"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Sales Revenue</p>
              <p className="text-2xl font-bold text-primary">₹{totalSalesAmount}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Payments Received</p>
              <p className="text-2xl font-bold text-success">₹{totalPaymentsAmount}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Milk Sold</p>
              <p className="text-2xl font-bold text-accent">{totalLiters}L</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              {todaySales.length} sales, {todayPayments.length} payments • {new Date().toLocaleDateString('en-IN', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
              })}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Sales List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Today's Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {todaySales.length === 0 && todayPayments.length === 0 ? (
            <div className="text-center py-8">
              <Milk className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No transactions today</p>
              <p className="text-sm text-muted-foreground">
                {isCustomer ? 'Your record will appear once the owner updates it.' : 'Use voice command to add sales or payments.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {[
                ...todaySales.map(sale => ({ ...sale, type: 'sale' as const })),
                ...todayPayments.map(payment => ({ ...payment, type: 'payment' as const }))
              ]
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
                          } • {formatTime(transaction.timestamp)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge 
                        variant="outline" 
                        className={`font-medium ${
                          transaction.type === 'sale' ? 'border-primary text-primary' : 'border-success text-success'
                        }`}
                      >
                        {transaction.type === 'sale' ? '+' : '-'}
                        <IndianRupee className="w-3 h-3 mr-1" />
                        {transaction.amount}
                      </Badge>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DailySales;