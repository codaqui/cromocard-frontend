import { Button } from '@/components/Button/Button';
import { FileUpload } from '@/components/FileUpload/FileUpload';
import { FormError } from '@/components/FormError/FormError';
import { Modal } from '@/components/Modal/Modal';

import { useCsvImport } from '../../hooks/useCsvImport';
import { ImportErrorList } from '../ImportErrorList/ImportErrorList';
import styles from './ImportCsvModal.module.css';

interface ImportCsvModalProps {
  onClose: () => void;
  onImported: (message: string) => void;
}

type CsvImport = ReturnType<typeof useCsvImport>;

function ImportCsvActions({ csv, onClose }: { csv: CsvImport; onClose: () => void }) {
  const isImporting = csv.importing.isPending;

  return (
    <>
      <Button variant="secondary" disabled={isImporting} onClick={onClose}>
        Cancelar
      </Button>
      <Button disabled={!csv.file || isImporting} onClick={csv.submit}>
        {isImporting ? 'Importando…' : 'Importar'}
      </Button>
    </>
  );
}

function TemplateDownload({ csv }: { csv: CsvImport }) {
  return (
    <div className={styles.template}>
      <Button
        variant="secondary"
        disabled={csv.template.isPending}
        onClick={() => csv.template.mutate()}
      >
        Baixar modelo
      </Button>
      <FormError message={csv.template.error?.message} />
    </div>
  );
}

function ImportCsvFields({ csv }: { csv: CsvImport }) {
  return (
    <div className={styles.body}>
      <p className={styles.help}>
        Use o modelo: colunas separadas por ponto e vírgula, uma carta por linha. Se alguma linha
        tiver erro, nenhuma carta é importada.
      </p>
      <TemplateDownload csv={csv} />
      <FileUpload
        label="Arquivo CSV"
        accept=".csv,text/csv"
        hint="CSV até 4 MB"
        onChange={csv.selectFile}
      />
      <ImportErrorList error={csv.importing.error} />
    </div>
  );
}

export function ImportCsvModal({ onClose, onImported }: ImportCsvModalProps) {
  const csv = useCsvImport(onImported);

  return (
    <Modal
      open
      title="Importar cartas por CSV"
      dismissible={!csv.importing.isPending}
      onClose={onClose}
      footer={<ImportCsvActions csv={csv} onClose={onClose} />}
    >
      <ImportCsvFields csv={csv} />
    </Modal>
  );
}
