<template>
    <el-autocomplete
        v-model="origin"
        :fetch-suggestions="querySearch"
        placeholder="Enter your origin"
        prefix-icon="el-icon-map-location"
        @select="handleSelect">
    </el-autocomplete>
</template>

<script>
    import locations from '../data/skyscanner-locations'
    export default {
        name: 'SearchControlsAirport',
        props: [],
        data: () => ({
            origin: '',
            airports: [],
        }),
        methods: {
             querySearch(queryString, cb) {
                const query = queryString ? queryString.length > 1 ? queryString.toLowerCase() : null : null
                const results = query ? this.airports.filter(n => n.value.toLowerCase().includes(query)) : []
                cb(results)
            },
            handleSelect(selectedAirport) {
                this.$emit('onOriginChange', selectedAirport)
            },
        },
        mounted() {
            const flatten = (array) => array.reduce((a, b) => a.concat(Array.isArray(b) ? flatten(b) : b), [])
            this.airports = flatten(locations.Continents.map(x => x.Countries.map(y => y.Cities.map(z => z.Airports.map(w => {
                return {code: w.Id, value: w.Name, countryCode: w.CountryId}
            })))))
        }
    }
</script>

<style scoped>
</style>
    