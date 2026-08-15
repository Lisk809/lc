import { http } from '@/api/http'

/**
 * Pwned Passwords 泄露检查（k-匿名性模型）：
 * 1. 在本地计算密码的 SHA-1（大写十六进制）
 * 2. 只把前 5 位前缀发给后端代理（/api/pwnedpasswords/:prefix）
 * 3. 本地比对返回列表中的后缀，命中即说明密码已出现在数据泄露中
 *
 * 完整哈希与密码本身都不离开浏览器；后端与 HIBP 都只能看到 5 位前缀。
 */

async function sha1Hex(text: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(text))
  return [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase()
}

/**
 * @returns 泄露次数；0 = 未在已知泄露中出现；-1 = 服务不可用（调用方不应阻断流程）
 */
export async function checkPwnedPassword(password: string): Promise<number> {
  try {
    const hex = await sha1Hex(password)
    const suffix = hex.slice(5)
    const text = await http.get<string>(`/api/pwnedpasswords/${hex.slice(0, 5)}`, {
      skipToast: true,
      responseType: 'text',
    })
    for (const line of text.split(/\r?\n/)) {
      const [lineSuffix, count] = line.split(':')
      if (lineSuffix === suffix) return parseInt(count, 10) || 0
    }
    return 0
  } catch {
    return -1
  }
}
