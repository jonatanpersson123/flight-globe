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
      :quotes="quotes"
      :places="places"
      :budget="budget"
      :directOnly="directOnly"
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
        }).catch(error => console.log(error)) 
      }
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
    },
    updateBudget(budget) {
      this.budget = budget
    },
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
