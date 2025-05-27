📌 **ML Integration Rules:**

- **All models must be validated on local data before deployment.**
- **Feature engineering must respect patient privacy.**
- **Model predictions include confidence intervals and explanations.**
- **Continuous monitoring of model performance is mandatory.**
- **Support for federated learning to maintain data sovereignty.**

---

## 🔒 Security & Compliance Architecture

### ✅ Multi-layered Security Model

```tsx
// /src/platform/security/SecurityFramework.ts
export class AMRSecurityFramework {
  // Healthcare-specific access control
  static async authorizeHealthcareAction(
    user: User,
    action: HealthcareAction,
    resource: HealthcareResource
  ): Promise<AuthorizationResult> {
    // Level 1: Role-based permissions
    const rolePermissions = await this.getRolePermissions(user.role);
    
    // Level 2: Facility-based access
    const facilityAccess = await this.checkFacilityAccess(
      user.facilities,
      resource.facility
    );
    
    // Level 3: Data sensitivity level
    const sensitivityClearance = await this.checkSensitivityClearance(
      user.clearanceLevel,
      resource.sensitivityLevel
    );
    
    // Level 4: Purpose of use
    const purposeValidation = await this.validatePurposeOfUse(
      action.purpose,
      resource.type
    );
    
    // Level 5: Temporal restrictions
    const temporalAccess = await this.checkTemporalRestrictions(
      user.accessSchedule,
      new Date()
    );
    
    return {
      authorized: rolePermissions && facilityAccess && 
                 sensitivityClearance && purposeValidation && 
                 temporalAccess,
      reason: this.getAuthorizationReason(arguments),
      auditEntry: this.createAuditEntry(user, action, resource)
    };
  }
  
  // PHI/PII protection
  static protectPatientData(data: PatientData): ProtectedData {
    return {
      // Direct identifiers removed
      patientId: this.hashIdentifier(data.patientId),
      
      // Quasi-identifiers generalized
      ageGroup: this.generalizeAge(data.age),
      region: this.generalizeLocation(data.address),
      
      // Clinical data preserved with minimal modification
      clinicalData: {
        ...data.clinical,
        rareConditions: this.protectRareConditions(data.clinical.conditions)
      },
      
      // Encryption metadata
      protection: {
        method: 'AES-256-GCM',
        keyId: this.getCurrentKeyId(),
        timestamp: new Date(),
        expiresAt: this.calculateExpiration(data.sensitivity)
      }
    };
  }
  
  // Consent management for One Health data sharing
  static async validateDataSharing(
    dataSource: DataSource,
    dataRecipient: DataRecipient,
    purpose: SharingPurpose
  ): Promise<ConsentValidation> {
    // Check institutional agreements
    const agreement = await this.getDataSharingAgreement(
      dataSource.institution,
      dataRecipient.institution
    );
    
    if (!agreement || !agreement.active) {
      return { 
        allowed: false, 
        reason: 'No active data sharing agreement' 
      };
    }
    
    // Check purpose alignment
    if (!agreement.allowedPurposes.includes(purpose)) {
      return { 
        allowed: false, 
        reason: 'Purpose not covered by agreement' 
      };
    }
    
    // Check data minimization
    const minimizedData = await this.enforceDataMinimization(
      dataSource.data,
      purpose
    );
    
    // Log sharing event
    await this.logDataSharing({
      source: dataSource,
      recipient: dataRecipient,
      purpose,
      dataCategories: this.categorizeData(minimizedData),
      timestamp: new Date()
    });
    
    return { 
      allowed: true, 
      data: minimizedData,
      restrictions: agreement.restrictions
    };
  }
}
```

### ✅ Regulatory Compliance Manager

```tsx
// /src/platform/compliance/ComplianceManager.ts
export class AMRComplianceManager {
  // GDPR compliance for EU deployments
  static async handleGDPRRequest(
    request: GDPRRequest
  ): Promise<GDPRResponse> {
    switch (request.type) {
      case 'access':
        return await this.provideDataAccess(request.subject);
        
      case 'rectification':
        return await this.rectifyData(request.subject, request.corrections);
        
      case 'erasure':
        return await this.eraseData(request.subject, request.scope);
        
      case 'portability':
        return await this.exportData(request.subject, 'machine-readable');
        
      case 'restriction':
        return await this.restrictProcessing(request.subject, request.categories);
        
      default:
        throw new Error(`Unknown GDPR request type: ${request.type}`);
    }
  }
  
  // HIPAA compliance for US deployments
  static async enforceHIPAA(): Promise<void> {
    // Minimum necessary standard
    this.enforceMinimumNecessary();
    
    // Access controls
    this.enforceAccessControls();
    
    // Audit controls
    this.enforceAuditControls();
    
    // Transmission security
    this.enforceTransmissionSecurity();
    
    // Business associate agreements
    await this.validateBAAgreements();
  }
  
  // WHO GLASS compliance validation
  static async validateGLASSCompliance(
    submission: GLASSSubmission
  ): Promise<ComplianceResult> {
    const validations = await Promise.all([
      this.validateDataCompleteness(submission),
      this.validateDataQuality(submission),
      this.validateTimeliness(submission),
      this.validateStandardCompliance(submission),
      this.validatePrivacyProtection(submission)
    ]);
    
    const issues = validations.flatMap(v => v.issues);
    
    return {
      compliant: issues.length === 0,
      issues,
      recommendations: this.generateRecommendations(issues),
      certificationStatus: this.determineCertificationStatus(validations)
    };
  }
}
```

📌 **Security & Compliance Rules:**

- **Implement defense in depth with multiple security layers.**
- **Comply with local data protection regulations (GDPR, HIPAA, etc.).**
- **Enforce data minimization and purpose limitation.**
- **Maintain comprehensive audit trails for all data access.**
- **Support multi-jurisdictional compliance requirements.**

---

## 📊 Performance Optimization Strategies

### ✅ Database Performance Optimization

```sql
-- /database/performance/partitioning.sql

-- Partition large tables by date for better query performance
CREATE TABLE amr_surveillance.resistance_results_partitioned (
  LIKE amr_surveillance.resistance_results INCLUDING ALL
) PARTITION BY RANGE (created_at);

-- Create monthly partitions
CREATE TABLE amr_surveillance.resistance_results_2024_01 
  PARTITION OF amr_surveillance.resistance_results_partitioned
  FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

-- Index strategy for common queries
CREATE INDEX CONCURRENTLY idx_resistance_date_facility 
  ON amr_surveillance.resistance_results_partitioned (created_at, facility_id)
  WHERE result = 'R';

-- Specialized indexes for One Health queries
CREATE INDEX idx_isolates_one_health 
  ON amr_surveillance.isolates (source, organism_id, collection_date)
  INCLUDE (facility_id, location_coordinates);

-- Full-text search for clinical notes
CREATE INDEX idx_clinical_notes_fts 
  ON clinical.notes USING gin(to_tsvector('english', note_text));

-- Materialized view for real-time dashboards
CREATE MATERIALIZED VIEW amr_surveillance.dashboard_stats AS
WITH resistance_summary AS (
  SELECT 
    DATE_TRUNC('day', created_at) as date,
    organism_id,
    antibiotic,
    facility_id,
    source,
    COUNT(*) as tests,
    COUNT(*) FILTER (WHERE result = 'R') as resistant,
    COUNT(*) FILTER (WHERE result = 'I') as intermediate,
    COUNT(*) FILTER (WHERE result = 'S') as susceptible
  FROM amr_surveillance.resistance_results_partitioned
  WHERE created_at >= CURRENT_DATE - INTERVAL '90 days'
  GROUP BY 1, 2, 3, 4, 5
)
SELECT 
  date,
  o.name as organism_name,
  antibiotic,
  f.name as facility_name,
  source,
  tests,
  resistant,
  intermediate,
  susceptible,
  ROUND(resistant::DECIMAL / NULLIF(tests, 0) * 100, 2) as resistance_rate
FROM resistance_summary r
JOIN amr_surveillance.organisms o ON r.organism_id = o.id
JOIN platform.facilities f ON r.facility_id = f.id;

-- Refresh strategy
CREATE OR REPLACE FUNCTION refresh_dashboard_stats()
RETURNS void AS $
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY amr_surveillance.dashboard_stats;
END;
$ LANGUAGE plpgsql;

-- Schedule refresh every hour
SELECT cron.schedule('refresh-dashboard-stats', '0 * * * *', 'SELECT refresh_dashboard_stats()');
```

### ✅ Query Optimization Service

```tsx
// /src/platform/services/database/QueryOptimizer.ts
export class AMRQueryOptimizer {
  // Optimize surveillance queries
  static optimizeSurveillanceQuery(
    params: SurveillanceQueryParams
  ): OptimizedQuery {
    const { dateRange, facilities, organisms, antibiotics } = params;
    
    // Use partitioned tables for date ranges
    const usePartitioned = this.shouldUsePartitioned(dateRange);
    const tableName = usePartitioned 
      ? 'resistance_results_partitioned' 
      : 'resistance_results';
    
    // Build optimized query
    let query = `
      SELECT 
        ${this.selectColumns(params.fields)},
        COUNT(*) OVER() as total_count -- For pagination
      FROM amr_surveillance.${tableName} r
      JOIN amr_surveillance.isolates i ON r.isolate_id = i.id
      WHERE 1=1
    `;
    
    const queryParams: any[] = [];
    let paramIndex = 1;
    
    // Add date filter first (partition pruning)
    if (dateRange) {
      query += ` AND i.collection_date BETWEEN ${paramIndex} AND ${paramIndex + 1}`;
      queryParams.push(dateRange.start, dateRange.end);
      paramIndex += 2;
    }
    
    // Use indexed columns
    if (facilities?.length) {
      query += ` AND i.facility_id = ANY(${paramIndex}::text[])`;
      queryParams.push(facilities);
      paramIndex++;
    }
    
    // Optimize for common organism queries
    if (organisms?.length === 1 && this.isCommonOrganism(organisms[0])) {
      query += ` AND i.organism_id = ${paramIndex}::uuid`;
      queryParams.push(organisms[0]);
      paramIndex++;
    } else if (organisms?.length > 1) {
      query += ` AND i.organism_id = ANY(${paramIndex}::uuid[])`;
      queryParams.push(organisms);
      paramIndex++;
    }
    
    // Use materialized view for dashboard queries
    if (params.isDashboardQuery) {
      return {
        query: this.getDashboardQuery(params),
        params: queryParams,
        useCache: true,
        cacheKey: this.generateCacheKey(params),
        ttl: 300 // 5 minutes
      };
    }
    
    // Add pagination
    query += ` LIMIT ${paramIndex} OFFSET ${paramIndex + 1}`;
    queryParams.push(params.limit || 100, params.offset || 0);
    
    return {
      query,
      params: queryParams,
      useCache: false,
      estimatedCost: this.estimateQueryCost(query, queryParams)
    };
  }
  
  // Implement query result caching
  static async withCaching<T>(
    query: OptimizedQuery,
    executor: QueryExecutor
  ): Promise<T> {
    if (!query.useCache) {
      return executor.execute(query);
    }
    
    // Check cache
    const cached = await cache.get(query.cacheKey);
    if (cached) {
      monitoring.recordCacheHit('query', query.cacheKey);
      return cached;
    }
    
    // Execute and cache
    const result = await executor.execute(query);
    await cache.set(query.cacheKey, result, query.ttl);
    monitoring.recordCacheMiss('query', query.cacheKey);
    
    return result;
  }
}
```

### ✅ Real-time Data Processing

```tsx
// /src/platform/services/streaming/StreamProcessor.ts
export class AMRStreamProcessor {
  private kafka: KafkaClient;
  private processors: Map<string, StreamProcessor>;
  
  constructor() {
    this.kafka = new KafkaClient({
      brokers: process.env.KAFKA_BROKERS?.split(',') || [],
      clientId: 'amr-platform'
    });
    
    this.processors = new Map([
      ['lab-results', new LabResultProcessor()],
      ['outbreak-signals', new OutbreakSignalProcessor()],
      ['resistance-alerts', new ResistanceAlertProcessor()]
    ]);
  }
  
  // Process incoming lab results in real-time
  async processLabResults(): Promise<void> {
    const consumer = this.kafka.consumer({ 
      groupId: 'amr-lab-processor' 
    });
    
    await consumer.subscribe({ 
      topic: 'lab-results', 
      fromBeginning: false 
    });
    
    await consumer.run({
      eachMessage: async ({ message }) => {
        const result = JSON.parse(message.value.toString());
        
        // Validate and enrich
        const validated = await this.validateLabResult(result);
        const enriched = await this.enrichWithTerminology(validated);
        
        // Process for different purposes
        await Promise.all([
          this.updateRealTimeDashboard(enriched),
          this.checkForOutbreakSignals(enriched),
          this.evaluateResistanceTrends(enriched),
          this.generateClinicalAlerts(enriched)
        ]);
        
        // Store in database
        await this.persistResult(enriched);
        
        // Update caches
        await this.updateCaches(enriched);
      }
    });
  }
  
  // Detect outbreak signals in real-time
  private async checkForOutbreakSignals(
    result: EnrichedLabResult
  ): Promise<void> {
    const processor = this.processors.get('outbreak-signals');
    
    // Check for unusual patterns
    const signals = await processor.detectSignals({
      organism: result.organism,
      facility: result.facility,
      resistanceProfile: result.resistanceProfile,
      timestamp: result.timestamp
    });
    
    if (signals.length > 0) {
      // Generate alerts
      for (const signal of signals) {
        await this.generateOutbreakAlert({
          signal,
          severity: signal.score > 0.8 ? 'critical' : 'warning',
          affectedFacilities: await this.identifyRelatedFacilities(signal),
          recommendedActions: await this.generateRecommendations(signal)
        });
      }
    }
  }
}
```

📌 **Performance Optimization Rules:**

- **Use database partitioning for time-series data.**
- **Implement materialized views for dashboard queries.**
- **Cache frequently accessed data with appropriate TTLs.**
- **Process real-time data streams for immediate insights.**
- **Optimize queries based on actual usage patterns.**

---

## 🌐 Integration Architecture

### ✅ Laboratory Information System Integration

```tsx
// /src/integrations/lis/LISConnector.ts
export class LISConnector {
  private adapters: Map<string, LISAdapter>;
  
  constructor() {
    this.adapters = new Map([
      ['epic', new EpicAdapter()],
      ['cerner', new CernerAdapter()],
      ['meditech', new MeditechAdapter()],
      ['custom-hl7', new HL7Adapter()],
      ['custom-api', new APIAdapter()]
    ]);
  }
  
  // Configure LIS connection
  async configureLIS(config: LISConfig): Promise<LISConnection> {
    const adapter = this.adapters.get(config.type);
    
    if (!adapter) {
      throw new Error(`Unsupported LIS type: ${config.type}`);
    }
    
    // Test connection
    const connection = await adapter.connect({
      host: config.host,
      port: config.port,
      credentials: config.credentials,
      options: config.options
    });
    
    // Validate data mapping
    const mappingValidation = await this.validateMapping(
      connection,
      config.mapping
    );
    
    if (!mappingValidation.valid) {
      throw new Error(
        `Invalid mapping configuration: ${mappingValidation.errors.join(', ')}`
      );
    }
    
    // Set up data flow
    await this.setupDataFlow(connection, config);
    
    return connection;
  }
  
  // Process incoming HL7 messages
  async processHL7Message(message: string): Promise<ProcessedResult> {
    const parsed = hl7.parse(message);
    
    // Extract relevant segments
    const msh = parsed.getSegment('MSH');
    const pid = parsed.getSegment('PID');
    const obr = parsed.getSegment('OBR');
    const obxSegments = parsed.getAllSegments('OBX');
    
    // Map to FHIR resources
    const specimen = await this.mapToFHIRSpecimen({
      msh, pid, obr
    });
    
    const observations = await Promise.all(
      obxSegments.map(obx => this.mapToFHIRObservation({
        obx, specimen, pid
      }))
    );
    
    // Validate clinical data
    const validation = await this.validateClinicalData({
      specimen,
      observations
    });
    
    if (!validation.valid) {
      await this.handleValidationErrors(validation, message);
    }
    
    return {
      specimen,
      observations,
      metadata: {
        source: msh.sendingApplication,
        timestamp: msh.timestamp,
        messageId: msh.messageControlId
      }
    };
  }
  
  // Map local codes to standard terminologies
  private async mapToStandardTerminology(
    localCode: string,
    codeSystem: string,
    lisType: string
  ): Promise<StandardCode> {
    // Check mapping cache
    const cached = await this.mappingCache.get(
      `${lisType}:${codeSystem}:${localCode}`
    );
    
    if (cached) {
      return cached;
    }
    
    // Use terminology service
    const mapped = await terminologyService.map({
      sourceSystem: `${lisType}-${codeSystem}`,
      sourceCode: localCode,
      targetSystems: ['LOINC', 'SNOMED-CT', 'WHONET']
    });
    
    // Cache mapping
    await this.mappingCache.set(
      `${lisType}:${codeSystem}:${localCode}`,
      mapped,
      86400 // 24 hours
    );
    
    return mapped;
  }
}
```

### ✅ WHONET Integration

```tsx
// /src/integrations/whonet/WHONETService.ts
export class WHONETService {
  // Import WHONET file
  async importWHONETFile(
    file: File,
    options: ImportOptions
  ): Promise<ImportResult> {
    // Parse WHONET format
    const parser = new WHONETParser(options.version);
    const data = await parser.parse(file);
    
    // Validate structure
    const structureValidation = await this.validateStructure(data);
    if (!structureValidation.valid) {
      return {
        success: false,
        errors: structureValidation.errors
      };
    }
    
    // Map to internal format
    const mapped = await this.mapWHONETData(data);
    
    // Validate clinical data
    const clinicalValidation = await this.validateClinicalData(mapped);
    
    // Import with transaction
    const importResult = await database.transaction(async (client) => {
      const results = {
        organisms: 0,
        isolates: 0,
        resistanceResults: 0,
        errors: []
      };
      
      // Import organisms
      for (const organism of mapped.organisms) {
        try {
          await this.importOrganism(client, organism);
          results.organisms++;
        } catch (error) {
          results.errors.push({
            type: 'organism',
            data: organism,
            error: error.message
          });
        }
      }
      
      // Import isolates
      for (const isolate of mapped.isolates) {
        try {
          await this.importIsolate(client, isolate);
          results.isolates++;
        } catch (error) {
          results.errors.push({
            type: 'isolate',
            data: isolate,
            error: error.message
          });
        }
      }
      
      // Import resistance results
      for (const result of mapped.resistanceResults) {
        try {
          await this.importResistanceResult(client, result);
          results.resistanceResults++;
        } catch (error) {
          results.errors.push({
            type: 'resistance',
            data: result,
            error: error.message
          });
        }
      }
      
      return results;
    }, 'whonet-import');
    
    // Generate import report
    const report = await this.generateImportReport(importResult);
    
    return {
      success: true,
      imported: importResult,
      report,
      warnings: clinicalValidation.warnings
    };
  }
  
  // Export to WHONET format
  async exportToWHONET(
    criteria: ExportCriteria
  ): Promise<WHONETExport> {
    // Query data
    const data = await this.queryExportData(criteria);
    
    // Map to WHONET format
    const whonetData = await this.mapToWHONETFormat(data);
    
    // Apply WHONET-specific rules
    const processed = await this.applyWHONETRules(whonetData);
    
    // Generate file
    const file = await this.generateWHONETFile(processed, {
      version: criteria.whonetVersion || '2023',
      encoding: criteria.encoding || 'UTF-8',
      delimiter: criteria.delimiter || '\t'
    });
    
    // Validate export
    const validation = await this.validateWHONETExport(file);
    
    return {
      file,
      recordCount: processed.length,
      validation,
      metadata: {
        exportDate: new Date(),
        criteria,
        checksum: await this.calculateChecksum(file)
      }
    };
  }
}
```

📌 **Integration Rules:**

- **Support major LIS vendors and custom implementations.**
- **Maintain bidirectional mapping between local and standard codes.**
- **Validate all imported data against clinical rules.**
- **Support batch and real-time data integration.**
- **Provide detailed import/export reports for audit trails.**

---

## 🎯 Module Development Guidelines

### ✅ Creating a New Surveillance Module

```bash
# PowerShell script for new module creation
# /scripts/create-amr-module.ps1

param(
  [Parameter(Mandatory=$true)]
  [string]$ModuleName,
  
  [Parameter(Mandatory=$true)]
  [ValidateSet("surveillance", "clinical", "analytics", "management")]
  [string]$Category,
  
  [string]$Description = "New AMR surveillance module"
)

# Create module directory structure
$ModulePath = "src/modules/$ModuleName"
$Directories = @(
  "$ModulePath/components",
  "$ModulePath/pages",
  "$ModulePath/stores",
  "$ModulePath/services",
  "$ModulePath/hooks",
  "$ModulePath/utils",
  "$ModulePath/types",
  "$ModulePath/tests"
)

foreach ($Dir in $Directories) {
  New-Item -ItemType Directory -Path $Dir -Force
}

# Create module configuration
$ConfigContent = @"
import { AMRModuleConfig } from '@/platform/types';

export const ${ModuleName}Config: AMRModuleConfig = {
  id: '$ModuleName',
  name: '$($ModuleName -replace '-', ' ' -replace '\b\w', { $_.ToUpper() })',
  description: '$Description',
  version: '1.0.0',
  category: '$Category',
  icon: 'module-icon',
  enabled: true,
  
  clinicalDomains: [],
  dataScopes: ['human', 'animal', 'environmental'],
  
  permissions: [
    'view-$ModuleName-data',
    'manage-$ModuleName-settings'
  ],
  
  routes: [
    {
      path: '/$ModuleName',
      component: () => import('./pages/Dashboard'),
      permissions: ['view-$ModuleName-data']
    }
  ],
  
  navigation: {
    label: '$($ModuleName -replace '-', ' ' -replace '\b\w', { $_.ToUpper() })',
    order: 10,
    children: [
      { label: 'Dashboard', path: '/$ModuleName' }
    ]
  },
  
  dependencies: [],
  requiredData: {
    tables: [],
    fhirResources: [],
    terminologies: []
  }
};
"@

Set-Content -Path "$ModulePath/module.config.ts" -Value $ConfigContent

# Create index file
$IndexContent = @"
export { ${ModuleName}Config } from './module.config';

export async function initialize() {
  console.log('Initializing $ModuleName module');
  // Module initialization logic
}

export async function cleanup() {
  console.log('Cleaning up $ModuleName module');
  // Module cleanup logic
}
"@

Set-Content -Path "$ModulePath/index.ts" -Value $IndexContent

# Create dashboard component
$DashboardContent = @"
import React from 'react';
import { useModulePermissions } from '@/platform/hooks/usePermissions';

export function Dashboard() {
  const { hasPermission } = useModulePermissions('$ModuleName');
  
  if (!hasPermission('view-$ModuleName-data')) {
    return <AccessDenied module='$ModuleName' />;
  }
  
  return (
    <div className='module-dashboard'>
      <h1 className='text-2xl font-bold mb-4'>
        $($ModuleName -replace '-', ' ' -replace '\b\w', { $_.ToUpper() }) Dashboard
      </h1>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {/* Add dashboard content here */}
      </div>
    </div>
  );
}
"@

Set-Content -Path "$ModulePath/pages/Dashboard.tsx" -Value $DashboardContent

# Register module
$RegistryPath = "src/registry/modules.config.ts"
$RegistryContent = Get-Content $RegistryPath -Raw

if ($RegistryContent -notmatch "import.*$ModuleName") {
  $ImportStatement = "import { ${ModuleName}Config } from '@/modules/$ModuleName/module.config';"
  $RegistryContent = $ImportStatement + "`n" + $RegistryContent
  
  $RegistryContent = $RegistryContent -replace "(export const registeredModules = \[)", "`$1`n  ${ModuleName}Config,"
  
  Set-Content -Path $RegistryPath -Value $RegistryContent
}

Write-Host "✅ Module '$ModuleName' created successfully!" -ForegroundColor Green
Write-Host "📁 Location: $ModulePath" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Update module.config.ts with specific requirements"
Write-Host "2. Implement dashboard functionality"
Write-Host "3. Add module-specific services and components"
Write-Host "4. Configure required permissions and data access"
```

### ✅ Module Testing Framework

```tsx
// /src/modules/surveillance-monitoring/tests/SurveillanceModule.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { TestProviders } from '@/platform/testing/TestProviders';
import { Dashboard } from '../pages/Dashboard';

describe('Surveillance Monitoring Module', () => {
  describe('Dashboard', () => {
    it('displays resistance data when user has permissions', async () => {
      const mockUser = createMockUser({
        permissions: ['view-surveillance-data']
      });
      
      render(
        <TestProviders user={mockUser}>
          <Dashboard />
        </TestProviders>
      );
      
      await waitFor(() => {
        expect(screen.getByText('Resistance Patterns')).toBeInTheDocument();
      });
      
      expect(screen.getByTestId('resistance-chart')).toBeInTheDocument();
      expect(screen.getByTestId('outbreak-alerts')).toBeInTheDocument();
    });
    
    it('shows access denied when user lacks permissions', () => {
      const mockUser = createMockUser({
        permissions: []
      });
      
      render(
        <TestProviders user={mockUser}>
          <Dashboard />
        </TestProviders>
      );
      
      expect(screen.getByText('Access Denied')).toBeInTheDocument();
    });
  });
  
  describe('Data Integration', () => {
    it('correctly processes WHONET data', async () => {
      const whonetData = createMockWHONETData();
      const processed = await processWHONETImport(whonetData);
      
      expect(processed.isolates).toHaveLength(100);
      expect(processed.errors).toHaveLength(0);
      expect(processed.warnings).toHaveLength(0);
    });
    
    it('validates resistance results against breakpoints', async () => {
      const result = createMockResistanceResult({
        antibiotic: 'Ampicillin',
        mic: 16,
        organism: 'E. coli'
      });
      
      const interpretation = await interpretResistance(result, 'CLSI-2024');
      
      expect(interpretation.result).toBe('R');
      expect(interpretation.breakpoint).toBe(8);
      expect(interpretation.confidence).toBeGreaterThan(0.95);
    });
  });
});
```

📌 **Module Development Rules:**

- **Follow consistent module structure across all modules.**
- **Include comprehensive tests for clinical accuracy.**
- **Document all module-specific algorithms and calculations.**
- **Ensure modules can operate independently when possible.**
- **Maintain backward compatibility when updating modules.**

---

## 🎨 UI/UX Design System for Healthcare

### ✅ Healthcare-Optimized Tailwind Configuration

```javascript
// /tailwind.config.js
module.exports = {
  content: [
    './src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        // Clinical semantic colors
        'resistant': {
          50: '#fef2f2',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          900: '#7f1d1d'
        },
        'intermediate': {
          50: '#fffbeb',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          900: '#78350f'
        },
        'susceptible': {
          50: '#f0fdf4',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          900: '#14532d'
        },
        
        // Priority levels
        'critical-priority': '#dc2626',
        'high-priority': '#ea580c',
        'medium-priority': '#ca8a04',
        
        // One Health sectors
        'human-health': '#3b82f6',
        'animal-health': '#8b5cf6',
        'environmental-health': '#10b981',
        'food-safety': '#f59e0b',
        
        // Clinical areas
        'microbiology': '#6366f1',
        'epidemiology': '#ec4899',
        'laboratory': '#14b8a6',
        'pharmacy': '#f97316',
        
        // Status colors
        'validated': '#059669',
        'pending': '#eab308',
        'rejected': '#e11d48',
        
        // Dashboard colors
        'dashboard-bg': '#f8fafc',
        'dashboard-card': '#ffffff',
        'dashboard-border': '#e2e8f0'
      },
      
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        clinical: ['IBM Plex Sans', 'sans-serif']
      },
      
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem'
      },
      
      animation: {
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-in'
      },
      
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        }
      }
    }
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@headlessui/tailwindcss'),
    
    // Custom AMR components
    function({ addComponents, theme }) {
      addComponents({
        // Resistance indicator badges
        '.resistance-badge': {
          padding: theme('spacing.1') + ' ' + theme('spacing.3'),
          borderRadius: theme('borderRadius.full'),
          fontSize: theme('fontSize.sm'),
          fontWeight: theme('fontWeight.semibold'),
          textTransform: 'uppercase',
          letterSpacing: theme('letterSpacing.wider'),
          
          '&.resistant': {
            backgroundColor: theme('colors.resistant.100'),
            color: theme('colors.resistant.700'),
            border: `1px solid ${theme('colors.resistant.300')}`
          },
          '&.intermediate': {
            backgroundColor: theme('colors.intermediate.100'),
            color: theme('colors.intermediate.700'),
            border: `1px solid ${theme('colors.intermediate.300')}`
          },
          '&.susceptible': {
            backgroundColor: theme('colors.susceptible.100'),
            color: theme('colors.susceptible.700'),
            border: `1px solid ${theme('colors.susceptible.300')}`
          }
        },
        
        // Clinical data table
        '.clinical-table': {
          '& thead': {
            backgroundColor: theme('colors.gray.50'),
            borderBottom: `2px solid ${theme('colors.gray.200')}`
          },
          '& th': {
            padding: theme('spacing.3'),
            fontSize: theme('fontSize.xs'),
            fontWeight: theme('fontWeight.semibold'),
            textTransform: 'uppercase',
            letterSpacing: theme('letterSpacing.wider'),
            color: theme('colors.gray.600')
          },
          '& td': {
            padding: theme('spacing.3'),
            fontSize: theme('fontSize.sm'),
            borderBottom: `1px solid ${theme('colors.gray.100')`
          },
          '& tr:hover': {
            backgroundColor: theme('colors.gray.50')
          }
        },
        
        // Priority indicators
        '.priority-indicator': {
          width: theme('spacing.2'),
          height: theme('spacing.2'),
          borderRadius: theme('borderRadius.full'),
          
          '&.critical': {
            backgroundColor: theme('colors.critical-priority'),
            animation: theme('animation.pulse')
          },
          '&.high': {
            backgroundColor: theme('colors.high-priority')
          },
          '&.medium': {
            backgroundColor: theme('colors.medium-priority')
          }
        },
        
        // Healthcare cards
        '.healthcare-card': {
          backgroundColor: theme('colors.white'),
          borderRadius: theme('borderRadius.lg'),
          boxShadow: theme('boxShadow.sm'),
          border: `1px solid ${theme('colors.gray.200')}`,
          padding: theme('spacing.6'),
          
          '&:hover': {
            boxShadow: theme('boxShadow.md'),
            transform: 'translateY(-2px)',
            transition: 'all 0.2s ease'
          }
        },
        
        // One Health sector badges
        '.sector-badge': {
          padding: theme('spacing.1') + ' ' + theme('spacing.2'),
          borderRadius: theme('borderRadius.md'),
          fontSize: theme('fontSize.xs'),
          fontWeight: theme('fontWeight.medium'),
          
          '&.human': {
            backgroundColor: theme('colors.human-health') + '20',
            color: theme('colors.human-health'),
            border: `1px solid ${theme('colors.human-health')}40`
          },
          '&.animal': {
            backgroundColor: theme('colors.animal-health') + '20',
            color: theme('colors.animal-health'),
            border: `1px solid ${theme('colors.animal-health')}40`
          },
          '&.environmental': {
            backgroundColor: theme('colors.environmental-health') + '20',
            color: theme('colors.environmental-health'),
            border: `1px solid ${theme('colors.environmental-health')}40`
          }
        }
      });
    }
  ]
};
```

### ✅ Clinical Data Visualization Components

```tsx
// /src/platform/components/clinical/ResistanceHeatmap.tsx
import { useMemo } from 'react';
import { HeatmapChart } from '@/platform/components/charts/HeatmapChart';

interface ResistanceHeatmapProps {
  data: ResistanceData[];
  organisms: string[];
  antibiotics: string[];
  colorScale?: 'standard' | 'accessible';
  showValues?: boolean;
  interactive?: boolean;
}

export function ResistanceHeatmap({
  data,
  organisms,
  antibiotics,
  colorScale = 'standard',
  showValues = true,
  interactive = true
}: ResistanceHeatmapProps) {
  const heatmapData = useMemo(() => {
    return organisms.map(organism => {
      return antibiotics.map(antibiotic => {
        const result = data.find(
          d => d.organism === organism && d.antibiotic === antibiotic
        );
        
        return {
          x: antibiotic,
          y: organism,
          value: result?.resistanceRate || 0,
          count: result?.totalTests || 0,
          interpretation: getInterpretation(result?.resistanceRate)
        };
      });
    }).flat();
  }, [data, organisms, antibiotics]);
  
  const colorScales = {
    standard: {
      0: '#16a34a',    // Green - Low resistance
      25: '#eab308',   // Yellow - Moderate
      50: '#f97316',   // Orange - High
      75: '#dc2626'    // Red - Very high
    },
    accessible: {
      0: '#0e7490',    // Teal - Low
      25: '#7c3aed',   // Purple - Moderate
      50: '#db2777',   // Pink - High
      75: '#991b1b'    // Dark red - Very high
    }
  };
  
  return (
    <div className="resistance-heatmap">
      <div className="flex justify-between mb-4">
        <h3 className="text-lg font-semibold">Antibiogram</h3>
        <div className="flex gap-2">
          <span className="text-sm text-gray-600">
            Total isolates: {data.reduce((sum, d) => sum + d.totalTests, 0).toLocaleString()}
          </span>
        </div>
      </div>
      
      <HeatmapChart
        data={heatmapData}
        colorScale={colorScales[colorScale]}
        tooltip={(datum) => (
          <div className="p-2 bg-white rounded shadow-lg border">
            <div className="font-semibold">{datum.y}</div>
            <div className="text-sm text-gray-600">{datum.x}</div>
            <div className="flex items-center gap-2 mt-1">
              <span className={`resistance-badge ${datum.interpretation.toLowerCase()}`}>
                {datum.value.toFixed(1)}% R
              </span>
              <span className="text-xs text-gray-500">
                (n={datum.count})
              </span>
            </div>
          </div>
        )}
        showValues={showValues}
        interactive={interactive}
        className="w-full h-96"
      />
      
      <div className="flex justify-center gap-4 mt-4">
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-susceptible-500 rounded"></div>
          <span className="text-sm text-gray-600">0-10% Resistant</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-intermediate-500 rounded"></div>
          <span className="text-sm text-gray-600">11-50% Resistant</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-resistant-500 rounded"></div>
          <span className="text-sm text-gray-600">&gt;50% Resistant</span>
        </div>
      </div>
    </div>
  );
}
```

### ✅ Clinical Alert Components

```tsx
// /src/platform/components/clinical/ClinicalAlert.tsx
import { AlertCircle, AlertTriangle, Info, CheckCircle } from 'lucide-react';

interface ClinicalAlertProps {
  type: 'critical' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  actions?: AlertAction[];
  metadata?: Record<string, any>;
  onDismiss?: () => void;
}

export function ClinicalAlert({
  type,
  title,
  message,
  actions,
  metadata,
  onDismiss
}: ClinicalAlertProps) {
  const configs = {
    critical: {
      icon: AlertCircle,
      className: 'border-red-500 bg-red-50',
      iconColor: 'text-red-600',
      titleColor: 'text-red-900',
      messageColor: 'text-red-700'
    },
    warning: {
      icon: AlertTriangle,
      className: 'border-orange-500 bg-orange-50',
      iconColor: 'text-orange-600',
      titleColor: 'text-orange-900',
      messageColor: 'text-orange-700'
    },
    info: {
      icon: Info,
      className: 'border-blue-500 bg-blue-50',
      iconColor: 'text-blue-600',
      titleColor: 'text-blue-900',
      messageColor: 'text-blue-700'
    },
    success: {
      icon: CheckCircle,
      className: 'border-green-500 bg-green-50',
      iconColor: 'text-green-600',
      titleColor: 'text-green-900',
      messageColor: 'text-green-700'
    }
  };
  
  const config = configs[type];
  const Icon = config.icon;
  
  return (
    <div className={`clinical-alert border-l-4 p-4 rounded-r-lg ${config.className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <Icon className={`h-5 w-5 ${config.iconColor}`} />
        </div>
        <div className="ml-3 flex-1">
          <h3 className={`text-sm font-semibold ${config.titleColor}`}>
            {title}
          </h3>
          <div className={`mt-1 text-sm ${config.messageColor}`}>
            {message}
          </div>
          
          {metadata && (
            <div className="mt-2 text-xs space-y-1">
              {Object.entries(metadata).map(([key, value]) => (
                <div key={key} className="flex gap-2">
                  <span className="font-medium capitalize">
                    {key.replace(/_/g, ' ')}:
                  </span>
                  <span>{String(value)}</span>
                </div>
              ))}
            </div>
          )}
          
          {actions && actions.length > 0 && (
            <div className="mt-3 flex gap-2">
              {actions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.onClick}
                  className={`
                    px-3 py-1 text-sm font-medium rounded-md
                    ${action.primary 
                      ? `bg-${type === 'critical' ? 'red' : type === 'warning' ? 'orange' : 'blue'}-600 text-white hover:bg-${type === 'critical' ? 'red' : type === 'warning' ? 'orange' : 'blue'}-700`
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }
                  `}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
        
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="flex-shrink-0 ml-4 text-gray-400 hover:text-gray-600"
          >
            <span className="sr-only">Dismiss</span>
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
```

📌 **UI/UX Design Rules:**

- **Use clinical semantic colors consistently (resistant/intermediate/susceptible).**
- **Prioritize data density while maintaining readability.**
- **Include visual indicators for critical information.**
- **Support both light and dark modes for different viewing conditions.**
- **Ensure accessibility with WCAG 2.1 AA compliance.**

---

## 🚀 Deployment & Infrastructure

### ✅ Docker Configuration for AMR Platform

```dockerfile
# /Dockerfile
FROM node:18-alpine AS builder

# Install dependencies
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Copy source and build
COPY . .
RUN npm run build

# Production image
FROM node:18-alpine AS runtime

# Install PostgreSQL client for health checks
RUN apk add --no-cache postgresql-client

# Create non-root user
RUN addgroup -g 1001 -S amr && \
    adduser -S amr -u 1001

# Copy built application
WORKDIR /app
COPY --from=builder --chown=amr:amr /app/dist ./dist
COPY --from=builder --chown=amr:amr /app/node_modules ./node_modules
COPY --from=builder --chown=amr:amr /app/package.json ./

# Health check script
COPY --chown=amr:amr docker/health-check.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/health-check.sh

# Security: Run as non-root
USER amr

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=30s --retries=3 \
  CMD /usr/local/bin/health-check.sh

# Start application
CMD ["node", "./dist/server/entry.mjs"]
```

### ✅ Kubernetes Deployment

```yaml
# /k8s/amr-platform-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: amr-platform
  namespace: amr-surveillance
  labels:
    app: amr-platform
    component: web
spec:
  replicas: 3
  selector:
    matchLabels:
      app: amr-platform
      component: web
  template:
    metadata:
      labels:
        app: amr-platform
        component: web
    spec:
      # Security context
      securityContext:
        runAsNonRoot: true
        runAsUser: 1001
        fsGroup: 1001
      
      # Anti-affinity for HA
      affinity:
        podAntiAffinity:
          preferredDuringSchedulingIgnoredDuringExecution:
          - weight: 100
            podAffinityTerm:
              labelSelector:
                matchExpressions:
                - key: app
                  operator: In
                  values:
                  - amr-platform
              topologyKey: kubernetes.io/hostname
      
      containers:
      - name: amr-platform
        image: amr-platform:latest
        imagePullPolicy: IfNotPresent
        
        ports:
        - containerPort: 3000
          name: http
          protocol: TCP
        
        # Resource limits
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "2Gi"
            cpu: "1000m"
        
        # Environment variables
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: amr-platform-secrets
              key: database-url
        - name: FHIR_SERVER_URL
          valueFrom:
            configMapKeyRef:
              name: amr-platform-config
              key: fhir-server-url
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: amr-platform-secrets
              key: redis-url
        
        # Health checks
        livenessProbe:
          httpGet:
            path: /health/live
            port: http
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3
        
        readinessProbe:
          httpGet:
            path: /health/ready
            port: http
          initialDelaySeconds: 15
          periodSeconds: 5
          timeoutSeconds: 3
          failureThreshold: 3
        
        # Volume mounts
        volumeMounts:
        - name: config
          mountPath: /app/config
          readOnly: true
        - name: tmp
          mountPath: /tmp
      
      volumes:
      - name: config
        configMap:
          name: amr-platform-config
      - name: tmp
        emptyDir: {}

---
# Service
apiVersion: v1
kind: Service
metadata:
  name: amr-platform
  namespace: amr-surveillance
spec:
  type: ClusterIP
  selector:
    app: amr-platform
    component: web
  ports:
  - port: 80
    targetPort: http
    protocol: TCP
    name: http

---
# Horizontal Pod Autoscaler
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: amr-platform-hpa
  namespace: amr-surveillance
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: amr-platform
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

### ✅ Infrastructure as Code

```typescript
// /infrastructure/terraform/main.tf
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.0"
    }
  }
}

# EKS Cluster for AMR Platform
module "eks" {
  source = "terraform-aws-modules/eks/aws"
  
  cluster_name    = "amr-surveillance-cluster"
  cluster_version = "1.28"
  
  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnets
  
  # Node groups
  eks_managed_node_groups = {
    general = {
      desired_size = 3
      min_size     = 3
      max_size     = 10
      
      instance_types = ["t3.large"]
      
      labels = {
        Environment = "production"
        Application = "amr-platform"
      }
    }
    
    compute = {
      desired_size = 2
      min_size     = 1
      max_size     = 5
      
      instance_types = ["c5.xlarge"]
      
      labels = {
        Environment = "production"
        Workload    = "ml-processing"
      }
      
      taints = [{
        key    = "workload"
        value  = "ml"
        effect = "NO_SCHEDULE"
      }]
    }
  }
  
  # Enable IRSA
  enable_irsa = true
  
  # Cluster addons
  cluster_addons = {
    coredns = {
      most_recent = true
    }
    kube-proxy = {
      most_recent = true
    }
    vpc-cni = {
      most_recent = true
    }
    aws-ebs-csi-driver = {
      most_recent = true
    }
  }
}

# RDS for PostgreSQL
module "rds" {
  source = "terraform-aws-modules/rds/aws"
  
  identifier = "amr-surveillance-db"
  
  engine               = "postgres"
  engine_version       = "15.4"
  instance_class       = "db.r6g.xlarge"
  allocated_storage    = 100
  storage_encrypted    = true
  
  db_name  = "amr_surveillance"
  username = "amr_admin"
  port     = "5432"
  
  vpc_security_group_ids = [module.security_group.security_group_id]
  
  # Backups
  backup_retention_period = 30
  backup_window          = "03:00-06:00"
  
  # Enhanced monitoring
  enabled_cloudwatch_logs_exports = ["postgresql"]
  monitoring_interval             = "30"
  monitoring_role_name           = "AMRDatabaseMonitoringRole"
  
  # High availability
  multi_az = true
  
  # Parameter group
  family = "postgres15"
  parameters = [
    {
      name  = "shared_preload_libraries"
      value = "pg_stat_statements,pgaudit"
    },
    {
      name  = "log_statement"
      value = "all"
    }
  ]
}
```

📌 **Deployment Rules:**

- **Use container orchestration for scalability.**
- **Implement proper health checks at all levels.**
- **Ensure high availability with multiple replicas.**
- **Configure auto-scaling based on load.**
- **Maintain infrastructure as code for reproducibility.**

---

## 🔥 Final Implementation Guidelines

### ✅ Development Workflow

1. **Module-First Development**
   - Start with module configuration
   - Define data models and types
   - Implement services and business logic
   - Build UI components
   - Add comprehensive tests

2. **Standards Compliance**
   - Validate all data against FHIR profiles
   - Map local codes to standard terminologies
   - Ensure WHO GLASS compatibility
   - Follow clinical guidelines (CLSI/EUCAST)

3. **Quality Assurance**
   - Unit tests for all calculations
   - Integration tests for data flows
   - End-to-end tests for critical paths
   - Performance tests for large datasets
   - Security tests for access control

4. **Documentation**
   - API documentation with OpenAPI
   - Clinical algorithm documentation
   - User guides for each module
   - Administrator guides
   - Integration guides for external systems

### ✅ Production Readiness Checklist

- [ ] All modules pass clinical validation
- [ ] Security assessment completed
- [ ] Performance benchmarks met
- [ ] Disaster recovery plan tested
- [ ] Monitoring and alerting configured
- [ ] Documentation complete
- [ ] Training materials prepared
- [ ] Support processes established

### ✅ Maintenance & Evolution

1. **Regular Updates**
   - Clinical guidelines (quarterly)
   - Terminology mappings (monthly)
   - Security patches (as needed)
   - Feature releases (bi-monthly)

2. **Continuous Improvement**
   - Monitor user feedback
   - Track system performance
   - Analyze clinical outcomes
   - Optimize based on usage patterns

3. **Scaling Strategy**
   - Horizontal scaling for user growth
   - Data partitioning for volume growth
   - Geographic distribution for global deployment
   - Edge computing for remote facilities

---

This comprehensive copilot instruction document provides a complete blueprint for building the Advanced One-Health AMR Surveillance Platform, incorporating all the requirements from the PRD while following best practices for healthcare software development.# AMR Surveillance Platform - Copilot Instructions

A **comprehensive One-Health AMR surveillance platform** designed for real-time monitoring, analysis, and prediction of antimicrobial resistance patterns across human, animal, and environmental sectors. Built with **modular architecture** to support seamless integration of surveillance modules, clinical decision support, and policy-making tools.

## Core Technologies

- Astro
- React
- Nanostores
- Tailwind CSS
- PostgreSQL
- TypeScript

**Important:** Do not use an ORM, just use the native PostgreSQL driver.
Make sure all terminal commands work in PowerShell.

Astro, React, Nanostores and Tailwind CSS are already installed.

## 🏛️ Platform Architecture Philosophy

**AMR Surveillance Platform is built as a modular, standards-compliant system** where:
- Each surveillance module is a **self-contained application**
- Modules can be **enabled/disabled based on country requirements**
- New surveillance capabilities can be **added without disrupting core functionality**
- **Shared services** (auth, FHIR, terminology, analytics) are available to all modules
- **International standards** (WHO GLASS, FHIR R4, LOINC, SNOMED CT) are natively supported
- **One-Health principles** enable cross-sector data integration and analysis

# 🏗 Modular Platform Architecture for AMR Surveillance

This guide outlines **best practices** for building the **AMR Surveillance Platform**. The goal is to create a **scalable, standards-compliant solution** that enables countries to monitor antimicrobial resistance effectively while maintaining flexibility for local requirements.

---

## 📁 AMR Platform Project Structure

**Healthcare-focused architecture** with clear separation between platform services and surveillance modules:

```
/src
  /platform         # Core platform functionality
    /components     # Shared UI components for healthcare data
      /ui           # Base components (tables, charts, forms)
      /clinical     # Clinical data displays (lab results, resistance profiles)
      /surveillance # Surveillance visualizations (heat maps, trend charts)
      /layout       # Platform layout (navigation, dashboards)
    /stores         # Platform-wide state management
      /auth         # Authentication & role-based access
      /fhir         # FHIR resource management
      /terminology  # LOINC/SNOMED CT integration
      /glass        # WHO GLASS compliance
    /hooks          # Platform-wide hooks
      /clinical     # Clinical data hooks
      /analytics    # Analytics and ML hooks
      /compliance   # Regulatory compliance hooks
    /utils          # Core utilities
      /validation   # Clinical data validation
      /calculations # Resistance calculations
      /standards    # Standards compliance utilities
    /services       # Platform services
      /database     # PostgreSQL service layer
      /fhir-server  # FHIR R4 API integration
      /terminology  # Terminology services
      /ml-engine    # Machine learning services
    /types          # TypeScript definitions
      /fhir         # FHIR resource types
      /clinical     # Clinical data types
      /surveillance # Surveillance types
  
  /modules          # Surveillance modules
    /data-collection     # Data Collection & Integration
      /components        # Import wizards, validation UI
      /pages            # Data management pages
      /stores           # Import state management
      /services         # ETL pipelines, validators
      /types            # Data format types
      module.config.ts  # Module configuration
      index.ts          # Module entry point
    
    /surveillance-monitoring  # Real-time Surveillance
      /components       # Dashboards, maps, alerts
      /pages           # Monitoring interfaces
      /stores          # Surveillance state
      /services        # Real-time processing
      /ml-models       # Outbreak detection models
      module.config.ts
      index.ts
    
    /clinical-decision     # Clinical Decision Support
      /components       # Treatment recommendations
      /pages           # CDS interfaces
      /stores          # Clinical state
      /services        # Decision algorithms
      /guidelines      # Clinical guidelines
      module.config.ts
      index.ts
    
    /analytics-intelligence  # Analytics & ML
      /components      # Analytics dashboards
      /pages          # ML model management
      /stores         # Analytics state
      /services       # ML pipelines
      /models         # Trained models
      module.config.ts
      index.ts
    
    /reporting-compliance   # Reporting & GLASS
      /components      # Report builders
      /pages          # Report interfaces
      /stores         # Report state
      /services       # Report generation
      /templates      # Report templates
      module.config.ts
      index.ts
    
    /quality-assurance     # Data Quality & Validation
      /components      # QA dashboards
      /pages          # Quality interfaces
      /stores         # QA state
      /services       # Validation rules
      module.config.ts
      index.ts
    
    /outbreak-response    # Outbreak Detection & Response
      /components     # Outbreak maps, timelines
      /pages         # Investigation tools
      /stores        # Outbreak state
      /services      # Detection algorithms
      module.config.ts
      index.ts
    
    /stewardship        # Antimicrobial Stewardship
      /components     # Stewardship metrics
      /pages         # Intervention tracking
      /stores        # Stewardship state
      /services      # DDD/DOT calculations
      module.config.ts
      index.ts
  
  /registry         # Module registry
    modules.config.ts    # Registered modules
    router.ts           # Dynamic routing
    permissions.ts      # Module permissions
    standards.ts        # Standards compliance
  
  /integrations     # External integrations
    /whonet         # WHONET import/export
    /glass          # WHO GLASS submission
    /fhir           # FHIR adapters
    /lis            # Laboratory system connectors
    /emr            # EMR/EHR integrations
  
  main.tsx          # Platform entry
  app.tsx           # Root component
  platform.config.ts # Platform configuration
```

📌 **AMR Architecture Rules:**

- **Each module represents a major functional area from the PRD.**
- **Modules follow WHO GLASS organizational structure.**
- **Healthcare standards (FHIR, LOINC, SNOMED) are first-class citizens.**
- **One-Health data integration is built into the architecture.**
- **Clinical accuracy and data quality are paramount.**

---

## 🔌 Module Configuration for AMR Platform

### ✅ AMR Module Registration Pattern

Each surveillance module registers with healthcare-specific metadata:

```tsx
// /src/modules/surveillance-monitoring/module.config.ts
import { AMRModuleConfig } from "@/platform/types";

export const surveillanceMonitoringConfig: AMRModuleConfig = {
  id: "surveillance-monitoring",
  name: "Real-time AMR Surveillance",
  description: "Monitor resistance patterns and detect outbreaks in real-time",
  version: "1.0.0",
  category: "surveillance",
  icon: "microscope",
  enabled: true,
  
  // Healthcare-specific configurations
  clinicalDomains: ["microbiology", "infectious-disease", "epidemiology"],
  dataScopes: ["human", "animal", "environmental"], // One-Health scopes
  
  // WHO GLASS compliance
  glassModules: ["AMR", "AMC"], // Resistance & Consumption
  glassIndicators: ["bloodstream-infections", "resistance-rates"],
  
  // Required permissions
  permissions: [
    "view-surveillance-data",
    "manage-outbreaks",
    "generate-alerts",
    "export-glass-data"
  ],
  
  // Module routes
  routes: [
    { 
      path: "/surveillance", 
      component: () => import("./pages/Dashboard"),
      permissions: ["view-surveillance-data"]
    },
    { 
      path: "/surveillance/outbreaks", 
      component: () => import("./pages/OutbreakMonitor"),
      permissions: ["manage-outbreaks"]
    },
    { 
      path: "/surveillance/resistance-map", 
      component: () => import("./pages/ResistanceMap"),
      permissions: ["view-surveillance-data"]
    }
  ],
  
  // Navigation structure
  navigation: {
    label: "Surveillance",
    icon: "chart-line",
    order: 1,
    children: [
      { label: "Dashboard", path: "/surveillance", icon: "dashboard" },
      { label: "Resistance Patterns", path: "/surveillance/resistance-map", icon: "map" },
      { label: "Outbreak Detection", path: "/surveillance/outbreaks", icon: "alert" },
      { label: "Trend Analysis", path: "/surveillance/trends", icon: "trending" }
    ]
  },
  
  // Data dependencies
  dependencies: ["data-collection"], // Requires data collection module
  requiredData: {
    tables: ["isolates", "resistance_results", "organisms", "facilities"],
    fhirResources: ["Specimen", "DiagnosticReport", "Observation"],
    terminologies: ["LOINC", "SNOMED-CT", "WHONET-Codes"]
  },
  
  // Integration points
  integrations: {
    fhir: {
      profiles: ["AMR-Specimen", "AMR-DiagnosticReport"],
      operations: ["$calculate-resistance", "$detect-outbreak"]
    },
    glass: {
      reports: ["resistance-surveillance", "outbreak-notification"],
      indicators: ["E.coli-bloodstream", "MRSA-rates"]
    }
  },
  
  // Quality metrics
  qualityIndicators: {
    dataCompleteness: 0.95, // 95% complete data required
    timeliness: 48, // Data must be <48 hours old
    accuracy: 0.99 // 99% accuracy threshold
  }
};
```

### ✅ Clinical Decision Support Module

```tsx
// /src/modules/clinical-decision/module.config.ts
export const clinicalDecisionConfig: AMRModuleConfig = {
  id: "clinical-decision",
  name: "Clinical Decision Support",
  description: "Evidence-based treatment recommendations and antibiograms",
  version: "1.0.0",
  category: "clinical",
  icon: "stethoscope",
  enabled: true,
  
  clinicalDomains: ["antimicrobial-therapy", "infection-control"],
  
  permissions: [
    "view-antibiograms",
    "access-treatment-recommendations",
    "prescribe-antibiotics"
  ],
  
  routes: [
    {
      path: "/clinical/antibiogram",
      component: () => import("./pages/Antibiogram"),
      permissions: ["view-antibiograms"]
    },
    {
      path: "/clinical/treatment-guide",
      component: () => import("./pages/TreatmentGuide"),
      permissions: ["access-treatment-recommendations"]
    }
  ],
  
  // Clinical guidelines integration
  guidelines: {
    sources: ["CLSI", "EUCAST", "WHO"],
    updateFrequency: "monthly",
    breakpointVersions: ["CLSI-2024", "EUCAST-14.0"]
  },
  
  // Decision support features
  decisionSupport: {
    algorithms: ["syndrome-based", "pathogen-based", "risk-stratified"],
    models: ["resistance-prediction", "treatment-outcome"],
    alerts: ["high-resistance", "treatment-failure-risk"]
  }
};
```

📌 **AMR Module Configuration Rules:**

- **Every module declares its clinical domains and data scopes.**
- **WHO GLASS compliance requirements are explicitly defined.**
- **Data quality thresholds are module-specific.**
- **Integration points with standards are clearly specified.**
- **Clinical guidelines and decision algorithms are versioned.**

---

## 🏥 Healthcare Data Standards Implementation

### ✅ FHIR Resource Management

```tsx
// /src/platform/services/fhir/FHIRService.ts
import { 
  Specimen, 
  DiagnosticReport, 
  Observation,
  Bundle,
  OperationOutcome 
} from 'fhir/r4';

export class AMRFHIRService {
  private fhirClient: FHIRClient;
  
  constructor() {
    this.fhirClient = new FHIRClient({
      baseUrl: process.env.FHIR_SERVER_URL,
      auth: {
        type: 'oauth2',
        clientId: process.env.FHIR_CLIENT_ID,
        clientSecret: process.env.FHIR_CLIENT_SECRET
      }
    });
  }
  
  // Create AMR-specific FHIR resources
  async createAMRSpecimen(data: AMRSpecimenData): Promise<Specimen> {
    const specimen: Specimen = {
      resourceType: 'Specimen',
      identifier: [{
        system: 'http://amr-platform.org/specimen',
        value: data.specimenId
      }],
      type: {
        coding: [{
          system: 'http://snomed.info/sct',
          code: data.specimenTypeCode,
          display: data.specimenTypeDisplay
        }]
      },
      subject: {
        reference: `Patient/${data.patientId}`
      },
      collection: {
        collectedDateTime: data.collectionDate,
        bodySite: {
          coding: [{
            system: 'http://snomed.info/sct',
            code: data.bodySiteCode
          }]
        }
      },
      extension: [{
        url: 'http://amr-platform.org/specimen-source',
        valueCode: data.source // 'human', 'animal', 'environmental'
      }]
    };
    
    return await this.fhirClient.create(specimen);
  }
  
  // Create resistance observation
  async createResistanceObservation(
    result: ResistanceResult
  ): Promise<Observation> {
    const observation: Observation = {
      resourceType: 'Observation',
      status: 'final',
      code: {
        coding: [{
          system: 'http://loinc.org',
          code: result.loincCode, // Antibiotic susceptibility LOINC code
          display: result.antibioticName
        }]
      },
      valueCodeableConcept: {
        coding: [{
          system: 'http://amr-platform.org/resistance',
          code: result.interpretation, // 'S', 'I', 'R'
          display: this.getInterpretationDisplay(result.interpretation)
        }]
      },
      component: [{
        code: {
          coding: [{
            system: 'http://loinc.org',
            code: '20578-1', // MIC value
            display: 'Minimum inhibitory concentration'
          }]
        },
        valueQuantity: {
          value: result.micValue,
          unit: 'ug/mL',
          system: 'http://unitsofmeasure.org',
          code: 'ug/mL'
        }
      }],
      specimen: {
        reference: `Specimen/${result.specimenId}`
      },
      performer: [{
        reference: `Organization/${result.laboratoryId}`
      }],
      issued: new Date().toISOString()
    };
    
    return await this.fhirClient.create(observation);
  }
  
  // Submit bundle to FHIR server
  async submitAMRBundle(
    specimen: Specimen,
    observations: Observation[]
  ): Promise<Bundle> {
    const bundle: Bundle = {
      resourceType: 'Bundle',
      type: 'transaction',
      entry: [
        {
          resource: specimen,
          request: {
            method: 'POST',
            url: 'Specimen'
          }
        },
        ...observations.map(obs => ({
          resource: obs,
          request: {
            method: 'POST',
            url: 'Observation'
          }
        }))
      ]
    };
    
    return await this.fhirClient.transaction(bundle);
  }
}
```

### ✅ Terminology Service Integration

```tsx
// /src/platform/services/terminology/TerminologyService.ts
export class AMRTerminologyService {
  private loinc: LOINCService;
  private snomed: SNOMEDService;
  private whonet: WHONETService;
  
  // Map local organism codes to standard terminologies
  async mapOrganism(localCode: string): Promise<OrganismMapping> {
    const mappings = {
      snomed: await this.snomed.findOrganism(localCode),
      whonet: await this.whonet.mapOrganism(localCode),
      ncbi: await this.ncbi.getTaxonomy(localCode)
    };
    
    return {
      localCode,
      snomedCode: mappings.snomed?.code,
      snomedDisplay: mappings.snomed?.display,
      whonetCode: mappings.whonet?.code,
      ncbiTaxId: mappings.ncbi?.taxId,
      gramStain: mappings.whonet?.gramStain,
      category: mappings.whonet?.category
    };
  }
  
  // Get antibiotic LOINC codes for AST
  async getAntibioticLOINC(
    antibiotic: string,
    method: 'MIC' | 'DISK' | 'ETEST'
  ): Promise<LOINCCode[]> {
    const methodMap = {
      'MIC': 'Minimum inhibitory concentration',
      'DISK': 'Disk diffusion',
      'ETEST': 'Gradient strip'
    };
    
    return await this.loinc.search({
      component: antibiotic,
      property: 'Susc',
      method: methodMap[method],
      system: 'Isolate'
    });
  }
  
  // Validate against terminology standards
  async validateClinicalCodes(data: ClinicalData): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    
    // Validate organism code
    if (!await this.isValidOrganism(data.organismCode)) {
      errors.push({
        field: 'organismCode',
        message: `Invalid organism code: ${data.organismCode}`,
        severity: 'error'
      });
    }
    
    // Validate antibiotic codes
    for (const antibiotic of data.antibiotics) {
      if (!await this.isValidAntibiotic(antibiotic.code)) {
        errors.push({
          field: `antibiotic.${antibiotic.code}`,
          message: `Invalid antibiotic code: ${antibiotic.code}`,
          severity: 'error'
        });
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
}
```

📌 **Healthcare Standards Rules:**

- **All clinical data must map to standard terminologies.**
- **FHIR resources follow AMR-specific profiles.**
- **Terminology validation is mandatory before data storage.**
- **Support multiple terminology systems for international compatibility.**
- **Maintain audit trails for all terminology mappings.**

---

## 🧬 AMR-Specific Data Models

### ✅ Core AMR Data Types

```tsx
// /src/platform/types/amr/ClinicalTypes.ts
export interface AMRIsolate {
  id: string;
  specimenId: string;
  organismId: string;
  source: 'human' | 'animal' | 'environmental';
  
  // Clinical metadata
  patient?: {
    ageGroup: string;
    gender?: 'M' | 'F' | 'O';
    hospitalized: boolean;
    ward?: string;
    admissionDate?: Date;
  };
  
  // Specimen details
  specimen: {
    type: string; // SNOMED coded
    typeCode: string;
    collectionDate: Date;
    collectionSite?: string; // Body site for human/animal
    coordinates?: GeoLocation; // For environmental samples
  };
  
  // One Health metadata
  oneHealth: {
    sector: 'human' | 'animal' | 'environmental' | 'food';
    subSector?: string; // e.g., 'poultry', 'cattle', 'wastewater'
    facility: string;
    facilityType: string;
    region: string;
    country: string;
  };
  
  // Quality indicators
  quality: {
    dataCompleteness: number; // 0-1
    validationStatus: 'pending' | 'validated' | 'rejected';
    validationDate?: Date;
    validator?: string;
  };
}

export interface ResistanceProfile {
  isolateId: string;
  testDate: Date;
  laboratory: string;
  testMethod: 'automated' | 'manual';
  
  // Antibiotic results
  results: AntibioticResult[];
  
  // Resistance mechanisms
  mechanisms?: {
    esbl?: boolean;
    carbapenemase?: boolean;
    mecA?: boolean;
    vanA?: boolean;
    mcr1?: boolean;
    custom?: string[];
  };
  
  // Interpretive criteria
  interpretiveCriteria: {
    standard: 'CLSI' | 'EUCAST' | 'Other';
    version: string;
    year: number;
  };
  
  // MDR/XDR/PDR classification
  resistanceClassification?: {
    mdr: boolean; // Multi-drug resistant
    xdr: boolean; // Extensively drug-resistant
    pdr: boolean; // Pan-drug resistant
    dtc: boolean; // Difficult-to-treat
  };
}

export interface AntibioticResult {
  antibiotic: string;
  antibioticCode: string; // WHONET/ATC code
  loincCode?: string;
  
  // Result interpretation
  interpretation: 'S' | 'I' | 'R' | 'NS' | 'U';
  
  // Quantitative results
  mic?: {
    value: number;
    operator?: '<' | '>' | '<=';
    unit: 'ug/mL' | 'mg/L';
  };
  
  diskDiffusion?: {
    diameter: number;
    unit: 'mm';
  };
  
  // Additional flags
  flags?: {
    nonWildType?: boolean;
    inducibleResistance?: boolean;
    heteroresistance?: boolean;
  };
}
```

### ✅ WHO GLASS Data Structures

```tsx
// /src/platform/types/glass/GLASSTypes.ts
export interface GLASSSubmission {
  submissionId: string;
  country: string;
  year: number;
  quarter: 1 | 2 | 3 | 4;
  
  // Surveillance data
  surveillanceType: 'routine' | 'sentinel' | 'survey';
  dataSource: 'national' | 'subnational';
  populationCoverage: number; // Percentage
  
  // Data quality indicators
  quality: {
    completeness: number;
    timeliness: number;
    representativeness: 'high' | 'medium' | 'low';
    validationStatus: 'draft' | 'validated' | 'submitted';
  };
  
  // Aggregated data
  aggregatedData: {
    pathogen: string;
    specimen: string;
    ageGroup: string;
    gender: 'M' | 'F' | 'ALL';
    origin: 'community' | 'hospital' | 'all';
    
    // Resistance data
    antibioticResults: {
      antibiotic: string;
      tested: number;
      resistant: number;
      intermediate: number;
      susceptible: number;
    }[];
  }[];
  
  // Files for submission
  files: {
    type: 'RIS' | 'Sample' | 'Supplementary';
    format: 'WHONET' | 'CSV' | 'Excel';
    url: string;
    checksum: string;
  }[];
}
```

📌 **AMR Data Model Rules:**

- **Support One-Health data integration natively.**
- **Include all WHO GLASS required fields.**
- **Maintain data quality indicators at all levels.**
- **Support both aggregated and patient-level data.**
- **Enable resistance mechanism tracking.**

---

## 🤖 Machine Learning Integration

### ✅ ML Pipeline Architecture

```tsx
// /src/platform/services/ml/MLPipeline.ts
export class AMRMLPipeline {
  private models: Map<string, MLModel>;
  
  constructor() {
    this.models = new Map([
      ['resistance-prediction', new ResistancePredictionModel()],
      ['outbreak-detection', new OutbreakDetectionModel()],
      ['trend-forecasting', new TrendForecastingModel()],
      ['treatment-outcome', new TreatmentOutcomeModel()]
    ]);
  }
  
  // Predict resistance for new isolate
  async predictResistance(
    isolate: AMRIsolate,
    antibiotics: string[]
  ): Promise<ResistancePrediction[]> {
    const model = this.models.get('resistance-prediction');
    
    // Feature engineering
    const features = await this.extractFeatures(isolate);
    
    // Add temporal features
    features.seasonality = this.getSeasonality(isolate.specimen.collectionDate);
    features.recentResistanceRate = await this.getRecentResistanceRate(
      isolate.organismId,
      isolate.oneHealth.facility
    );
    
    // Add patient risk factors
    if (isolate.patient) {
      features.patientRisk = this.calculatePatientRisk(isolate.patient);
    }
    
    // Predict for each antibiotic
    const predictions = await Promise.all(
      antibiotics.map(async (antibiotic) => {
        const prediction = await model.predict({
          ...features,
          antibiotic
        });
        
        return {
          antibiotic,
          predictedResult: prediction.class, // 'S', 'I', 'R'
          probability: prediction.probability,
          confidence: prediction.confidence,
          importantFeatures: prediction.featureImportance
        };
      })
    );
    
    return predictions;
  }
  
  // Detect potential outbreaks
  async detectOutbreaks(
    region: string,
    timeWindow: number = 14 // days
  ): Promise<OutbreakAlert[]> {
    const model = this.models.get('outbreak-detection');
    
    // Get recent isolates
    const recentIsolates = await this.getRecentIsolates(region, timeWindow);
    
    // Cluster analysis
    const clusters = await model.detectClusters({
      isolates: recentIsolates,
      method: 'DBSCAN',
      minClusterSize: 3,
      maxDistance: 5 // km for geographic clustering
    });
    
    // Analyze each cluster for outbreak potential
    const alerts = await Promise.all(
      clusters.map(async (cluster) => {
        const risk = await model.assessOutbreakRisk(cluster);
        
        if (risk.score > 0.7) {
          return {
            id: generateAlertId(),
            type: 'outbreak',
            severity: risk.severity,
            location: cluster.center,
            affectedFacilities: cluster.facilities,
            pathogen: cluster.dominantPathogen,
            resistancePattern: cluster.commonResistance,
            caseCount: cluster.size,
            growthRate: cluster.growthRate,
            predictedCases: risk.predictedCases,
            recommendedActions: risk.actions
          };
        }
      })
    );
    
    return alerts.filter(Boolean);
  }
  
  // Forecast resistance trends
  async forecastTrends(
    pathogen: string,
    antibiotic: string,
    horizon: number = 90 // days
  ): Promise<TrendForecast> {
    const model = this.models.get('trend-forecasting');
    
    // Historical data preparation
    const historicalData = await this.getHistoricalResistance(
      pathogen,
      antibiotic,
      365 * 2 // 2 years of data
    );
    
    // Time series decomposition
    const decomposed = model.decomposeTimeSeries(historicalData);
    
    // Forecast
    const forecast = await model.forecast({
      trend: decomposed.trend,
      seasonality: decomposed.seasonal,
      remainder: decomposed.remainder,
      horizon,
      method: 'LSTM' // Long Short-Term Memory
    });
    
    return {
      pathogen,
      antibiotic,
      currentRate: historicalData[historicalData.length - 1].rate,
      forecast: forecast.predictions,
      confidence: forecast.confidenceIntervals,
      trendDirection: forecast.trend,
      seasonalPattern: decomposed.seasonal,
      anomalies: forecast.anomalies,
      riskLevel: this.assessResistanceRisk(forecast)
    };
  }
}
```

### ✅ Real-time ML Monitoring

```tsx
// /src/modules/analytics-intelligence/components/MLDashboard.tsx
export function MLDashboard() {
  const { data: predictions } = useMLPredictions();
  const { data: modelMetrics } = useModelPerformance();
  
  return (
    <div className="ml-dashboard grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Resistance Predictions */}
      <div className="platform-card">
        <h3 className="text-lg font-semibold mb-4">
          Resistance Predictions - Next 7 Days
        </h3>
        <ResistancePredictionChart 
          predictions={predictions.resistance}
          showConfidence={true}
        />
        <div className="mt-4">
          <ModelAccuracyIndicator 
            accuracy={modelMetrics.resistance.accuracy}
            lastUpdated={modelMetrics.resistance.lastTraining}
          />
        </div>
      </div>
      
      {/* Outbreak Risk Map */}
      <div className="platform-card">
        <h3 className="text-lg font-semibold mb-4">
          Outbreak Risk Assessment
        </h3>
        <OutbreakRiskMap 
          risks={predictions.outbreakRisks}
          showClusters={true}
        />
        <OutbreakAlertList 
          alerts={predictions.activeAlerts}
          onInvestigate={(alert) => navigateToOutbreak(alert.id)}
        />
      </div>
      
      {/* Trend Forecasts */}
      <div className="platform-card col-span-full">
        <h3 className="text-lg font-semibold mb-4">
          Resistance Trend Forecasts
        </h3>
        <TrendForecastGrid 
          forecasts={predictions.trends}
          timeHorizon="90d"
          showSeasonality={true}
        />
      </div>
      
      {/* Model Performance */}
      <div className="platform-card col-span-full">
        <h3 className="text-lg font-semibold mb-4">
          ML Model Performance
        </h3>
        <ModelPerformanceMatrix 
          models={modelMetrics.all}
          showFeatureImportance={true}
        />
      </div>
    </div>
  );
}
```

📌 **ML Integration Rules:**

- **All models must be validated on local data before deployment.**
- **Feature engineering must respect patient privacy.**
- **Model predictions include confidence intervals and explanations.**
- **Continuous monitoring of model performance is mandatory.**
- **Support for federated learning to maintain data sovereignty.**