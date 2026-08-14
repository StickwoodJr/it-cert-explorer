import { PrismaClient, ExamFormat, EntityStatus, CertLevel, LogicType, MemberType, EdgeType, SourceType, EntityType } from '@prisma/client';
import { calculateRatingScore } from '../src/lib/score-calculator';
import { validateCitations, CitationRecord } from '../src/lib/validators';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting comprehensive database seed for all 54 flagship certifications...');

  // 1. Clean existing records in reverse FK order
  await prisma.fieldSource.deleteMany({});
  await prisma.source.deleteMany({});
  await prisma.prerequisiteGroupMember.deleteMany({});
  await prisma.prerequisiteGroup.deleteMany({});
  await prisma.certificationRole.deleteMany({});
  await prisma.certificationDomain.deleteMany({});
  await prisma.certification.deleteMany({});
  await prisma.exam.deleteMany({});
  await prisma.role.deleteMany({});
  await prisma.domain.deleteMany({});
  await prisma.vendor.deleteMany({});

  console.log('🧹 Cleaned existing database records.');

  // 2. Seed Vendors
  const vendors = [
    { id: 'vendor:cisco', name: 'Cisco Systems, Inc.', shortName: 'Cisco', websiteUrl: 'https://www.cisco.com/c/en/us/training-events/career-certifications.html', logoAssetRef: '/logos/cisco.svg', description: 'Enterprise routing, switching, wireless, and network infrastructure certification leader.', foundedYear: 1984 },
    { id: 'vendor:juniper', name: 'Juniper Networks', shortName: 'Juniper', websiteUrl: 'https://www.juniper.net/us/en/training/certification.html', logoAssetRef: '/logos/juniper.svg', description: 'High-performance networking and routing certifications across Junos OS platforms.', foundedYear: 1996 },
    { id: 'vendor:comptia', name: 'Computing Technology Industry Association', shortName: 'CompTIA', websiteUrl: 'https://www.comptia.org/certifications', logoAssetRef: '/logos/comptia.svg', description: 'Vendor-neutral foundational, infrastructure, and cybersecurity certification authority.', foundedYear: 1982 },
    { id: 'vendor:redhat', name: 'Red Hat, Inc.', shortName: 'Red Hat', websiteUrl: 'https://www.redhat.com/en/services/certifications', logoAssetRef: '/logos/redhat.svg', description: 'Premier enterprise Linux and cloud automation hands-on performance-based certifications.', foundedYear: 1993 },
    { id: 'vendor:lpi', name: 'Linux Professional Institute', shortName: 'LPI', websiteUrl: 'https://www.lpi.org', logoAssetRef: '/logos/lpi.svg', description: 'Global vendor-neutral Linux certification and open source professional standard.', foundedYear: 1999 },
    { id: 'vendor:linuxfoundation', name: 'The Linux Foundation', shortName: 'Linux Foundation', websiteUrl: 'https://training.linuxfoundation.org', logoAssetRef: '/logos/linuxfoundation.svg', description: 'Performance-based open source system administration and cloud native certifications.', foundedYear: 2000 },
    { id: 'vendor:isc2', name: 'International Information System Security Certification Consortium', shortName: 'ISC2', websiteUrl: 'https://www.isc2.org/Certifications', logoAssetRef: '/logos/isc2.svg', description: 'Global standard for cybersecurity management, engineering, and architecture certifications.', foundedYear: 1989 },
    { id: 'vendor:offsec', name: 'Offensive Security', shortName: 'OffSec', websiteUrl: 'https://www.offsec.com', logoAssetRef: '/logos/offsec.svg', description: 'Rigorous 24-hour practical hands-on penetration testing and offensive security certifications.', foundedYear: 2007 },
    { id: 'vendor:giac', name: 'Global Information Assurance Certification', shortName: 'GIAC', websiteUrl: 'https://www.giac.org', logoAssetRef: '/logos/giac.svg', description: 'Specialized practitioner cybersecurity certifications affiliated with the SANS Institute.', foundedYear: 1999 },
    { id: 'vendor:isaca', name: 'Information Systems Audit and Control Association', shortName: 'ISACA', websiteUrl: 'https://www.isaca.org/credentialing', logoAssetRef: '/logos/isaca.svg', description: 'Global authority on IT governance, risk management, and cybersecurity audit.', foundedYear: 1969 },
    { id: 'vendor:eccouncil', name: 'International Council of E-Commerce Consultants', shortName: 'EC-Council', websiteUrl: 'https://www.eccouncil.org', logoAssetRef: '/logos/eccouncil.svg', description: 'Cybersecurity certification provider specializing in ethical hacking and incident response.', foundedYear: 2001 },
    { id: 'vendor:microsoft', name: 'Microsoft Corporation', shortName: 'Microsoft', websiteUrl: 'https://learn.microsoft.com/credentials/', logoAssetRef: '/logos/microsoft.svg', description: 'Enterprise cloud, Windows Server hybrid, security, and Microsoft 365 role-based certifications.', foundedYear: 1975 },
    { id: 'vendor:aws', name: 'Amazon Web Services', shortName: 'AWS', websiteUrl: 'https://aws.amazon.com/certification/', logoAssetRef: '/logos/aws.svg', description: 'Industry-leading cloud architecture, operations, security, and AI/ML certifications.', foundedYear: 2006 },
    { id: 'vendor:googlecloud', name: 'Google Cloud Platform', shortName: 'Google Cloud', websiteUrl: 'https://cloud.google.com/learn/certification', logoAssetRef: '/logos/googlecloud.svg', description: 'Enterprise cloud infrastructure, data engineering, architecture, and machine learning certifications.', foundedYear: 2008 },
  ];

  for (const v of vendors) {
    await prisma.vendor.create({ data: v });
  }

  // 3. Seed Domains
  const domains = [
    { id: 'domain:networking', name: 'Networking', description: 'Enterprise routing, switching, wireless, protocol architectures, and network automation.', isEmerging: false },
    { id: 'domain:linux', name: 'Linux', description: 'Open source operating system administration, kernel tuning, automation, and enterprise infrastructure.', isEmerging: false },
    { id: 'domain:cybersecurity', name: 'Cybersecurity', description: 'Defensive security operations, offensive penetration testing, incident response, GRC, and architecture.', isEmerging: false },
    { id: 'domain:azure', name: 'Microsoft / Windows / Azure', description: 'Microsoft Azure cloud services, Windows Server hybrid infrastructure, and Microsoft 365 enterprise administration.', isEmerging: false },
    { id: 'domain:cloud', name: 'Cloud', description: 'Multi-cloud architecture, DevOps, security, and infrastructure engineering across AWS and GCP.', isEmerging: false },
    { id: 'domain:ai-ml', name: 'AI & Machine Learning', description: 'Generative AI, applied machine learning engineering, data modeling, and MLOps platforms.', isEmerging: true },
  ];

  for (const d of domains) {
    await prisma.domain.create({ data: d });
  }

  // 4. Seed Job Roles
  const roles = [
    { id: 'role:network-engineer', name: 'Network Engineer', description: 'Designs, deploys, and maintains enterprise routing, switching, and connectivity.' },
    { id: 'role:cloud-architect', name: 'Cloud Solutions Architect', description: 'Architects scalable, resilient, multi-cloud and hybrid infrastructure.' },
    { id: 'role:soc-analyst', name: 'SOC Analyst / Incident Responder', description: 'Monitors, detects, and investigates enterprise security events.' },
    { id: 'role:pentester', name: 'Penetration Tester / Offensive Security', description: 'Performs adversary simulation, exploit development, and ethical hacking.' },
    { id: 'role:sysadmin', name: 'Linux / Systems Administrator', description: 'Manages enterprise Linux and hybrid server environments.' },
    { id: 'role:security-architect', name: 'Cybersecurity Architect / GRC', description: 'Leads security governance, audit compliance, and zero trust architectures.' },
    { id: 'role:ml-engineer', name: 'AI / Machine Learning Engineer', description: 'Builds, trains, and operationalizes machine learning and generative AI systems.' },
  ];

  for (const r of roles) {
    await prisma.role.create({ data: r });
  }

  // 5. Seed Primary Sources
  const sources = [
    { id: 'src:cisco-official', type: SourceType.VENDOR_PAGE, title: 'Cisco Career Certifications Program Blueprint', url: 'https://www.cisco.com/c/en/us/training-events/career-certifications.html', publisher: 'Cisco Systems' },
    { id: 'src:juniper-official', type: SourceType.VENDOR_PAGE, title: 'Juniper Networks Certification Program (JNCP)', url: 'https://www.juniper.net/us/en/training/certification.html', publisher: 'Juniper Networks' },
    { id: 'src:comptia-official', type: SourceType.VENDOR_PAGE, title: 'CompTIA Certification Roadmap & Store', url: 'https://www.comptia.org/certifications', publisher: 'CompTIA' },
    { id: 'src:redhat-official', type: SourceType.VENDOR_PAGE, title: 'Red Hat Training and Certification', url: 'https://www.redhat.com/en/services/certifications', publisher: 'Red Hat' },
    { id: 'src:lpi-official', type: SourceType.VENDOR_PAGE, title: 'Linux Professional Institute Certifications', url: 'https://www.lpi.org/our-certifications/summary-of-certifications/', publisher: 'LPI' },
    { id: 'src:lf-official', type: SourceType.VENDOR_PAGE, title: 'Linux Foundation Certification Catalog', url: 'https://training.linuxfoundation.org/certification/catalog/', publisher: 'The Linux Foundation' },
    { id: 'src:isc2-official', type: SourceType.VENDOR_PAGE, title: 'ISC2 Cybersecurity Certifications', url: 'https://www.isc2.org/certifications', publisher: 'ISC2' },
    { id: 'src:offsec-official', type: SourceType.VENDOR_PAGE, title: 'Offensive Security PEN-200 / OSCP', url: 'https://www.offsec.com/courses/pen-200/', publisher: 'OffSec' },
    { id: 'src:giac-official', type: SourceType.VENDOR_PAGE, title: 'GIAC Security Certifications', url: 'https://www.giac.org/certifications/', publisher: 'GIAC / SANS' },
    { id: 'src:isaca-official', type: SourceType.VENDOR_PAGE, title: 'ISACA Credentials Catalog', url: 'https://www.isaca.org/credentialing', publisher: 'ISACA' },
    { id: 'src:eccouncil-official', type: SourceType.VENDOR_PAGE, title: 'EC-Council CEH Program', url: 'https://www.eccouncil.org/train-certify/certified-ethical-hacker-ceh/', publisher: 'EC-Council' },
    { id: 'src:ms-learn', type: SourceType.VENDOR_PAGE, title: 'Microsoft Learn Credentials Browser', url: 'https://learn.microsoft.com/credentials/', publisher: 'Microsoft' },
    { id: 'src:aws-official', type: SourceType.VENDOR_PAGE, title: 'AWS Certification Program', url: 'https://aws.amazon.com/certification/', publisher: 'Amazon Web Services' },
    { id: 'src:gcp-official', type: SourceType.VENDOR_PAGE, title: 'Google Cloud Certifications', url: 'https://cloud.google.com/learn/certification', publisher: 'Google Cloud' },
    { id: 'src:skillsoft-salary', type: SourceType.SALARY_SURVEY, title: 'Skillsoft IT Skills and Salary Report', url: 'https://www.skillsoft.com/it-skills-and-salary-report', publisher: 'Skillsoft' },
    { id: 'src:bls-tech', type: SourceType.JOB_POSTINGS_INDEX, title: 'BLS Computer & Information Technology Outlook', url: 'https://www.bls.gov/ooh/computer-and-information-technology/', publisher: 'U.S. Bureau of Labor Statistics' },
  ];

  for (const s of sources) {
    await prisma.source.create({ data: s });
  }

  const citationsToValidate: CitationRecord[] = [];

  // Helper to register exam with citations
  async function createExamWithCitations(data: {
    id: string;
    vendorId: string;
    examCode: string;
    name: string;
    format: ExamFormat;
    costAmountUsd: number;
    costAmountCadOverride?: number;
    durationMinutes: number;
    passingScoreInfo?: string;
    officialUrl: string;
    sourceId: string;
  }) {
    const exam = await prisma.exam.create({
      data: {
        id: data.id,
        vendorId: data.vendorId,
        examCode: data.examCode,
        name: data.name,
        format: data.format,
        costAmountUsd: data.costAmountUsd,
        costAmountCadOverride: data.costAmountCadOverride ?? null,
        durationMinutes: data.durationMinutes,
        passingScoreInfo: data.passingScoreInfo ?? null,
        status: EntityStatus.ACTIVE,
        officialUrl: data.officialUrl,
      },
    });

    const fields = ['examCode', 'costAmountUsd', 'durationMinutes', 'format', 'officialUrl'];
    for (const field of fields) {
      await prisma.fieldSource.create({
        data: {
          id: `fs:${data.id}:${field}`,
          entityType: EntityType.EXAM,
          entityId: data.id,
          fieldName: field,
          sourceId: data.sourceId,
        },
      });
      citationsToValidate.push({
        entityType: 'EXAM',
        entityId: data.id,
        fieldName: field,
        sourceId: data.sourceId,
      });
    }

    return exam;
  }

  // Helper to register certification with citations & score calculation
  async function createCertWithCitations(data: {
    id: string;
    vendorId: string;
    name: string;
    acronym: string;
    level: CertLevel;
    vendorLevelLabel?: string;
    renewalPeriodMonths: number;
    renewalRequirementsText: string;
    description: string;
    officialUrl: string;
    domainIds: string[];
    roleIds: string[];
    scoreInputs: {
      marketValueScore: number;
      demandScore: number;
      rigorScore: number;
      communityPerceptionScore: number;
    };
    sourceId: string;
  }) {
    const score = calculateRatingScore({
      ...data.scoreInputs,
      status: 'ACTIVE',
    });

    const cert = await prisma.certification.create({
      data: {
        id: data.id,
        vendorId: data.vendorId,
        name: data.name,
        acronym: data.acronym,
        level: data.level,
        vendorLevelLabel: data.vendorLevelLabel ?? null,
        status: EntityStatus.ACTIVE,
        renewalPeriodMonths: data.renewalPeriodMonths,
        renewalRequirementsText: data.renewalRequirementsText,
        description: data.description,
        officialUrl: data.officialUrl,
        computedScore: score.overallScore,
        scoreBreakdown: score as any,
        domains: {
          create: data.domainIds.map((domainId) => ({ domainId })),
        },
        roles: {
          create: data.roleIds.map((roleId) => ({ roleId })),
        },
      },
    });

    const fields = ['name', 'level', 'renewalPeriodMonths', 'officialUrl'];
    for (const field of fields) {
      await prisma.fieldSource.create({
        data: {
          id: `fs:${data.id}:${field}`,
          entityType: EntityType.CERTIFICATION,
          entityId: data.id,
          fieldName: field,
          sourceId: data.sourceId,
        },
      });
      citationsToValidate.push({
        entityType: 'CERTIFICATION',
        entityId: data.id,
        fieldName: field,
        sourceId: data.sourceId,
      });
    }

    return cert;
  }

  // ==========================================
  // DOMAIN 1: NETWORKING (9 Certs)
  // ==========================================
  console.log('🌐 Seeding Domain 1: Networking...');
  await createExamWithCitations({ id: 'exam:n10-009', vendorId: 'vendor:comptia', examCode: 'N10-009', name: 'CompTIA Network+ Exam', format: ExamFormat.PERFORMANCE_BASED, costAmountUsd: 392, costAmountCadOverride: 498, durationMinutes: 90, officialUrl: 'https://www.comptia.org/certifications/network', sourceId: 'src:comptia-official' });
  await createExamWithCitations({ id: 'exam:ccst-net', vendorId: 'vendor:cisco', examCode: '100-150 CCST', name: 'Cisco Support Technician Networking', format: ExamFormat.MULTIPLE_CHOICE, costAmountUsd: 125, costAmountCadOverride: 170, durationMinutes: 50, officialUrl: 'https://www.cisco.com/site/us/en/learn/training-certifications/certifications/support-technician/networking/index.html', sourceId: 'src:cisco-official' });
  await createExamWithCitations({ id: 'exam:200-301', vendorId: 'vendor:cisco', examCode: '200-301 CCNA', name: 'Implementing and Administering Cisco Solutions', format: ExamFormat.PERFORMANCE_BASED, costAmountUsd: 300, costAmountCadOverride: 415, durationMinutes: 120, officialUrl: 'https://www.cisco.com/c/en/us/training-events/career-certifications/associate/ccna.html', sourceId: 'src:cisco-official' });
  await createExamWithCitations({ id: 'exam:jn0-105', vendorId: 'vendor:juniper', examCode: 'JN0-105', name: 'Junos, Associate (JNCIA-Junos)', format: ExamFormat.MULTIPLE_CHOICE, costAmountUsd: 200, costAmountCadOverride: 275, durationMinutes: 90, officialUrl: 'https://www.juniper.net/us/en/training/certification/tracks/junos-associate.html', sourceId: 'src:juniper-official' });
  await createExamWithCitations({ id: 'exam:350-401', vendorId: 'vendor:cisco', examCode: '350-401 ENCOR', name: 'Implementing Cisco Enterprise Core Technologies', format: ExamFormat.PERFORMANCE_BASED, costAmountUsd: 400, costAmountCadOverride: 550, durationMinutes: 120, officialUrl: 'https://www.cisco.com/c/en/us/training-events/career-certifications/professional/ccnp-enterprise.html', sourceId: 'src:cisco-official' });
  await createExamWithCitations({ id: 'exam:300-410', vendorId: 'vendor:cisco', examCode: '300-410 ENARSI', name: 'Implementing Cisco Enterprise Advanced Routing', format: ExamFormat.PERFORMANCE_BASED, costAmountUsd: 300, costAmountCadOverride: 415, durationMinutes: 90, officialUrl: 'https://www.cisco.com/c/en/us/training-events/career-certifications/professional/ccnp-enterprise.html', sourceId: 'src:cisco-official' });
  await createExamWithCitations({ id: 'exam:350-701', vendorId: 'vendor:cisco', examCode: '350-701 SCOR', name: 'Implementing Cisco Security Core Technologies', format: ExamFormat.PERFORMANCE_BASED, costAmountUsd: 400, costAmountCadOverride: 550, durationMinutes: 120, officialUrl: 'https://www.cisco.com/c/en/us/training-events/career-certifications/professional/ccnp-security.html', sourceId: 'src:cisco-official' });
  await createExamWithCitations({ id: 'exam:300-710', vendorId: 'vendor:cisco', examCode: '300-710 SNCF', name: 'Securing Networks with Cisco Firepower', format: ExamFormat.PERFORMANCE_BASED, costAmountUsd: 300, costAmountCadOverride: 415, durationMinutes: 90, officialUrl: 'https://www.cisco.com/c/en/us/training-events/career-certifications/professional/ccnp-security.html', sourceId: 'src:cisco-official' });
  await createExamWithCitations({ id: 'exam:jn0-649', vendorId: 'vendor:juniper', examCode: 'JN0-649', name: 'Enterprise Routing & Switching Professional (JNCIP-ENT)', format: ExamFormat.MULTIPLE_CHOICE, costAmountUsd: 400, costAmountCadOverride: 550, durationMinutes: 120, officialUrl: 'https://www.juniper.net/us/en/training/certification/tracks/enterprise-routing-switching-professional.html', sourceId: 'src:juniper-official' });
  await createExamWithCitations({ id: 'exam:ccie-ei-lab', vendorId: 'vendor:cisco', examCode: 'CCIE-EI-LAB', name: 'CCIE Enterprise Infrastructure Practical Lab', format: ExamFormat.HANDS_ON_LAB, costAmountUsd: 1900, costAmountCadOverride: 2600, durationMinutes: 480, officialUrl: 'https://www.cisco.com/c/en/us/training-events/career-certifications/expert/ccie-enterprise-infrastructure.html', sourceId: 'src:cisco-official' });
  await createExamWithCitations({ id: 'exam:jpr-944', vendorId: 'vendor:juniper', examCode: 'JPR-944', name: 'JNCIE-ENT Practical Lab Exam', format: ExamFormat.HANDS_ON_LAB, costAmountUsd: 1600, costAmountCadOverride: 2200, durationMinutes: 480, officialUrl: 'https://www.juniper.net/us/en/training/certification/tracks/enterprise-routing-switching-expert.html', sourceId: 'src:juniper-official' });

  await createCertWithCitations({ id: 'cert:comptia-network-plus', vendorId: 'vendor:comptia', name: 'CompTIA Network+', acronym: 'Network+', level: CertLevel.ENTRY, renewalPeriodMonths: 36, renewalRequirementsText: '30 CEUs over 3 years', description: 'Foundational vendor-neutral networking credential.', officialUrl: 'https://www.comptia.org/certifications/network', domainIds: ['domain:networking'], roleIds: ['role:network-engineer', 'role:sysadmin'], scoreInputs: { marketValueScore: 68, demandScore: 82, rigorScore: 55, communityPerceptionScore: 78 }, sourceId: 'src:comptia-official' });
  await createCertWithCitations({ id: 'cert:cisco-ccst-networking', vendorId: 'vendor:cisco', name: 'Cisco Certified Support Technician: Networking', acronym: 'CCST Networking', level: CertLevel.ENTRY, renewalPeriodMonths: 0, renewalRequirementsText: 'Non-expiring', description: 'Entry-level network operations and troubleshooting.', officialUrl: 'https://www.cisco.com/site/us/en/learn/training-certifications/certifications/support-technician/networking/index.html', domainIds: ['domain:networking'], roleIds: ['role:network-engineer'], scoreInputs: { marketValueScore: 50, demandScore: 60, rigorScore: 40, communityPerceptionScore: 65 }, sourceId: 'src:cisco-official' });
  await createCertWithCitations({ id: 'cert:cisco-ccna', vendorId: 'vendor:cisco', name: 'Cisco Certified Network Associate', acronym: 'CCNA', level: CertLevel.ASSOCIATE, renewalPeriodMonths: 36, renewalRequirementsText: '30 CE credits', description: 'Flagship enterprise networking associate credential.', officialUrl: 'https://www.cisco.com/c/en/us/training-events/career-certifications/associate/ccna.html', domainIds: ['domain:networking'], roleIds: ['role:network-engineer', 'role:sysadmin', 'role:cloud-architect'], scoreInputs: { marketValueScore: 78, demandScore: 92, rigorScore: 70, communityPerceptionScore: 90 }, sourceId: 'src:cisco-official' });
  await createCertWithCitations({ id: 'cert:juniper-jncia-junos', vendorId: 'vendor:juniper', name: 'Juniper Networks Certified Associate - Junos', acronym: 'JNCIA-Junos', level: CertLevel.ASSOCIATE, renewalPeriodMonths: 36, renewalRequirementsText: 'Pass current exam or higher', description: 'Associate credential validating Junos OS and routing fundamentals.', officialUrl: 'https://www.juniper.net/us/en/training/certification/tracks/junos-associate.html', domainIds: ['domain:networking'], roleIds: ['role:network-engineer'], scoreInputs: { marketValueScore: 72, demandScore: 68, rigorScore: 60, communityPerceptionScore: 75 }, sourceId: 'src:juniper-official' });
  await createCertWithCitations({ id: 'cert:cisco-ccnp-enterprise', vendorId: 'vendor:cisco', name: 'Cisco Certified Network Professional Enterprise', acronym: 'CCNP Enterprise', level: CertLevel.PROFESSIONAL, renewalPeriodMonths: 36, renewalRequirementsText: '80 CE credits or qualifying exams', description: 'Professional enterprise networking core + concentration credential.', officialUrl: 'https://www.cisco.com/c/en/us/training-events/career-certifications/professional/ccnp-enterprise.html', domainIds: ['domain:networking'], roleIds: ['role:network-engineer', 'role:cloud-architect'], scoreInputs: { marketValueScore: 88, demandScore: 94, rigorScore: 82, communityPerceptionScore: 92 }, sourceId: 'src:cisco-official' });
  await createCertWithCitations({ id: 'cert:cisco-ccnp-security', vendorId: 'vendor:cisco', name: 'Cisco Certified Network Professional Security', acronym: 'CCNP Security', level: CertLevel.PROFESSIONAL, renewalPeriodMonths: 36, renewalRequirementsText: '80 CE credits', description: 'Professional network security core + concentration.', officialUrl: 'https://www.cisco.com/c/en/us/training-events/career-certifications/professional/ccnp-security.html', domainIds: ['domain:networking', 'domain:cybersecurity'], roleIds: ['role:network-engineer', 'role:soc-analyst'], scoreInputs: { marketValueScore: 90, demandScore: 86, rigorScore: 84, communityPerceptionScore: 88 }, sourceId: 'src:cisco-official' });
  await createCertWithCitations({ id: 'cert:juniper-jncip-ent', vendorId: 'vendor:juniper', name: 'Juniper Networks Certified Professional Enterprise', acronym: 'JNCIP-ENT', level: CertLevel.PROFESSIONAL, renewalPeriodMonths: 36, renewalRequirementsText: 'Pass professional exam', description: 'Advanced multi-area enterprise routing and switching.', officialUrl: 'https://www.juniper.net/us/en/training/certification/tracks/enterprise-routing-switching-professional.html', domainIds: ['domain:networking'], roleIds: ['role:network-engineer'], scoreInputs: { marketValueScore: 85, demandScore: 72, rigorScore: 80, communityPerceptionScore: 82 }, sourceId: 'src:juniper-official' });
  await createCertWithCitations({ id: 'cert:cisco-ccie-enterprise', vendorId: 'vendor:cisco', name: 'Cisco Certified Internetwork Expert: Enterprise Infrastructure', acronym: 'CCIE Enterprise', level: CertLevel.EXPERT, renewalPeriodMonths: 36, renewalRequirementsText: '120 CE credits or lab retake', description: 'Pinnacle enterprise networking practical lab credential.', officialUrl: 'https://www.cisco.com/c/en/us/training-events/career-certifications/expert/ccie-enterprise-infrastructure.html', domainIds: ['domain:networking'], roleIds: ['role:network-engineer', 'role:cloud-architect'], scoreInputs: { marketValueScore: 98, demandScore: 88, rigorScore: 98, communityPerceptionScore: 96 }, sourceId: 'src:cisco-official' });
  await createCertWithCitations({ id: 'cert:juniper-jncie-ent', vendorId: 'vendor:juniper', name: 'Juniper Networks Certified Internet Expert Enterprise', acronym: 'JNCIE-ENT', level: CertLevel.EXPERT, renewalPeriodMonths: 36, renewalRequirementsText: 'Pass practical lab exam', description: 'Expert 8-hour hands-on practical routing and switching credential.', officialUrl: 'https://www.juniper.net/us/en/training/certification/tracks/enterprise-routing-switching-expert.html', domainIds: ['domain:networking'], roleIds: ['role:network-engineer'], scoreInputs: { marketValueScore: 96, demandScore: 75, rigorScore: 97, communityPerceptionScore: 94 }, sourceId: 'src:juniper-official' });

  // Networking Prerequisite Links
  const netG = await prisma.prerequisiteGroup.create({ data: { id: 'g:net+', targetCertificationId: 'cert:comptia-network-plus', logicType: LogicType.AND } });
  await prisma.prerequisiteGroupMember.create({ data: { id: 'm:net+', groupId: netG.id, memberType: MemberType.EXAM, examId: 'exam:n10-009', edgeType: EdgeType.REQUIRED } });

  const ccstG = await prisma.prerequisiteGroup.create({ data: { id: 'g:ccst', targetCertificationId: 'cert:cisco-ccst-networking', logicType: LogicType.AND } });
  await prisma.prerequisiteGroupMember.create({ data: { id: 'm:ccst', groupId: ccstG.id, memberType: MemberType.EXAM, examId: 'exam:ccst-net', edgeType: EdgeType.REQUIRED } });

  const ccnaG = await prisma.prerequisiteGroup.create({ data: { id: 'g:ccna', targetCertificationId: 'cert:cisco-ccna', logicType: LogicType.AND } });
  await prisma.prerequisiteGroupMember.create({ data: { id: 'm:ccna:ex', groupId: ccnaG.id, memberType: MemberType.EXAM, examId: 'exam:200-301', edgeType: EdgeType.REQUIRED } });
  await prisma.prerequisiteGroupMember.create({ data: { id: 'm:ccna:net+', groupId: ccnaG.id, memberType: MemberType.CERTIFICATION, certificationId: 'cert:comptia-network-plus', edgeType: EdgeType.RECOMMENDED, notes: 'Foundational precursor' } });
  await prisma.prerequisiteGroupMember.create({ data: { id: 'm:ccna:ccst', groupId: ccnaG.id, memberType: MemberType.CERTIFICATION, certificationId: 'cert:cisco-ccst-networking', edgeType: EdgeType.RECOMMENDED, notes: 'Entry-level precursor' } });

  const jnciaG = await prisma.prerequisiteGroup.create({ data: { id: 'g:jncia', targetCertificationId: 'cert:juniper-jncia-junos', logicType: LogicType.AND } });
  await prisma.prerequisiteGroupMember.create({ data: { id: 'm:jncia:ex', groupId: jnciaG.id, memberType: MemberType.EXAM, examId: 'exam:jn0-105', edgeType: EdgeType.REQUIRED } });
  await prisma.prerequisiteGroupMember.create({ data: { id: 'm:jncia:net+', groupId: jnciaG.id, memberType: MemberType.CERTIFICATION, certificationId: 'cert:comptia-network-plus', edgeType: EdgeType.RECOMMENDED, notes: 'General networking concepts precursor' } });

  const ccnpEG = await prisma.prerequisiteGroup.create({ data: { id: 'g:ccnp-ent:root', targetCertificationId: 'cert:cisco-ccnp-enterprise', logicType: LogicType.AND } });
  await prisma.prerequisiteGroupMember.create({ data: { id: 'm:ccnp-ent:core', groupId: ccnpEG.id, memberType: MemberType.EXAM, examId: 'exam:350-401', edgeType: EdgeType.REQUIRED } });
  await prisma.prerequisiteGroupMember.create({ data: { id: 'm:ccnp-ent:ccna', groupId: ccnpEG.id, memberType: MemberType.CERTIFICATION, certificationId: 'cert:cisco-ccna', edgeType: EdgeType.RECOMMENDED, notes: 'Associate knowledge precursor' } });
  const ccnpEConc = await prisma.prerequisiteGroup.create({ data: { id: 'g:ccnp-ent:conc', targetCertificationId: 'cert:cisco-ccnp-enterprise', parentGroupId: ccnpEG.id, logicType: LogicType.OR, minRequired: 1 } });
  await prisma.prerequisiteGroupMember.create({ data: { id: 'm:ccnp-ent:300410', groupId: ccnpEConc.id, memberType: MemberType.EXAM, examId: 'exam:300-410', edgeType: EdgeType.ALTERNATIVE } });

  const ccnpSG = await prisma.prerequisiteGroup.create({ data: { id: 'g:ccnp-sec:root', targetCertificationId: 'cert:cisco-ccnp-security', logicType: LogicType.AND } });
  await prisma.prerequisiteGroupMember.create({ data: { id: 'm:ccnp-sec:core', groupId: ccnpSG.id, memberType: MemberType.EXAM, examId: 'exam:350-701', edgeType: EdgeType.REQUIRED } });
  await prisma.prerequisiteGroupMember.create({ data: { id: 'm:ccnp-sec:ccna', groupId: ccnpSG.id, memberType: MemberType.CERTIFICATION, certificationId: 'cert:cisco-ccna', edgeType: EdgeType.RECOMMENDED, notes: 'Network associate precursor' } });
  const ccnpSConc = await prisma.prerequisiteGroup.create({ data: { id: 'g:ccnp-sec:conc', targetCertificationId: 'cert:cisco-ccnp-security', parentGroupId: ccnpSG.id, logicType: LogicType.OR, minRequired: 1 } });
  await prisma.prerequisiteGroupMember.create({ data: { id: 'm:ccnp-sec:300710', groupId: ccnpSConc.id, memberType: MemberType.EXAM, examId: 'exam:300-710', edgeType: EdgeType.ALTERNATIVE } });

  const jncipG = await prisma.prerequisiteGroup.create({ data: { id: 'g:jncip:root', targetCertificationId: 'cert:juniper-jncip-ent', logicType: LogicType.AND } });
  await prisma.prerequisiteGroupMember.create({ data: { id: 'm:jncip:ex', groupId: jncipG.id, memberType: MemberType.EXAM, examId: 'exam:jn0-649', edgeType: EdgeType.REQUIRED } });
  await prisma.prerequisiteGroupMember.create({ data: { id: 'm:jncip:prereq', groupId: jncipG.id, memberType: MemberType.CERTIFICATION, certificationId: 'cert:juniper-jncia-junos', edgeType: EdgeType.REQUIRED, notes: 'Active associate prerequisite' } });

  const ccieG = await prisma.prerequisiteGroup.create({ data: { id: 'g:ccie:root', targetCertificationId: 'cert:cisco-ccie-enterprise', logicType: LogicType.AND } });
  await prisma.prerequisiteGroupMember.create({ data: { id: 'm:ccie:core', groupId: ccieG.id, memberType: MemberType.EXAM, examId: 'exam:350-401', edgeType: EdgeType.REQUIRED } });
  await prisma.prerequisiteGroupMember.create({ data: { id: 'm:ccie:lab', groupId: ccieG.id, memberType: MemberType.EXAM, examId: 'exam:ccie-ei-lab', edgeType: EdgeType.REQUIRED } });
  await prisma.prerequisiteGroupMember.create({ data: { id: 'm:ccie:ccnp', groupId: ccieG.id, memberType: MemberType.CERTIFICATION, certificationId: 'cert:cisco-ccnp-enterprise', edgeType: EdgeType.RECOMMENDED, notes: 'Customary practitioner precursor' } });

  const jncieG = await prisma.prerequisiteGroup.create({ data: { id: 'g:jncie:root', targetCertificationId: 'cert:juniper-jncie-ent', logicType: LogicType.AND } });
  await prisma.prerequisiteGroupMember.create({ data: { id: 'm:jncie:lab', groupId: jncieG.id, memberType: MemberType.EXAM, examId: 'exam:jpr-944', edgeType: EdgeType.REQUIRED } });
  await prisma.prerequisiteGroupMember.create({ data: { id: 'm:jncie:prereq', groupId: jncieG.id, memberType: MemberType.CERTIFICATION, certificationId: 'cert:juniper-jncip-ent', edgeType: EdgeType.REQUIRED, notes: 'Must hold active JNCIP-ENT' } });

  // ==========================================
  // DOMAIN 2: LINUX (9 Certs)
  // ==========================================
  console.log('🐧 Seeding Domain 2: Linux...');
  await createExamWithCitations({ id: 'exam:lpi-010', vendorId: 'vendor:lpi', examCode: '010-160', name: 'Linux Essentials Exam', format: ExamFormat.MULTIPLE_CHOICE, costAmountUsd: 120, costAmountCadOverride: 165, durationMinutes: 60, officialUrl: 'https://www.lpi.org/our-certifications/linux-essentials-overview/', sourceId: 'src:lpi-official' });
  await createExamWithCitations({ id: 'exam:xk0-005', vendorId: 'vendor:comptia', examCode: 'XK0-005', name: 'CompTIA Linux+ Exam', format: ExamFormat.PERFORMANCE_BASED, costAmountUsd: 358, costAmountCadOverride: 470, durationMinutes: 90, officialUrl: 'https://www.comptia.org/certifications/linux', sourceId: 'src:comptia-official' });
  await createExamWithCitations({ id: 'exam:lpic1-101', vendorId: 'vendor:lpi', examCode: '101-500', name: 'LPIC-1 System Administrator Exam 101', format: ExamFormat.MULTIPLE_CHOICE, costAmountUsd: 200, costAmountCadOverride: 275, durationMinutes: 90, officialUrl: 'https://www.lpi.org/our-certifications/lpic-1-overview/', sourceId: 'src:lpi-official' });
  await createExamWithCitations({ id: 'exam:lpic1-102', vendorId: 'vendor:lpi', examCode: '102-500', name: 'LPIC-1 System Administrator Exam 102', format: ExamFormat.MULTIPLE_CHOICE, costAmountUsd: 200, costAmountCadOverride: 275, durationMinutes: 90, officialUrl: 'https://www.lpi.org/our-certifications/lpic-1-overview/', sourceId: 'src:lpi-official' });
  await createExamWithCitations({ id: 'exam:lfcs', vendorId: 'vendor:linuxfoundation', examCode: 'LFCS', name: 'Linux Foundation Certified System Administrator', format: ExamFormat.HANDS_ON_LAB, costAmountUsd: 395, durationMinutes: 120, officialUrl: 'https://training.linuxfoundation.org/certification/linux-foundation-certified-sysadmin-lfcs/', sourceId: 'src:lf-official' });
  await createExamWithCitations({ id: 'exam:ex200', vendorId: 'vendor:redhat', examCode: 'EX200', name: 'Red Hat Certified System Administrator (RHCSA) Exam', format: ExamFormat.HANDS_ON_LAB, costAmountUsd: 500, costAmountCadOverride: 680, durationMinutes: 180, officialUrl: 'https://www.redhat.com/en/services/training/ex200-red-hat-certified-system-administrator-rhcsa-exam', sourceId: 'src:redhat-official' });
  await createExamWithCitations({ id: 'exam:lpic2-201', vendorId: 'vendor:lpi', examCode: '201-450', name: 'LPIC-2 Linux Engineer Exam 201', format: ExamFormat.MULTIPLE_CHOICE, costAmountUsd: 200, costAmountCadOverride: 275, durationMinutes: 90, officialUrl: 'https://www.lpi.org/our-certifications/lpic-2-overview/', sourceId: 'src:lpi-official' });
  await createExamWithCitations({ id: 'exam:lpic2-202', vendorId: 'vendor:lpi', examCode: '202-450', name: 'LPIC-2 Linux Engineer Exam 202', format: ExamFormat.MULTIPLE_CHOICE, costAmountUsd: 200, costAmountCadOverride: 275, durationMinutes: 90, officialUrl: 'https://www.lpi.org/our-certifications/lpic-2-overview/', sourceId: 'src:lpi-official' });
  await createExamWithCitations({ id: 'exam:ex294', vendorId: 'vendor:redhat', examCode: 'EX294', name: 'Red Hat Certified Engineer (RHCE) Exam', format: ExamFormat.HANDS_ON_LAB, costAmountUsd: 500, costAmountCadOverride: 680, durationMinutes: 240, officialUrl: 'https://www.redhat.com/en/services/training/ex294-red-hat-certified-engineer-rhce-exam', sourceId: 'src:redhat-official' });
  await createExamWithCitations({ id: 'exam:lpic3-303', vendorId: 'vendor:lpi', examCode: '303-300', name: 'LPIC-3 Linux Enterprise Security Exam', format: ExamFormat.MULTIPLE_CHOICE, costAmountUsd: 200, costAmountCadOverride: 275, durationMinutes: 90, officialUrl: 'https://www.lpi.org/our-certifications/lpic-3-303-overview/', sourceId: 'src:lpi-official' });

  await createCertWithCitations({ id: 'cert:lpi-linux-essentials', vendorId: 'vendor:lpi', name: 'LPI Linux Essentials', acronym: 'Linux Essentials', level: CertLevel.ENTRY, renewalPeriodMonths: 0, renewalRequirementsText: 'Lifetime', description: 'Foundational Linux and open source concept verification.', officialUrl: 'https://www.lpi.org/our-certifications/linux-essentials-overview/', domainIds: ['domain:linux'], roleIds: ['role:sysadmin'], scoreInputs: { marketValueScore: 55, demandScore: 65, rigorScore: 45, communityPerceptionScore: 70 }, sourceId: 'src:lpi-official' });
  await createCertWithCitations({ id: 'cert:comptia-linux-plus', vendorId: 'vendor:comptia', name: 'CompTIA Linux+', acronym: 'Linux+', level: CertLevel.ASSOCIATE, renewalPeriodMonths: 36, renewalRequirementsText: '50 CEUs', description: 'Vendor-neutral enterprise Linux administration and automation.', officialUrl: 'https://www.comptia.org/certifications/linux', domainIds: ['domain:linux'], roleIds: ['role:sysadmin', 'role:cloud-architect'], scoreInputs: { marketValueScore: 74, demandScore: 80, rigorScore: 65, communityPerceptionScore: 78 }, sourceId: 'src:comptia-official' });
  await createCertWithCitations({ id: 'cert:lpi-lpic-1', vendorId: 'vendor:lpi', name: 'LPIC-1: Linux Administrator', acronym: 'LPIC-1', level: CertLevel.ASSOCIATE, renewalPeriodMonths: 60, renewalRequirementsText: '5-year lifecycle or pass LPIC-2', description: 'Multi-distribution Linux administration certification (2 exams).', officialUrl: 'https://www.lpi.org/our-certifications/lpic-1-overview/', domainIds: ['domain:linux'], roleIds: ['role:sysadmin'], scoreInputs: { marketValueScore: 75, demandScore: 78, rigorScore: 68, communityPerceptionScore: 80 }, sourceId: 'src:lpi-official' });
  await createCertWithCitations({ id: 'cert:linux-foundation-lfcs', vendorId: 'vendor:linuxfoundation', name: 'Linux Foundation Certified System Administrator', acronym: 'LFCS', level: CertLevel.ASSOCIATE, renewalPeriodMonths: 36, renewalRequirementsText: '36-month validity or retake', description: '100% hands-on command line performance-based Linux administration.', officialUrl: 'https://training.linuxfoundation.org/certification/linux-foundation-certified-sysadmin-lfcs/', domainIds: ['domain:linux'], roleIds: ['role:sysadmin'], scoreInputs: { marketValueScore: 80, demandScore: 75, rigorScore: 88, communityPerceptionScore: 88 }, sourceId: 'src:lf-official' });
  await createCertWithCitations({ id: 'cert:redhat-rhcsa', vendorId: 'vendor:redhat', name: 'Red Hat Certified System Administrator', acronym: 'RHCSA', level: CertLevel.ASSOCIATE, renewalPeriodMonths: 36, renewalRequirementsText: 'Pass higher Red Hat specialist exam', description: 'Gold-standard practical hands-on enterprise RHEL system administration.', officialUrl: 'https://www.redhat.com/en/services/training/ex200-red-hat-certified-system-administrator-rhcsa-exam', domainIds: ['domain:linux'], roleIds: ['role:sysadmin', 'role:cloud-architect'], scoreInputs: { marketValueScore: 88, demandScore: 92, rigorScore: 90, communityPerceptionScore: 95 }, sourceId: 'src:redhat-official' });
  await createCertWithCitations({ id: 'cert:lpi-lpic-2', vendorId: 'vendor:lpi', name: 'LPIC-2: Linux Engineer', acronym: 'LPIC-2', level: CertLevel.PROFESSIONAL, renewalPeriodMonths: 60, renewalRequirementsText: '5-year lifecycle', description: 'Advanced Linux network services, kernel tuning, and storage.', officialUrl: 'https://www.lpi.org/our-certifications/lpic-2-overview/', domainIds: ['domain:linux'], roleIds: ['role:sysadmin'], scoreInputs: { marketValueScore: 82, demandScore: 75, rigorScore: 78, communityPerceptionScore: 82 }, sourceId: 'src:lpi-official' });
  await createCertWithCitations({ id: 'cert:redhat-rhce', vendorId: 'vendor:redhat', name: 'Red Hat Certified Engineer', acronym: 'RHCE', level: CertLevel.PROFESSIONAL, renewalPeriodMonths: 36, renewalRequirementsText: 'Earn Certificate of Expertise', description: 'Automating Linux system tasks with Red Hat Ansible Engine in a 4-hour practical lab.', officialUrl: 'https://www.redhat.com/en/services/training/ex294-red-hat-certified-engineer-rhce-exam', domainIds: ['domain:linux'], roleIds: ['role:sysadmin', 'role:cloud-architect'], scoreInputs: { marketValueScore: 94, demandScore: 90, rigorScore: 94, communityPerceptionScore: 96 }, sourceId: 'src:redhat-official' });
  await createCertWithCitations({ id: 'cert:lpi-lpic-3-security', vendorId: 'vendor:lpi', name: 'LPIC-3: Linux Enterprise Security', acronym: 'LPIC-3 Security', level: CertLevel.EXPERT, renewalPeriodMonths: 60, renewalRequirementsText: '5-year lifecycle', description: 'Enterprise-grade Linux hardening, cryptography, access controls, and network security.', officialUrl: 'https://www.lpi.org/our-certifications/lpic-3-303-overview/', domainIds: ['domain:linux', 'domain:cybersecurity'], roleIds: ['role:sysadmin', 'role:security-architect'], scoreInputs: { marketValueScore: 88, demandScore: 72, rigorScore: 85, communityPerceptionScore: 85 }, sourceId: 'src:lpi-official' });
  await createCertWithCitations({ id: 'cert:redhat-rhca', vendorId: 'vendor:redhat', name: 'Red Hat Certified Architect', acronym: 'RHCA', level: CertLevel.EXPERT, renewalPeriodMonths: 36, renewalRequirementsText: 'Maintain 5 active Red Hat specialist certs', description: 'Highest level of Red Hat certification, awarded after passing 5 distinct hands-on specialist exams beyond RHCE.', officialUrl: 'https://www.redhat.com/en/services/certifications/rhca', domainIds: ['domain:linux'], roleIds: ['role:sysadmin', 'role:cloud-architect'], scoreInputs: { marketValueScore: 98, demandScore: 84, rigorScore: 99, communityPerceptionScore: 98 }, sourceId: 'src:redhat-official' });

  // Linux Prerequisite & Progression Links
  const linEssG = await prisma.prerequisiteGroup.create({ data: { id: 'g:liness:root', targetCertificationId: 'cert:lpi-linux-essentials', logicType: LogicType.AND } });
  await prisma.prerequisiteGroupMember.create({ data: { id: 'm:liness:ex', groupId: linEssG.id, memberType: MemberType.EXAM, examId: 'exam:lpi-010', edgeType: EdgeType.REQUIRED } });

  const linPlusG = await prisma.prerequisiteGroup.create({ data: { id: 'g:linplus:root', targetCertificationId: 'cert:comptia-linux-plus', logicType: LogicType.AND } });
  await prisma.prerequisiteGroupMember.create({ data: { id: 'm:linplus:ex', groupId: linPlusG.id, memberType: MemberType.EXAM, examId: 'exam:xk0-005', edgeType: EdgeType.REQUIRED } });
  await prisma.prerequisiteGroupMember.create({ data: { id: 'm:linplus:liness', groupId: linPlusG.id, memberType: MemberType.CERTIFICATION, certificationId: 'cert:lpi-linux-essentials', edgeType: EdgeType.RECOMMENDED, notes: 'Foundational open source precursor' } });

  const lfcsG = await prisma.prerequisiteGroup.create({ data: { id: 'g:lfcs:root', targetCertificationId: 'cert:linux-foundation-lfcs', logicType: LogicType.AND } });
  await prisma.prerequisiteGroupMember.create({ data: { id: 'm:lfcs:ex', groupId: lfcsG.id, memberType: MemberType.EXAM, examId: 'exam:lfcs', edgeType: EdgeType.REQUIRED } });
  await prisma.prerequisiteGroupMember.create({ data: { id: 'm:lfcs:liness', groupId: lfcsG.id, memberType: MemberType.CERTIFICATION, certificationId: 'cert:lpi-linux-essentials', edgeType: EdgeType.RECOMMENDED, notes: 'Foundational Linux precursor' } });

  const lpic1G = await prisma.prerequisiteGroup.create({ data: { id: 'g:lpic1:root', targetCertificationId: 'cert:lpi-lpic-1', logicType: LogicType.AND, minRequired: 2 } });
  await prisma.prerequisiteGroupMember.create({ data: { id: 'm:lpic1:101', groupId: lpic1G.id, memberType: MemberType.EXAM, examId: 'exam:lpic1-101', edgeType: EdgeType.REQUIRED } });
  await prisma.prerequisiteGroupMember.create({ data: { id: 'm:lpic1:102', groupId: lpic1G.id, memberType: MemberType.EXAM, examId: 'exam:lpic1-102', edgeType: EdgeType.REQUIRED } });
  await prisma.prerequisiteGroupMember.create({ data: { id: 'm:lpic1:ess-recom', groupId: lpic1G.id, memberType: MemberType.CERTIFICATION, certificationId: 'cert:lpi-linux-essentials', edgeType: EdgeType.RECOMMENDED, notes: 'Foundational precursor' } });

  const rhcsaG = await prisma.prerequisiteGroup.create({ data: { id: 'g:rhcsa:root', targetCertificationId: 'cert:redhat-rhcsa', logicType: LogicType.AND } });
  await prisma.prerequisiteGroupMember.create({ data: { id: 'm:rhcsa:ex200', groupId: rhcsaG.id, memberType: MemberType.EXAM, examId: 'exam:ex200', edgeType: EdgeType.REQUIRED } });
  await prisma.prerequisiteGroupMember.create({ data: { id: 'm:rhcsa:linplus', groupId: rhcsaG.id, memberType: MemberType.CERTIFICATION, certificationId: 'cert:comptia-linux-plus', edgeType: EdgeType.RECOMMENDED, notes: 'Recommended general Linux knowledge' } });
  await prisma.prerequisiteGroupMember.create({ data: { id: 'm:rhcsa:lfcs', groupId: rhcsaG.id, memberType: MemberType.CERTIFICATION, certificationId: 'cert:linux-foundation-lfcs', edgeType: EdgeType.RECOMMENDED, notes: 'Practical CLI administration precursor' } });

  const lpic2G = await prisma.prerequisiteGroup.create({ data: { id: 'g:lpic2:root', targetCertificationId: 'cert:lpi-lpic-2', logicType: LogicType.AND, minRequired: 3 } });
  await prisma.prerequisiteGroupMember.create({ data: { id: 'm:lpic2:201', groupId: lpic2G.id, memberType: MemberType.EXAM, examId: 'exam:lpic2-201', edgeType: EdgeType.REQUIRED } });
  await prisma.prerequisiteGroupMember.create({ data: { id: 'm:lpic2:202', groupId: lpic2G.id, memberType: MemberType.EXAM, examId: 'exam:lpic2-202', edgeType: EdgeType.REQUIRED } });
  await prisma.prerequisiteGroupMember.create({ data: { id: 'm:lpic2:lpic1-prereq', groupId: lpic2G.id, memberType: MemberType.CERTIFICATION, certificationId: 'cert:lpi-lpic-1', edgeType: EdgeType.REQUIRED, notes: 'Must hold active LPIC-1' } });

  const rhceG = await prisma.prerequisiteGroup.create({ data: { id: 'g:rhce:root', targetCertificationId: 'cert:redhat-rhce', logicType: LogicType.AND } });
  await prisma.prerequisiteGroupMember.create({ data: { id: 'm:rhce:ex294', groupId: rhceG.id, memberType: MemberType.EXAM, examId: 'exam:ex294', edgeType: EdgeType.REQUIRED } });
  await prisma.prerequisiteGroupMember.create({ data: { id: 'm:rhce:rhcsa-prereq', groupId: rhceG.id, memberType: MemberType.CERTIFICATION, certificationId: 'cert:redhat-rhcsa', edgeType: EdgeType.REQUIRED, notes: 'Must hold active RHCSA' } });

  const lpic3G = await prisma.prerequisiteGroup.create({ data: { id: 'g:lpic3:root', targetCertificationId: 'cert:lpi-lpic-3-security', logicType: LogicType.AND } });
  await prisma.prerequisiteGroupMember.create({ data: { id: 'm:lpic3:303', groupId: lpic3G.id, memberType: MemberType.EXAM, examId: 'exam:lpic3-303', edgeType: EdgeType.REQUIRED } });
  await prisma.prerequisiteGroupMember.create({ data: { id: 'm:lpic3:lpic2-prereq', groupId: lpic3G.id, memberType: MemberType.CERTIFICATION, certificationId: 'cert:lpi-lpic-2', edgeType: EdgeType.REQUIRED, notes: 'Must hold active LPIC-2' } });

  const rhcaG = await prisma.prerequisiteGroup.create({ data: { id: 'g:rhca:root', targetCertificationId: 'cert:redhat-rhca', logicType: LogicType.AND } });
  await prisma.prerequisiteGroupMember.create({ data: { id: 'm:rhca:rhce-prereq', groupId: rhcaG.id, memberType: MemberType.CERTIFICATION, certificationId: 'cert:redhat-rhce', edgeType: EdgeType.REQUIRED, notes: 'Must hold active RHCE + pass 5 specialist exams' } });

  // ==========================================
  // DOMAIN 3: CYBERSECURITY (13 Certs)
  // ==========================================
  console.log('🛡️ Seeding Domain 3: Cybersecurity...');
  await createExamWithCitations({ id: 'exam:sy0-701', vendorId: 'vendor:comptia', examCode: 'SY0-701', name: 'CompTIA Security+ Exam', format: ExamFormat.PERFORMANCE_BASED, costAmountUsd: 392, costAmountCadOverride: 498, durationMinutes: 90, officialUrl: 'https://www.comptia.org/certifications/security', sourceId: 'src:comptia-official' });
  await createExamWithCitations({ id: 'exam:isc2-cc', vendorId: 'vendor:isc2', examCode: 'ISC2-CC', name: 'Certified in Cybersecurity (CC) Exam', format: ExamFormat.MULTIPLE_CHOICE, costAmountUsd: 199, costAmountCadOverride: 270, durationMinutes: 120, officialUrl: 'https://www.isc2.org/Certifications/CC', sourceId: 'src:isc2-official' });
  await createExamWithCitations({ id: 'exam:cs0-003', vendorId: 'vendor:comptia', examCode: 'CS0-003', name: 'CompTIA CySA+ Exam', format: ExamFormat.PERFORMANCE_BASED, costAmountUsd: 392, costAmountCadOverride: 498, durationMinutes: 165, officialUrl: 'https://www.comptia.org/certifications/cybersecurity-analyst', sourceId: 'src:comptia-official' });
  await createExamWithCitations({ id: 'exam:pt0-003', vendorId: 'vendor:comptia', examCode: 'PT0-003', name: 'CompTIA PenTest+ Exam', format: ExamFormat.PERFORMANCE_BASED, costAmountUsd: 392, costAmountCadOverride: 498, durationMinutes: 165, officialUrl: 'https://www.comptia.org/certifications/pentest', sourceId: 'src:comptia-official' });
  await createExamWithCitations({ id: 'exam:sscp', vendorId: 'vendor:isc2', examCode: 'SSCP', name: 'Systems Security Certified Practitioner Exam', format: ExamFormat.MULTIPLE_CHOICE, costAmountUsd: 249, costAmountCadOverride: 340, durationMinutes: 180, officialUrl: 'https://www.isc2.org/Certifications/SSCP', sourceId: 'src:isc2-official' });
  await createExamWithCitations({ id: 'exam:gsec', vendorId: 'vendor:giac', examCode: 'GSEC', name: 'GIAC Security Essentials Certification Exam', format: ExamFormat.MULTIPLE_CHOICE, costAmountUsd: 949, durationMinutes: 300, officialUrl: 'https://www.giac.org/certifications/security-essentials-gsec/', sourceId: 'src:giac-official' });
  await createExamWithCitations({ id: 'exam:ceh-v13', vendorId: 'vendor:eccouncil', examCode: '312-50', name: 'Certified Ethical Hacker Exam', format: ExamFormat.MULTIPLE_CHOICE, costAmountUsd: 1199, durationMinutes: 240, officialUrl: 'https://www.eccouncil.org/train-certify/certified-ethical-hacker-ceh/', sourceId: 'src:eccouncil-official' });
  await createExamWithCitations({ id: 'exam:oscp', vendorId: 'vendor:offsec', examCode: 'PEN-200', name: 'OffSec Certified Professional (OSCP) 24h Lab Exam', format: ExamFormat.HANDS_ON_LAB, costAmountUsd: 1699, durationMinutes: 1440, officialUrl: 'https://www.offsec.com/courses/pen-200/', sourceId: 'src:offsec-official' });
  // Updated to official current SecurityX retail price ($530 USD / $675 CAD)
  await createExamWithCitations({ id: 'exam:cas-005', vendorId: 'vendor:comptia', examCode: 'CAS-005', name: 'CompTIA SecurityX (CASP+) Exam', format: ExamFormat.PERFORMANCE_BASED, costAmountUsd: 530, costAmountCadOverride: 675, durationMinutes: 165, officialUrl: 'https://www.comptia.org/certifications/securityx', sourceId: 'src:comptia-official' });
  await createExamWithCitations({ id: 'exam:cisa', vendorId: 'vendor:isaca', examCode: 'CISA', name: 'Certified Information Systems Auditor Exam', format: ExamFormat.MULTIPLE_CHOICE, costAmountUsd: 760, durationMinutes: 240, officialUrl: 'https://www.isaca.org/credentialing/cisa', sourceId: 'src:isaca-official' });
  await createExamWithCitations({ id: 'exam:cism', vendorId: 'vendor:isaca', examCode: 'CISM', name: 'Certified Information Security Manager Exam', format: ExamFormat.MULTIPLE_CHOICE, costAmountUsd: 760, durationMinutes: 240, officialUrl: 'https://www.isaca.org/credentialing/cism', sourceId: 'src:isaca-official' });
  await createExamWithCitations({ id: 'exam:ccsp', vendorId: 'vendor:isc2', examCode: 'CCSP', name: 'Certified Cloud Security Professional Exam', format: ExamFormat.MULTIPLE_CHOICE, costAmountUsd: 599, costAmountCadOverride: 810, durationMinutes: 240, officialUrl: 'https://www.isc2.org/Certifications/CCSP', sourceId: 'src:isc2-official' });
  await createExamWithCitations({ id: 'exam:cissp', vendorId: 'vendor:isc2', examCode: 'CISSP', name: 'Certified Information Systems Security Professional Exam', format: ExamFormat.MULTIPLE_CHOICE, costAmountUsd: 749, costAmountCadOverride: 1015, durationMinutes: 240, officialUrl: 'https://www.isc2.org/Certifications/CISSP', sourceId: 'src:isc2-official' });

  await createCertWithCitations({ id: 'cert:comptia-security-plus', vendorId: 'vendor:comptia', name: 'CompTIA Security+', acronym: 'Security+', level: CertLevel.ENTRY, renewalPeriodMonths: 36, renewalRequirementsText: '50 CEUs', description: 'Universal baseline cybersecurity credential satisfying DoD 8140/8570.', officialUrl: 'https://www.comptia.org/certifications/security', domainIds: ['domain:cybersecurity'], roleIds: ['role:soc-analyst', 'role:security-architect'], scoreInputs: { marketValueScore: 78, demandScore: 96, rigorScore: 65, communityPerceptionScore: 88 }, sourceId: 'src:comptia-official' });
  await createCertWithCitations({ id: 'cert:isc2-cc', vendorId: 'vendor:isc2', name: 'ISC2 Certified in Cybersecurity', acronym: 'ISC2 CC', level: CertLevel.ENTRY, renewalPeriodMonths: 36, renewalRequirementsText: '45 CPEs', description: 'Entry-level foundational cybersecurity credential by ISC2.', officialUrl: 'https://www.isc2.org/Certifications/CC', domainIds: ['domain:cybersecurity'], roleIds: ['role:soc-analyst'], scoreInputs: { marketValueScore: 58, demandScore: 70, rigorScore: 50, communityPerceptionScore: 72 }, sourceId: 'src:isc2-official' });
  await createCertWithCitations({ id: 'cert:comptia-cysa-plus', vendorId: 'vendor:comptia', name: 'CompTIA Cybersecurity Analyst', acronym: 'CySA+', level: CertLevel.ASSOCIATE, renewalPeriodMonths: 36, renewalRequirementsText: '60 CEUs', description: 'Defensive security analysis, threat hunting, vulnerability management, and SIEM monitoring.', officialUrl: 'https://www.comptia.org/certifications/cybersecurity-analyst', domainIds: ['domain:cybersecurity'], roleIds: ['role:soc-analyst'], scoreInputs: { marketValueScore: 80, demandScore: 84, rigorScore: 72, communityPerceptionScore: 85 }, sourceId: 'src:comptia-official' });
  await createCertWithCitations({ id: 'cert:comptia-pentest-plus', vendorId: 'vendor:comptia', name: 'CompTIA PenTest+', acronym: 'PenTest+', level: CertLevel.ASSOCIATE, renewalPeriodMonths: 36, renewalRequirementsText: '60 CEUs', description: 'Vulnerability assessment, penetration testing methodology, and scope reporting.', officialUrl: 'https://www.comptia.org/certifications/pentest', domainIds: ['domain:cybersecurity'], roleIds: ['role:pentester'], scoreInputs: { marketValueScore: 78, demandScore: 75, rigorScore: 70, communityPerceptionScore: 80 }, sourceId: 'src:comptia-official' });
  await createCertWithCitations({ id: 'cert:isc2-sscp', vendorId: 'vendor:isc2', name: 'ISC2 Systems Security Certified Practitioner', acronym: 'SSCP', level: CertLevel.ASSOCIATE, renewalPeriodMonths: 36, renewalRequirementsText: '60 CPEs + 1 yr experience', description: 'Operational security administration and infrastructure controls.', officialUrl: 'https://www.isc2.org/Certifications/SSCP', domainIds: ['domain:cybersecurity'], roleIds: ['role:soc-analyst', 'role:sysadmin'], scoreInputs: { marketValueScore: 75, demandScore: 72, rigorScore: 68, communityPerceptionScore: 78 }, sourceId: 'src:isc2-official' });
  await createCertWithCitations({ id: 'cert:giac-gsec', vendorId: 'vendor:giac', name: 'GIAC Security Essentials', acronym: 'GSEC', level: CertLevel.ASSOCIATE, renewalPeriodMonths: 48, renewalRequirementsText: '36 CPEs', description: 'Comprehensive hands-on security concepts across networking, cloud, and defense.', officialUrl: 'https://www.giac.org/certifications/security-essentials-gsec/', domainIds: ['domain:cybersecurity'], roleIds: ['role:soc-analyst'], scoreInputs: { marketValueScore: 85, demandScore: 76, rigorScore: 80, communityPerceptionScore: 88 }, sourceId: 'src:giac-official' });
  await createCertWithCitations({ id: 'cert:eccouncil-ceh', vendorId: 'vendor:eccouncil', name: 'Certified Ethical Hacker', acronym: 'CEH', level: CertLevel.ASSOCIATE, renewalPeriodMonths: 36, renewalRequirementsText: '120 ECE credits', description: 'Offensive ethical hacking techniques, attack phases, and countermeasures.', officialUrl: 'https://www.eccouncil.org/train-certify/certified-ethical-hacker-ceh/', domainIds: ['domain:cybersecurity'], roleIds: ['role:pentester', 'role:soc-analyst'], scoreInputs: { marketValueScore: 82, demandScore: 92, rigorScore: 60, communityPerceptionScore: 65 }, sourceId: 'src:eccouncil-official' });
  await createCertWithCitations({ id: 'cert:offsec-oscp', vendorId: 'vendor:offsec', name: 'OffSec Certified Professional', acronym: 'OSCP', level: CertLevel.PROFESSIONAL, renewalPeriodMonths: 0, renewalRequirementsText: 'Non-expiring', description: 'Industry-standard 24-hour practical penetration testing exam with active targets.', officialUrl: 'https://www.offsec.com/courses/pen-200/', domainIds: ['domain:cybersecurity'], roleIds: ['role:pentester'], scoreInputs: { marketValueScore: 95, demandScore: 90, rigorScore: 98, communityPerceptionScore: 98 }, sourceId: 'src:offsec-official' });
  await createCertWithCitations({ id: 'cert:comptia-securityx', vendorId: 'vendor:comptia', name: 'CompTIA SecurityX', acronym: 'SecurityX', level: CertLevel.PROFESSIONAL, renewalPeriodMonths: 36, renewalRequirementsText: '75 CEUs', description: 'Advanced cybersecurity architecture and engineering (formerly CASP+).', officialUrl: 'https://www.comptia.org/certifications/securityx', domainIds: ['domain:cybersecurity'], roleIds: ['role:security-architect'], scoreInputs: { marketValueScore: 88, demandScore: 82, rigorScore: 85, communityPerceptionScore: 86 }, sourceId: 'src:comptia-official' });
  await createCertWithCitations({ id: 'cert:isaca-cisa', vendorId: 'vendor:isaca', name: 'Certified Information Systems Auditor', acronym: 'CISA', level: CertLevel.PROFESSIONAL, renewalPeriodMonths: 36, renewalRequirementsText: '120 CPEs + 5 yrs audit exp', description: 'Gold standard for information systems audit, control, and assurance.', officialUrl: 'https://www.isaca.org/credentialing/cisa', domainIds: ['domain:cybersecurity'], roleIds: ['role:security-architect'], scoreInputs: { marketValueScore: 94, demandScore: 92, rigorScore: 84, communityPerceptionScore: 90 }, sourceId: 'src:isaca-official' });
  await createCertWithCitations({ id: 'cert:isaca-cism', vendorId: 'vendor:isaca', name: 'Certified Information Security Manager', acronym: 'CISM', level: CertLevel.PROFESSIONAL, renewalPeriodMonths: 36, renewalRequirementsText: '120 CPEs + 5 yrs mgmt exp', description: 'Information security management, governance, incident management, and risk.', officialUrl: 'https://www.isaca.org/credentialing/cism', domainIds: ['domain:cybersecurity'], roleIds: ['role:security-architect'], scoreInputs: { marketValueScore: 95, demandScore: 94, rigorScore: 85, communityPerceptionScore: 92 }, sourceId: 'src:isaca-official' });
  await createCertWithCitations({ id: 'cert:isc2-ccsp', vendorId: 'vendor:isc2', name: 'Certified Cloud Security Professional', acronym: 'CCSP', level: CertLevel.PROFESSIONAL, renewalPeriodMonths: 36, renewalRequirementsText: '90 CPEs + 5 yrs exp', description: 'Co-created by ISC2 and Cloud Security Alliance for cloud security architecture.', officialUrl: 'https://www.isc2.org/Certifications/CCSP', domainIds: ['domain:cybersecurity', 'domain:cloud'], roleIds: ['role:security-architect', 'role:cloud-architect'], scoreInputs: { marketValueScore: 92, demandScore: 88, rigorScore: 82, communityPerceptionScore: 90 }, sourceId: 'src:isc2-official' });
  await createCertWithCitations({ id: 'cert:isc2-cissp', vendorId: 'vendor:isc2', name: 'Certified Information Systems Security Professional', acronym: 'CISSP', level: CertLevel.EXPERT, renewalPeriodMonths: 36, renewalRequirementsText: '120 CPEs + 5 yrs exp', description: 'Premier globally recognized credential for security leaders, architects, and managers.', officialUrl: 'https://www.isc2.org/Certifications/CISSP', domainIds: ['domain:cybersecurity'], roleIds: ['role:security-architect'], scoreInputs: { marketValueScore: 98, demandScore: 99, rigorScore: 92, communityPerceptionScore: 96 }, sourceId: 'src:isc2-official' });

  // Cyber Prerequisite & Progression Links
  const iscCcG = await prisma.prerequisiteGroup.create({ data: { id: 'g:isccc:root', targetCertificationId: 'cert:isc2-cc', logicType: LogicType.AND } });
  await prisma.prerequisiteGroupMember.create({ data: { id: 'm:isccc:ex', groupId: iscCcG.id, memberType: MemberType.EXAM, examId: 'exam:isc2-cc', edgeType: EdgeType.REQUIRED } });

  const secPlusG = await prisma.prerequisiteGroup.create({ data: { id: 'g:secplus', targetCertificationId: 'cert:comptia-security-plus', logicType: LogicType.AND } });
  await prisma.prerequisiteGroupMember.create({ data: { id: 'm:secplus:ex', groupId: secPlusG.id, memberType: MemberType.EXAM, examId: 'exam:sy0-701', edgeType: EdgeType.REQUIRED } });
  await prisma.prerequisiteGroupMember.create({ data: { id: 'm:secplus:net-recom', groupId: secPlusG.id, memberType: MemberType.CERTIFICATION, certificationId: 'cert:comptia-network-plus', edgeType: EdgeType.RECOMMENDED, notes: 'Networking fundamentals precursor' } });
  await prisma.prerequisiteGroupMember.create({ data: { id: 'm:secplus:cc-recom', groupId: secPlusG.id, memberType: MemberType.CERTIFICATION, certificationId: 'cert:isc2-cc', edgeType: EdgeType.RECOMMENDED, notes: 'Foundational cyber precursor' } });

  const sscpG = await prisma.prerequisiteGroup.create({ data: { id: 'g:sscp:root', targetCertificationId: 'cert:isc2-sscp', logicType: LogicType.AND } });
  await prisma.prerequisiteGroupMember.create({ data: { id: 'm:sscp:ex', groupId: sscpG.id, memberType: MemberType.EXAM, examId: 'exam:sscp', edgeType: EdgeType.REQUIRED } });
  await prisma.prerequisiteGroupMember.create({ data: { id: 'm:sscp:secplus-recom', groupId: sscpG.id, memberType: MemberType.CERTIFICATION, certificationId: 'cert:comptia-security-plus', edgeType: EdgeType.RECOMMENDED, notes: 'Foundational security precursor' } });

  const gsecG = await prisma.prerequisiteGroup.create({ data: { id: 'g:gsec:root', targetCertificationId: 'cert:giac-gsec', logicType: LogicType.AND } });
  await prisma.prerequisiteGroupMember.create({ data: { id: 'm:gsec:ex', groupId: gsecG.id, memberType: MemberType.EXAM, examId: 'exam:gsec', edgeType: EdgeType.REQUIRED } });
  await prisma.prerequisiteGroupMember.create({ data: { id: 'm:gsec:secplus-recom', groupId: gsecG.id, memberType: MemberType.CERTIFICATION, certificationId: 'cert:comptia-security-plus', edgeType: EdgeType.RECOMMENDED, notes: 'Baseline security precursor' } });

  const cehG = await prisma.prerequisiteGroup.create({ data: { id: 'g:ceh:root', targetCertificationId: 'cert:eccouncil-ceh', logicType: LogicType.AND } });
  await prisma.prerequisiteGroupMember.create({ data: { id: 'm:ceh:ex', groupId: cehG.id, memberType: MemberType.EXAM, examId: 'exam:ceh-v13', edgeType: EdgeType.REQUIRED } });
  await prisma.prerequisiteGroupMember.create({ data: { id: 'm:ceh:secplus-recom', groupId: cehG.id, memberType: MemberType.CERTIFICATION, certificationId: 'cert:comptia-security-plus', edgeType: EdgeType.RECOMMENDED, notes: 'Security concepts precursor' } });

  const cysaG = await prisma.prerequisiteGroup.create({ data: { id: 'g:cysa', targetCertificationId: 'cert:comptia-cysa-plus', logicType: LogicType.AND } });
  await prisma.prerequisiteGroupMember.create({ data: { id: 'm:cysa:ex', groupId: cysaG.id, memberType: MemberType.EXAM, examId: 'exam:cs0-003', edgeType: EdgeType.REQUIRED } });
  await prisma.prerequisiteGroupMember.create({ data: { id: 'm:cysa:sec-recom', groupId: cysaG.id, memberType: MemberType.CERTIFICATION, certificationId: 'cert:comptia-security-plus', edgeType: EdgeType.RECOMMENDED, notes: 'Security fundamentals precursor' } });

  const pentestG = await prisma.prerequisiteGroup.create({ data: { id: 'g:pentest', targetCertificationId: 'cert:comptia-pentest-plus', logicType: LogicType.AND } });
  await prisma.prerequisiteGroupMember.create({ data: { id: 'm:pentest:ex', groupId: pentestG.id, memberType: MemberType.EXAM, examId: 'exam:pt0-003', edgeType: EdgeType.REQUIRED } });
  await prisma.prerequisiteGroupMember.create({ data: { id: 'm:pentest:sec-recom', groupId: pentestG.id, memberType: MemberType.CERTIFICATION, certificationId: 'cert:comptia-security-plus', edgeType: EdgeType.RECOMMENDED, notes: 'Security fundamentals precursor' } });

  const oscpG = await prisma.prerequisiteGroup.create({ data: { id: 'g:oscp', targetCertificationId: 'cert:offsec-oscp', logicType: LogicType.AND } });
  await prisma.prerequisiteGroupMember.create({ data: { id: 'm:oscp:ex', groupId: oscpG.id, memberType: MemberType.EXAM, examId: 'exam:oscp', edgeType: EdgeType.REQUIRED } });
  await prisma.prerequisiteGroupMember.create({ data: { id: 'm:oscp:pentest-recom', groupId: oscpG.id, memberType: MemberType.CERTIFICATION, certificationId: 'cert:comptia-pentest-plus', edgeType: EdgeType.RECOMMENDED, notes: 'Theoretical pentesting precursor' } });
  await prisma.prerequisiteGroupMember.create({ data: { id: 'm:oscp:ceh-recom', groupId: oscpG.id, memberType: MemberType.CERTIFICATION, certificationId: 'cert:eccouncil-ceh', edgeType: EdgeType.RECOMMENDED, notes: 'Ethical hacking theory precursor' } });

  const secXG = await prisma.prerequisiteGroup.create({ data: { id: 'g:secx', targetCertificationId: 'cert:comptia-securityx', logicType: LogicType.AND } });
  await prisma.prerequisiteGroupMember.create({ data: { id: 'm:secx:ex', groupId: secXG.id, memberType: MemberType.EXAM, examId: 'exam:cas-005', edgeType: EdgeType.REQUIRED } });
  await prisma.prerequisiteGroupMember.create({ data: { id: 'm:secx:cysa-recom', groupId: secXG.id, memberType: MemberType.CERTIFICATION, certificationId: 'cert:comptia-cysa-plus', edgeType: EdgeType.RECOMMENDED, notes: 'Practitioner analyst precursor' } });

  const cisaG = await prisma.prerequisiteGroup.create({ data: { id: 'g:cisa:root', targetCertificationId: 'cert:isaca-cisa', logicType: LogicType.AND } });
  await prisma.prerequisiteGroupMember.create({ data: { id: 'm:cisa:ex', groupId: cisaG.id, memberType: MemberType.EXAM, examId: 'exam:cisa', edgeType: EdgeType.REQUIRED } });
  await prisma.prerequisiteGroupMember.create({ data: { id: 'm:cisa:secplus-recom', groupId: cisaG.id, memberType: MemberType.CERTIFICATION, certificationId: 'cert:comptia-security-plus', edgeType: EdgeType.RECOMMENDED, notes: 'Foundational security concepts' } });

  const cismG = await prisma.prerequisiteGroup.create({ data: { id: 'g:cism:root', targetCertificationId: 'cert:isaca-cism', logicType: LogicType.AND } });
  await prisma.prerequisiteGroupMember.create({ data: { id: 'm:cism:ex', groupId: cismG.id, memberType: MemberType.EXAM, examId: 'exam:cism', edgeType: EdgeType.REQUIRED } });
  await prisma.prerequisiteGroupMember.create({ data: { id: 'm:cism:cisa-recom', groupId: cismG.id, memberType: MemberType.CERTIFICATION, certificationId: 'cert:isaca-cisa', edgeType: EdgeType.RECOMMENDED, notes: 'Audit to security management progression' } });

  const ccspG = await prisma.prerequisiteGroup.create({ data: { id: 'g:ccsp:root', targetCertificationId: 'cert:isc2-ccsp', logicType: LogicType.AND } });
  await prisma.prerequisiteGroupMember.create({ data: { id: 'm:ccsp:ex', groupId: ccspG.id, memberType: MemberType.EXAM, examId: 'exam:ccsp', edgeType: EdgeType.REQUIRED } });
  await prisma.prerequisiteGroupMember.create({ data: { id: 'm:ccsp:cissp-recom', groupId: ccspG.id, memberType: MemberType.CERTIFICATION, certificationId: 'cert:isc2-cissp', edgeType: EdgeType.RECOMMENDED, notes: 'General security leadership to cloud security' } });
  await prisma.prerequisiteGroupMember.create({ data: { id: 'm:ccsp:secplus-recom', groupId: ccspG.id, memberType: MemberType.CERTIFICATION, certificationId: 'cert:comptia-security-plus', edgeType: EdgeType.RECOMMENDED, notes: 'Foundational security precursor' } });

  const cisspRootG = await prisma.prerequisiteGroup.create({ data: { id: 'g:cissp:root', targetCertificationId: 'cert:isc2-cissp', logicType: LogicType.AND, groupLabel: 'CISSP Gateway' } });
  await prisma.prerequisiteGroupMember.create({ data: { id: 'm:cissp:exam', groupId: cisspRootG.id, memberType: MemberType.EXAM, examId: 'exam:cissp', edgeType: EdgeType.REQUIRED } });
  await prisma.prerequisiteGroupMember.create({ data: { id: 'm:cissp:sscp-recom', groupId: cisspRootG.id, memberType: MemberType.CERTIFICATION, certificationId: 'cert:isc2-sscp', edgeType: EdgeType.RECOMMENDED, notes: 'ISC2 associate practitioner precursor' } });

  const cisspWaiverGateway = await prisma.prerequisiteGroup.create({ data: { id: 'g:cissp:exp-waiver-gateway', targetCertificationId: 'cert:isc2-cissp', parentGroupId: cisspRootG.id, logicType: LogicType.OR, minRequired: 1, groupLabel: 'Experience or Education Waiver Route' } });
  await prisma.prerequisiteGroupMember.create({ data: { id: 'm:cissp:5yr-exp', groupId: cisspWaiverGateway.id, memberType: MemberType.EXPERIENCE, experienceDescription: '5 years cumulative paid work experience in 2+ domains of the CISSP CBK', edgeType: EdgeType.ALTERNATIVE } });

  const cisspWaiverBranch = await prisma.prerequisiteGroup.create({ data: { id: 'g:cissp:waiver-branch', targetCertificationId: 'cert:isc2-cissp', parentGroupId: cisspWaiverGateway.id, logicType: LogicType.AND, minRequired: 2, groupLabel: '1-Year Waiver Route' } });
  await prisma.prerequisiteGroupMember.create({ data: { id: 'm:cissp:4yr-exp', groupId: cisspWaiverBranch.id, memberType: MemberType.EXPERIENCE, experienceDescription: '4 years cumulative paid work experience in 2+ domains of the CISSP CBK', edgeType: EdgeType.REQUIRED } });

  const cisspWaiverQualifiers = await prisma.prerequisiteGroup.create({ data: { id: 'g:cissp:waiver-qualifiers', targetCertificationId: 'cert:isc2-cissp', parentGroupId: cisspWaiverBranch.id, logicType: LogicType.OR, minRequired: 1, groupLabel: 'Qualifying Education or Approved Credential' } });
  await prisma.prerequisiteGroupMember.create({ data: { id: 'm:cissp:degree', groupId: cisspWaiverQualifiers.id, memberType: MemberType.DEGREE, degreeDescription: '4-year post-secondary degree', edgeType: EdgeType.ALTERNATIVE } });
  await prisma.prerequisiteGroupMember.create({ data: { id: 'm:cissp:secplus-waiver', groupId: cisspWaiverQualifiers.id, memberType: MemberType.CERTIFICATION, certificationId: 'cert:comptia-security-plus', edgeType: EdgeType.ALTERNATIVE, notes: 'ISC2 Approved Credential Waiver' } });
  await prisma.prerequisiteGroupMember.create({ data: { id: 'm:cissp:cisa-waiver', groupId: cisspWaiverQualifiers.id, memberType: MemberType.CERTIFICATION, certificationId: 'cert:isaca-cisa', edgeType: EdgeType.ALTERNATIVE, notes: 'ISC2 Approved Credential Waiver' } });

  // ==========================================
  // DOMAIN 4: MICROSOFT / WINDOWS / AZURE (10 Certs)
  // ==========================================
  console.log('🪟 Seeding Domain 4: Microsoft / Windows / Azure...');
  await createExamWithCitations({ id: 'exam:az-900', vendorId: 'vendor:microsoft', examCode: 'AZ-900', name: 'Microsoft Azure Fundamentals', format: ExamFormat.MULTIPLE_CHOICE, costAmountUsd: 99, costAmountCadOverride: 125, durationMinutes: 60, officialUrl: 'https://learn.microsoft.com/credentials/certifications/azure-fundamentals/', sourceId: 'src:ms-learn' });
  await createExamWithCitations({ id: 'exam:ms-900', vendorId: 'vendor:microsoft', examCode: 'MS-900', name: 'Microsoft 365 Fundamentals', format: ExamFormat.MULTIPLE_CHOICE, costAmountUsd: 99, costAmountCadOverride: 125, durationMinutes: 60, officialUrl: 'https://learn.microsoft.com/credentials/certifications/d365-fundamentals/', sourceId: 'src:ms-learn' });
  await createExamWithCitations({ id: 'exam:sc-900', vendorId: 'vendor:microsoft', examCode: 'SC-900', name: 'Microsoft Security, Compliance, and Identity Fundamentals', format: ExamFormat.MULTIPLE_CHOICE, costAmountUsd: 99, costAmountCadOverride: 125, durationMinutes: 60, officialUrl: 'https://learn.microsoft.com/credentials/certifications/security-compliance-and-identity-fundamentals/', sourceId: 'src:ms-learn' });
  await createExamWithCitations({ id: 'exam:az-104', vendorId: 'vendor:microsoft', examCode: 'AZ-104', name: 'Microsoft Azure Administrator', format: ExamFormat.PERFORMANCE_BASED, costAmountUsd: 165, costAmountCadOverride: 215, durationMinutes: 120, officialUrl: 'https://learn.microsoft.com/credentials/certifications/azure-administrator/', sourceId: 'src:ms-learn' });
  await createExamWithCitations({ id: 'exam:az-800', vendorId: 'vendor:microsoft', examCode: 'AZ-800', name: 'Administering Windows Server Hybrid Core Infrastructure', format: ExamFormat.PERFORMANCE_BASED, costAmountUsd: 165, costAmountCadOverride: 215, durationMinutes: 120, officialUrl: 'https://learn.microsoft.com/credentials/certifications/windows-server-hybrid-administrator/', sourceId: 'src:ms-learn' });
  await createExamWithCitations({ id: 'exam:az-801', vendorId: 'vendor:microsoft', examCode: 'AZ-801', name: 'Configuring Windows Server Hybrid Advanced Services', format: ExamFormat.PERFORMANCE_BASED, costAmountUsd: 165, costAmountCadOverride: 215, durationMinutes: 120, officialUrl: 'https://learn.microsoft.com/credentials/certifications/windows-server-hybrid-administrator/', sourceId: 'src:ms-learn' });
  await createExamWithCitations({ id: 'exam:az-500', vendorId: 'vendor:microsoft', examCode: 'AZ-500', name: 'Microsoft Azure Security Technologies', format: ExamFormat.PERFORMANCE_BASED, costAmountUsd: 165, costAmountCadOverride: 215, durationMinutes: 120, officialUrl: 'https://learn.microsoft.com/credentials/certifications/azure-security-engineer/', sourceId: 'src:ms-learn' });
  await createExamWithCitations({ id: 'exam:sc-200', vendorId: 'vendor:microsoft', examCode: 'SC-200', name: 'Microsoft Security Operations Analyst', format: ExamFormat.PERFORMANCE_BASED, costAmountUsd: 165, costAmountCadOverride: 215, durationMinutes: 120, officialUrl: 'https://learn.microsoft.com/credentials/certifications/security-operations-analyst/', sourceId: 'src:ms-learn' });
  await createExamWithCitations({ id: 'exam:md-102', vendorId: 'vendor:microsoft', examCode: 'MD-102', name: 'Endpoint Administrator', format: ExamFormat.PERFORMANCE_BASED, costAmountUsd: 165, costAmountCadOverride: 215, durationMinutes: 120, officialUrl: 'https://learn.microsoft.com/credentials/certifications/m365-endpoint-administrator/', sourceId: 'src:ms-learn' });
  await createExamWithCitations({ id: 'exam:az-305', vendorId: 'vendor:microsoft', examCode: 'AZ-305', name: 'Designing Microsoft Azure Infrastructure Solutions', format: ExamFormat.PERFORMANCE_BASED, costAmountUsd: 165, costAmountCadOverride: 215, durationMinutes: 120, officialUrl: 'https://learn.microsoft.com/credentials/certifications/azure-solutions-architect/', sourceId: 'src:ms-learn' });
  await createExamWithCitations({ id: 'exam:sc-100', vendorId: 'vendor:microsoft', examCode: 'SC-100', name: 'Microsoft Cybersecurity Architect', format: ExamFormat.PERFORMANCE_BASED, costAmountUsd: 165, costAmountCadOverride: 215, durationMinutes: 120, officialUrl: 'https://learn.microsoft.com/credentials/certifications/cybersecurity-architect-expert/', sourceId: 'src:ms-learn' });

  await createCertWithCitations({ id: 'cert:ms-az-900', vendorId: 'vendor:microsoft', name: 'Microsoft Certified: Azure Fundamentals', acronym: 'AZ-900', level: CertLevel.ENTRY, renewalPeriodMonths: 0, renewalRequirementsText: 'Non-expiring', description: 'Foundational cloud concepts, Azure architecture, compute, networking, and governance.', officialUrl: 'https://learn.microsoft.com/credentials/certifications/azure-fundamentals/', domainIds: ['domain:azure', 'domain:cloud'], roleIds: ['role:cloud-architect'], scoreInputs: { marketValueScore: 60, demandScore: 85, rigorScore: 40, communityPerceptionScore: 75 }, sourceId: 'src:ms-learn' });
  await createCertWithCitations({ id: 'cert:ms-ms-900', vendorId: 'vendor:microsoft', name: 'Microsoft 365 Certified: Fundamentals', acronym: 'MS-900', level: CertLevel.ENTRY, renewalPeriodMonths: 0, renewalRequirementsText: 'Non-expiring', description: 'Foundational understanding of Microsoft 365 cloud services, security, and licensing.', officialUrl: 'https://learn.microsoft.com/credentials/certifications/d365-fundamentals/', domainIds: ['domain:azure'], roleIds: ['role:sysadmin'], scoreInputs: { marketValueScore: 55, demandScore: 78, rigorScore: 40, communityPerceptionScore: 70 }, sourceId: 'src:ms-learn' });
  await createCertWithCitations({ id: 'cert:ms-sc-900', vendorId: 'vendor:microsoft', name: 'Microsoft Certified: Security Fundamentals', acronym: 'SC-900', level: CertLevel.ENTRY, renewalPeriodMonths: 0, renewalRequirementsText: 'Non-expiring', description: 'Fundamental security, compliance, and identity concepts across Microsoft cloud solutions.', officialUrl: 'https://learn.microsoft.com/credentials/certifications/security-compliance-and-identity-fundamentals/', domainIds: ['domain:azure', 'domain:cybersecurity'], roleIds: ['role:soc-analyst'], scoreInputs: { marketValueScore: 58, demandScore: 80, rigorScore: 42, communityPerceptionScore: 72 }, sourceId: 'src:ms-learn' });
  await createCertWithCitations({ id: 'cert:ms-az-104', vendorId: 'vendor:microsoft', name: 'Microsoft Certified: Azure Administrator Associate', acronym: 'AZ-104', level: CertLevel.ASSOCIATE, renewalPeriodMonths: 12, renewalRequirementsText: 'Annual free online renewal assessment', description: 'Core enterprise administrator credential for implementing and managing Azure identity, governance, storage, compute, and virtual networks.', officialUrl: 'https://learn.microsoft.com/credentials/certifications/azure-administrator/', domainIds: ['domain:azure', 'domain:cloud'], roleIds: ['role:cloud-architect', 'role:sysadmin'], scoreInputs: { marketValueScore: 85, demandScore: 95, rigorScore: 78, communityPerceptionScore: 90 }, sourceId: 'src:ms-learn' });
  await createCertWithCitations({ id: 'cert:ms-windows-hybrid', vendorId: 'vendor:microsoft', name: 'Windows Server Hybrid Administrator Associate', acronym: 'Windows Hybrid Admin', level: CertLevel.ASSOCIATE, renewalPeriodMonths: 12, renewalRequirementsText: 'Annual free online renewal assessment', description: 'Administering Windows Server workloads in on-premises, hybrid, and Azure IaaS environments (AZ-800 + AZ-801).', officialUrl: 'https://learn.microsoft.com/credentials/certifications/windows-server-hybrid-administrator/', domainIds: ['domain:azure'], roleIds: ['role:sysadmin'], scoreInputs: { marketValueScore: 82, demandScore: 86, rigorScore: 80, communityPerceptionScore: 84 }, sourceId: 'src:ms-learn' });
  await createCertWithCitations({ id: 'cert:ms-az-500', vendorId: 'vendor:microsoft', name: 'Microsoft Certified: Azure Security Engineer Associate', acronym: 'AZ-500', level: CertLevel.ASSOCIATE, renewalPeriodMonths: 12, renewalRequirementsText: 'Annual free online renewal assessment', description: 'Implementing security controls and threat protection across Azure identity, compute, network, and data.', officialUrl: 'https://learn.microsoft.com/credentials/certifications/azure-security-engineer/', domainIds: ['domain:azure', 'domain:cybersecurity'], roleIds: ['role:soc-analyst', 'role:security-architect'], scoreInputs: { marketValueScore: 88, demandScore: 88, rigorScore: 82, communityPerceptionScore: 88 }, sourceId: 'src:ms-learn' });
  await createCertWithCitations({ id: 'cert:ms-sc-200', vendorId: 'vendor:microsoft', name: 'Microsoft Certified: Security Operations Analyst Associate', acronym: 'SC-200', level: CertLevel.ASSOCIATE, renewalPeriodMonths: 12, renewalRequirementsText: 'Annual free online renewal assessment', description: 'Mitigating threats using Microsoft Sentinel, Defender for Cloud, and Microsoft Defender XDR.', officialUrl: 'https://learn.microsoft.com/credentials/certifications/security-operations-analyst/', domainIds: ['domain:azure', 'domain:cybersecurity'], roleIds: ['role:soc-analyst'], scoreInputs: { marketValueScore: 84, demandScore: 88, rigorScore: 78, communityPerceptionScore: 86 }, sourceId: 'src:ms-learn' });
  await createCertWithCitations({ id: 'cert:ms-md-102', vendorId: 'vendor:microsoft', name: 'Microsoft 365 Certified: Endpoint Administrator Associate', acronym: 'MD-102', level: CertLevel.ASSOCIATE, renewalPeriodMonths: 12, renewalRequirementsText: 'Annual free online renewal assessment', description: 'Deploying, configuring, and protecting Windows, iOS, and Android client endpoints using Microsoft Intune.', officialUrl: 'https://learn.microsoft.com/credentials/certifications/m365-endpoint-administrator/', domainIds: ['domain:azure'], roleIds: ['role:sysadmin'], scoreInputs: { marketValueScore: 78, demandScore: 82, rigorScore: 72, communityPerceptionScore: 80 }, sourceId: 'src:ms-learn' });
  await createCertWithCitations({ id: 'cert:ms-az-305', vendorId: 'vendor:microsoft', name: 'Microsoft Certified: Azure Solutions Architect Expert', acronym: 'AZ-305 Architect', level: CertLevel.EXPERT, renewalPeriodMonths: 12, renewalRequirementsText: 'Annual free online renewal assessment', description: 'Designing cloud and hybrid solutions running on Microsoft Azure, covering compute, network, storage, and security.', officialUrl: 'https://learn.microsoft.com/credentials/certifications/azure-solutions-architect/', domainIds: ['domain:azure', 'domain:cloud'], roleIds: ['role:cloud-architect'], scoreInputs: { marketValueScore: 96, demandScore: 96, rigorScore: 88, communityPerceptionScore: 94 }, sourceId: 'src:ms-learn' });
  await createCertWithCitations({ id: 'cert:ms-sc-100', vendorId: 'vendor:microsoft', name: 'Microsoft Certified: Cybersecurity Architect Expert', acronym: 'SC-100 Architect', level: CertLevel.EXPERT, renewalPeriodMonths: 12, renewalRequirementsText: 'Annual free online renewal assessment', description: 'Designing Zero Trust security strategies across identity, data, applications, and hybrid environments.', officialUrl: 'https://learn.microsoft.com/credentials/certifications/cybersecurity-architect-expert/', domainIds: ['domain:azure', 'domain:cybersecurity'], roleIds: ['role:security-architect'], scoreInputs: { marketValueScore: 96, demandScore: 92, rigorScore: 88, communityPerceptionScore: 92 }, sourceId: 'src:ms-learn' });

  // Microsoft Prerequisite & Progression Links
  const az900G = await prisma.prerequisiteGroup.create({ data: { id: 'g:az900', targetCertificationId: 'cert:ms-az-900', logicType: LogicType.AND } });
  await prisma.prerequisiteGroupMember.create({ data: { id: 'm:az900:ex', groupId: az900G.id, memberType: MemberType.EXAM, examId: 'exam:az-900', edgeType: EdgeType.REQUIRED } });

  const ms900G = await prisma.prerequisiteGroup.create({ data: { id: 'g:ms900', targetCertificationId: 'cert:ms-ms-900', logicType: LogicType.AND } });
  await prisma.prerequisiteGroupMember.create({ data: { id: 'm:ms900:ex', groupId: ms900G.id, memberType: MemberType.EXAM, examId: 'exam:ms-900', edgeType: EdgeType.REQUIRED } });

  const sc900G = await prisma.prerequisiteGroup.create({ data: { id: 'g:sc900', targetCertificationId: 'cert:ms-sc-900', logicType: LogicType.AND } });
  await prisma.prerequisiteGroupMember.create({ data: { id: 'm:sc900:ex', groupId: sc900G.id, memberType: MemberType.EXAM, examId: 'exam:sc-900', edgeType: EdgeType.REQUIRED } });

  const az104G = await prisma.prerequisiteGroup.create({ data: { id: 'g:az104', targetCertificationId: 'cert:ms-az-104', logicType: LogicType.AND } });
  await prisma.prerequisiteGroupMember.create({ data: { id: 'm:az104:ex', groupId: az104G.id, memberType: MemberType.EXAM, examId: 'exam:az-104', edgeType: EdgeType.REQUIRED } });
  await prisma.prerequisiteGroupMember.create({ data: { id: 'm:az104:az900-recom', groupId: az104G.id, memberType: MemberType.CERTIFICATION, certificationId: 'cert:ms-az-900', edgeType: EdgeType.RECOMMENDED, notes: 'Cloud fundamentals precursor' } });

  const md102G = await prisma.prerequisiteGroup.create({ data: { id: 'g:md102', targetCertificationId: 'cert:ms-md-102', logicType: LogicType.AND } });
  await prisma.prerequisiteGroupMember.create({ data: { id: 'm:md102:ex', groupId: md102G.id, memberType: MemberType.EXAM, examId: 'exam:md-102', edgeType: EdgeType.REQUIRED } });
  await prisma.prerequisiteGroupMember.create({ data: { id: 'm:md102:ms900', groupId: md102G.id, memberType: MemberType.CERTIFICATION, certificationId: 'cert:ms-ms-900', edgeType: EdgeType.RECOMMENDED, notes: 'M365 fundamentals precursor' } });

  const az500G = await prisma.prerequisiteGroup.create({ data: { id: 'g:az500', targetCertificationId: 'cert:ms-az-500', logicType: LogicType.AND } });
  await prisma.prerequisiteGroupMember.create({ data: { id: 'm:az500:ex', groupId: az500G.id, memberType: MemberType.EXAM, examId: 'exam:az-500', edgeType: EdgeType.REQUIRED } });
  await prisma.prerequisiteGroupMember.create({ data: { id: 'm:az500:sc900', groupId: az500G.id, memberType: MemberType.CERTIFICATION, certificationId: 'cert:ms-sc-900', edgeType: EdgeType.RECOMMENDED, notes: 'Security fundamentals precursor' } });
  await prisma.prerequisiteGroupMember.create({ data: { id: 'm:az500:az104', groupId: az500G.id, memberType: MemberType.CERTIFICATION, certificationId: 'cert:ms-az-104', edgeType: EdgeType.RECOMMENDED, notes: 'Azure infrastructure knowledge precursor' } });

  const sc200G = await prisma.prerequisiteGroup.create({ data: { id: 'g:sc200', targetCertificationId: 'cert:ms-sc-200', logicType: LogicType.AND } });
  await prisma.prerequisiteGroupMember.create({ data: { id: 'm:sc200:ex', groupId: sc200G.id, memberType: MemberType.EXAM, examId: 'exam:sc-200', edgeType: EdgeType.REQUIRED } });
  await prisma.prerequisiteGroupMember.create({ data: { id: 'm:sc200:sc900', groupId: sc200G.id, memberType: MemberType.CERTIFICATION, certificationId: 'cert:ms-sc-900', edgeType: EdgeType.RECOMMENDED, notes: 'Security fundamentals precursor' } });

  const winHybG = await prisma.prerequisiteGroup.create({ data: { id: 'g:winhyb:root', targetCertificationId: 'cert:ms-windows-hybrid', logicType: LogicType.AND, minRequired: 2 } });
  await prisma.prerequisiteGroupMember.create({ data: { id: 'm:winhyb:800', groupId: winHybG.id, memberType: MemberType.EXAM, examId: 'exam:az-800', edgeType: EdgeType.REQUIRED } });
  await prisma.prerequisiteGroupMember.create({ data: { id: 'm:winhyb:801', groupId: winHybG.id, memberType: MemberType.EXAM, examId: 'exam:az-801', edgeType: EdgeType.REQUIRED } });
  await prisma.prerequisiteGroupMember.create({ data: { id: 'm:winhyb:az104', groupId: winHybG.id, memberType: MemberType.CERTIFICATION, certificationId: 'cert:ms-az-104', edgeType: EdgeType.RECOMMENDED, notes: 'Azure administration precursor' } });

  const az305G = await prisma.prerequisiteGroup.create({ data: { id: 'g:az305:root', targetCertificationId: 'cert:ms-az-305', logicType: LogicType.AND, minRequired: 2 } });
  await prisma.prerequisiteGroupMember.create({ data: { id: 'm:az305:ex', groupId: az305G.id, memberType: MemberType.EXAM, examId: 'exam:az-305', edgeType: EdgeType.REQUIRED } });
  await prisma.prerequisiteGroupMember.create({ data: { id: 'm:az305:az104-prereq', groupId: az305G.id, memberType: MemberType.CERTIFICATION, certificationId: 'cert:ms-az-104', edgeType: EdgeType.REQUIRED, notes: 'Mandatory prerequisite certification' } });

  const sc100G = await prisma.prerequisiteGroup.create({ data: { id: 'g:sc100:root', targetCertificationId: 'cert:ms-sc-100', logicType: LogicType.AND } });
  await prisma.prerequisiteGroupMember.create({ data: { id: 'm:sc100:ex', groupId: sc100G.id, memberType: MemberType.EXAM, examId: 'exam:sc-100', edgeType: EdgeType.REQUIRED } });

  const sc100OrG = await prisma.prerequisiteGroup.create({ data: { id: 'g:sc100:assoc-options', targetCertificationId: 'cert:ms-sc-100', parentGroupId: sc100G.id, logicType: LogicType.OR, minRequired: 1, groupLabel: 'Hold 1 Prerequisite Associate Certification' } });
  await prisma.prerequisiteGroupMember.create({ data: { id: 'm:sc100:az500-opt', groupId: sc100OrG.id, memberType: MemberType.CERTIFICATION, certificationId: 'cert:ms-az-500', edgeType: EdgeType.ALTERNATIVE } });
  await prisma.prerequisiteGroupMember.create({ data: { id: 'm:sc100:sc200-opt', groupId: sc100OrG.id, memberType: MemberType.CERTIFICATION, certificationId: 'cert:ms-sc-200', edgeType: EdgeType.ALTERNATIVE } });

  // ==========================================
  // DOMAIN 5: CLOUD (AWS & GCP) (8 Certs)
  // ==========================================
  console.log('☁️ Seeding Domain 5: Cloud (AWS & Google Cloud)...');
  await createExamWithCitations({ id: 'exam:clf-c02', vendorId: 'vendor:aws', examCode: 'CLF-C02', name: 'AWS Certified Cloud Practitioner', format: ExamFormat.MULTIPLE_CHOICE, costAmountUsd: 100, durationMinutes: 90, officialUrl: 'https://aws.amazon.com/certification/certified-cloud-practitioner/', sourceId: 'src:aws-official' });
  await createExamWithCitations({ id: 'exam:gcp-cdl', vendorId: 'vendor:googlecloud', examCode: 'CDL', name: 'Google Cloud Digital Leader', format: ExamFormat.MULTIPLE_CHOICE, costAmountUsd: 99, durationMinutes: 90, officialUrl: 'https://cloud.google.com/learn/certification/cloud-digital-leader', sourceId: 'src:gcp-official' });
  await createExamWithCitations({ id: 'exam:saa-c03', vendorId: 'vendor:aws', examCode: 'SAA-C03', name: 'AWS Certified Solutions Architect - Associate', format: ExamFormat.MULTIPLE_CHOICE, costAmountUsd: 150, durationMinutes: 130, officialUrl: 'https://aws.amazon.com/certification/certified-solutions-architect-associate/', sourceId: 'src:aws-official' });
  await createExamWithCitations({ id: 'exam:soa-c02', vendorId: 'vendor:aws', examCode: 'SOA-C02', name: 'AWS Certified SysOps Administrator - Associate', format: ExamFormat.PERFORMANCE_BASED, costAmountUsd: 150, durationMinutes: 130, officialUrl: 'https://aws.amazon.com/certification/certified-sysops-admin-associate/', sourceId: 'src:aws-official' });
  await createExamWithCitations({ id: 'exam:gcp-ace', vendorId: 'vendor:googlecloud', examCode: 'ACE', name: 'Google Cloud Associate Cloud Engineer', format: ExamFormat.MULTIPLE_CHOICE, costAmountUsd: 125, durationMinutes: 120, officialUrl: 'https://cloud.google.com/learn/certification/cloud-engineer', sourceId: 'src:gcp-official' });
  await createExamWithCitations({ id: 'exam:sap-c02', vendorId: 'vendor:aws', examCode: 'SAP-C02', name: 'AWS Certified Solutions Architect - Professional', format: ExamFormat.MULTIPLE_CHOICE, costAmountUsd: 300, durationMinutes: 180, officialUrl: 'https://aws.amazon.com/certification/certified-solutions-architect-professional/', sourceId: 'src:aws-official' });
  await createExamWithCitations({ id: 'exam:scs-c02', vendorId: 'vendor:aws', examCode: 'SCS-C02', name: 'AWS Certified Security - Specialty', format: ExamFormat.MULTIPLE_CHOICE, costAmountUsd: 300, durationMinutes: 170, officialUrl: 'https://aws.amazon.com/certification/certified-security-specialty/', sourceId: 'src:aws-official' });
  await createExamWithCitations({ id: 'exam:gcp-pca', vendorId: 'vendor:googlecloud', examCode: 'PCA', name: 'Google Cloud Professional Cloud Architect', format: ExamFormat.MULTIPLE_CHOICE, costAmountUsd: 200, durationMinutes: 120, officialUrl: 'https://cloud.google.com/learn/certification/cloud-architect', sourceId: 'src:gcp-official' });

  await createCertWithCitations({ id: 'cert:aws-clf', vendorId: 'vendor:aws', name: 'AWS Certified Cloud Practitioner', acronym: 'AWS Cloud Practitioner', level: CertLevel.ENTRY, renewalPeriodMonths: 36, renewalRequirementsText: 'Retake exam or pass Associate', description: 'Foundational cloud fluency, AWS core services, security, pricing, and support models.', officialUrl: 'https://aws.amazon.com/certification/certified-cloud-practitioner/', domainIds: ['domain:cloud'], roleIds: ['role:cloud-architect'], scoreInputs: { marketValueScore: 65, demandScore: 88, rigorScore: 45, communityPerceptionScore: 78 }, sourceId: 'src:aws-official' });
  await createCertWithCitations({ id: 'cert:gcp-cdl', vendorId: 'vendor:googlecloud', name: 'Google Cloud Digital Leader', acronym: 'GCP Digital Leader', level: CertLevel.ENTRY, renewalPeriodMonths: 36, renewalRequirementsText: 'Retake exam or pass Associate', description: 'Foundational knowledge of Google Cloud core services and digital transformation.', officialUrl: 'https://cloud.google.com/learn/certification/cloud-digital-leader', domainIds: ['domain:cloud'], roleIds: ['role:cloud-architect'], scoreInputs: { marketValueScore: 60, demandScore: 75, rigorScore: 40, communityPerceptionScore: 72 }, sourceId: 'src:gcp-official' });
  await createCertWithCitations({ id: 'cert:aws-saa', vendorId: 'vendor:aws', name: 'AWS Certified Solutions Architect - Associate', acronym: 'AWS SAA', level: CertLevel.ASSOCIATE, renewalPeriodMonths: 36, renewalRequirementsText: 'Retake exam or pass Professional', description: 'Most widely held cloud associate credential validating resilient, high-performing cloud architectures.', officialUrl: 'https://aws.amazon.com/certification/certified-solutions-architect-associate/', domainIds: ['domain:cloud'], roleIds: ['role:cloud-architect'], scoreInputs: { marketValueScore: 88, demandScore: 98, rigorScore: 75, communityPerceptionScore: 92 }, sourceId: 'src:aws-official' });
  await createCertWithCitations({ id: 'cert:aws-soa', vendorId: 'vendor:aws', name: 'AWS Certified SysOps Administrator - Associate', acronym: 'AWS SysOps', level: CertLevel.ASSOCIATE, renewalPeriodMonths: 36, renewalRequirementsText: 'Retake exam or pass DevOps Pro', description: 'Deploying, managing, and operating scalable systems on AWS.', officialUrl: 'https://aws.amazon.com/certification/certified-sysops-admin-associate/', domainIds: ['domain:cloud'], roleIds: ['role:sysadmin', 'role:cloud-architect'], scoreInputs: { marketValueScore: 84, demandScore: 85, rigorScore: 80, communityPerceptionScore: 86 }, sourceId: 'src:aws-official' });
  await createCertWithCitations({ id: 'cert:gcp-ace', vendorId: 'vendor:googlecloud', name: 'Google Cloud Associate Cloud Engineer', acronym: 'GCP ACE', level: CertLevel.ASSOCIATE, renewalPeriodMonths: 36, renewalRequirementsText: 'Retake exam or pass Professional', description: 'Deploying applications, monitoring operations, and managing enterprise solutions on Google Cloud.', officialUrl: 'https://cloud.google.com/learn/certification/cloud-engineer', domainIds: ['domain:cloud'], roleIds: ['role:cloud-architect', 'role:sysadmin'], scoreInputs: { marketValueScore: 84, demandScore: 86, rigorScore: 78, communityPerceptionScore: 88 }, sourceId: 'src:gcp-official' });
  await createCertWithCitations({ id: 'cert:aws-sap', vendorId: 'vendor:aws', name: 'AWS Certified Solutions Architect - Professional', acronym: 'AWS SAP', level: CertLevel.PROFESSIONAL, renewalPeriodMonths: 36, renewalRequirementsText: 'Retake exam', description: 'Advanced multi-tier complex cloud architecture, hybrid networking, and disaster recovery.', officialUrl: 'https://aws.amazon.com/certification/certified-solutions-architect-professional/', domainIds: ['domain:cloud'], roleIds: ['role:cloud-architect'], scoreInputs: { marketValueScore: 98, demandScore: 96, rigorScore: 92, communityPerceptionScore: 96 }, sourceId: 'src:aws-official' });
  await createCertWithCitations({ id: 'cert:aws-scs', vendorId: 'vendor:aws', name: 'AWS Certified Security - Specialty', acronym: 'AWS Security Specialty', level: CertLevel.SPECIALTY, renewalPeriodMonths: 36, renewalRequirementsText: 'Retake exam', description: 'Securing multi-account AWS workloads, IAM, KMS encryption, and incident response.', officialUrl: 'https://aws.amazon.com/certification/certified-security-specialty/', domainIds: ['domain:cloud', 'domain:cybersecurity'], roleIds: ['role:security-architect', 'role:cloud-architect'], scoreInputs: { marketValueScore: 94, demandScore: 90, rigorScore: 86, communityPerceptionScore: 92 }, sourceId: 'src:aws-official' });
  await createCertWithCitations({ id: 'cert:gcp-pca', vendorId: 'vendor:googlecloud', name: 'Google Cloud Professional Cloud Architect', acronym: 'GCP PCA', level: CertLevel.PROFESSIONAL, renewalPeriodMonths: 24, renewalRequirementsText: '2-year renewal cycle', description: 'Designing robust, scalable, highly available Google Cloud architectures.', officialUrl: 'https://cloud.google.com/learn/certification/cloud-architect', domainIds: ['domain:cloud'], roleIds: ['role:cloud-architect'], scoreInputs: { marketValueScore: 98, demandScore: 92, rigorScore: 90, communityPerceptionScore: 95 }, sourceId: 'src:gcp-official' });

  // Cloud Prerequisite & Progression Links
  const awsClfG = await prisma.prerequisiteGroup.create({ data: { id: 'g:aws-clf', targetCertificationId: 'cert:aws-clf', logicType: LogicType.AND } });
  await prisma.prerequisiteGroupMember.create({ data: { id: 'm:aws-clf:ex', groupId: awsClfG.id, memberType: MemberType.EXAM, examId: 'exam:clf-c02', edgeType: EdgeType.REQUIRED } });

  const gcpCdlG = await prisma.prerequisiteGroup.create({ data: { id: 'g:gcp-cdl', targetCertificationId: 'cert:gcp-cdl', logicType: LogicType.AND } });
  await prisma.prerequisiteGroupMember.create({ data: { id: 'm:gcp-cdl:ex', groupId: gcpCdlG.id, memberType: MemberType.EXAM, examId: 'exam:gcp-cdl', edgeType: EdgeType.REQUIRED } });

  const awsSaaG = await prisma.prerequisiteGroup.create({ data: { id: 'g:aws-saa', targetCertificationId: 'cert:aws-saa', logicType: LogicType.AND } });
  await prisma.prerequisiteGroupMember.create({ data: { id: 'm:aws-saa:ex', groupId: awsSaaG.id, memberType: MemberType.EXAM, examId: 'exam:saa-c03', edgeType: EdgeType.REQUIRED } });
  await prisma.prerequisiteGroupMember.create({ data: { id: 'm:aws-saa:clf-recom', groupId: awsSaaG.id, memberType: MemberType.CERTIFICATION, certificationId: 'cert:aws-clf', edgeType: EdgeType.RECOMMENDED, notes: 'Foundational cloud precursor' } });

  const awsSoaG = await prisma.prerequisiteGroup.create({ data: { id: 'g:aws-soa', targetCertificationId: 'cert:aws-soa', logicType: LogicType.AND } });
  await prisma.prerequisiteGroupMember.create({ data: { id: 'm:aws-soa:ex', groupId: awsSoaG.id, memberType: MemberType.EXAM, examId: 'exam:soa-c02', edgeType: EdgeType.REQUIRED } });
  await prisma.prerequisiteGroupMember.create({ data: { id: 'm:aws-soa:clf-recom', groupId: awsSoaG.id, memberType: MemberType.CERTIFICATION, certificationId: 'cert:aws-clf', edgeType: EdgeType.RECOMMENDED, notes: 'Foundational cloud precursor' } });

  const gcpAceG = await prisma.prerequisiteGroup.create({ data: { id: 'g:gcp-ace', targetCertificationId: 'cert:gcp-ace', logicType: LogicType.AND } });
  await prisma.prerequisiteGroupMember.create({ data: { id: 'm:gcp-ace:ex', groupId: gcpAceG.id, memberType: MemberType.EXAM, examId: 'exam:gcp-ace', edgeType: EdgeType.REQUIRED } });
  await prisma.prerequisiteGroupMember.create({ data: { id: 'm:gcp-ace:cdl-recom', groupId: gcpAceG.id, memberType: MemberType.CERTIFICATION, certificationId: 'cert:gcp-cdl', edgeType: EdgeType.RECOMMENDED, notes: 'Digital leader precursor' } });
  await prisma.prerequisiteGroupMember.create({ data: { id: 'm:gcp-ace:awssaa-recom', groupId: gcpAceG.id, memberType: MemberType.CERTIFICATION, certificationId: 'cert:aws-saa', edgeType: EdgeType.RECOMMENDED, notes: 'Cross-cloud knowledge precursor' } });

  const awsSapG = await prisma.prerequisiteGroup.create({ data: { id: 'g:aws-sap', targetCertificationId: 'cert:aws-sap', logicType: LogicType.AND } });
  await prisma.prerequisiteGroupMember.create({ data: { id: 'm:aws-sap:ex', groupId: awsSapG.id, memberType: MemberType.EXAM, examId: 'exam:sap-c02', edgeType: EdgeType.REQUIRED } });
  await prisma.prerequisiteGroupMember.create({ data: { id: 'm:aws-sap:saa-recom', groupId: awsSapG.id, memberType: MemberType.CERTIFICATION, certificationId: 'cert:aws-saa', edgeType: EdgeType.RECOMMENDED, notes: 'Strongly recommended associate precursor' } });

  const awsScsG = await prisma.prerequisiteGroup.create({ data: { id: 'g:aws-scs', targetCertificationId: 'cert:aws-scs', logicType: LogicType.AND } });
  await prisma.prerequisiteGroupMember.create({ data: { id: 'm:aws-scs:ex', groupId: awsScsG.id, memberType: MemberType.EXAM, examId: 'exam:scs-c02', edgeType: EdgeType.REQUIRED } });
  await prisma.prerequisiteGroupMember.create({ data: { id: 'm:aws-scs:saa-recom', groupId: awsScsG.id, memberType: MemberType.CERTIFICATION, certificationId: 'cert:aws-saa', edgeType: EdgeType.RECOMMENDED, notes: 'Associate architecture precursor' } });
  await prisma.prerequisiteGroupMember.create({ data: { id: 'm:aws-scs:soa-recom', groupId: awsScsG.id, memberType: MemberType.CERTIFICATION, certificationId: 'cert:aws-soa', edgeType: EdgeType.RECOMMENDED, notes: 'Operations security precursor' } });

  const gcpPcaG = await prisma.prerequisiteGroup.create({ data: { id: 'g:gcp-pca', targetCertificationId: 'cert:gcp-pca', logicType: LogicType.AND } });
  await prisma.prerequisiteGroupMember.create({ data: { id: 'm:gcp-pca:ex', groupId: gcpPcaG.id, memberType: MemberType.EXAM, examId: 'exam:gcp-pca', edgeType: EdgeType.REQUIRED } });
  await prisma.prerequisiteGroupMember.create({ data: { id: 'm:gcp-pca:ace-recom', groupId: gcpPcaG.id, memberType: MemberType.CERTIFICATION, certificationId: 'cert:gcp-ace', edgeType: EdgeType.RECOMMENDED, notes: 'Recommended associate engineering precursor' } });

  // ==========================================
  // DOMAIN 6: AI & MACHINE LEARNING (5 Certs)
  // ==========================================
  console.log('🤖 Seeding Domain 6: AI & Machine Learning (Flagship Hyperscaler Suite)...');
  await createExamWithCitations({ id: 'exam:aif-c01', vendorId: 'vendor:aws', examCode: 'AIF-C01', name: 'AWS Certified AI Practitioner', format: ExamFormat.MULTIPLE_CHOICE, costAmountUsd: 100, durationMinutes: 90, officialUrl: 'https://aws.amazon.com/certification/certified-ai-practitioner/', sourceId: 'src:aws-official' });
  await createExamWithCitations({ id: 'exam:ai-900', vendorId: 'vendor:microsoft', examCode: 'AI-900', name: 'Microsoft Azure AI Fundamentals', format: ExamFormat.MULTIPLE_CHOICE, costAmountUsd: 99, costAmountCadOverride: 125, durationMinutes: 60, officialUrl: 'https://learn.microsoft.com/credentials/certifications/azure-ai-fundamentals/', sourceId: 'src:ms-learn' });
  await createExamWithCitations({ id: 'exam:ai-102', vendorId: 'vendor:microsoft', examCode: 'AI-102', name: 'Designing and Implementing a Microsoft Azure AI Solution', format: ExamFormat.PERFORMANCE_BASED, costAmountUsd: 165, costAmountCadOverride: 215, durationMinutes: 120, officialUrl: 'https://learn.microsoft.com/credentials/certifications/azure-ai-engineer/', sourceId: 'src:ms-learn' });
  await createExamWithCitations({ id: 'exam:dp-100', vendorId: 'vendor:microsoft', examCode: 'DP-100', name: 'Designing and Implementing a Data Science Solution on Azure', format: ExamFormat.PERFORMANCE_BASED, costAmountUsd: 165, costAmountCadOverride: 215, durationMinutes: 120, officialUrl: 'https://learn.microsoft.com/credentials/certifications/azure-data-scientist/', sourceId: 'src:ms-learn' });
  await createExamWithCitations({ id: 'exam:gcp-mle', vendorId: 'vendor:googlecloud', examCode: 'MLE', name: 'Google Cloud Professional Machine Learning Engineer', format: ExamFormat.MULTIPLE_CHOICE, costAmountUsd: 200, durationMinutes: 120, officialUrl: 'https://cloud.google.com/learn/certification/machine-learning-engineer', sourceId: 'src:gcp-official' });

  await createCertWithCitations({ id: 'cert:aws-ai-practitioner', vendorId: 'vendor:aws', name: 'AWS Certified AI Practitioner', acronym: 'AWS AI Practitioner', level: CertLevel.ENTRY, renewalPeriodMonths: 36, renewalRequirementsText: 'Retake exam', description: 'Foundational artificial intelligence, machine learning, and generative AI concepts on AWS.', officialUrl: 'https://aws.amazon.com/certification/certified-ai-practitioner/', domainIds: ['domain:ai-ml', 'domain:cloud'], roleIds: ['role:ml-engineer'], scoreInputs: { marketValueScore: 70, demandScore: 85, rigorScore: 50, communityPerceptionScore: 80 }, sourceId: 'src:aws-official' });
  await createCertWithCitations({ id: 'cert:ms-ai-900', vendorId: 'vendor:microsoft', name: 'Microsoft Certified: Azure AI Fundamentals', acronym: 'AI-900', level: CertLevel.ENTRY, renewalPeriodMonths: 0, renewalRequirementsText: 'Non-expiring', description: 'Fundamental artificial intelligence workloads and Azure AI service capabilities.', officialUrl: 'https://learn.microsoft.com/credentials/certifications/azure-ai-fundamentals/', domainIds: ['domain:ai-ml', 'domain:azure'], roleIds: ['role:ml-engineer'], scoreInputs: { marketValueScore: 65, demandScore: 82, rigorScore: 45, communityPerceptionScore: 78 }, sourceId: 'src:ms-learn' });
  await createCertWithCitations({ id: 'cert:ms-ai-102', vendorId: 'vendor:microsoft', name: 'Microsoft Certified: Azure AI Engineer Associate', acronym: 'Azure AI Engineer', level: CertLevel.ASSOCIATE, renewalPeriodMonths: 12, renewalRequirementsText: 'Annual free online renewal assessment', description: 'Building, managing, and deploying AI solutions leveraging Azure OpenAI, Cognitive Services, and Bot Service.', officialUrl: 'https://learn.microsoft.com/credentials/certifications/azure-ai-engineer/', domainIds: ['domain:ai-ml', 'domain:azure'], roleIds: ['role:ml-engineer'], scoreInputs: { marketValueScore: 90, demandScore: 92, rigorScore: 80, communityPerceptionScore: 88 }, sourceId: 'src:ms-learn' });
  await createCertWithCitations({ id: 'cert:ms-dp-100', vendorId: 'vendor:microsoft', name: 'Microsoft Certified: Azure Data Scientist Associate', acronym: 'Azure Data Scientist', level: CertLevel.ASSOCIATE, renewalPeriodMonths: 12, renewalRequirementsText: 'Annual free online renewal assessment', description: 'Applying data science and machine learning on Azure using Azure Machine Learning and MLflow.', officialUrl: 'https://learn.microsoft.com/credentials/certifications/azure-data-scientist/', domainIds: ['domain:ai-ml', 'domain:azure'], roleIds: ['role:ml-engineer'], scoreInputs: { marketValueScore: 92, demandScore: 88, rigorScore: 82, communityPerceptionScore: 88 }, sourceId: 'src:ms-learn' });
  await createCertWithCitations({ id: 'cert:gcp-mle', vendorId: 'vendor:googlecloud', name: 'Google Cloud Professional Machine Learning Engineer', acronym: 'GCP ML Engineer', level: CertLevel.PROFESSIONAL, renewalPeriodMonths: 24, renewalRequirementsText: '2-year renewal cycle', description: 'Architecting, building, and productionizing scalable machine learning models using Vertex AI.', officialUrl: 'https://cloud.google.com/learn/certification/machine-learning-engineer', domainIds: ['domain:ai-ml', 'domain:cloud'], roleIds: ['role:ml-engineer'], scoreInputs: { marketValueScore: 96, demandScore: 94, rigorScore: 90, communityPerceptionScore: 94 }, sourceId: 'src:gcp-official' });

  // AI/ML Prerequisite & Progression Links
  const awsAiG = await prisma.prerequisiteGroup.create({ data: { id: 'g:aws-ai', targetCertificationId: 'cert:aws-ai-practitioner', logicType: LogicType.AND } });
  await prisma.prerequisiteGroupMember.create({ data: { id: 'm:aws-ai:ex', groupId: awsAiG.id, memberType: MemberType.EXAM, examId: 'exam:aif-c01', edgeType: EdgeType.REQUIRED } });

  const ai900G = await prisma.prerequisiteGroup.create({ data: { id: 'g:ai900', targetCertificationId: 'cert:ms-ai-900', logicType: LogicType.AND } });
  await prisma.prerequisiteGroupMember.create({ data: { id: 'm:ai900:ex', groupId: ai900G.id, memberType: MemberType.EXAM, examId: 'exam:ai-900', edgeType: EdgeType.REQUIRED } });

  const ai102G = await prisma.prerequisiteGroup.create({ data: { id: 'g:ai102', targetCertificationId: 'cert:ms-ai-102', logicType: LogicType.AND } });
  await prisma.prerequisiteGroupMember.create({ data: { id: 'm:ai102:ex', groupId: ai102G.id, memberType: MemberType.EXAM, examId: 'exam:ai-102', edgeType: EdgeType.REQUIRED } });
  await prisma.prerequisiteGroupMember.create({ data: { id: 'm:ai102:ai900-recom', groupId: ai102G.id, memberType: MemberType.CERTIFICATION, certificationId: 'cert:ms-ai-900', edgeType: EdgeType.RECOMMENDED, notes: 'Foundational AI concepts precursor' } });

  const dp100G = await prisma.prerequisiteGroup.create({ data: { id: 'g:dp100', targetCertificationId: 'cert:ms-dp-100', logicType: LogicType.AND } });
  await prisma.prerequisiteGroupMember.create({ data: { id: 'm:dp100:ex', groupId: dp100G.id, memberType: MemberType.EXAM, examId: 'exam:dp-100', edgeType: EdgeType.REQUIRED } });
  await prisma.prerequisiteGroupMember.create({ data: { id: 'm:dp100:ai900-recom', groupId: dp100G.id, memberType: MemberType.CERTIFICATION, certificationId: 'cert:ms-ai-900', edgeType: EdgeType.RECOMMENDED, notes: 'Foundational AI concepts precursor' } });

  const gcpMleG = await prisma.prerequisiteGroup.create({ data: { id: 'g:gcp-mle', targetCertificationId: 'cert:gcp-mle', logicType: LogicType.AND } });
  await prisma.prerequisiteGroupMember.create({ data: { id: 'm:gcp-mle:ex', groupId: gcpMleG.id, memberType: MemberType.EXAM, examId: 'exam:gcp-mle', edgeType: EdgeType.REQUIRED } });
  await prisma.prerequisiteGroupMember.create({ data: { id: 'm:gcp-mle:dp100-recom', groupId: gcpMleG.id, memberType: MemberType.CERTIFICATION, certificationId: 'cert:ms-dp-100', edgeType: EdgeType.RECOMMENDED, notes: 'Data science & ML lifecycle precursor' } });
  await prisma.prerequisiteGroupMember.create({ data: { id: 'm:gcp-mle:ai102-recom', groupId: gcpMleG.id, memberType: MemberType.CERTIFICATION, certificationId: 'cert:ms-ai-102', edgeType: EdgeType.RECOMMENDED, notes: 'Applied AI engineer precursor' } });

  // Validate all registered citations
  console.log(`🔍 Validating ${citationsToValidate.length} citation mappings across all 54 certifications & exams...`);
  for (const c of citationsToValidate) {
    const res = validateCitations(c.entityType, c.entityId, citationsToValidate);
    if (!res.isValid) {
      throw new Error(`Citation Policy Violation during seed: ${res.errors.join(', ')}`);
    }
  }

  const [vendorCount, domainCount, examCount, certCount, citationCount] = await Promise.all([
    prisma.vendor.count(),
    prisma.domain.count(),
    prisma.exam.count(),
    prisma.certification.count(),
    prisma.fieldSource.count(),
  ]);

  console.log('✨ Seed completed successfully!');
  console.log(`📊 Total Stats: ${vendorCount} Vendors | ${domainCount} Domains | ${examCount} Exams | ${certCount} Flagship Certifications | ${citationCount} Citations`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
