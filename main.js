function copyEmail() {
    const emailText = document.querySelector('.contact-email').innerText;
    const tempInput = document.createElement('input');
    document.body.appendChild(tempInput);
    tempInput.value = emailText;
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);
    showCopiedMessage();
}

function showCopiedMessage() {
    const message = document.getElementById('copiedMessage');
    message.style.display = 'block';
    setTimeout(() => {
        message.style.display = 'none';
    }, 2000);
}

const toTopButton = document.getElementById('toTopButton');

window.addEventListener('scroll', () => {
    if (window.scrollY > 200) {
        toTopButton.classList.add('show');
    } else {
        toTopButton.classList.remove('show');
    }
});

toTopButton.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

function copyGmail() {
    var gmailLink = document.getElementById("gmail-link");
    var originalText = gmailLink.innerHTML;

    navigator.clipboard.writeText('zzzjinwook98@gmail.com').then(function() {
        gmailLink.innerHTML = '복사완료!';
        setTimeout(function() {
            gmailLink.innerHTML = originalText;
        }, 2000);
    }, function(err) {
        console.error('Could not copy text: ', err);
    });
}

document.addEventListener('DOMContentLoaded', function () {
    const moreLink = document.querySelector('.more-link');
    if (moreLink) {
        moreLink.addEventListener('click', function (e) {
            e.preventDefault();
            var arrow = document.getElementById('txt-arrow');
            var detailInfo = document.querySelector('.detail-info');
            if (arrow) arrow.classList.toggle('rotate');
            if (detailInfo) detailInfo.classList.toggle('show');
        });
    }
});

// Calendar helpers
function formatToICSDate(date) {
    const y = date.getUTCFullYear().toString().padStart(4, '0');
    const m = (date.getUTCMonth() + 1).toString().padStart(2, '0');
    const d = date.getUTCDate().toString().padStart(2, '0');
    const hh = date.getUTCHours().toString().padStart(2, '0');
    const mm = date.getUTCMinutes().toString().padStart(2, '0');
    const ss = date.getUTCSeconds().toString().padStart(2, '0');
    return `${y}${m}${d}T${hh}${mm}${ss}Z`;
}

function generateICS({ title, description, location, startISO, endISO }) {
    const uid = `housewarming-${Date.now()}@local`;
    const dtStamp = formatToICSDate(new Date());
    const dtStart = formatToICSDate(new Date(startISO));
    const dtEnd = formatToICSDate(new Date(endISO));
    const esc = (s) => s.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
    return [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Housewarming//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'BEGIN:VEVENT',
        `UID:${uid}`,
        `DTSTAMP:${dtStamp}`,
        `DTSTART:${dtStart}`,
        `DTEND:${dtEnd}`,
        `SUMMARY:${esc(title)}`,
        `DESCRIPTION:${esc(description)}`,
        `LOCATION:${esc(location)}`,
        'END:VEVENT',
        'END:VCALENDAR'
    ].join('\r\n');
}

function formatToGoogle(date) {
    // Google accepts UTC Z format
    return formatToICSDate(date);
}

function buildGoogleCalendarUrl({ title, description, location, startISO, endISO }) {
    const dates = `${formatToGoogle(new Date(startISO))}/${formatToGoogle(new Date(endISO))}`;
    const params = new URLSearchParams({
        action: 'TEMPLATE',
        text: title,
        dates,
        details: description,
        location
    });
    return `https://www.google.com/calendar/render?${params.toString()}`;
}

document.addEventListener('DOMContentLoaded', function () {
    const dtEl = document.getElementById('event-datetime');
    const locEl = document.getElementById('event-location');
    const icsLink = document.getElementById('add-apple-samsung');
    const gLink = document.getElementById('add-google');
    if (!dtEl || !locEl || !icsLink || !gLink) return;

    const startISO = dtEl.getAttribute('data-start');
    const endISO = dtEl.getAttribute('data-end');
    const title = 'Housewarming Party';
    const location = locEl.textContent.trim();
    const description = '집들이에 초대합니다.';

    // Prepare ICS file
    try {
        const icsContent = generateICS({ title, description, location, startISO, endISO });
        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        icsLink.href = url;
    } catch (e) {
        console.error('Failed to create ICS:', e);
    }

    // Prepare Google Calendar link
    gLink.href = buildGoogleCalendarUrl({ title, description, location, startISO, endISO });
});