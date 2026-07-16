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

  // show small success badge and heading
  status.innerHTML = '<span class="badge success">Success</span>';

  const heading = document.createElement('h2');
  heading.className = 'results-title';
  heading.textContent = 'Upcoming holidays';
  results.appendChild(heading);
  // animate heading
  requestAnimationFrame(() => heading.classList.add('animate'));

  function formatDate(d) {
    try {
      const parts = d.split('-'); // YYYY-MM-DD
      if (parts.length === 3) return `${parts[1]}/${parts[2]}/${parts[0]}`;
      return d;
    } catch (e) {
      return d || 'Unknown';
    }
  }

  data.forEach((holiday, i) => {
    const card = document.createElement('article');
    card.className = 'card holiday-card';

    const left = document.createElement('div');
    left.className = 'card-left';
    const icon = document.createElement('div');
    icon.className = 'card-icon';
    icon.textContent = '📅';
    const title = document.createElement('div');
    title.className = 'card-title';
    title.textContent = holiday.name || 'Holiday';
    const local = document.createElement('div');
    local.className = 'card-local';
    local.textContent = holiday.name_local || holiday.local_name || '';
    left.append(icon, title, local);

    const right = document.createElement('div');
    right.className = 'card-right';

    const makeRow = (labelText, valueText) => {
      const row = document.createElement('div');
      row.className = 'row';
      const label = document.createElement('div');
      label.className = 'label';
      label.textContent = labelText;
      const value = document.createElement('div');
      value.className = 'value';
      value.textContent = valueText || '—';
      row.append(label, value);
      return row;
    };

    right.append(
      makeRow('Name (local)', holiday.name_local || holiday.local_name || '—'),
      makeRow('Date', formatDate(holiday.date || holiday.datetime || '—')),
      makeRow('Week day', holiday.week_day || holiday.weekday || holiday.weekday_name || '—'),
      makeRow('Type', holiday.type || '—'),
      makeRow('Language', holiday.language || '—'),
      makeRow('Location', holiday.location || holiday.location_name || '—'),
      makeRow('Country', holiday.country || '—'),
      makeRow('Description', holiday.description || '—')
    );

    card.append(left, right);
    // stagger entrance animations
    card.style.animationDelay = `${i * 80}ms`;
    results.appendChild(card);
    // trigger animation after append
    requestAnimationFrame(() => card.classList.add('animate'));
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
