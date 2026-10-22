// @vitest-environment happy-dom
import { afterEach, beforeEach, expect, it, vi } from 'vitest'

vi.mock('../lib/demo.js', () => ({ PERSONAL: true, DEMO: false, DEMO_SEEDED: 'gym_demo_seeded_v1', REPO: '' }))
vi.mock('../lib/api.js', () => ({ api: vi.fn(), setRemoteAuth: vi.fn() }))
vi.mock('./useUI.js', () => ({ useUI: { getState: () => ({ toast: vi.fn() }) } }))
import { api } from '../lib/api.js'

beforeEach(() => { localStorage.clear(); vi.resetModules(); vi.clearAllMocks() })
afterEach(() => { localStorage.clear() })

it('starts empty and never contacts an account server', async () => {
  const { useStore } = await import('./useStore.js')
  await useStore.getState().boot()
  expect(useStore.getState().ready).toBe(true)
  expect(useStore.getState().isGuest()).toBe(true)
  expect(useStore.getState().S.workouts).toEqual([])
  expect(useStore.getState().S.routines).toEqual([])
  expect(api).not.toHaveBeenCalled()
})

it('preserves real records without a demo marker, even after repeated boot and demo reset', async () => {
  const workouts = [{ id: 'real', d: '2026-10-22', entries: [] }]
  localStorage.setItem('gym_state_v1', JSON.stringify({ workouts, bodyweight: [{ d: '2026-10-22', w: 70 }] }))
  localStorage.setItem('gym_user', JSON.stringify({ id: 'stale-account' }))
  const { useStore } = await import('./useStore.js')
  expect(useStore.getState().user).toBeNull()
  await useStore.getState().boot()
  await useStore.getState().boot()
  await useStore.getState().resetDemo()
  expect(useStore.getState().S.workouts).toEqual(workouts)
  expect(useStore.getState().S.bodyweight).toEqual([{ d: '2026-10-22', w: 70 }])
  expect(localStorage.getItem('gym_demo_seeded_v1')).toBeNull()
  expect(api).not.toHaveBeenCalled()
})

it('keeps saved changes after reopening and stays empty after an intentional reset', async () => {
  let { useStore } = await import('./useStore.js')
  await useStore.getState().boot()
  useStore.getState().update(s => { s.bodyweight = [{ d: '2026-10-22', w: 71 }] })
  vi.resetModules()
  ;({ useStore } = await import('./useStore.js'))
  await useStore.getState().boot()
  expect(useStore.getState().S.bodyweight).toEqual([{ d: '2026-10-22', w: 71 }])
  useStore.getState().resetEverything()
  await useStore.getState().boot()
  expect(useStore.getState().S.bodyweight).toEqual([])
  expect(useStore.getState().S.workouts).toEqual([])
  expect(api).not.toHaveBeenCalled()
})
