import Swal from 'sweetalert2';

export function fireErrorDialog(message, confirmButtonText = 'Ok') {
    return Swal.fire({
        type: 'error',
        title: 'Error',
        text: message,
        confirmButtonText
    });
}

export function fireSuccessDialog(message, title = 'Success') {
    return Swal.fire(title, message, 'success');
}

export function fireSuccessToast(message) {
    return Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2000
    }).fire({
        type: 'success',
        title: message
    });
}

export function fireConfirmationDialog(message, title = 'Are you sure?', confirmButtonText = 'Yes') {
    return Swal.fire({
        title,
        text: message,
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText
    });
}