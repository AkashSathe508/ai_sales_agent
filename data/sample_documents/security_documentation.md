# Security & Data Governance Documentation

## Compliance Standards
- SOC 2 Type II Certified annually.
- GDPR and CCPA compliant.
- HIPAA compliant data processing addendums available for healthcare entities.

## Encryption & Isolation
- Encryption at Rest: AES-256 for all databases, vector indexes, and backups.
- Encryption in Transit: TLS 1.3 enforced on all external endpoints and internal service communication.
- Multi-Tenancy: Row-Level Security (RLS) and strict tenant isolation by organization_id.

## Zero Data Retention Option
Customer CRM data and prompt inputs are never used to train generalized foundation models. Enterprise tier offers stateless processing with zero model-provider caching.
