const form = document.getElementById('holiday-form');
const countryInput = document.getElementById('country');
const yearInput = document.getElementById('year');
const monthInput = document.getElementById('month');
const dayInput = document.getElementById('day');
const results = document.getElementById('results');
const status = document.getElementById('status');

async function fetchHolidays(country, year, month, day) {
  const params = new URLSearchParams({ country, year });
  if (month) params.set('month', month);
  if (day) params.set('day', day);
  const response = await fetch(`/api/holidays?${params.toString()}`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Request failed');
  }

  return response.json();
}

function renderResults(data) {
  results.innerHTML = '';

  if (!Array.isArray(data) || data.length === 0) {
    status.textContent = 'No holidays were found for that selection.';
    return;
  }

  data.forEach((holiday) => {
    const card = document.createElement('article');
    card.className = 'card';

    const title = document.createElement('h3');
    title.textContent = holiday.name || 'Holiday';

    const meta = document.createElement('div');
    meta.className = 'meta';
    meta.textContent = `${holiday.date || 'Unknown date'} · ${holiday.week_day || 'Unknown day'} · ${holiday.type || 'Holiday'}`;

    card.append(title, meta);
    results.appendChild(card);
  });
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  status.textContent = 'Searching…';
  results.innerHTML = '';

  const yearValue = yearInput.value.trim() || new Date().getFullYear().toString();
  const monthValue = monthInput.value.trim();
  const dayValue = dayInput.value.trim();

  try {
    const holidays = await fetchHolidays(
      countryInput.value.trim().toUpperCase(),
      yearValue,
      monthValue,
      dayValue
    );
    renderResults(holidays);
    const monthText = monthValue ? ` month ${monthValue}` : '';
    const dayText = dayValue ? ` day ${dayValue}` : '';
    status.textContent = `Showing ${holidays.length} holiday${holidays.length === 1 ? '' : 's'} for ${countryInput.value.trim().toUpperCase()}${monthText}${dayText} of ${yearValue}.`;
  } catch (error) {
    status.textContent = error.message;
  }
});


(async function loadDefault() {
  try {
    const holidays = await fetchHolidays('US', new Date().getFullYear().toString(), '');
    renderResults(holidays);
    status.textContent = 'Showing a sample of upcoming holidays.';
  } catch (error) {
    status.textContent = error.message;
  }
})();
