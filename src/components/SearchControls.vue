<template>
    <div id="search-container">
        <SearchControlsAirport v-on="$listeners" class="full-width" />
        <div id="date-container">
            <div>
                <el-date-picker
                    v-model="departDate"
                    @change="departDateChange()"
                    type="date"
                    placeholder="Depart"
                    format="yyyy-MM-dd"
                    value-format="yyyy-MM-dd">
                </el-date-picker>
            </div>
            <div>
                <el-date-picker 
                    v-model="returnDate"
                    @change="returnDateChange()"
                    type="date"
                    placeholder="Return"
                    format="yyyy-MM-dd"
                    value-format="yyyy-MM-dd">
                </el-date-picker>
            </div>
        </div>
        <el-checkbox 
            v-model="directFlights" 
            @change="directFlightsChange()"
            label="Direct flights only">
        </el-checkbox>
        <div id="budget" class="flex full-width">
            <span>Budget</span>
            <el-slider 
                v-model="budget"
                @input="budgetChange()"
                :show-tooltip="false"
                :step="1000"
                :max="maxBudget">
            </el-slider>
            <span>{{budget}}{{budget === maxBudget ? '+' : ''}} SEK </span>
        </div>
    </div>
</template>

<script>
    import SearchControlsAirport from './SearchControlsAirport'
    export default {
        name: 'SearchControls',
        components: {
            SearchControlsAirport
        },
        props: [],
        data: () => ({
            origin: null,
            departDate: new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString().slice(0,10),
            returnDate: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0,10),
            directFlights: false,
            budget: 4000,
            maxBudget: 15000
        }),
        methods: {
            departDateChange() {
                this.$emit('onDepartDateChange', this.departDate)
            },
            returnDateChange() {
                this.$emit('onReturnDateChange', this.returnDate)
            },
            directFlightsChange() {
                this.$emit('onDirectFlightsChange', this.directFlights)
            },
            budgetChange() {
                const newBudget = this.budget < this.maxBudget ? this.budget : null
                this.$emit('onBudgetChange', newBudget)
            }
        },
        mounted() {
            this.departDateChange()
            this.returnDateChange()
            this.budgetChange()
        }
    }
</script>

<style scoped>
    #search-container {
        display: block;
        background-color: #135384;
        position: absolute;
        top: 10px;
        left: 10px;
        width: 310px;
        padding: 12px;
        border-radius: 4px;
    }

    #search-container > *:not(:first-child) {
        margin-top: 10px;
    }

    #budget {
        margin-top: 0px !important;
        color: white;
        line-height: 19px;
        font-size: 14px;
        font-weight: 500;
    }

    #budget > span {
        margin: auto 0;
    }

    #date-container {
        display: flex;
        justify-content: space-between;
    }

    .el-date-editor.el-input {
        width: 150px;
    }

    .el-checkbox {
        color: white;
    }

    .el-slider {
        width: 148px;
        margin: 0 18px
    }
</style>
    