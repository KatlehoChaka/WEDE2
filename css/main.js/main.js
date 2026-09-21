// Simple form handler: confirm submission and reset the form
document.addEventListener('DOMContentLoaded', function () {

    const forms = document.querySelectorAll('form');

    forms.forEach(function (form) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            alert('Thank you! Your request has been sent to Hitman Plumbing. We will contact you shortly.');
            form.reset();
        });
    });

    console.log('Hitman Plumbing website loaded.');
});