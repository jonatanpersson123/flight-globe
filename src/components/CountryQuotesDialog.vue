<template>
    <el-dialog
      :modal="false"
      :title="titleText" 
      :visible="show"
      @close="onClose()">
      <CountryQuotesDialogTable 
        v-on="$listeners"
        :data="countryQuotesData.airportsData"
      ></CountryQuotesDialogTable>
    </el-dialog>
</template>

<script>
    import locations from '../data/skyscanner-locations'
    import CountryQuotesDialogTable from './CountryQuotesDialogTable'
    export default {
        name: 'CountryQuotesDialog',
        components: {
            CountryQuotesDialogTable
        },
        props: ['show', 'countryQuotesData'],
        data: () => ({
        }),
        methods: {
            onClose() {
                this.$emit('onDialogClose')
            }
        },
        computed: {
            titleText() {
                const {country, code} = this.countryQuotesData.countryData
                return `Prices - ${country} (${code})`
            }
        },
        mounted() {
        }
    }
</script>

<style scoped>
</style>
    