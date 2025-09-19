import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Milk, Calendar, Users, Plus } from 'lucide-react';
import SalesEntry from '@/components/SalesEntry';
import DailySales from '@/components/DailySales';
import CustomerTotals from '@/components/CustomerTotals';

interface SaleRecord {
  id: string;
  customerName: string;
  liters: number;
  amount: number;
  timestamp: Date;
}

const Index = () => {
  const [sales, setSales] = useState<SaleRecord[]>([]);

  const handleAddSale = (saleData: Omit<SaleRecord, 'id' | 'timestamp'>) => {
    const newSale: SaleRecord = {
      ...saleData,
      id: Date.now().toString(),
      timestamp: new Date(),
    };
    setSales(prev => [newSale, ...prev]);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary-foreground/20 rounded-full flex items-center justify-center">
              <Milk className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Milk Sales Tracker</h1>
              <p className="text-primary-foreground/80">Digital Khatha for Dairy Business</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="add-sale" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="add-sale" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Sale
            </TabsTrigger>
            <TabsTrigger value="daily" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Daily Sales
            </TabsTrigger>
            <TabsTrigger value="customers" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Customers
            </TabsTrigger>
          </TabsList>

          <TabsContent value="add-sale" className="space-y-4">
            <SalesEntry onAddSale={handleAddSale} />
            
            {/* Quick Stats */}
            {sales.length > 0 && (
              <div className="grid grid-cols-2 gap-4 mt-6">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-success">
                        ₹{sales.reduce((sum, sale) => sum + sale.amount, 0)}
                      </p>
                      <p className="text-sm text-muted-foreground">Total Revenue</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">
                        {sales.reduce((sum, sale) => sum + sale.liters, 0)}L
                      </p>
                      <p className="text-sm text-muted-foreground">Total Milk Sold</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="daily" className="space-y-4">
            <DailySales sales={sales} />
          </TabsContent>

          <TabsContent value="customers" className="space-y-4">
            <CustomerTotals sales={sales} />
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