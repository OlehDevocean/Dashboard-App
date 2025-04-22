import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle, ExternalLink } from 'lucide-react';

// Тип для результату перевірки підключення Jira
interface JiraConnectionResponse {
  success: boolean;
  error?: string;
  data?: {
    displayName?: string;
    name?: string;
    emailAddress?: string;
    [key: string]: any;
  };
}

export function JiraIntegration() {
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message?: string;
    data?: any;
  } | null>(null);

  const handleTestConnection = async () => {
    setTestingConnection(true);
    setTestResult(null);
    
    try {
      // Використовуємо звичайний fetch
      const response = await fetch('/api/jira/test-connection');
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Помилка з\'єднання з Jira');
      }
      
      const data = await response.json() as JiraConnectionResponse;
      
      setTestResult({
        success: data.success,
        message: data.error,
        data: data.data
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: error instanceof Error ? error.message : 'Невідома помилка'
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const getStatusComponent = () => {
    if (testingConnection) {
      return (
        <div className="flex items-center space-x-2">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span>Перевірка з'єднання...</span>
        </div>
      );
    }

    if (!testResult) {
      return <Badge variant="outline">Статус невідомий</Badge>;
    }

    return testResult.success ? (
      <div className="flex items-center space-x-2">
        <CheckCircle className="h-5 w-5 text-green-500" />
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          Підключено
        </Badge>
      </div>
    ) : (
      <div className="flex items-center space-x-2">
        <XCircle className="h-5 w-5 text-red-500" />
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
          Помилка з'єднання
        </Badge>
      </div>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Інтеграція з Jira</CardTitle>
        <CardDescription>
          Інтеграція з Jira дозволяє отримувати дані про задачі, проекти та користувачів для відображення в RACI матриці.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="font-medium">Статус з'єднання:</span>
            {getStatusComponent()}
          </div>
          
          {testResult && !testResult.success && (
            <div className="bg-red-50 p-3 rounded-md border border-red-200 text-red-700 text-sm">
              <p className="font-semibold">Помилка:</p>
              <p>{testResult.message}</p>
            </div>
          )}
          
          {testResult && testResult.success && testResult.data && (
            <div className="bg-green-50 p-3 rounded-md border border-green-200 text-green-700 text-sm">
              <p className="font-semibold">З'єднання успішне!</p>
              <p>Користувач: {testResult.data.displayName || testResult.data.name || 'Невідомий'}</p>
              <p>Email: {testResult.data.emailAddress || 'Невідомий'}</p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={handleTestConnection}
          disabled={testingConnection}
        >
          {testingConnection ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Перевірка...
            </>
          ) : (
            'Перевірити з\'єднання'
          )}
        </Button>
        
        <Button 
          variant="outline"
          className="ml-2"
          onClick={() => window.open(`https://${testResult?.data?.domain || 'your-domain.atlassian.net'}`, '_blank')}
        >
          Відкрити Jira
          <ExternalLink className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}