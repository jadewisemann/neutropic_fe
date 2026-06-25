import { expect, test } from '@playwright/test'

test('비로그인 사용자는 설문 진입 시 로그인 후 원래 흐름으로 돌아간다', async ({ page }) => {
  await page.goto('/survey')

  await expect(page).toHaveURL(/\/login\?redirect_to=\/survey$/)
  await expect(page.getByRole('heading', { name: '로그인' })).toBeVisible()

  await page.getByPlaceholder('hello@neutripic.app').fill('tester@example.com')
  await page.getByPlaceholder('••••••••').fill('password123')
  await page.getByRole('button', { name: '로그인' }).click()

  await expect(page).toHaveURL(/\/survey$/)
  await expect(page.getByRole('heading', { name: '건강 목표' })).toBeVisible()
})

test('요구사항 기반 추천 리포트 생성과 리포트 채팅 흐름을 완료한다', async ({ page }) => {
  await login(page)

  await page.goto('/survey')
  await expect(page.getByRole('heading', { name: '건강 목표' })).toBeVisible()

  await page.getByText('피로 개선').click()
  await page.getByText('수면 질 개선').click()
  await page.getByRole('button', { name: '다음' }).click()

  await page.getByText('혈압약').click()
  await page.getByRole('button', { name: '다음' }).click()

  await page.getByText('알레르기').click()
  await page.getByRole('button', { name: '다음' }).click()

  await page.getByRole('textbox').fill('카페인을 오후에 자주 마십니다.')
  await page.getByRole('button', { name: '리포트 생성 요청' }).click()

  await expect(page).toHaveURL(/\/reports\/new$/)
  await expect(page.getByRole('heading', { name: '로컬 더미 추천 리포트' })).toBeVisible()
  await expect(page.getByText('핵심 추천 성분')).toBeVisible()
  await expect(page.getByText('의료 면책')).toBeVisible()

  await page.getByPlaceholder('성분에 대해 물어보기…').fill('마그네슘 형태 차이는?')
  await page.getByRole('button', { name: '↑' }).click()

  await expect(page.locator('.chat-panel__message--user', { hasText: '마그네슘 형태 차이는?' })).toBeVisible()
  await expect(page.getByText('로컬 더미 응답입니다. 실제 추천은 백엔드 연결 후 확인해 주세요.')).toBeVisible()
})

test('저장된 리포트 상세에서도 리포트 기반 채팅을 전송할 수 있다', async ({ page }) => {
  await login(page)

  await page.goto('/reports/1')

  await expect(page.getByRole('heading', { name: '로컬 더미 추천 리포트' })).toBeVisible()
  await expect(page.getByText('핵심 추천 성분')).toBeVisible()

  await page.getByPlaceholder('성분에 대해 물어보기…').fill('비타민 D 주의사항 알려줘')
  await page.getByRole('button', { name: '↑' }).click()

  await expect(page.locator('.chat-panel__message--user', { hasText: '비타민 D 주의사항 알려줘' })).toBeVisible()
  await expect(page.getByText('로컬 더미 응답입니다. 실제 추천은 백엔드 연결 후 확인해 주세요.')).toBeVisible()
})

async function login(page) {
  await page.goto('/')
  await page.evaluate(() => {
    window.localStorage.setItem('neutripic.access_token', 'local-dummy-access-token')
    window.localStorage.setItem('neutripic.refresh_token', 'local-dummy-refresh-token')
    window.localStorage.setItem(
      'neutripic.user',
      JSON.stringify({
        id: 1,
        email: 'tester@example.com',
        username: 'tester',
        role: 'user',
      }),
    )
  })
}
