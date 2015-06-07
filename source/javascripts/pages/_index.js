function getRandomSearchQuery() {
  var randomSearches = [
    'kids',
    'comics',
    'ruby',
    'javascript',
    'ios'
  ];
  var randomIndex = Math.floor(randomSearches.length * (Math.random()));
  return randomSearches[randomIndex];
}

var lastSearchQuery = '';
function performSearch(query) {
  if (query === lastSearchQuery)
    return;
  lastSearchQuery = query;

  var displayResults = function(data) {
    if (data.items) {
      clearResults();
      $.each(data.items, function(index, product) {
        addResult(product.link, product.pagemap.product[0].image, product.title)
      });
    } else {
      displayNoResults();
    }
  }

  var cacheKey = 'cache_query_' + CryptoJS.SHA1(query);
  if (localStorageSupported()) {
    var cachedData = window.localStorage.getItem(cacheKey);
    if (cachedData !== null) {
      var cachedObj = JSON.parse(cachedData);
      var sevenDaysAgo = new Date() - 1000 * 60 * 60 * 24 * 7;
      var cachedDate = new Date(cachedObj.timestamp);
      if (cachedDate > sevenDaysAgo) {
        displayResults(cachedObj.data);
        return;
      }
    }
  }

  $.ajax({
    url: 'https://www.googleapis.com/customsearch/v1?key=AIzaSyDxLC-epgwBMjhpl_TlvWMUBYM-UeUeUJc&alt=json&cx=015944067465446126142:mbov2qsvxky&prettyPrint=false&q=' + encodeURIComponent(query),
    dataType: 'jsonp'
  })
  .done(function(data) {
    if (data.error) {
      displayError(data.error.message);
      return;
    }
    if (data.items) {
      if (localStorageSupported()) {
        var cacheObject = {
          timestamp: new Date(),
          data: data
        };
        window.localStorage.setItem(cacheKey, JSON.stringify(cacheObject));
      }
    }
    displayResults(data);
  });
}

function clearResults() {
  $('.footer').hide();
  $('.results').html('');
}

function displayError(error) {
  $('.footer').hide();
  $('.results').html('<div class="error"><div class="heading">An error has occurred.</div><div class="message">"' + error + '"</div>');
}

function displayNoResults() {
  $('.footer').hide();
  $('.results').html('No results found');
}

function addResult(url, imageUrl, title) {
  $('.footer').show();
  if (url.indexOf('https://gumroad.com/l/') !== 0)
    return;
  if (typeof imageUrl == 'undefined')
    return;
  var id = url.replace(/^https:\/\/gumroad.com\/l\//, '').replace(/([a-zA-Z0-9_-]+).*/, '$1');
  $('.results').append('<a href="' + url + '" class="product ' + id + '"><div class="title">' + title + '</div></a>');
  $('.results .product.' + id).css('background-image', 'url(' + imageUrl + ')');
}

function userSearch() {
  var query = $('.search input').val();
  if (query.length === 0)
    return;
  performSearch(query);
}

var lastSearchTimeoutId = 0;
function userSearchDelay() {
  clearTimeout(lastSearchTimeoutId);
  lastSearchTimeoutId = setTimeout(userSearch, 400); 
}

$(function() {
  Gumroad.init();
  performSearch(getRandomSearchQuery());
  $('.search input')
  .focus()
  .keyup(userSearchDelay)
  .change(userSearch);
});
