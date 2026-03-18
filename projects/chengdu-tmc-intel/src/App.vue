<template>
  <div class="app">
    <nav class="nav">
      <h1>🎯 成都商旅情报</h1>
      <div class="nav-links">
        <router-link to="/">📊 数据看板</router-link>
        <router-link to="/tmc-trend">📈 商旅趋势</router-link>
        <router-link to="/competitor">🔥 竞品预警</router-link>
        <router-link to="/input">🏨 酒店录入</router-link>
      </div>
    </nav>
    <main>
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  background: #0f172a;
  color: #e2e8f0;
}
.nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: #1e293b;
  border-bottom: 1px solid #334155;
}
.nav h1 {
  font-size: 1.25rem;
  color: #38bdf8;
}
.nav-links {
  display: flex;
  gap: 1.5rem;
}
.nav-links a {
  color: #94a3b8;
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.2s;
}
.nav-links a:hover,
.nav-links a.router-link-active {
  color: #38bdf8;
}
main {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}
</style>
