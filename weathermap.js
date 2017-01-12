var cityIds = [
  4180439,
  4180386,
  4180531,
  4221552,
  4188985,
  4207400
];

var app = angular.module('weather-map', ['ngRoute']);

var markerDictionary = {};

app.config(function($routeProvider) {
  $routeProvider
  .when('/', {
    templateUrl: 'overview.html',
    controller: 'WeatherMapController'
  })
  .when('/city/:cityId', {
    templateUrl: 'forecast.html',
    controller: 'ForecastController'
  });
});

app.controller('WeatherMapController', function($scope, weatherService, googleMap) {
  $scope.openInfoWindow = function(result) {
    googleMap.openInfoWindow(result);
  };

  weatherService.getWeatherByCityIds(cityIds, function(data) {
    var results = data.list;
    $scope.results = results;
    googleMap.plotData(results);
  });

});

app.controller('ForecastController', function($scope, googleMap, $routeParams, weatherService) {
  console.log($routeParams);
  var cityId = $routeParams.cityId;
  weatherService.getForecastForCity(cityId, function(data) {
    $scope.forecastList = data.list;
    console.log($scope.forecastList);
  });
});

app.factory('weatherService', function($http) {
  var APPID = 'd572e3897b56c1638fada0388125c161';
  return {
    getWeatherByCityIds: function(cityIds, callback) {
      $http({
        url: 'http://api.openweathermap.org/data/2.5/group',
        params: {
          id: cityIds.join(','),
          units: 'imperial',
          APPID: APPID
        }
      }).success(function(data) {
        callback(data);
      });
    },
    getForecastForCity: function(cityId, callback) {
      $http({
        url: 'http://api.openweathermap.org/data/2.5/forecast',
        params: {
          id: cityId,
          units: 'imperial',
          APPID: APPID
        }
      }).success(callback);
    }
  };
});

app.factory('googleMap', function() {
  // initialize google maps
  var mapElement = document.getElementById('map');
  var map = new google.maps.Map(mapElement, {
    center: { lat: 32.840691, lng: -83.632401 },
    zoom: 6
  });
  var infoWindow = new google.maps.InfoWindow();

  function openInfoWindow(result) {
    var html = '<h3>' + result.name + '</h3>' +
    '<p>' +
    'Weather: ' + result.weather[0].description + '<br>' +
    'Temperature: ' + result.main.temp + '°<br>' +
    '<a href="#/city/' + result.id + '">Detailed forecast</a>' +
    '</p>';
    infoWindow.setContent(html);
    var marker = markerDictionary[result.id];
    infoWindow.open(map, marker);
  };

  return {
    openInfoWindow: openInfoWindow,
    plotData: function(results) {
      var markers = results.map(function(result) {
        var position = {
          lat: result.coord.lat,
          lng: result.coord.lon
        };
        var icon = {
          url: 'http://openweathermap.org/img/w/' + result.weather[0].icon + '.png',
          size: new google.maps.Size(50, 50),
          origin: new google.maps.Point(0, 0),
          anchor: new google.maps.Point(25, 25)
        };
        var marker = new google.maps.Marker({
          anchorPoint: new google.maps.Point(0, -8),
          position: position,
          title: result.name,
          map: map,
          icon: icon
        });
        markerDictionary[result.id] = marker;
        marker.addListener('click', function() {
          openInfoWindow(result);
        });
        return marker;
      });
    }
  };
});
