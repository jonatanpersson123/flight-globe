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
    <el-dialog v-if="countryQuotesDialogData"
      :modal="false"
      :title="countryQuotesDialogData.countryData.country + ' (' + countryQuotesDialogData.countryData.code + ')'" 
      :visible.sync="showCountryQuotesDialog">
        <el-table :data="countryQuotesDialogData.airportsData" @row-click="navigateToSkyscannerFlights($event)">
          <el-table-column property="name" label="Name" width="150"></el-table-column>
          <el-table-column property="code" label="Code" width="70"></el-table-column>
          <el-table-column property="directPrice" label="Direct" width="100"></el-table-column>
          <el-table-column property="indirectPrice" label="Indirect" width="100"></el-table-column>
      </el-table>
  </el-dialog>
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
    countryQuotesDialogData: null,
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
          this.updateSelectedCountries()
        }).catch(error => console.log(error)) 
      }
    },

    getQuotesForCountry(quotes, places) {
      return this.getQuotesInfo(quotes.filter(q => q.InboundLeg && q.OutboundLeg), places)
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

    updateCountry(countryName) {
      this.countryName = countryName
    },
    showCountryQuotes(countryData) {
      if(this.origin.code && this.departDate && this.returnDate) {
        this.showCountryQuotesDialog = true
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
    updateSelectedCountries() {
      if (this.quotes.length > 0 && this.places.length > 0) {
        const quotes = this.getQuotesForAllCountries(this.quotes, this.places, this.budget, this.directOnly)
        this.selectedCountries = [...new Set(quotes.map(data => data.country.code))]
      } else {
        this.selectedCountries = []
      }
    },
    navigateToSkyscannerFlights(airportData) {
      if(airportData && this.origin.code && this.departDate && this.returnDate) {
        window.open(`https://www.skyscanner.se/transport/flights/${this.origin.code}/${airportData.code}/${this.departDate}/${this.returnDate}/?adultsv2=1&cabinclass=economy&childrenv2=&inboundaltsenabled=false&outboundaltsenabled=false`)
      }
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

  .el-dialog {
    position: absolute !important;
    top: 10px;
    right: 10px;
    margin: 0 !important;
    width: unset !important;
  }

  .el-table tbody tr {
    cursor: pointer;
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
