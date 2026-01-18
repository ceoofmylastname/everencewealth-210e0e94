import { AdminLayout } from '@/components/AdminLayout';
import { WebhookPayloadPreview } from '@/components/dev/WebhookPayloadPreview';

export default function WebhookTesting() {
  return (
    <AdminLayout>
      <div className="p-6 max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">🔧 Webhook Payload Testing</h1>
          <p className="text-muted-foreground mt-1">
            Preview all possible webhook payloads for GHL field mapping. No actual submissions are made.
          </p>
        </div>
        <WebhookPayloadPreview />
      </div>
    </AdminLayout>
  );
}
