async function fetchEpisodes() {
  try {
    const response = await fetch('/api/episodes');
    const episodes = await response.json();
    renderEpisodes(episodes);
  } catch (error) {
    console.error('Error fetching episodes:', error);
    document.getElementById('episodes-container').innerHTML =
      '<p class="text-red-500">Error al cargar los capítulos.</p>';
  }
}

function renderEpisodes(episodes) {
  const container = document.getElementById('episodes-container');
  container.innerHTML = '';
  episodes.forEach(episode => {
    const card = document.createElement('div');
    card.className = 'episode-card bg-gray-800 rounded-lg overflow-hidden shadow-lg';
    card.innerHTML = `
      <img src="${episode.image}" alt="${episode.title}" class="w-full h-48 object-cover" onerror="this.src='https://via.placeholder.com/300x200?text=Chapter+${episode.id}'">
      <div class="p-4">
        <h3 class="text-lg font-semibold text-yellow-400">${episode.title}</h3>
        <p class="mt-2 text-sm">Estado: <span class="status-${episode.status}">${episode.status.charAt(0).toUpperCase() + episode.status.slice(1)}</span></p>
        ${episode.status === 'disponible' ? `
          <button onclick="reserveEpisode(${episode.id})" class="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded">
            Reservar
          </button>
        ` : ''}
        ${episode.status === 'reservado' ? `
          <div class="mt-4">
            <p class="text-sm text-gray-300">Precio fijo: $4.99</p>
            <button onclick="confirmPayment(${episode.id})" class="mt-2 w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded">
              Confirmar Pago
            </button>
          </div>
        ` : ''}
        ${episode.status === 'alquilado' ? `
          <p class="mt-2 text-sm text-gray-400">Alquilado hasta: ${new Date(episode.rentedUntil).toLocaleString()}</p>
        ` : ''}
      </div>
    `;
    container.appendChild(card);
  });
}

async function reserveEpisode(episodeId) {
  try {
    const response = await fetch(`/api/reserve/${episodeId}`, { method: 'POST' });
    const result = await response.json();
    if (response.ok) {
      alert(result.message);
      fetchEpisodes();
    } else {
      alert(result.error);
    }
  } catch (error) {
    console.error('Error reserving episode:', error);
    alert('Error al reservar el capítulo.');
  }
}

async function confirmPayment(episodeId) {
  try {
    const response = await fetch(`/api/confirm/${episodeId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    const result = await response.json();
    if (response.ok) {
      alert(result.message);
      fetchEpisodes();
    } else {
      alert(result.error);
    }
  } catch (error) {
    console.error('Error confirming payment:', error);
    alert('Error al confirmar el pago.');
  }
}

setInterval(fetchEpisodes, 10000); // Refresh every 10 seconds to catch 1-minute expirations
fetchEpisodes();