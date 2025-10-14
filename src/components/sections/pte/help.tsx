import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle } from 'lucide-react';

export function PTEHelp() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Help (Q&A)</CardTitle>
          <CardDescription>Find answers to common questions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { question: 'How do I improve my speaking score?', answers: 12 },
              { question: 'What is the best way to practice writing?', answers: 8 },
              { question: 'How long should I study each day?', answers: 15 }
            ].map((faq, index) => (
              <div 
                key={index} 
                className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
              >
                <h3 className="font-medium">{faq.question}</h3>
                <div className="flex items-center mt-2">
                  <MessageCircle className="h-4 w-4 text-muted-foreground mr-2" />
                  <span className="text-sm text-muted-foreground">{faq.answers} answers</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}