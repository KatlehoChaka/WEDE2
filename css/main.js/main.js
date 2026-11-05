/* =========================================================
   HITMAN PLUMBING — script.js
   Part 3: Interactive elements, dynamic content, forms
   ========================================================= */

document.addEventListener('DOMContentLoaded', function () {

    /* =========================================================
       1. MOBILE NAV TOGGLE
       ========================================================= */
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks  = document.querySelector('.nav-links');

    if (navToggle && navLinks) {
        navToggle.addEventListener('click', function () {
            navLinks.classList.toggle('open');
            navToggle.setAttribute('aria-expanded',
                navLinks.classList.contains('open'));
        });
    }

    /* =========================================================
       2. SMOOTH SCROLL FOR HASH LINKS
       ========================================================= */
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
        link.addEventListener('click', function (e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    /* =========================================================
       3. SCROLL-REVEAL ANIMATION (subtle entrance effects)
       ========================================================= */
    const revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 });

    document.querySelectorAll('.highlight-card, .service-card, .location')
        .forEach(function (el) {
            el.classList.add('reveal');
            revealObserver.observe(el);
        });

    /* =========================================================
       4. TABS (services.html — "By Category")
       ========================================================= */
    const tabButtons = document.querySelectorAll('.tab-btn');

    tabButtons.forEach(function (btn) {
        btn.addEventListener('click', function () {
            const targetId = btn.dataset.tab;

            // Deactivate all
            tabButtons.forEach(function (b) {
                b.classList.remove('active');
                b.setAttribute('aria-selected', 'false');
            });
            document.querySelectorAll('.tab-panel').forEach(function (p) {
                p.classList.remove('active');
            });

            // Activate clicked
            btn.classList.add('active');
            btn.setAttribute('aria-selected', 'true');
            const panel = document.getElementById(targetId);
            if (panel) panel.classList.add('active');
        });
    });

    /* =========================================================
       5. MODAL (used for quote "quick enquiry" buttons)
       ========================================================= */
    const modalTriggers = document.querySelectorAll('[data-modal]');
    const modal         = document.getElementById('quickModal');
    const modalClose    = document.querySelector('.modal-close');

    if (modal && modalTriggers.length) {
        modalTriggers.forEach(function (trigger) {
            trigger.addEventListener('click', function (e) {
                e.preventDefault();
                modal.classList.add('active');
                document.body.style.overflow = 'hidden';
            });
        });

        function closeModal() {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }

        if (modalClose) modalClose.addEventListener('click', closeModal);

        modal.addEventListener('click', function (e) {
            if (e.target === modal) closeModal();
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && modal.classList.contains('active')) closeModal();
        });
    }

    /* =========================================================
       6. ACCORDION (services.html)
       ========================================================= */
    const accItems = document.querySelectorAll('.accordion-item');

    accItems.forEach(function (item) {
        const btn = item.querySelector('.accordion-header');
        if (!btn) return;

        btn.addEventListener('click', function () {
            accItems.forEach(function (other) {
                if (other !== item) {
                    other.classList.remove('open');
                    const otherHeader = other.querySelector('.accordion-header');
                    if (otherHeader) otherHeader.setAttribute('aria-expanded', 'false');
                }
            });
            const isOpen = item.classList.toggle('open');
            btn.setAttribute('aria-expanded', isOpen);
        });
    });

    /* =========================================================
       7. GALLERY LIGHTBOX (index.html, services.html)
       ========================================================= */
    const galleryImgs = document.querySelectorAll('.gallery img');
    const lightbox    = document.getElementById('lightbox');
    const lightboxImg = document.querySelector('#lightbox img');
    const closeBtn    = document.querySelector('.lightbox-close');

    if (galleryImgs.length && lightbox && lightboxImg) {
        galleryImgs.forEach(function (img) {
            img.addEventListener('click', function () {
                lightboxImg.src = img.src;
                lightboxImg.alt = img.alt;
                lightbox.classList.add('active');
                document.body.style.overflow = 'hidden';
            });
        });

        function closeLightbox() {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
        }

        if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
        lightbox.addEventListener('click', function (e) {
            if (e.target === lightbox) closeLightbox();
        });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') closeLightbox();
        });
    }

    /* =========================================================
       8. DYNAMIC SEARCH + SORT (services.html)
       ========================================================= */
    const searchInput  = document.getElementById('serviceSearch');
    const sortSelect   = document.getElementById('serviceSort');
    const serviceGrid  = document.getElementById('serviceGrid');

    if (searchInput && serviceGrid) {
        const originalCards = Array.from(serviceGrid.querySelectorAll('.service-card'));

        function filterAndSort() {
            const query = searchInput.value.toLowerCase().trim();
            const sort  = sortSelect ? sortSelect.value : 'default';

            // Filter
            let visible = originalCards.filter(function (card) {
                return card.textContent.toLowerCase().includes(query);
            });

            // Sort
            if (sort === 'az') {
                visible.sort(function (a, b) {
                    return a.querySelector('h3').textContent
                        .localeCompare(b.querySelector('h3').textContent);
                });
            } else if (sort === 'za') {
                visible.sort(function (a, b) {
                    return b.querySelector('h3').textContent
                        .localeCompare(a.querySelector('h3').textContent);
                });
            }

            // Render
            serviceGrid.innerHTML = '';
            if (visible.length === 0) {
                serviceGrid.innerHTML =
                    '<p class="no-results">No services match your search. Try "drain", "geyser", or "toilet".</p>';
            } else {
                visible.forEach(function (card) { serviceGrid.appendChild(card); });
            }
        }

        searchInput.addEventListener('input', filterAndSort);
        if (sortSelect) sortSelect.addEventListener('change', filterAndSort);
    }

    /* =========================================================
       9. ENQUIRY FORM — VALIDATION + DYNAMIC RESPONSE
       ========================================================= */
    const enquiryForm = document.getElementById('enquiryForm');

    if (enquiryForm) {
        enquiryForm.addEventListener('submit', function (e) {
            e.preventDefault();
            if (validateEnquiryForm()) showEnquiryResponse();
        });

        // Live validation on blur
        enquiryForm.querySelectorAll('input, select, textarea').forEach(function (field) {
            field.addEventListener('blur', function () {
                validateField(field);
            });
        });
    }

    function validateField(field) {
        const errorEl = field.parentElement.querySelector('.error-message');
        let msg = '';

        if (field.id === 'name' && (!field.value.trim() || field.value.trim().length < 2)) {
            msg = 'Please enter your full name (at least 2 characters).';
        } else if (field.id === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(field.value.trim())) {
            msg = 'Please enter a valid email address.';
        } else if (field.id === 'phone' && !/^0\d{9}$/.test(field.value.replace(/\s/g, ''))) {
            msg = 'Please enter a valid SA phone number (10 digits starting with 0).';
        } else if (field.id === 'service' && !field.value) {
            msg = 'Please choose a service.';
        } else if (field.id === 'message' && (!field.value.trim() || field.value.trim().length < 10)) {
            msg = 'Please describe the problem (at least 10 characters).';
        }

        if (errorEl) errorEl.textContent = msg;
        field.classList.toggle('error', msg !== '');
        return msg === '';
    }

    function validateEnquiryForm() {
        let isValid = true;
        enquiryForm.querySelectorAll('input, select, textarea').forEach(function (field) {
            if (!validateField(field)) isValid = false;
        });
        return isValid;
    }

    function showEnquiryResponse() {
        const service = document.getElementById('service').value;

        const data = {
            'blocked-drain': { label: 'Blocked Drain', avail: 'Within 1 hour (24/7)', cost: 'From R850 (call-out included)' },
            'burst-pipe':    { label: 'Burst Pipe',    avail: 'Within 30 minutes (emergency)', cost: 'From R950 (call-out included)' },
            'geyser':        { label: 'Geyser Repair', avail: 'Same day', cost: 'From R1,500 (parts excluded)' },
            'toilet-sink':   { label: 'Toilet/Sink',   avail: 'Within 24 hours', cost: 'From R700 (parts excluded)' },
            'sewer':         { label: 'Sewer Line',    avail: 'Inspection within 2 hours', cost: 'From R1,200 (inspection fee included)' },
            'other':         { label: 'General Repair', avail: 'Within 2 hours', cost: 'From R600 (call-out included)' }
        };

        const info = data[service] || data['other'];
        const responseBox = document.getElementById('enquiryResponse');
        const phone = document.getElementById('phone').value;

        responseBox.innerHTML = `
            <h3>✅ Thank you! Your enquiry has been received.</h3>
            <p><strong>Service:</strong> ${info.label}</p>
            <p><strong>Availability:</strong> ${info.avail}</p>
            <p><strong>Estimated Cost:</strong> ${info.cost}</p>
            <p>A Hitman Plumbing technician will contact you shortly on <strong>${phone}</strong>.</p>
        `;
        responseBox.style.display = 'block';
        responseBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
        enquiryForm.reset();
    }

    /* =========================================================
       10. CONTACT FORM — VALIDATION + MAILTO
       ========================================================= */
    const contactForm = document.getElementById('contactForm');

    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();
            if (validateContactForm()) sendContactEmail();
        });
    }

    function validateContactForm() {
        let isValid = true;

        const fields = [
            { id: 'cName',    check: v => v.trim().length >= 2,                        msg: 'Please enter your name (at least 2 characters).' },
            { id: 'cEmail',   check: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()), msg: 'Please enter a valid email address.' },
            { id: 'cSubject', check: v => v !== '',                                    msg: 'Please choose a subject.' },
            { id: 'cMessage', check: v => v.trim().length >= 10,                       msg: 'Please write a message (at least 10 characters).' }
        ];

        fields.forEach(function (f) {
            const field = document.getElementById(f.id);
            const errorEl = field.parentElement.querySelector('.error-message');
            const ok = f.check(field.value);
            if (errorEl) errorEl.textContent = ok ? '' : f.msg;
            field.classList.toggle('error', !ok);
            if (!ok) isValid = false;
        });

        return isValid;
    }

    function sendContactEmail() {
        const name    = document.getElementById('cName').value.trim();
        const email   = document.getElementById('cEmail').value.trim();
        const subject = document.getElementById('cSubject').value;
        const message = document.getElementById('cMessage').value.trim();

        const body = `Name: ${name}\nEmail: ${email}\n\n${message}`;
        const mailto = `mailto:info@hitmanplumbing.co.za?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

        window.location.href = mailto;

        const responseBox = document.getElementById('contactResponse');
        if (responseBox) {
            responseBox.innerHTML =
                '<h3>✅ Email client opening…</h3><p>Please send the message from your email app to complete your enquiry.</p>';
            responseBox.style.display = 'block';
            responseBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        contactForm.reset();
    }

    /* =========================================================
       11. BACK-TO-TOP BUTTON (subtle, appears on scroll)
       ========================================================= */
    const backTop = document.createElement('button');
    backTop.id = 'backToTop';
    backTop.innerHTML = '↑';
    backTop.setAttribute('aria-label', 'Back to top');
    document.body.appendChild(backTop);

    window.addEventListener('scroll', function () {
        backTop.classList.toggle('visible', window.scrollY > 500);
    });

    backTop.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    console.log('Hitman Plumbing website loaded (Part 3).');
});