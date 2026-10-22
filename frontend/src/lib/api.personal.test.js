// @vitest-environment happy-dom
import { expect, it, vi } from 'vitest'
vi.mock('./demo.js', () => ({ PERSONAL: true }))
import { api } from './api.js'

it('rejects server requests before sending any local training records', async () => {
  const fetch = vi.spyOn(globalThis, 'fetch')
  try {
    await expect(api('/api/data', { method: 'PUT', body: '{}' })).rejects.toMatchObject({ code: 'local-only' })
    expect(fetch).not.toHaveBeenCalled()
  } finally { fetch.mockRestore() }
})
