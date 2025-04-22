import axios, { AxiosError } from 'axios';
import { RaciMatrixData } from '../../client/src/lib/types';

// Використовуємо змінні середовища для доступу до Jira
const JIRA_API_TOKEN = process.env.JIRA_API_TOKEN;
const JIRA_EMAIL = process.env.JIRA_EMAIL;
const JIRA_DOMAIN = process.env.JIRA_DOMAIN;

// Функція для форматування часу в секундах у формат "NNг NNхв"
function formatTime(seconds: number): string {
  if (!seconds) return '0г';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  let result = '';
  if (hours > 0) result += `${hours}г `;
  if (minutes > 0) result += `${minutes}хв`;
  
  return result.trim();
}

// Виводимо повну інформацію про змінні середовища для відлагодження
console.log('=== Jira API Configuration (при запуску) ===');
console.log('JIRA_DOMAIN:', JIRA_DOMAIN);
console.log('JIRA_EMAIL:', JIRA_EMAIL);
console.log('JIRA_API_TOKEN (частково):', JIRA_API_TOKEN ? JIRA_API_TOKEN.substring(0, 5) + '...' : 'не вказано');

// Базовий URL для API Jira
const baseURL = `https://${JIRA_DOMAIN}/rest/api/3`;

// Підготовка автентифікаційних даних
const authHeader = Buffer.from(`${JIRA_EMAIL}:${JIRA_API_TOKEN}`).toString('base64');
console.log('Закодований рядок автентифікації:', `${JIRA_EMAIL}:${JIRA_API_TOKEN ? '***' : 'не вказано'}`);
console.log('Base64 заголовок:', authHeader);

// Створюємо екземпляр axios з базовою конфігурацією
const jiraApi = axios.create({
  baseURL,
  auth: {
    username: JIRA_EMAIL || '',
    password: JIRA_API_TOKEN || '',
  },
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Authorization': `Basic ${authHeader}`, // Додаємо базову автентифікацію в заголовки
  },
});

// Типи для даних Jira
interface JiraIssue {
  id: string;
  key: string;
  fields: {
    summary: string;
    status: {
      name: string;
    };
    assignee?: {
      displayName: string;
    };
    issuetype: {
      name: string;
    };
    priority?: {
      name: string;
    };
    customfield_10010?: string; // Поле для спринту, може відрізнятися залежно від налаштувань
    
    // Поля для естімейтів та відстеження часу
    timeoriginalestimate?: number; // Початкова оцінка часу в секундах
    timeestimate?: number; // Поточна оцінка часу в секундах
    timespent?: number; // Витрачений час в секундах
    
    // Агреговані значення (для підзадач)
    aggregatetimeoriginalestimate?: number; // Агрегована початкова оцінка часу в секундах
    aggregatetimeestimate?: number; // Агрегована поточна оцінка часу в секундах
    aggregatetimespent?: number; // Агрегований витрачений час в секундах
  };
}

interface JiraUser {
  displayName: string;
  emailAddress: string;
  accountId: string;
}

// Перевірка з'єднання з Jira API
export async function testJiraConnection() {
  try {
    console.log('Тестуємо з\'єднання з Jira з такими параметрами:');
    console.log('JIRA_DOMAIN:', JIRA_DOMAIN);
    console.log('JIRA_EMAIL (повний):', JIRA_EMAIL); // Повна адреса для перевірки
    console.log('JIRA_API_TOKEN (перші 10 символів):', JIRA_API_TOKEN ? JIRA_API_TOKEN.substring(0, 10) + '...' : 'не вказано');
    
    // Спробуємо отримати інформацію про поточного користувача
    const response = await jiraApi.get('/myself');
    
    console.log('Успішне з\'єднання з Jira API. Отримана відповідь:', JSON.stringify(response.data, null, 2));
    
    // Також спробуємо отримати проекти та одну задачу для перевірки
    try {
      const projectsResponse = await jiraApi.get('/project');
      console.log(`Отримано ${projectsResponse.data.length} проектів`);
      
      // Отримуємо список задач, якщо є хоча б один проект
      if (projectsResponse.data.length > 0) {
        const issuesResponse = await jiraApi.get('/search', {
          params: { 
            jql: 'order by created DESC',
            maxResults: 5
          }
        });
        
        console.log(`Отримано ${issuesResponse.data.issues?.length || 0} задач`);
        if (issuesResponse.data.issues?.length) {
          console.log('Перша задача:', JSON.stringify(issuesResponse.data.issues[0].key, null, 2));
        }
      }
    } catch (subError: any) {
      console.log('Помилка при отриманні додаткової інформації:', subError.message);
    }
    
    return {
      success: true,
      data: {
        ...response.data,
        domain: JIRA_DOMAIN
      },
    };
  } catch (error: any) {
    console.error('Помилка з\'єднання з Jira API:');
    
    if (error.response) {
      // Отримали відповідь від сервера з помилкою
      console.error(`Статус: ${error.response.status}`);
      console.error('Заголовки:', JSON.stringify(error.response.headers, null, 2));
      console.error('Дані:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      // Запит відправлено, але відповіді не отримано
      console.error('Запит без відповіді:', error.request);
    } else {
      // Помилка під час налаштування запиту
      console.error('Помилка:', error.message);
    }
    
    console.error('Конфігурація запиту:', error.config?.baseURL, error.config?.url);
    
    return {
      success: false,
      error: error instanceof Error 
        ? error.message 
        : (error.response?.data?.errorMessages?.[0] || 'Невідома помилка'),
    };
  }
}

// Отримання списку проектів
export async function getProjects() {
  try {
    const response = await jiraApi.get('/project');
    return response.data;
  } catch (error) {
    console.error('Помилка при отриманні проектів Jira:', error);
    throw error;
  }
}

// Отримання списку задач
export async function getIssues(jql = 'order by created DESC', maxResults = 100) {
  try {
    console.log(`Отримуємо задачі Jira з запитом: "${jql}"`);
    const response = await jiraApi.get('/search', {
      params: {
        jql,
        maxResults,
        fields: 'summary,status,assignee,issuetype,priority,timeoriginalestimate,timeestimate,timespent,aggregatetimespent,aggregatetimeestimate,aggregatetimeoriginalestimate'
      },
    });
    console.log(`Отримано ${response.data.issues?.length || 0} задач з Jira`);
    return response.data.issues as JiraIssue[];
  } catch (error) {
    console.error('Помилка при отриманні задач Jira:', error);
    throw error;
  }
}

// Отримання користувачів
export async function getUsers() {
  try {
    // Пошук користувачів за запитом, тут використовуємо пустий запит для отримання всіх користувачів
    const response = await jiraApi.get('/users/search', {
      params: {
        maxResults: 100,
      },
    });
    return response.data as JiraUser[];
  } catch (error) {
    console.error('Помилка при отриманні користувачів Jira:', error);
    throw error;
  }
}

// Отримання даних для RACI матриці з Jira
export async function getRaciMatrixData(): Promise<RaciMatrixData> {
  try {
    console.log('Запит даних для RACI матриці з Jira');
    
    // Перевіряємо, чи є доступними облікові дані для Jira
    console.log('Перевірка доступності облікових даних Jira:');
    console.log('JIRA_DOMAIN:', JIRA_DOMAIN ? 'Встановлено' : 'Не встановлено');
    console.log('JIRA_EMAIL:', JIRA_EMAIL ? 'Встановлено' : 'Не встановлено');
    console.log('JIRA_API_TOKEN:', JIRA_API_TOKEN ? 'Встановлено' : 'Не встановлено');
    
    if (!JIRA_DOMAIN || !JIRA_EMAIL || !JIRA_API_TOKEN) {
      throw new Error('Відсутні обов\'язкові облікові дані Jira');
    }
    
    // Спробуємо спочатку перевірити з'єднання
    console.log('Перевірка з\'єднання перед отриманням даних...');
    
    let issues: JiraIssue[] = [];
    let users: JiraUser[] = [];
    
    try {
      users = await getUsers();
      console.log(`Отримано ${users.length} користувачів`);
    } catch (userError) {
      console.error('Помилка при отриманні користувачів:', userError);
      console.log('Спробуємо продовжити без даних про користувачів');
      users = [
        { displayName: 'API Error', emailAddress: '', accountId: '1' },
        { displayName: 'No Access', emailAddress: '', accountId: '2' }
      ];
    }
    
    try {
      issues = await getIssues();
      console.log(`Отримано ${issues.length} задач`);
      if (issues.length > 0) {
        console.log('Приклад першої задачі:');
        console.log(`ID: ${issues[0].id}`);
        console.log(`Ключ: ${issues[0].key}`);
        console.log(`Заголовок: ${issues[0].fields.summary}`);
        console.log(`Статус: ${issues[0].fields.status.name}`);
      }
    } catch (issueError) {
      console.error('Помилка при отриманні задач:', issueError);
      console.log('Спробуємо продовжити без даних про задачі');
      issues = [];
    }

    // Отримуємо ролі (користувачів) для матриці
    const roles = users
      .slice(0, 5) // Обмежуємо кількість користувачів для простоти
      .map(user => user.displayName);
      
    console.log(`Використовуємо ${roles.length} ролей:`, roles);

    // Створюємо завдання для матриці на основі задач Jira
    const tasks = issues
      .slice(0, 10) // Обмежуємо кількість задач для простоти
      .map(issue => {
        // Створюємо призначення ролей для цієї задачі
        const assignments = roles.map((_, index) => {
          let type: 'R' | 'A' | 'C' | 'I' = 'I';
          
          // Для прикладу призначаємо ролі на основі індексу
          if (index === 0) {
            type = 'R';
          } else if (index === 1) {
            type = 'A';
          } else if (index === 2 || index === 3) {
            type = 'C';
          }
          
          return {
            roleIndex: index,
            type,
          };
        });

        // Отримуємо інформацію про час з полів Jira
        const originalEstimate = issue.fields.timeoriginalestimate || issue.fields.aggregatetimeoriginalestimate;
        const currentEstimate = issue.fields.timeestimate || issue.fields.aggregatetimeestimate;
        const timeSpent = issue.fields.timespent || issue.fields.aggregatetimespent;
        
        // Розраховуємо прогрес (якщо є дані про витрачений час та естімейти)
        let progress = 0;
        if (originalEstimate && timeSpent) {
          progress = Math.min(100, Math.round((timeSpent / originalEstimate) * 100));
        } else if (timeSpent && currentEstimate) {
          progress = Math.min(100, Math.round((timeSpent / currentEstimate) * 100));
        }
        
        // Виводимо знайдені значення для відлагодження
        if (originalEstimate || currentEstimate || timeSpent) {
          console.log(`Задача ${issue.key} має оцінки часу:`, { 
            originalEstimate: originalEstimate ? formatTime(originalEstimate) : 'не вказано',
            currentEstimate: currentEstimate ? formatTime(currentEstimate) : 'не вказано',
            timeSpent: timeSpent ? formatTime(timeSpent) : 'не вказано',
            progress: progress ? `${progress}%` : 'не розраховано'
          });
        }

        return {
          name: issue.fields.summary,
          key: issue.key,
          assignments,
          originalEstimate,
          currentEstimate,
          timeSpent,
          progress
        };
      });
    
    console.log(`Створено ${tasks.length} завдань для матриці RACI`);

    // Рахуємо статистику по часу
    const totalOriginalEstimate = tasks.reduce((sum, task) => sum + (task.originalEstimate || 0), 0);
    const totalCurrentEstimate = tasks.reduce((sum, task) => sum + (task.currentEstimate || 0), 0);
    const totalTimeSpent = tasks.reduce((sum, task) => sum + (task.timeSpent || 0), 0);
    
    // Розраховуємо точність оцінки
    let estimateAccuracy = 0;
    if (totalOriginalEstimate > 0 && totalTimeSpent > 0) {
      // Точність = 100 - відсоток відхилення (абсолютна різниця / початкова оцінка * 100)
      const deviation = Math.abs(totalTimeSpent - totalOriginalEstimate) / totalOriginalEstimate * 100;
      estimateAccuracy = Math.max(0, 100 - deviation);
    }
    
    console.log('Статистика по часу:', {
      totalOriginalEstimate: formatTime(totalOriginalEstimate),
      totalCurrentEstimate: formatTime(totalCurrentEstimate),
      totalTimeSpent: formatTime(totalTimeSpent),
      estimateAccuracy: `${Math.round(estimateAccuracy)}%`
    });

    // Рахуємо статистику по задачам
    const statusCounts = {
      onTrack: 0,
      atRisk: 0,
      delayed: 0,
      completed: 0,
    };

    issues.forEach(issue => {
      const status = issue.fields.status.name.toLowerCase();
      console.log(`Задача ${issue.key} має статус "${issue.fields.status.name}"`);
      
      if (status.includes('done') || status.includes('closed') || status.includes('resolved')) {
        statusCounts.completed++;
      } else if (status.includes('progress') || status.includes('doing')) {
        statusCounts.onTrack++;
      } else if (status.includes('review') || status.includes('testing')) {
        statusCounts.atRisk++;
      } else {
        statusCounts.delayed++;
      }
    });

    console.log('Статистика статусів задач:', statusCounts);

    // Створюємо тренд виконання задач - імітація даних
    const taskCompletionTrend = [65, 68, 73, 80, 85, 90];

    const result: RaciMatrixData = {
      roles,
      tasks,
      status: {
        onTrack: statusCounts.onTrack,
        atRisk: statusCounts.atRisk,
        delayed: statusCounts.delayed,
        completed: statusCounts.completed,
      },
      taskCompletionTrend,
      // Додаємо статистику по часу
      timeStats: {
        totalOriginalEstimate: totalOriginalEstimate,
        totalCurrentEstimate: totalCurrentEstimate,
        totalTimeSpent: totalTimeSpent,
        estimateAccuracy: estimateAccuracy
      }
    };
    
    console.log('Успішно сформовано дані для RACI матриці');
    return result;
  } catch (error: any) {
    console.error('Помилка при отриманні даних для RACI матриці:');
    if (error.response) {
      console.error(`Статус: ${error.response.status}`);
      console.error('Заголовки:', JSON.stringify(error.response.headers, null, 2));
      console.error('Дані:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Помилка:', error.message);
    }
    
    // Створюємо мінімальний набір даних для відображення
    const fallbackData: RaciMatrixData = {
      roles: ['API Error', 'No Access'],
      tasks: [{ 
        name: 'Помилка з\'єднання з Jira API', 
        assignments: [
          { roleIndex: 0, type: 'R' },
          { roleIndex: 1, type: 'A' }
        ] 
      }],
      status: {
        onTrack: 0,
        atRisk: 0,
        delayed: 1,
        completed: 0,
      },
      taskCompletionTrend: [0, 0, 0, 0, 0, 0],
    };
    
    return fallbackData;
  }
}

// Отримання даних для віджета Jira
export async function getJiraWidgetData() {
  try {
    console.log('Запит даних для віджета Jira...');
    
    // Перевіряємо з'єднання
    const connectionTest = await testJiraConnection();
    if (!connectionTest.success) {
      throw new Error(`Помилка з'єднання з Jira: ${connectionTest.error}`);
    }
    
    // Отримуємо різні типи задач за пріоритетом і типом
    let criticalIssues: JiraIssue[] = [];
    let highIssues: JiraIssue[] = [];
    let mediumIssues: JiraIssue[] = [];
    let bugs: JiraIssue[] = [];
    let tasks: JiraIssue[] = [];
    let stories: JiraIssue[] = [];
    let epics: JiraIssue[] = [];
    
    try {
      [criticalIssues, highIssues, mediumIssues, bugs, tasks, stories, epics] = await Promise.all([
        getIssues('priority = Critical'),
        getIssues('priority = High'),
        getIssues('priority = Medium'),
        getIssues('issuetype = Bug'),
        getIssues('issuetype = Task'),
        getIssues('issuetype = Story'),
        getIssues('issuetype = Epic'),
      ]);
      
      console.log('Отримано дані про задачі за критеріями:');
      console.log(`Критичні: ${criticalIssues.length}`);
      console.log(`Високі: ${highIssues.length}`);
      console.log(`Середні: ${mediumIssues.length}`);
      console.log(`Баги: ${bugs.length}`);
      console.log(`Завдання: ${tasks.length}`);
      console.log(`Історії: ${stories.length}`);
      console.log(`Епіки: ${epics.length}`);
    } catch (error) {
      console.error('Помилка при отриманні задач:', error);
      // Продовжуємо з пустими масивами якщо сталася помилка
    }

    return {
      issues: {
        critical: criticalIssues.length,
        high: highIssues.length,
        medium: mediumIssues.length,
      },
      issuesByType: {
        bug: bugs.length,
        task: tasks.length,
        story: stories.length,
        epic: epics.length,
        other: 0, // Можна додати інші типи задач при необхідності
      },
    };
  } catch (error: any) {
    console.error('Помилка при отриманні даних для віджета Jira:', error);
    return {
      issues: {
        critical: 0,
        high: 0,
        medium: 0,
      },
      issuesByType: {
        bug: 0,
        task: 0,
        story: 0,
        epic: 0,
        other: 0,
      },
    };
  }
}