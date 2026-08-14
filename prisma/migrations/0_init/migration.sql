-- CreateEnum
CREATE TYPE "ExamFormat" AS ENUM ('MULTIPLE_CHOICE', 'PERFORMANCE_BASED', 'HANDS_ON_LAB', 'MIXED', 'ORAL_DEFENSE');

-- CreateEnum
CREATE TYPE "EntityStatus" AS ENUM ('ACTIVE', 'RETIRED', 'BEING_REPLACED');

-- CreateEnum
CREATE TYPE "CertLevel" AS ENUM ('ENTRY', 'ASSOCIATE', 'PROFESSIONAL', 'EXPERT', 'SPECIALTY');

-- CreateEnum
CREATE TYPE "LogicType" AS ENUM ('AND', 'OR');

-- CreateEnum
CREATE TYPE "MemberType" AS ENUM ('EXAM', 'CERTIFICATION', 'EXPERIENCE', 'DEGREE', 'OTHER_CREDENTIAL');

-- CreateEnum
CREATE TYPE "EdgeType" AS ENUM ('REQUIRED', 'RECOMMENDED', 'ALTERNATIVE');

-- CreateEnum
CREATE TYPE "SourceType" AS ENUM ('VENDOR_PAGE', 'SALARY_SURVEY', 'JOB_POSTINGS_INDEX', 'COMMUNITY_AGGREGATE', 'OTHER');

-- CreateEnum
CREATE TYPE "EntityType" AS ENUM ('CERTIFICATION', 'EXAM');

-- CreateTable
CREATE TABLE "vendors" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortName" TEXT NOT NULL,
    "websiteUrl" TEXT NOT NULL,
    "logoAssetRef" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "foundedYear" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vendors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "domains" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "isEmerging" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "domains_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exams" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "examCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "format" "ExamFormat" NOT NULL DEFAULT 'MULTIPLE_CHOICE',
    "costAmountUsd" DECIMAL(10,2) NOT NULL,
    "costAmountCadOverride" DECIMAL(10,2),
    "durationMinutes" INTEGER NOT NULL,
    "questionCountMin" INTEGER,
    "questionCountMax" INTEGER,
    "passingScoreInfo" TEXT,
    "status" "EntityStatus" NOT NULL DEFAULT 'ACTIVE',
    "costLastVerifiedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "statusLastVerifiedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "officialUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certifications" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "acronym" TEXT NOT NULL,
    "level" "CertLevel" NOT NULL,
    "vendorLevelLabel" TEXT,
    "status" "EntityStatus" NOT NULL DEFAULT 'ACTIVE',
    "statusNotes" TEXT,
    "renewalPeriodMonths" INTEGER NOT NULL DEFAULT 36,
    "renewalRequirementsText" TEXT,
    "description" TEXT NOT NULL,
    "officialUrl" TEXT NOT NULL,
    "computedScore" DECIMAL(5,2),
    "scoreBreakdown" JSONB,
    "statusLastVerifiedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "certifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certification_domains" (
    "certificationId" TEXT NOT NULL,
    "domainId" TEXT NOT NULL,

    CONSTRAINT "certification_domains_pkey" PRIMARY KEY ("certificationId","domainId")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certification_roles" (
    "certificationId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,

    CONSTRAINT "certification_roles_pkey" PRIMARY KEY ("certificationId","roleId")
);

-- CreateTable
CREATE TABLE "prerequisite_groups" (
    "id" TEXT NOT NULL,
    "targetCertificationId" TEXT NOT NULL,
    "parentGroupId" TEXT,
    "logicType" "LogicType" NOT NULL DEFAULT 'AND',
    "groupLabel" TEXT,
    "minRequired" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prerequisite_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prerequisite_group_members" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "memberType" "MemberType" NOT NULL,
    "examId" TEXT,
    "certificationId" TEXT,
    "experienceDescription" TEXT,
    "degreeDescription" TEXT,
    "edgeType" "EdgeType" NOT NULL DEFAULT 'REQUIRED',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prerequisite_group_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sources" (
    "id" TEXT NOT NULL,
    "type" "SourceType" NOT NULL DEFAULT 'VENDOR_PAGE',
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "publisher" TEXT NOT NULL,
    "accessedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "field_sources" (
    "id" TEXT NOT NULL,
    "entityType" "EntityType" NOT NULL,
    "entityId" TEXT NOT NULL,
    "fieldName" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "field_sources_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "field_sources_entityType_entityId_idx" ON "field_sources"("entityType", "entityId");

-- AddForeignKey
ALTER TABLE "exams" ADD CONSTRAINT "exams_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certifications" ADD CONSTRAINT "certifications_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certification_domains" ADD CONSTRAINT "certification_domains_certificationId_fkey" FOREIGN KEY ("certificationId") REFERENCES "certifications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certification_domains" ADD CONSTRAINT "certification_domains_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "domains"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certification_roles" ADD CONSTRAINT "certification_roles_certificationId_fkey" FOREIGN KEY ("certificationId") REFERENCES "certifications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certification_roles" ADD CONSTRAINT "certification_roles_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prerequisite_groups" ADD CONSTRAINT "prerequisite_groups_targetCertificationId_fkey" FOREIGN KEY ("targetCertificationId") REFERENCES "certifications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prerequisite_groups" ADD CONSTRAINT "prerequisite_groups_parentGroupId_fkey" FOREIGN KEY ("parentGroupId") REFERENCES "prerequisite_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prerequisite_group_members" ADD CONSTRAINT "prerequisite_group_members_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "prerequisite_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prerequisite_group_members" ADD CONSTRAINT "prerequisite_group_members_examId_fkey" FOREIGN KEY ("examId") REFERENCES "exams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prerequisite_group_members" ADD CONSTRAINT "prerequisite_group_members_certificationId_fkey" FOREIGN KEY ("certificationId") REFERENCES "certifications"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "field_sources" ADD CONSTRAINT "field_sources_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "sources"("id") ON DELETE CASCADE ON UPDATE CASCADE;

