<template>
    <div>
        <div class="side-container">
            <div class="title-container">
                <i class="el-icon-s-promotion"></i>
                <span class="logo-text">Flight</span>
                <span class="logo-text purple">Globe</span>
            </div>
            <div class="delimiter-thin"></div>
            <div class="flex1">
                <div class="padd-content space-top">
                    <h5>From</h5>
                    <SearchControlsAirport class="full-width" @onOriginChange="originChange($event)" />
                    <div class="inputs-container">
                        <div class="control-container">
                            <h5>Depart</h5>
                            <el-date-picker
                                v-model="departDate"
                                @change="departDateChange()"
                                type="date"
                                placeholder="Select date"
                                format="yyyy-MM-dd"
                                value-format="yyyy-MM-dd"
                                :picker-options="departPickerOptions">
                            </el-date-picker>
                        </div>
                        <div class="control-container">
                            <h5>Return</h5>
                            <el-date-picker 
                                v-model="returnDate"
                                @change="returnDateChange()"
                                type="date"
                                placeholder="Select date"
                                format="yyyy-MM-dd"
                                value-format="yyyy-MM-dd"
                                :picker-options="returnPickerOptions">
                            </el-date-picker>
                        </div>
                    </div>

                </div>

                <div class="delimiter"></div>

                <div class="control-container padd-content flex">
                    <h5>Filters</h5>
                    <el-checkbox class="space-top"
                        v-model="directFlights" 
                        @change="directFlightsChange()"
                        label="Direct flights only">
                    </el-checkbox>
                    <el-checkbox v-if="false" class="space-top"
                        v-model="flexibleDatesEnabled" 
                        @change="flexibleDatesEnabledChange()"
                        label="Flexible dates">
                    </el-checkbox>
                    <el-checkbox class="space-top"
                        v-model="budgetEnabled" 
                        @change="budgetEnabledChange()"
                        label="Budget limit">
                    </el-checkbox>
                </div>
                <div v-if="flexibleDatesEnabled" class="inputs-container padd-content space-top flex">
                    <div>
                        <h5>Minimum days</h5>
                        <el-select v-model="flexibleMin">
                            <el-option
                            v-for="item in flexibleOptions"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value">
                            </el-option>
                        </el-select>
                    </div>
                    <div>
                        <h5>Maximum days</h5>
                        <el-select v-model="flexibleMax">
                            <el-option
                            v-for="item in flexibleOptions"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value">
                            </el-option>
                        </el-select>
                    </div>
                </div>

                <div class="delimiter"></div>
                
                <div id="search-button-container">
                    <el-button class="rounded" :disabled="!validSearch" type="primary" @click="search()">Search</el-button>
                </div>
            </div>
        </div>
        <div v-if="budgetEnabled" id="budget-container" class="flex flex-column">
            <div class="flex space-between">
                <h5 class="zero-space">Budget</h5>
                <h5 class="zero-space">{{budget}}{{budget === maxBudget ? '+' : ''}} SEK</h5>
            </div>
            <el-slider 
                v-model="budget"
                @input="budgetChange()"
                :show-tooltip="false"
                :step="1000"
                :max="maxBudget">
            </el-slider>
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
        data: (vm) => ({
            origin: null,
            departDate: null,
            returnDate: null,
            directFlights: false,
            flexibleDatesEnabled: false,
            flexibleMin: 0,
            flexibleMax: 0,
            nightsBetweenDates: 0,
            budgetEnabled: false,
            budget: null,
            maxBudget: 15000,
            tripMode: 'round',
            departPickerOptions: {
                firstDayOfWeek: 1,
                disabledDate(date) {
                    // Disables dates before current date 
                    return new Date(date.toDateString()) < new Date(new Date().toDateString())
                }
            },
            returnPickerOptions: {
                firstDayOfWeek: 1,
                disabledDate(date) {
                    // Disables dates before departure date
                    return vm.departDate == null ? true : new Date(date.toDateString()) < new Date(new Date(vm.departDate).toDateString())
                }
            }
        }),
        computed: {
            returnDatePlacehoder()  {
                return this.tripMode == 'round' ? 'Return' : '(One way)'
            },
            validSearch() {
                 if (this.tripMode === 'round') {
                    return this.origin?.code && this.departDate && this.returnDate
                } else {
                    return this.origin?.code && this.departDate
                }
            }
        },
        methods: {
            search() {
                this.$emit('onSearch')
            },
            originChange(origin) {
                this.origin = origin
                this.$emit('onOriginChange', origin)
            },
            departDateChange() {
                this.$emit('onDepartDateChange', this.departDate)
                this.flexibleDatesEnabled = false
                this.setTripMode()
            },
            returnDateChange() {
                this.$emit('onReturnDateChange', this.returnDate)
                this.flexibleDatesEnabled = false
                this.setTripMode()
            },
            setTripMode() {
                this.tripMode = this.departDate && this.returnDate ? 'round' : 'one'
                this.tripModeChange()
            },
            directFlightsChange() {
                this.$emit('onDirectFlightsChange', this.directFlights)
            },
            flexibleDatesEnabledChange() {
                this.updateDates()
            },
            flexibleMinChange() {
                this.$emit('flexibleDatesChange', [this.flexibleMin, this.flexibleMax])
            },
            flexibleMaxChange() {
                this.$emit('flexibleDatesChange', [this.flexibleMin, this.flexibleMax])
            },
            updateDates() {
                if (this.flexibleDatesEnabled && this.departDate && this.returnDate) {
                    const getNightsBetweenDates = (departDate, returnDate) => {
                        const timeDiff = Math.abs(new Date(returnDate).getTime() - new Date(departDate).getTime())
                        const numberOfNights = Math.ceil(timeDiff / (1000 * 3600 * 24))
                        return numberOfNights
                    }
                    this.nightsBetweenDates = getNightsBetweenDates(this.departDate, this.returnDate)
                    this.flexibleOptions = this.createFlexibleOptions(this.nightsBetweenDates)
                    this.flexibleMin = this.nightsBetweenDates
                    this.flexibleMax = this.nightsBetweenDates
                }
            },
            createFlexibleOptions(nightsBetweenDates) {
                const options = []
                for (let index = 1; index <= nightsBetweenDates; index++) {
                    options.push({
                        value: index,
                        label: index.toString()
                    })
                }
                return options
            },
            budgetChange() {
                const newBudget = this.budget < this.maxBudget ? this.budget : null
                this.$emit('onBudgetChange', newBudget)
            },
            budgetEnabledChange() {
                if(!this.budgetEnabled) {
                    this.$emit('onBudgetChange', null)
                } else {
                    this.budget = !this.budget ? this.maxBudget : this.budget
                }
            },
            tripModeChange() {
                this.$emit('onTripModeChange', this.tripMode)
            }
        },
        mounted() {
            this.budgetChange()
        }
    }
</script>

<style scoped>

    .side-container {
        display: flex;
        flex-direction: column;
        background-color: rgba(47, 55, 72, 0.9);
        width: 310px;        
        border-radius: 6px;
        overflow: hidden;
        position: absolute;
        top: 20px;
        left: 20px;
    }

    /* #menu-container > *:not(:first-child) {
        margin-top: 10px;
    } */

    .title-container {
        flex: 0 0 60px;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .el-icon-s-promotion {
        font-size: 28px;
        margin: 0 4px 0 -4px;
        color: #687FE6;
    }

    .logo-text {
        color: white;
        font-size: 22px;
        font-weight: bold;
        white-space: pre;
    }

    .logo-text.purple {
        color: #687FE6;
    }

    .radio-group {
        margin: 8px 0; 
    }

    .box-row {
        align-items: center;
        height: 30px;
    }

    .space-between {
        justify-content: space-between;
    }

    #search-button-container {
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding: 0 20px 20px 20px;
    }

    #budget-container {
        height: 44px;
        background-color: rgba(47, 55, 72, 0.9);
        position: absolute;
        width: 320px;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        border-radius: 6px;
        padding: 12px;
    }

    #budget {
        margin-top: 0px !important;
        color: white;
        line-height: 19px;
        font-size: 14px;
        font-weight: 500;
    }

    #budget-value {
        min-width: 80px;
    }

    .budget-text {
        margin-right: 10px;
    }

    .inputs-container {
        display: flex;
        justify-content: space-between;
    }

    .zero-space {
        margin: 0;
    }

    .control-container {
        margin-top: 16px;
        flex-direction: column;
    }

    .delimiter-thin {
        width: 100%;
        border-bottom: 1px solid #1A202C;
    }

    .delimiter {
        width: 100%;
        margin: 20px 0;
        border-bottom: 1px solid #1A202C;
    }

    .el-radio {
        color: white;
    }


    .el-date-editor.el-input, .el-select {
        width: 137px;
    }

    .el-checkbox {
        color: white;
        margin-right: 10px;
    }
</style>
    