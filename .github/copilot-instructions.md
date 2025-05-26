# Sentinel Platform

A **modular one-health surveillance platform** designed for antimicrobial resistance (AMR) monitoring with **extensible architecture** for adding new applications and features. The platform supports seamless integration of additional surveillance modules, reporting tools, and health sector applications.

## Core Technologies

- Astro
- React
- Nanostores
- Tailwind CSS
- Postgres

**Important:** Do not use an ORM, just use the native Postgres driver.
Make sure all terminal commands work in PowerShell.

Astro, React, Nanostores and Tailwind CSS are already installed.

## 🏛️ Platform Architecture Philosophy

**Sentinel is built as a modular platform** where:
- Each feature/app is a **self-contained module**
- Apps can be **enabled/disabled independently**
- New surveillance applications can be **plugged in without affecting core functionality**
- **Shared services** (auth, data, UI components) are available to all apps
- **App-specific functionality** remains isolated and maintainable

# 🏗 Modular Platform Architecture Best Practices

This guide outlines **best practices** for building the **Sentinel Modular Surveillance Platform**. The goal is **modularity and extensibility** for healthcare applications, allowing easy addition of new surveillance features while maintaining code clarity.

---

## 📁 Modular Project Structure

**Platform-first architecture** with clear separation between core platform and individual apps:

```
/src
  /platform         # Core platform functionality
    /components     # Shared UI components across all apps
      /ui           # Base UI components (buttons, modals, tables)
      /charts       # Reusable chart components
      /forms        # Common form components
      /layout       # Platform layout components (nav, sidebar, header)
    /stores         # Platform-wide state management
      /auth         # Authentication & user management
      /platform     # Platform settings & configuration
      /shared       # Cross-app shared data
    /hooks          # Platform-wide custom hooks
    /utils          # Core utilities (API, validation, formatting)
    /services       # Platform services (database, API, auth)
    /types          # Shared TypeScript definitions
  
  /apps             # Modular applications
    /amr-surveillance    # AMR Surveillance App
      /components        # AMR-specific components
      /pages            # AMR pages and routes
      /stores           # AMR data stores
      /hooks            # AMR-specific hooks
      /utils            # AMR calculations and utilities
      /types            # AMR-specific types
      app.config.ts     # App configuration & metadata
      index.ts          # App entry point
    
    /outbreak-response   # Outbreak Response App (future)
      /components
      /pages
      /stores
      app.config.ts
      index.ts
    
    /lab-management     # Laboratory Management App (future)
      /components
      /pages
      /stores
      app.config.ts
      index.ts
  
  /registry         # App registry and management
    apps.config.ts  # Registered apps configuration
    router.ts       # Dynamic routing for apps
    permissions.ts  # App-level permissions
  
  main.tsx          # Platform entry point
  app.tsx           # Root platform component
  platform.config.ts # Platform-wide configuration
```

📌 **Modular Architecture Rules:**

- **Each app is completely self-contained.**
- **Apps register themselves with the platform.**
- **Shared functionality lives in `/platform`.**
- **Apps can be enabled/disabled via configuration.**
- **New apps follow the standard app structure.**

---

## 🔌 App Configuration System

### ✅ App Registration Pattern

Each app must register itself with the platform using a standard configuration:

```tsx
// /src/apps/amr-surveillance/app.config.ts
import { AppConfig } from "@/platform/types";

export const amrSurveillanceConfig: AppConfig = {
  id: "amr-surveillance",
  name: "AMR Surveillance",
  description: "Monitor antimicrobial resistance patterns",
  version: "1.0.0",
  category: "surveillance",
  icon: "microscope",
  enabled: true,
  permissions: ["view-amr-data", "edit-isolates", "generate-reports"],
  routes: [
    { path: "/amr", component: () => import("./pages/Dashboard") },
    { path: "/amr/isolates", component: () => import("./pages/Isolates") },
    { path: "/amr/reports", component: () => import("./pages/Reports") }
  ],
  navigation: {
    label: "AMR Surveillance",
    order: 1,
    children: [
      { label: "Dashboard", path: "/amr" },
      { label: "Isolates", path: "/amr/isolates" },
      { label: "Reports", path: "/amr/reports" }
    ]
  },
  dependencies: [], // Other apps this depends on
  dataAccess: ["isolates", "resistance_patterns", "organisms"]
};
```

### ✅ Platform App Registry

```tsx
// /src/registry/apps.config.ts
import { amrSurveillanceConfig } from "@/apps/amr-surveillance/app.config";
import { outbreakResponseConfig } from "@/apps/outbreak-response/app.config";
import { labManagementConfig } from "@/apps/lab-management/app.config";

export const registeredApps = [
  amrSurveillanceConfig,
  outbreakResponseConfig,
  labManagementConfig
];

export const enabledApps = registeredApps.filter(app => app.enabled);
```

📌 **App Configuration Rules:**

- **Every app must have a configuration file.**
- **Apps register their routes, permissions, and dependencies.**
- **Apps can be enabled/disabled without code changes.**
- **The platform automatically generates navigation from app configs.**

---

## 🎛️ Dynamic Platform Features

### ✅ Dynamic Navigation Generation

```tsx
// /src/platform/components/layout/Navigation.tsx
import { enabledApps } from "@/registry/apps.config";

export function PlatformNavigation() {
  return (
    <nav className="platform-nav">
      <div className="platform-brand">
        <h1>Sentinel Platform</h1>
      </div>
      <ul className="nav-apps">
        {enabledApps
          .sort((a, b) => a.navigation.order - b.navigation.order)
          .map(app => (
            <NavItem key={app.id} app={app} />
          ))}
      </ul>
    </nav>
  );
}
```

### ✅ Dynamic Route Registration

```tsx
// /src/registry/router.ts
import { enabledApps } from "./apps.config";

export function generateAppRoutes() {
  const routes: Route[] = [];
  
  enabledApps.forEach(app => {
    app.routes.forEach(route => {
      routes.push({
        path: route.path,
        component: route.component,
        permissions: app.permissions,
        appId: app.id
      });
    });
  });
  
  return routes;
}
```

📌 **Dynamic Platform Rules:**

- **Navigation is automatically generated from app configs.**
- **Routes are dynamically registered based on enabled apps.**
- **Permissions are enforced at the app level.**
- **Apps can declare dependencies on other apps.**

---

## ⚛ Modular React Component Best Practices

### ✅ Platform vs App Components

**Platform Components (Shared):**
```tsx
// /src/platform/components/ui/DataTable.tsx - Reusable across all apps
export function DataTable<T>({ 
  data, 
  columns, 
  onRowClick,
  className 
}: DataTableProps<T>) {
  return (
    <div className={`platform-table ${className}`}>
      {/* Platform-standard table implementation */}
    </div>
  );
}
```

**App-Specific Components:**
```tsx
// /src/apps/amr-surveillance/components/ResistanceProfile.tsx - AMR-specific
import { DataTable } from "@/platform/components/ui/DataTable";

export function ResistanceProfile({ isolateId }: { isolateId: string }) {
  const { data } = useAMRData(isolateId);
  
  return (
    <DataTable 
      data={data.resistanceProfile}
      columns={amrColumns}
      className="amr-resistance-table"
    />
  );
}
```

### ✅ When to Create Platform vs App Components

**Create Platform Components for:**
- UI patterns used across multiple apps (tables, charts, forms)
- Layout components (headers, sidebars, modals)
- Common healthcare data displays (date pickers, user selectors)

**Create App Components for:**
- Domain-specific functionality (AMR calculations, outbreak alerts)
- App-specific workflows (isolate entry, resistance reporting)
- Specialized visualizations unique to the app

📌 **Modular Component Rules:**

- **Platform components are generic and reusable.**
- **App components solve specific domain problems.**
- **Apps can extend platform components with app-specific styling.**
- **Never import app components into platform code.**

---

## 🚀 Astro Best Practices for Modular Platform

### ✅ Platform Layout Structure

```astro
---
// /src/platform/layouts/PlatformLayout.astro
import { PlatformNavigation } from '../components/layout/Navigation';
import { enabledApps } from '@/registry/apps.config';

const currentApp = Astro.params.app;
const appConfig = enabledApps.find(app => app.id === currentApp);
---

<html>
  <head>
    <title>{appConfig?.name || 'Sentinel Platform'}</title>
    <meta name="description" content={appConfig?.description} />
  </head>
  <body class="platform-body">
    <PlatformNavigation client:load />
    <main class="platform-main">
      <slot />
    </main>
    <footer class="platform-footer">
      <slot name="app-footer" />
    </footer>  
  </body>
</html>
```

### ✅ App-Specific Astro Pages

```astro
---
// /src/apps/amr-surveillance/pages/dashboard.astro
import PlatformLayout from '@/platform/layouts/PlatformLayout.astro';
import { AMRDashboard } from '../components/AMRDashboard';
---

<PlatformLayout>
  <div class="app-container amr-app">
    <AMRDashboard client:load />
  </div>
  
  <div slot="app-footer">
    <p>AMR Surveillance v1.0.0</p>
  </div>
</PlatformLayout>
```

📌 **Modular Astro Rules:**

- **Use platform layouts for consistent structure across apps.**
- **Apps can override specific layout sections with slots.**
- **Static content (reference materials) stays in `.astro` files.**
- **Interactive app functionality uses React components.**

---

## 🎨 Tailwind Best Practices for Modular Interfaces

### ✅ Platform-Themed Utility Classes

```tsx
// ✅ Platform-consistent color scheme with app-specific extensions
export function AppAlert({ level, appTheme }: { 
  level: 'critical' | 'high' | 'moderate',
  appTheme?: 'amr' | 'outbreak' | 'lab' 
}) {
  const baseStyles = {
    critical: "bg-red-100 border-red-500 text-red-900",
    high: "bg-orange-100 border-orange-500 text-orange-900", 
    moderate: "bg-yellow-100 border-yellow-500 text-yellow-900"
  };
  
  const appAccents = {
    amr: "border-l-blue-500",
    outbreak: "border-l-purple-500", 
    lab: "border-l-green-500"
  };
  
  return (
    <div className={`p-4 rounded-lg border-l-4 ${baseStyles[level]} ${appAccents[appTheme] || ''}`}>
      <h3 className="font-bold">Alert - {level.toUpperCase()}</h3>
    </div>
  );
}
```

📌 **Modular Styling Rules:**

- **Use consistent platform colors across all apps.**
- **Apps can add theme accents while maintaining platform consistency.**
- **Healthcare-appropriate styling (clean, professional, accessible).**
- **App-specific styling should extend, not override platform styles.**

---

## 🏪 Modular Nanostores Architecture

### ✅ Platform vs App Store Separation

**Platform Stores (Shared across apps):**
```tsx
// /src/platform/stores/auth.ts
import { atom, computed } from "nanostores";

export interface User {
  id: string;
  name: string;
  role: string;
  permissions: string[];
  activeApps: string[];
}

export const currentUser = atom<User | null>(null);
export const userPermissions = computed(currentUser, (user) => 
  user?.permissions || []
);

// /src/platform/stores/platform.ts  
export const enabledApps = atom<string[]>([]);
export const platformTheme = atom<'light' | 'dark'>('light');
```

**App-Specific Stores:**
```tsx
// /src/apps/amr-surveillance/stores/isolates.ts
import { atom, computed } from "nanostores";

export interface AMRIsolate {
  id: string;
  organism: string;
  source: 'human' | 'animal' | 'environmental';
  resistanceProfile: Record<string, 'S' | 'I' | 'R'>;
  collectionDate: Date;
  location: string;
}

export const amrIsolates = atom<AMRIsolate[]>([]);
export const criticalIsolates = computed(amrIsolates, (isolates) => 
  isolates.filter(isolate => 
    Object.values(isolate.resistanceProfile).includes('R')
  )
);
```

### ✅ Cross-App Data Sharing

```tsx
// /src/platform/stores/shared.ts - For data shared between apps
export const sharedPathogens = atom<Pathogen[]>([]);
export const facilityLocations = atom<Location[]>([]);

// Apps can subscribe to shared data
// /src/apps/outbreak-response/stores/outbreaks.ts
import { sharedPathogens } from "@/platform/stores/shared";

export const outbreakPathogens = computed(sharedPathogens, (pathogens) =>
  pathogens.filter(p => p.outbreakPotential === 'high')
);
```

📌 **Modular Store Rules:**

- **Platform stores handle cross-app functionality (auth, settings).**
- **App stores remain isolated and app-specific.**
- **Shared data uses dedicated shared stores.**
- **Apps never directly import other apps' stores.**

---

## 🌿 Modular Hooks Architecture

### ✅ Platform Hooks (Shared functionality)

```tsx
// /src/platform/hooks/usePermissions.ts
import { useStore } from "@nanostores/react";
import { userPermissions } from "@/platform/stores/auth";

export function usePermissions() {
  const permissions = useStore(userPermissions);
  
  const hasPermission = (permission: string) => 
    permissions.includes(permission);
    
  const hasAnyPermission = (requiredPermissions: string[]) =>
    requiredPermissions.some(hasPermission);
    
  return { permissions, hasPermission, hasAnyPermission };
}

// /src/platform/hooks/useAppConfig.ts
export function useAppConfig(appId: string) {
  const [config, setConfig] = useState<AppConfig | null>(null);
  
  useEffect(() => {
    const appConfig = enabledApps.find(app => app.id === appId);
    setConfig(appConfig || null);
  }, [appId]);
  
  return config;
}
```

### ✅ App-Specific Hooks

```tsx
// /src/apps/amr-surveillance/hooks/useAMRData.ts
import { usePermissions } from "@/platform/hooks/usePermissions";

export function useAMRData(pathogen: string, dateRange: DateRange) {
  const { hasPermission } = usePermissions();
  const [data, setData] = useState<AMRData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!hasPermission('view-amr-data')) return;
    
    setLoading(true);
    fetchAMRData(pathogen, dateRange)
      .then(setData)
      .finally(() => setLoading(false));
  }, [pathogen, dateRange, hasPermission]);

  return { data, loading };
}
```

### ✅ App Communication Hooks

```tsx
// /src/platform/hooks/useAppCommunication.ts
export function useAppCommunication() {
  const sendToApp = (targetApp: string, message: any) => {
    // Platform-managed inter-app communication
    window.dispatchEvent(new CustomEvent(`app:${targetApp}`, {
      detail: message
    }));
  };
  
  const subscribeToApp = (sourceApp: string, callback: (data: any) => void) => {
    const handler = (event: CustomEvent) => callback(event.detail);
    window.addEventListener(`app:${sourceApp}`, handler);
    return () => window.removeEventListener(`app:${sourceApp}`, handler);
  };
  
  return { sendToApp, subscribeToApp };
}
```

📌 **Modular Hook Rules:**

- **Platform hooks provide shared functionality to all apps.**
- **App hooks can use platform hooks but not other apps' hooks.**
- **Use app communication hooks for controlled inter-app messaging.**
- **Keep app-specific logic in app-specific hooks.**

---

## 🛠 Modular Development Workflow

### ✅ Adding a New App to the Platform

**Step 1: Create App Structure**
```bash
# PowerShell commands for creating new app
mkdir src/apps/new-app-name
mkdir src/apps/new-app-name/components
mkdir src/apps/new-app-name/pages  
mkdir src/apps/new-app-name/stores
mkdir src/apps/new-app-name/hooks
mkdir src/apps/new-app-name/utils
mkdir src/apps/new-app-name/types
```

**Step 2: Create App Configuration**
```tsx
// /src/apps/new-app-name/app.config.ts
export const newAppConfig: AppConfig = {
  id: "new-app-name",
  name: "New App Display Name", 
  description: "Description of app functionality",
  version: "1.0.0",
  category: "surveillance", // or "management", "reporting", etc.
  icon: "app-icon-name",
  enabled: true,
  permissions: ["new-app-permission"],
  routes: [
    { path: "/new-app", component: () => import("./pages/Dashboard") }
  ],
  navigation: {
    label: "New App",
    order: 10,
    children: [
      { label: "Dashboard", path: "/new-app" }
    ]
  },
  dependencies: [],
  dataAccess: ["table1", "table2"]
};
```

**Step 3: Register App with Platform**
```tsx
// /src/registry/apps.config.ts
import { newAppConfig } from "@/apps/new-app-name/app.config";

export const registeredApps = [
  amrSurveillanceConfig,
  outbreakResponseConfig,
  newAppConfig, // Add here
];
```

### ✅ Import Organization for Modular Platform

```tsx
// Platform imports first
import { useState, useEffect } from "react"; 
import { usePermissions } from "@/platform/hooks/usePermissions";
import { DataTable } from "@/platform/components/ui/DataTable";

// App-specific imports second  
import { useAMRData } from "../hooks/useAMRData";
import { amrIsolates } from "../stores/isolates";
import { calculateResistanceRate } from "../utils/calculations";

// External libraries last
import { format } from "date-fns";
```

### ✅ App Development Standards

```tsx
// Every app component should check permissions
export function AMRDashboard() {
  const { hasPermission } = usePermissions();
  
  if (!hasPermission('view-amr-data')) {
    return <AccessDenied requiredPermission="view-amr-data" />;
  }
  
  return <div>{/* App content */}</div>;
}

// Apps should use platform services
export function AppDataFetcher() {
  const apiClient = usePlatformAPI(); // Platform-provided API client
  const { showNotification } = usePlatformNotifications();
  
  // Use platform services consistently
}
```

📌 **Modular Development Rules:**

- **Follow the standard app structure for all new apps.**
- **Use platform imports before app-specific imports.**
- **Every app checks permissions appropriately.**
- **Apps use platform services instead of recreating functionality.**

---

## 🔐 Platform Security & App Isolation

### ✅ App-Level Security

```tsx
// /src/platform/services/security.ts
export class AppSecurityManager {
  static validateAppAccess(userId: string, appId: string): boolean {
    const user = getCurrentUser();
    const app = getAppConfig(appId);
    
    return app.permissions.every(permission => 
      user.permissions.includes(permission)
    );
  }
  
  static validateDataAccess(appId: string, tableName: string): boolean {
    const app = getAppConfig(appId);
    return app.dataAccess.includes(tableName);
  }
  
  static enforceAppBoundaries(fromApp: string, toApp: string): boolean {
    // Prevent unauthorized cross-app data access
    const fromConfig = getAppConfig(fromApp);
    const toConfig = getAppConfig(toApp);
    
    return fromConfig.dependencies.includes(toApp) || 
           toConfig.category === 'public';
  }
}
```

### ✅ Data Isolation Between Apps

```tsx
// /src/platform/services/database.ts
export class PlatformDatabase {
  static async query(sql: string, params: any[], appId: string) {
    // Validate app has access to requested tables
    const tableNames = extractTableNames(sql);
    const hasAccess = tableNames.every(table => 
      AppSecurityManager.validateDataAccess(appId, table)
    );
    
    if (!hasAccess) {
      throw new Error(`App ${appId} lacks access to requested data`);
    }
    
    return executeQuery(sql, params);
  }
}
```

📌 **Security & Isolation Rules:**

- **Apps can only access their declared data tables.**
- **Cross-app communication must go through platform services.**
- **User permissions are enforced at both platform and app levels.**
- **Apps cannot directly import other apps' code.**

---

## 🧩 Platform Extension Points

### ✅ Plugin Architecture for Advanced Features

```tsx
// /src/platform/plugins/types.ts
export interface PlatformPlugin {
  id: string;
  name: string;
  version: string;
  activate: () => void;
  deactivate: () => void;
  hooks: PluginHooks;
}

export interface PluginHooks {
  beforeAppLoad?: (appId: string) => void;
  afterDataLoad?: (data: any, appId: string) => any;
  beforeNavigation?: (path: string) => boolean;
  customRoutes?: Route[];
}
```

### ✅ Extensible Dashboard System

```tsx
// /src/platform/components/dashboard/DashboardManager.tsx
export function PlatformDashboard() {
  const widgets = useDashboardWidgets();
  
  return (
    <div className="dashboard-grid">
      {widgets.map(widget => (
        <DashboardWidget key={widget.id} {...widget} />
      ))}
    </div>
  );
}

// Apps can register dashboard widgets
// /src/apps/amr-surveillance/widgets/AMRSummary.tsx
export const amrSummaryWidget: DashboardWidget = {
  id: "amr-summary",
  title: "AMR Overview",
  size: "large",
  component: AMRSummaryCard,
  permissions: ["view-amr-data"],
  refreshInterval: 300000 // 5 minutes
};
```

### ✅ Configurable Report Generation

```tsx
// /src/platform/services/reporting.ts
export class PlatformReporting {
  static registerReportType(appId: string, reportConfig: ReportConfig) {
    // Apps can register their own report types
    platformReports.set(`${appId}-${reportConfig.id}`, reportConfig);
  }
  
  static generateReport(reportId: string, parameters: any) {
    const config = platformReports.get(reportId);
    return config.generator(parameters);
  }
}

// /src/apps/amr-surveillance/reports/resistance-summary.ts
PlatformReporting.registerReportType('amr-surveillance', {
  id: 'resistance-summary',
  name: 'Resistance Summary Report',
  generator: generateResistanceSummary,
  parameters: ['dateRange', 'pathogen', 'facility'],
  permissions: ['generate-amr-reports']
});
```

📌 **Extension Rules:**

- **Apps register capabilities with the platform.**
- **Platform manages all cross-app functionality.**
- **Extensions follow standard interfaces.**
- **Apps cannot extend other apps directly.**

---

## 🚀 Deployment & App Management

### ✅ Environment-Based App Configuration

```tsx
// /src/platform/config/environments.ts
export const environmentConfigs = {
  development: {
    enabledApps: ['amr-surveillance', 'lab-management', 'outbreak-response'],
    debugMode: true,
    mockData: true
  },
  staging: {
    enabledApps: ['amr-surveillance', 'lab-management'],
    debugMode: false,
    mockData: false
  },
  production: {
    enabledApps: ['amr-surveillance'],
    debugMode: false,
    mockData: false
  }
};
```

### ✅ Dynamic App Loading

```tsx
// /src/platform/services/appLoader.ts
export class AppLoader {
  static async loadApp(appId: string) {
    const config = getAppConfig(appId);
    
    if (!config.enabled) {
      throw new Error(`App ${appId} is not enabled`);
    }
    
    // Dynamically import app module
    const appModule = await import(`@/apps/${appId}/index.ts`);
    
    // Initialize app with platform services
    return appModule.initialize(platformServices);
  }
  
  static async unloadApp(appId: string) {
    // Clean up app resources
    const app = loadedApps.get(appId);
    await app?.cleanup();
    loadedApps.delete(appId);
  }
}
```

### ✅ App Versioning & Updates

```tsx
// /src/platform/services/appUpdater.ts
export class AppUpdater {
  static checkForUpdates(appId: string): Promise<AppUpdate[]> {
    // Check for app updates without affecting other apps
    return fetchAppUpdates(appId);
  }
  
  static async updateApp(appId: string, version: string) {
    // Update individual app without platform restart
    await AppLoader.unloadApp(appId);
    await installAppVersion(appId, version);
    await AppLoader.loadApp(appId);
  }
}
```

📌 **Deployment Rules:**

- **Apps can be enabled/disabled per environment.**
- **Apps can be updated independently.**
- **Platform maintains backward compatibility.**
- **App loading is managed centrally.**

---

## 🦠 Healthcare-Specific Best Practices

### ✅ Data Security & Privacy

- **Implement proper data anonymization for patient data.**
- **Use role-based access control for sensitive surveillance data.**
- **Follow healthcare data compliance standards (HIPAA, GDPR).**
- **Audit trails for all data access and modifications.**

### ✅ One Health Integration

- **Clearly distinguish human, animal, and environmental health data.**
- **Use consistent pathogen naming across all sectors.**
- **Implement cross-sector data comparison tools.**
- **Support sector-specific workflows while maintaining platform consistency.**

### ✅ Surveillance Standards Compliance

- **Follow WHO AMR surveillance standards.**
- **Implement CLSI/EUCAST breakpoint interpretations.**
- **Support standard surveillance data formats (WHONET, etc.).**
- **Maintain interoperability with external surveillance systems.**

### ✅ Data Quality & Validation

```tsx
// Platform-wide data validation
export function validateSurveillanceData(data: unknown, appId: string): boolean {
  const app = getAppConfig(appId);
  const validators = app.dataValidators || [];
  
  return validators.every(validator => validator(data));
}

// App-specific validation example
// /src/apps/amr-surveillance/utils/validation.ts
export function validateIsolateData(data: unknown): AMRIsolate | null {
  if (!isValidOrganism(data.organism)) return null;
  if (!isValidResistanceProfile(data.resistanceProfile)) return null;
  if (!isValidCollectionDate(data.collectionDate)) return null;
  return data as AMRIsolate;
}
```

---

## 🎯 Best Practices Summary for Modular Platform

### ✅ Core Modular Principles

1. **App Independence**: Each app is self-contained and can be developed/deployed separately
2. **Platform Services**: Shared functionality (auth, UI, data) provided by platform
3. **Configuration-Driven**: Apps register themselves; platform discovers capabilities
4. **Security Boundaries**: Apps cannot access each other's data directly
5. **Extensible Architecture**: New features added without modifying existing code

### ✅ Development Workflow

1. **Start with Platform Services**: Build shared functionality first
2. **Create App Templates**: Standardize app structure and patterns
3. **Test in Isolation**: Each app should work independently
4. **Integration Testing**: Test app interactions through platform services
5. **Progressive Enhancement**: Add apps incrementally to existing platform

### ✅ Maintenance Strategies

1. **Version Apps Separately**: Apps can evolve at different speeds
2. **Backward Compatibility**: Platform changes must not break existing apps
3. **Documentation**: Maintain clear APIs between platform and apps
4. **Monitoring**: Track app performance and usage independently
5. **Gradual Migration**: Move features between apps through platform services

---

## 🔥 Final Thoughts for Modular Surveillance Platform

1. **Prioritize platform stability over individual app features.**
2. **Design for epidemiologists and public health professionals.**
3. **Keep surveillance calculations transparent and auditable.**
4. **Implement robust data validation for clinical accuracy.**
5. **Plan for multi-sector (One Health) data integration.**
6. **Design for large dataset performance optimization.**
7. **Maintain compliance with healthcare data standards.**
8. **Enable easy addition of new surveillance capabilities.**

---

## 📊 Example Modular Apps for Sentinel Platform

### Current Apps:
- **AMR Surveillance** - Monitor resistance patterns across One Health sectors
- **Laboratory Management** - Manage lab workflows and quality control
- **Outbreak Response** - Track and respond to AMR outbreaks

### Future App Possibilities:
- **Stewardship Management** - Antimicrobial stewardship programs
- **Point Prevalence Surveys** - Conduct and analyze prevalence studies  
- **External Reporting** - Generate reports for WHO, CDC, regulatory bodies
- **Training & Education** - AMR education modules and assessments
- **Data Import/Export** - Bulk data operations and system integrations
- **Geographic Mapping** - Spatial analysis of AMR patterns
- **Predictive Analytics** - ML-based resistance prediction models
- **Mobile Data Collection** - Field data collection app integration
- **Quality Assurance** - Data quality monitoring and validation workflows
- **Reference Laboratory** - Reference lab coordination and proficiency testing
- **Infection Control** - Healthcare-associated infection tracking
- **Research Portal** - Clinical research study management
- **Public Dashboard** - Public-facing AMR statistics and trends

Each app follows the modular pattern, can be enabled independently, and integrates seamlessly with the platform's shared services.

---

## 🛡️ Platform Security Architecture

### ✅ Multi-Level Security Model

```tsx
// /src/platform/security/SecurityModel.ts
export class PlatformSecurity {
  // Level 1: Platform-level authentication
  static authenticateUser(credentials: UserCredentials): Promise<User> {
    return authService.authenticate(credentials);
  }
  
  // Level 2: App-level authorization
  static authorizeAppAccess(userId: string, appId: string): boolean {
    const user = getCurrentUser();
    const app = getAppConfig(appId);
    return app.permissions.every(p => user.permissions.includes(p));
  }
  
  // Level 3: Resource-level permissions
  static authorizeResourceAccess(
    userId: string, 
    appId: string, 
    resource: string, 
    action: 'read' | 'write' | 'delete'
  ): boolean {
    const userRole = getUserRole(userId);
    const resourcePolicy = getResourcePolicy(appId, resource);
    return resourcePolicy.allows(userRole, action);
  }
}
```

### ✅ Data Encryption & Privacy

```tsx
// /src/platform/security/DataProtection.ts
export class DataProtection {
  static encryptPHI(data: any): EncryptedData {
    // Encrypt personally identifiable health information
    return encrypt(data, getEncryptionKey('phi'));
  }
  
  static anonymizePatientData(data: PatientData): AnonymizedData {
    // Remove/hash identifying information
    return {
      ...data,
      patientId: hash(data.patientId),
      name: undefined,
      dateOfBirth: ageGroup(data.dateOfBirth),
      address: regionOnly(data.address)
    };
  }
  
  static auditDataAccess(userId: string, appId: string, action: string, resource: string) {
    auditLog.record({
      timestamp: new Date(),
      userId,
      appId,
      action,
      resource,
      ipAddress: getCurrentIP(),
      userAgent: getCurrentUserAgent()
    });
  }
}
```

---

## 📊 Performance Optimization for Large Datasets

### ✅ Database Query Optimization

```tsx
// /src/platform/services/QueryOptimizer.ts
export class QueryOptimizer {
  static optimizeForApp(appId: string, query: string): OptimizedQuery {
    const app = getAppConfig(appId);
    const indexes = getAppIndexes(app.dataAccess);
    
    return {
      query: addIndexHints(query, indexes),
      caching: determineCachingStrategy(query),
      pagination: suggestPagination(query)
    };
  }
  
  static enableQueryCaching(appId: string, queryKey: string, ttl: number) {
    queryCache.set(`${appId}:${queryKey}`, ttl);
  }
}

// App-specific query optimization
// /src/apps/amr-surveillance/services/AMRQueries.ts
export class AMRQueries {
  static async getResistanceTrends(params: TrendParams) {
    const cacheKey = generateCacheKey('resistance-trends', params);
    
    return QueryOptimizer.withCaching(cacheKey, 300, async () => {
      return PlatformDatabase.query(
        optimizedTrendsQuery,
        [params.pathogen, params.dateRange, params.facility],
        'amr-surveillance'
      );
    });
  }
}
```

### ✅ Lazy Loading & Code Splitting

```tsx
// /src/platform/components/LazyAppLoader.tsx
export function LazyAppLoader({ appId }: { appId: string }) {
  const [loading, setLoading] = useState(true);
  const [AppComponent, setAppComponent] = useState<React.ComponentType | null>(null);
  
  useEffect(() => {
    AppLoader.loadApp(appId)
      .then(app => {
        setAppComponent(() => app.component);
        setLoading(false);
      })
      .catch(error => {
        console.error(`Failed to load app ${appId}:`, error);
        setLoading(false);
      });
  }, [appId]);
  
  if (loading) return <AppLoadingSpinner appId={appId} />;
  if (!AppComponent) return <AppLoadError appId={appId} />;
  
  return <AppComponent />;
}
```

### ✅ Data Virtualization for Large Lists

```tsx
// /src/platform/components/ui/VirtualizedTable.tsx
import { FixedSizeList as List } from 'react-window';

export function VirtualizedTable<T>({ 
  data, 
  columns, 
  height = 400 
}: VirtualizedTableProps<T>) {
  const Row = ({ index, style }: { index: number; style: any }) => (
    <div style={style} className="table-row">
      {columns.map(col => (
        <div key={col.key} className="table-cell">
          {col.render(data[index])}
        </div>
      ))}
    </div>
  );
  
  return (
    <List
      height={height}
      itemCount={data.length}
      itemSize={50}
      className="virtualized-table"
    >
      {Row}
    </List>
  );
}
```

---

## 🔄 Inter-App Communication Patterns

### ✅ Event-Driven Communication

```tsx
// /src/platform/services/EventBus.ts
export class PlatformEventBus {
  private static listeners = new Map<string, Function[]>();
  
  static emit(eventType: string, data: any, sourceApp: string) {
    const event: PlatformEvent = {
      type: eventType,
      data,
      sourceApp,
      timestamp: Date.now()
    };
    
    // Security: Check if source app can emit this event type
    if (!this.canEmitEvent(sourceApp, eventType)) {
      throw new Error(`App ${sourceApp} not authorized to emit ${eventType}`);
    }
    
    const handlers = this.listeners.get(eventType) || [];
    handlers.forEach(handler => handler(event));
  }
  
  static subscribe(eventType: string, handler: Function, targetApp: string) {
    // Security: Check if target app can listen to this event type
    if (!this.canListenToEvent(targetApp, eventType)) {
      throw new Error(`App ${targetApp} not authorized to listen to ${eventType}`);
    }
    
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType)!.push(handler);
  }
}
```

### ✅ Shared Data Contracts

```tsx
// /src/platform/contracts/DataContracts.ts
export interface SharedDataContract {
  pathogen: {
    id: string;
    name: string;
    gramStain: 'positive' | 'negative';
    category: 'bacteria' | 'fungus' | 'virus';
  };
  
  isolate: {
    id: string;
    pathogenId: string;
    source: 'human' | 'animal' | 'environmental';
    collectionDate: Date;
    location: GeoLocation;
  };
  
  resistanceResult: {
    isolateId: string;
    antibiotic: string;
    result: 'S' | 'I' | 'R';
    method: 'disk' | 'mic' | 'etest';
    value?: number;
  };
}

// Apps use contracts for type safety
// /src/apps/outbreak-response/services/OutbreakDetection.ts
export function detectOutbreaks(isolates: SharedDataContract['isolate'][]) {
  // Type-safe access to shared data structure
  return isolates.filter(isolate => 
    isGeographicallyClose(isolate.location) && 
    isTemporallyClose(isolate.collectionDate)
  );
}
```

---

## 🧪 Testing Strategy for Modular Platform

### ✅ Platform Testing

```tsx
// /src/platform/__tests__/AppLoader.test.ts
describe('AppLoader', () => {
  test('loads enabled apps correctly', async () => {
    const appConfig = createMockAppConfig({ enabled: true });
    const app = await AppLoader.loadApp(appConfig.id);
    
    expect(app).toBeDefined();
    expect(app.config).toEqual(appConfig);
  });
  
  test('prevents loading disabled apps', async () => {
    const appConfig = createMockAppConfig({ enabled: false });
    
    await expect(AppLoader.loadApp(appConfig.id))
      .rejects.toThrow('App test-app is not enabled');
  });
});

// /src/platform/__tests__/Security.test.ts
describe('AppSecurityManager', () => {
  test('validates app permissions correctly', () => {
    const user = createMockUser(['view-data']);
    const app = createMockApp({ permissions: ['view-data'] });
    
    expect(AppSecurityManager.validateAppAccess(user.id, app.id))
      .toBe(true);
  });
});
```

### ✅ App Testing in Isolation

```tsx
// /src/apps/amr-surveillance/__tests__/AMRCalculations.test.ts
describe('AMR Calculations', () => {
  test('calculates resistance rates correctly', () => {
    const isolates = createMockIsolates([
      { resistance: { ampicillin: 'R', gentamicin: 'S' } },
      { resistance: { ampicillin: 'S', gentamicin: 'R' } },
      { resistance: { ampicillin: 'R', gentamicin: 'S' } }
    ]);
    
    const rates = calculateResistanceRates(isolates);
    
    expect(rates.ampicillin).toBe(0.67); // 2/3 resistant
    expect(rates.gentamicin).toBe(0.33); // 1/3 resistant
  });
});
```

### ✅ Integration Testing

```tsx
// /src/__tests__/integration/CrossAppCommunication.test.ts
describe('Cross-App Communication', () => {
  test('AMR app can share pathogen data with outbreak app', async () => {
    // Setup AMR app with test data
    const amrApp = await AppLoader.loadApp('amr-surveillance');
    const pathogen = await amrApp.addPathogen(mockPathogenData);
    
    // Verify outbreak app can access shared pathogen data
    const outbreakApp = await AppLoader.loadApp('outbreak-response');
    const sharedPathogens = await outbreakApp.getSharedPathogens();
    
    expect(sharedPathogens).toContainEqual(pathogen);
  });
});
```

---

## 📈 Monitoring & Analytics

### ✅ App Performance Monitoring

```tsx
// /src/platform/services/Monitoring.ts
export class PlatformMonitoring {
  static trackAppPerformance(appId: string, metrics: PerformanceMetrics) {
    const appMetrics = {
      appId,
      timestamp: Date.now(),
      loadTime: metrics.loadTime,
      memoryUsage: metrics.memoryUsage,
      queryCount: metrics.queryCount,
      errorCount: metrics.errorCount
    };
    
    this.sendToAnalytics(appMetrics);
  }
  
  static trackUserInteraction(appId: string, interaction: UserInteraction) {
    const event = {
      appId,
      userId: getCurrentUser()?.id,
      action: interaction.action,
      component: interaction.component,
      timestamp: Date.now()
    };
    
    this.sendToAnalytics(event);
  }
}

// Apps can use monitoring hooks
// /src/platform/hooks/useAppMonitoring.ts
export function useAppMonitoring(appId: string) {
  useEffect(() => {
    const startTime = Date.now();
    
    return () => {
      const loadTime = Date.now() - startTime;
      PlatformMonitoring.trackAppPerformance(appId, { loadTime });
    };
  }, [appId]);
  
  const trackUserAction = (action: string, component: string) => {
    PlatformMonitoring.trackUserInteraction(appId, { action, component });
  };
  
  return { trackUserAction };
}
```

### ✅ Health Metrics Dashboard

```tsx
// /src/platform/components/admin/HealthDashboard.tsx
export function PlatformHealthDashboard() {
  const { data: appMetrics } = usePlatformMetrics();
  
  return (
    <div className="health-dashboard">
      <div className="metrics-grid">
        {appMetrics.map(app => (
          <AppHealthCard key={app.id} app={app} />
        ))}
      </div>
      
      <div className="platform-metrics">
        <DatabaseHealthMetrics />
        <SystemResourceMetrics />
        <UserActivityMetrics />
      </div>
    </div>
  );
}
```

---

## 🔮 Future Extensibility Considerations

### ✅ API Versioning for Apps

```tsx
// /src/platform/api/versioning.ts
export class PlatformAPIVersioning {
  static registerAppAPI(appId: string, version: string, endpoints: APIEndpoints) {
    apiRegistry.set(`${appId}@${version}`, endpoints);
  }
  
  static getAppAPI(appId: string, version?: string): APIEndpoints {
    const requestedVersion = version || 'latest';
    return apiRegistry.get(`${appId}@${requestedVersion}`);
  }
  
  static handleAPIDeprecation(appId: string, deprecatedVersion: string) {
    // Gracefully handle deprecated API versions
    const currentApps = getAppsUsingAPI(appId, deprecatedVersion);
    currentApps.forEach(app => {
      this.notifyAPIDeprecation(app.id, deprecatedVersion);
    });
  }
}
```

### ✅ Plugin System for Third-Party Extensions

```tsx
// /src/platform/plugins/PluginManager.ts
export class PluginManager {
  static async installPlugin(pluginPackage: PluginPackage): Promise<void> {
    // Validate plugin security and compatibility
    await this.validatePlugin(pluginPackage);
    
    // Install plugin with sandboxed permissions
    const plugin = await this.loadPlugin(pluginPackage);
    
    // Register plugin capabilities with platform
    this.registerPluginCapabilities(plugin);
    
    installedPlugins.set(plugin.id, plugin);
  }
  
  static async validatePlugin(plugin: PluginPackage): Promise<void> {
    // Check digital signature
    if (!await this.verifySignature(plugin)) {
      throw new Error('Plugin signature verification failed');
    }
    
    // Check compatibility with platform version
    if (!this.isCompatibleVersion(plugin.platformVersion)) {
      throw new Error('Plugin incompatible with platform version');
    }
    
    // Validate requested permissions
    if (!this.validatePermissions(plugin.permissions)) {
      throw new Error('Plugin requests unauthorized permissions');
    }
  }
}
```

---

## 🎓 Developer Onboarding Guide

### ✅ Quick Start for New App Development

```bash
# PowerShell script for new app setup
# /scripts/create-new-app.ps1

param($AppName, $Category = "surveillance")

# Create app directory structure
$AppPath = "src/apps/$AppName"
New-Item -ItemType Directory -Path $AppPath -Force
New-Item -ItemType Directory -Path "$AppPath/components" -Force
New-Item -ItemType Directory -Path "$AppPath/pages" -Force
New-Item -ItemType Directory -Path "$AppPath/stores" -Force
New-Item -ItemType Directory -Path "$AppPath/hooks" -Force
New-Item -ItemType Directory -Path "$AppPath/utils" -Force
New-Item -ItemType Directory -Path "$AppPath/types" -Force

# Create template files
Copy-Item "templates/app.config.template.ts" "$AppPath/app.config.ts"
Copy-Item "templates/index.template.ts" "$AppPath/index.ts"
Copy-Item "templates/Dashboard.template.tsx" "$AppPath/pages/Dashboard.tsx"

# Update template placeholders
(Get-Content "$AppPath/app.config.ts") -replace "{{APP_NAME}}", $AppName -replace "{{CATEGORY}}", $Category | Set-Content "$AppPath/app.config.ts"

Write-Host "New app '$AppName' created successfully!"
Write-Host "Next steps:"
Write-Host "1. Update $AppPath/app.config.ts with your app details"
Write-Host "2. Add your app config to src/registry/apps.config.ts"
Write-Host "3. Implement your app logic in $AppPath/pages/Dashboard.tsx"
```

### ✅ Development Environment Setup

```json
// /.vscode/settings.json - VS Code configuration for the project
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.codeActionsOnSave": {
    "source.organizeImports": true
  },
  "files.associations": {
    "*.astro": "astro"
  },
  "tailwindCSS.includeLanguages": {
    "astro": "html"
  },
  "emmet.includeLanguages": {
    "astro": "html"
  },
  "search.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/.astro": true
  }
}
```

---

## ⚡ Tech Stack Best Practices

### 🚀 Astro Best Practices

#### ✅ File Organization and Routing
```typescript
// /src/pages/[...app].astro - Catch-all route for apps
---
import PlatformLayout from '@/platform/layouts/PlatformLayout.astro';
import { AppLoader } from '@/platform/services/AppLoader';

const { app } = Astro.params;
const appConfig = await AppLoader.getAppConfig(app);

if (!appConfig) {
  return Astro.redirect('/404');
}
---

<PlatformLayout title={appConfig.name}>
  <div id="app-container" data-app-id={app}>
    <!-- App will be hydrated here -->
  </div>
</PlatformLayout>

<script>
  import { AppLoader } from '@/platform/services/AppLoader';
  
  const appId = document.querySelector('#app-container')?.dataset.appId;
  if (appId) {
    AppLoader.hydrateApp(appId, '#app-container');
  }
</script>
```

#### ✅ Component Hydration Strategy
```astro
---
// Use selective hydration for optimal performance
import { AMRDashboard } from '@/apps/amr-surveillance/components/AMRDashboard';
import { StaticReports } from '@/apps/amr-surveillance/components/StaticReports';
---

<div class="surveillance-page">
  <!-- Static content - no hydration needed -->
  <StaticReports />
  
  <!-- Interactive content - hydrate on load -->
  <AMRDashboard client:load />
  
  <!-- Heavy components - hydrate when visible -->
  <AMRAnalytics client:visible />
  
  <!-- Non-critical components - hydrate when idle -->
  <AMRSettings client:idle />
</div>
```

#### ✅ Astro Configuration for Platform
```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  integrations: [
    react(),
    tailwind({
      config: { path: './platform.tailwind.config.cjs' }
    })
  ],
  vite: {
    define: {
      __PLATFORM_VERSION__: JSON.stringify(process.env.npm_package_version),
      __ENABLED_APPS__: JSON.stringify(process.env.ENABLED_APPS?.split(',') || [])
    },
    resolve: {
      alias: {
        '@': '/src',
        '@platform': '/src/platform',
        '@apps': '/src/apps'
      }
    }
  },
  // Optimize for healthcare data privacy
  compressHTML: false, // Maintain readable source for auditing
  output: 'server', // Server-side rendering for security
  adapter: node({
    mode: 'standalone'
  })
});
```

#### 📌 **Astro Rules:**
- **Use `client:load` for critical interactive components**
- **Use `client:visible` for below-the-fold heavy components**
- **Keep static surveillance reports in `.astro` files**
- **Use Astro's built-in image optimization for medical imaging**

---

### ⚛️ React Best Practices

#### ✅ Component Architecture
```tsx
// /src/platform/components/ui/DataTable.tsx
import { memo, useMemo, useCallback } from 'react';

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  onRowSelect?: (row: T) => void;
  loading?: boolean;
  pageSize?: number;
}

export const DataTable = memo(<T extends Record<string, any>>({
  data,
  columns,
  onRowSelect,
  loading = false,
  pageSize = 50
}: DataTableProps<T>) => {
  // Memoize expensive calculations
  const sortedData = useMemo(() => {
    return data.sort((a, b) => a.id - b.id);
  }, [data]);
  
  // Memoize callbacks to prevent unnecessary re-renders
  const handleRowClick = useCallback((row: T) => {
    onRowSelect?.(row);
  }, [onRowSelect]);
  
  // Virtualize large datasets for performance
  const visibleRows = useMemo(() => {
    return sortedData.slice(0, pageSize);
  }, [sortedData, pageSize]);
  
  if (loading) return <TableSkeleton />;
  
  return (
    <div className="platform-table">
      <table className="w-full">
        <thead>
          {columns.map(col => (
            <th key={col.key} className="text-left p-2">
              {col.header}
            </th>
          ))}
        </thead>
        <tbody>
          {visibleRows.map((row, index) => (
            <tr 
              key={row.id || index}
              onClick={() => handleRowClick(row)}
              className="hover:bg-gray-50 cursor-pointer"
            >
              {columns.map(col => (
                <td key={col.key} className="p-2">
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});
```

#### ✅ Error Boundaries for App Isolation
```tsx
// /src/platform/components/AppErrorBoundary.tsx
import { ErrorBoundary } from 'react-error-boundary';

function AppErrorFallback({ error, resetErrorBoundary, appId }: {
  error: Error;
  resetErrorBoundary: () => void;
  appId: string;
}) {
  useEffect(() => {
    // Log app-specific errors
    PlatformMonitoring.trackAppError(appId, error);
  }, [error, appId]);
  
  return (
    <div className="app-error-container p-6 bg-red-50 border border-red-200 rounded-lg">
      <h2 className="text-lg font-semibold text-red-900 mb-2">
        Application Error
      </h2>
      <p className="text-red-700 mb-4">
        The {getAppConfig(appId)?.name} application encountered an error.
      </p>
      <button 
        onClick={resetErrorBoundary}
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
      >
        Reload Application
      </button>
    </div>
  );
}

export function AppWithErrorBoundary({ appId, children }: {
  appId: string;
  children: React.ReactNode;
}) {
  return (
    <ErrorBoundary
      FallbackComponent={(props) => <AppErrorFallback {...props} appId={appId} />}
      onReset={() => AppLoader.reloadApp(appId)}
    >
      {children}
    </ErrorBoundary>
  );
}
```

#### ✅ Performance Optimization Patterns
```tsx
// /src/apps/amr-surveillance/hooks/useAMRData.ts
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

export function useAMRData(filters: AMRFilters) {
  // Use React Query for caching and background updates
  const { data, isLoading, error } = useQuery({
    queryKey: ['amr-data', filters],
    queryFn: () => fetchAMRData(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!filters.pathogen // Only fetch when pathogen is selected
  });
  
  // Memoize expensive calculations
  const processedData = useMemo(() => {
    if (!data) return null;
    
    return {
      resistanceRates: calculateResistanceRates(data.isolates),
      trends: calculateTrends(data.isolates),
      summary: generateSummary(data.isolates)
    };
  }, [data]);
  
  return {
    data: processedData,
    isLoading,
    error,
    refetch: () => queryClient.invalidateQueries(['amr-data'])
  };
}
```

#### 📌 **React Rules:**
- **Use `memo()` for expensive list components**
- **Use `useMemo()` for expensive calculations**
- **Use `useCallback()` for event handlers passed to children**
- **Implement error boundaries for each app**
- **Use React Query for server state management**

---

### 🏪 Nanostores Best Practices

#### ✅ Store Organization Pattern
```typescript
// /src/platform/stores/index.ts - Centralized store exports
export { currentUser, userPermissions } from './auth';
export { platformTheme, enabledApps } from './platform';
export { notifications } from './notifications';

// /src/apps/amr-surveillance/stores/index.ts - App store exports
export { amrIsolates, criticalIsolates } from './isolates';
export { resistanceTrends } from './trends';
export { amrFilters } from './filters';
```

#### ✅ Complex State Management
```typescript
// /src/platform/stores/auth.ts
import { atom, computed, action } from 'nanostores';

export interface User {
  id: string;
  name: string;
  role: string;
  permissions: string[];
  facilities: string[];
  activeApps: string[];
}

// Primary stores
export const currentUser = atom<User | null>(null);
export const authToken = atom<string | null>(null);
export const loginState = atom<'idle' | 'loading' | 'success' | 'error'>('idle');

// Computed stores
export const userPermissions = computed(currentUser, (user) => 
  user?.permissions || []
);

export const availableApps = computed([currentUser, enabledApps], (user, apps) => {
  if (!user) return [];
  return apps.filter(app => 
    app.permissions.every(permission => 
      user.permissions.includes(permission)
    )
  );
});

export const isAuthenticated = computed([currentUser, authToken], (user, token) => 
  !!(user && token)
);

// Actions
export const login = action(authToken, 'login', (store, credentials: LoginCredentials) => {
  loginState.set('loading');
  
  return authService.login(credentials)
    .then(response => {
      store.set(response.token);
      currentUser.set(response.user);
      loginState.set('success');
    })
    .catch(error => {
      loginState.set('error');
      throw error;
    });
});

export const logout = action(authToken, 'logout', (store) => {
  store.set(null);
  currentUser.set(null);
  loginState.set('idle');
  
  // Clear app-specific stores
  clearAppStores();
});
```

#### ✅ Persistent Storage Integration
```typescript
// /src/platform/stores/persistence.ts
import { persistentAtom } from '@nanostores/persistent';

export const userPreferences = persistentAtom<UserPreferences>('user-prefs', {
  theme: 'light',
  defaultFacility: '',
  dashboardLayout: 'grid',
  tablePageSize: 50
});

export const recentSearches = persistentAtom<string[]>('recent-searches', []);

// App-specific persistence
// /src/apps/amr-surveillance/stores/preferences.ts
export const amrViewPreferences = persistentAtom<AMRViewPrefs>('amr-prefs', {
  defaultPathogen: '',
  defaultDateRange: '30d',
  chartType: 'line',
  showResistantOnly: false
});
```

#### ✅ Store Testing Patterns
```typescript
// /src/platform/stores/__tests__/auth.test.ts
import { currentUser, login, logout } from '../auth';

describe('Auth Store', () => {
  beforeEach(() => {
    // Reset stores before each test
    currentUser.set(null);
    authToken.set(null);
  });
  
  test('login sets user and token', async () => {
    const mockUser = createMockUser();
    const mockCredentials = { username: 'test', password: 'test' };
    
    mockAuthService.login.mockResolvedValue({
      user: mockUser,
      token: 'mock-token'
    });
    
    await login(mockCredentials);
    
    expect(currentUser.get()).toEqual(mockUser);
    expect(authToken.get()).toBe('mock-token');
  });
  
  test('logout clears user state', () => {
    currentUser.set(createMockUser());
    authToken.set('token');
    
    logout();
    
    expect(currentUser.get()).toBeNull();
    expect(authToken.get()).toBeNull();
  });
});
```

#### 📌 **Nanostores Rules:**
- **Use atoms for simple state, computed for derived state**
- **Use actions for complex state mutations**
- **Keep stores small and focused on single concerns**
- **Use persistent atoms for user preferences**
- **Test stores in isolation from components**

---

### 🎨 Tailwind CSS Best Practices

#### ✅ Platform Design System
```javascript
// /platform.tailwind.config.cjs
module.exports = {
  content: [
    './src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'
  ],
  theme: {
    extend: {
      colors: {
        // Platform brand colors
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          900: '#1e3a8a'
        },
        // Healthcare semantic colors
        critical: {
          50: '#fef2f2',
          500: '#ef4444',
          600: '#dc2626',
          900: '#7f1d1d'
        },
        warning: {
          50: '#fffbeb',
          500: '#f59e0b',
          600: '#d97706',
          900: '#78350f'
        },
        success: {
          50: '#f0fdf4',
          500: '#22c55e',
          600: '#16a34a',
          900: '#14532d'
        },
        // AMR-specific colors
        resistant: '#dc2626',
        intermediate: '#f59e0b',
        susceptible: '#16a34a',
        // App-specific accent colors
        'amr-accent': '#3b82f6',
        'outbreak-accent': '#8b5cf6',
        'lab-accent': '#10b981'
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace']
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem'
      }
    }
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    // Custom platform components
    function({ addComponents, theme }) {
      addComponents({
        '.platform-card': {
          backgroundColor: theme('colors.white'),
          borderRadius: theme('borderRadius.lg'),
          boxShadow: theme('boxShadow.sm'),
          border: `1px solid ${theme('colors.gray.200')}`,
          padding: theme('spacing.6')
        },
        '.platform-table': {
          '& th': {
            backgroundColor: theme('colors.gray.50'),
            fontWeight: theme('fontWeight.semibold'),
            borderBottom: `2px solid ${theme('colors.gray.200')}`
          },
          '& td': {
            borderBottom: `1px solid ${theme('colors.gray.100')}`
          }
        },
        '.amr-alert': {
          '&.critical': {
            backgroundColor: theme('colors.critical.50'),
            borderColor: theme('colors.critical.500'),
            color: theme('colors.critical.900')
          },
          '&.warning': {
            backgroundColor: theme('colors.warning.50'),
            borderColor: theme('colors.warning.500'),
            color: theme('colors.warning.900')
          }
        }
      });
    }
  ]
};
```

#### ✅ Component Styling Patterns
```tsx
// /src/platform/components/ui/Button.tsx
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  // Base styles
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background',
  {
    variants: {
      variant: {
        default: 'bg-primary-600 text-white hover:bg-primary-700',
        destructive: 'bg-critical-600 text-white hover:bg-critical-700',
        outline: 'border border-gray-300 hover:bg-gray-50',
        ghost: 'hover:bg-gray-100',
        // Healthcare-specific variants
        critical: 'bg-critical-500 text-white hover:bg-critical-600',
        warning: 'bg-warning-500 text-white hover:bg-warning-600',
        success: 'bg-success-500 text-white hover:bg-success-600'
      },
      size: {
        default: 'h-10 py-2 px-4',
        sm: 'h-9 px-3 rounded-md',
        lg: 'h-11 px-8 rounded-md'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
);

interface ButtonProps 
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button
      className={buttonVariants({ variant, size, className })}
      {...props}
    />
  );
}
```

#### ✅ App-Specific Styling
```tsx
// /src/apps/amr-surveillance/components/ResistanceProfile.tsx
export function ResistanceProfile({ data }: { data: ResistanceData }) {
  return (
    <div className="platform-card">
      <h3 className="text-lg font-semibold mb-4 text-amr-accent">
        Resistance Profile
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.antibiotics.map(antibiotic => (
          <div 
            key={antibiotic.name}
            className={`
              p-3 rounded-lg border-l-4
              ${antibiotic.result === 'R' ? 'border-resistant bg-critical-50' : ''}
              ${antibiotic.result === 'I' ? 'border-intermediate bg-warning-50' : ''}
              ${antibiotic.result === 'S' ? 'border-susceptible bg-success-50' : ''}
            `}
          >
            <div className="font-medium">{antibiotic.name}</div>
            <div className="text-sm text-gray-600">
              {antibiotic.result} - {antibiotic.interpretation}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

#### 📌 **Tailwind Rules:**
- **Use the platform design system for consistency**
- **Create reusable component classes with @apply or CVA**
- **Use semantic color names (critical/warning/success)**
- **Implement app-specific accent colors for visual distinction**
- **Maintain accessibility with proper contrast ratios**

---

### 🗄️ PostgreSQL Best Practices

#### ✅ Database Schema Organization
```sql
-- /database/schema/01_platform.sql
CREATE SCHEMA IF NOT EXISTS platform;
CREATE SCHEMA IF NOT EXISTS amr_surveillance;
CREATE SCHEMA IF NOT EXISTS lab_management;
CREATE SCHEMA IF NOT EXISTS outbreak_response;

-- Platform tables
CREATE TABLE platform.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
  permissions TEXT[] DEFAULT '{}',
  facilities TEXT[] DEFAULT '{}',
  active_apps TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE platform.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES platform.users(id),
  app_id VARCHAR(100) NOT NULL,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(100),
  resource_id VARCHAR(255),
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AMR Surveillance tables
CREATE TABLE amr_surveillance.organisms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  genus VARCHAR(100) NOT NULL,
  species VARCHAR(100) NOT NULL,
  gram_stain VARCHAR(20) CHECK (gram_stain IN ('positive', 'negative')),
  category VARCHAR(50) CHECK (category IN ('bacteria', 'fungus', 'virus')),
  who_priority VARCHAR(20) CHECK (who_priority IN ('critical', 'high', 'medium')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE amr_surveillance.isolates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organism_id UUID REFERENCES amr_surveillance.organisms(id),
  specimen_id VARCHAR(255) UNIQUE NOT NULL,
  source VARCHAR(20) CHECK (source IN ('human', 'animal', 'environmental')),
  collection_date DATE NOT NULL,
  facility_id VARCHAR(100) NOT NULL,
  location_coordinates POINT,
  patient_age_group VARCHAR(20),
  specimen_type VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE amr_surveillance.resistance_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  isolate_id UUID REFERENCES amr_surveillance.isolates(id),
  antibiotic VARCHAR(100) NOT NULL,
  result VARCHAR(1) CHECK (result IN ('S', 'I', 'R')),
  method VARCHAR(20) CHECK (method IN ('disk', 'mic', 'etest')),
  value DECIMAL(10,3),
  breakpoint_version VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### ✅ Performance Optimization
```sql
-- /database/indexes/performance.sql

-- Platform indexes
CREATE INDEX idx_users_username ON platform.users(username);
CREATE INDEX idx_users_active_apps ON platform.users USING GIN(active_apps);
CREATE INDEX idx_audit_log_user_action ON platform.audit_log(user_id, action, created_at);
CREATE INDEX idx_audit_log_app_resource ON platform.audit_log(app_id, resource_type, created_at);

-- AMR Surveillance indexes
CREATE INDEX idx_isolates_organism_date ON amr_surveillance.isolates(organism_id, collection_date);
CREATE INDEX idx_isolates_source_facility ON amr_surveillance.isolates(source, facility_id);
CREATE INDEX idx_isolates_collection_date ON amr_surveillance.isolates(collection_date);
CREATE INDEX idx_isolates_location ON amr_surveillance.isolates USING GIST(location_coordinates);

CREATE INDEX idx_resistance_isolate_antibiotic ON amr_surveillance.resistance_results(isolate_id, antibiotic);
CREATE INDEX idx_resistance_result_antibiotic ON amr_surveillance.resistance_results(result, antibiotic);

-- Partial indexes for performance
CREATE INDEX idx_resistant_results ON amr_surveillance.resistance_results(antibiotic, isolate_id) 
WHERE result = 'R';

-- Materialized views for complex queries
CREATE MATERIALIZED VIEW amr_surveillance.resistance_rates AS
SELECT 
  organism_id,
  antibiotic,
  facility_id,
  DATE_TRUNC('month', i.collection_date) as month,
  COUNT(*) as total_tests,
  COUNT(*) FILTER (WHERE r.result = 'R') as resistant_count,
  ROUND(
    COUNT(*) FILTER (WHERE r.result = 'R')::DECIMAL / COUNT(*) * 100, 
    2
  ) as resistance_rate
FROM amr_surveillance.isolates i
JOIN amr_surveillance.resistance_results r ON i.id = r.isolate_id
GROUP BY organism_id, antibiotic, facility_id, DATE_TRUNC('month', i.collection_date);

CREATE UNIQUE INDEX idx_resistance_rates_unique 
ON amr_surveillance.resistance_rates(organism_id, antibiotic, facility_id, month);
```

#### ✅ Database Functions & Procedures
```sql
-- /database/functions/amr_calculations.sql

-- Function to calculate resistance rates
CREATE OR REPLACE FUNCTION amr_surveillance.calculate_resistance_rate(
  p_organism_id UUID,
  p_antibiotic VARCHAR,
  p_start_date DATE,
  p_end_date DATE,
  p_facility_ids TEXT[] DEFAULT NULL
) RETURNS TABLE (
  total_tests BIGINT,
  resistant_count BIGINT,
  resistance_rate DECIMAL
) AS $
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT as total_tests,
    COUNT(*) FILTER (WHERE r.result = 'R')::BIGINT as resistant_count,
    ROUND(
      COUNT(*) FILTER (WHERE r.result = 'R')::DECIMAL / 
      NULLIF(COUNT(*), 0) * 100, 
      2
    ) as resistance_rate
  FROM amr_surveillance.isolates i
  JOIN amr_surveillance.resistance_results r ON i.id = r.isolate_id
  WHERE i.organism_id = p_organism_id
    AND r.antibiotic = p_antibiotic
    AND i.collection_date BETWEEN p_start_date AND p_end_date
    AND (p_facility_ids IS NULL OR i.facility_id = ANY(p_facility_ids));
END;
$ LANGUAGE plpgsql;

-- Trigger for audit logging
CREATE OR REPLACE FUNCTION platform.audit_trigger()
RETURNS TRIGGER AS $
BEGIN
  INSERT INTO platform.audit_log (
    app_id, action, resource_type, resource_id, created_at
  ) VALUES (
    'amr-surveillance', 
    TG_OP, 
    TG_TABLE_NAME, 
    COALESCE(NEW.id::TEXT, OLD.id::TEXT),
    NOW()
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$ LANGUAGE plpgsql;

-- Apply audit trigger to sensitive tables
CREATE TRIGGER audit_isolates 
  AFTER INSERT OR UPDATE OR DELETE ON amr_surveillance.isolates
  FOR EACH ROW EXECUTE FUNCTION platform.audit_trigger();
```

#### ✅ Connection Management
```typescript
// /src/platform/services/database.ts
import { Pool, PoolClient } from 'pg';

class DatabaseService {
  private pool: Pool;
  
  constructor() {
    this.pool = new Pool({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      // Connection pool settings
      max: 20, // Maximum number of clients
      idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
      connectionTimeoutMillis: 2000, // Return error after 2 seconds if no connection
      // SSL for production
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
  }
  
  async query<T = any>(
    text: string, 
    params: any[] = [], 
    appId: string
  ): Promise<T[]> {
    // Validate app has access to requested tables
    this.validateTableAccess(text, appId);
    
    const start = Date.now();
    const client = await this.pool.connect();
    
    try {
      const result = await client.query(text, params);
      
      // Log query performance
      const duration = Date.now() - start;
      this.logQuery(appId, text, duration);
      
      return result.rows;
    } finally {
      client.release();
    }
  }
  
  async transaction<T>(
    callback: (client: PoolClient) => Promise<T>,
    appId: string
  ): Promise<T> {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
  
  private validateTableAccess(query: string, appId: string): void {
    const app = getAppConfig(appId);
    const tables = this.extractTableNames(query);
    
    const unauthorizedTables = tables.filter(table => 
      !app.dataAccess.includes(table)
    );
    
    if (unauthorizedTables.length > 0) {
      throw new Error(
        `App ${appId} lacks access to tables: ${unauthorizedTables.join(', ')}`
      );
    }
  }
}

export const database = new DatabaseService();
```

#### 📌 **PostgreSQL Rules:**
- **Use schemas to organize app-specific tables**
- **Implement proper indexing for query performance**
- **Use materialized views for complex aggregations**
- **Create database functions for business logic**
- **Implement connection pooling for scalability**
- **Use transactions for data consistency**
- **Log all data access for audit trails**

