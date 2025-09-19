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

interface DailySalesProps {
  sales: SaleRecord[];
}

const DailySales: React.FC<DailySalesProps> = ({ sales }) => {
  const today = new Date();
  const todaySales = sales.filter(sale => {
    const saleDate = new Date(sale.timestamp);
    return saleDate.toDateString() === today.toDateString();
  });

  const totalAmount = todaySales.reduce((sum, sale) => sum + sale.amount, 0);
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
            Today's Sales Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-bold text-success">₹{totalAmount}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total Milk Sold</p>
              <p className="text-2xl font-bold text-primary">{totalLiters}L</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              {todaySales.length} transactions • {new Date().toLocaleDateString('en-IN')}
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
          {todaySales.length === 0 ? (
            <div className="text-center py-8">
              <Milk className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No sales recorded today</p>
              <p className="text-sm text-muted-foreground">Start by recording your first sale!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todaySales.map((sale) => (
                <div
                  key={sale.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium capitalize">{sale.customerName}</p>
                      <p className="text-sm text-muted-foreground">
                        {sale.liters}L • {formatTime(sale.timestamp)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="font-medium">
                      <IndianRupee className="w-3 h-3 mr-1" />
                      {sale.amount}
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