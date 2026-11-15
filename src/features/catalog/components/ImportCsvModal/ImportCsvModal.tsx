import { Button } from '@/components/Button/Button';
import { FileUpload } from '@/components/FileUpload/FileUpload';
import { FormError } from '@/components/FormError/FormError';
import { Modal } from '@/components/Modal/Modal';

import { CARD_IMPORT_COLUMNS, csvFileSummary, failedImportSummary } from '../../catalog.format';
import type { CatalogNotice } from '../../catalog.types';
import { useCsvImport } from '../../hooks/useCsvImport';
import { ImportErrorList } from '../ImportErrorList/ImportErrorList';
import styles from './ImportCsvModal.module.css';

interface ImportCsvModalProps {
  onClose: () => void;
  onImported: (notice: CatalogNotice) => void;
}

type CsvImport = ReturnType<typeof useCsvImport>;

interface CsvStepProps {
  csv: CsvImport;
  onClose: () => void;
}

function importLabel({ rows, importing }: CsvImport) {
  if (importing.isPending) return 'Importando…';
  return rows ? `Importar ${rows} ${rows === 1 ? 'carta' : 'cartas'}` : 'Importar';
}

function SelectStepActions({ csv, onClose }: CsvStepProps) {
  const isImporting = csv.importing.isPending;

  return (
    <>
      <Button variant="secondary" disabled={isImporting} onClick={onClose}>
        Cancelar
      </Button>
      <Button disabled={!csv.file || isImporting} onClick={csv.submit}>
        {importLabel(csv)}
      </Button>
    </>
  );
}

function FailedStepActions({ csv, onClose }: CsvStepProps) {
  return (
    <>
      <Button variant="secondary" onClick={onClose}>
        Fechar
      </Button>
      <Button onClick={csv.restart}>Enviar outro arquivo</Button>
    </>
  );
}

function TemplateDownload({ csv }: { csv: CsvImport }) {
  return (
    <div className={styles.template}>
      <button
        type="button"
        className={styles.link}
        disabled={csv.template.isPending}
        onClick={() => csv.template.mutate()}
      >
        Baixar modelo CSV
      </button>
      <FormError message={csv.template.error?.message} />
    </div>
  );
}

/** Escolha do arquivo, como no frame 832-3295. */
function SelectStep({ csv }: { csv: CsvImport }) {
  return (
    <div className={styles.body}>
      <p className={styles.help}>
        Envie um arquivo CSV com as colunas {CARD_IMPORT_COLUMNS}. Todas as linhas são validadas
        antes de gravar: se uma linha tiver erro, nenhuma carta é importada.
      </p>
      <div className={styles.dropzone}>
        <FileUpload
          label="Arquivo CSV"
          accept=".csv,text/csv"
          hint={csv.file ? csvFileSummary(csv.file, csv.rows) : 'CSV até 4 MB'}
          onChange={csv.selectFile}
        />
      </div>
      <TemplateDownload csv={csv} />
    </div>
  );
}

/** Linhas com erro, como no frame 832-3837: nada foi gravado. */
function FailedStep({ csv, error }: { csv: CsvImport; error: Error }) {
  return (
    <div className={styles.body}>
      <p className={styles.help}>{failedImportSummary(csv.file?.name, error)}</p>
      <ImportErrorList error={error} />
    </div>
  );
}

export function ImportCsvModal({ onClose, onImported }: ImportCsvModalProps) {
  const csv = useCsvImport(onImported);
  const { error } = csv.importing;
  const Actions = error ? FailedStepActions : SelectStepActions;

  return (
    <Modal
      open
      title={error ? 'Nenhuma carta foi importada' : 'Importar cartas por CSV'}
      dismissible={!csv.importing.isPending}
      onClose={onClose}
      footer={<Actions csv={csv} onClose={onClose} />}
    >
      {error ? <FailedStep csv={csv} error={error} /> : <SelectStep csv={csv} />}
    </Modal>
  );
}
