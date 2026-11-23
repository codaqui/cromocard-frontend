import type { ReactNode } from 'react';

import { Icon } from '@/components/Icon/Icon';
import type { IconName } from '@/components/Icon/icon-paths';
import { cn } from '@/utils/cn';
import { formatDate } from '@/utils/formatDate';

import type { SellerAddress, SellerVerificationDetail } from '../../seller-verifications.types';
import styles from './SellerVerificationPanel.module.css';

interface FieldProps {
  label: string;
  value: string | null;
  mono?: boolean;
  wide?: boolean;
}

function Field({ label, value, mono = false, wide = false }: FieldProps) {
  return (
    <div className={cn(styles.field, wide && styles.fieldWide)}>
      <p className={styles.fieldLabel}>{label}</p>
      <p className={cn(styles.fieldValue, mono && styles.fieldMono)}>{value ?? '—'}</p>
    </div>
  );
}

interface SectionCardProps {
  title: string;
  icon: IconName;
  children: ReactNode;
}

function SectionCard({ title, icon, children }: SectionCardProps) {
  return (
    <section className={styles.sectionCard} aria-label={title}>
      <h3 className={styles.sectionTitle}>
        <span className={styles.sectionIcon}>
          <Icon name={icon} size={18} />
        </span>
        {title}
      </h3>
      {children}
    </section>
  );
}

function CompanySection({ detail }: { detail: SellerVerificationDetail }) {
  return (
    <SectionCard title="Informações da Empresa" icon="domain">
      <div className={styles.fields}>
        <Field label="Razão Social" value={detail.legalName} />
        <Field label="CNPJ" value={detail.cnpj} mono />
        <Field label="Nome Fantasia" value={detail.tradeName} />
        <Field label="Inscrição Estadual" value={detail.stateRegistration} mono />
        <Field
          label="Data de Fundação"
          value={detail.openingDate && formatDate(detail.openingDate)}
        />
        <Field label="Porte" value={detail.companySize} />
        <Field label="CNAE" value={detail.cnae} wide />
      </div>
    </SectionCard>
  );
}

function ResponsibleSection({ detail }: { detail: SellerVerificationDetail }) {
  return (
    <SectionCard title="Responsável Legal" icon="person">
      <div className={styles.fields}>
        <Field label="Nome" value={detail.responsibleName} wide />
        <Field label="CPF" value={detail.responsibleCpf} mono />
        <Field label="Telefone" value={detail.responsiblePhone} mono />
      </div>
    </SectionCard>
  );
}

function BankSection({ detail }: { detail: SellerVerificationDetail }) {
  return (
    <SectionCard title="Dados Bancários & Pix" icon="accountBalance">
      <div className={styles.fields}>
        <Field label="Chave Pix" value={detail.pixKey} mono wide />
      </div>
      <div className={styles.bankFields}>
        <Field label="Instituição" value={detail.bankName} />
        <Field label="Agência" value={detail.bankBranch} mono />
        <Field label="Conta" value={detail.bankAccount} mono />
      </div>
    </SectionCard>
  );
}

function formatAddress(address: SellerAddress): string {
  const streetLine = [
    `${address.street}, ${address.number}`,
    address.complement,
    address.neighborhood,
  ]
    .filter(Boolean)
    .join(' - ');
  return `${streetLine}, ${address.city} - ${address.state}, CEP ${address.zipCode}`;
}

function AddressSection({ address }: { address: SellerAddress | null }) {
  return (
    <SectionCard title="Endereço do Estabelecimento" icon="location">
      <p className={address ? styles.addressText : styles.emptyHint}>
        {address ? formatAddress(address) : 'Endereço não informado.'}
      </p>
    </SectionCard>
  );
}

export function RegistrationTab({ detail }: { detail: SellerVerificationDetail }) {
  return (
    <div className={styles.tabContent}>
      <CompanySection detail={detail} />
      <ResponsibleSection detail={detail} />
      <BankSection detail={detail} />
      <AddressSection address={detail.address} />
    </div>
  );
}
