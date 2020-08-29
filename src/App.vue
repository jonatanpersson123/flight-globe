<template>
  <div>
    <SearchControls 
      @onOriginChange="updateOrigin($event)"
      @onDepartDateChange="updateDepartDate($event)"
      @onReturnDateChange="updateReturnDate($event)"
      @onDirectFlightsChange="updateDirectFlights($event)"
      @onBudgetChange="updateBudget($event)"
      @onTripModeChange="updateTripMode($event)"
    ></SearchControls>
    <CountryInfo :countryName="countryName" />
    <CountryQuotesDialog
      v-if="countryQuotesDialogData"
      :show="showCountryQuotesDialog" 
      :countryQuotesData="countryQuotesDialogData" 
      @onDialogClose="closeDialog()"
      @navigateToFlights="navigateToSkyscannerFlights($event)"
    ></CountryQuotesDialog>
    <Globe 
      :selectedCountries="selectedCountries"
      :origin="origin"
      @onCountryChange="updateCountry($event)"
      @onCountryClicked="showCountryQuotes($event)">
    </Globe>
  </div>
</template>

<script>
import SearchControls from './components/SearchControls'
import Globe from './components/Globe'
import CountryInfo from './components/CountryInfo'
import CountryQuotesDialog from './components/CountryQuotesDialog'
import axios from 'axios'

export default {
  name: 'App',
  components: {
    SearchControls,
    Globe,
    CountryInfo,
    CountryQuotesDialog
  },

  data: () => ({
    countryName: '',
    showCountryQuotesDialog: false,
    countryQuotesDialogData: null,
    selectedCountries: [],
    tripMode: null,
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
      if (this.isValidSearch()) {
        const queryString = this.getQueryString()
        axios.get(queryString).then(response => {
          this.quotes = response.data.Quotes
          this.places = response.data.Places
          this.updateSelectedCountries()
        }).catch(error => console.log(error)) 
      }
    },

    getQuotesForCountry(quotes, places) {
      const filteredQuotes = this.tripMode === 'round' ? quotes.filter(q => q.InboundLeg && q.OutboundLeg) : quotes 
      return this.getQuotesInfo(filteredQuotes, places)
    },

    getQuotesForAllCountries(quotes, places, budget, directOnly) {
      let filteredQuotes = quotes
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
                name: countryInfo ? countryInfo.Name : stationInfo.CountryName,
                code: countryInfo ? countryInfo.SkyscannerCode : null
              },
              airport: {
                name: stationInfo.Name,
                code: stationInfo.SkyscannerCode,
                minPrice: q.MinPrice,
                direct: q.Direct
              }
          }
        }).filter(info => info.country.code !== this.origin.countryCode)
    },

    getQueryString(destination) {
      return `https://skyscanner-skyscanner-flight-search-v1.p.rapidapi.com/apiservices/browsequotes/v1.0/SE/SEK/en-US/${this.origin.code}/${destination ? destination : 'anywhere'}/${this.departDate}/${this.returnDate ? this.returnDate : ''}`
    },

    isValidSearch() {
      if (this.tripMode === 'round') {
        return this.origin?.code && this.departDate && this.returnDate
      } else {
        return this.origin?.code && this.departDate
      }
    },

    updateCountry(countryName) {
      this.countryName = countryName
    },
    showCountryQuotes(countryData) {
      if(this.isValidSearch()) {
        const queryString = this.getQueryString(countryData.code)
        axios.get(queryString).then(response => {
          const quotesInfo = this.getQuotesForCountry(response.data.Quotes, response.data.Places)
          const airportsData = this.getQuotesForAirports(quotesInfo)
          this.countryQuotesDialogData = { countryData, airportsData }
          this.showCountryQuotesDialog = true
        }).catch(error => console.log(error)) 
      }
    },
    getQuotesForAirports(quotesInfo) {
      const airports = quotesInfo.map(q => q.airport)

      const airportsData = []
      airports.forEach(airport => {
        const index = airportsData.map(ad => ad.code).indexOf(airport.code)
        if(index >= 0) {
          const a = airportsData[index]
          if(airport.direct) {
            a.directPrice = airport.minPrice
          } else {
            a.indirectPrice = airport.minPrice
          }
        } else {
          airportsData.push({
            code: airport.code,
            name: airport.name,
            directPrice: airport.direct ? airport.minPrice : null,
            indirectPrice: !airport.direct ? airport.minPrice : null
          })
        }
      })
      return airportsData
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
    updateTripMode(tripMode) {
      this.tripMode = tripMode
    },
    updateSelectedCountries() {
      if (this.quotes.length > 0 && this.places.length > 0) {
        const quotes = this.getQuotesForAllCountries(this.quotes, this.places, this.budget, this.directOnly)
        this.selectedCountries = [...new Set(quotes.map(data => data.country.code))]
      } else {
        this.selectedCountries = []
      }
    },
      navigateToSkyscannerFlights(airportCode) {
      if(airportCode && this.isValidSearch()) {
        window.open(`https://www.skyscanner.se/transport/flights/${this.origin.code}/${airportCode}/${this.departDate}/${this.returnDate ? this.returnDate + '/' : ''}?adultsv2=1&cabinclass=economy&childrenv2=&inboundaltsenabled=false&outboundaltsenabled=false`)
      }
    },
    closeDialog() {
      this.showCountryQuotesDialog = false
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

  .el-dialog {
    position: absolute !important;
    top: 10px;
    right: 10px;
    margin: 0 !important;
    width: unset !important;
    background-color: #135384 !important;
    border-radius: 4px;
    min-width: 400px !important;
  }

  .el-dialog__body {
    padding-top: 10px !important;
  }

  .el-dialog__title {
    color: white !important;
  }

  .el-dialog__close {
    color: white !important;
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

  /* @media only screen and (min-width: 2000px) {
    #search-container {
      left: 10% !important;
    }
  } */
</style>
