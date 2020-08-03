<template>
  <div>
    <SearchControls 
      @onOriginChange="updateOrigin($event)"
      @onDepartDateChange="updateDepartDate($event)"
      @onReturnDateChange="updateReturnDate($event)"
      @onDirectFlightsChange="updateDirectFlights($event)"
      @onBudgetChange="updateBudget($event)"
    ></SearchControls>
    <Globe 
      :selectedCountries="selectedCountries"
      :origin="origin"
      @onCountryChange="updateCountry($event)"
      @onCountryClicked="showCountryQuotes($event)">
    </Globe>
    <CountryInfo :countryName="countryName" />
  </div>
</template>

<script>
import SearchControls from './components/SearchControls'
import Globe from './components/Globe'
import CountryInfo from './components/CountryInfo'
import axios from 'axios'

export default {
  name: 'App',
  components: {
    SearchControls,
    Globe,
    CountryInfo
  },

  data: () => ({
    countryName: '',
    showCountryQuotesDialog: false,
    selectedCountries: [],
    origin: {
      code: null,
      countryCode: null,
      name: null
    },
    departDate: null,
    returnDate: null,
    directOnly: null,
    budget: null,
    quotes: [],
    places: [],
  }),

  methods: {
    search() {
      if (this.origin?.code && this.departDate && this.returnDate) {
        const queryString = this.getQueryString()
        axios.get(queryString).then(response => {
          this.quotes = response.data.Quotes
          this.places = response.data.Places
          const quotes = this.getQuotesForAllCountries(this.quotes, this.places)
          this.updateSelectedCountries()
        }).catch(error => console.log(error)) 
      }
    },

    getQuotesForCountry(quotes) {
      let filteredTrips = quotes.filter(q => q.InboundLeg && q.OutboundLeg)
      return this.getQuoteInfo(filteredTrips)
    },

    getQuotesForAllCountries(quotes, places, budget, directOnly) {
      let filteredQuotes = quotes.filter(q => q.InboundLeg && q.OutboundLeg)
      // show all if no budget is set
      if (budget != null) {
          filteredQuotes = filteredQuotes.filter(q => q.MinPrice <= this.budget)
      }
      if (directOnly) {
          filteredQuotes = filteredQuotes.filter(q => q.Direct)
      }
      return this.getQuotesInfo(filteredQuotes, places)
    },

    getQuotesInfo(quotes, places) {
        return quotes.map(q => {
          const stationInfo = places.find(p => p.Type === 'Station' && p.PlaceId === q.OutboundLeg.DestinationId)
          const countryInfo = places.find(p => p.Type === 'Country' && p.Name === stationInfo.CountryName)
          return {
              country: {
                  name: countryInfo.Name,
                  code: countryInfo.SkyscannerCode,
              },
              airport: {
                  name: stationInfo.Name,
                  code: stationInfo.SkyscannerCode
              }
          }
        }).filter(info => info.country.code !== this.origin.countryCode)
    },

    getQueryString(destination) {
      return `https://skyscanner-skyscanner-flight-search-v1.p.rapidapi.com/apiservices/browsequotes/v1.0/SE/SEK/en-US/${this.origin.code}/${destination ? destination : 'anywhere'}/${this.departDate}/${this.returnDate ? this.returnDate : ''}`
    },

    updateCountry(countryName) {
      this.countryName = countryName
    },
    showCountryQuotes(country) {
      this.showCountryQuotesDialog = true
      const queryString = this.getQueryString(country.code)
      axios.get(queryString).then(response => {
        // TODO - Show airport quotes in dialog
        console.log(response)
      }).catch(error => console.log(error)) 

    },
    updateOrigin(origin) {
      this.origin = origin
      this.search()
    },
    updateDepartDate(date) {
      this.departDate = date
      this.search()
    },
    updateReturnDate(date) {
      this.returnDate = date
      this.search()
    },
    updateDirectFlights(directOnly) {
      this.directOnly = directOnly
      this.updateSelectedCountries()
    },
    updateBudget(budget) {
      this.budget = budget
      this.updateSelectedCountries()
    },
    updateSelectedCountries() {
      if (this.quotes.length > 0 && this.places.length > 0) {
        const quotes = this.getQuotesForAllCountries(this.quotes, this.places, this.budget, this.directOnly)
        this.selectedCountries = [...new Set(quotes.map(data => data.country.code))]
      } else {
        this.selectedCountries = []
      }
    }
  }
}
</script>

<style>
  html, body {
    margin: 0;
  }

  html, body, #main {
    height: 100%;
    width: 100%;
  }

  input::placeholder, .el-icon-date, .el-icon-map-location {
    color: #606266 !important;
  }

  .full-width {
    width: 100%;
  }

  .full-height {
    height: 100%;
  }
  .flex {
    display: flex;
  }

  .flex-column {
    flex-direction: column;
  }

  .flex1 {
    flex: 1;
  }
</style>
