<template>
    <div class="table">
        <span v-if="data.length === 0">
            No data available
        </span>
        <div v-else>
            <div v-for="item in data" :key="item.code" class="flex table-row">
                <div class="destination">{{item.name}}, {{item.code}}</div>
                <div class="flex">
                    <div v-if="item.directPrice" class="chip">
                        <span class="text">DIRECT {{item.directPrice}}</span>
                    </div>
                    <div v-if="item.indirectPrice" class="chip">
                        <span class="text">MULTI {{item.indirectPrice}}</span>
                    </div>
                    <el-button class="flight-button" icon="el-icon-arrow-right" circle @click="quoteClick(item.code)"></el-button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'CountryQuotesDialogTable',
        props: ['data'],
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
    }

    .table-row {
        height: 50px;
        justify-content: space-between;
        vertical-align: center;
        align-items: center;
        border-bottom: 1px solid white;
    }

    .destination {
        margin-right: 24px;
    }

    .chip {
        border: 1px solid white;
        padding: 4px;
        width: 80px;
        height: 16px;
        border-radius: 14px;
        text-align: center;
    }

    .chip:not(:first-child) {
        margin-left: 4px;
    }

    .chip .text {
        font-size: 12px;
    }
    
    .flight-button {
        background: transparent;
        padding: 5px !important; 
        color: white;
        margin-left: 8px;
    }
    
</style>
    