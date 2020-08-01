<template>
    <div id="globe"></div>
</template>

<script>
import * as THREE from 'three'
import OrbitControls from 'three-orbitcontrols'
import SeaImage from '../assets/sea.jpg'
import Stars from '../assets/stars.png'
import Countries from '../data/globe-countries'
import Tessalator3D from '../utils/tessalator3d'

export default {
    name: 'Globe',
    props: {
        quotes: Array,
        places: Array,
        budget: Number,
        directOnly: Boolean,
        origin: {
            code: String,
            countryCode: String,
            name: String
        }
     },
    data: () => ({
        renderer: null,
        scene: null,
        camera: null,
        controls: null,
        radius: 0.995,
        segments: 32,
        intersectedObject: null,
        hoverScale: 1.01,
        continents: ["EU", "AN", "AS", "OC", "SA", "AF", "NA"],
        resultCountries: [],
        globeCountries: []
    }),
    methods: {
        initGlobe() {
            this.setupRenderer()
            this.scene = new THREE.Scene()
            this.setupCamera()
            this.setupLights()

            this.baseGlobe = new THREE.Object3D()
            this.baseGlobe.scale.set(20, 20, 20)
            this.scene.add(this.baseGlobe)

            const starfield = new THREE.Mesh(
                new THREE.SphereGeometry(90, 64, 64), 
                new THREE.MeshBasicMaterial({
                    map: THREE.ImageUtils.loadTexture(Stars), 
                    side: THREE.BackSide
                })
            )
            this.scene.add(starfield)

            this.setupTexture()

            this.setupControls()

            document.addEventListener('mousemove', this.onDocumentMouseMove, false)
            document.addEventListener('keyup', this.onMouseKeyUp, false)
        },

        onDocumentMouseMove(event) {
            event.preventDefault()

            const mouseX = (event.clientX / window.innerWidth) * 2 - 1
            const mouseY = -(event.clientY / window.innerHeight) * 2 + 1
            const vector = new THREE.Vector3(mouseX, mouseY, -1)
            vector.unproject(this.camera)

            const raycaster = new THREE.Raycaster(this.camera.position, vector.sub(this.camera.position).normalize())
            const intersects = raycaster.intersectObject(this.baseGlobe, true)
            if (intersects.length > 0 && intersects[0].object.name === "land") {
                this.controls.autoRotate = false
                this.intersectedObject = intersects[0].object
            } else {
                this.intersectedObject = null
            }
        },

        onMouseKeyUp(event) {
            if (event.keyCode === 82) { // key: R
                this.controls.autoRotate = !this.controls.autoRotate
            }
        },
        
        setupRenderer() {
            this.renderer = new THREE.WebGLRenderer()
            this.renderer.setClearColor(0x000000, 0.0)
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(window.innerWidth, window.innerHeight)
            document.body.appendChild(this.renderer.domElement)
        },
        
        setupCamera() {
            this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 4500);
            this.camera.position.x = -22
            this.camera.position.y = 10
            this.camera.position.z = -64
        },

        setupLights() {
            this.scene.add(new THREE.AmbientLight(0x555555))
            
            const directionalLight1 = new THREE.DirectionalLight(0xaaaaaa, 0.5);
            directionalLight1.position.set(-1, 1, 1).normalize();
            this.scene.add(directionalLight1);

            const directionalLight2 = new THREE.DirectionalLight(0xaaaaaa, 0.5);
            directionalLight2.position.set(-1, 1, -1).normalize();
            this.scene.add(directionalLight2);

            const directionalLight3 = new THREE.DirectionalLight(0xaaaaaa, 0.5);
            directionalLight3.position.set(1, 1, -1).normalize();
            this.scene.add(directionalLight3);

            const directionalLight4 = new THREE.DirectionalLight(0xaaaaaa, 0.5);
            directionalLight4.position.set(1, 1, 1).normalize();
            this.scene.add(directionalLight4);
        },

        setupTexture() {
            const seaTexture = THREE.ImageUtils.loadTexture(SeaImage, THREE.UVMapping, () => {
                seaTexture.wrapS = THREE.RepeatWrapping
                seaTexture.wrapT = THREE.RepeatWrapping
                seaTexture.repeat.set(16, 8)
                this.baseGlobe.add(new THREE.Mesh(
                    new THREE.SphereGeometry(this.radius, this.segments, this.segments),
                    new THREE.MeshLambertMaterial({
                        transparent: true,
                        depthTest: true,
                        depthWrite: false,
                        opacity: 0.95,
                        map: seaTexture,
                        color: 0x6699ff
                    })
                ))
                this.createCountries()
            })
        },

        setupControls() {
            this.controls = new OrbitControls( this.camera, this.renderer.domElement )
            this.controls.rotateSpeed = 0.45;
            this.controls.zoomSpeed = 0.20;
            this.controls.minDistance = 20.0;
            this.controls.maxDistance = 100.0;
            this.controls.dynamicDampingFactor = 0.1
            this.controls.autoRotateSpeed = 1.0;
            setTimeout(() => {
                this.controls.autoRotate = true
            }, 3000)
        },

        getColorBasedOnContient(countryCode) {
            let color = new THREE.Color(0xff0000)
            const country = this.globeCountries.find(country => country.data.code === countryCode)
            let contientIndex = country ? this.continents.indexOf(country.data.cont) : -1
            if(!country) {
                color = new THREE.Color(0x000000)
                console.log('could not found matching country', countryCode)
            } else if (contientIndex !== -1) {
                // TODO - make color matrix for continents
                contientIndex = contientIndex === 2 ? 4 : contientIndex
                color.setHSL(
                    contientIndex * (1 / 7),
                    Math.random() * 0.25 + 0.65,
                    Math.random() / 2 + 0.25
                )
            }
            return color
        },

        createCountries() {
            this.globeCountries.forEach(country => {
                const geometry = new Tessalator3D(country, 0)

                const color = this.getColorBasedOnContient(country.data.code)

                const mesh = country.mesh = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({
                    color: color
                }))
                mesh.name = "land";
                mesh.userData.country = country.data.name
                mesh.userData.code = country.data.code
                this.baseGlobe.add(mesh)
            })
        },

        updateCountries() {
            let filteredTrips = this.quotes.filter(q => q.InboundLeg && q.OutboundLeg)
            
            // show all if no budget is set
            if (this.budget != null) {
                filteredTrips = filteredTrips.filter(q => q.MinPrice <= this.budget)
            }
            if (this.directOnly) {
                filteredTrips = filteredTrips.filter(q => q.Direct)
            }
            const filteredCountries = filteredTrips.map(q => {
                const countryNameForStation = this.places.find(p => p.PlaceId === q.OutboundLeg.DestinationId).CountryName
                const skyscannerCode = this.places.find(p => p.Type === 'Country' && p.Name === countryNameForStation).SkyscannerCode
                return {name: countryNameForStation, code: skyscannerCode, quote: q}
            }).filter(c => c.code !== this.origin.countryCode)
            this.handleSelectedCountries(
                [...new Set(this.resultCountries.map(country => country.code))], 
                [...new Set(filteredCountries.map(country => country.code))])
            this.resultCountries = filteredCountries
        },

        handleSelectedCountries(previousCountryCodes, newCountryCodes) {
            const toBeAdded = newCountryCodes.filter(countryCode => !previousCountryCodes.includes(countryCode))
            const toBeRemoved = previousCountryCodes.filter(countryCode => !newCountryCodes.includes(countryCode))

            toBeAdded.forEach(countryCode => {
                const color = new THREE.Color('green')
                color.setHSL(0.285, 0.65, Math.random() / 7 + 0.4)
                this.updateCountryColor(countryCode, color)
            })

            toBeRemoved.forEach(countryCode => {
                const color = this.getColorBasedOnContient(countryCode)
                this.updateCountryColor(countryCode, color)
            })
        },

        updateCountryColor(countryCode, color) {
            const countryMesh = this.baseGlobe.children.find(c => c.userData?.code === countryCode)
            if (countryMesh) {
                countryMesh.material.color = color
            } else {
                console.warn(`Mesh with country code ${countryCode} not found`)
            }
        },

        animate() {
            const animate = () => {
                requestAnimationFrame(animate)
                this.controls.update()
                this.renderer.render(this.scene, this.camera)
            }
            animate()
        }
    },

    watch: {
        quotes(newVal) {
            this.updateCountries()
        },
        budget(newVal) {
            this.updateCountries()
        },
        directOnly(newVal) {
            this.updateCountries()
        },
        origin(newVal, oldVal) {
            if (oldVal != null) {
                // TODO rotate to origin country
                // Restore color of previous selected origin
                const contientColor = this.getColorBasedOnContient(oldVal.countryCode)
                this.updateCountryColor(oldVal.countryCode, contientColor)
            }
            this.updateCountryColor(newVal.countryCode, new THREE.Color('blue'))
        },
        intersectedObject(newVal, oldVal)  {
            if(newVal !== oldVal) {
                if(oldVal != null) {
                    oldVal.scale.set(1.0, 1.0, 1.0)
                }
                if(newVal != null) {
                    newVal.scale.set(this.hoverScale, 1.01, 1.01)
                }
                this.$emit('onCountryChange', newVal != null ? newVal.userData.country : '')
            }
        }
    },

    mounted() {
        this.globeCountries = Object.keys(Countries).reduce((result, country) => {
            const item = Countries[country]
            item.data.name = country
            result.push(item)
            return result
        }, [])
        this.initGlobe()
        this.animate()
    }
}
</script>

<style scoped>
</style>
