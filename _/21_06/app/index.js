import Vue from 'vue'
import hello from './components/hello.vue'

var app = new Vue({
    el: '#app',
    components: {
        hello: hello
    }
})