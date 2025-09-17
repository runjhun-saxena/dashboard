import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export type Widget = {
  id: string
  name: string
  text: string
  categoryId: string // Which category this widget belongs to
}

export type Category = {
  id: string
  name: string
  displayedWidgets: string[] // Array of widget IDs that are currently displayed
}

export type DashboardState = {
  categories: Category[]
  availableWidgets: Widget[] // Master list of all widgets
}
const SAMPLE_JSON: DashboardState = {
  categories: [
    {
      id: 'cspm',
      name: 'CSPM Executive Dashboard',
      displayedWidgets: ['w1', 'w2'], // Initially displayed widgets
    },
    {
      id: 'cwpp',
      name: 'CWPP Dashboard',
      displayedWidgets: ['w3'],
    },
    {
      id: 'registry',
      name: 'Registry Scan',
      displayedWidgets: ['w4', 'w5'],
    },
    {
      id: 'ticket',
      name: 'Ticket Dashboard',
      displayedWidgets: ['w6', 'w7'],
    },
    {
      id: 'compliance',
      name: 'Compliance Dashboard',
      displayedWidgets: ['w8', 'w9'],
    },
    {
      id: 'performance',
      name: 'Performance Metrics',
      displayedWidgets: ['w10', 'w11'],
    },
  ],
  availableWidgets: [
    // CSPM widgets
    { id: 'w1', name: 'Cloud Accounts', text: 'Cloud accounts summary...', categoryId: 'cspm' },
    { id: 'w2', name: 'Cloud Account Risk Assessment', text: 'Risk donut chart placeholder', categoryId: 'cspm' },
    
    // CWPP widgets  
    { id: 'w3', name: 'Top 5 Namespace Specific Alerts', text: 'No graph data available', categoryId: 'cwpp' },
    
    // Registry widgets
    { id: 'w4', name: 'Image Risk Assessment', text: 'Registry scan results', categoryId: 'registry' },
    { id: 'w5', name: 'Image Security Issues', text: 'Security vulnerabilities found', categoryId: 'registry' },
    
    // Ticket widgets
    { id: 'w6', name: 'Open Tickets', text: 'Current open support tickets', categoryId: 'ticket' },
    { id: 'w7', name: 'Ticket Trends', text: 'Monthly ticket trends', categoryId: 'ticket' },
    
    // Compliance widgets
    { id: 'w8', name: 'Compliance Score', text: 'Overall compliance rating', categoryId: 'compliance' },
    { id: 'w9', name: 'Policy Violations', text: 'Current policy violations', categoryId: 'compliance' },
    
    // Performance widgets
    { id: 'w10', name: 'System Performance', text: 'Current system metrics', categoryId: 'performance' },
    { id: 'w11', name: 'Resource Utilization', text: 'Resource usage statistics', categoryId: 'performance' },
  ],
}

const LOCAL_KEY = 'dashboard_state_v1'

function migrateOldData(oldData: any): DashboardState {
  // Check if data is in old format (has categories with widgets array)
  if (oldData.categories && !oldData.availableWidgets) {
    const newState: DashboardState = {
      categories: [],
      availableWidgets: []
    };
    
    // Migrate categories and extract widgets
    for (const oldCategory of oldData.categories) {
      if (oldCategory.widgets) {
        // Add category with displayedWidgets instead of widgets
        newState.categories.push({
          id: oldCategory.id,
          name: oldCategory.name,
          displayedWidgets: oldCategory.widgets.map((w: any) => w.id)
        });
        
        // Add widgets to availableWidgets
        for (const widget of oldCategory.widgets) {
          if (!newState.availableWidgets.find(w => w.id === widget.id)) {
            newState.availableWidgets.push({
              ...widget,
              categoryId: oldCategory.id
            });
          }
        }
      }
    }
    
    return newState;
  }
  
  return oldData as DashboardState;
}

function loadInitial(): DashboardState {
  try {
    const raw = localStorage.getItem(LOCAL_KEY)
    if (raw) {
      const data = JSON.parse(raw);
      return migrateOldData(data);
    }
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

export function loadPersistedState(): DashboardState | undefined {
  if (typeof window === 'undefined') return undefined
  try {
    const raw = localStorage.getItem(LOCAL_KEY)
    if (raw) {
      const data = JSON.parse(raw);
      return migrateOldData(data);
    }
  } catch (e) {
  }
  return undefined
}

const slice = createSlice({
  name: 'dashboard',
  initialState: SAMPLE_JSON,
  reducers: {
    hydrate(state, action: PayloadAction<DashboardState | undefined>) {
      if (action.payload) {
        state.categories = action.payload.categories
        state.availableWidgets = action.payload.availableWidgets
      }
    },
    addCategory(state, action: PayloadAction<{ id: string; name: string }>) {
      state.categories.push({ id: action.payload.id, name: action.payload.name, displayedWidgets: [] })
      persist(state)
    },
    removeCategory(state, action: PayloadAction<{ id: string }>) {
      state.categories = state.categories.filter((c) => c.id !== action.payload.id)
      // Also remove all widgets belonging to this category
      state.availableWidgets = state.availableWidgets.filter(w => w.categoryId !== action.payload.id)
      persist(state)
    },
    addWidget(state, action: PayloadAction<{ widget: Widget }>) {
      // Add widget to available widgets if it doesn't exist
      const exists = state.availableWidgets.find(w => w.id === action.payload.widget.id)
      if (!exists) {
        state.availableWidgets.push(action.payload.widget)
        persist(state)
      }
    },
    addAndShowWidget(state, action: PayloadAction<{ categoryId: string; widget: Widget }>) {
      // Add widget to available widgets if it doesn't exist
      const exists = state.availableWidgets.find(w => w.id === action.payload.widget.id)
      if (!exists) {
        const widgetWithCategory = { ...action.payload.widget, categoryId: action.payload.categoryId }
        state.availableWidgets.push(widgetWithCategory)
      }
      
      // Make it visible in the specified category and only in that category 
      const cat = state.categories.find(c => c.id === action.payload.categoryId)
      if (cat && !cat.displayedWidgets.includes(action.payload.widget.id)) {
        cat.displayedWidgets.push(action.payload.widget.id)
      }
      
      persist(state)
    },
    removeWidget(state, action: PayloadAction<{ widgetId: string }>) {
      // Remove widget from available widgets (permanent deletion)
      state.availableWidgets = state.availableWidgets.filter(w => w.id !== action.payload.widgetId)
      // Remove from all categories' displayed widgets
      state.categories.forEach(cat => {
        cat.displayedWidgets = cat.displayedWidgets.filter(wId => wId !== action.payload.widgetId)
      })
      persist(state)
    },
    toggleWidgetVisibility(state, action: PayloadAction<{ categoryId: string; widgetId: string; visible: boolean }>) {
      const cat = state.categories.find((c) => c.id === action.payload.categoryId)
      if (!cat) return
      
      const isCurrentlyDisplayed = cat.displayedWidgets.includes(action.payload.widgetId)
      
      if (action.payload.visible && !isCurrentlyDisplayed) {
        // Show widget: add to displayed widgets
        cat.displayedWidgets.push(action.payload.widgetId)
      } else if (!action.payload.visible && isCurrentlyDisplayed) {
        // Hide widget: remove from displayed widgets
        cat.displayedWidgets = cat.displayedWidgets.filter(wId => wId !== action.payload.widgetId)
      }
      persist(state)
    },
    // Keep the old action for backward compatibility but rename it
    toggleWidgetInCategory(state, action: PayloadAction<{ categoryId: string; widget: Widget; checked: boolean }>) {
      // This will now just toggle visibility, not delete
      const cat = state.categories.find((c) => c.id === action.payload.categoryId)
      if (!cat) return
      
      // Ensure widget exists in available widgets
      const widgetExists = state.availableWidgets.find(w => w.id === action.payload.widget.id)
      if (!widgetExists) {
        state.availableWidgets.push(action.payload.widget)
      }
      
      const isCurrentlyDisplayed = cat.displayedWidgets.includes(action.payload.widget.id)
      
      if (action.payload.checked && !isCurrentlyDisplayed) {
        cat.displayedWidgets.push(action.payload.widget.id)
      } else if (!action.payload.checked && isCurrentlyDisplayed) {
        cat.displayedWidgets = cat.displayedWidgets.filter(wId => wId !== action.payload.widget.id)
      }
      persist(state)
    },
    setAll(state, action: PayloadAction<DashboardState>) {
      state.categories = action.payload.categories
      state.availableWidgets = action.payload.availableWidgets
      persist(state)
    },
  },
})

export const { hydrate, addCategory, removeCategory, addWidget, addAndShowWidget, removeWidget, toggleWidgetVisibility, toggleWidgetInCategory, setAll } = slice.actions
export default slice.reducer
