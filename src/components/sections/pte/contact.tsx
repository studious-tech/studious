import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Phone, Mail, MessageCircle } from 'lucide-react';

export function PTEContact() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Contact Us</CardTitle>
          <CardDescription>Get in touch with our support team</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border rounded-lg p-4 text-center">
              <Phone className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <h3 className="font-medium">Phone Support</h3>
              <p className="text-sm text-muted-foreground mt-1">+1 (555) 123-4567</p>
              <p className="text-xs text-muted-foreground">Mon-Fri 9AM-5PM</p>
            </div>
            
            <div className="border rounded-lg p-4 text-center">
              <Mail className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <h3 className="font-medium">Email Support</h3>
              <p className="text-sm text-muted-foreground mt-1">support@ptemaster.com</p>
              <p className="text-xs text-muted-foreground">24/7 Response</p>
            </div>
            
            <div className="border rounded-lg p-4 text-center">
              <MessageCircle className="h-8 w-8 text-purple-500 mx-auto mb-2" />
              <h3 className="font-medium">Live Chat</h3>
              <p className="text-sm text-muted-foreground mt-1">Start a conversation</p>
              <p className="text-xs text-muted-foreground">Online now</p>
            </div>
          </div>
          
          <div className="mt-6">
            <h3 className="font-medium mb-3">Send us a message</h3>
            <div className="space-y-3">
              <input 
                type="text" 
                placeholder="Your name" 
                className="w-full px-3 py-2 border rounded-md"
              />
              <input 
                type="email" 
                placeholder="Your email" 
                className="w-full px-3 py-2 border rounded-md"
              />
              <textarea 
                placeholder="Your message" 
                rows={4}
                className="w-full px-3 py-2 border rounded-md"
              ></textarea>
              <Button>Send Message</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}