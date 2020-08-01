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
      @onCountryChange="updateCountry($event)">
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
    places: []
  }),

  methods: {
    
    search() {
      if (this.origin?.code && this.departDate) {
        const queryString = `https://skyscanner-skyscanner-flight-search-v1.p.rapidapi.com/apiservices/browsequotes/v1.0/SE/SEK/en-US/${this.origin.code}/anywhere/${this.departDate}/${this.returnDate ? this.returnDate : ''}`
        axios.get(queryString).then(response => {
          this.quotes = response.data.Quotes
          this.places = response.data.Places
          console.log(this.quotes, 'Quotes')
          console.log(this.places, 'Places')
        }).catch(error => console.log(error)) 
      }
    },

    updateCountry(countryName) {
      this.countryName = countryName
    },
    updateOrigin(origin) {
      this.origin = origin
      this.search()
      console.log(origin)
    },
    updateDepartDate(date) {
      this.departDate = date
      this.search()
      console.log(date)
    },
    updateReturnDate(date) {
      this.returnDate = date
      this.search()
      console.log(date)
    },
    updateDirectFlights(directOnly) {
      this.directOnly = directOnly
      console.log(directOnly)
    },
    updateBudget(budget) {
      this.budget = budget
      console.log(budget)
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
