import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, User, Milk } from 'lucide-react';
import VoiceRecorder from './VoiceRecorder';
import { useToast } from '@/hooks/use-toast';

interface SaleRecord {
  id: string;
  customerName: string;
  liters: number;
  amount: number;
  timestamp: Date;
}

interface SalesEntryProps {
  onAddSale: (sale: Omit<SaleRecord, 'id' | 'timestamp'>) => void;
}

const PRICE_PER_LITER = 80;

const SalesEntry: React.FC<SalesEntryProps> = ({ onAddSale }) => {
  const [customerName, setCustomerName] = useState('');
  const [liters, setLiters] = useState('');
  const [isListening, setIsListening] = useState(false);
  const { toast } = useToast();

  const parseVoiceInput = (transcript: string) => {
    // Simple parsing for "Name X liters" pattern
    const text = transcript.toLowerCase().trim();
    
    // Try to extract number (liters) from the text
    const numberMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:liter|litre|l)/i);
    const extractedLiters = numberMatch ? numberMatch[1] : '';
    
    // Remove the liters part to get the name
    const nameText = text
      .replace(/(\d+(?:\.\d+)?)\s*(?:liter|litre|l)/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
    
    if (nameText && extractedLiters) {
      setCustomerName(nameText);
      setLiters(extractedLiters);
      toast({
        title: "Voice input captured!",
        description: `${nameText} - ${extractedLiters} liters`,
      });
    } else {
      toast({
        title: "Please try again",
        description: "Say customer name followed by number of liters",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customerName.trim() || !liters || parseFloat(liters) <= 0) {
      toast({
        title: "Invalid input",
        description: "Please enter customer name and valid liters",
        variant: "destructive",
      });
      return;
    }

    const literValue = parseFloat(liters);
    const amount = literValue * PRICE_PER_LITER;

    onAddSale({
      customerName: customerName.trim(),
      liters: literValue,
      amount,
    });

    // Clear form
    setCustomerName('');
    setLiters('');
    
    toast({
      title: "Sale recorded!",
      description: `₹${amount} for ${literValue}L to ${customerName}`,
      className: "bg-success text-success-foreground",
    });
  };

  const calculatedAmount = liters ? parseFloat(liters) * PRICE_PER_LITER : 0;

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Milk className="w-5 h-5 text-primary" />
          Record Milk Sale
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Voice Input */}
        <div>
          <Label className="text-sm font-medium">Voice Input</Label>
          <div className="mt-2">
            <VoiceRecorder
              onTranscription={parseVoiceInput}
              isListening={isListening}
              onStartListening={() => setIsListening(true)}
              onStopListening={() => setIsListening(false)}
            />
          </div>
        </div>

        {/* Manual Input Form */}
        <div className="border-t pt-4">
          <Label className="text-sm font-medium text-muted-foreground">Or enter manually</Label>
          <form onSubmit={handleSubmit} className="space-y-4 mt-3">
            <div className="space-y-2">
              <Label htmlFor="customerName">Customer Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="customerName"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter customer name"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="liters">Liters</Label>
              <div className="relative">
                <Milk className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="liters"
                  type="number"
                  step="0.5"
                  min="0"
                  value={liters}
                  onChange={(e) => setLiters(e.target.value)}
                  placeholder="Enter liters"
                  className="pl-10"
                />
              </div>
            </div>

            {calculatedAmount > 0 && (
              <div className="p-3 bg-success/10 rounded-lg border border-success/20">
                <p className="text-sm font-medium text-success">
                  Amount: ₹{calculatedAmount.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {liters} × ₹{PRICE_PER_LITER}/L
                </p>
              </div>
            )}

            <Button type="submit" className="w-full" size="lg">
              <Plus className="w-4 h-4 mr-2" />
              Add Sale
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
};

export default SalesEntry;