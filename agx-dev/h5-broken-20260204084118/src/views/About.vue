<template>
  <div class="about-page">
    <!-- 顶部标题栏 -->
    <div class="page-header">
      <button class="back-btn" @click="$router.back()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
      </button>
      <div class="header-title">
        <span>{{ $t('about.title') }}</span>
        <span class="header-subtitle">{{ $t('about.subtitle') }}</span>
      </div>
      <div class="header-placeholder"></div>
    </div>

    <!-- 背景装饰 -->
    <div class="page-bg"></div>

    <!-- 主内容区 -->
    <div class="page-content">
      <!-- 品牌卡片 -->
      <div class="brand-card">
        <div class="card-glow"></div>
        <div class="brand-inner">
          <img src="/agx-new.png" class="brand-logo" alt="AGX">
          <h1 class="brand-name">Ascenda</h1>
          <p class="brand-tagline">{{ $t('about.tagline') }}</p>
          <div class="brand-badges">
            <div class="badge-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
              </svg>
              <span>{{ $t('about.msbLicensed') }}</span>
            </div>
            <div class="badge-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span>{{ $t('about.certikAudit') }}</span>
            </div>
            <div class="badge-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span>{{ $t('about.globalService') }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 白皮书 -->
      <section class="section">
        <h3 class="section-title">{{ $t('about.whitepaper') }}</h3>
        <div class="whitepaper-card gold-wp" @click="openCompanyWhitepaper">
          <div class="wp-icon">
            <img src="/book-icon.png" alt="book" class="book-img">
          </div>
          <div class="wp-info">
            <span class="wp-title">{{ $t('about.corpWhitepaper') }}</span>
            <span class="wp-desc">{{ $t('about.corpWhitepaperDesc') }}</span>
          </div>
          <svg class="wp-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </div>
        <div class="whitepaper-card gold-wp" @click="openWhitepaper">
          <div class="wp-icon">
            <img src="/book-icon.png" alt="book" class="book-img">
          </div>
          <div class="wp-info">
            <span class="wp-title">{{ $t('about.agxWhitepaper') }}</span>
            <span class="wp-desc">{{ $t('about.agxWhitepaperDesc') }}</span>
          </div>
          <svg class="wp-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </div>
      </section>

      <!-- 平台简介 -->
      <section class="section">
        <h3 class="section-title">{{ $t('about.platformIntro') }}</h3>
        <div class="content-card">
          <p>{{ $t('about.platformDesc1') }}</p>
          <p>{{ $t('about.platformDesc2') }}</p>
        </div>
      </section>

      <!-- AGX 代币 -->
      <section class="section">
        <h3 class="section-title">{{ $t('about.agxToken') }}</h3>
        <div class="content-card">
          <p>{{ $t('about.agxTokenDesc') }}</p>
        </div>
      </section>

      <!-- 核心优势 -->
      <section class="section">
        <h3 class="section-title">{{ $t('about.coreAdvantages') }}</h3>
        <div class="advantage-grid">
          <div class="advantage-card">
            <div class="adv-num">01</div>
            <h4>{{ $t('about.adv1Title') }}</h4>
            <p>{{ $t('about.adv1Desc') }}</p>
          </div>
          <div class="advantage-card">
            <div class="adv-num">02</div>
            <h4>{{ $t('about.adv2Title') }}</h4>
            <p>{{ $t('about.adv2Desc') }}</p>
          </div>
          <div class="advantage-card">
            <div class="adv-num">03</div>
            <h4>{{ $t('about.adv3Title') }}</h4>
            <p>{{ $t('about.adv3Desc') }}</p>
          </div>
          <div class="advantage-card">
            <div class="adv-num">04</div>
            <h4>{{ $t('about.adv4Title') }}</h4>
            <p>{{ $t('about.adv4Desc') }}</p>
          </div>
        </div>
      </section>

      <!-- 安全审计 -->
      <section class="section">
        <h3 class="section-title">{{ $t('about.securityAudit') }}</h3>
        <div class="audit-grid">
          <div class="audit-card">
            <span class="audit-name">CertiK</span>
            <span class="audit-type">{{ $t('about.smartContract') }}</span>
          </div>
          <div class="audit-card">
            <span class="audit-name">慢雾</span>
            <span class="audit-type">{{ $t('about.systemSecurity') }}</span>
          </div>
          <div class="audit-card">
            <span class="audit-name">Hacken</span>
            <span class="audit-type">{{ $t('about.penTest') }}</span>
          </div>
        </div>
      </section>

      <!-- 监管牌照 -->
      <section class="section">
        <h3 class="section-title">{{ $t('about.licenses') }}</h3>
        <div class="license-grid">
          <div 
            class="license-card" 
            v-for="(license, index) in licenses" 
            :key="index"
            @click="openLicense(license)"
          >
            <div class="license-icon">
              <img :src="license.logo" :alt="license.regulator" class="regulator-logo">
              <span class="verified-badge" v-if="license.hasFile">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
              </span>
            </div>
            <div class="license-info">
              <div class="license-header">
                <span class="license-code">{{ license.code }}</span>
                <span class="license-fullname">{{ license.fullName }}</span>
              </div>
              <div class="license-regulator">
                <span class="regulator-name">{{ license.regulator }}</span>
                <span class="regulator-region">{{ license.region }}</span>
              </div>
            </div>
            <svg class="license-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </div>
        </div>
      </section>

      <!-- 牌照弹窗 -->
      <div class="license-modal" v-if="showLicenseModal" @click.self="closeLicenseModal">
        <div class="modal-content">
          <button class="modal-close" @click="closeLicenseModal">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
          
          <!-- 证书卡片 -->
          <div class="cert-card">
            <div class="cert-border">
              <div class="cert-inner">
                <!-- 证书头部 -->
                <div class="cert-header">
                  <div class="cert-logo-wrapper">
                    <img 
                      v-if="currentLicense?.logo" 
                      :src="currentLicense.logo" 
                      :alt="currentLicense.regulator" 
                      class="cert-logo"
                      @error="handleLogoError"
                    >
                    <div v-else class="cert-logo-fallback">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <rect x="3" y="4" width="18" height="16" rx="2"/>
                        <path d="M7 8h10M7 12h6"/>
                      </svg>
                    </div>
                  </div>
                  <div class="cert-title">
                    <span class="cert-region">{{ currentLicense?.region }}</span>
                    <h3>{{ currentLicense?.regulatorFull }}</h3>
                  </div>
                </div>
                
                <!-- 证书主体 -->
                <div class="cert-body">
                  <div class="cert-type">
                    <span class="type-label">LICENSE TYPE</span>
                    <!-- 有logo显示logo，没有显示文字 -->
                    <img v-if="currentLicense?.logo" :src="currentLicense.logo" class="type-logo" :alt="currentLicense.code" @error="handleLogoError">
                    <span v-else class="type-value">{{ currentLicense?.code }}</span>
                    <span class="type-full">{{ currentLicense?.fullName }}</span>
                  </div>
                  
                  <div class="cert-divider"></div>
                  
                  <div class="cert-info-grid">
                    <div class="cert-info-item">
                      <span class="info-label">Registration No.</span>
                      <span class="info-value">{{ currentLicense?.certInfo?.regNo }}</span>
                    </div>
                    <div class="cert-info-item">
                      <span class="info-label">Issue Date</span>
                      <span class="info-value">{{ currentLicense?.certInfo?.issueDate }}</span>
                    </div>
                    <div class="cert-info-item full">
                      <span class="info-label">Licensed Entity</span>
                      <span class="info-value">{{ currentLicense?.certInfo?.entity }}</span>
                    </div>
                  </div>
                </div>
                
                <!-- 证书底部 -->
                <div class="cert-footer">
                  <div class="cert-status">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <span>{{ currentLicense?.certInfo?.status }}</span>
                  </div>
                  <div class="cert-seal">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M12 6v6l4 2"/>
                    </svg>
                    <span>VERIFIED</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 查看原件按钮 -->
          <button class="modal-btn" v-if="currentLicense?.hasFile" @click="viewLicenseFile">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <path d="M14 2v6h6"/>
            </svg>
            {{ $t('about.viewOriginal') }}
          </button>
        </div>
      </div>

      <!-- 全屏文件查看器 -->
      <div class="fullscreen-viewer" v-if="showFullScreenViewer">
        <div class="fullscreen-header">
          <button class="fullscreen-close" @click="closeFullScreenViewer">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
          <span class="fullscreen-title">{{ currentLicense?.code }} - {{ currentLicense?.regulator }}</span>
          <div class="fullscreen-placeholder"></div>
        </div>
        <div class="fullscreen-body">
          <!-- 防截屏水印层 -->
          <div class="watermark-layer">
            <span>AGX CONFIDENTIAL</span>
            <span>AGX CONFIDENTIAL</span>
            <span>AGX CONFIDENTIAL</span>
          </div>
          <!-- PDF文件用iframe并隐藏工具栏 -->
          <iframe 
            v-if="currentLicense?.file?.endsWith('.pdf')" 
            :src="currentLicense?.file + '#toolbar=0&navpanes=0&scrollbar=0'" 
            class="fullscreen-iframe"
          ></iframe>
          <!-- HTML文件用普通iframe -->
          <iframe 
            v-else 
            :src="currentLicense?.file" 
            class="fullscreen-iframe"
          ></iframe>
        </div>
      </div>

      <!-- 公司文件 -->
      <section class="section">
        <h3 class="section-title">{{ $t('about.companyDocs') }}</h3>
        <div class="company-docs">
          <div class="company-header">
            <div class="company-logo">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M3 21h18M3 7v1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7H3l2-4h14l2 4M5 21V10.85M19 21V10.85"/>
              </svg>
            </div>
            <div class="company-info">
              <span class="company-name">{{ $t('about.companyName') }}</span>
              <span class="company-type">{{ $t('about.companyRegion') }}</span>
            </div>
            <div class="company-badge">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
              <span>{{ $t('about.verified') }}</span>
            </div>
          </div>
          <div class="docs-list">
            <div 
              class="doc-item" 
              v-for="(doc, index) in companyDocs" 
              :key="index"
              @click="openDoc(doc)"
            >
              <div class="doc-icon-wrapper">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <path d="M14 2v6h6"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                </svg>
              </div>
              <div class="doc-details">
                <span class="doc-title">{{ doc.name }}</span>
                <span class="doc-subtitle">{{ doc.nameEn }}</span>
              </div>
              <div class="doc-action">
                <span>{{ $t('about.viewDoc') }}</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                  <polyline points="15 3 21 3 21 9"/>
                  <line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 文档弹窗 -->
      <div class="doc-modal" v-if="showDocModal" @click.self="closeDocModal">
        <div class="doc-modal-content">
          <div class="doc-modal-header">
            <div class="doc-modal-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <path d="M14 2v6h6"/>
              </svg>
              <div class="doc-modal-info">
                <h3>{{ currentDoc?.name }}</h3>
                <span>{{ currentDoc?.nameEn }}</span>
              </div>
            </div>
            <button class="doc-modal-close" @click="closeDocModal">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <div class="doc-modal-body">
            <iframe :src="currentDoc?.file" class="doc-iframe"></iframe>
          </div>
        </div>
      </div>

      <!-- 底部 -->
      <div class="footer">
        <div class="legal-links">
          <a @click="$router.push('/agreement')">{{ $t('about.userAgreement') }}</a>
          <span>·</span>
          <a @click="$router.push('/privacy')">{{ $t('about.privacyPolicy') }}</a>
          <span>·</span>
          <a @click="$router.push('/disclaimer')">{{ $t('about.disclaimer') }}</a>
        </div>
        <div class="copyright">
          <p>Ascenda Global Limited</p>
          <p>© 2024 All Rights Reserved</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const router = useRouter()

// 监听来自 iframe 的关闭消息
const handleMessage = (event) => {
  if (event.data === 'closeLicense') {
    closeFullScreenViewer()
    closeDocModal()  // 同时关闭文档弹窗
  }
}

onMounted(() => {
  window.addEventListener('message', handleMessage)
})

onUnmounted(() => {
  window.removeEventListener('message', handleMessage)
})

const openWhitepaper = () => {
  router.push('/whitepaper')
}

const openCompanyWhitepaper = () => {
  router.push('/company-whitepaper')
}

// 牌照数据
const licenses = [
  {
    code: 'MSB',
    fullName: 'Money Services Business',
    region: '美国',
    regulator: 'FinCEN',
    regulatorFull: 'Financial Crimes Enforcement Network',
    logo: '/licenses/logo.png',
    file: '/licenses/msb_AstralAI Quantitative Technologies Inc (2).pdf',
    hasFile: true,
    fullScreen: true,
    certInfo: {
      regNo: '31000254541283',
      entity: 'AstralAI Quantitative Technologies Inc',
      issueDate: '2024-03-15',
      status: 'Active'
    }
  },
  {
    code: 'NFA',
    fullName: 'National Futures Association',
    region: '美国',
    regulator: 'NFA',
    regulatorFull: 'National Futures Association',
    logo: '/licenses/5ff00330065946589.jpg',
    file: '/licenses/nfa-certificate.html',
    hasFile: true,
    certInfo: {
      regNo: '0562847',
      entity: 'Ascenda Global Trading LLC',
      issueDate: '2024-01-20',
      status: 'Active'
    }
  },
  {
    code: 'MSB',
    fullName: 'Money Services Business',
    region: '加拿大',
    regulator: 'FINTRAC',
    regulatorFull: 'Financial Transactions and Reports Analysis Centre of Canada',
    logo: '/licenses/fintrac-logo.png',
    file: '/licenses/fintrac-certificate.html',
    hasFile: true,
    certInfo: {
      regNo: 'M23648571',
      entity: 'Ascenda Financial Services Ltd',
      issueDate: '2024-02-28',
      status: 'Active'
    }
  },
  {
    code: 'FCA',
    fullName: 'Financial Conduct Authority',
    region: '英国',
    regulator: 'FCA',
    regulatorFull: 'Financial Conduct Authority',
    logo: '/licenses/image_2026-01-11_11-00-00.png',
    file: '/licenses/fca-certificate.html',
    hasFile: true,
    certInfo: {
      regNo: 'FRN 925481',
      entity: 'Ascenda UK Limited',
      issueDate: '2024-04-10',
      status: 'Authorised'
    }
  },
  {
    code: 'DCE',
    fullName: 'Digital Currency Exchange',
    region: '澳大利亚',
    regulator: 'AUSTRAC',
    regulatorFull: 'Australian Transaction Reports and Analysis Centre',
    logo: '/licenses/austrac-logo.svg',
    file: '/licenses/austrac-certificate.html',
    hasFile: true,
    certInfo: {
      regNo: 'DCE100789456',
      entity: 'Ascenda Australia Pty Ltd',
      issueDate: '2024-05-22',
      status: 'Registered'
    }
  }
]

// 公司文件数据
const companyDocs = [
  {
    name: '公司注册证书',
    nameEn: 'Certificate of Incorporation',
    file: '/licenses/company-ci.html'
  },
  {
    name: '公司章程',
    nameEn: 'Memorandum & Articles',
    file: '/licenses/company-maa.html'
  },
  {
    name: '高管登记',
    nameEn: 'Register of Officers',
    file: '/licenses/company-officers.html'
  }
]

// 弹窗状态
const showLicenseModal = ref(false)
const currentLicense = ref(null)
const showLicenseFile = ref(false)
const showFullScreenViewer = ref(false)

const openLicense = (license) => {
  currentLicense.value = license
  showLicenseModal.value = true
  showLicenseFile.value = false
}

const closeLicenseModal = () => {
  showLicenseModal.value = false
  currentLicense.value = null
  showLicenseFile.value = false
}

const closeFullScreenViewer = () => {
  showFullScreenViewer.value = false
}

const handleLogoError = (e) => {
  // Logo加载失败时隐藏img元素
  e.target.style.display = 'none'
  // 显示fallback
  const wrapper = e.target.parentElement
  if (wrapper) {
    const fallback = wrapper.querySelector('.cert-logo-fallback')
    if (fallback) fallback.style.display = 'flex'
  }
}

const viewLicenseFile = () => {
  if (currentLicense.value?.file) {
    // 所有牌照都用全屏显示
    showFullScreenViewer.value = true
    showLicenseModal.value = false
  }
}

// 文档弹窗状态
const showDocModal = ref(false)
const currentDoc = ref(null)

const openDoc = (doc) => {
  currentDoc.value = doc
  showDocModal.value = true
}

const closeDocModal = () => {
  showDocModal.value = false
  currentDoc.value = null
}
</script>

<style scoped>
.about-page {
  min-height: 100vh;
  background: linear-gradient(180deg, var(--bg-base-dark, #0D1117) 0%, var(--bg-base, #0B0E11) 100%);
  color: var(--text-primary, #EAECEF);
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
}

/* 顶部标题栏 */
.page-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  max-width: 428px;
  margin: 0 auto;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  padding-top: env(safe-area-inset-top, 0px);
  background: rgba(10, 12, 16, 0.92);
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  border-bottom: 1px solid rgba(200, 170, 110, 0.12);
  z-index: 100;
}

.back-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-primary, #E6EDF3);
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s;
}

.back-btn:active {
  background: rgba(200, 170, 110, 0.2);
  transform: scale(0.95);
}

.back-btn svg {
  width: 20px;
  height: 20px;
}

.header-title {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.header-title span:first-child {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary, #EAECEF);
  letter-spacing: -0.3px;
}

.header-subtitle {
  font-size: 10px;
  color: var(--color-brand, #C8AA6E);
  font-weight: 600;
  letter-spacing: 1px;
}

.header-placeholder {
  width: 40px;
}

/* 背景装饰 */
.page-bg {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  max-width: 428px;
  margin: 0 auto;
  background:
    radial-gradient(ellipse at top right, rgba(200, 170, 110, 0.06) 0%, transparent 50%),
    radial-gradient(ellipse at bottom left, rgba(200, 170, 110, 0.04) 0%, transparent 50%);
  pointer-events: none;
  z-index: 0;
}

/* 主内容 */
.page-content {
  position: relative;
  z-index: 1;
  padding: 72px 12px calc(40px + env(safe-area-inset-bottom)) 12px;
}

/* 品牌卡片 */
.brand-card {
  position: relative;
  padding: 28px 20px;
  margin-bottom: 16px;
  background: linear-gradient(135deg, rgba(30, 38, 50, 0.95), rgba(22, 27, 34, 0.9));
  border: 1px solid rgba(200, 170, 110, 0.2);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05);
  overflow: hidden;
}

.card-glow {
  position: absolute;
  top: -40px;
  right: -40px;
  width: 160px;
  height: 160px;
  background: radial-gradient(circle at center, rgba(200, 170, 110, 0.15) 0%, transparent 70%);
  pointer-events: none;
}

.brand-inner {
  position: relative;
  z-index: 1;
  text-align: center;
}

.brand-logo {
  width: 72px;
  height: 72px;
  border-radius: 18px;
  margin-bottom: 16px;
  box-shadow: 0 4px 20px rgba(200, 170, 110, 0.2);
}

.brand-name {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary, #E6EDF3);
  margin: 0 0 6px;
  letter-spacing: 2px;
}

.brand-tagline {
  font-size: 13px;
  color: var(--text-secondary, #8B949E);
  margin: 0 0 18px;
  font-weight: 500;
}

.brand-badges {
  display: flex;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
}

.badge-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.25);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.badge-item svg {
  width: 16px;
  height: 16px;
  color: var(--color-up, #22c55e);
  flex-shrink: 0;
}

.badge-item span {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-up, #22c55e);
  white-space: nowrap;
}

.badge {
  font-size: 10px;
  font-weight: 600;
  color: var(--color-brand, #C8AA6E);
  padding: 6px 14px;
  background: rgba(200, 170, 110, 0.1);
  border: 1px solid rgba(200, 170, 110, 0.25);
  border-radius: 20px;
}

/* 区块 */
.section {
  margin-bottom: 16px;
}

.section-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--color-brand, #C8AA6E);
  margin: 0 0 10px 4px;
  letter-spacing: 0.5px;
}

/* 内容卡片 */
.content-card {
  padding: 16px;
  background: linear-gradient(135deg, rgba(30, 38, 50, 0.95), rgba(22, 27, 34, 0.9));
  border: 1px solid rgba(200, 170, 110, 0.12);
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
}

.content-card p {
  font-size: 13px;
  color: var(--text-secondary, #8B949E);
  line-height: 1.75;
  margin: 0 0 12px;
}

.content-card p:last-of-type {
  margin-bottom: 0;
}

/* 信息网格 */
.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
}

.info-label {
  font-size: 10px;
  color: var(--text-quaternary, #5E6673);
  font-weight: 500;
}

.info-value {
  font-size: 13px;
  color: var(--text-primary, #E6EDF3);
  font-weight: 600;
}

/* 优势网格 */
.advantage-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.advantage-card {
  padding: 16px;
  background: linear-gradient(135deg, rgba(30, 38, 50, 0.95), rgba(22, 27, 34, 0.9));
  border: 1px solid rgba(200, 170, 110, 0.12);
  border-radius: 14px;
  text-align: center;
}

.adv-num {
  font-size: 20px;
  font-weight: 800;
  color: var(--color-brand, #C8AA6E);
  opacity: 0.6;
  margin-bottom: 8px;
}

.advantage-card h4 {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary, #E6EDF3);
  margin: 0 0 4px;
}

.advantage-card p {
  font-size: 11px;
  color: var(--text-quaternary, #5E6673);
  margin: 0;
}

/* 审计网格 */
.audit-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.audit-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 14px 10px;
  background: linear-gradient(135deg, rgba(30, 38, 50, 0.95), rgba(22, 27, 34, 0.9));
  border: 1px solid rgba(200, 170, 110, 0.12);
  border-radius: 12px;
  text-align: center;
}

.audit-name {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary, #E6EDF3);
}

.audit-type {
  font-size: 10px;
  color: var(--color-brand, #C8AA6E);
  font-weight: 500;
}

/* 牌照网格 */
.license-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.license-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  background: linear-gradient(135deg, rgba(30, 38, 50, 0.95), rgba(22, 27, 34, 0.9));
  border: 1px solid rgba(200, 170, 110, 0.15);
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.license-card:active {
  background: rgba(200, 170, 110, 0.1);
  transform: scale(0.98);
}

.license-icon {
  position: relative;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
  border-radius: 12px;
}

.regulator-logo {
  width: 48px;
  height: 48px;
  object-fit: contain;
}

.verified-badge {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 18px;
  height: 18px;
  background: linear-gradient(135deg, var(--color-up, #22c55e), #16a34a);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--bg-base-dark, #161B22);
}

.verified-badge svg {
  width: 10px;
  height: 10px;
  color: var(--text-on-brand, #fff);
}

.license-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.license-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.license-code {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-brand, #C8AA6E);
}

.license-fullname {
  font-size: 12px;
  color: var(--text-secondary, #8B949E);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.license-regulator {
  display: flex;
  align-items: center;
  gap: 8px;
}

.regulator-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary, #E6EDF3);
}

.regulator-region {
  font-size: 11px;
  color: var(--text-quaternary, #5E6673);
  padding: 2px 8px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 4px;
}

.license-arrow {
  width: 18px;
  height: 18px;
  color: var(--text-quaternary, #5E6673);
  flex-shrink: 0;
}

/* 牌照弹窗 */
.license-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  max-width: 428px;
  margin: 0 auto;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 200;
}

.modal-content {
  width: 100%;
  max-width: 340px;
  max-height: 85vh;
  overflow-y: auto;
  background: linear-gradient(135deg, var(--layer-surface-1, #1E2632) 0%, var(--bg-base-dark, #161B22) 100%);
  border: 1px solid rgba(200, 170, 110, 0.2);
  border-radius: 20px;
  padding: 20px;
  padding-top: 50px;
  position: relative;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
}

.modal-close {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  color: var(--text-primary, #E6EDF3);
  cursor: pointer;
  z-index: 10;
}

.modal-close:active {
  background: rgba(200, 170, 110, 0.2);
  transform: scale(0.95);
}

.modal-close svg {
  width: 18px;
  height: 18px;
}

.modal-header {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.modal-logo {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  object-fit: contain;
}

.modal-title h3 {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-brand, #C8AA6E);
  margin: 0 0 4px;
}

.modal-title span {
  font-size: 12px;
  color: var(--text-secondary, #8B949E);
}

.modal-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.modal-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
}

.row-label {
  font-size: 10px;
  color: var(--text-quaternary, #5E6673);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.row-value {
  font-size: 14px;
  color: var(--text-primary, #E6EDF3);
  font-weight: 600;
}

.row-value.small {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-secondary, #8B949E);
  line-height: 1.5;
}

/* 牌照PDF查看器 */
.license-file-viewer {
  width: 100%;
  height: 380px;
  margin-bottom: 16px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(200, 170, 110, 0.2);
}

.license-iframe {
  width: 100%;
  height: 100%;
  border: none;
  background: var(--bg-light, #fff);
}

/* 全屏PDF查看器 */
.fullscreen-viewer {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  max-width: 428px;
  margin: 0 auto;
  background: var(--bg-base-dark, #0D1117);
  z-index: 300;
  display: flex;
  flex-direction: column;
}

.fullscreen-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  padding-top: calc(12px + env(safe-area-inset-top));
  background: rgba(10, 12, 16, 0.98);
  border-bottom: 1px solid rgba(200, 170, 110, 0.15);
}

.fullscreen-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-brand, #C8AA6E);
  flex: 1;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.fullscreen-placeholder {
  width: 40px;
  flex-shrink: 0;
}

.fullscreen-close {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  color: var(--text-primary, #E6EDF3);
  cursor: pointer;
  flex-shrink: 0;
}

.fullscreen-close:active {
  background: rgba(200, 170, 110, 0.2);
  transform: scale(0.95);
}

.fullscreen-close svg {
  width: 20px;
  height: 20px;
}

.fullscreen-body {
  flex: 1;
  padding: 12px;
  padding-bottom: calc(12px + env(safe-area-inset-bottom));
}

.fullscreen-iframe {
  width: 100%;
  height: 100%;
  border: 1px solid rgba(200, 170, 110, 0.15);
  border-radius: 12px;
  background: var(--bg-light, #fff);
}

/* 防截屏水印层 */
.watermark-layer {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-around;
  overflow: hidden;
}

.watermark-layer span {
  font-size: 28px;
  font-weight: bold;
  color: rgba(0, 0, 0, 0.04);
  transform: rotate(-25deg);
  white-space: nowrap;
  letter-spacing: 10px;
}

.fullscreen-body {
  position: relative;
}

.modal-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 14px;
  background: linear-gradient(135deg, rgba(200, 170, 110, 0.2), rgba(200, 170, 110, 0.1));
  border: 1px solid rgba(200, 170, 110, 0.3);
  border-radius: 12px;
  color: var(--color-brand, #C8AA6E);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.modal-btn:active {
  background: rgba(200, 170, 110, 0.25);
  transform: scale(0.98);
}

.modal-btn svg {
  width: 20px;
  height: 20px;
}

.modal-notice {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  color: var(--text-quaternary, #5E6673);
  font-size: 13px;
}

.modal-notice svg {
  width: 18px;
  height: 18px;
}

/* 证书卡片 */
.cert-card {
  margin-bottom: 12px;
}

.cert-border {
  background: linear-gradient(135deg, rgba(200, 170, 110, 0.3), rgba(200, 170, 110, 0.1));
  border-radius: 16px;
  padding: 2px;
}

.cert-inner {
  background: linear-gradient(180deg, var(--layer-surface-1, #1a1f2a) 0%, var(--bg-base-dark, #141820) 100%);
  border-radius: 14px;
  padding: 16px;
  position: relative;
  overflow: hidden;
}

.cert-inner::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 20%, rgba(200, 170, 110, 0.05) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(200, 170, 110, 0.03) 0%, transparent 50%);
  pointer-events: none;
}

.cert-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  position: relative;
  z-index: 1;
}

.cert-logo-wrapper {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  position: relative;
}

.cert-logo {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  object-fit: contain;
  background: rgba(255, 255, 255, 0.08);
  padding: 5px;
  border: 1px solid rgba(200, 170, 110, 0.2);
}

.cert-logo-fallback {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(200, 170, 110, 0.2);
  display: none;
  align-items: center;
  justify-content: center;
  color: var(--color-brand, #C8AA6E);
}

.cert-logo-fallback svg {
  width: 24px;
  height: 24px;
}

.cert-title {
  flex: 1;
  min-width: 0;
}

.cert-region {
  font-size: 10px;
  font-weight: 600;
  color: var(--color-brand, #C8AA6E);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.cert-title h3 {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-secondary, #8B949E);
  margin: 4px 0 0;
  line-height: 1.4;
}

.cert-body {
  position: relative;
  z-index: 1;
}

.cert-type {
  text-align: center;
  padding: 12px 0;
}

.type-label {
  display: block;
  font-size: 9px;
  font-weight: 600;
  color: var(--text-quaternary, #5E6673);
  letter-spacing: 2px;
  margin-bottom: 6px;
}

.type-logo {
  display: block;
  width: 100px;
  height: 45px;
  object-fit: contain;
  margin: 8px auto 12px;
  border-radius: 6px;
}

.type-value {
  display: block;
  font-size: 32px;
  font-weight: 800;
  color: var(--color-brand, #C8AA6E);
  letter-spacing: 4px;
  text-shadow: 0 2px 10px rgba(200, 170, 110, 0.3);
}

.type-full {
  display: block;
  font-size: 11px;
  color: var(--text-secondary, #8B949E);
  margin-top: 4px;
}

.cert-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(200, 170, 110, 0.3), transparent);
  margin: 12px 0;
}

.cert-info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.cert-info-item {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  padding: 10px;
}

.cert-info-item.full {
  grid-column: 1 / -1;
}

.cert-info-item .info-label {
  display: block;
  font-size: 9px;
  font-weight: 600;
  color: var(--text-quaternary, #5E6673);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.cert-info-item .info-value {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary, #E6EDF3);
}

.cert-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  position: relative;
  z-index: 1;
}

.cert-status {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(22, 163, 74, 0.1));
  border: 1px solid rgba(34, 197, 94, 0.3);
  border-radius: 20px;
}

.cert-status svg {
  width: 14px;
  height: 14px;
  color: var(--color-up, #22c55e);
}

.cert-status span {
  font-size: 11px;
  font-weight: 600;
  color: var(--color-up, #22c55e);
}

.cert-seal {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  opacity: 0.5;
}

.cert-seal svg {
  width: 20px;
  height: 20px;
  color: var(--color-brand, #C8AA6E);
}

.cert-seal span {
  font-size: 8px;
  font-weight: 700;
  color: var(--color-brand, #C8AA6E);
  letter-spacing: 1px;
}

/* 白皮书卡片 */
.whitepaper-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  background: linear-gradient(135deg, rgba(30, 38, 50, 0.95), rgba(22, 27, 34, 0.9));
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.whitepaper-card:active {
  background: rgba(30, 38, 50, 0.8);
  transform: scale(0.98);
}

/* 白皮书卡片 - 毛玻璃风格 */
.whitepaper-card.gold-wp {
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

.whitepaper-card.gold-wp + .whitepaper-card.gold-wp {
  margin-top: 12px;
}

.whitepaper-card.gold-wp .wp-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(165deg, rgba(50, 55, 65, 0.95) 0%, rgba(28, 32, 40, 0.98) 100%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.08);
  position: relative;
  overflow: hidden;
}

.whitepaper-card.gold-wp .wp-icon::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 50%;
  background: linear-gradient(180deg, rgba(255,255,255,0.05) 0%, transparent 100%);
  border-radius: 14px 14px 0 0;
  pointer-events: none;
}

.whitepaper-card.gold-wp .wp-icon svg {
  width: 22px;
  height: 22px;
  color: var(--color-brand, #C8AA6E);
  stroke: var(--color-brand, #C8AA6E);
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
  position: relative;
  z-index: 1;
}

.whitepaper-card.gold-wp .wp-icon .book-img {
  width: 28px;
  height: 28px;
  object-fit: contain;
}

.whitepaper-card.gold-wp .wp-title {
  color: var(--color-brand, #C8AA6E);
}

.whitepaper-card.gold-wp .wp-desc {
  color: var(--text-quaternary, #5E6673);
}

.wp-icon {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  flex-shrink: 0;
}

.wp-icon svg {
  width: 22px;
  height: 22px;
  color: var(--text-secondary, #8B949E);
}

.wp-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.wp-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary, #E6EDF3);
}

.wp-desc {
  font-size: 11px;
  color: var(--text-quaternary, #5E6673);
}

.wp-arrow {
  width: 18px;
  height: 18px;
  color: var(--text-quaternary, #5E6673);
  flex-shrink: 0;
}

/* 公司文件 */
.company-docs {
  background: linear-gradient(135deg, rgba(30, 38, 50, 0.95), rgba(22, 27, 34, 0.9));
  border: 1px solid rgba(200, 170, 110, 0.15);
  border-radius: 16px;
  overflow: hidden;
}

.company-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: linear-gradient(135deg, rgba(200, 170, 110, 0.08), rgba(200, 170, 110, 0.03));
  border-bottom: 1px solid rgba(200, 170, 110, 0.1);
}

.company-logo {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(165deg, rgba(50, 55, 65, 0.95) 0%, rgba(28, 32, 40, 0.98) 100%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.08);
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
}

.company-logo::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 50%;
  background: linear-gradient(180deg, rgba(255,255,255,0.05) 0%, transparent 100%);
  border-radius: 14px 14px 0 0;
  pointer-events: none;
}

.company-logo svg {
  width: 22px;
  height: 22px;
  color: var(--color-brand, #C8AA6E);
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
  position: relative;
  z-index: 1;
}

.company-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.company-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary, #E6EDF3);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.company-type {
  font-size: 10px;
  color: var(--text-quaternary, #5E6673);
}

.company-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(22, 163, 74, 0.1));
  border: 1px solid rgba(34, 197, 94, 0.3);
  border-radius: 20px;
  flex-shrink: 0;
}

.company-badge svg {
  width: 12px;
  height: 12px;
  color: var(--color-up, #22c55e);
}

.company-badge span {
  font-size: 10px;
  font-weight: 600;
  color: var(--color-up, #22c55e);
}

.docs-list {
  padding: 8px;
}

.doc-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.doc-item:active {
  background: rgba(255, 255, 255, 0.04);
  transform: scale(0.98);
}

.doc-item:not(:last-child) {
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
}

.doc-icon-wrapper {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(165deg, rgba(50, 55, 65, 0.95) 0%, rgba(28, 32, 40, 0.98) 100%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  box-shadow: 0 3px 8px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.06);
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
}

.doc-icon-wrapper::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 50%;
  background: linear-gradient(180deg, rgba(255,255,255,0.04) 0%, transparent 100%);
  border-radius: 12px 12px 0 0;
  pointer-events: none;
}

.doc-icon-wrapper svg {
  width: 18px;
  height: 18px;
  color: var(--color-brand, #C8AA6E);
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
  position: relative;
  z-index: 1;
}

.doc-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.doc-title {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary, #E6EDF3);
}

.doc-subtitle {
  font-size: 10px;
  color: var(--text-quaternary, #5E6673);
}

.doc-action {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  background: rgba(200, 170, 110, 0.08);
  border: 1px solid rgba(200, 170, 110, 0.15);
  border-radius: 6px;
  flex-shrink: 0;
}

.doc-action span {
  font-size: 11px;
  font-weight: 500;
  color: var(--color-brand, #C8AA6E);
}

.doc-action svg {
  width: 12px;
  height: 12px;
  color: var(--color-brand, #C8AA6E);
}

/* 文档弹窗 */
.doc-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  max-width: 428px;
  margin: 0 auto;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  display: flex;
  flex-direction: column;
  z-index: 200;
}

.doc-modal-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, var(--bg-base-dark, #0D1117) 0%, var(--bg-base, #0B0E11) 100%);
}

.doc-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: linear-gradient(135deg, rgba(200, 170, 110, 0.08), rgba(200, 170, 110, 0.03));
  border-bottom: 1px solid rgba(200, 170, 110, 0.15);
}

.doc-modal-title {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.doc-modal-title > svg {
  width: 32px;
  height: 32px;
  color: var(--color-brand, #C8AA6E);
  flex-shrink: 0;
}

.doc-modal-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.doc-modal-info h3 {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary, #E6EDF3);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.doc-modal-info span {
  font-size: 11px;
  color: var(--text-quaternary, #5E6673);
}

.doc-modal-close {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  color: var(--text-primary, #E6EDF3);
  cursor: pointer;
  flex-shrink: 0;
}

.doc-modal-close:active {
  background: rgba(200, 170, 110, 0.2);
  transform: scale(0.95);
}

.doc-modal-close svg {
  width: 20px;
  height: 20px;
}

.doc-modal-body {
  flex: 1;
  padding: 12px;
  padding-bottom: calc(12px + env(safe-area-inset-bottom));
  overflow: hidden;
}

.doc-iframe {
  width: 100%;
  height: 100%;
  border: 1px solid rgba(200, 170, 110, 0.15);
  border-radius: 12px;
  background: var(--bg-light, #fff);
}

/* 底部 */
.footer {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.04);
}

.legal-links {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.legal-links a {
  font-size: 11px;
  color: var(--text-quaternary, #5E6673);
  text-decoration: none;
}

.legal-links span {
  color: var(--text-muted, #3D444E);
}

.copyright {
  text-align: center;
}

.copyright p {
  font-size: 10px;
  color: var(--text-muted, #3D444E);
  margin: 0;
  line-height: 1.6;
}
</style>
