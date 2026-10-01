import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

// Base button styles matching the main UI design tokens
const baseButtonClass = 'px-5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer m-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950';

const confirmBaseClass = `${baseButtonClass} text-white focus:ring-purple-500`;
const cancelBaseClass = `${baseButtonClass} text-slate-300 border border-slate-700/80 hover:bg-slate-800 hover:text-slate-200 focus:ring-slate-700`;

// A pre-configured SweetAlert2 instance that matches the FaceCraft slate/purple dark mode theme
export const customSwal = Swal.mixin({
  background: '#090d16', // Slate dark background
  color: '#f8fafc',      // Slate-50 text
  customClass: {
    popup: 'bg-slate-950/95 border border-slate-800/90 rounded-3xl p-6 shadow-2xl shadow-purple-500/5 backdrop-blur-xl',
    title: 'text-xl font-extrabold text-slate-100',
    htmlContainer: 'text-sm text-slate-400 font-normal mt-2 leading-relaxed',
  },
  buttonsStyling: false // Disable SweetAlert's default styles to use Tailwind classes
});

/**
 * Prompt the user with a styled confirmation modal.
 * 
 * @param {Object} options
 * @param {string} options.title - The title text of the modal.
 * @param {string} options.text - The descriptive warning text of the modal.
 * @param {string} [options.confirmButtonText='Confirm'] - Text for the confirm button.
 * @param {string} [options.cancelButtonText='Cancel'] - Text for the cancel button.
 * @param {string} [options.icon='warning'] - SweetAlert icon ('warning', 'error', 'success', 'info', 'question').
 * @param {boolean} [options.isDelete=false] - If true, styles the confirm button as red/rose (danger/delete) instead of purple.
 * @returns {Promise<boolean>} Resolves to true if confirmed, false otherwise.
 */
export const confirmAction = async ({
  title = 'Are you sure?',
  text = 'This action cannot be undone.',
  confirmButtonText = 'Confirm',
  cancelButtonText = 'Cancel',
  icon = 'warning',
  isDelete = false
}) => {
  const confirmBtnClass = isDelete
    ? 'bg-gradient-to-r from-red-500 via-rose-600 to-red-600 hover:from-red-600 hover:to-red-700 shadow-red-500/20 hover:shadow-red-500/30'
    : 'bg-gradient-to-r from-purple-500 via-purple-600 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 shadow-purple-500/30 hover:shadow-purple-500/40';

  const result = await customSwal.fire({
    title,
    text,
    icon,
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText,
    reverseButtons: true,
    customClass: {
      confirmButton: `${confirmBaseClass} ${confirmBtnClass}`,
      cancelButton: cancelBaseClass
    }
  });
  return result.isConfirmed;
};

/**
 * Display a simple notification alert modal.
 * 
 * @param {Object} options
 * @param {string} options.title - The title of the modal.
 * @param {string} options.text - The message body.
 * @param {string} [options.icon='info'] - SweetAlert icon type.
 * @returns {Promise<void>} Resolves when the user clicks 'OK'.
 */
export const alertAction = async ({
  title = 'Notification',
  text = '',
  icon = 'info'
}) => {
  const confirmBtnClass = 'bg-gradient-to-r from-purple-500 via-purple-600 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 shadow-purple-500/30 hover:shadow-purple-500/40';

  await customSwal.fire({
    title,
    text,
    icon,
    confirmButtonText: 'OK',
    customClass: {
      confirmButton: `${confirmBaseClass} ${confirmBtnClass}`
    }
  });
};
