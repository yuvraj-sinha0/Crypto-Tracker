document.addEventListener("DOMContentLoaded", function() {
    const apiUrl = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false";
    let allCoins = [];
    let currentPage = 1;
    let itemsPerPage = 10;
    let searchQuery = '';
    let sortField = '';
    let sortDirection = 1; // 1 for ascending, -1 for descending

    // Debounce function to limit API calls on search input
    const debounce = (func, delay) => {
        let debounceTimer;
        return function() {
            const context = this;
            const args = arguments;
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => func.apply(context, args), delay);
        }
    };

    // Event listener for search input with debounce
    document.getElementById('searchInput').addEventListener('input', debounce(function(e) {
        searchQuery = e.target.value.trim().toLowerCase();
        currentPage = 1;
        fetchData();
    }, 300));

    // Event listener for sorting by price
    document.getElementById('sortPrice').addEventListener('click', function() {
        sortField = 'current_price';
        sortDirection *= -1; // Toggle sort direction
        fetchData();
    });

    // Event listener for sorting by volume
    document.getElementById('sortVolume').addEventListener('click', function() {
        sortField = 'total_volume';
        sortDirection *= -1; // Toggle sort direction
        fetchData();
    });

    // Function to show loading indicator
    function showLoading() {
        document.getElementById('loadingShimmer').style.display = 'block';
    }

    // Function to hide loading indicator
    function hideLoading() {
        document.getElementById('loadingShimmer').style.display = 'none';
    }

    // Function to fetch data from API
    function fetchData() {
        showLoading();
        fetch(apiUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch data');
                }
                return response.json();
            })
            .then(data => {
                allCoins = data;
                displayData();
            })
            .catch(error => {
                console.error('Error fetching the data:', error);
                hideLoading(); // Ensure loading indicator is hidden on error
                alert('Failed to fetch cryptocurrency data. Please try again later.');
            });
    }

    // Function to display filtered and sorted data
    function displayData() {
        hideLoading();
        let filteredCoins = allCoins.filter(coin => 
            coin.name.toLowerCase().includes(searchQuery) || coin.symbol.toLowerCase().includes(searchQuery)
        );

        if (sortField) {
            filteredCoins.sort((a, b) => sortDirection * (a[sortField] - b[sortField]));
        }

        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const paginatedCoins = filteredCoins.slice(start, end);

        populateTable(paginatedCoins);
        setupPagination(filteredCoins.length);
    }

    // Function to populate the table with cryptocurrency data
    function populateTable(data) {
        const tableBody = document.querySelector("#cryptoTable tbody");
        tableBody.innerHTML = '';
        data.forEach(coin => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${coin.name}</td>
                <td>${coin.symbol.toUpperCase()}</td>
                <td>$${coin.current_price.toLocaleString()}</td>
                <td>$${coin.total_volume.toLocaleString()}</td>
                <td>
                    <button onclick="likeCoin('${coin.id}')">Like</button>
                    <button onclick="viewDetails('${coin.id}')">View</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    // Function to setup pagination buttons
    function setupPagination(totalItems) {
        const paginationDiv = document.getElementById('pagination');
        paginationDiv.innerHTML = '';
        const totalPages = Math.ceil(totalItems / itemsPerPage);

        for (let i = 1; i <= totalPages; i++) {
            const pageButton = document.createElement('button');
            pageButton.textContent = i;
            pageButton.classList.add('pageButton');
            if (i === currentPage) {
                pageButton.classList.add('active');
            }
            pageButton.addEventListener('click', () => {
                currentPage = i;
                fetchData();
            });
            paginationDiv.appendChild(pageButton);
        }
    }

    // Function to add coin to favorites in localStorage
    window.likeCoin = function(coinId) {
        let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        if (!favorites.includes(coinId)) {
            favorites.push(coinId);
            localStorage.setItem('favorites', JSON.stringify(favorites));
            alert('Coin liked!');
        } else {
            alert('Coin is already in favorites.');
        }
    }

    // Function to view details of a coin
    window.viewDetails = function(coinId) {
        window.location.href = `coins.html?id=${coinId}`;
    }

    // Initial fetch of data on page load
    fetchData();
});
