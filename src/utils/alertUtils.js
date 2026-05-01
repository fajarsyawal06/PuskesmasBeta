import Swal from 'sweetalert2';

export const showSuccessAlert = (title, text) => {
    return Swal.fire({
        icon: 'success',
        title: title,
        text: text,
        timer: 2000,
        showConfirmButton: false
    });
};

export const showErrorAlert = (title, text) => {
    return Swal.fire({
        icon: 'error',
        title: title,
        text: text,
        confirmButtonColor: '#d33'
    });
};

export const showWarningAlert = (title, text) => {
    return Swal.fire({
        icon: 'warning',
        title: title,
        text: text,
        confirmButtonColor: '#3085d6'
    });
};

export const showConfirmAlert = async (title, text, confirmText = 'Ya', cancelText = 'Batal') => {
    const result = await Swal.fire({
        title: title,
        text: text,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: confirmText,
        cancelButtonText: cancelText
    });
    return result.isConfirmed;
};
