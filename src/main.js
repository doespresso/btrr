import Vue from 'vue'
window.Vue = Vue;
import VueMaterial from 'vue-material/src/'
import VueAwesomeSwiper from 'vue-awesome-swiper'
import Collapse from 'vue-collapse'
//AIzaSyBBrn0a7rWAu93NAFSXQtV1Hkvjv_pIiHo
import inViewportDirective from 'vue-in-viewport-directive'
Vue.directive('in-viewport', inViewportDirective)
import SocialSharing from 'vue-social-sharing'
Vue.use(SocialSharing);
Vue.use(VueMaterial)
Vue.use(VueAwesomeSwiper)
Vue.use(Collapse)


Vue.material.registerTheme(window.themes);
Vue.material.setCurrentTheme(window.theme);

Vue.directive("person", {
    update: function(el, bindings, vnode) {
        var ina = false;
        const s = JSON.parse(el.getAttribute("spec"))[0];
        const br = JSON.parse(el.getAttribute("spec"))[1];
        var in_s = (vnode.context.$data.s_service==0) ? true : (s.indexOf(parseInt(vnode.context.$data.s_service)) != -1);
        var in_b = (vnode.context.$data.s_branch==0) ? true : (br.indexOf(parseInt(vnode.context.$data.s_branch)) != -1);
        var ina = in_s && in_b;
        if (ina) {
            el.classList.add("found");
        } else {
            el.classList.remove("found");
        };
    }
});

var app = new Vue({
    components: {Collapse},
    delimiters: ['${', '}'],
    el: '#app',
    data: {
        feedbackServices:[],
        message: 'You loaded this page on ' + new Date(),
        show: false,
        searchQuery:'',
        loaded: false,
        showSearchbar:false,
        s_service:0,
        s_branch:0,
    },
    created: function () {
        this.loaded = true;
        console.log('LOADED');
    },
    mounted: function () {
        //this.$refs.rightSidenav.open();
    },
    methods: {
        submenuClicked: function (tab) {
            console.log("TABB");
            window.location.href = tab;
        },
        showSearch:function(){
            this.showSearchbar = true;
        },
        hideSearch:function(){
            this.showSearchbar = false;
        },
        toggleLeftSidenav: function () {
            this.$refs.leftSidenav.toggle();
        },
        toggleRightSidenav: function () {
            this.$refs.rightSidenav.toggle();
            this.$refs.leftSidenav.close();
        },
        closeRightSidenav: function () {
            this.$refs.rightSidenav.close();
        },
        open: function (ref) {
            console.log('Opened: ' + ref);
        },
        close: function (ref) {
            console.log('Closed: ' + ref);
        },
        openDialog: function (ref) {
            this.$refs[ref].open();
        },
        closeDialog: function (ref) {
            this.$refs[ref].close();
        }
    }
});


import './../app/styles/index.scss'



