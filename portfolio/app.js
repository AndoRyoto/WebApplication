const { createApp } = Vue;

createApp({
    data() {
        return {
            name: '安東 稜人',
            about: '就活用ポートフォリオ -> Vue.js, GitBashの練習 & メモページ',
            email: 'ryoto2001g@gmail.com',
            currentYear: new Date().getFullYear(),
            workYear: new Date().getFullYear() - 2024,
        }
    },
    methods: {
        goToLink(link) {
            window.open(link, '_blank');
        }
    }
}).mount('#app');
