import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, IndianRupee, User, TrendingUp } from 'lucide-react';

interface SaleRecord {
  id: string;
  customerName: string;
  liters: number;
  amount: number;
  timestamp: Date;
}

interface CustomerTotalsProps {
  sales: SaleRecord[];
}

interface CustomerSummary {
  name: string;
  totalAmount: number;
  totalLiters: number;
  transactionCount: number;
  lastPurchase: Date;
}

const CustomerTotals: React.FC<CustomerTotalsProps> = ({ sales }) => {
  // Group sales by customer
  const customerSummaries: CustomerSummary[] = React.useMemo(() => {
    const customerMap = new Map<string, CustomerSummary>();

    sales.forEach(sale => {
      const customerName = sale.customerName.toLowerCase();
      const existing = customerMap.get(customerName);

      if (existing) {
        existing.totalAmount += sale.amount;
        existing.totalLiters += sale.liters;
        existing.transactionCount += 1;
        if (sale.timestamp > existing.lastPurchase) {
          existing.lastPurchase = sale.timestamp;
        }
      } else {
        customerMap.set(customerName, {
          name: sale.customerName,
          totalAmount: sale.amount,
          totalLiters: sale.liters,
          transactionCount: 1,
          lastPurchase: sale.timestamp,
        });
      }
    });

    return Array.from(customerMap.values()).sort(
      (a, b) => b.totalAmount - a.totalAmount
    );
  }, [sales]);

  const totalRevenue = customerSummaries.reduce((sum, customer) => sum + customer.totalAmount, 0);
  const totalCustomers = customerSummaries.length;

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
    });
  };

  return (
    <div className="space-y-4">
      {/* Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Customer Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-bold text-success">₹{totalRevenue}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Active Customers</p>
              <p className="text-2xl font-bold text-primary">{totalCustomers}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customer List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Customer Rankings
          </CardTitle>
        </CardHeader>
        <CardContent>
          {customerSummaries.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No customers yet</p>
              <p className="text-sm text-muted-foreground">Your customer list will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {customerSummaries.map((customer, index) => (
                <div
                  key={customer.name}
                  className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium capitalize">{customer.name}</p>
                        {index < 3 && (
                          <Badge variant="secondary" className="text-xs">
                            Top {index + 1}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {customer.totalLiters}L • {customer.transactionCount} orders
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Last: {formatDate(customer.lastPurchase)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="font-medium">
                      <IndianRupee className="w-3 h-3 mr-1" />
                      {customer.totalAmount}
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

export default CustomerTotals;