import { sendLocalNotification } from '../services/notificationService';

export const notifyJobApplication = async (jobTitle: string) => {
  await sendLocalNotification(
    'Application Submitted',
    `Your application for ${jobTitle} has been submitted successfully!`,
    { type: 'application', jobTitle }
  );
};

export const notifyNewJobMatch = async (jobTitle: string, location: string) => {
  await sendLocalNotification(
    'New Job Match!',
    `${jobTitle} in ${location} matches your profile`,
    { type: 'job_match', jobTitle, location }
  );
};

export const notifyNewApplication = async (workerName: string, jobTitle: string) => {
  await sendLocalNotification(
    'New Application',
    `${workerName} applied for ${jobTitle}`,
    { type: 'new_application', workerName, jobTitle }
  );
};

export const notifyApplicationStatus = async (jobTitle: string, status: string) => {
  await sendLocalNotification(
    'Application Update',
    `Your application for ${jobTitle} is now ${status}`,
    { type: 'status_update', jobTitle, status }
  );
};
