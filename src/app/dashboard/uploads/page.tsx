import { UploadsList } from '@/components/Dashboard/UploadsList';

export default function UploadsPage() {
  return (
    <>
      <h1 className="text-2xl font-bold text-black dark:text-white mb-4">Upload History</h1>
      <UploadsList />
    </>
  );
}
