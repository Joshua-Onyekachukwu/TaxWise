import { StatementUploader } from '@/components/Dashboard/StatementUploader';

export default function CreateUploadPage() {
  return (
    <>
      <h1 className="text-2xl font-bold text-black dark:text-white mb-4">Upload New Statement</h1>
      <StatementUploader />
    </>
  );
}
