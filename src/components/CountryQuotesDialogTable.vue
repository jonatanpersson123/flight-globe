<template>
    <div class="side-container">
        <div class="title-container">
            <span class="logo-text">{{title}}</span>
        </div>
        <div class="delimiter-thin"></div>
        <div class="table padd-content">
            <span v-if="data.length === 0" class="space-top no-data">
                No data available
            </span>
            <div v-else class="space-top">
                <div v-for="item in data" :key="item.code" class="flex table-row">
                    <div class="flight-container">
                        <div class="flex flight-header">
                            <span class="location">{{item.name}}, {{item.code}}</span>    
                            <el-button @click="quoteClick(item.code)" type="primary" icon="el-icon-right" circle></el-button>
                        </div>
                        <div class="space-top flex price-containers">
                            <div v-bind:class="{ disabled: !item.directPrice }" class="price-container">
                                <div class="chip">DIRECT</div>
                                <span class="price">{{item.directPrice ? item.directPrice + ' SEK' : '-'}}</span>
                            </div>
                            <div v-bind:class="{ disabled: !item.indirectPrice }" class="price-container">
                                <div class="chip">+1 STOPS</div>
                                <span class="price">{{item.indirectPrice ? item.indirectPrice + ' SEK' : '-'}}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'CountryQuotesDialogTable',
        props: ['data', 'title', 'date'],
        data: () => ({
        }),
        methods: {
            quoteClick(countryCode) {
                this.$emit('navigateToFlights', countryCode)
            }
        },
        computed: {

        },
        mounted() {
        }
    }
</script>

<style scoped>
    .table {
        color: white;
        padding-bottom: 10px;
        overflow-y: auto;
    }

    .table-row {
        justify-content: space-between;
        vertical-align: center;
        align-items: center;
    }

    .table-row:not(:first-child) {
        margin-top: 10px;
    }

    .destination {
        margin-right: 24px;
    }

    .chip {
        background-color: #4A5568;
        padding: 4px;
        font-weight: bold;
        font-size: 12px;
        width: 64px;
        height: 16px;
        border-radius: 14px;
        text-align: center;
    }

    .chip.purple {
        color: #253376;
        background-color: #8E9BDA;
    }
    
    .flight-button {
        background: transparent;
        padding: 5px !important; 
        color: white;
        margin-left: 8px;
    }

    .flight-container {
        background-color: #4A5568;
        width: 100%;
        padding: 10px;
        border-radius: 6px;
    }

    .flight-header {
        justify-content: space-between;
    }

    span.no-data {
        text-align: center;
        display: block;
    }

    .price-containers {
        justify-content: space-between;
    }

    .price-container {
        width: 134px;
        padding: 8px;
        background-color: #2C3242;
        border-radius: 6px;
    }

    .price {
        margin-top: 10px;
        display: block;
        font-weight: bold;
        font-size: 22px;
    }

    /* DUPLICATES */ 

    .side-container {
        display: flex;
        flex-direction: column;
        background-color: rgba(47, 55, 72, 0.9);
        width: 360px;        
        border-radius: 6px;
        height: 100%;
    } 

    .title-container {
        flex: 0 0 60px;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .logo-text {
        width: 230px;
        color: white;
        font-size: 22px;
        font-weight: bold;
        word-break: break-word;
        text-align: center;
    }

    .logo-text.purple {
        color: #687FE6;
    }

    .delimiter-thin {
        width: 100%;
        border-bottom: 1px solid #1A202C;
    }
    
</style>
    