import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function PTENotifications() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Notification Centre</CardTitle>
          <CardDescription>View your recent notifications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { title: 'New Practice Test Available', time: '2 hours ago', unread: true },
              { title: 'Your writing task has been graded', time: '1 day ago', unread: false },
              { title: 'Reminder: Complete your daily challenge', time: '2 days ago', unread: false }
            ].map((notification, index) => (
              <div 
                key={index} 
                className={`p-4 border rounded-lg ${notification.unread ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' : ''}`}
              >
                <h3 className={`font-medium ${notification.unread ? 'text-blue-900 dark:text-blue-100' : ''}`}>
                  {notification.title}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">{notification.time}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}