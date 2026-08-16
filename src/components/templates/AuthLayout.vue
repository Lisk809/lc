<script setup lang="ts">
const features = ['真题讨论与解析分享', '社区共建竞赛题库', '讲义与数据文件归档', '官方公告实时同步']
</script>

<template>
  <div :class="$style.shell">
    <aside :class="$style.panel">
      <div :class="$style.panelInner">
        <RouterLink to="/" :class="$style.brand">
          <img :class="$style.logoMark" src="/logo.png" alt="Lunatic ChO 化竞幻想乡" />
          <span :class="$style.wordmark">Lunatic ChO</span>
          <span :class="$style.kana">ルナティック</span>
        </RouterLink>

        <div :class="$style.copy">
          <p :class="$style.eyebrow">幻想郷 · 化学部</p>
          <h1 :class="$style.tagline">讨论、题库与资料，化学竞赛的一站式社区</h1>
          <ul :class="$style.features">
            <li v-for="(f, i) in features" :key="f">
              <span :class="$style.featureIndex">{{ String(i + 1).padStart(2, '0') }}</span>
              {{ f }}
            </li>
          </ul>
        </div>

        <p :class="$style.footNote">陰陽玉 · 社区标志</p>
      </div>
    </aside>

    <main :class="$style.main">
      <div :class="$style.formWrap">
        <div :class="$style.mobileBrand">
          <img :class="$style.mobileLogoMark" src="/logo.png" alt="Lunatic ChO 化竞幻想乡" />
          <span :class="$style.wordmark">Lunatic ChO</span>
        </div>
        <RouterView v-slot="{ Component }">
          <Transition name="page" mode="out-in">
            <component :is="Component" />
          </Transition>
        </RouterView>
      </div>
    </main>
  </div>
</template>

<style module lang="scss">
.shell {
  display: grid;
  grid-template-columns: minmax(320px, 44%) 1fr;
  min-height: 100dvh;

  @media (max-width: $bp-tablet - 1) {
    grid-template-columns: 1fr;
  }
}

// 左侧品牌面板：固定炭黑 + 弹幕点阵，两套主题下保持一致
.panel {
  display: flex;
  background:
    radial-gradient(circle 1.5px, rgba(249, 250, 251, 0.07) 40%, transparent 46%),
    radial-gradient(circle 2.5px, rgba(249, 250, 251, 0.05) 40%, transparent 46%),
    #18181b;
  background-size: 26px 26px, 44px 44px;
  background-position: 0 0, 13px 17px;
  color: #f9fafb;
  padding: clamp(2rem, 4vw, 4rem);
  min-height: 100dvh;

  @media (max-width: $bp-tablet - 1) {
    display: none;
  }
}

.panelInner {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 440px;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 0.625rem;
}

.wordmark {
  font-family: var(--font-script);
  font-size: 2.125rem;
  font-weight: 400;
  letter-spacing: 0;
  line-height: 1;
}

.logoMark {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  object-fit: cover;
  // 深色面板上给深色底 logo 加浅色描边，避免融进背景
  box-shadow: 0 0 0 1px rgba(249, 250, 251, 0.22);
  transition: transform 0.7s var(--ease-spring);

  @include motion-safe {
    .brand:hover & {
      transform: scale(1.06);
    }
  }
}

.kana {
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  letter-spacing: 0.14em;
  color: rgba(249, 250, 251, 0.4);
  align-self: center;
}

.copy {
  margin-block: auto;
}

.eyebrow {
  margin-bottom: 1.25rem;
  font-family: var(--font-mono);
  font-size: var(--fs-meta);
  letter-spacing: 0.2em;
  color: rgba(249, 250, 251, 0.45);
}

.tagline {
  font-size: clamp(1.75rem, 2.8vw, 2.5rem);
  font-weight: 800;
  letter-spacing: -0.025em;
  line-height: 1.2;
  max-width: 16ch;
}

.features {
  list-style: none;
  margin: 2.5rem 0 0;
  padding: 0;
  display: grid;
  gap: 0.875rem;
}

.features li {
  display: flex;
  align-items: baseline;
  gap: 0.875rem;
  color: rgba(249, 250, 251, 0.72);
  font-size: 0.9688rem;
}

.featureIndex {
  font-family: var(--font-mono);
  font-size: var(--fs-meta);
  color: rgba(249, 250, 251, 0.4);
}

.footNote {
  font-family: var(--font-mono);
  font-size: var(--fs-meta);
  color: rgba(249, 250, 251, 0.4);
}

// 右侧表单区
.main {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1.5rem;
}

.formWrap {
  width: min(440px, 100%);
}

.mobileBrand {
  display: none;

  @media (max-width: $bp-tablet - 1) {
    display: inline-flex;
    align-items: center;
    gap: 0.625rem;
    margin-bottom: 2.5rem;
  }
}

.mobileLogoMark {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  object-fit: cover;
  box-shadow: 0 0 0 1px var(--c-border-strong);
}
</style>
