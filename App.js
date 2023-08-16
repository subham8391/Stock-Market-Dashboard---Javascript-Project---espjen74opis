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
    let apiUrl;

    if (timeOption === 'INTRADAY') {
        apiUrl = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=5min&apikey=${apiKey}`;
    } else {
        apiUrl = `https://www.alphavantage.co/query?function=TIME_SERIES_${timeOption}&symbol=${symbol}&apikey=${apiKey}`;
    }

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            if(data['Error Message']){
                alert(`Stock symbol "${symbol}" not found. Please enter a valid symbol.`);
            }
            else{
            fetchedData = data;
            addToWatchlist(data, symbol, timeOption);
            }
        })
        .catch(error => console.error('Error fetching data:', error));
}
function addToWatchlist(data, symbol, timeOption) {
    const watchlistContainer = document.getElementById('watchlist');

    // Extract relevant data based on the selected time frame
    const timeSeriesKey = getTimeSeriesKey(timeOption);
    const stockData = data[timeSeriesKey];

    const stockCard = document.createElement('div');
    const uniqueId = `${symbol}_${timeOption}`; // Unique identifier for each stock card
    stockCard.classList.add('stock-card');
    stockCard.setAttribute('data-id', uniqueId); // Set unique identifier as a data attribute

    const lastStockPrice = stockData[Object.keys(stockData)[0]]['4. close'];

    stockCard.innerHTML = `
        <div class="stockInfo">
            <h3 class="sym">${symbol}</h3>
            <span class="lsp">${lastStockPrice}</span>
            <span class="to">${timeOption}</span>
            <a onclick="showStockDetails('${symbol}', '${timeOption}')"><i class="fa-solid fa-file-contract"></i></a>
            <a onclick="removeStock('${symbol}')"><i class="fa-solid fa-trash-can"></i></a>
        </div>
    `;

    watchlistContainer.appendChild(stockCard);
}

function getTimeSeriesKey(timeOption) {
    if (timeOption === 'INTRADAY') {
        return 'Time Series (5min)';
    } else if (timeOption === 'DAILY') {
        return 'Time Series (Daily)';
    } else if (timeOption === 'WEEKLY') {
        return 'Weekly Time Series';
    } else if (timeOption === 'MONTHLY') {
        return 'Monthly Time Series';
    }
    return null;
}

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
    if(existingData[uniqueId]){
        alert('Stock is already in the wishlist.');
    } 
    else{
        existingData[uniqueId] = stockDetails;
        localStorage.setItem('stockWishlist', JSON.stringify(existingData));
        alert('Stock has been added to the wishlist.');
    }
}
//remove from local storage
function removeFromWishlist(uniqueId) {
    let existingData = localStorage.getItem('stockWishlist');
    if (existingData) {
        let parsData = JSON.parse(existingData);
        for( let keys in parsData){
            if(parsData[keys].symbol === uniqueId){
                delete parsData[keys];
            localStorage.setItem('stockWishlist', JSON.stringify(parsData));
            }
            else {
                   console.log('Item not found:', uniqueId);
            }
            
        }
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
   
   // Clear existing stock details content
   stockDetailsElement.innerHTML = '';
    // Extract relevant data based on the selected time frame

    const timeSeriesKey = getTimeSeriesKey(timeOption);
    const latestData = fetchedData[timeSeriesKey][Object.keys(fetchedData[timeSeriesKey])[0]];

    const lastStockPrice = latestData['4. close'];
    let otherStockDetails = '<tr><th>Date</th><th>Open</th><th>High</th><th>Low</th><th>Close</th><th>Volume</th></tr>';
    
    let rowCounter = 0;
    for (const date in fetchedData[timeSeriesKey]) {
        if (rowCounter >= 5) {
            break; // Display only 5 rows
        }

        const rowData = fetchedData[timeSeriesKey][date];
        const { '1. open': open, '2. high': high, '3. low': low, '4. close': close, '5. volume': volume } = rowData;

        otherStockDetails += `
            <tr>
                <td>${date}</td>
                <td>${open}</td>
                <td>${high}</td>
                <td>${low}</td>
                <td>${close}</td>
                <td>${volume}</td>
            </tr>
        `;

        rowCounter++;
    }

    const stockDetails = document.createElement('div');
    stockDetails.classList.add('stock-details');

    stockDetails.innerHTML = `
    <div class="show-stocks">
        
        <div class="stoc-headder">
        <span class="sym-sd">${symbol}</span>
        <span class="lsp-sd">${lastStockPrice}</span>
        <span class="to-sd">${timeOption}</span>
        
        </div>
        <div class="stoc-Other">
            <table class="data-table">${otherStockDetails}</table>
        </div>
        <div class="stoc-btn">
        <button onclick="addToWishlist('${symbol}', '${timeOption}')">Add to Wishlist</button> <!-- Add Add to Wishlist button -->
        </div>
    </div>
    `;
    
    stockDetailsElement.appendChild(stockDetails);
    modal.style.display = 'block';

}

// Function to close the modal
function closeModal() {
    const modal = document.getElementById('modal');
        modal.style.display = 'none';
        
    // location.reload();
}

// Function to remove stock from the watchlist
function removeStock(symbol) {
    const watchlistContainer = document.getElementById('watchlist');
    const stockCards = watchlistContainer.getElementsByClassName('stock-card');
    removeFromWishlist(symbol);
    for (let card of stockCards) {
        if (card.getElementsByTagName('h3')[0].innerText === symbol) {
            card.remove();
            break;
        }
    }
}
// Adding an event listener to the input field for the "keydown" event
const stockSymbolInput = document.getElementById('stock-symbol');
stockSymbolInput.addEventListener('keydown', event => {
    if (event.key === 'Enter') {
        searchStock();
    }
});

// Function to handle the search button click
function searchStock() {
    const symbol = document.getElementById('stock-symbol').value.trim();
    const timeOption = selectedTimeOption;
    if(symbol === ''){
        alert('Please enter a valid stock symbol.')
        return;
    }
    fetchStockData(symbol, timeOption);
    // Clear the input field after searching
    symbol.value = '';
}