const { createApp } = Vue;

createApp({
    data() {
        return {
            name: '安東 稜人',
            about: '絶賛就活中の修士1年生．エンジニア志望',
            email: 'andou@agent.inf.kyushu-u.ac.jp',
            currentYear: new Date().getFullYear(),
        }
    },
    methods: {
        goToLink(link) {
            window.open(link, '_blank');
        }
    }
}).mount('#app');
