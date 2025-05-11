
import { NotificationMessage } from './NotificationTypes';

export const getNotificationData = (language: string): NotificationMessage[] => {
  if (language === 'sv') {
    return [
      {
        id: 'notification1',
        title: 'Digitaltskydd',
        heading: 'Skydda din identitet',
        body: 'Skydda dina personuppgifter online med Digitaltskydd',
        time: 'nu'
      },
      {
        id: 'notification2',
        title: 'Digitaltskydd',
        heading: 'Ny övervakningsinformation',
        body: 'Vi har upptäckt 3 nya webbplatser med dina uppgifter',
        time: '5m sedan'
      },
      {
        id: 'notification3',
        title: 'Digitaltskydd',
        heading: 'Lösenord kontroll',
        body: 'Ditt lösenord har läckt i ett dataintrång',
        time: '10m sedan'
      },
      {
        id: 'notification4',
        title: 'Digitaltskydd',
        heading: 'Skyddsinformation',
        body: 'Vi har skyddat din identitet på 15 webbplatser',
        time: '15m sedan'
      },
      {
        id: 'notification5',
        title: 'Digitaltskydd',
        heading: 'Påminnelse',
        body: 'Uppdatera din checklista för bättre skydd',
        time: '30m sedan'
      }
    ];
  } else {
    // English notifications
    return [
      {
        id: 'notification1',
        title: 'Digitaltskydd',
        heading: 'Protect your identity',
        body: 'Protect your personal information online with Digitaltskydd',
        time: 'now'
      },
      {
        id: 'notification2',
        title: 'Digitaltskydd',
        heading: 'New monitoring information',
        body: 'We have found 3 new sites with your information',
        time: '5m ago'
      },
      {
        id: 'notification3',
        title: 'Digitaltskydd',
        heading: 'Password check',
        body: 'Your password has been leaked in a data breach',
        time: '10m ago'
      },
      {
        id: 'notification4',
        title: 'Digitaltskydd',
        heading: 'Protection info',
        body: 'We have protected your identity on 15 websites',
        time: '15m ago'
      },
      {
        id: 'notification5',
        title: 'Digitaltskydd',
        heading: 'Reminder',
        body: 'Update your checklist for better protection',
        time: '30m ago'
      }
    ];
  }
};
