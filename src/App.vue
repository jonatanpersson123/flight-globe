<template>
  <div id="main">
    <SearchControls
      @onOriginChange="updateOrigin($event)"
      @onDepartDateChange="updateDepartDate($event)"
      @onReturnDateChange="updateReturnDate($event)"
      @onDirectFlightsChange="updateDirectFlights($event)"
      @onBudgetChange="updateBudget($event)"
      @onTripModeChange="updateTripMode($event)"
      @flexibleDatesChange="updateFlexibleDates($event)"
      @onSearch="search()"
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
    quoteAPIURL: 'https://skyscanner-skyscanner-flight-search-v1.p.rapidapi.com/apiservices/browsequotes/v1.0/SE/SEK/en-US',
    flightPriceURL: 'https://www.skyscanner.se/transport/flights',
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
          const countryInfo = places.find(p => p.Type === 'Nation' && p.Name === stationInfo.CountryName)
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
      return `${this.quoteAPIURL}/${this.origin.code}/${destination ? destination : 'anywhere'}/${this.departDate}/${this.returnDate ? this.returnDate : ''}`
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
          const date = {departDate: this.departDate, returnDate: this.returnDate}
          this.countryQuotesDialogData = { countryData, airportsData, date }
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
    },
    updateDepartDate(date) {
      this.departDate = date
    },
    updateReturnDate(date) {
      this.returnDate = date
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
    updateFlexibleDates(range) {
      const min = range[0]
      const max = range[1]

      const timeDiff = new Date(this.returnDate).getTime() - new Date(this.departDate).getTime()
      const numberOfNights = Math.ceil(timeDiff / (1000 * 3600 * 24))

      const scopeDays = numberOfNights
      let sum = 0
      let trips = []

      for(let i = 0; i <= scopeDays; i++) {
          // i = start date
        const limit = Math.max(max, scopeDays)
          for(let j = i; j <= limit; j++) {
              // j = days
              const duration = j - i
              if(duration >= min && duration <= max) {
                let departDate = new Date(this.departDate)
                departDate.setDate(departDate.getDate() + i)
                let returnDate = new Date(departDate)
                returnDate.setDate(returnDate.getDate() + duration)
                console.log([departDate, returnDate])
                sum++
              }
          }
      }
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
      if (airportCode && this.isValidSearch()) {
        window.open(`${this.flightPriceURL}/${this.origin.code}/${airportCode}/${this.departDate}/${this.returnDate ? this.returnDate + '/' : ''}?adultsv2=1&cabinclass=economy&childrenv2=&inboundaltsenabled=false&outboundaltsenabled=false`)
      }
    },
    closeDialog() {
      this.showCountryQuotesDialog = false
    }
  },
}
</script>

<style>
  html, body {
    margin: 0;
  }

  html, body, #main{
    height: 100%;
    width: 100%;
  }

  body {
    overflow: hidden;
  }

  #menu {
    height: 100%;
  }

  .el-dialog {
    position: absolute !important;
    top: 20px;
    right: 20px;
    margin: 0 !important;
    width: unset !important;
    background-color: rgba(47, 55, 72, 0.9) !important;;
    border-radius: 6px !important;
    max-height: 90vh;
    display: flex;
  }

  .el-dialog__header {
    padding: 0 !important;
  }

  .el-dialog__body {
    padding: 0px !important;
  }

  .el-dialog__title {
    color: white !important;
  }

  .el-dialog__close {
    color: white !important;
  }

  .el-input input {
    background-color: #4A5568;
    border: none;
    color: white;
  }

  .el-input__icon {
    color: white;
  }

  .el-radio__input.is-checked+.el-radio__label, .el-checkbox__input.is-checked+.el-checkbox__label {
    color: #AFBBCE !important;
  }

  .el-radio__input.is-checked .el-radio__inner, .el-checkbox__input.is-checked .el-checkbox__inner {
    border-color: #687FE6 !important;
    background: #687FE6 !important;
  }

  .el-button {
    background-color: #687FE6 !important;
    border: none !important;
    font-weight: bold !important;
  }

  .el-button.is-disabled, .disabled {
    opacity: 0.6 !important;
    pointer-events: none;
  }

  .el-button.rounded, .el-input__inner {
    border-radius: 6px !important;
  }

  .el-button.is-circle {
    padding: 4px !important;
  }

  .el-radio, .el-checkbox {
    color: #AFBBCE !important;
    font-weight: bold !important;
  }

  .el-radio__inner, .el-checkbox__inner {
    border: none !important;
    background-color: #1A202C !important;
  }

  .el-checkbox__inner {
    width: 16px !important;
    height: 16px !important;
  }

  .el-checkbox__inner::after {
    left: 6px !important;
    top: 2px !important;
  }

  .el-slider__bar {
    background-color: #687FE6 !important;
  }

  .el-slider__button {
    border: 3px solid #687FE6 !important;

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

  .space-top {
    margin-top: 10px;
  }

  .padd-content {
    padding: 0 12px;
  }

  h5 {
    margin: 10px 0;
    color: white !important;
    font-weight: bold;
  }

  * {
    user-select: none;
    outline: none;
  }
</style>
