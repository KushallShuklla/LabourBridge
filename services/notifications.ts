import { supabase } from './supabase';

export const sendNotification = async (
  userId: string,
  title: string,
  message: string,
  type: 'application_status' | 'new_job' | 'job_selected' | 'document_verified' | 'general'
) => {
  try {
    console.log('Sending notification:', { userId, title, message, type });
    const { data, error } = await supabase.from('notifications').insert({
      user_id: userId,
      title,
      message,
      type,
    });
    if (error) {
      console.error('Notification error:', error);
    } else {
      console.log('Notification sent successfully:', data);
    }
  } catch (error) {
    console.error('Error sending notification:', error);
  }
};

// Helper functions for common notifications
export const notifyApplicationStatusChange = async (workerId: string, jobTitle: string, status: string) => {
  await sendNotification(
    workerId,
    'Application Status Updated',
    `Your application for "${jobTitle}" is now ${status}`,
    'application_status'
  );
};

export const notifyJobSelected = async (workerId: string, jobTitle: string) => {
  // This is now handled by notifyWorkerStatusChange
  await notifyWorkerStatusChange(workerId, jobTitle, 'Selected');
};

export const notifyDocumentVerified = async (workerId: string) => {
  await sendNotification(
    workerId,
    'Document Verified ✓',
    'Your documents have been verified by admin',
    'document_verified'
  );
};

export const notifyNewJob = async (workerId: string, jobTitle: string) => {
  await sendNotification(
    workerId,
    'New Job Match! 💼',
    `A new job matching your skills: "${jobTitle}"`,
    'new_job'
  );
};

// Notify employer when worker applies
export const notifyEmployerNewApplication = async (employerId: string, workerName: string, jobTitle: string) => {
  await sendNotification(
    employerId,
    'New Job Application',
    `${workerName} applied for "${jobTitle}"`,
    'general'
  );
};

// Notify worker when application status changes
export const notifyWorkerStatusChange = async (workerId: string, jobTitle: string, status: string) => {
  const titles: any = {
    'Viewed': 'Application Viewed',
    'Shortlisted': 'You\'ve Been Shortlisted! 🎉',
    'Selected': 'Congratulations! You Got the Job! 🎉',
    'Rejected': 'Application Update'
  };
  
  const messages: any = {
    'Viewed': `Your application for "${jobTitle}" has been viewed by the employer`,
    'Shortlisted': `You have been shortlisted for "${jobTitle}"`,
    'Selected': `You have been selected for "${jobTitle}"`,
    'Rejected': `Your application for "${jobTitle}" was not successful this time`
  };
  
  await sendNotification(
    workerId,
    titles[status] || 'Application Update',
    messages[status] || `Your application status for "${jobTitle}" has been updated to ${status}`,
    status === 'Selected' ? 'job_selected' : 'application_status'
  );
};
