
import { NotificationMessage } from "./NotificationTypes";

export const getNotificationData = (language: string): NotificationMessage[] => {
  return [
    {
      id: 1,
      title: "Digitaltskydd",
      heading: language === 'sv' ? "Länkar" : "Links",
      body: language === 'sv' 
        ? "Borttagning på Google är godkänd för en eller flera av dina länkar"
        : "Removal from Google is approved for one or several of your links",
      time: language === 'sv' ? "nu" : "now",
    },
    {
      id: 2,
      title: "Digitaltskydd",
      heading: language === 'sv' ? "Status" : "Status",
      body: language === 'sv' 
        ? "Grattis! Du är nu fyllt skyddad🥳"
        : "Congratulations! You are now fully protected🥳",
      time: language === 'sv' ? "nu" : "now",
    },
    {
      id: 3,
      title: "Digitaltskydd",
      heading: language === 'sv' ? "Bevakning" : "Monitoring",
      body: language === 'sv' 
        ? "Du har en ny träff på Google. Vill du att vi tar bort den?"
        : "You have a new hit on Google. Do you want us to remove it?",
      time: language === 'sv' ? "nu" : "now",
    },
    {
      id: 4,
      title: "Digitaltskydd",
      heading: language === 'sv' ? "Upplysningssidor" : "Search sites",
      body: language === 'sv' 
        ? "Du är nu borttagen på Mrkoll"
        : "You are now removed from Mrkoll",
      time: language === 'sv' ? "nu" : "now",
    },
    {
      id: 5,
      title: "Digitaltskydd",
      heading: language === 'sv' ? "Länkar" : "Links",
      body: language === 'sv' 
        ? "Statusen för en eller flera av dina länkar har uppdaterats"
        : "The status for one or more of your links has been updated",
      time: language === 'sv' ? "nu" : "now",
    },
  ];
};
