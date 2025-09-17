import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export type Widget = {
  id: string
  name: string
  text: string
}

export type Category = {
  id: string
  name: string
  widgets: Widget[]
}

export type DashboardState = {
  categories: Category[]
}
const SAMPLE_JSON: DashboardState = {
  categories: [
    {
      id: 'cspm',
      name: 'CSPM Executive Dashboard',
      widgets: [
        { id: 'w1', name: 'Cloud Accounts', text: 'Cloud accounts summary...' },
        { id: 'w2', name: 'Cloud Account Risk Assessment', text: 'Risk donut chart placeholder' },
      ],
    },
    {
      id: 'cwpp',
      name: 'CWPP Dashboard',
      widgets: [
        { id: 'w3', name: 'Top 5 Namespace Specific Alerts', text: 'No graph data available' },
      ],
    },
  ],
}

const LOCAL_KEY = 'dashboard_state_v1'

function loadInitial(): DashboardState {
  try {
    const raw = localStorage.getItem(LOCAL_KEY)
    if (raw) return JSON.parse(raw) as DashboardState
  } catch (e) {
  }
  return SAMPLE_JSON
}

function persist(state: DashboardState) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(state))
  } catch (e) {
  }
}

const slice = createSlice({
  name: 'dashboard',
  initialState: (typeof window !== 'undefined' ? loadInitial() : SAMPLE_JSON) as DashboardState,
  reducers: {
    addCategory(state, action: PayloadAction<{ id: string; name: string }>) {
      state.categories.push({ id: action.payload.id, name: action.payload.name, widgets: [] })
      persist(state)
    },
    removeCategory(state, action: PayloadAction<{ id: string }>) {
      state.categories = state.categories.filter((c) => c.id !== action.payload.id)
      persist(state)
    },
    addWidget(state, action: PayloadAction<{ categoryId: string; widget: Widget }>) {
      const cat = state.categories.find((c) => c.id === action.payload.categoryId)
      if (cat) {
        cat.widgets.push(action.payload.widget)
        persist(state)
      }
    },
    removeWidget(state, action: PayloadAction<{ categoryId: string; widgetId: string }>) {
      const cat = state.categories.find((c) => c.id === action.payload.categoryId)
      if (cat) {
        cat.widgets = cat.widgets.filter((w) => w.id !== action.payload.widgetId)
        persist(state)
      }
    },
    toggleWidgetInCategory(state, action: PayloadAction<{ categoryId: string; widget: Widget; checked: boolean }>) {
      const cat = state.categories.find((c) => c.id === action.payload.categoryId)
      if (!cat) return
      const exists = cat.widgets.find((w) => w.id === action.payload.widget.id)
      if (action.payload.checked && !exists) cat.widgets.push(action.payload.widget)
      if (!action.payload.checked && exists) cat.widgets = cat.widgets.filter((w) => w.id !== action.payload.widget.id)
      persist(state)
    },
    setAll(state, action: PayloadAction<DashboardState>) {
      state.categories = action.payload.categories
      persist(state)
    },
  },
})

export const { addCategory, removeCategory, addWidget, removeWidget, toggleWidgetInCategory, setAll } = slice.actions
export default slice.reducer
