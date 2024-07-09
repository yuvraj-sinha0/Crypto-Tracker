document.addEventListener("DOMContentLoaded", function() {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];

    // Alert and return if no favorites are found
    if (favorites.length === 0) {
        alert('No favorite coins found.');
        return;
    }

    const apiUrl = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${favorites.join(',')}&order=market_cap_desc&per_page=10&page=1&sparkline=false`;

    // Function to show loading indicator
    function showLoading() {
        document.getElementById('loadingShimmer').style.display = 'block';
    }

    // Function to hide loading indicator
    function hideLoading() {
        document.getElementById('loadingShimmer').style.display = 'none';
    }

    // Initial loading indicator
    showLoading();

    // Fetch data from API
    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch data');
            }
            return response.json();
        })
        .then(data => {
            hideLoading();
            populateFavoritesTable(data);
        })
        .catch(error => {
            console.error('Error fetching the data:', error);
            hideLoading(); // Ensure loading indicator is hidden on error
            alert('Failed to fetch favorite coins data. Please try again later.');
        });

    // Function to populate the favorites table
    function populateFavoritesTable(data) {
        const tableBody = document.querySelector("#favoritesTable tbody");
        tableBody.innerHTML = '';
        
        // Loop through data and create table rows
        data.forEach(coin => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${coin.name}</td>
                <td>${coin.symbol.toUpperCase()}</td>
                <td>$${coin.current_price.toLocaleString()}</td>
                <td>$${coin.market_cap.toLocaleString()}</td>
                <td>
                    <button onclick="unlikeCoin('${coin.id}')">Unlike</button>
                    <button onclick="viewDetails('${coin.id}')">View</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    // Function to remove a coin from favorites
    window.unlikeCoin = function(coinId) {
        let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        
        // Filter out the selected coinId
        if (favorites.includes(coinId)) {
            favorites = favorites.filter(id => id !== coinId);
            localStorage.setItem('favorites', JSON.stringify(favorites));
            alert('Coin unliked!');
            location.reload(); // Refresh the page to update the table
        }
    }

    // Function to view details of a coin
    window.viewDetails = function(coinId) {
        window.location.href = `coins.html?id=${coinId}`;
    }
});
