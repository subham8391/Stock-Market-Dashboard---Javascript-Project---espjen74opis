// const apiKey = 'D6ORM58WV1W77LHI';
let selectedTimeOption = 'INTRADAY'; // Default time option
let fetchedData = {};
// Function to change the selected time option
function changeTimeOption(timeOption) {
    selectedTimeOption = timeOption;

    // Remove active class from all buttons
    const timeButtons = document.querySelectorAll('.time-btn');
    timeButtons.forEach(btn => btn.classList.remove('active'));

    // Add active class to the selected button
    const selectedButton = document.querySelector(`[data-time="${timeOption}"]`);
    selectedButton.classList.add('active');
}

// Function to fetch stock data using Alpha Vantage API
function fetchStockData(symbol, timeOption) {
    const apiKey = 'D6ORM58WV1W77LHI';
    const apiUrl = `https://www.alphavantage.co/query?function=TIME_SERIES_${timeOption}&symbol=${symbol}&apikey=${apiKey}`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            fetchedData = data;
            addToWatchlist(data, symbol, timeOption);
        })
        .catch(error => console.error('Error fetching data:', error));
}
function addToWatchlist(data, symbol, timeOption) {
    const watchlistContainer = document.getElementById('watchlist');

    let lastStockPrice, otherStockDetails;
    if (timeOption === 'INTRADAY') {
        // For Intraday data, extract the latest stock price and other relevant information
        const latestData = data['Time Series (5min)'][Object.keys(data['Time Series (5min)'])[0]];
        lastStockPrice = latestData['4. close'];
        otherStockDetails = `
            Open: ${latestData['1. open']}
            High: ${latestData['2. high']}
            Low: ${latestData['3. low']}
            Close: ${latestData['4. close']}
            Volume: ${latestData['5. volume']}
        `;
    } else if (timeOption === 'DAILY') {
        // For Daily data, extract the latest stock price and other relevant information
        const latestData = data['Time Series (Daily)'][Object.keys(data['Time Series (Daily)'])[0]];
        lastStockPrice = latestData['4. close'];
        otherStockDetails = `
            Open: ${latestData['1. open']}
            High: ${latestData['2. high']}
            Low: ${latestData['3. low']}
            Close: ${latestData['4. close']}
            Volume: ${latestData['5. volume']}
        `;
    } else if (timeOption === 'WEEKLY') {
        // For Weekly data, extract the latest stock price and other relevant information
        const latestData = data['Weekly Time Series'][Object.keys(data['Weekly Time Series'])[0]];
        lastStockPrice = latestData['4. close'];
        otherStockDetails = `
            Open: ${latestData['1. open']}
            High: ${latestData['2. high']}
            Low: ${latestData['3. low']}
            Close: ${latestData['4. close']}
            Volume: ${latestData['5. volume']}
        `;
    } else if (timeOption === 'MONTHLY') {
        // For Monthly data, extract the latest stock price and other relevant information
        const latestData = data['Monthly Time Series'][Object.keys(data['Monthly Time Series'])[0]];
        lastStockPrice = latestData['4. close'];
        otherStockDetails = `
            Open: ${latestData['1. open']}
            High: ${latestData['2. high']}
            Low: ${latestData['3. low']}
            Close: ${latestData['4. close']}
            Volume: ${latestData['5. volume']}
        `;
    }
    
    // ... existing code to extract relevant data ...

    const stockCard = document.createElement('div');
    const uniqueId = `${symbol}_${timeOption}`; // Unique identifier for each stock card
    stockCard.classList.add('stock-card');
    stockCard.setAttribute('data-id', uniqueId); // Set unique identifier as a data attribute
    stockCard.innerHTML = `
    <div>
        <h3>${symbol}</h3>
        <p>Time Frame: ${timeOption}</p>
        <p>Last Stock Price: ${lastStockPrice}</p>
        <p>Other Details: ${otherStockDetails}</p>
    <div/>
    <div>
        <button onclick="showStockDetails('${symbol}', '${timeOption}')">View Details</button>
        <button onclick="addToWishlist('${symbol}', '${timeOption}')">Add to Wishlist</button> <!-- Add "Add to Wishlist" button -->
        <button onclick="removeStock('${symbol}')">Delete</button>
        </div>
    `;

    watchlistContainer.appendChild(stockCard);
}

// Function to add stock details to local storage
function addToWishlist(symbol, timeOption) {
    const uniqueId = `${symbol}_${timeOption}`;
    const stockDetails = {
        symbol,
        timeOption,
    };

    // Check if data already exists in local storage
    let existingData = localStorage.getItem('stockWishlist');
    if (!existingData) {
        existingData = {};
    } else {
        existingData = JSON.parse(existingData);
    }

    existingData[uniqueId] = stockDetails;
    localStorage.setItem('stockWishlist', JSON.stringify(existingData));
}

// Function to remove stock details from local storage
function removeFromWishlist(uniqueId) {
    let existingData = localStorage.getItem('stockWishlist');
    if (existingData) {
        existingData = JSON.parse(existingData);
        delete existingData[uniqueId];
        localStorage.setItem('stockWishlist', JSON.stringify(existingData));
    }
}

// Function to load watchlist data from local storage
function loadFromLocalStorage() {
    const watchlistContainer = document.getElementById('watchlist');
    const existingData = localStorage.getItem('stockWishlist');
    if (existingData) {
        const wishlistData = JSON.parse(existingData);
        for (const uniqueId in wishlistData) {
            const { symbol, timeOption } = wishlistData[uniqueId];
            fetchStockData(symbol, timeOption); // Fetch data again and add to watchlist
        }
    }
}

// Call the loadFromLocalStorage function when the page is loaded or refreshed
window.addEventListener('load', loadFromLocalStorage);

// Function to show stock details in the modal
function showStockDetails(symbol, timeOption) {
    const modal = document.getElementById('modal');
    const stockDetailsElement = document.getElementById('stock-details');

    // Extract relevant data based on the selected time frame
    let lastStockPrice, otherStockDetails;
    if (timeOption === 'INTRADAY') {
        // For Intraday data, extract the latest stock price and other relevant information
        const latestData = fetchedData['Time Series (5min)'][Object.keys(fetchedData['Time Series (5min)'])[0]];
        lastStockPrice = latestData['4. close'];
        otherStockDetails = `
          <tr>
            <td>Open: ${latestData['1. open']}</td>
            <td>High: ${latestData['2. high']}</td>
            <td>Low: ${latestData['3. low']}</td>
            <td>Close: ${latestData['4. close']}</td>
            <td>Volume: ${latestData['5. volume']}</td>
          </tr>
        `;
    } else if (timeOption === 'DAILY') {
        // For Daily data, extract the latest stock price and other relevant information
        const latestData = fetchedData['Time Series (Daily)'][Object.keys(fetchedData['Time Series (Daily)'])[0]];
        lastStockPrice = latestData['4. close'];
        otherStockDetails = `
        <tr>
            <td>Open: ${latestData['1. open']}</td>
            <td>High: ${latestData['2. high']}</td>
            <td>Low: ${latestData['3. low']}</td>
            <td>Close: ${latestData['4. close']}</td>
            <td>Volume: ${latestData['5. volume']}</td>
        </tr>
        `;
    } else if (timeOption === 'WEEKLY') {
        // For Weekly data, extract the latest stock price and other relevant information
        const latestData = fetchedData['Weekly Time Series'][Object.keys(fetchedData['Weekly Time Series'])[0]];
        lastStockPrice = latestData['4. close'];
        otherStockDetails = `
          <tr>
            <td>Open: ${latestData['1. open']}</td>
            <td>High: ${latestData['2. high']}</td>
            <td>Low: ${latestData['3. low']}</td>
            <td>Close: ${latestData['4. close']}</td>
            <td>Volume: ${latestData['5. volume']}</td>
          </tr>
        `;
    } else if (timeOption === 'MONTHLY') {
        // For Monthly data, extract the latest stock price and other relevant information
        const latestData = fetchedData['Monthly Time Series'][Object.keys(fetchedData['Monthly Time Series'])[0]];
        lastStockPrice = latestData['4. close'];
        otherStockDetails = `
            <tr>
                <td>Open: ${latestData['1. open']}</td>
                <td>High: ${latestData['2. high']}</td>
                <td>Low: ${latestData['3. low']}</td>
                <td>Close: ${latestData['4. close']}</td>
                <td>Volume: ${latestData['5. volume']}</td>
            </tr>
        `;
    }
    const stockDetails =document.createElement('div');
    stockDetails.classList.add('stock-details');
    stockDetails.innerHTML = `
    <h1>Stock Symbol: ${symbol}</h1>
    <h2>Time Frame: ${timeOption}</h2>
    <h2>Last Stock Price: ${lastStockPrice}</h2>
    <div>Other Details:
    ${otherStockDetails}</div>
    `;

    stockDetailsElement.appendChild(stockDetails);
    modal.style.display = 'block';
}

// Function to close the modal
function closeModal() {
    const modal = document.getElementById('modal');
    modal.style.display = 'none';
}

// Function to remove stock from the watchlist
function removeStock(symbol) {
    const watchlistContainer = document.getElementById('watchlist');
    const stockCards = watchlistContainer.getElementsByClassName('stock-card');

    for (let card of stockCards) {
        if (card.getElementsByTagName('h3')[0].innerText === symbol) {
            card.remove();
            break;
        }
    }
}

// Function to handle the search button click
function searchStock() {
    const symbol = document.getElementById('stock-symbol').value;
    const timeOption = selectedTimeOption;

    fetchStockData(symbol, timeOption);
}