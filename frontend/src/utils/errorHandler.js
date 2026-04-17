import { toast } from 'sonner';

export const handleApiError = (error) => {
  let message = 'Something went wrong. Please try again.';

  if (error.response?.status === 401) {
    message = 'Unauthorized. Please login again.';
  } else if (error.response?.status === 403) {
    message = 'You do not have permission.';
  } else if (error.response?.status === 404) {
    message = 'Resource not found.';
  } else if (error.response?.status === 500) {
    message = 'Server error. Try again later.';
  } else if (error.response?.data?.message) {
    message = error.response.data.message;
  }

  toast.error(message);
  return message;
};

export const handleApiSuccess = (message) => {
  toast.success(message);
};