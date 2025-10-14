import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function IELTSSettings() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
          <CardDescription>Manage your account and preferences</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { title: 'Account Settings', desc: 'Update your profile information' },
              { title: 'Notification Preferences', desc: 'Manage email and push notifications' },
              { title: 'Privacy Settings', desc: 'Control your data and privacy' },
              { title: 'Language Preferences', desc: 'Set your preferred language' }
            ].map((setting, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                <div>
                  <h3 className="font-medium">{setting.title}</h3>
                  <p className="text-sm text-muted-foreground">{setting.desc}</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}