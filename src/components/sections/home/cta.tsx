import { MoveRight, PhoneCall } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

function CTA() {
  return (
    <div className="w-full py-20 lg:py-40">
      <div className="container mx-auto">
        <div className="flex flex-col text-center bg-muted rounded-md p-4 lg:p-14 gap-8 items-center">
          <div>
            <Badge variant="secondary">Start Your Success Story</Badge>
          </div>
          <div className="flex flex-col gap-4 max-w-3xl">
            <h2 className="text-3xl md:text-5xl tracking-tighter font-bold">
              Ready to Transform Your Exam Results?
            </h2>
            <p className="text-lg leading-relaxed tracking-tight text-muted-foreground max-w-2xl mx-auto">
              Join over 100,000 students who have achieved their dream scores with our 
              proven preparation methods. Start your free trial today and begin your journey to success.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button className="gap-4 px-8 py-6 text-lg" asChild>
              <Link href="/register">
                Start Free Trial <MoveRight className="w-5 h-5" />
              </Link>
            </Button>
            <Button className="gap-4 px-8 py-6 text-lg" variant="outline" asChild>
              <Link href="/contact">
                Book a Demo <PhoneCall className="w-5 h-5" />
              </Link>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            No credit card required · 7-day free trial · Cancel anytime
          </p>
        </div>
      </div>
    </div>
  );
}

export default CTA;
