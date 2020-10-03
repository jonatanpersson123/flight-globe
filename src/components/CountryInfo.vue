<template>
    <span id="country-name">{{countryName}}</span>
</template>

<script>
    export default {
        name: 'CountryInfo',
        props: ['countryName'],
        data: () => ({})
    }
</script>

<style scoped>
    #country-name {
        position: absolute;
        right: 20px;
        top: 20px;
        color: #687FE6;
        font-size: 2em;
    }
</style>
    