
const searchForm = document.getElementById('searchForm');
const searchInput = document.getElementById('searchInput');
const searchType = document.getElementById('searchType');
const errorMsg = document.getElementById('errorMsg');
const loading = document.getElementById('loading');
const errorBox = document.getElementById('errorBox');
const resultsSection = document.getElementById('resultsSection');
const resultsGrid = document.getElementById('resultsGrid');
const resultCount = document.getElementById('resultCount');


document.addEventListener('DOMContentLoaded', function() {
    searchForm.addEventListener('submit', handleSearch);
    searchInput.addEventListener('input', checkInput);
});


function checkInput() {
    const value = searchInput.value.trim();
    errorMsg.textContent = '';
    
    if (value.length > 0 && value.length < 2) {
        errorMsg.textContent = 'Please type at least 2 characters';
        return false;
    }
    
    return true;
}


function handleSearch(e) {
    e.preventDefault();
    
    const query = searchInput.value.trim();
    const type = searchType.value;
    
    
    if (query === '') {
        errorMsg.textContent = 'Please enter something to search for';
        return;
    }
    
    if (query.length < 2) {
        errorMsg.textContent = 'Please enter at least 2 characters';
        return;
    }
    
    
    searchMusic(query, type);
}


async function searchMusic(query, type) {
    loading.classList.remove('hide');
    errorBox.classList.add('hide');
    resultsSection.classList.add('hide');
    
    try {
        
        let entity = '';
        if (type === 'track') {
            entity = 'song';
        } else if (type === 'artist') {
            entity = 'allArtist';
        } else if (type === 'album') {
            entity = 'album';
        }
        
        const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=${entity}&limit=20`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error('Search failed');
        }
        
        const data = await response.json();
        
        showResults(data.results, type, query);
        
    } catch (error) {
        console.error('Error:', error);
        errorBox.textContent = 'Could not complete search. Please check your connection and try again.';
        errorBox.classList.remove('hide');
    } finally {
        loading.classList.add('hide');
    }
}


function showResults(results, type, query) {
    resultsGrid.innerHTML = '';
    
    // check if empty
    if (results.length === 0) {
        errorBox.textContent = `No results found for "${query}". Try searching for something else.`;
        errorBox.classList.remove('hide');
        return;
    }
    
    resultCount.textContent = `Found ${results.length} results`;
    
    
    results.forEach(item => {
        const card = makeCard(item, type);
        resultsGrid.appendChild(card);
    });
    
    resultsSection.classList.remove('hide');
}


function makeCard(item, type) {
    const card = document.createElement('div');
    card.className = 'card';
    
    let image = item.artworkUrl100 || 'https://via.placeholder.com/200';
    
    let cardContent = `<img src="${image}" alt="${item.trackName || item.collectionName || item.artistName}">`;
    
    
    if (type === 'track') {
        cardContent += `
            <h3>${item.trackName}</h3>
            <p><strong>Artist:</strong> ${item.artistName}</p>
            <p><strong>Album:</strong> ${item.collectionName || 'Unknown'}</p>
        `;
    } else if (type === 'artist') {
        cardContent += `
            <h3>${item.artistName}</h3>
            <p><strong>Genre:</strong> ${item.primaryGenreName || 'Unknown'}</p>
        `;
    } else if (type === 'album') {
        cardContent += `
            <h3>${item.collectionName}</h3>
            <p><strong>Artist:</strong> ${item.artistName}</p>
            <p><strong>Tracks:</strong> ${item.trackCount || 'Unknown'}</p>
        `;
    }
    
    
    if (item.trackViewUrl || item.collectionViewUrl || item.artistViewUrl) {
        const link = item.trackViewUrl || item.collectionViewUrl || item.artistViewUrl;
        cardContent += `<a href="${link}" target="_blank">View on iTunes</a>`;
    }
    
    card.innerHTML = cardContent;
    return card;
}